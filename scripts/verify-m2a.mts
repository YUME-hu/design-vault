/**
 * M2a 验收自检：npm run verify:m2a
 *
 * A. 抓取链路：用假 B 站 / GitHub / DeepSeek 跑完整 pipeline，写临时 pending 文件
 * B. DeepSeek 适配器：假 fetch 验 zod 校验、重试、usage 日志、色彩方向无 HEX
 * C. 工具函数：GitHub 链接解析、WBI 签名、SESSDATA 提取
 * D. 订阅页 UI：4 个 UP 主、进度、摘要、cookie 失效提示（route stub，不依赖真实网络）
 * E. /pending：列表 + 展开详情（临时种子数据，结束还原）
 * F. 1280 / 375 无横向溢出
 *
 * 不依赖真实 B 站 / GitHub / DeepSeek；只对本地 dev server 发页面请求。
 */
import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { runIngest } from "../lib/ingest/pipeline";
import { parseGithubRepo } from "../lib/ingest/github";
import { appendPending, readPending } from "../lib/ingest/pending-store";
import { extractSessdata, mixinKey, signWbi } from "../lib/ingest/bilibili";
import { appendUsageLog, extractStyle } from "../lib/ingest/deepseek";
import { readUpstreams } from "../lib/ingest/config";
import { pendingSchema, type PendingItem, type ProjectType, type Style } from "../lib/schema";
import type { IngestDeps, LlmExtraction, Video } from "../lib/ingest/types";
import { SessionExpiredError } from "../lib/ingest/types";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const STYLES_PATH = path.join(process.cwd(), "data", "styles.json");
const DRAFTS_PATH = path.join(process.cwd(), "data", "styles.draft.json");
const PENDING_PATH = path.join(process.cwd(), "data", "pending.json");
const USAGE_PATH = path.join(process.cwd(), "data", "llm-usage.log");

const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dv-m2a-"));
const pendingFile = path.join(tmp, "pending.json");
fs.writeFileSync(pendingFile, "[]\n", "utf8");

const HEX = /#[0-9a-fA-F]{3,8}\b/;

// ---------- A. 抓取链路（全 mock） ----------

const readonlyLog = path.join(tmp, "pipeline-usage.log");

const videosByUid: Record<string, Video[]> = {
  "111": [
    {
      bvid: "BV1A",
      title: "工业风控制台 UI 复刻",
      desc: "源码在这里 https://github.com/acme/industrial-ui 欢迎 star",
      pubdate: 1,
    },
    { bvid: "BV1B", title: "聊聊最近的设计趋势", desc: "这期没有仓库链接", pubdate: 2 },
  ],
  "222": [
    {
      bvid: "BV2A",
      title: "README 404 的例子",
      desc: "仓库 https://github.com/acme/missing-repo",
      pubdate: 3,
    },
  ],
  "333": [
    {
      bvid: "BV3A",
      title: "只有文档的项目",
      desc: "https://github.com/acme/docs-only",
      pubdate: 4,
    },
  ],
  "444": [
    {
      bvid: "BV4A",
      title: "模型输出坏掉的例子",
      desc: "https://github.com/acme/broken-json",
      pubdate: 5,
    },
  ],
};

const llmCalls = new Map<string, number>();
const llmDelay: string[] = [];

function validCandidate(name: string): Partial<Style> {
  return {
    name,
    frontend_prompt: "只使用信源里写到的 1px 描边与零圆角，不要加阴影。",
    project_tags: ["industrial", "technical", "not-in-enum"],
    suitable_projects: ["dashboard", "saas-tool"] as ProjectType[],
    unsuitable_projects: ["game"] as ProjectType[],
    typography: { heading: "Space Mono", body: "Noto Sans SC", scale: "12/14/16/20/28/40" },
    tokens: {
      radius: "0",
      border: "1px solid #191919",
      shadow: "none",
      spacing: "4/8/12/16/24",
    },
    components: { button: "直角，1px 边" },
    performance_notes: "无图片资源",
  };
}

