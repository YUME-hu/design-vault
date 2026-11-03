import { buildScales } from "./color";
import type { Style } from "./schema";

/**
 * 导出层：把一条风格（或一组 palette）翻译成可以直接粘进项目的确定性产物。
 * 纯函数、无 IO。M1b 起 CSS / Tailwind 导出都带 50–900 完整色阶。
 */

const SEMANTIC_ORDER = ["primary", "bg", "surface", "text", "muted", "info", "warning", "danger", "success"];

/** 语义色按固定顺序输出，未知的额外色槽排在后面，保证导出稳定可比对。 */
export function orderedPaletteEntries(palette: Record<string, string>): [string, string][] {
  const known = SEMANTIC_ORDER.filter((key) => key in palette).map(
    (key) => [key, palette[key]] as [string, string],
  );
  const extra = Object.keys(palette)
    .filter((key) => !SEMANTIC_ORDER.includes(key))
    .sort()
    .map((key) => [key, palette[key]] as [string, string]);
  return [...known, ...extra];
}

function parseBorder(border: string): { width: string; color: string } {
  const width = border.match(/\d*\.?\d+px/)?.[0] ?? "1px";
  const color = border.match(/#[0-9a-fA-F]{3,6}/)?.[0] ?? "#191919";
  return { width, color };
}

/** 中文兜底：任何字体栈都要能落地显示汉字，否则导出的东西在国内项目里会掉字。 */
const CJK_FALLBACK = "Noto Sans SC";

function fontStack(family: string, fallback: string[]): string[] {
  const families = family
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (!families.includes(CJK_FALLBACK)) families.push(CJK_FALLBACK);
  for (const item of fallback) {
    if (!families.includes(item)) families.push(item);
  }
  return families;
}

/** CSS 自定义属性里的字体名：带空格的必须加引号，否则整条声明失效 */
function cssFontStack(families: string[]): string {
  return families
    .map((family) => (/\s/.test(family) && !family.startsWith('"') ? `"${family}"` : family))
    .join(", ");
}

function jsFontArray(families: string[]): string {
  return `[${families.map((family) => JSON.stringify(family)).join(", ")}]`;
}

/** 单个 palette 的全部色阶，按语义顺序 */
function scaleBlocks(palette: Record<string, string>) {
  const scales = buildScales(palette);
  return orderedPaletteEntries(palette)
    .map(([key]) => ({ key, scale: scales[key] }))
    .filter((item) => Boolean(item.scale));
}

// ---------- palette 级导出（调色器用）----------

export function toPaletteCss(name: string, palette: Record<string, string>): string {
  const lines: string[] = [];
  lines.push(`/* ${name} — palette export（含 50–900 色阶） */`);
  lines.push(":root {");

  for (const { key, scale } of scaleBlocks(palette)) {
    lines.push(`  --color-${key}: ${scale.entries.find((entry) => entry.anchor)?.hex ?? palette[key]};`);
    for (const entry of scale.entries) {
      lines.push(`  --color-${key}-${entry.step}: ${entry.hex};`);
    }
    lines.push("");
  }

  if (lines[lines.length - 1] === "") lines.pop();
  lines.push("}");
  return lines.join("\n");
}

export function toPaletteTailwind(name: string, palette: Record<string, string>): string {
  const blocks = scaleBlocks(palette);

  const colorBlocks = blocks
    .map(({ key, scale }) => {
      const steps = scale.entries
        .map((entry) => `          "${entry.step}": "${entry.hex}",`)
        .join("\n");
      return `        ${JSON.stringify(key)}: {\n          DEFAULT: "${scale.base}",\n${steps}\n        },`;
    })
    .join("\n");

  return `/**
 * ${name} — palette export（含 50–900 色阶）
 * 用法：把下面 theme.extend 合并进 tailwind.config.js
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${colorBlocks}
      },
    },
  },
};
`;
}

export function toPaletteJson(palette: Record<string, string>): string {
  const ordered = Object.fromEntries(orderedPaletteEntries(palette));
  return `${JSON.stringify(ordered, null, 2)}\n`;
}

// ---------- 完整 Style 导出（详情页 / 结果页用）----------

export function toCssVariables(style: Style): string {
  const { palette, tokens, typography, identity_colors } = style;
  const border = parseBorder(tokens.border);
  const colors = orderedPaletteEntries(palette);

  const lines: string[] = [];
  lines.push(`/* ${style.name} — ${style.id}`);
  lines.push(` * design-vault export · ${style.updated_at}`);
  lines.push(` * 语义色 ${colors.length} 个 · 身份色 ${identity_colors.length} 个 · 每色 10 阶 */`);
  lines.push(":root {");

  for (const [key, value] of colors) {
    lines.push(`  --color-${key.replace(/_/g, "-")}: ${value};`);
  }

  if (identity_colors.length > 0) {
    lines.push("");
    identity_colors.forEach((color, index) => {
      lines.push(`  --color-identity-${index + 1}: ${color};`);
    });
  }

  lines.push("");
  lines.push(
    `  --font-heading: ${cssFontStack(fontStack(typography.heading, ["ui-monospace", "monospace"]))};`,
  );
  lines.push(
    `  --font-body: ${cssFontStack(fontStack(typography.body, ["system-ui", "sans-serif"]))};`,
  );

  lines.push("");
  lines.push(`  --radius: ${tokens.radius};`);
  lines.push(`  --border-width: ${border.width};`);
  lines.push(`  --border-color: ${border.color};`);
  lines.push(`  --shadow: ${tokens.shadow};`);

  lines.push("");
  lines.push("  /* 50–900 色阶 */");
  for (const { key, scale } of scaleBlocks(palette)) {
    for (const entry of scale.entries) {
      lines.push(`  --color-${key}-${entry.step}: ${entry.hex};`);
    }
  }

  lines.push("}");
  return lines.join("\n");
}

export function toTailwindTheme(style: Style): string {
  const { palette, tokens, typography } = style;
  const border = parseBorder(tokens.border);
  const radius = tokens.radius.trim() || "0";

  const colorBlocks = scaleBlocks(palette)
    .map(({ key, scale }) => {
      const steps = scale.entries
        .map((entry) => `          "${entry.step}": "${entry.hex}",`)
        .join("\n");
      return `        ${JSON.stringify(key)}: {\n          DEFAULT: "${scale.base}",\n${steps}\n        },`;
    })
    .join("\n");

  return `/**
 * ${style.name} — ${style.id}
 * design-vault export · ${style.updated_at}（含 50–900 色阶）
 * 用法：把下面 theme.extend 合并进你的 tailwind.config.js
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${colorBlocks}
      },
      fontFamily: {
        heading: ${jsFontArray(fontStack(typography.heading, ["ui-monospace", "monospace"]))},
        body: ${jsFontArray(fontStack(typography.body, ["system-ui", "sans-serif"]))},
      },
      borderRadius: {
        DEFAULT: "${radius}",
        sm: "${radius}",
        md: "${radius}",
        lg: "${radius}",
        xl: "${radius}",
      },
      borderWidth: {
        DEFAULT: "${border.width}",
      },
    },
  },
};
`;
}

/** 「复制前端提示词」的产物必须是 frontend_prompt 原文，不加任何前后缀。 */
export function toPrompt(style: Style): string {
  return style.frontend_prompt;
}

/** 详情页展示用：把长提示词切成可读的分段，不影响复制内容。 */
export function promptParagraphs(style: Style): string[] {
  return style.frontend_prompt.split(/\n{2,}/).filter((block) => block.trim().length > 0);
}
