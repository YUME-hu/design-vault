import { createHash } from "node:crypto";
import { readDraftFile, readEffectsFile, readStylesFile, writeDraftFile, writeEffectsFile, writeStylesFile } from "../data";
import { slugSchema, stylesSchema, type Effect, type Style, type StyleSource } from "../schema";
import { readPending, writePending } from "./pending-store";
import { buildStyleFromPending } from "./pending-to-style";

/**
 * pending 的两个动作：通过入库 / 丢弃。
 * 写入顺序：先写 styles（成功后才从 pending 删除），失败不会两头丢。
 */

export type ActionFailure = { ok: false; status: number; error: string; issues?: string[] };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function approvePending(id: string): { ok: true; style: Style } | ActionFailure {
  const pending = readPending();
  const index = pending.findIndex((item) => item.id === id);
  if (index === -1) {
    return { ok: false, status: 404, error: `pending "${id}" 不存在（可能已被处理）` };
  }

  const styles = readStylesFile();
  const drafts = readDraftFile();
  const taken = new Set([
    ...styles.map((style) => style.id),
    ...drafts.map((style) => style.id),
  ]);

  let style: Style;
  try {
    style = buildStyleFromPending(pending[index], { takenIds: taken, today: today() });
  } catch (error) {
    return {
      ok: false,
      status: 422,
      error: `这条候选补不全省略字段：${(error as Error).message}`,
    };
  }

  try {
    // 提取出的技术方案：生成 effect，双向绑定
    const effects = readEffectsFile();
    const usedIds = new Set(effects.map((effect) => effect.id));
    const created: Effect[] = [];
    const linkedIds: string[] = [];
    for (const extracted of pending[index].extracted_effects) {
      const baseSlug = extracted.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40);
      // 中文名没有 ASCII 时用名称短哈希，保证稳定且不撞号
      const id = baseSlug.length >= 2
        ? `${baseSlug}-${createHash("sha1").update(extracted.name).digest("hex").slice(0, 4)}`
        : `effect-${createHash("sha1").update(extracted.name).digest("hex").slice(0, 6)}`;
      const existing = effects.find((effect) => effect.id === id);
      if (existing) {
        if (!existing.related_styles.includes(style.id)) existing.related_styles.push(style.id);
        linkedIds.push(id);
        continue;
      }
      usedIds.add(id);
      created.push({
        id,
        name: extracted.name,
        tech_stack: extracted.tech_stack,
        description: extracted.description,
        code_snippet: extracted.code_snippet,
        performance_notes: extracted.performance_notes,
        related_styles: [style.id],
      });
    }
    if (created.length > 0) {
      style.related_effects = [...created.map((effect) => effect.id), ...linkedIds];
      writeEffectsFile([...effects, ...created]);
    }
    writeStylesFile([...styles, style]);
    writePending(pending.filter((_, itemIndex) => itemIndex !== index));
  } catch (error) {
    return { ok: false, status: 500, error: `写入失败：${(error as Error).message}` };
  }

  return { ok: true, style };
}

export function discardPending(id: string): { ok: true } | ActionFailure {
  const pending = readPending();
  const index = pending.findIndex((item) => item.id === id);
  if (index === -1) {
    return { ok: false, status: 404, error: `pending "${id}" 不存在（可能已被处理）` };
  }

  try {
    writePending(pending.filter((_, itemIndex) => itemIndex !== index));
  } catch (error) {
    return { ok: false, status: 500, error: `写入失败：${(error as Error).message}` };
  }

  return { ok: true };
}

export { today as pendingToday };

function mergeSources(current: StyleSource[], incoming: StyleSource[]): StyleSource[] {
  const merged = [...current];
  for (const source of incoming) {
    const exists = merged.some(
      (item) =>
        item.video === source.video && item.url === source.url && item.upstream === source.upstream,
    );
    if (!exists) merged.push(source);
  }
  return merged;
}

/** 合并信源：把当前 pending 的 sources 追加到 duplicate_of 指向的风格，然后删除 pending */
export function mergePending(
  id: string,
): { ok: true; targetId: string; added: number } | ActionFailure {
  const pending = readPending();
  const index = pending.findIndex((item) => item.id === id);
  if (index === -1) {
    return { ok: false, status: 404, error: `pending "${id}" 不存在（可能已被处理）` };
  }

  const item = pending[index];
  if (!item.duplicate_of) {
    return { ok: false, status: 400, error: "这条没有 duplicate_of，无法合并信源" };
  }

  const styleIndex = readStylesFile().findIndex((style) => style.id === item.duplicate_of);
  const draftIndex = styleIndex === -1 ? readDraftFile().findIndex((style) => style.id === item.duplicate_of) : -1;

  if (styleIndex === -1 && draftIndex === -1) {
    return { ok: false, status: 404, error: `找不到目标风格 ${item.duplicate_of}` };
  }

  try {
    if (styleIndex >= 0) {
      const styles = readStylesFile();
      const merged = mergeSources(styles[styleIndex].sources, item.sources);
      const next = [...styles];
      next[styleIndex] = { ...styles[styleIndex], sources: merged, updated_at: today() };
      writeStylesFile(stylesSchema.parse(next));
      writePending(pending.filter((_, itemIndex) => itemIndex !== index));
      return { ok: true, targetId: item.duplicate_of, added: merged.length - styles[styleIndex].sources.length };
    }

    const drafts = readDraftFile();
    const merged = mergeSources(drafts[draftIndex].sources, item.sources);
    const next = [...drafts];
    next[draftIndex] = { ...drafts[draftIndex], sources: merged, updated_at: today() };
    writeDraftFile(stylesSchema.parse(next));
    writePending(pending.filter((_, itemIndex) => itemIndex !== index));
    return { ok: true, targetId: item.duplicate_of, added: merged.length - drafts[draftIndex].sources.length };
  } catch (error) {
    return { ok: false, status: 500, error: `写入失败：${(error as Error).message}` };
  }
}
