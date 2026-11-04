import type { ReadmeResult, LlmInput, LlmExtraction } from "../ingest/types";

export type SearchVideo = {
  bvid: string;
  title: string;
  author: string;
  mid: number;
  play: number;
  cover: string;
  duration: string;
  pubdate: number;
};

export type ExtractStep =
  | "desc"
  | "github"
  | "readme"
  | "subtitle"
  | "analyze"
  | "dedupe"
  | "vision"
  | "download"
  | "frames"
  | "done"
  | "error";

export type ExtractDeps = {
  getDesc(bvid: string): Promise<string | null>;
  getSubtitle(bvid: string): Promise<string | null>;
  fetchReadme(repo: { owner: string; repo: string; url: string }): Promise<ReadmeResult>;
  llm: { extract(input: LlmInput): Promise<LlmExtraction> };
  findDuplicate(name: string): { level: "high" | "medium"; match: { id: string; name: string } } | null;
  vision?(video: SearchVideo): Promise<
    | { ok: true; visual: { name: string; summary: string; color_direction: import("../schema").ColorDirection; project_tags: string[] }; montage: string }
    | { ok: false; error: string }
  >;
  appendPending(items: import("../schema").PendingItem[]): { added: number; skipped: number };
  now(): Date;
  onStep?(step: ExtractStep, message: string): void;
};

export type ExtractOutcome =
  | {
      ok: true;
      kind: "pending";
      pendingId: string;
      name: string;
      confidence: number;
      duplicateOf: string | null;
      source: "readme" | "subtitle";
    }
  | { ok: true; kind: "duplicate"; name: string; matchId: string; matchName: string }
  | { ok: false; error: string };
