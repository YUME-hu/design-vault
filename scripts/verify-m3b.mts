import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { execSync } from "node:child_process";
import { extractVideo } from "@design-vault/adapters/search/extract";
import { makeMontage, runVisionFallback, FRAMES_ROOT } from "@design-vault/adapters/ingest/vision";
import { appendPending, readPending } from "@design-vault/adapters/ingest/pending-store";
import { pendingItemSchema, pendingSchema, type PendingItem } from "@design-vault/adapters/schema";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const PENDING = path.join(process.cwd(), "data", "pending.json");
const pendingBefore = fs.readFileSync(PENDING, "utf8");
const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dv-m3b-"));
const pendingFile = path.join(tmp, "pending.json");
fs.writeFileSync(pendingFile, "[]\n");

const video = { bvid: "BVMOCK000001", title: "无字幕的视觉视频", author: "某 UP", mid: 1, play: 0, cover: "", duration: "", pubdate: 0 };

// ---------- 拼图（真实 sharp） ----------
const a = await sharp({ create: { width: 200, height: 120, channels: 3, background: "#102030" } }).png().toBuffer();
const b = await sharp({ create: { width: 200, height: 120, channels: 3, background: "#d63a2c" } }).png().toBuffer();
const frameA = path.join(tmp, "a.png");
const frameB = path.join(tmp, "b.png");
fs.writeFileSync(frameA, a);
fs.writeFileSync(frameB, b);
const montage = path.join(tmp, "montage.png");
await makeMontage([frameA, frameB], montage);
const meta = await sharp(montage).metadata();
record("拼图：两张帧横向拼成一张", fs.existsSync(montage) && (meta.width ?? 0) > 300, `${meta.width}x${meta.height}`);

// ---------- runVisionFallback（mock 下载/截帧/模型） ----------
const bvid = "BVMOCK000002";
const framesDir = path.join(FRAMES_ROOT, bvid);
fs.rmSync(framesDir, { recursive: true, force: true });
const visionRun = await runVisionFallback(
  {
    download: async (_url, dest) => { fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.writeFileSync(dest, "fake"); },
    extractFrames: async (_video, outDir) => {
      const one = path.join(outDir, "frame-10.png");
      const two = path.join(outDir, "frame-90.png");
      fs.writeFileSync(one, a);
      fs.writeFileSync(two, b);
      return [one, two];
    },
    analyze: async () => ({
      name: "暗色高对比控制台",
      summary: "深色底 + 信号红强调，等宽标题，信息密度高",
      color_direction: { temperature: "cool", saturation: "vivid", contrast: "high", semantic_hint: "深底亮字，红色点缀" },
      project_tags: ["dark", "technical"],
    }),
  },
  { bvid, durationSec: 60, playUrl: "https://example.com/v.mp4" },
  () => {},
);
record(
  "视觉兜底：拼图归档到 data/frames/{bvid}/ 且无 HEX",
  visionRun.ok && fs.existsSync(path.join(framesDir, "montage.png")) && visionRun.visual.project_tags.length === 2,
  visionRun.ok ? path.relative(process.cwd(), visionRun.montagePath) : visionRun.error,
);

const hexRun = await runVisionFallback(
  {
    download: async (_u, d) => fs.writeFileSync(d, "x"),
    extractFrames: async (_v, outDir) => { const f = path.join(outDir, "f.png"); fs.writeFileSync(f, a); return [f]; },
    analyze: async () => ({
      name: "坏输出", summary: "带 HEX",
      color_direction: { temperature: "cool", saturation: "vivid", contrast: "high", semantic_hint: "#D63A2C" },
      project_tags: [],
    }),
  },
  { bvid: "BVMOCK000003", durationSec: 30, playUrl: "https://example.com/v.mp4" },
);
record("视觉模型输出 HEX 被拒绝", !hexRun.ok && /HEX/.test(hexRun.error), hexRun.ok ? "未拒绝" : hexRun.error);

