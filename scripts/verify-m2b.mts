/**
 * M2b 验收自检：npm run verify:m2b
 *
 * A. 配置读写：缩进保留、追加/删除、重复检测、原子写（临时文件）
 * B. pending → Style：缺 palette 时按色彩方向映射、占位符替换、id 去重
 * C. 订阅页：真实配置文件增删后页面同步（不依赖 B 站网络）
 * D. 订阅页交互：添加/移除按钮的请求与提示（route stub）
 * E. 审核页全链路：通过入库、丢弃、去调色后保存（真实 API + 真实文件，结束还原）
 * F. 字幕降级：mock pipeline 验证 0.5 + 「来源：字幕提取」
 * G. 用量统计接口、1280/375 溢出、validate
 */
import { chromium } from "playwright";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { addUpstream, readConfig, removeUpstream } from "../lib/upstreams-write";
import { buildStyleFromPending } from "../lib/ingest/pending-to-style";
import { paletteFromDirection } from "../lib/ingest/palette-from-direction";
import { runIngest } from "../lib/ingest/pipeline";
import { appendPending, readPending } from "../lib/ingest/pending-store";
import { pendingSchema, styleSchema, type PendingItem } from "../lib/schema";
import type { IngestDeps } from "../lib/ingest/types";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const CONFIG_PATH = path.join(process.cwd(), "config", "upstreams.json");
const PENDING_PATH = path.join(process.cwd(), "data", "pending.json");
const STYLES_PATH = path.join(process.cwd(), "data", "styles.json");
const STATE_PATH = path.join(process.cwd(), "data", "ingest-state.json");

const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

const configBefore = fs.readFileSync(CONFIG_PATH, "utf8");
const pendingBefore = fs.readFileSync(PENDING_PATH, "utf8");
const stylesBefore = fs.readFileSync(STYLES_PATH, "utf8");
const stateBefore = fs.existsSync(STATE_PATH) ? fs.readFileSync(STATE_PATH, "utf8") : null;

function restoreAll() {
  fs.writeFileSync(CONFIG_PATH, configBefore, "utf8");
  fs.writeFileSync(PENDING_PATH, pendingBefore, "utf8");
  fs.writeFileSync(STYLES_PATH, stylesBefore, "utf8");
  if (stateBefore !== null) fs.writeFileSync(STATE_PATH, stateBefore, "utf8");
}

// ---------- A. 配置读写 ----------

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "dv-m2b-"));
const tmpConfig = path.join(tmp, "upstreams.json");

