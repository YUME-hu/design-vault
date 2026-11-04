import crypto from "node:crypto";
import { getBiliCookie } from "../auth/session";
import { extractSessdata } from "../ingest/bilibili";
import { extractVideo } from "./extract";
import { createExtractDeps } from "./job";
import type { SearchVideo } from "./types";

export type BatchItem = {
  bvid: string;
  title: string;
  status: "queued" | "running" | "ok" | "skipped" | "error";
  message: string;
};

export type BatchJob = {
  id: string;
  status: "running" | "done" | "error";
  index: number;
  total: number;
  message: string;
  results: BatchItem[];
  error: string;
};

const jobs = new Map<string, BatchJob>();
export const MAX_BATCH = 20;

export function getBatchJob(id: string): BatchJob | null {
  return jobs.get(id) ?? null;
}

export function startBatch(
  videos: SearchVideo[],
): { ok: true; jobId: string } | { ok: false; status: number; error: string } {
  if (videos.length === 0) return { ok: false, status: 400, error: "没有选中任何视频" };
  if (videos.length > MAX_BATCH) {
    return { ok: false, status: 400, error: `单次最多 ${MAX_BATCH} 条，请分批提取` };
  }

  const bili = getBiliCookie();
  const sessdata = extractSessdata(bili.cookie);
  if (!sessdata) {
    return { ok: false, status: 400, error: "缺少 B 站登录凭证（请先扫码）" };
  }
  const apiKey = process.env.DEEPSEEK_API_KEY ?? "";
  if (!apiKey) {
    return { ok: false, status: 400, error: "缺少 DEEPSEEK_API_KEY，无法分析" };
  }

  const jobId = crypto.randomUUID();
  const job: BatchJob = {
    id: jobId,
    status: "running",
    index: 0,
    total: videos.length,
    message: "排队中…",
    results: videos.map((video) => ({
      bvid: video.bvid,
      title: video.title,
      status: "queued",
      message: "",
    })),
    error: "",
  };
  jobs.set(jobId, job);
  if (jobs.size > 10) {
    const oldest = jobs.keys().next().value;
    if (oldest) jobs.delete(oldest);
  }

  void (async () => {
    let active = -1;
    try {
      const deps = await createExtractDeps(sessdata, apiKey, (step, message) => {
        if (active >= 0 && job.results[active]) job.results[active].message = `${step} · ${message}`;
        job.message = `第 ${Math.max(active + 1, 1)} / ${videos.length} 个 · ${message}`;
      });

      for (let index = 0; index < videos.length; index += 1) {
        active = index;
        job.index = index + 1;
        job.results[index].status = "running";
        job.results[index].message = "开始提取…";

        const result = await extractVideo(deps, videos[index]);
        if (result.ok && result.kind === "pending") {
          job.results[index].status = "ok";
          job.results[index].message = `已写入 pending：${result.name}（${result.confidence}）`;
        } else if (result.ok) {
          job.results[index].status = "skipped";
          job.results[index].message = `跳过：${result.matchName ?? "重复"}`;
        } else {
          job.results[index].status = "error";
          job.results[index].message = result.error;
        }
      }

      job.status = "done";
      job.message = "全部处理完成";
    } catch (error) {
      job.status = "error";
      job.error = (error as Error).message;
      job.message = job.error;
      if (active >= 0 && job.results[active]) {
        job.results[active].status = "error";
        job.results[active].message = job.error;
      }
    }
  })();

  return { ok: true, jobId };
}
