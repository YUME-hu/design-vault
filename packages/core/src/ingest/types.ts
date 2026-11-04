import type { ColorDirection, PendingItem, Style } from "../schema";

/** 采集链路用到的共享类型（pipeline 与各适配器都只依赖这些） */

export type Upstream = { uid: string; name?: string };

export type Video = {
  bvid: string;
  title: string;
  desc: string;
  pubdate: number;
};

export type RepoRef = { owner: string; repo: string; url: string };

export type ReadmeResult =
  | { ok: true; text: string }
  | { ok: false; reason: "404" | "error"; message: string };

export type LlmInput = {
  upstreamName: string;
  video: Video;
  /** README 原文或 CC 字幕原文 */
  readme: string;
  repoUrl: string;
  sourceKind?: "readme" | "subtitle";
};

export type ExtractedEffect = {
  name: string;
  tech_stack: string[];
  description: string;
  code_snippet: string;
  performance_notes: string;
};

export type LlmExtraction =
  | {
      ok: true;
      hasDesignInfo: true;
      extractedEffects?: ExtractedEffect[];
      candidate: Partial<Style>;
      colorDirection: ColorDirection;
      reasoning: string;
      raw: string;
    }
  | { ok: true; hasDesignInfo: false; raw: string }
  | { ok: false; raw: string; error: string };

export type Failure = {
  upstream: string;
  video: string;
  title: string;
  stage: "bilibili" | "github" | "deepseek" | "video";
  reason: string;
};

export type IngestSummary = {
  added: number;
  skipped: number;
  failed: number;
  failures: Failure[];
  /** 命中高相似度、未写入的候选 */
  duplicates: { name: string; matchId: string; matchName: string }[];
};

export type IngestProgress = {
  status: "running" | "done" | "failed";
  upstreamIndex: number;
  upstreamTotal: number;
  currentUpstream: string;
  currentUpstreamName: string;
  videoIndex: number;
  videoTotal: number;
  currentVideo: string;
  added: number;
  skipped: number;
  failed: number;
  message: string;
};

export type IngestError = {
  code: "SESSION_EXPIRED" | "CONFIG" | "UNKNOWN";
  message: string;
};

export type IngestResult = {
  summary: IngestSummary;
  error?: IngestError;
  startedAt: string;
  finishedAt: string;
};

export type PendingDraft = Omit<PendingItem, "id" | "created_at" | "status">;

export type IngestDeps = {
  upstreams: Upstream[];
  bilibili: {
    listVideos(uid: string, limit: number): Promise<Video[]>;
    getUserName(uid: string): Promise<string | null>;
    /** 搜索结果里的简介是截断的，靠这个取完整简介（失败时退回列表里的简介） */
    getVideoDesc?(bvid: string): Promise<string | null>;
    /** 无 GitHub 时尝试 CC 字幕（有就抓，没有返回 null） */
    getSubtitle?(bvid: string): Promise<string | null>;
  };
  github: {
    fetchReadme(repo: RepoRef): Promise<ReadmeResult>;
  };
  llm: {
    extract(input: LlmInput): Promise<LlmExtraction>;
  };
  store: {
    append(items: PendingItem[]): { added: number; skipped: number };
  };
  now(): Date;
  sleep(ms: number): Promise<void>;
  random(): number;
  onProgress?(progress: IngestProgress): void;
  /** 跨源查重：返回 high 则跳过，medium 则写 duplicate_of */
  dedupe?(name: string): { level: "high" | "medium"; match: { id: string; name: string } } | null;
  /** 默认 5：每个 UP 主最近 5 个视频 */
  perUpstream?: number;
  /** B 站请求之间的随机延迟，默认 1000–3000ms */
  delayRange?: [number, number];
};

export class SessionExpiredError extends Error {
  readonly code = "SESSION_EXPIRED";
  constructor(message = "B 站返回 -101：账号未登录 / SESSDATA 已过期") {
    super(message);
    this.name = "SessionExpiredError";
  }
}