fs.writeFileSync(tmpConfig, '[\n  "111",\n  "222"\n]\n', "utf8");
const snapshot2 = readConfig(tmpConfig);
const added2 = addUpstream("333", "三号 UP", tmpConfig);
const written2 = fs.readFileSync(tmpConfig, "utf8");
record(
  "添加 UP 主并保留 2 空格缩进",
  snapshot2.indent === 2 &&
    snapshot2.entries.length === 2 &&
    added2.ok &&
    /\n {2}\{/.test(written2) &&
    JSON.parse(written2).length === 3,
  `indent ${snapshot2.indent} · ${JSON.parse(written2).length} 条`,
);
record(
  "追加条目带上服务端查到的昵称",
  JSON.parse(written2).some((entry: { uid: string; name: string }) => entry.uid === "333" && entry.name === "三号 UP"),
);
record("重复添加会被拒绝", !addUpstream("111", "重复", tmpConfig).ok);
record(
  "删除 UP 主后写回文件",
  removeUpstream("111", tmpConfig).ok &&
    !JSON.parse(fs.readFileSync(tmpConfig, "utf8")).some((entry: { uid: string }) => entry.uid === "111"),
);
record("写入后不残留 .tmp 文件", !fs.existsSync(`${tmpConfig}.tmp`));

const tmpConfig4 = path.join(tmp, "upstreams4.json");
fs.writeFileSync(tmpConfig4, '[\n    "111"\n]\n', "utf8");
addUpstream("222", "二号", tmpConfig4);
record(
  "原文件是 4 空格缩进时保持 4 空格",
  /\n {4}\{/.test(fs.readFileSync(tmpConfig4, "utf8")),
  `indent ${readConfig(tmpConfig4).indent}`,
);

// ---------- B. pending → Style ----------

const basePending: PendingItem = {
  id: "aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa",
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
  upstream_name: "路北路陈",
  video_title: "工业控制台 UI",
  name: "Verify Approve Style",
  candidate: {
    name: "Verify Approve Style",
    frontend_prompt: "零圆角 + 1px 描边 + 等宽标题。",
    project_tags: ["industrial", "technical"],
    suitable_projects: ["dashboard"],
    unsuitable_projects: ["game"],
    typography: { heading: "未提及", body: "未提及", scale: "未提及" },
    tokens: { radius: "未提及", border: "未提及", shadow: "未提及", spacing: "未提及" },
    components: { button: "未提及" },
    performance_notes: "未提及",
  },
  color_direction: {
    temperature: "cool",
    saturation: "muted",
    contrast: "high",
    semantic_hint: "冷灰高对比",
  },
  reasoning: "README 写了零圆角",
  notes: "",
  raw_response: "{}",
};

const built = buildStyleFromPending(basePending, {
  takenIds: new Set<string>(),
  today: "2026-10-28",
});
record(
  "缺 palette 时按色彩方向确定性映射",
  built.palette_source === "direction-mapped" &&
    Boolean(built.palette.primary) &&
    styleSchema.safeParse(built).success,
  `${built.palette.primary} · ${built.palette_source}`,
);
record(
  "占位符被替换成基线值",
  built.tokens.radius === "0" &&
    built.tokens.spacing === "4/8/12/16/24/32/48" &&
    built.typography.heading !== "未提及",
  `radius ${built.tokens.radius} · heading ${built.typography.heading}`,
);
record(
  "补全说明写进 notes",
  built.notes.includes("色彩方向映射") && built.notes.includes("基线"),
  built.notes.slice(0, 60),
);

const sameDirection = paletteFromDirection(basePending.color_direction!);
record(
  "同一份色彩方向 → 同一份 palette（可复现）",
  JSON.stringify(sameDirection) ===
    JSON.stringify(paletteFromDirection(basePending.color_direction!)),
);

const builtClash = buildStyleFromPending(basePending, {
  takenIds: new Set(["verify-approve-style"]),
  today: "2026-10-28",
});
record("id 撞车时自动加后缀", builtClash.id === "verify-approve-style-2", builtClash.id);

// ---------- F. 字幕降级（mock pipeline） ----------

const subtitlePendingFile = path.join(tmp, "pending-subtitle.json");
fs.writeFileSync(subtitlePendingFile, "[]\n", "utf8");

const subtitleDeps: IngestDeps = {
  upstreams: [{ uid: "111", name: "UP-A" }],
  bilibili: {
    getUserName: async () => "UP-A",
    listVideos: async () => [
      { bvid: "BV-SUB", title: "有字幕的视频", desc: "没有仓库链接", pubdate: 1 },
      { bvid: "BV-NOSUB", title: "没有字幕的视频", desc: "也没有仓库链接", pubdate: 2 },
    ],
    getSubtitle: async (bvid: string) =>
      bvid === "BV-SUB"
        ? "这条字幕里反复提到零圆角、1px 描边和等宽字体，还有一套冷灰配色。" +
          "字幕里还提到按钮不做圆角、卡片只用一条细边，信息密度很高。"
        : null,
  },
  github: { fetchReadme: async () => ({ ok: false, reason: "404", message: "README 404" }) },
  llm: {
    extract: async (input) => {
      if (input.sourceKind === "subtitle") {
        return {
          ok: true,
          hasDesignInfo: true,
          candidate: { name: "字幕里提取的风格", project_tags: ["industrial"] },
          colorDirection: {
            temperature: "cool",
            saturation: "muted",
            contrast: "high",
            semantic_hint: "冷灰高对比",
          },
          reasoning: "字幕描述了零圆角与 1px 描边",
          raw: "{}",
        };
      }
      return { ok: false, raw: "", error: "不该走到 README 分支" };
    },
  },
  store: { append: (items) => appendPending(items, subtitlePendingFile) },
  now: () => new Date("2026-10-28T00:00:00Z"),
  sleep: async () => {},
  random: () => 0.5,
  perUpstream: 5,
  delayRange: [0, 0],
};

const subtitleRun = await runIngest(subtitleDeps);
const subtitleItems = readPending(subtitlePendingFile);
const fromSubtitle = subtitleItems.find((item) => item.sources[0].video === "BV-SUB");
const noSubtitle = subtitleItems.find((item) => item.sources[0].video === "BV-NOSUB");

record(
  "有 CC 字幕时降级提取到 0.5 且 notes 标明来源",
  subtitleRun.summary.added === 2 &&
    fromSubtitle?.confidence === 0.5 &&
    fromSubtitle?.notes === "来源：字幕提取",
  `${fromSubtitle?.confidence} · ${fromSubtitle?.notes}`,
);
record(
  "没有字幕时维持 0.3",
  noSubtitle?.confidence === 0.3 && noSubtitle?.notes === "无 GitHub 链接",
  `${noSubtitle?.confidence} · ${noSubtitle?.notes}`,
);
record(
  "字幕来源进入 pending 时没有 GitHub URL",
  fromSubtitle?.sources[0].url === "" && fromSubtitle?.sources[0].type === "bilibili",
  fromSubtitle?.sources[0].url || "(空)",
);

// ---------- C. 真实配置文件增删 → 页面同步 ----------

const browser = await chromium.launch({ channel: "msedge" });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();
const consoleErrors: string[] = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

const testUid = "99999999";
addUpstream(testUid, "验收临时UP");
await page.goto(`${BASE}/subscriptions`, { waitUntil: "networkidle" });

const addedRow = page.locator(`[data-testid="upstream-row"][data-uid="${testUid}"]`);
record(
  "新 UID 出现在订阅列表且带昵称",
  (await addedRow.count()) === 1 && (await addedRow.innerText()).includes("验收临时UP"),
);
record(
  "upstreams.json 里真的写入了该 UID",
  readConfig().entries.some((entry) => entry.uid === testUid && entry.name === "验收临时UP"),
);

removeUpstream(testUid);
await page.reload({ waitUntil: "networkidle" });
record(
  "移除后列表不再显示该 UID",
  (await page.locator(`[data-testid="upstream-row"][data-uid="${testUid}"]`).count()) === 0,
);

// ---------- D. 添加/移除按钮的交互（stub） ----------

let postedUid = "";
let deleteUid = "";
await page.route("**/api/upstreams*", async (route) => {
  const request = route.request();
  if (request.method() === "POST") {
    const body = JSON.parse(request.postData() ?? "{}");
    postedUid = body.uid ?? "";
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, upstream: { uid: postedUid, name: "Stub 昵称" } }),
    });
  }
  deleteUid = new URL(request.url()).searchParams.get("uid") ?? "";
  return route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true }),
  });
});

