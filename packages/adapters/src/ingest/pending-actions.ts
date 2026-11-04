import { createHash } from "node:crypto";
import { readComponentsFile, readDraftFile, readEffectsFile, readStylesFile, writeComponentsFile, writeDraftFile, writeEffectsFile, writeStylesFile } from "../data";
import { componentSchema, effectSchema, slugSchema, stylesSchema, type ComponentItem, type Effect, type PendingItem, type Style, type StyleSource } from "../schema";
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

export type ApproveResult =
  | { ok: true; kind: "style"; style: Style }
  | { ok: true; kind: "effect" | "component"; id: string; name: string };

export function approvePending(id: string, as?: "style" | "effect" | "component"): ApproveResult | ActionFailure {
  const pending = readPending();
  const index = pending.findIndex((item) => item.id === id);
  if (index === -1) {
    return { ok: false, status: 404, error: `pending "${id}" 不存在（可能已被处理）` };
  }

  const item = pending[index];

  if (as === "component") return approveComponent(pending, index, item);
  if (as === "effect") return approveEffect(pending, index, item);

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

  return { ok: true, kind: "style", style };
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

export type MergeTarget = { id: string; name: string; kind: "style" | "draft" };

/** 解析合并目标：显式 id > duplicate_of > notes 里的「发现相似风格：X」 */
export function resolveMergeTarget(
  item: Pick<PendingItem, "duplicate_of" | "notes">,
  targetId?: string,
): MergeTarget | null {
  const styles = readStylesFile();
  const drafts = readDraftFile();

  const byId = (id: string): MergeTarget | null => {
    const style = styles.find((entry) => entry.id === id);
    if (style) return { id: style.id, name: style.name, kind: "style" };
    const draft = drafts.find((entry) => entry.id === id);
    if (draft) return { id: draft.id, name: draft.name, kind: "draft" };
    return null;
  };

  if (targetId) return byId(targetId);
  if (item.duplicate_of) {
    const found = byId(item.duplicate_of);
    if (found) return found;
  }

  const match = item.notes.match(/发现相似风格：([^（\n]+)/);
  const name = match?.[1]?.trim();
  if (!name) return null;
  const style = styles.find((entry) => entry.name === name);
  if (style) return { id: style.id, name: style.name, kind: "style" };
  const draft = drafts.find((entry) => entry.name === name);
  if (draft) return { id: draft.id, name: draft.name, kind: "draft" };
  return null;
}

/** 合并：sources 去重追加 + notes 追加，然后删除 pending（不动目标原有 confidence / extracted_effects） */
export function mergePending(
  id: string,
  targetId?: string,
): { ok: true; targetId: string; targetName: string; addedSources: number } | ActionFailure {
  const pending = readPending();
  const index = pending.findIndex((item) => item.id === id);
  if (index === -1) {
    return { ok: false, status: 404, error: `pending "${id}" 不存在（可能已被处理）` };
  }

  const item = pending[index];
  const target = resolveMergeTarget(item, targetId);
  if (!target) {
    return {
      ok: false,
      status: 422,
      error: "没有可用的合并目标（duplicate_of 或 notes 都解析不到已入库的风格）",
    };
  }

  const mergedNote = [
    item.notes?.trim() ? item.notes.trim() : "",
    `合并自 pending：${item.name} · ${item.sources.map((source) => source.video || source.url).filter(Boolean).join(" / ") || "无链接"}`,
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    if (target.kind === "style") {
      const styles = readStylesFile();
      const indexOfTarget = styles.findIndex((style) => style.id === target.id);
      const merged = mergeSources(styles[indexOfTarget].sources, item.sources);
      const next = [...styles];
      next[indexOfTarget] = {
        ...styles[indexOfTarget],
        sources: merged,
        notes: [styles[indexOfTarget].notes, mergedNote].filter(Boolean).join("\n\n"),
        updated_at: today(),
      };
      writeStylesFile(stylesSchema.parse(next));
      writePending(pending.filter((_, itemIndex) => itemIndex !== index));
      return {
        ok: true,
        targetId: target.id,
        targetName: target.name,
        addedSources: merged.length - styles[indexOfTarget].sources.length,
      };
    }

    const drafts = readDraftFile();
    const indexOfTarget = drafts.findIndex((style) => style.id === target.id);
    const merged = mergeSources(drafts[indexOfTarget].sources, item.sources);
    const next = [...drafts];
    next[indexOfTarget] = {
      ...drafts[indexOfTarget],
      sources: merged,
      notes: [drafts[indexOfTarget].notes, mergedNote].filter(Boolean).join("\n\n"),
      updated_at: today(),
    };
    writeDraftFile(stylesSchema.parse(next));
    writePending(pending.filter((_, itemIndex) => itemIndex !== index));
    return {
      ok: true,
      targetId: target.id,
      targetName: target.name,
      addedSources: merged.length - drafts[indexOfTarget].sources.length,
    };
  } catch (error) {
    return { ok: false, status: 500, error: `写入失败：${(error as Error).message}` };
  }
}

function slugId(name: string, fallback: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base.length >= 2 ? base : `${fallback}-${createHash("sha1").update(name).digest("hex").slice(0, 6)}`;
}

function uniqueId(base: string, used: Set<string>): string {
  if (!used.has(base)) return base;
  for (let index = 2; index < 100; index += 1) {
    const candidate = `${base}-${index}`;
    if (!used.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

function approveComponent(
  pending: ReturnType<typeof readPending>,
  index: number,
  item: ReturnType<typeof readPending>[number],
): ApproveResult | ActionFailure {
  const components = readComponentsFile();
  const candidate = item.component_candidate;
  const name = (candidate?.name ?? item.name).trim() || item.name;
  const id = uniqueId(slugId(name, "component"), new Set(components.map((entry) => entry.id)));
  const now = new Date().toISOString().slice(0, 10);

  const component: ComponentItem = componentSchema.parse({
    id,
    name,
    category: candidate?.category ?? "other",
    description:
      candidate?.description?.trim() ||
      item.candidate?.frontend_prompt?.trim() ||
      "来自 pending 的组件候选，描述待补全。",
    framework: candidate?.framework ?? "react",
    code: candidate?.code ?? "",
    dependencies: candidate?.dependencies ?? [],
    states: candidate?.states ?? [],
    related_styles: [],
    related_effects: [],
    sources: item.sources,
    notes: candidate?.code?.trim() ? item.notes : [item.notes, "待补代码（来自 pending 分流）"].filter(Boolean).join(" "),
    confidence: item.confidence,
    created_at: now,
    updated_at: now,
  });

  writeComponentsFile([...components, component]);
  writePending(pending.filter((_, itemIndex) => itemIndex !== index));
  return { ok: true, kind: "component", id: component.id, name: component.name };
}

function approveEffect(
  pending: ReturnType<typeof readPending>,
  index: number,
  item: ReturnType<typeof readPending>[number],
): ApproveResult | ActionFailure {
  const effects = readEffectsFile();
  const candidate = item.effect_candidate ?? item.extracted_effects[0] ?? null;
  const name = (candidate?.name ?? item.name).trim() || item.name;
  const id = uniqueId(slugId(name, "effect"), new Set(effects.map((entry) => entry.id)));

  const effect: Effect = effectSchema.parse({
    id,
    name,
    tech_stack: candidate?.tech_stack ?? [],
    description:
      candidate?.description?.trim() ||
      item.candidate?.frontend_prompt?.trim() ||
      "来自 pending 的动效候选，实现思路待补全。",
    code_snippet: candidate?.code_snippet ?? "",
    performance_notes: "performance_notes" in (candidate ?? {}) ? (candidate as { performance_notes?: string }).performance_notes ?? "" : "",
    related_styles: [],
  });

  writeEffectsFile([...effects, effect]);
  writePending(pending.filter((_, itemIndex) => itemIndex !== index));
  return { ok: true, kind: "effect", id: effect.id, name: effect.name };
}
