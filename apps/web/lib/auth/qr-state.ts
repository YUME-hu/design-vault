import crypto from "node:crypto";

export const QR_TTL_MS = 180_000;

type Entry = { key: string; createdAt: number };

const globalKey = Symbol.for("design-vault.bili.qr-sessions");
const globalStore = globalThis as unknown as Record<symbol, Map<string, Entry>>;
const store: Map<string, Entry> = globalStore[globalKey] ?? new Map();
globalStore[globalKey] = store;

export function createQrSession(key: string): string {
  const id = crypto.randomUUID();
  store.set(id, { key, createdAt: Date.now() });
  for (const [entryId, entry] of store) {
    if (Date.now() - entry.createdAt > QR_TTL_MS) store.delete(entryId);
  }
  return id;
}

export function getQrSession(id: string): Entry | null {
  const entry = store.get(id);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > QR_TTL_MS) {
    store.delete(id);
    return null;
  }
  return entry;
}

export function deleteQrSession(id: string): void {
  store.delete(id);
}

export const QR_COOKIE = "dv_bili_qr";
