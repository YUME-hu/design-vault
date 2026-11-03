import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pendingSchema, type PendingItem } from "../schema";

/**
 * pending 队列的读写：追加模式 + 去重（source.video + name）+ 临时文件 rename。
 */

export const PENDING_FILE = path.join(process.cwd(), "data", "pending.json");

export function readPending(file: string = PENDING_FILE): PendingItem[] {
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (error) {
    throw new Error(`${path.basename(file)} 不是合法 JSON：${(error as Error).message}`);
  }
  const parsed = pendingSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error(
      `${path.basename(file)} 未通过 zod：${parsed.error.issues
        .map((issue) => `${issue.path.join(".")} ${issue.message}`)
        .join("; ")}`,
    );
  }
  return parsed.data;
}

export function pendingKey(item: Pick<PendingItem, "sources" | "name">): string {
  return `${item.sources[0]?.video ?? ""}::${item.name}`;
}

/** 追加写：不覆盖已有条目，同 video + name 跳过。 */
export function appendPending(
  items: PendingItem[],
  file: string = PENDING_FILE,
): { added: number; skipped: number } {
  const existing = readPending(file);
  const seen = new Set(existing.map(pendingKey));
  const next = [...existing];
  let added = 0;
  let skipped = 0;

  for (const item of items) {
    const key = pendingKey(item);
    if (seen.has(key)) {
      skipped += 1;
      continue;
    }
    seen.add(key);
    next.push(item);
    added += 1;
  }

  if (added > 0) {
    pendingSchema.parse(next);
    const temp = `${file}.tmp`;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(temp, `${JSON.stringify(next, null, 2)}\n`, "utf8");
    fs.renameSync(temp, file);
  }

  return { added, skipped };
}

export function makePendingId(): string {
  return crypto.randomUUID();
}

/** 整表覆盖写（通过/丢弃用）；调用方负责先做业务校验 */
export function writePending(items: PendingItem[], file: string = PENDING_FILE): void {
  const validated = pendingSchema.parse(items);
  const temp = `${file}.tmp`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(temp, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  fs.renameSync(temp, file);
}
