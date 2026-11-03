/**
 * 数据体检：npm run validate
 * 1) 五个 JSON 逐条过 zod
 * 2) 跨文件一致性检查（重复 id / 草案与正式库撞车 / 互斥标签 / 悬空引用 / 草案必须能溯源）
 * 任何一项失败 → 退出码 1，方便接进 CI 或 git hook。
 */
import fs from "node:fs";
import path from "node:path";
import type { z } from "zod";
import {
  effectsSchema,
  pendingSchema,
  refsSchema,
  stylesSchema,
  type Effect,
  type PendingItem,
  type Ref,
  type Style,
} from "../lib/schema";

const DATA_DIR = path.join(process.cwd(), "data");

type Checked<T> = { file: string; label: string; schema: z.ZodType<T, z.ZodTypeDef, unknown> };

const TARGETS: Checked<unknown>[] = [
  { file: "styles.json", label: "已确认", schema: stylesSchema },
  { file: "styles.draft.json", label: "草案", schema: stylesSchema },
  { file: "pending.json", label: "待审核", schema: pendingSchema },
  { file: "effects.json", label: "效果库", schema: effectsSchema },
  { file: "refs.json", label: "参考库", schema: refsSchema },
];

const problems: string[] = [];
const loaded = new Map<string, unknown>();

function pad(value: string, width: number) {
  return value.padEnd(width, " ");
}

for (const target of TARGETS) {
  const fullPath = path.join(DATA_DIR, target.file);
  if (!fs.existsSync(fullPath)) {
    problems.push(`${target.file}: 文件不存在`);
    console.log(`✗ ${pad(target.file, 18)} ${target.label}  文件不存在`);
    continue;
  }

  const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    problems.push(`${target.file}: JSON 解析失败 — ${(error as Error).message}`);
    console.log(`✗ ${pad(target.file, 18)} ${target.label}  JSON 解析失败`);
    continue;
  }

  const result = target.schema.safeParse(json);
  if (!result.success) {
    console.log(`✗ ${pad(target.file, 18)} ${target.label}  ${result.error.issues.length} 处不合法`);
    for (const issue of result.error.issues) {
      problems.push(`${target.file}: ${issue.path.join(".") || "(root)"} — ${issue.message}`);
      console.log(`    · ${issue.path.join(".") || "(root)"} — ${issue.message}`);
    }
    continue;
  }

  loaded.set(target.file, result.data);
  const count = Array.isArray(result.data) ? result.data.length : 1;
  console.log(`✓ ${pad(target.file, 18)} ${target.label}  ${count} 条记录通过 zod`);
}

// ---------- 跨文件一致性 ----------

const styles = (loaded.get("styles.json") as Style[] | undefined) ?? [];
const drafts = (loaded.get("styles.draft.json") as Style[] | undefined) ?? [];
const pending = (loaded.get("pending.json") as PendingItem[] | undefined) ?? [];
const refs = (loaded.get("refs.json") as Ref[] | undefined) ?? [];
const effects = (loaded.get("effects.json") as Effect[] | undefined) ?? [];

function reportDuplicates(list: { id: string }[], file: string, label: string) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const item of list) {
    if (seen.has(item.id)) duplicates.add(item.id);
    seen.add(item.id);
  }
  for (const id of duplicates) problems.push(`${file}: ${label}重复 id "${id}"`);
}

reportDuplicates(styles, "styles.json", "");
reportDuplicates(drafts, "styles.draft.json", "草案");
reportDuplicates(effects, "effects.json", "");

const styleIds = new Set(styles.map((style) => style.id));
const draftIds = new Set(drafts.map((style) => style.id));

for (const id of draftIds) {
  if (styleIds.has(id)) {
    problems.push(`styles.draft.json: "${id}" 与已确认库同名，确认时会撞车`);
  }
}

for (const style of [...styles, ...drafts]) {
  const overlap = style.suitable_projects.filter((project) =>
    style.unsuitable_projects.includes(project),
  );
  if (overlap.length > 0) {
    problems.push(`"${style.id}" 同时把 ${overlap.join(", ")} 标为适用与不适用`);
  }
  if (new Set(style.project_tags).size !== style.project_tags.length) {
    problems.push(`"${style.id}" 的 project_tags 有重复项`);
  }
}

// 草案必须能溯源到官方文档：type + url 都不能缺
for (const draft of drafts) {
  if (draft.sources[0]?.type !== "extracted-draft") {
    problems.push(`styles.draft.json: "${draft.id}" 的 source.type 应为 extracted-draft，实际是 ${draft.sources[0]?.type}`);
  }
  if (!draft.sources[0]?.url) {
    problems.push(`styles.draft.json: "${draft.id}" 缺少 source.url，草案必须能点回官方文档`);
  }
  if (draft.confidence > 0.8) {
    problems.push(`styles.draft.json: "${draft.id}" 的 confidence 偏高（${draft.confidence}），草案不应超过 0.8`);
  }
}

const effectIds = new Set(effects.map((effect) => effect.id));

for (const ref of refs) {
  if (ref.linked_style_id && !styleIds.has(ref.linked_style_id)) {
    problems.push(`refs.json: "${ref.id}" 指向不存在的风格 "${ref.linked_style_id}"`);
  }
}

for (const item of pending) {
  if (styleIds.has(item.id)) {
    problems.push(`pending.json: "${item.id}" 与已入库风格同 id，人工通过时会撞车`);
  }
}

console.log("");
if (problems.length > 0) {
  console.log(`✗ 一致性检查发现 ${problems.length} 个问题：`);
  for (const problem of problems) console.log(`  · ${problem}`);
  process.exit(1);
}

console.log(
  `✓ 一致性检查通过 · confirmed ${styles.length} / draft ${drafts.length} / pending ${
    pending.length
  } / effects ${effectIds.size} / refs ${refs.length}`,
);
