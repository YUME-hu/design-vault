import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { parseSearchPayload } from "@design-vault/adapters/search/parse";
import { extractVideo } from "@design-vault/adapters/search/extract";
import { similarity, classify } from "@design-vault/adapters/ingest/dedupe";
import { mergePending } from "@design-vault/adapters/ingest/pending-actions";
import { appendPending, readPending } from "@design-vault/adapters/ingest/pending-store";
import { pendingSchema, styleSchema, type PendingItem } from "@design-vault/adapters/schema";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const PENDING = path.join(process.cwd(), "data", "pending.json");
const STYLES = path.join(process.cwd(), "data", "styles.json");
const pendingBefore = fs.readFileSync(PENDING, "utf8");
const stylesBefore = fs.readFileSync(STYLES, "utf8");

const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dv-m3a-"));
const pendingFile = path.join(tmp, "pending.json");
fs.writeFileSync(pendingFile, "[]\n");

// ---------- 搜索解析 ----------
const parsed = parseSearchPayload({
  data: {
    result: [
      {
        bvid: "BV1xx411c7mD",
        title: '赛博朋克 <em class="keyword">配色</em> 教程',
        author: "某 UP",
        mid: 123,
        play: 12345,
        pic: "//i0.hdslb.com/x.jpg",
        duration: "10:00",
      },
      { title: "没有 bvid 的记录" },
    ],
  },
});
record(
  "搜索结果解析：去 HTML、补协议、丢无效项",
  parsed.length === 1 &&
    parsed[0].title === "赛博朋克 配色 教程" &&
    parsed[0].cover === "https://i0.hdslb.com/x.jpg" &&
    parsed[0].play === 12345,
  parsed[0]?.title,
);

// ---------- 提取链路（mock） ----------
const video = { bvid: "BV1xx411c7mD", title: "赛博朋克 配色", author: "某 UP", mid: 123, play: 0, cover: "", duration: "", pubdate: 0 };
const candidate = { name: "赛博朋克配色", project_tags: ["industrial"] };

function deps(overrides: Partial<Parameters<typeof extractVideo>[0]> = {}) {
  return {
    getDesc: async () => "看仓库 https://github.com/acme/cyber",
    getSubtitle: async () => null,
    fetchReadme: async () => ({ ok: true as const, text: "# cyber\n零圆角，冷色高对比" }),
    llm: {
      extract: async () => ({
        ok: true as const,
        hasDesignInfo: true as const,
        candidate,
        colorDirection: { temperature: "cool" as const, saturation: "vivid" as const, contrast: "high" as const, semantic_hint: "冷色高对比" },
        reasoning: "README 写了零圆角",
        raw: "{}",
      }),
    },
    findDuplicate: () => null,
    appendPending: (items: PendingItem[]) => appendPending(items, pendingFile),
    now: () => new Date("2026-10-28T00:00:00Z"),
    ...overrides,
  };
}

const ok = await extractVideo(deps(), video);
const written = readPending(pendingFile);
record(
  "README 链路成功：写入 pending 且 source.type = bilibili-search",
  ok.ok && ok.kind === "pending" && written.length === 1 && written[0].sources[0].type === "bilibili-search" && written[0].sources[0].video === video.bvid,
  `${ok.ok ? ok.kind : ok.error}`,
);

const subtitleOnly = await extractVideo(
  deps({
    getDesc: async () => "没有仓库链接",
    getSubtitle: async () => "这是一段很长的字幕内容，讲的是零圆角、1px 描边和冷灰高对比的界面设计规则，信息密度很高。",
  }),
  { ...video, bvid: "BVsub0000001" },
);
record(
  "无 GitHub 时走字幕：0.5 + notes 标明来源",
  subtitleOnly.ok && subtitleOnly.kind === "pending" && subtitleOnly.confidence === 0.5 && readPending(pendingFile).some((item) => item.notes.includes("字幕提取")),
  subtitleOnly.ok && subtitleOnly.kind === "pending" ? `${subtitleOnly.confidence}` : subtitleOnly.ok ? subtitleOnly.kind : subtitleOnly.error,
);

const beforeEmpty = readPending(pendingFile).length;
const empty = await extractVideo(
  deps({ getDesc: async () => "无链接", getSubtitle: async () => null }),
  { ...video, bvid: "BVempty000001" },
);
record(
  "无文本信息：明确报错且不写 pending",
  !empty.ok && empty.error.includes("无 GitHub") && readPending(pendingFile).length === beforeEmpty,
  empty.ok ? "意外写入" : empty.error,
);

const beforeDuplicate = readPending(pendingFile).length;
const duplicate = await extractVideo(
  deps({
    findDuplicate: () => ({ level: "high", match: { id: "existing-style", name: "赛博朋克配色" } }),
  }),
  { ...video, bvid: "BVdup0000001" },
);
record(
  "高相似度：不写 pending，返回相似风格",
  duplicate.ok && duplicate.kind === "duplicate" && duplicate.matchName === "赛博朋克配色" && readPending(pendingFile).length === beforeDuplicate,
  duplicate.ok ? duplicate.kind : duplicate.error,
);

const medium = await extractVideo(
  deps({
    findDuplicate: () => ({ level: "medium", match: { id: "existing-style", name: "赛博朋克配色" } }),
  }),
  { ...video, bvid: "BVmed0000001" },
);
record(
  "中等相似度：写入并标 duplicate_of",
  medium.ok && medium.kind === "pending" && medium.duplicateOf === "existing-style" && readPending(pendingFile).some((item) => item.duplicate_of === "existing-style"),
  medium.ok && medium.kind === "pending" ? String(medium.duplicateOf) : "fail",
);