const fakeLlm: IngestDeps["llm"] = {
  async extract(input): Promise<LlmExtraction> {
    const count = (llmCalls.get(input.video.bvid) ?? 0) + 1;
    llmCalls.set(input.video.bvid, count);
    llmDelay.push(`${input.video.bvid}#${count}`);

    if (input.video.bvid === "BV4A") {
      return { ok: false, raw: '{"name": "坏掉的输出"', error: "输出未通过 zod 校验（已重试 1 次）" };
    }
    if (input.video.bvid === "BV3A") {
      return { ok: true, hasDesignInfo: false, raw: '{"has_design_info": false}' };
    }
    return {
      ok: true,
      hasDesignInfo: true,
      candidate: { ...validCandidate("工业控制台") },
      colorDirection: {
        temperature: "cool",
        saturation: "muted",
        contrast: "high",
        semantic_hint: "冷灰高对比",
      },
      reasoning: "README 里明确写了零圆角与 1px 描边",
      raw: JSON.stringify(validCandidate("工业控制台")),
    };
  },
};

const delays: number[] = [];

const deps: IngestDeps = {
  upstreams: [
    { uid: "111", name: "UP-A" },
    { uid: "222" },
    { uid: "333" },
    { uid: "444" },
  ],
  bilibili: {
    async getUserName(uid) {
      return `UP-${uid}`;
    },
    async listVideos(uid) {
      return videosByUid[uid] ?? [];
    },
  },
  github: {
    async fetchReadme(repo) {
      if (repo.owner === "acme" && repo.repo === "industrial-ui") {
        return {
          ok: true,
          text: "# Industrial UI\n\n- 零圆角\n- 1px 描边\n- Space Mono 标题\n",
        };
      }
      if (repo.repo === "missing-repo") {
        return { ok: false, reason: "404", message: "README 404" };
      }
      return {
        ok: true,
        text: "# Docs only\n\n这是一个只有安装说明的仓库，没有任何界面或视觉规则。\n",
      };
    },
  },
  llm: fakeLlm,
  store: {
    append: (items) => appendPending(items, pendingFile),
  },
  now: () => new Date("2026-10-28T00:00:00Z"),
  sleep: async (ms) => {
    delays.push(ms);
  },
  random: () => 0.5,
  perUpstream: 5,
  delayRange: [1000, 3000],
};

const progressEvents: string[] = [];
const depsWithProgress: IngestDeps = {
  ...deps,
  onProgress: (progress) => {
    progressEvents.push(
      `${progress.upstreamIndex}/${progress.upstreamTotal}-${progress.videoIndex}/${progress.videoTotal}`,
    );
  },
};

const firstRun = await runIngest(depsWithProgress);
const pending = readPending(pendingFile);

record(
  "抓取链路跑通并产出了 pending",
  firstRun.summary.added === 5 && pending.length === 5,
  `added ${firstRun.summary.added} · pending ${pending.length}`,
);

const byVideo = new Map(pending.map((item) => [item.sources[0].video, item]));

const success = byVideo.get("BV1A");
record(
  "成功链路：简介 → README → DeepSeek → pending（confidence 0.6）",
  Boolean(success) &&
    success!.confidence === 0.6 &&
    success!.sources[0].url === "https://github.com/acme/industrial-ui",
  `${success?.name} · ${success?.confidence}`,
);

record(
  "pending 带 source.video / source.upstream / source.url",
  Boolean(success) &&
    success!.sources[0].video === "BV1A" &&
    success!.sources[0].upstream === "111" &&
    success!.sources[0].url.startsWith("https://github.com/acme/industrial-ui") &&
    success!.sources[0].type === "bilibili",
  `${success?.sources[0].type} · ${success?.sources[0].upstream} · ${success?.sources[0].video}`,
);

const noGithub = byVideo.get("BV1B");
record(
  "无 GitHub 链接：confidence 0.3 且 notes 写明原因",
  noGithub?.confidence === 0.3 && noGithub?.notes === "无 GitHub 链接",
  `${noGithub?.confidence} · ${noGithub?.notes}`,
);

const readme404 = byVideo.get("BV2A");
record(
  "README 404：confidence 0.3 且 notes 写明原因",
  readme404?.confidence === 0.3 && readme404?.notes === "README 404",
  `${readme404?.confidence} · ${readme404?.notes}`,
);

const noInfo = byVideo.get("BV3A");
record(
  "README 无设计信息：confidence 0.3 且 notes 写明原因",
  noInfo?.confidence === 0.3 && noInfo?.notes === "README 无设计信息",
  `${noInfo?.confidence} · ${noInfo?.notes}`,
);

