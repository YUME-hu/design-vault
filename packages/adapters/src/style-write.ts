import { readDraftFile, readStylesFile, writeDraftFile, writeStylesFile } from "./data";
import { readPending, writePending } from "./ingest/pending-store";
import { styleSchema, stylesSchema, type Style } from "./schema";

/**
 * 服务端写入层：新建 / 更新都走这里。
 * 前端传什么都要重新过 zod、查重、整体校验，最后原子写盘。
 */

export type WriteFailure = {
  ok: false;
  status: number;
  error: string;
  issues?: string[];
};

export type WriteSuccess = {
  ok: true;
  style: Style;
  target: "styles" | "draft";
};

export type WriteResult = WriteSuccess | WriteFailure;

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function issueList(issues: { path: (string | number)[]; message: string }[]): string[] {
  return issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function withDates(input: unknown, dates: Record<string, string>): unknown {
  if (!isRecord(input)) return input;
  return { ...input, ...dates };
}

function readBoth(): { styles: Style[]; drafts: Style[] } | WriteFailure {
  try {
    return { styles: readStylesFile(), drafts: readDraftFile() };
  } catch (error) {
    return {
      ok: false,
      status: 500,
      error: `读取数据失败：${(error as Error).message}`,
    };
  }
}

export function createStyle(input: unknown, options: { pendingId?: string } = {}): WriteResult {
  const stamp = today();
  const parsed = styleSchema.safeParse(
    withDates(input, { created_at: stamp, updated_at: stamp }),
  );

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: "提交的数据没通过 Style 校验",
      issues: issueList(parsed.error.issues),
    };
  }

  const current = readBoth();
  if ("ok" in current) return current;

  const style = parsed.data;
  if (current.styles.some((item) => item.id === style.id)) {
    return { ok: false, status: 409, error: `id "${style.id}" 已在已确认库里` };
  }
  if (current.drafts.some((item) => item.id === style.id)) {
    return { ok: false, status: 409, error: `id "${style.id}" 与草案重复，先改个 id` };
  }

  const next = stylesSchema.safeParse([...current.styles, style]);
  if (!next.success) {
    return {
      ok: false,
      status: 422,
      error: "整体校验失败，未写入",
      issues: issueList(next.error.issues),
    };
  }

  try {
    writeStylesFile(next.data);
  } catch (error) {
    return { ok: false, status: 500, error: `写入失败：${(error as Error).message}` };
  }

  // 从 pending 走「去调色」入库时，顺手把队列里的那条删掉
  if (options.pendingId) {
    try {
      const pending = readPending();
      const remaining = pending.filter((item) => item.id !== options.pendingId);
      if (remaining.length !== pending.length) writePending(remaining);
    } catch {
      // 删除失败不影响已经入库的风格
    }
  }

  return { ok: true, style, target: "styles" };
}

export function updateStyle(id: string, input: unknown): WriteResult {
  const current = readBoth();
  if ("ok" in current) return current;

  const styleIndex = current.styles.findIndex((item) => item.id === id);
  const draftIndex = current.drafts.findIndex((item) => item.id === id);

  if (styleIndex === -1 && draftIndex === -1) {
    return { ok: false, status: 404, error: `找不到风格 "${id}"` };
  }

  const existing = styleIndex >= 0 ? current.styles[styleIndex] : current.drafts[draftIndex];

  const parsed = styleSchema.safeParse(
    withDates(input, {
      id: existing.id,
      created_at: existing.created_at,
      updated_at: today(),
    }),
  );

  if (!parsed.success) {
    return {
      ok: false,
      status: 400,
      error: "提交的数据没通过 Style 校验",
      issues: issueList(parsed.error.issues),
    };
  }

  const updated = parsed.data;

  try {
    if (styleIndex >= 0) {
      const next = [...current.styles];
      next[styleIndex] = updated;
      writeStylesFile(stylesSchema.parse(next));
      return { ok: true, style: updated, target: "styles" };
    }

    const next = [...current.drafts];
    next[draftIndex] = updated;
    writeDraftFile(stylesSchema.parse(next));
    return { ok: true, style: updated, target: "draft" };
  } catch (error) {
    return { ok: false, status: 500, error: `写入失败：${(error as Error).message}` };
  }
}
