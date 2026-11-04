import crypto from "node:crypto";
import { clearExpiredBiliSession, getBiliCookie } from "../auth/session";
import { fetchReadme } from "../ingest/github";
import { checkDuplicate } from "../ingest/dedupe-store";
import { appendPending } from "../ingest/pending-store";
import { analyzeImage, extractStyle } from "../ingest/deepseek";
import { ffmpegStatus, runVisionFallback } from "../ingest/vision";
import { collectAllowedTags } from "../ingest/tags";
import {
  buildCookie,
  extractSessdata,
  getBuvid3,
  getPlayUrl,
  getSubtitle,
  getVideoDesc,
} from "../ingest/bilibili";
import { sleep } from "../ingest/http";
import { extractVideo } from "./extract";
import type { ExtractDeps, ExtractStep, SearchVideo } from "./types";

/**
 * 提取任务：单进程内存表 + 前端轮询。
 * 所有 B 站请求之间强制 1–3 秒间隔（跨任务生效，避免并发打爆风控）。
 */

export type ExtractJob = {
  id: string;
  bvid: string;
  status: "running" | "done" | "error";
  step: ExtractStep;
  message: string;
  result: Awaited<ReturnType<typeof extractVideo>> | null;
  error: string;
};

const jobs = new Map<string, ExtractJob>();
let lastBiliCall = 0;

async function biliGap(): Promise<void> {
  const target = 1000 + Math.floor(Math.random() * 2000);
  const wait = Math.max(0, lastBiliCall + target - Date.now());
  if (wait > 0) await sleep(wait);
  lastBiliCall = Date.now();
}

/** 组装真实依赖；单条提取与批量提取共用，避免两套网络接线 */
export async function createExtractDeps(
  sessdata: string,
  apiKey: string,
  onStep?: (step: ExtractStep, message: string) => void,
): Promise<ExtractDeps> {
  const buvid3 = await getBuvid3({ cookie: "" });
  const cookie = buildCookie(sessdata, buvid3);
  const allowedTags = collectAllowedTags();

  return {
    getDesc: async (bvid) => {
      await biliGap();
      return getVideoDesc(bvid, { cookie });
    },
    getSubtitle: async (bvid) => {
      await biliGap();
      return getSubtitle(bvid, { cookie });
    },
    fetchReadme: (repo) => fetchReadme(repo, { token: process.env.GITHUB_TOKEN || undefined }),
    llm: {
      extract: (input) => extractStyle(input, { apiKey, allowedTags }),
    },
    findDuplicate: (name) => {
      const match = checkDuplicate(name);
      return match ? { level: match.level, match: { id: match.id, name: match.name } } : null;
    },
    vision: async (video) => {
      const play = await getPlayUrl(video.bvid, { cookie });
      if (!play) return { ok: false, error: "拿不到视频直链，无法截帧" };
      const vision = await runVisionFallback(
        {
          download: async (url, dest) => {
            const { defaultDownload } = await import("../ingest/vision");
            await defaultDownload(url, dest);
          },
          extractFrames: async (videoPath, outDir, duration) => {
            const { defaultExtractFrames } = await import("../ingest/vision");
            return defaultExtractFrames(videoPath, outDir, duration);
          },
          analyze: (imagePath) => analyzeImage(imagePath, { apiKey }),
        },
        { bvid: video.bvid, durationSec: play.durationSec, playUrl: play.url },
        (step, message) => {
          onStep?.(step as ExtractStep, message);
        },
      );
      if (!vision.ok) return vision;
      return { ok: true, visual: vision.visual, montage: vision.montagePath };
    },
    appendPending: (items) => appendPending(items),
    now: () => new Date(),
    onStep,
  };
}

export function getExtractJob(id: string): ExtractJob | null {
  return jobs.get(id) ?? null;
}

export function startSearchExtract(
  video: SearchVideo,
): { ok: true; jobId: string } | { ok: false; status: number; error: string } {
  const bili = getBiliCookie();
  const sessdata = extractSessdata(bili.cookie);
  if (!sessdata) {
    return {
      ok: false,
      status: 400,
      error: "缺少 B 站登录凭证（请在 /settings 扫码，或在 .env.local 配置 BILIBILI_SESSDATA）",
    };
  }
  const apiKey = process.env.DEEPSEEK_API_KEY ?? "";
  if (!apiKey) {
    return { ok: false, status: 400, error: "缺少 DEEPSEEK_API_KEY，无法分析文本" };
  }

  const ffmpeg = ffmpegStatus();
  if (!ffmpeg.ok) {
    return {
      ok: false,
      status: 400,
      error: `ffmpeg 环境未就绪（找不到可执行文件：${ffmpeg.path}），视觉兜底不可用`,
    };
  }

  const jobId = crypto.randomUUID();
  const job: ExtractJob = {
    id: jobId,
    bvid: video.bvid,
    status: "running",
    step: "desc",
    message: "准备提取…",
    result: null,
    error: "",
  };
  jobs.set(jobId, job);

  if (jobs.size > 30) {
    const oldest = jobs.keys().next().value;
    if (oldest) jobs.delete(oldest);
  }

  void (async () => {
    try {
      const deps = await createExtractDeps(sessdata, apiKey, (step, message) => {
        job.step = step;
        job.message = message;
      });
      const result = await extractVideo(deps, video);
      job.result = result ?? null;
      job.status = result?.ok ? "done" : "error";
      job.error = result?.ok ? "" : (result?.error ?? "提取失败：任务没有返回结果");
      job.message = result?.ok ? job.message : job.error;
    } catch (error) {
      if ((error as { name?: string }).name === "SessionExpiredError") clearExpiredBiliSession();
      job.status = "error";
      job.step = "error";
      job.error = (error as Error).message;
      job.message = job.error;
    }
  })();

  return { ok: true, jobId };
}