const broken = byVideo.get("BV4A");
record(
  "模型两次输出都不合格：confidence 0 + 记录原始响应",
  broken?.confidence === 0 &&
    (broken?.raw_response ?? "").length > 0 &&
    (broken?.notes ?? "").includes("DeepSeek"),
  `${broken?.confidence} · raw ${broken?.raw_response?.slice(0, 24)}…`,
);

const direction = success?.color_direction;
record(
  "色彩方向只含语义字段且不含 HEX",
  Boolean(direction) &&
    Object.keys(direction!).sort().join(",") === "contrast,saturation,semantic_hint,temperature" &&
    !HEX.test(JSON.stringify(direction)),
  JSON.stringify(direction),
);

record(
  "每条 pending 通过 pendingSchema 校验",
  pendingSchema.safeParse(readPending(pendingFile)).success,
  `${pending.length} 条`,
);

record(
  "pending id 是 uuid、status 为 pending",
  pending.every((item) => item.id.length >= 8 && item.status === "pending"),
);

record(
  "B 站请求之间有 1–3 秒随机延迟",
  delays.length > 0 && delays.every((value) => value >= 1000 && value <= 3000),
  `延迟样本 ${delays.slice(0, 4).join(", ")}… 共 ${delays.length} 次`,
);

record(
  "进度回调按 UP 主 / 视频推进",
  progressEvents.some((value) => value.startsWith("1/4-1/2")) &&
    progressEvents.some((value) => value.startsWith("4/4-1/1")),
  `${progressEvents.length} 次进度事件`,
);

const secondRun = await runIngest(deps);
record(
  "相同视频重复抓取不产生重复 pending",
  secondRun.summary.added === 0 &&
    secondRun.summary.skipped === 5 &&
    readPending(pendingFile).length === 5,
  `第二次 added ${secondRun.summary.added} · skipped ${secondRun.summary.skipped}`,
);

// cookie 失效
let expiredError: string | null = null;
const expiredRun = await runIngest({
  ...deps,
  upstreams: [{ uid: "111" }],
  bilibili: {
    getUserName: async () => "x",
    listVideos: async () => {
      throw new SessionExpiredError();
    },
  },
});
expiredError = expiredRun.error?.code ?? null;
record(
  "B 站 -101 会中止任务并带出 SESSION_EXPIRED",
  expiredError === "SESSION_EXPIRED",
  expiredError ?? "无错误",
);

// ---------- B. DeepSeek 适配器（假 fetch） ----------

function deepseekResponse(content: string, usage = { prompt_tokens: 120, completion_tokens: 80, total_tokens: 200 }) {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content } }],
      usage,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

const llmInput = {
  upstreamName: "UP-A",
  video: { bvid: "BV1A", title: "工业风控制台 UI 复刻", desc: "源码 github.com/acme/industrial-ui", pubdate: 1 },
  readme: "# Industrial UI\n零圆角，1px 描边，Space Mono。",
  repoUrl: "https://github.com/acme/industrial-ui",
};

const usageLog = path.join(tmp, "llm-usage.log");
const goodPayload = JSON.stringify({
  name: "工业控制台",
  summary: "冷灰高对比的工业控制台风格",
  has_design_info: true,
  frontend_prompt: "零圆角 + 1px 描边 + 等宽标题。",
  project_tags: ["industrial", "unknown-tag"],
  suitable_projects: ["dashboard"],
  unsuitable_projects: ["children"],
  color_direction: {
    temperature: "cool",
    saturation: "muted",
    contrast: "high",
    semantic_hint: "冷灰高对比",
  },
  typography: { heading: "Space Mono", body: "Noto Sans SC", scale: "12/16/28" },
  tokens: { radius: "0", border: "1px solid #191919", shadow: "none", spacing: "4/8/16" },
});

const adaptersGood = await extractStyle(llmInput, {
  apiKey: "test-key",
  allowedTags: ["industrial", "technical"],
  fetchImpl: (async () => deepseekResponse(goodPayload)) as typeof fetch,
  usageLogFile: usageLog,
  baseUrl: "https://deepseek.test",
});

const adaptersGoodOk = adaptersGood.ok && adaptersGood.hasDesignInfo === true;
record(
  "DeepSeek 输出经 zod 校验并映射成候选",
  adaptersGoodOk,
  adaptersGoodOk ? "ok" : "fail",
);

const mappedTags =
  adaptersGood.ok && adaptersGood.hasDesignInfo
    ? (adaptersGood.candidate.project_tags ?? []).join(",")
    : "";
