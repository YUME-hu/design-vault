import { formatHex, oklch, rgb } from "culori";

/**
 * 颜色引擎：纯函数，不碰 DOM、不碰 fs。
 *
 * 色阶在 OKLCH 空间生成：固定感知亮度步长（ΔL = 0.08），色相不变，
 * 彩度沿"以锚点为中心"的帐篷曲线衰减，超 sRGB 色域时二分降彩度而不是裁通道，
 * 这样每一阶的 L 都能保住 —— 相邻阶的 ΔL 才真的均匀。
 *
 * 锚点规则：用户输入的那一阶必须精确等于输入值（按 RGB 比较），
 * 其余阶围绕它等距展开。
 */

export const SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
export type ScaleStep = (typeof SCALE_STEPS)[number];

const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

/** 名义亮度曲线：oklch L 从 0.97（50）到 0.25（900），步长恒定 */
const NOMINAL_LIGHTEST = 0.97;
const DELTA_L = 0.08;
const L_MIN = 0.08;
const L_MAX = 0.995;

export function isHexColor(value: string): boolean {
  return HEX_PATTERN.test(value.trim());
}

/** 归一化成 #RRGGBB（大写）；非法输入返回 null */
export function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (!HEX_PATTERN.test(trimmed)) return null;
  let hex = trimmed.slice(1);
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return `#${hex.toUpperCase()}`;
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = normalizeHex(hex);
  if (!normalized) throw new Error(`不是合法 HEX：${hex}`);
  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

function channelToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** WCAG 2.1 相对亮度 */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** WCAG 2.1 对比度：1 ~ 21 */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

export type OklchColor = { l: number; c: number; h: number };

export function hexToOklch(hex: string): OklchColor {
  const converted = oklch(hex);
  if (!converted) throw new Error(`无法转换为 OKLCH：${hex}`);
  return {
    l: converted.l,
    c: converted.c ?? 0,
    h: Number.isFinite(converted.h) ? (converted.h as number) : 0,
  };
}

function inSrgbGamut(l: number, c: number, h: number): boolean {
  const converted = rgb({ mode: "oklch", l, c, h });
  if (!converted) return false;
  const { r, g, b } = converted;
  const epsilon = 1e-4;
  return (
    Number.isFinite(r) &&
    Number.isFinite(g) &&
    Number.isFinite(b) &&
    r >= -epsilon &&
    r <= 1 + epsilon &&
    g >= -epsilon &&
    g <= 1 + epsilon &&
    b >= -epsilon &&
    b <= 1 + epsilon
  );
}

/** OKLCH → HEX：保 L 与 H，彩度超出 sRGB 时二分收敛到色域边界 */
export function oklchToHex(color: OklchColor): string {
  const l = Math.min(L_MAX, Math.max(L_MIN, color.l));
  const h = Number.isFinite(color.h) ? color.h : 0;
  let c = Math.max(0, color.c);

  if (!inSrgbGamut(l, c, h)) {
    let low = 0;
    let high = c;
    for (let index = 0; index < 24; index += 1) {
      const mid = (low + high) / 2;
      if (inSrgbGamut(l, mid, h)) low = mid;
      else high = mid;
    }
    c = low;
  }

  const converted = rgb({ mode: "oklch", l, c, h });
  const hex = converted ? formatHex(converted) : "#000000";
  return hex.toUpperCase();
}

export type ScaleEntry = {
  step: ScaleStep;
  hex: string;
  l: number;
  c: number;
  h: number;
  /** 是否是用户输入值所在的那一阶 */
  anchor: boolean;
};

export type ColorScale = {
  /** 用户输入的归一化值 */
  base: string;
  anchorStep: ScaleStep;
  entries: ScaleEntry[];
};

function nominalLightness(index: number): number {
  return NOMINAL_LIGHTEST - index * DELTA_L;
}

/**
 * 生成 50–900 色阶。
 * - 锚点阶 = base 本身（按输入值原样输出，不过色彩空间）
 * - 其余阶：L 以 ΔL 等距展开，彩度按距锚点的距离衰减
 */
