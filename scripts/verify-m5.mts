import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import AdmZip from "adm-zip";
import { pendingItemSchema } from "@design-vault/adapters/schema";
import { approvePending } from "@design-vault/adapters/ingest/pending-actions";
import { readIngestState, writeIngestState } from "@design-vault/adapters/ingest/state";

const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

const E = path.join(process.cwd(), "data", "effects.json");
const P = path.join(process.cwd(), "data", "pending.json");
const S = path.join(process.cwd(), "data", "styles.json");
const before = { e: fs.readFileSync(E, "utf8"), p: fs.readFileSync(P, "utf8"), s: fs.readFileSync(S, "utf8") };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dv-m5-"));

// 1) 状态持久化
const stateFile = path.join(tmp, "ingest-state.json");
writeIngestState(
  {
    upstreams: { "40238601": { name: "路北路陈", lastCheckedAt: "2026-10-28T10:00:00.000Z" } },
    lastRun: {
      startedAt: "2026-10-28T09:59:00.000Z",
      finishedAt: "2026-10-28T10:00:00.000Z",
      added: 3,
      skipped: 1,
      failed: 1,
      error: "",
      status: "done",
      failures: [{ bvid: "BV1bad", reason: "B 站 412", at: "2026-10-28T10:00:00.000Z" }],
    },
    videos: { BV1bad: { status: "failed", at: "2026-10-28T10:00:00.000Z" } },
  },
  stateFile,
);
const state = readIngestState(stateFile);
record(
  "任务状态落盘后可读回（含失败原因与视频状态）",
  state.lastRun?.added === 3 &&
    state.lastRun.failures[0]?.bvid === "BV1bad" &&
    state.videos.BV1bad?.status === "failed",
  `${state.lastRun?.status} · ${state.lastRun?.failures.length} failures`,
);

// 2) 备份脚本
execSync(`npx tsx scripts/backup.mts --dir "${tmp}"`, { encoding: "utf8", stdio: "pipe" });
const zips = () => fs.readdirSync(tmp).filter((name) => name.endsWith(".zip"));
const first = zips()[0];
const entries = first ? new AdmZip(path.join(tmp, first)).getEntries().map((entry) => entry.entryName) : [];
record(
  "备份脚本生成 zip 且包含 data 与 upstreams",
  Boolean(first) &&
    entries.includes("data/styles.json") &&
    entries.includes("data/effects.json") &&
    entries.includes("config/upstreams.json"),
  `${first} · ${entries.length} 项`,
);

for (let index = 0; index < 12; index += 1) {
  fs.writeFileSync(path.join(tmp, `design-vault-2026010${index % 9}-00000${index % 10}.zip`), "x");
}
execSync(`npx tsx scripts/backup.mts --dir "${tmp}"`, { encoding: "utf8", stdio: "pipe" });
record("自动清理旧备份，只保留最近 10 份", zips().length <= 10, `${zips().length} 份`);

// 3) Effect 短哈希 ID
try {
  const pending = pendingItemSchema.parse({
    id: "eeeeeeee-1111-4000-8000-eeeeeeeeeeee",
    status: "pending",
    created_at: "2026-10-28",
    confidence: 0.6,
    sources: [{ type: "bilibili-search", url: "", upstream: "UP (1)", video: "BVM5" }],
    upstream_name: "UP",
    video_title: "M5",
    name: "M5 Hash Style",
    candidate: { name: "M5 Hash Style" },
    color_direction: null,
    duplicate_of: null,
    extracted_effects: [
      { name: "横向条纹遮罩", tech_stack: [], description: "用遮罩做扫描加载", code_snippet: "", performance_notes: "" },
    ],
    reasoning: "",
    notes: "",
    raw_response: "{}",
  });
  fs.writeFileSync(P, JSON.stringify([pending], null, 2) + "\n");
  const approved = approvePending(pending.id);
  const effects = JSON.parse(fs.readFileSync(E, "utf8")) as { id: string; related_styles: string[] }[];
  const created = effects.find((effect) => effect.related_styles.includes("m5-hash-style"));
  record(
    "中文名 effect 使用短哈希 id（effect-xxxxxx）",
    approved.ok && /^effect-[a-f0-9]{6}$/.test(created?.id ?? "") && created?.related_styles.includes("m5-hash-style"),
    created?.id ?? "未生成",
  );
} finally {
  fs.writeFileSync(E, before.e);
  fs.writeFileSync(P, before.p);
  fs.writeFileSync(S, before.s);
}

record("测试结束已还原 effects / pending / styles", fs.readFileSync(E, "utf8") === before.e && fs.readFileSync(S, "utf8") === before.s);
fs.rmSync(tmp, { recursive: true, force: true });

const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) { console.log(`✗ ${failed.length}/${results.length} 项未通过`); process.exit(1); }
console.log(`✓ 全部 ${results.length} 项通过`);
