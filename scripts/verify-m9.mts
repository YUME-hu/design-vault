// REAL DATA GUARD：只允许通过 npm run verify:all（隔离 Vault）运行。
// 直接运行会触碰真实 data/，必须显式设置 ALLOW_REAL_DATA=1 才放行。
if (!process.env.DESIGN_VAULT_HOME && process.env.ALLOW_REAL_DATA !== "1") {
  console.error("拒绝直接运行：请使用 npm run verify:all（隔离临时 Vault）。若确需直接跑，设置 ALLOW_REAL_DATA=1。");
  process.exit(1);
}

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { styleSchema, pendingItemSchema } from "@design-vault/core/schema";

const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

const baseStyleRaw = JSON.parse(fs.readFileSync("data/styles.json", "utf8"))[0];
const home = fs.mkdtempSync(path.join(os.tmpdir(), "dv-m9-"));
process.env.DESIGN_VAULT_HOME = home;
fs.mkdirSync(path.join(home, "data"), { recursive: true });

const style = styleSchema.parse({
  ...baseStyleRaw,
  id: "glassmorphism",
  name: "Glassmorphism",
  sources: [{ type: "manual", url: "https://example.com/glass", upstream: "manual", video: "" }],
  notes: "原始备注",
});

fs.writeFileSync(path.join(home, "data", "styles.json"), JSON.stringify([style], null, 2) + "\n");
fs.writeFileSync(path.join(home, "data", "styles.draft.json"), "[]\n");
fs.writeFileSync(path.join(home, "data", "effects.json"), "[]\n");
fs.writeFileSync(path.join(home, "data", "components.json"), "[]\n");

const pendingBase = {
  status: "pending" as const,
  created_at: "2026-11-06",
  confidence: 0.5,
  sources: [{ type: "bilibili-search" as const, url: "https://github.com/x/y", upstream: "UP (1)", video: "BV1" }],
  duplicate_of: null,
  upstream_name: "UP",
  video_title: "Claymorphism",
  name: "Claymorphism",
  candidate: { name: "Claymorphism" },
  color_direction: null,
  reasoning: "",
  notes: "发现相似风格：Glassmorphism（可合并）",
  item_type: "style" as const,
  component_candidate: null,
  effect_candidate: null,
  extracted_effects: [],
  raw_response: "{}",
};

const item = pendingItemSchema.parse({ ...pendingBase, id: "anchor-merge-1" });
fs.writeFileSync(path.join(home, "data", "pending.json"), JSON.stringify([item], null, 2) + "\n");

const { mergePending, resolveMergeTarget } = await import("@design-vault/adapters/ingest/pending-actions");
const targets = resolveMergeTarget(item);
record(
  "notes 相似提示可解析出合并目标",
  targets?.id === "glassmorphism" && targets?.name === "Glassmorphism",
  targets ? `${targets.id} · ${targets.kind}` : "null",
);

const result = mergePending(item.id);
const stylesAfter = JSON.parse(fs.readFileSync(path.join(home, "data", "styles.json"), "utf8")) as {
  id: string;
  sources: { video: string }[];
  notes: string;
  confidence: number;
}[];
const target = stylesAfter.find((entry) => entry.id === "glassmorphism");
record(
  "合并：追加 sources、追加 notes、删除 pending",
  result.ok &&
    target?.sources.some((source) => source.video === "BV1") &&
    target?.notes.includes("原始备注") &&
    target?.notes.includes("合并自 pending：Claymorphism") &&
    JSON.parse(fs.readFileSync(path.join(home, "data", "pending.json"), "utf8")).length === 0,
  target?.notes?.slice(0, 50),
);
record("合并不覆盖目标 confidence", target?.confidence === style.confidence);

// 重复 source 去重
fs.writeFileSync(
  path.join(home, "data", "pending.json"),
  JSON.stringify([pendingItemSchema.parse({ ...item, id: "anchor-merge-2", notes: "发现相似风格：Glassmorphism（可合并）" })], null, 2) + "\n",
);
const dupResult = mergePending("anchor-merge-2");
record("合并相同来源不会重复追加", dupResult.ok && dupResult.addedSources === 0, String(dupResult.ok ? dupResult.addedSources : "fail"));

// 目标是 pending：duplicate_of 指向不存在的 id → 422
fs.writeFileSync(
  path.join(home, "data", "pending.json"),
  JSON.stringify(
    [pendingItemSchema.parse({ ...item, id: "anchor-merge-3", duplicate_of: "ghost-pending", notes: "" })],
    null,
    2,
  ) + "\n",
);
const ghost = mergePending("anchor-merge-3");
record(
  "目标是 pending / 不存在时拒绝且保留 pending",
  !ghost.ok && ghost.status === 422 &&
    JSON.parse(fs.readFileSync(path.join(home, "data", "pending.json"), "utf8")).length === 1,
  ghost.ok ? "unexpected ok" : ghost.error,
);

fs.rmSync(home, { recursive: true, force: true });

const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) {
  console.log(`✗ ${failed.length}/${results.length} 项未通过`);
  process.exit(1);
}
console.log(`✓ 全部 ${results.length} 项通过`);