export function generateScale(input: string): ColorScale {
  const base = normalizeHex(input);
  if (!base) throw new Error(`不是合法 HEX：${input}`);

  const { l: baseL, c: baseC, h: baseH } = hexToOklch(base);

  // 找离输入亮度最近的名义档位作为锚点
  let anchorIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  SCALE_STEPS.forEach((_, index) => {
    const distance = Math.abs(nominalLightness(index) - baseL);
    if (distance < bestDistance) {
      bestDistance = distance;
      anchorIndex = index;
    }
  });

  const entries: ScaleEntry[] = SCALE_STEPS.map((step, index) => {
    const distance = Math.abs(index - anchorIndex);

    if (index === anchorIndex) {
      return {
        step,
        hex: base,
        // culori 会在纯白上给出 1.0000000000000002，这里夹一下
        l: Math.min(1, Math.max(0, baseL)),
        c: baseC,
        h: baseH,
        anchor: true,
      };
    }

    const l = Math.min(L_MAX, Math.max(L_MIN, baseL + (anchorIndex - index) * DELTA_L));
    // 离锚点越远越淡，最低保留 12% 彩度，避免色阶尾部发灰
    const chromaFactor = Math.max(0.12, 1 - distance * 0.12);
    const hex = oklchToHex({ l, c: baseC * chromaFactor, h: baseH });
    const achieved = hexToOklch(hex);

    return {
      step,
      hex,
      l: Math.min(1, Math.max(0, achieved.l)),
      c: achieved.c,
      h: achieved.h,
      anchor: false,
    };
  });

  return { base, anchorStep: SCALE_STEPS[anchorIndex], entries };
}

/** 相邻阶的 ΔL（用于校验感知均匀） */
export function lightnessDeltas(entries: ScaleEntry[]): number[] {
  const deltas: number[] = [];
  for (let index = 1; index < entries.length; index += 1) {
    deltas.push(entries[index - 1].l - entries[index].l);
  }
  return deltas;
}

export type ContrastKind = "body" | "large";

export type ContrastCheck = {
  id: "text-bg" | "text-surface" | "primary-bg" | "primary-text";
  label: string;
  foreground: string;
  background: string;
  ratio: number;
  threshold: number;
  kind: ContrastKind;
  pass: boolean;
};

const CONTRAST_RULES: {
  id: ContrastCheck["id"];
  label: string;
  fg: string;
  bg: string;
  threshold: number;
  kind: ContrastKind;
}[] = [
  { id: "text-bg", label: "正文 text / bg", fg: "text", bg: "bg", threshold: 4.5, kind: "body" },
  {
    id: "text-surface",
    label: "正文 text / surface",
    fg: "text",
    bg: "surface",
    threshold: 4.5,
    kind: "body",
  },
  {
    id: "primary-bg",
    label: "主色 primary / bg",
    fg: "primary",
    bg: "bg",
    threshold: 3,
    kind: "large",
  },
  {
    id: "primary-text",
    label: "主色 primary / text",
    fg: "primary",
    bg: "text",
    threshold: 3,
    kind: "large",
  },
];

export function contrastChecks(palette: Record<string, string>): ContrastCheck[] {
  const checks: ContrastCheck[] = [];

  for (const rule of CONTRAST_RULES) {
    const foreground = palette[rule.fg];
    const background = palette[rule.bg];
    if (!foreground || !background) continue;
    if (!isHexColor(foreground) || !isHexColor(background)) continue;

    const ratio = contrastRatio(foreground, background);
    checks.push({
      id: rule.id,
      label: rule.label,
      foreground,
      background,
      ratio,
      threshold: rule.threshold,
      kind: rule.kind,
      pass: ratio >= rule.threshold,
    });
  }

  return checks;
}

/** 给一组 palette 生成全部色阶 */
export function buildScales(palette: Record<string, string>): Record<string, ColorScale> {
  const scales: Record<string, ColorScale> = {};
  for (const [key, value] of Object.entries(palette)) {
    if (!isHexColor(value)) continue;
    scales[key] = generateScale(value);
  }
  return scales;
}
