import fs from "node:fs";
import path from "node:path";
import { configPath } from "./paths";

/**
 * config/upstreams.json 的读写。
 * - 追加/删除都用临时文件 + rename
 * - 保留原文件的缩进宽度与结尾换行
 * - 条目统一成 { uid, name }（原来只有 UID 的话，第一次写入会补上昵称）
 */

export type UpstreamEntry = { uid: string; name: string };

export const UPSTREAMS_CONFIG = configPath("upstreams.json");

export type ConfigSnapshot = {
  entries: UpstreamEntry[];
  indent: number;
  trailingNewline: boolean;
};

function detectIndent(text: string): number {
  // 第一条条目可能是 "uid"（字符串数组）或 {（对象数组），都取它的缩进作为基准
  const match = text.match(/\n([ ]+)(?=["{])/);
  if (match) return match[1].length;
  const tab = text.match(/\n(\t)(?=["{])/);
  return tab ? 1 : 2;
}

function normalize(json: unknown): UpstreamEntry[] {
  if (!Array.isArray(json)) return [];
  const entries: UpstreamEntry[] = [];
  for (const item of json) {
    if (typeof item === "string" && /^\d+$/.test(item.trim())) {
      entries.push({ uid: item.trim(), name: "" });
      continue;
    }
    if (item && typeof item === "object") {
      const value = item as { uid?: unknown; name?: unknown };
      if (typeof value.uid === "string" && /^\d+$/.test(value.uid)) {
        entries.push({
          uid: value.uid,
          name: typeof value.name === "string" ? value.name : "",
        });
      }
    }
  }
  return entries;
}

export function readConfig(file: string = UPSTREAMS_CONFIG): ConfigSnapshot {
  if (!fs.existsSync(file)) {
    return { entries: [], indent: 2, trailingNewline: true };
  }
  const text = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const json = JSON.parse(text) as unknown;
  return {
    entries: normalize(json),
    indent: detectIndent(text),
    trailingNewline: /\n$/.test(text),
  };
}

export function writeConfig(
  entries: UpstreamEntry[],
  snapshot: Pick<ConfigSnapshot, "indent" | "trailingNewline">,
  file: string = UPSTREAMS_CONFIG,
): void {
  const body = `${JSON.stringify(entries, null, snapshot.indent)}${
    snapshot.trailingNewline ? "\n" : ""
  }`;
  const temp = `${file}.tmp`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(temp, body, "utf8");
  fs.renameSync(temp, file);
}

export function findUpstream(uid: string, file: string = UPSTREAMS_CONFIG): UpstreamEntry | undefined {
  return readConfig(file).entries.find((entry) => entry.uid === uid);
}

export function addUpstream(
  uid: string,
  name: string,
  file: string = UPSTREAMS_CONFIG,
  nameResolver?: (existingUid: string) => string,
): { ok: true; entries: UpstreamEntry[] } | { ok: false; error: string } {
  const snapshot = readConfig(file);
  if (snapshot.entries.some((entry) => entry.uid === uid)) {
    return { ok: false, error: `UID ${uid} 已经在订阅列表里` };
  }
  // 老配置只有 UID，第一次转成对象时尽量把已有昵称补上
  const filled = snapshot.entries.map((entry) => ({
    uid: entry.uid,
    name: entry.name || nameResolver?.(entry.uid) || "",
  }));
  const entries = [...filled, { uid, name }];
  writeConfig(entries, snapshot, file);
  return { ok: true, entries };
}

export function removeUpstream(
  uid: string,
  file: string = UPSTREAMS_CONFIG,
): { ok: true; entries: UpstreamEntry[] } | { ok: false; error: string } {
  const snapshot = readConfig(file);
  if (!snapshot.entries.some((entry) => entry.uid === uid)) {
    return { ok: false, error: `UID ${uid} 不在订阅列表里` };
  }
  const entries = snapshot.entries.filter((entry) => entry.uid !== uid);
  writeConfig(entries, snapshot, file);
  return { ok: true, entries };
}