await page.fill('[data-testid="upstream-uid-input"]', "12345678");
await page.click('[data-testid="add-upstream"]');
await page.waitForSelector('[data-testid="add-message"]', { timeout: 5000 });
record(
  "添加表单提交后给出成功提示",
  postedUid === "12345678" && (await page.locator('[data-testid="add-message"]').innerText()).includes("已添加"),
  `uid ${postedUid}`,
);

const firstRemove = page.locator('[data-testid="remove-upstream"]').first();
await firstRemove.click();
await page.waitForTimeout(400);
record(
  "移除按钮发出 DELETE 并给出提示",
  deleteUid.length > 0 &&
    (await page.locator('[data-testid="add-message"]').innerText()).includes("已移除"),
  `uid ${deleteUid}`,
);

await page.unroute("**/api/upstreams*");

// ---------- E. 审核页全链路（真实 API + 文件） ----------

const discardItem: PendingItem = {
  ...basePending,
  id: "bbbbbbbb-0000-4000-8000-bbbbbbbbbbbb",
  name: "Verify Discard Style",
  candidate: { name: "Verify Discard Style" },
  color_direction: null,
  notes: "无 GitHub 链接",
  confidence: 0.3,
};

const polishItem: PendingItem = {
  ...basePending,
  id: "cccccccc-0000-4000-8000-cccccccccccc",
  name: "Verify Polish Style",
  candidate: {
    ...basePending.candidate,
    name: "Verify Polish Style",
    typography: { heading: "Space Mono", body: "Noto Sans SC", scale: "12/14/16/20/28/40" },
    tokens: {
      radius: "0",
      border: "1px solid #191919",
      shadow: "none",
      spacing: "4/8/12/16/24",
    },
    components: { button: "直角，1px 边" },
  },
};

fs.writeFileSync(PENDING_PATH, `${JSON.stringify([basePending, discardItem, polishItem], null, 2)}\n`, "utf8");

