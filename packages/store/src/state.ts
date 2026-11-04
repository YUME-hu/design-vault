import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/** 订阅页要展示的「上次检查时间」等状态，和用户配置分开存 */

export const ingestStateSchema = z
  .object({
    upstreams: z
      .record(
        z.string(),
        z
          .object({
            name: z.string().default(""),
            lastCheckedAt: z.string().default(""),
          })
          .strict(),
      )
      .default({}),
    lastRun: z
      .object({
        startedAt: z.string().default(""),
        finishedAt: z.string().default(""),
        added: z.number().default(0),
        skipped: z.number().default(0),
        failed: z.number().default(0),
        error: z.string().default(""),
        status: z.enum(["done", "failed"]).default("done"),
        failures: z
          .array(
            z.object({
              bvid: z.string().default(""),
              reason: z.string().default(""),
              at: z.string().default(""),
            }).strict(),
          )
          .default([]),
      })
      .strict()
      .nullable()
      .default(null),
    /** 每条视频最近一次处理结果：失败的下轮会重试，成功的靠 pending 去重跳过 */
    videos: z
      .record(
        z.string(),
        z.object({ status: z.enum(["ok", "failed"]), at: z.string() }).strict(),
      )
      .default({}),
  })
  .strict();

export type IngestState = z.infer<typeof ingestStateSchema>;

import { dataPath } from "./paths";

const STATE_FILE = dataPath("ingest-state.json");

export function readIngestState(file = STATE_FILE): IngestState {
  if (!fs.existsSync(file)) return ingestStateSchema.parse({});
  try {
    return ingestStateSchema.parse(
      JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")),
    );
  } catch {
    return ingestStateSchema.parse({});
  }
}

export function writeIngestState(state: IngestState, file = STATE_FILE): void {
  const validated = ingestStateSchema.parse(state);
  const temp = `${file}.tmp`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(temp, `${JSON.stringify(validated, null, 2)}\n`, "utf8");
  fs.renameSync(temp, file);
}

export const INGEST_STATE_PATH = STATE_FILE;