record(
  "project_tags 按枚举过滤（不在枚举里的被丢弃）",
  mappedTags === "industrial",
  mappedTags || "无",
);

const logLines = fs.readFileSync(usageLog, "utf8").trim().split("\n").map((line) => JSON.parse(line));
record(
  "llm-usage.log 记录了 token 用量（JSONL）",
  logLines.length === 1 && logLines[0].total_tokens === 200 && logLines[0].video === "BV1A",
  JSON.stringify(logLines[0]),
);

const badTwice = await extractStyle(llmInput, {
  apiKey: "test-key",
  allowedTags: ["industrial"],
  fetchImpl: (async () => deepseekResponse('{"name": "半截输出"')) as typeof fetch,
  usageLogFile: path.join(tmp, "bad.log"),
  baseUrl: "https://deepseek.test",
});
record(
  "zod 校验失败会重试一次，仍失败则返回原始响应",
  !badTwice.ok && badTwice.raw.length > 0,
  badTwice.ok ? "意外成功" : badTwice.error,
);

const hexDirection = await extractStyle(llmInput, {
  apiKey: "test-key",
  allowedTags: ["industrial"],
  fetchImpl: (async () =>
    deepseekResponse(
      JSON.stringify({
        ...JSON.parse(goodPayload),
        color_direction: {
          temperature: "cool",
          saturation: "muted",
          contrast: "high",
          semantic_hint: "接近 #D63A2C 的红",
        },
      }),
    )) as typeof fetch,
  usageLogFile: path.join(tmp, "hex.log"),
  baseUrl: "https://deepseek.test",
});
record(
  "色彩方向里出现 HEX 会被 zod 拒绝",
  !hexDirection.ok,
  hexDirection.ok ? "意外通过" : hexDirection.error,
);

// 第一次输出坏、第二次修好 → 适配器内部重试
let retryAttempts = 0;
const retryFetch = (async () => {
  retryAttempts += 1;
  return retryAttempts === 1 ? deepseekResponse("{不是 JSON") : deepseekResponse(goodPayload);
}) as typeof fetch;

const retried = await extractStyle(llmInput, {
  apiKey: "test-key",
  allowedTags: ["industrial"],
  fetchImpl: retryFetch,
  usageLogFile: path.join(tmp, "retry.log"),
  baseUrl: "https://deepseek.test",
});
record(
  "模型第一次输出坏、重试一次后成功",
  retried.ok && retried.hasDesignInfo === true && retryAttempts === 2,
  `attempts ${retryAttempts}`,
);

// 缺 key
const noKey = await extractStyle(llmInput, { apiKey: "", allowedTags: [], baseUrl: "https://deepseek.test" });
record("缺少 DEEPSEEK_API_KEY 时显式报错", !noKey.ok && noKey.error.includes("DEEPSEEK_API_KEY"));

// ---------- C. 工具函数 ----------

const repoCases = [
  ["看这个 https://github.com/acme/industrial-ui 源码", "acme/industrial-ui"],
  ["https://github.com/acme/industrial-ui/tree/main/src", "acme/industrial-ui"],
  ["https://github.com/acme/industrial-ui.git", "acme/industrial-ui"],
  ["https://github.com/topics/design", null],
  ["没有链接的一段话", null],
] as const;
const repoOk = repoCases.every(([text, expected]) => {
  const parsed = parseGithubRepo(text);
  return expected === null ? parsed === null : `${parsed?.owner}/${parsed?.repo}` === expected;
});
record("GitHub 链接只取两段路径且过滤非仓库页", repoOk, `${repoCases.length} 个用例`);

const signed = signWbi({ mid: "111", ps: 5 }, "7cd084941338484aae1ad9425b84077c", "4932caff0ff746eab6f01bf08b70ac45", 1700000000);
record(
  "WBI 签名稳定且带 w_rid/wts",
  signed.includes("mid=111") && signed.includes("wts=1700000000") && /w_rid=[0-9a-f]{32}/.test(signed),
  signed.slice(0, 60),
);

record(
  "SESSDATA 兼容整段 Cookie 和裸值",
  extractSessdata("SESSDATA=abc%2C123; bili_jct=x") === "abc%2C123" &&
    extractSessdata("abc123") === "abc123",
);

record(
  "mixinKey 长度为 32",
  mixinKey("7cd084941338484aae1ad9425b84077c", "4932caff0ff746eab6f01bf08b70ac45").length === 32,
);

