import { oklchToHex, type OklchColor } from "./color";
import type { ColorDirection } from "./schema";

/**
 * 色彩方向 → 具体色板。
 *
 * 这是原计划里的分工：AI 只给温度/饱和/对比，色值由确定性算法产出。
 * 这里用 OKLCH 固定亮度锚点 + 温度对应色相 + 饱和度对应彩度，
 * 同一份 color_direction 永远得到同一份 palette（可复现、可审计）。
 */

const HUE_BY_TEMPERATURE: Record<ColorDirection["temperature"], number> = {
  warm: 55,
  cool: 250,
  neutral: 260,
};

const CHROMA_BY_SATURATION: Record<ColorDirection["saturation"], number> = {
  muted: 0.06,
  balanced: 0.12,
  vivid: 0.18,
};

type ContrastProfile = {
  bgL: number;
  textL: number;
  mutedL: number;
  borderL: number;
};

const CONTRAST_BY_LEVEL: Record<ColorDirection["contrast"], ContrastProfile> = {
  low: { bgL: 0.93, textL: 0.36, mutedL: 0.5, borderL: 0.78 },
  medium: { bgL: 0.97, textL: 0.27, mutedL: 0.45, borderL: 0.7 },
  high: { bgL: 0.99, textL: 0.18, mutedL: 0.4, borderL: 0.55 },
};

function color(l: number, c: number, h: number): string {
  const value: OklchColor = { l, c, h };
  return oklchToHex(value);
}

export function paletteFromDirection(direction: ColorDirection): Record<string, string> {
  const hue = HUE_BY_TEMPERATURE[direction.temperature];
  const primaryChroma = CHROMA_BY_SATURATION[direction.saturation];
  const profile = CONTRAST_BY_LEVEL[direction.contrast];

  const primary = color(0.56, primaryChroma, hue);
  const palette: Record<string, string> = {
    primary,
    bg: color(profile.bgL, 0.006, hue),
    surface: color(Math.min(0.995, profile.bgL + 0.03), 0.004, hue),
    text: color(profile.textL, 0.012, hue),
    muted: color(profile.mutedL, 0.02, hue),
  };

  if (direction.contrast === "high") {
    palette.danger = color(0.55, 0.19, 25);
    palette.success = color(0.55, 0.12, 150);
  }

  return palette;
}

/** 本次映射的可读说明，写进 Style.notes，提醒人工复核 */
export function paletteDirectionNote(direction: ColorDirection): string {
  return `palette 由色彩方向映射生成（${direction.temperature}/${direction.saturation}/${direction.contrast}），色值为算法产出，建议在调色器里复核对比度。`;
}
