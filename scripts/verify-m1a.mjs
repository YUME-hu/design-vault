/**
 * M1a 验收自检：node scripts/verify-m1a.mjs
 * 覆盖：草案 tab / 官方文档链接 / 确认入库（含 validate）/ 确定性 / 结果页结构 /
 *       复制面板内容 / 1280 与 375 横向溢出 / 服务端校验拒绝。
 * 会临时改动 data/styles.json 与 data/styles.draft.json，测试结束（含异常）一定还原。
 * 需要 dev server 已在 http://localhost:3000 运行。
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const STYLES_PATH = path.join(process.cwd(), "data", "styles.json");
const DRAFTS_PATH = path.join(process.cwd(), "data", "styles.draft.json");

const results = [];
const record = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

const normalize = (value) => value.replace(/\r\n/g, "\n");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

const stylesBefore = fs.readFileSync(STYLES_PATH, "utf8");
const draftsBefore = fs.readFileSync(DRAFTS_PATH, "utf8");

// 幂等：草案为空时写入一条 fixture（克隆现有风格），测试结束统一还原
if (JSON.parse(draftsBefore).length === 0) {
  const confirmedStyles = JSON.parse(stylesBefore);
  if (confirmedStyles.length > 0) {
    const base = confirmedStyles.find((style) => (style.sources?.[0]?.url ?? "").startsWith("https")) ?? confirmedStyles[0];
    const fixture = {
      ...base,
      id: "m1a-fixture-draft",
      name: `${base.name}（fixture）`,
    };
    fs.writeFileSync(DRAFTS_PATH, JSON.stringify([fixture], null, 2) + "\n", "utf8");
    console.log("（草案为空，已写入 fixture：m1a-fixture-draft）");
  }
}

const profile = {
  projectType: "dashboard",
  targetUser: "developer",
  keywords: ["technical", "data-dense"],
  pageType: "app",
  colorMode: "light",
};
const resultQuery = new URLSearchParams({
  projectType: profile.projectType,
  targetUser: profile.targetUser,
  pageType: profile.pageType,
  colorMode: profile.colorMode,
  keywords: profile.keywords.join(","),
}).toString();
const resultUrl = `${BASE}/result?${resultQuery}`;

const browser = await chromium.launch({ channel: "msedge" });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

let crashed = null;

try {
  // ---------- 1. 两个 tab ----------
  await page.goto(`${BASE}/library`, { waitUntil: "networkidle" });
  record(
    "已确认 tab 显示 NASA-Punk",
    (await page.getByRole("heading", { name: "NASA-Punk 工业控制台" }).count()) > 0,
  );
  const confirmedTabText = await page.locator('[data-testid="tab-confirmed"]').innerText();
  const draftTabText = await page.locator('[data-testid="tab-draft"]').innerText();
  const pad3 = (n) => String(n).padStart(3, "0");
  record(
    "tab 计数与数据文件一致",
    confirmedTabText.includes(pad3(JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "styles.json"), "utf8")).length)) &&
      draftTabText.includes(pad3(JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "styles.draft.json"), "utf8")).length)),
    `${confirmedTabText.replace(/\s+/g, " ")} | ${draftTabText.replace(/\s+/g, " ")}`,
  );

  // ---------- 2. 草案 tab ----------
  await page.goto(`${BASE}/library?tab=draft`, { waitUntil: "networkidle" });
  const draftRows = page.locator('[data-testid="draft-row"]');
  const draftCount = await draftRows.count();
  record("草案 tab 数量与数据一致", draftCount === JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "styles.draft.json"), "utf8")).length, `${draftCount} 条`);

  const draftIds = await draftRows.evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute("data-draft-id")),
  );
  record("草案 id 互不相同", new Set(draftIds).size === draftIds.length, draftIds.join(", "));

  const links = await draftRows.evaluateAll((nodes) =>
    nodes.map((row) => {
      const anchor = row.querySelector('[data-testid="draft-source-link"]');
      return {
        id: row.getAttribute("data-draft-id"),
        href: anchor?.getAttribute("href") ?? "",
        text: (anchor?.textContent ?? "").replace(/\s+/g, " ").trim(),
      };
    }),
  );
  record(
    "每条草案都带官方文档链接（https）",
    links.length === draftIds.length && links.every((item) => /^https:\/\//.test(item.href)),
    links.map((item) => `${item.id} → ${item.href ? new URL(item.href).hostname : "—"}`).join(" | "),
  );

  // ---------- 3. 确认入库（走真实 UI 点击）----------
  const firstId = draftIds[0];
  const confirmedName = readJson(DRAFTS_PATH).find((style) => style.id === firstId)?.name ?? "";
  const confirmedBefore = readJson(STYLES_PATH).length;
  const draftsBeforeCount = readJson(DRAFTS_PATH).length;

  await page.locator(`[data-testid="confirm-draft"][data-draft-id="${firstId}"]`).click();
  const expectedDraftsAfter = draftsBeforeCount - 1;
  await page.waitForFunction(
    (expected) => document.querySelectorAll('[data-testid="draft-row"]').length === expected,
    expectedDraftsAfter,
    { timeout: 20000 },
  );

  const stylesAfter = readJson(STYLES_PATH);
  const draftsAfter = readJson(DRAFTS_PATH);
  record(
    "确认后从 draft 消失",
    !draftsAfter.some((style) => style.id === firstId) &&
      draftsAfter.length === draftsBeforeCount - 1,
    `${firstId} · draft ${draftsBeforeCount} → ${draftsAfter.length}`,
  );
  record(
    "确认后出现在 styles.json",
    stylesAfter.some((style) => style.id === firstId) &&
      stylesAfter.length === confirmedBefore + 1,
    `styles ${confirmedBefore} → ${stylesAfter.length}`,
  );

  await page.goto(`${BASE}/library`, { waitUntil: "networkidle" });
  record(
    "已确认 tab 能看到新条目",
    confirmedName.length > 0 &&
      (await page.getByRole("heading", { name: confirmedName }).count()) > 0,
    confirmedName,
  );

  let validateOk = true;
  let validateTail = "";
  try {
    execSync("npm run validate", { encoding: "utf8", stdio: "pipe" });
  } catch (error) {
    validateOk = false;
    validateTail = String(error.stdout ?? error.message).slice(-240);
  }
  record("确认后 styles.json 通过 npm run validate", validateOk, validateOk ? "validate 退出码 0" : validateTail);

  // ---------- 4. 确定性 ----------
  const first = await context.request.post(`${BASE}/api/recommend`, { data: profile });
  const firstBody = await first.json();
  const second = await context.request.post(`${BASE}/api/recommend`, { data: profile });
  const secondBody = await second.json();
  record(
    "同一画像连续两次请求结果完全一致",
    first.status() === 200 &&
      second.status() === 200 &&
      JSON.stringify(firstBody) === JSON.stringify(secondBody),
    `${firstBody.results?.length ?? 0} 条结果 · 首位 ${firstBody.results?.[0]?.style?.id}`,
  );

  // ---------- 5. 结果页 ----------
  await page.goto(resultUrl, { waitUntil: "networkidle" });
  record(
    "结果页有 1 条主推荐",
    (await page.locator('[data-testid="main-recommendation"]').count()) === 1,
  );
  record(
    "结果页有 2 条备选",
    (await page.locator('[data-testid="alternate-card"]').count()) === 2,
  );

  const mainTags = await page
    .locator('[data-testid="main-recommendation"] [data-testid="matched-tag"]')
    .count();
  record("主推荐显示命中标签", mainTags >= 1, `${mainTags} 个标签`);

  const altTagCounts = await page
    .locator('[data-testid="alternate-card"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => node.querySelectorAll('[data-testid="matched-tag"]').length),
    );
  record(
    "每条备选都显示命中标签",
    altTagCounts.length === 2 && altTagCounts.every((count) => count >= 1),
    altTagCounts.join(" / "),
  );

  const digestFirst = await page.locator('[data-testid="result-digest"]').innerText();
  await page.reload({ waitUntil: "networkidle" });
  const digestSecond = await page.locator('[data-testid="result-digest"]').innerText();
  record("同输入两次加载结果指纹一致", digestFirst === digestSecond, digestFirst);

  // ---------- 6. 复制面板 ----------
  async function clickCopy(label) {
    await page.locator("button", { hasText: label }).first().click();
    await page.waitForTimeout(160);
    return page.evaluate(() => navigator.clipboard.readText());
  }

  const cssText = await clickCopy("CSS Variables");
  const tailwindText = await clickCopy("Tailwind config");
  const promptText = await clickCopy("前端提示词");

  const cssCheck = await page.evaluate((css) => {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      const root = sheet.cssRules[0];
      return { ok: root?.selectorText === ":root" && root.style.length > 6, vars: root?.style.length ?? 0 };
    } catch {
      return { ok: false, vars: 0 };
    }
  }, cssText);
  record("复制 CSS Variables 合法", cssCheck.ok, `${cssCheck.vars} 个变量`);

  let tailwindOk = true;
  try {
    new Function("module", "exports", tailwindText);
  } catch {
    tailwindOk = false;
  }
  record(
    "复制 Tailwind config 合法且含 theme.extend",
    tailwindOk && tailwindText.includes("extend"),
  );

  const mainId = (await page.locator('[data-testid="main-style-id"]').innerText()).trim();
  const mainStyle = [...readJson(STYLES_PATH), ...readJson(DRAFTS_PATH)].find(
    (style) => style.id === mainId,
  );
  record(
    "复制提示词 = 主推荐的 frontend_prompt",
    Boolean(mainStyle) && normalize(promptText) === normalize(mainStyle.frontend_prompt),
    `${mainId} · ${normalize(promptText).length} 字符`,
  );

  // ---------- 7. 横向溢出 ----------
  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/", "/library", "/library?tab=draft", `/result?${resultQuery}`]) {
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

  // ---------- 8. 服务端校验 ----------
  const badProfile = await context.request.post(`${BASE}/api/recommend`, {
    data: { projectType: "not-a-project" },
  });
  record("非法画像被服务端拒绝（400）", badProfile.status() === 400, `status ${badProfile.status()}`);

  const unknownDraft = await context.request.post(`${BASE}/api/drafts/confirm`, {
    data: { id: "not-a-draft" },
  });
  record("不存在的草案返回 404", unknownDraft.status() === 404, `status ${unknownDraft.status()}`);

  const emptyBody = await context.request.post(`${BASE}/api/drafts/confirm`, { data: {} });
  record("确认接口缺 id 返回 400", emptyBody.status() === 400, `status ${emptyBody.status()}`);

  const getRecommend = await context.request.get(`${BASE}/api/recommend`);
  record("GET /api/recommend 返回 405", getRecommend.status() === 405, `status ${getRecommend.status()}`);
} catch (error) {
  crashed = error;
} finally {
  fs.writeFileSync(STYLES_PATH, stylesBefore, "utf8");
  fs.writeFileSync(DRAFTS_PATH, draftsBefore, "utf8");
}

if (crashed) {
  record("测试执行未中断", false, String(crashed).slice(0, 240));
}

// ---------- 9. 还原与收尾 ----------
const stylesRestored = fs.readFileSync(STYLES_PATH, "utf8") === stylesBefore;
const draftsRestored = fs.readFileSync(DRAFTS_PATH, "utf8") === draftsBefore;
record("测试结束已还原两个数据文件", stylesRestored && draftsRestored);

await page.goto(`${BASE}/library?tab=draft`, { waitUntil: "networkidle" });
record(
  "还原后草案数量与测试前一致",
  (await page.locator('[data-testid="draft-row"]').count()) === JSON.parse(draftsBefore).length,
);

let finalValidateOk = true;
try {
  execSync("npm run validate", { encoding: "utf8", stdio: "pipe" });
} catch {
  finalValidateOk = false;
}
record("还原后 npm run validate 通过", finalValidateOk);

record("无 console error / pageerror", consoleErrors.length === 0, consoleErrors.slice(0, 2).join(" | "));

await browser.close();

const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) {
  console.log(`✗ ${failed.length}/${results.length} 项未通过`);
  process.exit(1);
}
console.log(`✓ 全部 ${results.length} 项通过`);