// ---------- D. 订阅页 UI（route stub，不发真实抓取） ----------

const browser = await chromium.launch({ channel: "msedge" });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const consoleErrors: string[] = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

const runningJob = {
  jobId: "job-1",
  status: "running",
  progress: {
    status: "running",
    upstreamIndex: 1,
    upstreamTotal: 4,
    currentUpstream: "40238601",
    currentUpstreamName: "UP-A",
    videoIndex: 2,
    videoTotal: 5,
    currentVideo: "BV1A",
    added: 1,
    skipped: 0,
    failed: 0,
    message: "处理 BV1A",
  },
  result: null,
  error: null,
};
const doneJob = {
  ...runningJob,
  status: "done",
  progress: { ...runningJob.progress, status: "done", upstreamIndex: 4, videoIndex: 5, videoTotal: 5, added: 2, skipped: 1, failed: 0 },
  result: { summary: { added: 2, skipped: 1, failed: 0, failures: [] } },
  error: null,
};

let started = false;
let pollsAfterStart = 0;
await page.route("**/api/ingest", async (route) => {
  const method = route.request().method();
  if (method === "POST") {
    started = true;
    pollsAfterStart = 0;
    return route.fulfill({ status: 202, contentType: "application/json", body: JSON.stringify({ ok: true, jobId: "job-1" }) });
  }
  if (!started) {
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, job: null, state: {} }) });
  }
  pollsAfterStart += 1;
  const job = pollsAfterStart < 3 ? runningJob : doneJob;
  return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, job, state: {} }) });
});

await page.goto(`${BASE}/subscriptions`, { waitUntil: "networkidle" });

const upstreamsOnPage = await page.locator('[data-testid="upstream-row"]').count();
record(
  "/subscriptions 展示全部订阅 UP 主",
  upstreamsOnPage === readUpstreams().length,
  `${upstreamsOnPage} 行 / 配置 ${readUpstreams().length} 个`,
);

const uids = await page.$$eval('[data-testid="upstream-row"]', (nodes) => nodes.map((node) => node.getAttribute("data-uid")));
record(
  "UP 主 UID 与 config/upstreams.json 一致",
  JSON.stringify(uids) === JSON.stringify(readUpstreams().map((item) => item.uid)),
  uids.join(", "),
);

await page.click('[data-testid="check-now"]');
await page.waitForSelector('[data-testid="job-progress"]', { timeout: 8000 });
const progressText = (await page.locator('[data-testid="job-progress"]').innerText()).replace(/\s+/g, " ");
record(
  "抓取中显示进度且页面可交互",
  /第 1 \/ 4 个 UP 主/.test(progressText) && /第 2 \/ 5 个视频/.test(progressText),
  progressText.slice(0, 90),
);

await page.waitForSelector('[data-testid="job-summary"]', { timeout: 12000 });
const summaryAccent = (await page.locator('[data-testid="summary-accent"]').innerText()).trim();
const summaryMuted = (await page.locator('[data-testid="summary-muted"]').innerText()).trim();
const summaryDanger = (await page.locator('[data-testid="summary-danger"]').innerText()).trim();
record(
  "完成后显示摘要（新增 / 跳过 / 失败）",
  summaryAccent === "002" && summaryMuted === "001" && summaryDanger === "000",
  `${summaryAccent} / ${summaryMuted} / ${summaryDanger}`,
);

// cookie 失效提示
const expiredPage = await context.newPage();
await expiredPage.route("**/api/ingest", (route) =>
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      ok: true,
      job: {
        jobId: "job-x",
        status: "failed",
        progress: { ...runningJob.progress, status: "failed", message: "-101 账号未登录" },
        result: null,
        error: { code: "SESSION_EXPIRED", message: "-101 账号未登录" },
      },
      state: {},
    }),
  }),
);
await expiredPage.goto(`${BASE}/subscriptions`, { waitUntil: "networkidle" });
await expiredPage.waitForSelector('[data-testid="session-expired"]', { timeout: 8000 });
const expiredText = (await expiredPage.locator('[data-testid="session-expired"]').innerText()).replace(/\s+/g, " ");
record(
  "Cookie 失效时页面显式提示，不静默失败",
  /SESSDATA 已过期/.test(expiredText),
  expiredText.slice(0, 60),
);
await expiredPage.close();

