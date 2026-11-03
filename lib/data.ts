import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
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
} from "./schema";

/**
 * 数据访问层：M0/M1a 直接用 fs 读写 data/*.json，不接数据库。
 * 读的时候一律过 zod：宁可整页报错，也不要把脏数据渲染成一个"看起来能用"的假象。
 */

const DATA_DIR = path.join(process.cwd(), "data");

export const STYLES_FILE = "styles.json";
export const DRAFT_FILE = "styles.draft.json";

export class DataValidationError extends Error {
  constructor(
    readonly file: string,
    readonly issues: z.ZodIssue[],
  ) {
    const detail = issues
      .map((issue) => `  · ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");
    super(`data/${file} 未通过 zod 校验：\n${detail}`);
    this.name = "DataValidationError";
  }
}

function readCollection<T>(file: string, schema: z.ZodType<T, z.ZodTypeDef, unknown>): T {
  const fullPath = path.join(DATA_DIR, file);
  // Windows 编辑器（记事本 / PowerShell）可能写入 UTF-8 BOM，JSON.parse 不认
  const raw = fs.readFileSync(fullPath, "utf8").replace(/^\uFEFF/, "");

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new Error(`data/${file} 不是合法 JSON：${(error as Error).message}`);
  }

  const result = schema.safeParse(json);
  if (!result.success) {
    throw new DataValidationError(file, result.error.issues);
  }
  return result.data;
}

/** 先写临时文件再 rename：避免写一半崩掉留下半截 JSON。 */
function writeJsonAtomic(file: string, data: unknown): void {
  const fullPath = path.join(DATA_DIR, file);
  const tempPath = `${fullPath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  fs.renameSync(tempPath, fullPath);
}

// ---------- 风格库：已确认 ----------

/** 不走缓存：写操作前要用磁盘上的最新状态。 */
export const readStylesFile = (): Style[] => readCollection(STYLES_FILE, stylesSchema);

export const getStyles = cache((): Style[] => readStylesFile());

export function writeStylesFile(styles: Style[]): void {
  writeJsonAtomic(STYLES_FILE, styles);
}

// ---------- 风格库：草案 ----------

export const readDraftFile = (): Style[] => readCollection(DRAFT_FILE, stylesSchema);

export const getDraftStyles = cache((): Style[] => readDraftFile());

export function writeDraftFile(drafts: Style[]): void {
  writeJsonAtomic(DRAFT_FILE, drafts);
}

// ---------- 统一取记录（详情页 / 推荐池共用）----------

export type StyleStage = "confirmed" | "draft";

export type StyleRecord = {
  style: Style;
  stage: StyleStage;
  /** 在当前分区里的序号（001 起） */
  index: number;
};

/** 已确认优先；找不到再去草案里找。 */
export const getStyleRecord = cache((id: string): StyleRecord | undefined => {
  const confirmed = getStyles();
  const confirmedIndex = confirmed.findIndex((style) => style.id === id);
  if (confirmedIndex >= 0) {
    return { style: confirmed[confirmedIndex], stage: "confirmed", index: confirmedIndex + 1 };
  }

  const drafts = getDraftStyles();
  const draftIndex = drafts.findIndex((style) => style.id === id);
  if (draftIndex >= 0) {
    return { style: drafts[draftIndex], stage: "draft", index: draftIndex + 1 };
  }

  return undefined;
});

export const getStyleById = (id: string): Style | undefined => getStyleRecord(id)?.style;

/** 记录编号（001 起）——列表页与详情页共用，保证同一风格在两个页面编号一致。 */
export function getStyleIndex(id: string): number {
  return getStyleRecord(id)?.index ?? 0;
}

/** 推荐池 = 已确认 + 草案，草案带 stage 标记，结果页会标出来。 */
export function getStylePool(): StyleRecord[] {
  return [
    ...getStyles().map((style, position) => ({
      style,
      stage: "confirmed" as const,
      index: position + 1,
    })),
    ...getDraftStyles().map((style, position) => ({
      style,
      stage: "draft" as const,
      index: position + 1,
    })),
  ];
}

/** 已确认库里出现过的全部标签，按出现频次排序，供筛选条使用。 */
export function getAllTags(): { tag: string; count: number }[] {
  const counter = new Map<string, number>();
  for (const style of getStyles()) {
    for (const tag of style.project_tags) {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    }
  }
  return [...counter.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

// ---------- 其余三个库（M0 只读取、只占位）----------

export const EFFECTS_FILE = "effects.json";
export const readEffectsFile = (): Effect[] => readCollection(EFFECTS_FILE, effectsSchema);
export const getEffects = cache((): Effect[] => readEffectsFile());
export function writeEffectsFile(effects: Effect[]): void {
  writeJsonAtomic(EFFECTS_FILE, effects);
}

export const REFS_FILE = "refs.json";
export const readRefsFile = (): Ref[] => readCollection(REFS_FILE, refsSchema);
export const getRefs = cache((): Ref[] => readRefsFile());
export function writeRefsFile(refs: Ref[]): void {
  writeJsonAtomic(REFS_FILE, refs);
}

export const getPending = cache((): PendingItem[] =>
  readCollection("pending.json", pendingSchema),
);

/** 顶部状态栏用的库体量读数。 */
export function getVaultCounts() {
  return {
    styles: getStyles().length,
    drafts: getDraftStyles().length,
    pending: getPending().length,
    effects: getEffects().length,
    refs: getRefs().length,
  };
}
