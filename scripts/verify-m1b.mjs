// REAL DATA GUARD：只允许通过 npm run verify:all（隔离 Vault）运行。
// 直接运行会触碰真实 data/，必须显式设置 ALLOW_REAL_DATA=1 才放行。
if (!process.env.DESIGN_VAULT_HOME && process.env.ALLOW_REAL_DATA !== "1") {
  console.error("拒绝直接运行：请使用 npm run verify:all（隔离临时 Vault）。若确需直接跑，设置 ALLOW_REAL_DATA=1。");
  process.exit(1);
}

/**
 * M1b 验收自检：node scripts/verify-m1b.mjs
 * 覆盖：调色器实时性 / 锚点阶 / OKLCH ΔL 均匀 / 低对比标红 / 预览联动 /
 *       带色阶的导出 / 新建非法被拒 / 新建合法入库 / 编辑保存 / 375 可操作 / 溢出。
 * 会临时写入 data/styles.json，结束（含异常）一定还原。
 * 需要 dev server 在 http://localhost:3000。
 */
import { chromium } from "playwright";
import { oklch } from "culori";
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

const stylesBefore = fs.readFileSync(STYLES_PATH, "utf8");
const draftsBefore = fs.readFileSync(DRAFTS_PATH, "utf8");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

// 独立实现一遍 WCAG，用来交叉验证页面上的比值
function luminance(hex) {
  const rgb = hex
    .replace("#", "")
    .match(/../g)
    .map((pair) => parseInt(pair, 16) / 255)
    .map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function variance(values) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
}

// 单元测试必须也是绿的
let unitOk = true;
let unitTail = "";
try {
  const output = execSync("npm run test:color", { encoding: "utf8", stdio: "pipe" });
  unitTail = output.trim().split("\n").pop() ?? "";
} catch (error) {
  unitOk = false;
  unitTail = String(error.stdout ?? error.message).slice(-200);
}
record("lib/color.ts 单元测试通过", unitOk, unitTail);

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
const NEW_STYLE_ID = "m1b-verify-style";
const NEW_STYLE_NAME = "M1b 验收风格";
const EDITED_NAME = "M1b 验收风格（改过）";