// ---------- E. /pending 列表（临时种子） ----------

const pendingBefore = fs.readFileSync(PENDING_PATH, "utf8");
const seed: PendingItem[] = [
  {
    id: "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa",
    status: "pending",
    created_at: "2026-10-28",
    confidence: 0.6,
    sources: [
      {
        type: "bilibili",
        url: "https://github.com/acme/industrial-ui",
        upstream: "40238601",
        video: "BV1A",
      },
    ],
    upstream_name: "UP-A",
    video_title: "工业风控制台 UI 复刻",
    name: "工业控制台",
    candidate: {
      name: "工业控制台",
      project_tags: ["industrial", "technical"],
      frontend_prompt: "零圆角 + 1px 描边。",
    },
    color_direction: {
      temperature: "cool",
      saturation: "muted",
      contrast: "high",
      semantic_hint: "冷灰高对比",
    },
    reasoning: "README 里明确写了零圆角与 1px 描边",
    notes: "",
    raw_response: '{"name":"工业控制台","color_direction":{"temperature":"cool"}}',
  },
  {
    id: "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb",
    status: "pending",
    created_at: "2026-10-28",
    confidence: 0.3,
    sources: [{ type: "bilibili", url: "", upstream: "35328143", video: "BV1B" }],
    upstream_name: "UP-B",
    video_title: "聊聊最近的设计趋势",
    name: "聊聊最近的设计趋势",
    candidate: { name: "聊聊最近的设计趋势" },
    color_direction: null,
    reasoning: "",
    notes: "无 GitHub 链接",
    raw_response: "",
  },
];

try {
  fs.writeFileSync(PENDING_PATH, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
  await page.goto(`${BASE}/pending`, { waitUntil: "networkidle" });

  const rows = page.locator('[data-testid="pending-row"]');
  record("/pending 列出全部 pending 条目", (await rows.count()) === 2, `${await rows.count()} 条`);

  const listText = (await page.locator("body").innerText()).replace(/\s+/g, " ");
  record(
    "列表展示名称 / UP 主 / BV 号 / 置信度 / notes",
    listText.includes("工业控制台") &&
      listText.includes("UP-A") &&
      listText.includes("BV1A") &&
      /conf 0\.6/i.test(listText) &&
      listText.includes("无 GitHub 链接"),
    listText.slice(0, 80),
  );

  const richRow = page.locator('[data-testid="pending-row"][data-pending-id^="aaaaaaaa"]');
  await richRow.locator("summary").click();
  const detail = richRow.locator('[data-testid="pending-detail"]');
  await detail.waitFor({ state: "visible", timeout: 5000 });
  const detailText = (await detail.innerText()).replace(/\s+/g, " ");
  record(
    "展开后能看到色彩方向、候选 JSON、原始响应",
    /color direction/i.test(detailText) &&
      detailText.includes("temperature") &&
      /candidate json/i.test(detailText) &&
      /raw response/i.test(detailText) &&
      detailText.includes('"name": "工业控制台"'),
    detailText.slice(0, 100),
  );

} finally {
  fs.writeFileSync(PENDING_PATH, pendingBefore, "utf8");
}

// ---------- F. 溢出 ----------

for (const width of [1280, 375]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of ["/subscriptions", "/pending"]) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    record(
      `${route} @${width}px 无横向溢出`,
      overflow.scroll <= overflow.client,
      `scrollWidth=${overflow.scroll}`,
    );
  }
}

record(
  "无意外 console error",
  consoleErrors.filter((message) => !/status of 400/.test(message)).length === 0,
  consoleErrors.slice(0, 2).join(" | "),
);

await browser.close();

// 还原确认
record(
  "测试结束 pending.json 已还原",
  fs.readFileSync(PENDING_PATH, "utf8") === pendingBefore,
);
record(
  "styles.json / styles.draft.json 未被触碰",
  fs.existsSync(STYLES_PATH) && fs.existsSync(DRAFTS_PATH),
);

let validateOk = true;
try {
  execSync("npm run validate", { encoding: "utf8", stdio: "pipe" });
} catch {
  validateOk = false;
}
record("npm run validate 通过", validateOk);

fs.rmSync(tmp, { recursive: true, force: true });

const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) {
  console.log(`✗ ${failed.length}/${results.length} 项未通过`);
  process.exit(1);
}
console.log(`✓ 全部 ${results.length} 项通过`);
