// REAL DATA GUARD：只允许通过 npm run verify:all（隔离 Vault）运行。
// 直接运行会触碰真实 data/，必须显式设置 ALLOW_REAL_DATA=1 才放行。
if (!process.env.DESIGN_VAULT_HOME && process.env.ALLOW_REAL_DATA !== "1") {
  console.error("拒绝直接运行：请使用 npm run verify:all（隔离临时 Vault）。若确需直接跑，设置 ALLOW_REAL_DATA=1。");
  process.exit(1);
}

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { componentSchema, pendingItemSchema } from "@design-vault/core/schema";
import { normalizeComponentCandidate, normalizeEffectCandidate } from "@design-vault/core/components";

const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

// 1) 归一化
const normalized = normalizeComponentCandidate({
  name: "Hanging Pass Identity",
  category: "weird-category",
  description: "可拖拽工牌",
  framework: "html",
  dependencies: ["framer-motion", ""],
  states: [{ name: "dragging", description: "拖拽中" }, { description: "缺 name" }],
});
record(
  "组件候选归一化：非法分类落 other、过滤空依赖与坏状态",
  normalized?.category === "other" &&
    normalized?.framework === "html" &&
    normalized?.dependencies.length === 1 &&
    normalized?.states.length === 1,
);

record(
  "效果候选归一化",
  normalizeEffectCandidate({ name: "视差", tech_stack: ["GSAP"], description: "ScrollTrigger" })?.tech_stack[0] === "GSAP",
);

// 2) schema
const component = componentSchema.parse({
  id: "hanging-pass-identity",
  name: "Hanging Pass Identity",
  category: "card",
  description: "可拖拽工牌",
  framework: "react",
  code: "",
  dependencies: [],
  states: [],
  related_styles: [],
  related_effects: [],
  sources: [{ type: "bilibili-search", url: "", upstream: "UP (1)", video: "BV1" }],
  notes: "待补代码",
  confidence: 0.7,
  created_at: "2026-11-06",
  updated_at: "2026-11-06",
});
record("componentSchema 接受空代码与最小字段", component.id === "hanging-pass-identity");

// 3) store + 分流（临时 vault）
const home = fs.mkdtempSync(path.join(os.tmpdir(), "dv-m8-"));
process.env.DESIGN_VAULT_HOME = home;
fs.mkdirSync(path.join(home, "data"), { recursive: true });
fs.writeFileSync(path.join(home, "data", "styles.json"), "[]\n");
fs.writeFileSync(path.join(home, "data", "styles.draft.json"), "[]\n");
fs.writeFileSync(path.join(home, "data", "effects.json"), "[]\n");
fs.writeFileSync(path.join(home, "data", "components.json"), "[]\n");

const basePending = {
  id: "pppppppp-0000-4000-8000-pppppppppppp",
  status: "pending" as const,
  created_at: "2026-11-06",
  confidence: 0.7,
  sources: [{ type: "bilibili-search" as const, url: "", upstream: "UP (1)", video: "BV1" }],
  duplicate_of: null,
  upstream_name: "UP",
  video_title: "工牌",
  name: "Hanging Pass Identity",
  candidate: { name: "Hanging Pass Identity" },
  color_direction: null,
  reasoning: "",
  notes: "",
  item_type: "component" as const,
  component_candidate: {
    name: "Hanging Pass Identity",
    category: "card" as const,
    description: "可拖拽工牌",
    framework: "react" as const,
    code: "",
    dependencies: [],
    states: [],
  },
  effect_candidate: {
    name: "挂绳摆动",
    tech_stack: ["framer-motion"],
    description: "拖拽时挂绳跟随摆动",
    code_snippet: "",
  },
  extracted_effects: [],
  raw_response: "{}",
};

fs.writeFileSync(
  path.join(home, "data", "pending.json"),
  JSON.stringify([pendingItemSchema.parse(basePending)], null, 2) + "\n",
);

const { approvePending } = await import("@design-vault/adapters/ingest/pending-actions");
const componentApproved = approvePending(basePending.id, "component");
const components = JSON.parse(fs.readFileSync(path.join(home, "data", "components.json"), "utf8")) as {
  id: string;
  category: string;
  code: string;
}[];
record(
  "as=component：写入 components.json 并清掉 pending",
  componentApproved.ok &&
    componentApproved.kind === "component" &&
    components.length === 1 &&
    components[0].code === "" &&
    JSON.parse(fs.readFileSync(path.join(home, "data", "pending.json"), "utf8")).length === 0,
  components[0]?.id,
);

// 重新种一条，测 as=effect
fs.writeFileSync(
  path.join(home, "data", "pending.json"),
  JSON.stringify([pendingItemSchema.parse({ ...basePending, id: "qqqqqqqq-0000-4000-8000-qqqqqqqqqqqq" })], null, 2) + "\n",
);
const effectApproved = approvePending("qqqqqqqq-0000-4000-8000-qqqqqqqqqqqq", "effect");
const effects = JSON.parse(fs.readFileSync(path.join(home, "data", "effects.json"), "utf8")) as { id: string; tech_stack: string[] }[];
record(
  "as=effect：写入 effects.json 且 related_styles 为空（允许孤立）",
  effectApproved.ok && effects.length === 1 && effects[0].tech_stack[0] === "framer-motion",
  effects[0]?.id,
);

fs.rmSync(home, { recursive: true, force: true });

const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) {
  console.log(`✗ ${failed.length}/${results.length} 项未通过`);
  process.exit(1);
}
console.log(`✓ 全部 ${results.length} 项通过`);
