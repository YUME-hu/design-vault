/**
 * Compose the "生成提示词" text: current configuration plus the guidance the
 * generated UI has to obey.
 *
 * Pure string building — no React, no DOM — so the same text can be copied from
 * the panel, embedded elsewhere, or diffed in a test later.
 *
 * @module design-vault-plugin/client/prompt
 */

import type { DesignConfigExport } from "./preview.ts";
import type { GuidanceRule } from "../shared/guidance.ts";

/** Pad to two digits so rule lists line up. */
function ordinal(index: number): string {
  return String(index + 1).padStart(2, "0");
}

function renderRules(rules: GuidanceRule[]): string {
  return rules.map((rule, index) => `${ordinal(index)} ${rule.text}`).join("\n");
}

/**
 * Build the prompt for one configuration.
 *
 * @param config - the current export, already resolved.
 */
export function composePrompt(config: DesignConfigExport): string {
  const guidance = config.guidance;

  const motion = guidance.motion
    .map(
      (recipe, index) =>
        `${ordinal(index)} ${recipe.name}（${recipe.id}）— ${recipe.duration} · ${recipe.easing} · ${recipe.spec}`,
    )
    .join("\n");

  const hardSpecs =
    guidance.hardSpecs.length > 0
      ? renderRules(guidance.hardSpecs)
      : "（尚未导入：等待 motion-web 的 74 条硬规范）";

  const sourceLabel = guidance.source === "placeholder" ? "内置草案（待替换）" : guidance.source;

  return `# Design Vault · 生成约束

> 版本 ${guidance.version} · 来源：${sourceLabel}
> 遵循以下约束生成界面；与「当前配置」冲突时，以配置为准。

## 1. 当前配置
- 风格：${config.vibeName}（${config.vibe}）
- 配色来源：${config.paletteId} · 色相种子：${config.seed || "（无）"}
- 密度：${config.density} ／ 字体：${config.typography} ／ 聚合：${config.layout}
- 圆角：${config.radius} ／ 阴影：${config.shadow} ／ 边框：${config.border} ／ 动效：${config.motion}

## 2. 色板（直接使用这些 HEX，不要另造颜色）
- background ${config.palette.background}
- card       ${config.palette.card}
- content    ${config.palette.content}
- title      ${config.palette.title}

## 3. 动效规范（${guidance.motion.length} 条）
${motion}

## 4. 去 AI 味规则（${guidance.antiSlop.length} 条）
${renderRules(guidance.antiSlop)}

## 5. 硬规范（${guidance.hardSpecs.length > 0 ? `${guidance.hardSpecs.length} 条` : "待导入"}）
${hardSpecs}
`;
}
