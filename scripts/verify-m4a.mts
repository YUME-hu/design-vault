// REAL DATA GUARD：只允许通过 npm run verify:all（隔离 Vault）运行。
// 直接运行会触碰真实 data/，必须显式设置 ALLOW_REAL_DATA=1 才放行。
if (!process.env.DESIGN_VAULT_HOME && process.env.ALLOW_REAL_DATA !== "1") {
  console.error("拒绝直接运行：请使用 npm run verify:all（隔离临时 Vault）。若确需直接跑，设置 ALLOW_REAL_DATA=1。");
  process.exit(1);
}

import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { mapEffects } from "@design-vault/adapters/ingest/deepseek";
import { approvePending } from "@design-vault/adapters/ingest/pending-actions";
import { readEffectsFile } from "@design-vault/adapters/data";
import { pendingItemSchema } from "@design-vault/adapters/schema";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const E = path.join(process.cwd(), "data", "effects.json");
const P = path.join(process.cwd(), "data", "pending.json");
const S = path.join(process.cwd(), "data", "styles.json");
const before = { e: fs.readFileSync(E, "utf8"), p: fs.readFileSync(P, "utf8"), s: fs.readFileSync(S, "utf8") };
const baseEffects = (JSON.parse(before.e) as unknown[]).length;
const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => { results.push({ name, ok, detail }); console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`); };

// 1) 提取映射
const mapped = mapEffects([
  { name: "两列网格", tech_stack: ["CSS Grid", "Tailwind"], description: "grid-cols-2 + gap" },
  { name: "", description: "没有名字" },
  { name: "视差", tech_stack: ["GSAP"], description: "ScrollTrigger", code_snippet: "gsap.to()" },
]);
record("extracted_effects 解析：过滤坏项、保留技术栈", mapped.length === 2 && mapped[1].tech_stack[0] === "GSAP", mapped.map((m) => m.name).join(","));

// 2) 审核入库 + 双向关联
const pending = pendingItemSchema.parse({
  id: "ffffffff-0000-4000-8000-ffffffffffff",
  status: "pending",
  created_at: "2026-10-28",
  confidence: 0.6,
  sources: [{ type: "bilibili-search", url: "https://github.com/x/y", upstream: "UP (1)", video: "BVM4A" }],
  upstream_name: "UP",
  video_title: "M4a 视频",
  name: "Verify Effects Style",
  candidate: { name: "Verify Effects Style", frontend_prompt: "零圆角", project_tags: ["industrial"] },
  color_direction: null,
  duplicate_of: null,
  extracted_effects: [
    { name: "两列网格", tech_stack: ["CSS Grid"], description: "grid-cols-2", code_snippet: "", performance_notes: "" },
    { name: "视差", tech_stack: ["GSAP"], description: "ScrollTrigger", code_snippet: "gsap.to()", performance_notes: "" },
  ],
  reasoning: "",
  notes: "",
  raw_response: "{}",
});
fs.writeFileSync(P, JSON.stringify([pending], null, 2) + "\n");
const approved = approvePending(pending.id);
const effects = readEffectsFile();
const styles = JSON.parse(fs.readFileSync(S, "utf8")) as { id: string; related_effects: string[] }[];
const style = styles.find((s) => s.id === "verify-effects-style");
record(
  "通过入库：effects 写入 + 双向关联",
  approved.ok && effects.length === baseEffects + 2 && style?.related_effects.length === 2 && effects.filter((e) => e.related_styles.includes("verify-effects-style")).length === 2,
  `effects ${effects.length} · related ${style?.related_effects.length}`,
);

// 2b) 入库后 /effects 真实渲染
const effectsHtml = await (await fetch(`${BASE}/effects`)).text();
record(
  "入库后 /effects 页面能渲染提取出的方案",
  effectsHtml.includes("两列网格") && effectsHtml.includes("视差"),
  `html ${effectsHtml.length} 字符`,
);

// 3) /effects 页面 + CRUD
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors: string[] = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const context = page.context();

await page.goto(`${BASE}/effects`, { waitUntil: "networkidle" });
const cards = await page.locator('[data-testid="effect-card"]').count();
  const listText = await page.locator('[data-testid="effect-list"]').innerText();
  record(
    "/effects 有新建入口且列表渲染 + 技术栈过滤",
    (await page.locator('[data-testid="new-effect-link"]').count()) === 1 &&
      cards === baseEffects + 2 &&
      listText.includes("两列网格") &&
      listText.includes("GSAP"),
    `${cards} cards`,
  );

const created = await context.request.post(`${BASE}/api/effects`, {
  data: { name: "Verify CRUD Effect", tech_stack: ["Framer Motion"], description: "layout 动画", code_snippet: "motion.div", performance_notes: "" },
});
const createdJson = await created.json();
record("新建 effect API", created.ok() && createdJson.ok, createdJson.effect?.id);

const updated = await context.request.put(`${BASE}/api/effects`, {
  data: { ...createdJson.effect, description: "改过的实现思路" },
});
record("编辑 effect API", updated.ok() && (await updated.json()).effect.description === "改过的实现思路");

await page.goto(`${BASE}/effects?tech=Framer%20Motion`, { waitUntil: "networkidle" });
record("按技术栈过滤", (await page.locator('[data-testid="effect-card"]').count()) === 1);

await page.goto(`${BASE}/effects?q=CRUD`, { waitUntil: "networkidle" });
record("关键词搜索名称", (await page.locator('[data-testid="effect-card"]').count()) === 1, await page.locator('[data-testid="effect-card"] h2').innerText().catch(() => ""));

await page.goto(`${BASE}/effects?q=改过的实现思路`, { waitUntil: "networkidle" });
record("关键词搜索描述", (await page.locator('[data-testid="effect-card"]').count()) === 1);

await page.goto(`${BASE}/effects?q=Framer%20Motion`, { waitUntil: "networkidle" });
record("关键词搜索技术栈", (await page.locator('[data-testid="effect-card"]').count()) === 1);

// 4) 详情页关联区块
await page.goto(`${BASE}/library/verify-effects-style`, { waitUntil: "networkidle" });
record("风格详情展示配套技术方案", (await page.locator('[data-testid="related-effects"]').count()) === 1, await page.locator('[data-testid="related-effects"]').innerText().then((t) => t.replace(/\s+/g, " ").slice(0, 40)).catch(() => ""));

record("无意外 console error", errors.filter((m) => !/status of 4\d\d/.test(m)).length === 0, errors.slice(0, 2).join(" | "));
await browser.close();

fs.writeFileSync(E, before.e);
fs.writeFileSync(P, before.p);
fs.writeFileSync(S, before.s);
record("测试结束已还原 effects / pending / styles", fs.readFileSync(E, "utf8") === before.e && fs.readFileSync(S, "utf8") === before.s);

let validateOk = true;
try { execSync("npm run validate", { encoding: "utf8", stdio: "pipe" }); } catch { validateOk = false; }
record("npm run validate 通过", validateOk);

const failed = results.filter((r) => !r.ok);
console.log("");
if (failed.length > 0) { console.log(`✗ ${failed.length}/${results.length} 项未通过`); process.exit(1); }
console.log(`✓ 全部 ${results.length} 项通过`);