try {
  // ---------- 1. 调色器结构 ----------
  await page.goto(`${BASE}/library/new`, { waitUntil: "networkidle" });
  const slotCount = await page.locator('[data-testid^="palette-row-"]').count();
  record("新建页内嵌完整调色器（7 个语义槽）", slotCount === 7, `${slotCount} 槽`);

  // ---------- 2. 改 primary → 色阶实时更新 + 锚点 ----------
  await page.fill('[data-testid="palette-hex-primary"]', "#0570DE");
  await page.waitForFunction(
    () => document.querySelectorAll('[data-testid="scale-item"]').length === 10,
    undefined,
    { timeout: 5000 },
  );

  const scale = await page.$$eval('[data-testid="scale-item"]', (nodes) =>
    nodes.map((node) => ({
      step: Number(node.getAttribute("data-step")),
      hex: node.getAttribute("data-hex") ?? "",
    })),
  );
  record("色阶为完整的 50–900 共 10 阶", scale.length === 10, scale.map((s) => s.step).join("/"));

  const anchor = scale.find((item) => item.hex.toUpperCase() === "#0570DE");
  record(
    "锚点阶精确等于输入值",
    Boolean(anchor) && anchor.hex === "#0570DE",
    `锚点 ${anchor?.step ?? "?"} = ${anchor?.hex ?? "-"}`,
  );

  // ---------- 3. OKLCH ΔL 均匀 ----------
  const lightness = scale.map((item) => oklch(item.hex).l);
  const deltas = lightness.slice(1).map((value, index) => lightness[index] - value);
  const spread = variance(deltas);
  record(
    "OKLCH 相邻阶 ΔL 均匀（方差 < 1e-4）",
    spread < 1e-4,
    `ΔL≈${(deltas.reduce((a, b) => a + b, 0) / deltas.length).toFixed(4)} · 方差 ${spread.toExponential(2)}`,
  );

  // ---------- 4. 低对比标红 ----------
  await page.fill('[data-testid="palette-hex-text"]', "#CFC8B8");
  const row = page.locator('[data-check="text-bg"]');
  const pass = await row.getAttribute("data-pass");
  const shown = Number(await row.getAttribute("data-ratio"));
  const expected = contrast("#CFC8B8", "#ECE5D6");
  const rowText = (await row.innerText()).replace(/\s+/g, " ").trim();
  record(
    "低对比 text/bg 判为不通过并标红",
    pass === "false" && (await row.locator(".text-\\[\\#B3261E\\]").count()) > 0,
    rowText,
  );
  record(
    "显示实际比值且与 WCAG 公式一致",
    Math.abs(shown - expected) < 0.01 && rowText.includes("< 4.5"),
    `页面 ${shown}:1 / 公式 ${expected.toFixed(2)}:1`,
  );

  // ---------- 5. 预览联动 ----------
  const previewBg = await page.$eval(
    '[data-testid="preview-button"]',
    (el) => getComputedStyle(el).backgroundColor,
  );
  record(
    "小组件预览跟随 primary 实时更新",
    previewBg === "rgb(5, 112, 222)",
    previewBg,
  );
  const previewBorder = await page.$eval(
    '[data-testid="preview-card"]',
    (el) => getComputedStyle(el).backgroundColor,
  );
  record("预览卡片使用 surface 色", previewBorder === "rgb(255, 255, 255)", previewBorder);

  // ---------- 6. 导出（含色阶）----------
  async function clickCopy(containerTestId) {
    await page.locator(`[data-testid="${containerTestId}"] button`).first().click();
    await page.waitForTimeout(160);
    return page.evaluate(() => navigator.clipboard.readText());
  }

  const cssText = await clickCopy("export-css");
  const twText = await clickCopy("export-tailwind");
  const jsonText = await clickCopy("export-json");

  const cssCheck = await page.evaluate((css) => {
    try {
      const sheet = new CSSStyleSheet();
      sheet.replaceSync(css);
      const root = sheet.cssRules[0];
      return { ok: root?.selectorText === ":root", vars: root?.style.length ?? 0 };
    } catch {
      return { ok: false, vars: 0 };
    }
  }, cssText);
  record(
    "导出 CSS 可解析且含完整色阶",
    cssCheck.ok && cssText.includes("--color-primary-500") && cssCheck.vars >= 60,
    `${cssCheck.vars} 个变量`,
  );

  let twOk = true;
  try {
    new Function("module", "exports", twText);
  } catch {
    twOk = false;
  }
  record(
    "导出 Tailwind 可编译且含完整色阶",
    twOk && /"500":\s*"#0570DE"/.test(twText),
    twOk ? '"500": "#0570DE" 存在' : "编译失败",
  );

  let jsonKeys = 0;
  try {
    jsonKeys = Object.keys(JSON.parse(jsonText)).length;
  } catch {
    jsonKeys = 0;
  }
  record("导出 palette JSON 可解析", jsonKeys === 7, `${jsonKeys} 个键`);

  // ---------- 7. 表单非法提交 → 服务端字段错误 ----------
  await page.fill('[data-testid="style-id"]', "Bad ID");
  await page.fill('[data-testid="style-name"]', "Invalid");
  await page.fill('[data-testid="style-prompt"]', "测试");
  await page.fill('[data-testid="style-tags"]', "test");
  await page.fill('[data-testid="style-components"]', "button=1px");
  await page.click('[data-testid="submit-style"]');
  await page.waitForSelector('[data-testid="form-errors"]', { timeout: 8000 });
  const inlineErrors = await page.locator('[data-testid="form-errors"]').innerText();
  record(
    "非法数据被服务端拒绝并显示字段路径",
    /id:.*kebab-case/.test(inlineErrors),
    inlineErrors.replace(/\s+/g, " ").slice(0, 120),
  );

  // ---------- 8. 服务端 API 拒绝 + 合法创建 ----------
  const badCreate = await context.request.post(`${BASE}/api/styles`, {
    data: { id: "Bad ID", name: "x" },
  });
  const badBody = await badCreate.json();
  record(
    "POST /api/styles 非法体返回 400 + issues",
    badCreate.status() === 400 && Array.isArray(badBody.issues) && badBody.issues.length > 0,
    badBody.issues?.[0],
  );

  const payload = {
    id: NEW_STYLE_ID,
    name: NEW_STYLE_NAME,
    sources: [{ type: "manual", url: "", upstream: "", video: "" }],
    original_prompt: "",
    prompt_type: "manual",
    frontend_prompt: "验收用提示词：1px 炭黑边、零圆角、米白底。",
    suitable_projects: ["dashboard"],
    unsuitable_projects: [],
    project_tags: ["technical", "clean"],
    palette: {
      primary: "#0570DE",
      bg: "#FFFFFF",
      surface: "#F6F8FA",
      text: "#1F2328",
      muted: "#59636E",
    },
    palette_source: "manual",
    identity_colors: ["#0570DE"],
    typography: { heading: "Inter", body: "Noto Sans SC", scale: "12/14/16/20/28/40" },
    tokens: { radius: "4px", border: "1px solid #D1D9E0", shadow: "none", spacing: "4/8/12/16/24" },
    components: { button: "1px 边、4px 圆角" },
    performance_notes: "无",
    confidence: 0.8,
  };

  const created = await context.request.post(`${BASE}/api/styles`, { data: payload });
  const createdBody = await created.json();
  record("POST /api/styles 合法体创建成功", created.status() === 200, `id ${createdBody.id}`);

  await page.goto(`${BASE}/library`, { waitUntil: "networkidle" });
  record(
    "新条目出现在已确认 tab",
    (await page.getByRole("heading", { name: NEW_STYLE_NAME }).count()) > 0,
  );

  let createValidateOk = true;
  try {
    execSync("npm run validate", { encoding: "utf8", stdio: "pipe" });
  } catch {
    createValidateOk = false;
  }
  record("新条目写入后 npm run validate 通过", createValidateOk);

  // ---------- 9. 编辑保存（走 UI + 后端）----------
  await page.goto(`${BASE}/library/${NEW_STYLE_ID}/edit`, { waitUntil: "networkidle" });
  record(
    "详情可进入编辑页且调色器带初始值",
    (await page.locator('[data-testid="palette-editor"]').count()) === 1 &&
      (await page.inputValue('[data-testid="palette-hex-primary"]')) === "#0570DE",
  );

  await page.fill('[data-testid="style-name"]', EDITED_NAME);
  await page.fill('[data-testid="palette-hex-primary"]', "#7C3AED");
  await page.click('[data-testid="submit-style"]');
  await page.waitForURL(`**/library/${NEW_STYLE_ID}`, { timeout: 15000 });
  const detailHeading = await page.locator("h1").innerText();
  record("编辑保存后详情页显示新值", detailHeading.includes(EDITED_NAME), detailHeading);

  const saved = readJson(STYLES_PATH).find((style) => style.id === NEW_STYLE_ID);
  record(
    "编辑结果落到 styles.json 且颜色已更新",
    saved?.name === EDITED_NAME && saved?.palette.primary === "#7C3AED",
    `${saved?.name} · ${saved?.palette.primary}`,
  );

  let editValidateOk = true;
  try {
    execSync("npm run validate", { encoding: "utf8", stdio: "pipe" });
  } catch {
    editValidateOk = false;
  }
  record("编辑保存后 npm run validate 通过", editValidateOk);

  // ---------- 10. 375 可操作 + 无溢出 ----------
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}/library/new`, { waitUntil: "networkidle" });
  await page.fill('[data-testid="palette-hex-primary"]', "#0F62FE");
  const mobileScale = await page.locator('[data-testid="scale-item"]').count();
  const mobileAnchor = await page.$$eval('[data-testid="scale-item"]', (nodes) =>
    nodes.map((node) => node.getAttribute("data-hex")),
  );
  record(
    "375 下调色器可操作（色阶随输入更新）",
    mobileScale === 10 && mobileAnchor.includes("#0F62FE"),
    `${mobileScale} 阶 · 锚点 ${mobileAnchor.includes("#0F62FE") ? "ok" : "missing"}`,
  );

  for (const width of [1280, 375]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/library/new", `/library/${NEW_STYLE_ID}/edit`]) {
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
} catch (error) {
  crashed = error;
} finally {
  fs.writeFileSync(STYLES_PATH, stylesBefore, "utf8");
  fs.writeFileSync(DRAFTS_PATH, draftsBefore, "utf8");
}

if (crashed) {
  record("测试执行未中断", false, String(crashed).slice(0, 240));
}

// ---------- 11. 还原与收尾 ----------
record(
  "测试结束已还原数据文件",
  fs.readFileSync(STYLES_PATH, "utf8") === stylesBefore &&
    fs.readFileSync(DRAFTS_PATH, "utf8") === draftsBefore,
);

let finalValidateOk = true;
try {
  execSync("npm run validate", { encoding: "utf8", stdio: "pipe" });
} catch {
  finalValidateOk = false;
}
record("还原后 npm run validate 通过", finalValidateOk);

// 负向测试（故意提交非法数据）会在控制台留下 400 的 Resource 错误，属于预期噪声
const unexpectedErrors = consoleErrors.filter(
  (message) => !/status of 400 \(Bad Request\)/.test(message),
);
record(
  "无意外 console error / pageerror",
  unexpectedErrors.length === 0,
  unexpectedErrors.length > 0
    ? unexpectedErrors.slice(0, 2).join(" | ")
    : `预期内的 400 噪声 ${consoleErrors.length - unexpectedErrors.length} 条已忽略`,
);

await browser.close();

const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) {
  console.log(`✗ ${failed.length}/${results.length} 项未通过`);
  process.exit(1);
}
console.log(`✓ 全部 ${results.length} 项通过`);