// ---------- 提取链路：文本失败 → 视觉 0.7 ----------
function deps(overrides = {}) {
  return {
    getDesc: async () => "无链接",
    getSubtitle: async () => null,
    fetchReadme: async () => ({ ok: false, reason: "404", message: "no" }),
    llm: { extract: async () => ({ ok: false, raw: "", error: "no" }) },
    findDuplicate: () => null,
    vision: async () => ({
      ok: true,
      visual: { name: "暗色高对比控制台", summary: "深色底 + 红色强调", color_direction: { temperature: "cool", saturation: "vivid", contrast: "high", semantic_hint: "深底亮字" }, project_tags: ["dark"] },
      montage: path.join(framesDir, "montage.png"),
    }),
    appendPending: (items: PendingItem[]) => appendPending(items, pendingFile),
    now: () => new Date("2026-10-28T00:00:00Z"),
    ...overrides,
  };
}

const visualOk = await extractVideo(deps(), video);
const written = readPending(pendingFile);
record(
  "无文本视频触发视觉链路：confidence 0.7 + 来源备注",
  visualOk.ok && visualOk.kind === "pending" && visualOk.confidence === 0.7 && written[0]?.notes.includes("视觉截帧"),
  `${visualOk.ok && visualOk.kind === "pending" ? visualOk.confidence : "fail"} · ${written[0]?.notes ?? ""}`,
);

const visualFail = await extractVideo(deps({ vision: async () => ({ ok: false, error: "截帧失败：没有取到画面" }) }), { ...video, bvid: "BVMOCK000004" });
record("视觉也失败：报错且不写 pending", !visualFail.ok && readPending(pendingFile).length === 1, visualFail.ok ? "意外写入" : visualFail.error);

// ---------- 审核页展示拼图 ----------
const browser = await chromium.launch({ channel: "msedge" });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const errors: string[] = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

const seeded: PendingItem = pendingItemSchema.parse({
  id: "eeeeeeee-0000-4000-8000-eeeeeeeeeeee",
  status: "pending",
  created_at: "2026-10-28",
  confidence: 0.7,
  sources: [{ type: "bilibili-search", url: "", upstream: "某 UP (1)", video: bvid }],
  upstream_name: "某 UP",
  video_title: "无字幕的视觉视频",
  name: "暗色高对比控制台",
  candidate: { name: "暗色高对比控制台" },
  color_direction: null,
  duplicate_of: null,
  reasoning: "视觉模型分析拼图得出",
  notes: `来源：视觉截帧提取 ${path.join(framesDir, "montage.png")}`,
  raw_response: "{}",
});
fs.writeFileSync(PENDING, JSON.stringify([seeded], null, 2) + "\n");

try {
  await page.goto(`${BASE}/pending`, { waitUntil: "networkidle" });
  await page.locator(`[data-pending-id="${seeded.id}"] summary`).click();
  const img = page.locator('[data-testid="montage-preview"] img');
  await img.waitFor({ timeout: 8000 });
  record("审核页展开显示拼图", (await img.count()) === 1 && /api\/frames\//.test(await img.getAttribute("src")));
} finally {
  fs.writeFileSync(PENDING, pendingBefore);
}

record("无意外 console error", errors.filter((m) => !/status of 4\d\d/.test(m)).length === 0, errors.slice(0, 2).join(" | "));
await browser.close();

record("pending / 还原成功", fs.readFileSync(PENDING, "utf8") === pendingBefore);
let validateOk = true;
try { execSync("npm run validate", { encoding: "utf8", stdio: "pipe" }); } catch { validateOk = false; }
record("npm run validate 通过", validateOk);

fs.rmSync(tmp, { recursive: true, force: true });
const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) { console.log(`✗ ${failed.length}/${results.length} 项未通过`); process.exit(1); }
console.log(`✓ 全部 ${results.length} 项通过`);
