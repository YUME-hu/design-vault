import { cache } from "react";
import type { Style } from "../../core/src/schema";
import type { StyleStage } from "../../core/src/types";
import * as collections from "../../store/src/collections";
import { readPending } from "../../store/src/pending";

/**
 * Web 侧的数据访问层：底层读写全部来自 @design-vault/store，
 * 这里只保留 React cache 与派生查询（详情 / 推荐池 / 标签统计）。
 */

export * from "../../store/src/collections";
export type { StyleStage };

export type StyleRecord = {
  style: Style;
  stage: StyleStage;
  /** 在当前分区里的序号（001 起） */
  index: number;
};

export const getStyles = cache((): Style[] => collections.readStylesFile());
export const getDraftStyles = cache((): Style[] => collections.readDraftFile());
export const getEffects = cache(() => collections.readEffectsFile());
export const getRefs = cache(() => collections.readRefsFile());
export const getPending = cache(() => readPending());

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
