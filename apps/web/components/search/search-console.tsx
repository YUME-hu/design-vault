"use client";

import Link from "next/link";
import { useRef, useState } from "react";

type Video = {
  bvid: string;
  title: string;
  author: string;
  mid: number;
  play: number;
  cover: string;
  duration: string;
};

type ExtractResult =
  | { kind: "pending"; name: string; confidence: number; duplicateOf: string | null }
  | { kind: "duplicate"; matchName: string }
  | null;

type ExtractState = {
  status: "running" | "done" | "error";
  message: string;
  result: ExtractResult;
};

function formatPlay(value: number): string {
  if (value >= 100000000) return `${(value / 100000000).toFixed(1)} 亿`;
  if (value >= 10000) return `${(value / 10000).toFixed(1)} 万`;
  return String(value);
}

export function SearchConsole() {
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Video[]>([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [extracts, setExtracts] = useState<Record<string, ExtractState>>({});
  const timers = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = keyword.trim();
    if (!value) {
      setError("先输入关键词");
      return;
    }

    setSearching(true);
    setError("");
    setResults([]);
    setSearched(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: value }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        results?: Video[];
        error?: string;
      };
      if (!response.ok || !data.ok) {
        setError(data.error ?? `搜索失败（${response.status}）`);
        return;
      }
      setResults(data.results ?? []);
      if ((data.results ?? []).length === 0) setError("没有搜到结果，换个关键词试试");
    } catch (cause) {
      setError(`请求失败：${(cause as Error).message}`);
    } finally {
      setSearching(false);
    }
  }

  function stopTimer(bvid: string) {
    const timer = timers.current[bvid];
    if (timer) {
      clearInterval(timer);
      delete timers.current[bvid];
    }
  }

  async function handleExtract(video: Video) {
    setExtracts((current) => ({
      ...current,
      [video.bvid]: { status: "running", message: "正在启动…", result: null },
    }));

    try {
      const response = await fetch("/api/search/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bvid: video.bvid,
          title: video.title,
          author: video.author,
          mid: video.mid,
        }),
      });
      const data = (await response.json()) as { ok?: boolean; jobId?: string; error?: string };
      if (!response.ok || !data.ok || !data.jobId) {
        setExtracts((current) => ({
          ...current,
          [video.bvid]: {
            status: "error",
            message: data.error ?? `启动失败（${response.status}）`,
            result: null,
          },
        }));
        return;
      }

      const jobId = data.jobId;
      stopTimer(video.bvid);
      timers.current[video.bvid] = setInterval(async () => {
        try {
          const poll = await fetch(`/api/search/extract?id=${jobId}`, { cache: "no-store" });
          const payload = (await poll.json()) as {
            ok?: boolean;
            job?: {
              status: "running" | "done" | "error";
              step: string;
              message: string;
              error: string;
              result: ExtractResult & { kind?: string; ok?: boolean };
            };
          };
          if (!payload.ok || !payload.job) return;

          const job = payload.job;
          const result =
            job.result && (job.result as { kind?: string }).kind === "pending"
              ? (job.result as ExtractResult)
              : job.result && (job.result as { kind?: string }).kind === "duplicate"
                ? (job.result as ExtractResult)
                : null;

          setExtracts((current) => ({
            ...current,
            [video.bvid]: {
              status: job.status === "running" ? "running" : job.status === "done" ? "done" : "error",
              message: job.status === "error" ? job.error || job.message : job.message,
              result,
            },
          }));

          if (job.status !== "running") stopTimer(video.bvid);
        } catch {
          // 轮询失败继续等下一次
        }
      }, 700);
    } catch (cause) {
      setExtracts((current) => ({
        ...current,
        [video.bvid]: {
          status: "error",
          message: `请求失败：${(cause as Error).message}`,
          result: null,
        },
      }));
    }
  }

  return (
    <div className="mt-6" data-testid="search-console">
      <form
        onSubmit={handleSearch}
        className="flex flex-col gap-2 border border-charcoal bg-white p-3 sm:flex-row"
      >
        <input
          data-testid="search-input"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="风格名 / 技术栈 / 设计关键词，例如：赛博朋克 配色、Framer Motion"
          className="mono h-10 min-w-0 flex-1 border border-hairline-strong bg-paper px-3 text-[12px] text-charcoal placeholder:text-ink-faded focus:border-charcoal focus:outline-none"
        />
        <button
          type="submit"
          data-testid="search-submit"
          disabled={searching}
          className="mono h-10 shrink-0 border border-charcoal bg-charcoal px-6 text-[10px] uppercase tracking-[0.18em] text-paper hover:border-signal hover:bg-signal disabled:opacity-40"
        >
          {searching ? "搜索中…" : "搜索 →"}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          data-testid="search-error"
          className="mono mt-2 border border-[#B3261E] bg-white px-3 py-2 text-[10px] leading-relaxed text-[#B3261E]"
        >
          {error}
        </p>
      )}

      {searched && !searching && results.length > 0 && (
        <p className="mono mt-3 text-[9px] uppercase tracking-[0.14em] text-ink-faded">
          {results.length} 条结果 · 提取会写入 pending，不影响固定订阅
        </p>
      )}

      <ul className="mt-3 space-y-0 border border-charcoal bg-white">
        {results.map((video) => {
          const state = extracts[video.bvid];
          return (
            <li
              key={video.bvid}
              data-testid="search-result"
              data-bvid={video.bvid}
              className="flex flex-col gap-3 border-b border-charcoal p-3 last:border-b-0 sm:flex-row sm:items-center"
            >
              <div className="h-[68px] w-[120px] shrink-0 overflow-hidden border border-hairline-strong bg-paper">
                {video.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.cover}
                    alt=""
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] font-bold leading-snug text-charcoal">
                  {video.title}
                </p>
                <p className="mono mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] uppercase tracking-[0.1em] text-ink-faded">
                  <span>UP {video.author || "—"}</span>
                  <span>▶ {formatPlay(video.play)}</span>
                  <span className="text-charcoal">{video.bvid}</span>
                  {video.duration && <span>{video.duration}</span>}
                </p>
                {state && (
                  <p
                    data-testid="extract-status"
                    data-status={state.status}
                    className={
                      state.status === "error"
                        ? "mono mt-1 text-[9px] leading-relaxed text-[#B3261E]"
                        : "mono mt-1 text-[9px] leading-relaxed text-ink-soft"
                    }
                  >
                    {state.status === "running" && "◌ "}
                    {state.message}
                    {state.result?.kind === "pending" && (
                      <>
                        {" "}
                        ·{" "}
                        <Link
                          href="/pending"
                          className="underline underline-offset-4 hover:text-signal"
                        >
                          去审核 →
                        </Link>
                      </>
                    )}
                    {state.result?.kind === "duplicate" && (
                      <> · 发现相似风格：{state.result.matchName}</>
                    )}
                  </p>
                )}
              </div>

              <button
                type="button"
                data-testid="extract-button"
                onClick={() => handleExtract(video)}
                disabled={state?.status === "running"}
                className="mono h-9 shrink-0 border border-charcoal px-3 text-[9px] uppercase tracking-[0.14em] text-charcoal hover:bg-charcoal hover:text-paper disabled:opacity-40"
              >
                {state?.status === "running" ? "提取中…" : "提取此视频"}
              </button>
            </li>
          );
        })}
      </ul>

      {searched && !searching && results.length === 0 && !error && (
        <p className="mono mt-3 text-[11px] text-ink-faded">没有结果。</p>
      )}
    </div>
  );
}
