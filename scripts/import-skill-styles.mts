/**
 * 一次性导入：把 ui-ux-pro-max-skill 的 styles.csv（active 行）转成 pending 候选。
 * - 全部走 pending，不直接进 styles.json
 * - 语义查重：≥0.85 丢弃；0.6–0.85 写 duplicate_of
 * - 缺 palette / tokens：palette 用占位，notes 写明需人工调色
 */
import fs from "node:fs";
import path from "node:path";
import { readDraftFile, readStylesFile } from "../lib/data";
import { readPending, appendPending } from "../lib/ingest/pending-store";
import { findSimilar, type SimilarCandidate } from "../lib/ingest/dedupe";
import { pendingItemSchema, type PendingItem } from "../lib/schema";

const CSV = path.join(process.cwd(), "data", ".skill-styles.csv");
const raw = fs.readFileSync(CSV, "utf8").replace(/^\uFEFF/, "");

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else quoted = false;
      } else field += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (ch !== "\r") {
      field += ch;
    }
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => cells.some((cell) => cell.trim()));
}

const rows = parseCsv(raw);
const header = rows[0].map((cell) => cell.trim());
const idx = (name: string) => header.indexOf(name);
const COL = {
  name: idx("Style Category"),
  keywords: idx("Keywords"),
  prompt: idx("AI Prompt Keywords"),
  bestFor: idx("Best For"),
  effects: idx("Effects & Animation"),
  status: idx("Status"),
  mode: idx("Preferred Mode"),
};

const today = new Date().toISOString().slice(0, 10);
const placeholderPalette = {
  primary: "#191919",
  bg: "#ECE5D6",
  surface: "#FFFFFF",
  text: "#191919",
  muted: "#8A8578",
};

const existing = [...readStylesFile(), ...readDraftFile()];
const pending = readPending();
const candidates: SimilarCandidate[] = [
  ...existing.map((style) => ({ id: style.id, name: style.name, kind: "style" as const })),
  ...pending.map((item) => ({ id: item.id, name: item.name, kind: "pending" as const })),
];

let parsed = 0;
let highSkipped = 0;
let medium = 0;
const written: PendingItem[] = [];

const active = rows
  .slice(1)
  .map((cells) => Object.fromEntries(Object.entries(COL).map(([key, i]) => [key, (cells[i] ?? "").trim()])))
  .filter((row) => row.status === "active");

for (const row of active) {
  parsed += 1;
  const name = row.name;
  if (!name) continue;

  const match = findSimilar(name, candidates);
  if (match?.level === "high") {
    highSkipped += 1;
    console.log(`skip  ${name}  ≈ ${match.name} (${match.score.toFixed(2)})`);
    continue;
  }
  if (match?.level === "medium") medium += 1;

  const item = pendingItemSchema.parse({
    id: crypto.randomUUID(),
    status: "pending",
    created_at: today,
    confidence: 0.5,
    sources: [
      {
        type: "skill-library",
        url: "https://github.com/nextlevelbuilder/ui-ux-pro-max-skill",
        upstream: "UI UX Pro Max",
        video: "",
      },
    ],
    upstream_name: "UI UX Pro Max",
    video_title: "49 种通用前端风格（开源 Skill）",
    name,
    candidate: {
      name,
      frontend_prompt: [row.prompt, row.bestFor ? `适用：${row.bestFor}` : "", row.effects ? `效果：${row.effects}` : ""]
        .filter(Boolean)
        .join("\n"),
      project_tags: [],
      suitable_projects: [],
    },
    color_direction: null,
    duplicate_of: match?.level === "medium" ? match.id : null,
    reasoning: row.keywords,
    notes: `来源：开源 Skill，缺少具体 Token，需人工调色${match ? `；发现相似风格：${match.name}` : ""}`,
    raw_response: JSON.stringify(row),
  });

  written.push(item);
  candidates.push({ id: item.id, name, kind: "pending" });
}

const result = appendPending(written);
console.log(
  JSON.stringify(
    { parsed, highSkipped, medium, written: written.length, added: result.added, skipped: result.skipped },
    null,
    2,
  ),
);

fs.rmSync(CSV, { force: true });