// ---------- 查重算法 ----------
record(
  "名称相似度：完全相同 / 包含 / 无关",
  similarity("赛博朋克配色", "赛博朋克配色") === 1 &&
    classify(similarity("赛博朋克配色", "赛博朋克配色方案")) === "high" &&
    classify(similarity("赛博朋克配色", "极简黑白排版")) === "none",
);

// ---------- 合并信源（真实文件） ----------
try {
  const styles = JSON.parse(stylesBefore) as { id: string; name: string; sources: unknown[]; updated_at: string }[];
  const target = styles[0];
  const recordItem: PendingItem = {
    id: "dddddddd-0000-4000-8000-dddddddddddd",
    status: "pending",
    created_at: "2026-10-28",
    confidence: 0.6,
    sources: [{ type: "bilibili-search", url: "https://github.com/acme/cyber", upstream: "某 UP (123)", video: "BV1xx411c7mD" }],
    upstream_name: "某 UP",
    video_title: "赛博朋克 配色",
    name: "赛博朋克配色",
    candidate: { name: "赛博朋克配色" },
    color_direction: null,
    duplicate_of: target.id,
    reasoning: "",
    notes: "",
    raw_response: "{}",
  };
  fs.writeFileSync(PENDING, JSON.stringify([recordItem], null, 2) + "\n");
  const merged = mergePending(recordItem.id);
  const after = (JSON.parse(fs.readFileSync(STYLES, "utf8")) as { id: string; sources: { video: string }[] }[]).find((style) => style.id === target.id);
  record(
    "合并信源：sources 追加到目标风格并删除 pending",
    merged.ok && readPending().length === 0 && Boolean(after?.sources.some((source) => source.video === "BV1xx411c7mD")),
    merged.ok ? `target ${merged.targetId} +${merged.added}` : merged.error,
  );
} finally {
  fs.writeFileSync(PENDING, pendingBefore);
  fs.writeFileSync(STYLES, stylesBefore);
}

// ---------- 数据形状 / 页面 ----------
const allHaveSources = (file: string) =>
  (JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>[]).every((item) => Array.isArray(item.sources) && !("source" in item));
record("styles / draft 已全部迁移为 sources 数组", allHaveSources(STYLES) && allHaveSources(path.join(process.cwd(), "data", "styles.draft.json")));

const browser = await chromium.launch({ channel: "msedge" });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const consoleErrors: string[] = [];
page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });

const searchResults = {
  ok: true,
  results: [
    { bvid: "BV1xx411c7mD", title: "赛博朋克 配色 教程", author: "某 UP", mid: 123, play: 12345, cover: "", duration: "10:00" },
    { bvid: "BV2yy411c7mE", title: "Framer Motion 动效", author: "另一 UP", mid: 456, play: 888, cover: "", duration: "08:00" },
  ],
};
let extractPolls = 0;
await page.route("**/api/search", (route) =>
  route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(searchResults) }),
);
await page.route("**/api/search/extract*", (route) => {
  if (route.request().method() === "POST") {
    return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ ok: true, jobId: "job-1" }) });
  }
  extractPolls += 1;
  const running = extractPolls < 2;
  return route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      ok: true,
      job: running
        ? { status: "running", step: "analyze", message: "正在分析文本…", error: "", result: null }
        : { status: "done", step: "done", message: "已写入 pending：赛博朋克配色", error: "", result: { kind: "pending", name: "赛博朋克配色", confidence: 0.6, duplicateOf: null } },
    }),
  });
});

await page.goto(`${BASE}/search`, { waitUntil: "networkidle" });
record("/search 渲染搜索框与按钮", (await page.locator('[data-testid="search-input"]').count()) === 1 && (await page.locator('[data-testid="search-submit"]').count()) === 1);

await page.fill('[data-testid="search-input"]', "赛博朋克 配色");
await page.click('[data-testid="search-submit"]');
await page.waitForSelector('[data-testid="search-result"]');
record("搜索结果展示封面区 / 标题 / UP / BV", (await page.locator('[data-testid="search-result"]').count()) === 2 && (await page.locator('[data-testid="search-result"]').first().innerText()).includes("某 UP"));

await page.locator('[data-testid="extract-button"]').first().click();
await page.waitForSelector('[data-testid="extract-status"]');
const runningText = await page.locator('[data-testid="extract-status"]').first().innerText();
await page.waitForFunction(
  () => document.querySelector('[data-testid="extract-status"]')?.getAttribute("data-status") === "done",
  undefined,
  { timeout: 10000 },
);
const doneText = await page.locator('[data-testid="extract-status"]').first().innerText();
record("提取过程有进度、结束后有结果", runningText.length > 0 && /已写入 pending/.test(doneText), doneText.slice(0, 40));

for (const width of [1280, 375]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE}/search`, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  record(`/search @${width}px 无横向溢出`, overflow.scroll <= overflow.client, `scrollWidth=${overflow.scroll}`);
}

record("无意外 console error", consoleErrors.filter((m) => !/status of 4\d\d/.test(m)).length === 0, consoleErrors.slice(0, 2).join(" | "));
await browser.close();

record("测试结束 pending / styles 已还原", fs.readFileSync(PENDING, "utf8") === pendingBefore && fs.readFileSync(STYLES, "utf8") === stylesBefore);
record("pending schema 仍可校验", pendingSchema.safeParse(readPending()).success);

let validateOk = true;
try { execSync("npm run validate", { encoding: "utf8", stdio: "pipe" }); } catch { validateOk = false; }
record("npm run validate 通过", validateOk);

fs.rmSync(tmp, { recursive: true, force: true });
const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) { console.log(`✗ ${failed.length}/${results.length} 项未通过`); process.exit(1); }
console.log(`✓ 全部 ${results.length} 项通过`);
