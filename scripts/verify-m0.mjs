// REAL DATA GUARD：只允许通过 npm run verify:all（隔离 Vault）运行。
// 直接运行会触碰真实 data/，必须显式设置 ALLOW_REAL_DATA=1 才放行。
if (!process.env.DESIGN_VAULT_HOME && process.env.ALLOW_REAL_DATA !== "1") {
  console.error("拒绝直接运行：请使用 npm run verify:all（隔离临时 Vault）。若确需直接跑，设置 ALLOW_REAL_DATA=1。");
  process.exit(1);
}

/**
 * M0 验收自检：node scripts/verify-m0.mjs
 * 用本机 Edge（channel: msedge）逐条跑 9.3 的可验证项：
 *   - 三个页面的横向溢出（1280 / 375）
 *   - 零圆角（computed border-radius 全为 0）
 *   - 米白底 + 炭黑字
 *   - 三个复制按钮写入剪贴板的内容合法性（CSS 可解析 / Tailwind 是合法 JS / 提示词逐字一致）
 *   - 页面无 console error
 * 需要 dev server 已在 http://localhost:3000 运行。
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const DETAIL = "/library/nasa-punk-industrial-console";

const results = [];
const record = (name, ok, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

const styles = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "styles.json"), "utf8"));
const seed = styles[0];

/** Windows 剪贴板以 CRLF 存储换行，比对文本前先归一化。 */
const normalize = (value) => value.replace(/\r\n/g, "\n");

const browser = await chromium.launch({ channel: "msedge" });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
const page = await context.newPage();

const consoleErrors = [];
page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(`pageerror: ${error.message}`));

// ---------- 1. 列表页 ----------
await page.goto(`${BASE}/library`, { waitUntil: "networkidle" });
record(
  "列表页渲染 NASA-Punk 记录",
  (await page.getByRole("heading", { name: seed.name }).count()) > 0,
);

// ---------- 2. 详情页 ----------
await page.goto(`${BASE}${DETAIL}`, { waitUntil: "networkidle" });

for (const [label, text] of [
  ["名称", seed.name],
  ["适用项目", "作品集"],
  ["不适用项目", "电商"],
  ["前端提示词片段", seed.frontend_prompt.slice(0, 24)],
  ["性能备注", seed.performance_notes.slice(0, 12)],
  ["token (hazard_stripe)", seed.tokens.hazard_stripe],
]) {
  record(`详情页包含${label}`, (await page.getByText(text, { exact: false }).count()) > 0);
}
record(
  "详情页展示全部 identity_colors",
  (await page.locator("text=#4C5A68").count()) > 0 &&
    (await page.locator("text=#A8432F").count()) > 0,
);

// ---------- 3. 复制面板（真实读剪贴板）----------
async function clickCopy(labelPattern) {
  const button = page.locator("button", { hasText: labelPattern }).first();
  await button.click();
  await page.waitForTimeout(150);
  return page.evaluate(() => navigator.clipboard.readText());
}

const cssText = await clickCopy("CSS Variables");
const twText = await clickCopy("Tailwind config");
const promptText = await clickCopy("前端提示词");

const cssCheck = await page.evaluate((css) => {
  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    const root = sheet.cssRules[0];
    return {
      ok: sheet.cssRules.length === 1 && root.selectorText === ":root" && root.style.length > 8,
      vars: root?.style.length ?? 0,
    };
  } catch (error) {
    return { ok: false, vars: 0, error: String(error) };
  }
}, cssText);
record("复制 CSS Variables → 合法 :root", cssCheck.ok, `${cssCheck.vars} 个自定义属性`);

let twOk = true;
let twError = "";
try {
  new Function("module", "exports", twText);
} catch (error) {
  twOk = false;
  twError = String(error);
}
record(
  "复制 Tailwind config → 合法 JS 且含 theme.extend",
  twOk && twText.includes("theme") && twText.includes("extend"),
  twError,
);

record(
  "复制前端提示词 → 与 frontend_prompt 逐字一致",
  normalize(promptText) === normalize(seed.frontend_prompt),
  `${normalize(promptText).length} 字符（Windows 剪贴板会把 LF 存成 CRLF，比对前统一换行符）`,
);

// ---------- 4. 视觉特征 ----------
const visual = await page.evaluate(() => {
  const radii = new Set();
  document.querySelectorAll("body *").forEach((el) => {
    const radius = getComputedStyle(el).borderRadius;
    if (radius && radius !== "0px") radii.add(radius);
  });
  const bodyStyle = getComputedStyle(document.body);
  return {
    radii: [...radii],
    bg: bodyStyle.backgroundColor,
    color: bodyStyle.color,
    hazard: document.querySelectorAll(".hazard").length,
    rivets: document.querySelectorAll(".rivet").length,
  };
});
record("全站零圆角", visual.radii.length === 0, visual.radii.join(","));
record("米白底 #ECE5D6", visual.bg === "rgb(236, 229, 214)", visual.bg);
record("炭黑文字 #191919", visual.color === "rgb(25, 25, 25)", visual.color);
record("警示斜纹带存在", visual.hazard > 0, `${visual.hazard} 处`);
record("铆钉角标存在", visual.rivets > 0, `${visual.rivets} 处`);

// ---------- 5. 横向溢出 ----------
const routes = ["/", "/library", DETAIL, "/pending"];
for (const width of [1280, 375]) {
  await page.setViewportSize({ width, height: 900 });
  for (const route of routes) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    record(
      `${route} @${width}px 无横向溢出`,
      overflow.scroll <= overflow.client,
      `scrollWidth=${overflow.scroll} clientWidth=${overflow.client}`,
    );
  }
}

// ---------- 6. console ----------
record("无 console error / pageerror", consoleErrors.length === 0, consoleErrors.slice(0, 2).join(" | "));

await browser.close();

const failed = results.filter((item) => !item.ok);
console.log("");
if (failed.length > 0) {
  console.log(`✗ ${failed.length}/${results.length} 项未通过`);
  process.exit(1);
}
console.log(`✓ 全部 ${results.length} 项通过`);
