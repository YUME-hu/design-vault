import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { refSchema } from "@design-vault/adapters/schema";
import { normalizeUrl } from "@design-vault/adapters/url";

const BASE = process.env.VERIFY_BASE_URL ?? "http://localhost:3000";
const REFS = path.join(process.cwd(), "data", "refs.json");
const DRAFTS = path.join(process.cwd(), "data", "styles.draft.json");
const before = { refs: fs.readFileSync(REFS, "utf8"), drafts: fs.readFileSync(DRAFTS, "utf8") };
const refsBefore = (JSON.parse(before.refs) as unknown[]).length;

const results: { name: string; ok: boolean; detail?: string }[] = [];
const record = (name: string, ok: boolean, detail = "") => {
  results.push({ name, ok, detail });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? `  — ${detail}` : ""}`);
};

// mock 抓取结果（不触网）
const mockCapture = {
  id: "mock-site-abc123",
  url: "https://mock.example.com",
  title: "Mock Studio",
  screenshot: "refs/mock-site-abc123/screenshot.png",
  design_tokens: {
    colors: [
      { hex: "#191919", weight: 0.5 },
      { hex: "#ECE5D6", weight: 0.3 },
    ],
    fonts: ["Inter", "Space Mono"],
    spacing: ["8px", "16px"],
    border_radius: ["0px", "4px"],
    shadows: ["none"],
    css_variables: {},
  },
  ai_analysis: {
    name: "Mock Editorial",
    summary: "黑白编辑风，栅格清晰",
    color_direction: { temperature: "neutral", saturation: "muted", contrast: "high", semantic_hint: "黑白高对比" },
    layout: "两列栅格",
    components: ["按钮", "卡片"],
  },
  generated_code: "<main class=\"p-8\"></main>",
};

const parsed = refSchema.safeParse({ ...mockCapture, my_tags: ["mock"], why_i_like_it: "栅格清晰，值得抄结构", linked_style_id: null });
record(
  "抓取结果解析：设计令牌完整",
  parsed.success &&
    parsed.data.design_tokens.colors.length === 2 &&
    parsed.data.design_tokens.fonts[0] === "Inter" &&
    parsed.data.design_tokens.spacing.includes("16px"),
  parsed.success ? `${parsed.data.design_tokens.colors.length} colors` : "schema 拒绝",
);

record(
  "URL 没写协议时自动补 https://",
  normalizeUrl("example.com") === "https://example.com" &&
    normalizeUrl("http://a.com") === "http://a.com" &&
    normalizeUrl("//b.com") === "https://b.com" &&
    normalizeUrl("   ") === "",
  normalizeUrl("example.com"),
);

record(
  "why_i_like_it 少于 4 字被 schema 拒绝",
  !refSchema.safeParse({ ...mockCapture, my_tags: [], why_i_like_it: "短", linked_style_id: null }).success,
);

const saved = await fetch(`${BASE}/api/refs`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...mockCapture, my_tags: ["mock"], why_i_like_it: "栅格清晰，值得抄结构", linked_style_id: null }),
});
const savedJson = await saved.json();
record("保存接口：合法 why 成功入库", saved.ok && savedJson.ok, String(savedJson.id));

const rejected = await fetch(`${BASE}/api/refs`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...mockCapture, id: "mock-rejected", my_tags: [], why_i_like_it: "短" }),
});
record("保存接口：why 太短返回 400", rejected.status === 400);

const link = await fetch(`${BASE}/api/refs/${mockCapture.id}/link`, { method: "POST" });
const linkJson = await link.json();
const drafts = JSON.parse(fs.readFileSync(DRAFTS, "utf8")) as { id: string; sources: { type: string; url: string }[] }[];
const draft = drafts.find((item) => item.id === linkJson.styleId);
const refs = JSON.parse(fs.readFileSync(REFS, "utf8")) as { id: string; linked_style_id: string }[];
record(
  "关联入库：生成 source.type=reference 的草案并双向绑定",
  link.ok && linkJson.ok && draft?.sources[0]?.type === "reference" && draft.sources[0].url === mockCapture.url && refs.find((ref) => ref.id === mockCapture.id)?.linked_style_id === linkJson.styleId,
  `draft ${linkJson.styleId}`,
);

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors: string[] = [];
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto(`${BASE}/library/${linkJson.styleId}`, { waitUntil: "networkidle" });
record("风格详情展示「参考网站」区块", (await page.locator('[data-testid="linked-refs"]').count()) === 1);

await page.goto(`${BASE}/refs`, { waitUntil: "networkidle" });
record("/refs 列表显示已保存参考", (await page.locator('[data-testid="ref-card"]').count()) === refsBefore + 1);

record("无意外 console error", errors.filter((m) => !/status of 4\d\d/.test(m)).length === 0, errors.slice(0, 2).join(" | "));
await browser.close();

// 还原
fs.writeFileSync(REFS, before.refs);
fs.writeFileSync(DRAFTS, before.drafts);
record("测试结束已还原 refs / drafts", fs.readFileSync(REFS, "utf8") === before.refs && fs.readFileSync(DRAFTS, "utf8") === before.drafts);

let validateOk = true;
try { execSync("npm run validate", { encoding: "utf8", stdio: "pipe" }); } catch { validateOk = false; }
record("npm run validate 通过", validateOk);

const failed = results.filter((r) => !r.ok);
console.log("");
if (failed.length > 0) { console.log(`✗ ${failed.length}/${results.length} 项未通过`); process.exit(1); }
console.log(`✓ 全部 ${results.length} 项通过`);
