import { configPath } from "@design-vault/store/paths";
import fs from "node:fs";
import path from "node:path";
import type { Upstream } from "./types";

const UPSTREAMS_FILE = configPath("upstreams.json");

/**
 * 订阅配置：兼容两种写法
 *   ["40238601", ...]
 *   [{ "uid": "40238601", "name": "某 UP 主" }, ...]
 */
export function readUpstreams(file = UPSTREAMS_FILE): Upstream[] {
  if (!fs.existsSync(file)) return [];
  const raw = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")) as unknown;
  if (!Array.isArray(raw)) return [];

  const upstreams: Upstream[] = [];
  for (const entry of raw) {
    if (typeof entry === "string" && /^\d+$/.test(entry.trim())) {
      upstreams.push({ uid: entry.trim() });
      continue;
    }
    if (
      entry &&
      typeof entry === "object" &&
      typeof (entry as { uid?: unknown }).uid === "string" &&
      /^\d+$/.test((entry as { uid: string }).uid)
    ) {
      const value = entry as { uid: string; name?: string };
      upstreams.push({
        uid: value.uid,
        name: typeof value.name === "string" && value.name.trim() ? value.name.trim() : undefined,
      });
    }
  }

  return upstreams;
}

export const UPSTREAMS_PATH = UPSTREAMS_FILE;
