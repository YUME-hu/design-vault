import fs from "node:fs";
import { USAGE_LOG_FILE } from "./deepseek";

export { USAGE_LOG_FILE };

export type UsageStats = {
  calls: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  byModel: Record<string, { calls: number; totalTokens: number }>;
  lastAt: string;
};

/** 读 JSONL 用量日志；坏行直接跳过，不影响统计 */
export function readUsage(file: string = USAGE_LOG_FILE): UsageStats {
  const stats: UsageStats = {
    calls: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    byModel: {},
    lastAt: "",
  };

  if (!fs.existsSync(file)) return stats;

  const lines = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const entry = JSON.parse(trimmed) as {
        model?: string;
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
        ts?: string;
      };
      stats.calls += 1;
      stats.promptTokens += entry.prompt_tokens ?? 0;
      stats.completionTokens += entry.completion_tokens ?? 0;
      stats.totalTokens += entry.total_tokens ?? 0;
      const model = entry.model ?? "unknown";
      const bucket = stats.byModel[model] ?? { calls: 0, totalTokens: 0 };
      bucket.calls += 1;
      bucket.totalTokens += entry.total_tokens ?? 0;
      stats.byModel[model] = bucket;
      if (entry.ts && entry.ts > stats.lastAt) stats.lastAt = entry.ts;
    } catch {
      // 跳过坏行
    }
  }

  return stats;
}
