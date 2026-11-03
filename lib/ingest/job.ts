import crypto from "node:crypto";
import { sleep } from "./http";
import { appendPending } from "./pending-store";
import { readUpstreams } from "./config";
import { readIngestState, writeIngestState } from "./state";
import { collectAllowedTags } from "./tags";
import { checkDuplicate } from "./dedupe-store";
import { runIngest } from "./pipeline";
import {
  buildCookie,
  extractSessdata,
  getBuvid3,
  getSubtitle,
  getUserName,
  getVideoDesc,
  listVideos,
} from "./bilibili";
import { fetchReadme } from "./github";
import { extractStyle } from "./deepseek";
import type { IngestError, IngestProgress, IngestResult } from "./types";

/**
 * 任务注册表：本地单进程，内存里只保留最近一次任务。
 * 抓取本身由 pipeline 跑，这里负责：读配置 / 拼真实适配器 / 落 ingest-state。
 */

export type JobSnapshot = {
  jobId: string;
  status: "running" | "done" | "failed";
  progress: IngestProgress;
  result: IngestResult | null;
  error: IngestError | null;
};

const initialProgress: IngestProgress = {
  status: "running",
  upstreamIndex: 0,
  upstreamTotal: 0,
  currentUpstream: "",
  currentUpstreamName: "",
  videoIndex: 0,
  videoTotal: 0,
  currentVideo: "",
  added: 0,
  skipped: 0,
  failed: 0,
  message: "准备开始",
};

let current: JobSnapshot | null = null;
let running = false;

export function getSnapshot(): JobSnapshot | null {
  return current;
}

export function isRunning(): boolean {
  return running;
}

export type StartResult =
  | { ok: true; jobId: string }
  | { ok: false; status: number; error: string };

export function startIngest(options: { upstreams?: string[] } = {}): StartResult {
  if (running) return { ok: false, status: 409, error: "已有抓取任务在运行" };

  const configured = readUpstreams();
  const wanted = options.upstreams?.map((uid) => uid.trim()).filter(Boolean);
  const upstreams = wanted && wanted.length > 0
    ? configured.filter((item) => wanted.includes(item.uid))
    : configured;
  if (upstreams.length === 0) {
    return { ok: false, status: 400, error: "config/upstreams.json 里没有 UP 主" };
  }

  const sessdata = extractSessdata(process.env.BILIBILI_SESSDATA ?? "");
  if (!sessdata) {
    return { ok: false, status: 400, error: "缺少 BILIBILI_SESSDATA（请在 .env.local 配置）" };
  }
  const apiKey = process.env.DEEPSEEK_API_KEY ?? "";
  if (!apiKey) {
    return { ok: false, status: 400, error: "缺少 DEEPSEEK_API_KEY（请在 .env.local 配置）" };
  }

  const jobId = crypto.randomUUID();
  running = true;
  current = {
    jobId,
    status: "running",
    progress: { ...initialProgress, upstreamTotal: upstreams.length, message: "抓取已启动" },
    result: null,
    error: null,
  };

  void execute(jobId, upstreams, sessdata, apiKey).finally(() => {
    running = false;
  });

  return { ok: true, jobId };
}

async function execute(
  jobId: string,
  upstreams: { uid: string; name?: string }[],
  sessdata: string,
  apiKey: string,
): Promise<void> {
  const names = new Map<string, string>();

  const onProgress = (progress: IngestProgress) => {
    if (progress.currentUpstreamName) names.set(progress.currentUpstream, progress.currentUpstreamName);
    current = {
      jobId,
      status: progress.status,
      progress,
      result: current?.result ?? null,
      error: current?.error ?? null,
    };
  };

  try {
    const buvid3 = await getBuvid3({ cookie: "" });
    const cookie = buildCookie(sessdata, buvid3);
    const allowedTags = collectAllowedTags();

    const result = await runIngest({
      upstreams,
      bilibili: {
        listVideos: (uid, limit) => listVideos(uid, { cookie, limit }),
        getUserName: (uid) => getUserName(uid, { cookie }),
        getVideoDesc: (bvid) => getVideoDesc(bvid, { cookie }),
        getSubtitle: (bvid) => getSubtitle(bvid, { cookie }),
      },
      github: {
        fetchReadme: (repo) =>
          fetchReadme(repo, { token: process.env.GITHUB_TOKEN || undefined }),
      },
      llm: {
        extract: (input) => extractStyle(input, { apiKey, allowedTags }),
      },
      store: { append: (items) => appendPending(items) },
      dedupe: (name) => {
        const match = checkDuplicate(name);
        return match ? { level: match.level, match: { id: match.id, name: match.name } } : null;
      },
      now: () => new Date(),
      sleep,
      random: Math.random,
      onProgress,
      perUpstream: 5,
      delayRange: [1000, 3000],
    });

    current = {
      jobId,
      status: result.error ? "failed" : "done",
      progress: {
        ...(current?.progress ?? initialProgress),
        status: result.error ? "failed" : "done",
        added: result.summary.added,
        skipped: result.summary.skipped,
        failed: result.summary.failed,
        message: result.error?.message ?? "抓取完成",
      },
      result,
      error: result.error ?? null,
    };

    persistState(upstreams, names, result);
  } catch (error) {
    const message = (error as Error).message;
    current = {
      jobId,
      status: "failed",
      progress: {
        ...(current?.progress ?? initialProgress),
        status: "failed",
        message,
      },
      result: current?.result ?? null,
      error: { code: "UNKNOWN", message },
    };

    persistState(upstreams, names, {
      summary: { added: 0, skipped: 0, failed: 0, failures: [], duplicates: [] },
      error: { code: "UNKNOWN", message },
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
    });
  }
}

function persistState(
  upstreams: { uid: string; name?: string }[],
  names: Map<string, string>,
  result: IngestResult,
): void {
  try {
    const state = readIngestState();
    const checkedAt = result.finishedAt;

    for (const upstream of upstreams) {
      state.upstreams[upstream.uid] = {
        name: names.get(upstream.uid) ?? state.upstreams[upstream.uid]?.name ?? upstream.name ?? "",
        lastCheckedAt: checkedAt,
      };
    }

    const failureList = result.summary.failures.map((failure) => ({
      bvid: failure.video,
      reason: failure.reason,
      at: result.finishedAt,
    }));
    for (const failure of failureList) {
      if (failure.bvid) state.videos[failure.bvid] = { status: "failed", at: failure.at };
    }

    state.lastRun = {
      startedAt: result.startedAt,
      finishedAt: result.finishedAt,
      added: result.summary.added,
      skipped: result.summary.skipped,
      failed: result.summary.failed,
      error: result.error?.message ?? "",
      status: result.error ? "failed" : "done",
      failures: failureList,
    };

    writeIngestState(state);
  } catch {
    // 状态写失败不影响抓取结果
  }
}