try {
  await page.goto(`${BASE}/pending`, { waitUntil: "networkidle" });
  const rows = page.locator('[data-testid="pending-row"]');
  record("审核队列载入 3 条候选", (await rows.count()) === 3, `${await rows.count()} 条`);

  const approveRow = page.locator('[data-pending-id="aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa"]');
  await approveRow.locator("summary").click();
  await approveRow.locator('[data-testid="approve-pending"]').click();
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="pending-row"]').length === 2,
    undefined,
    { timeout: 15000 },
  );

  const stylesAfterApprove = JSON.parse(fs.readFileSync(STYLES_PATH, "utf8")) as { id: string; name: string }[];
  record(
    "「通过并入库」把候选写进 styles.json 并从 pending 移除",
    stylesAfterApprove.some((style) => style.id === "verify-approve-style") &&
      !readPending().some((item) => item.id === basePending.id),
    `styles ${stylesAfterApprove.length} 条`,
  );

  await page.goto(`${BASE}/library`, { waitUntil: "networkidle" });
  record(
    "入库后 /library 能看到这条风格",
    (await page.getByRole("heading", { name: "Verify Approve Style" }).count()) > 0,
  );

  let validateOk = true;
  try {
    execSync("npm run validate", { encoding: "utf8", stdio: "pipe" });
  } catch {
    validateOk = false;
  }
  record("通过入库后 npm run validate 通过", validateOk);

  // 丢弃
  await page.goto(`${BASE}/pending`, { waitUntil: "networkidle" });
  const discardRow = page.locator('[data-pending-id="bbbbbbbb-0000-4000-8000-bbbbbbbbbbbb"]');
  await discardRow.locator("summary").click();
  await discardRow.locator('[data-testid="discard-pending"]').click();
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="pending-row"]').length === 1,
    undefined,
    { timeout: 15000 },
  );
  record(
    "「丢弃」把条目从 pending 删除",
    !readPending().some((item) => item.id === discardItem.id),
  );

  // 去调色 → 保存入库
  await page.goto(`${BASE}/library/new?pending=${polishItem.id}`, { waitUntil: "networkidle" });
  const banner = page.locator('[data-testid="from-pending-banner"]');
  record(
    "「去调色」打开预填的调色页",
    (await banner.count()) === 1 &&
      (await page.inputValue('[data-testid="style-name"]')) === "Verify Polish Style",
  );

  await page.click('[data-testid="submit-style"]');
  await page.waitForURL("**/library/verify-polish-style", { timeout: 20000 });
  record(
    "调色页保存后入库并清掉 pending",
    !readPending().some((item) => item.id === polishItem.id) &&
      JSON.parse(fs.readFileSync(STYLES_PATH, "utf8")).some(
        (style: { id: string }) => style.id === "verify-polish-style",
      ),
  );

  await page.goto(`${BASE}/pending`, { waitUntil: "networkidle" });
  record(
    "三条候选全部处理完后队列为空",
    (await page.locator('[data-testid="pending-row"]').count()) === 0,
  );
} finally {
  fs.writeFileSync(PENDING_PATH, pendingBefore, "utf8");
  fs.writeFileSync(STYLES_PATH, stylesBefore, "utf8");
}

// ---------- G. 用量 / 溢出 / console ----------

const usageResponse = await context.request.get(`${BASE}/api/usage`);
const usageBody = await usageResponse.json();
record(
  "用量统计接口能读出 token 总量",
  usageResponse.status() === 200 &&
    usageBody.ok === true &&
    typeof usageBody.usage.totalTokens === "number" &&
    usageBody.usage.calls >= 1,
  `${usageBody.usage?.calls} 次 / ${usageBody.usage?.totalTokens} tokens`,
);

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
  consoleErrors.filter((message) => !/status of 4\d\d/.test(message)).length === 0,
  consoleErrors.slice(0, 2).join(" | "),
);

await browser.close();

// ---------- H. 还原与校验 ----------

restoreAll();
record(
  "测试结束已还原 upstreams / pending / styles",
  fs.readFileSync(CONFIG_PATH, "utf8") === configBefore &&
    fs.readFileSync(PENDING_PATH, "utf8") === pendingBefore &&
    fs.readFileSync(STYLES_PATH, "utf8") === stylesBefore,
);
record(
  "pending 恢复后仍通过 schema",
  pendingSchema.safeParse(readPending()).success,
  `${readPending().length} 条`,
);

let finalValidate = true;
try {
  execSync("npm run validate", { encoding: "utf8", stdio: "pipe" });
} catch {
  finalValidate = false;
}
record("还原后 npm run validate 通过", finalValidate);

fs.rmSync(tmp, { recursive: true, force: true });

const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) {
  console.log(`✗ ${failed.length}/${results.length} 项未通过`);
  process.exit(1);
}
console.log(`✓ 全部 ${results.length} 项通过`);
