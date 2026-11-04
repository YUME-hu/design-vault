"use client";

import { useEffect, useMemo, useState } from "react";

type Folder = { id: string; title: string; count: number };
type Video = {
  bvid: string;
  title: string;
  author: string;
  cover: string;
  duration: number;
  pubtime: number;
  ingested?: boolean;
};
type Cursor = { title: string; lastScannedAt: string; lastVideoPubtime: number; lastPage: number };
type BatchResult = { bvid: string; title: string; status: string; message: string };
type BatchJob = {
  status: "running" | "done" | "error";
  index: number;
  total: number;
  message: string;
  results: BatchResult[];
  error: string;
};

export function FavExplorer() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const [mediaId, setMediaId] = useState("");
  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [skipped, setSkipped] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState<BatchJob | null>(null);

  const cursor = mediaId ? cursors[mediaId] : undefined;

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/favorites", { cache: "no-store" });
        const data = (await response.json()) as {
          ok?: boolean;
          folders?: Folder[];
          state?: Record<string, Cursor>;
          error?: string;
        };
        if (!response.ok || !data.ok) {
          setError(data.error ?? "读取收藏夹失败");
          return;
        }
        setFolders(data.folders ?? []);
        setCursors(data.state ?? {});
      } catch (cause) {
        setError((cause as Error).message);
      }
    })();
  }, []);

  async function load(media: string, nextPage: number) {
    setLoading(true);
    setError("");
    try {
      // 保守策略：始终拉最新一页，不用 pubtime 游标过滤，未勾选的视频下次仍然出现
      const since = 0;
      const response = await fetch(
        `/api/favorites/${encodeURIComponent(media)}?page=${nextPage}&since=${since}`,
        { cache: "no-store" },
      );
      const data = (await response.json()) as {
        ok?: boolean;
        videos?: Video[];
        skipped?: number;
        hasMore?: boolean;
        total?: number;
        error?: string;
      };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "读取视频失败");
        return;
      }
      setVideos((current) => (nextPage === 1 ? (data.videos ?? []) : [...current, ...(data.videos ?? [])]));
      setPage(nextPage);
      setHasMore(Boolean(data.hasMore));
      setTotal(data.total ?? 0);
      setSkipped((current) => (nextPage === 1 ? (data.skipped ?? 0) : current + (data.skipped ?? 0)));
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }

  async function chooseFolder(id: string) {
    setMediaId(id);
    setPage(1);
    setVideos([]);
    setSelected(new Set());
    if (id) await load(id, 1);
  }

  function toggle(bvid: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(bvid)) next.delete(bvid);
      else next.add(bvid);
      return next;
    });
  }

  const selectedVideos = useMemo(
    () => videos.filter((video) => selected.has(video.bvid)),
    [videos, selected],
  );

  async function extract() {
    if (selectedVideos.length === 0) return;
    setError("");
    try {
      const response = await fetch("/api/favorites/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videos: selectedVideos.map((video) => ({
            bvid: video.bvid,
            title: video.title,
            author: video.author,
            mid: 0,
          })),
        }),
      });
      const data = (await response.json()) as { ok?: boolean; jobId?: string; error?: string };
      if (!response.ok || !data.ok || !data.jobId) {
        setError(data.error ?? "批量提取失败");
        return;
      }

      const jobId = data.jobId;
      const timer = setInterval(async () => {
        const poll = await fetch(`/api/favorites/extract?id=${jobId}`, { cache: "no-store" });
        const payload = (await poll.json()) as { ok?: boolean; job?: BatchJob };
        if (!payload.ok || !payload.job) return;
        setJob(payload.job);
        if (payload.job.status !== "running") {
          clearInterval(timer);
          if (mediaId) {
            // 只记录操作时间，不推进 pubtime 游标（未勾选的视频下次仍要出现）
            await fetch(`/api/favorites/${encodeURIComponent(mediaId)}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: folders.find((folder) => folder.id === mediaId)?.title ?? "",
                lastScannedAt: new Date().toISOString(),
              }),
            });
          }
        }
      }, 1500);
    } catch (cause) {
      setError((cause as Error).message);
    }
  }

  return (
    <div data-testid="fav-explorer" className="mt-4">
      <div className="flex flex-col gap-2 border border-charcoal bg-white p-3 sm:flex-row sm:items-end">
        <label className="min-w-0 flex-1">
          <span className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">收藏夹</span>
          <select
            data-testid="fav-folder"
            value={mediaId}
            onChange={(event) => void chooseFolder(event.target.value)}
            className="mono mt-1 h-9 w-full border border-hairline-strong bg-paper px-2 text-[11px]"
          >
            <option value="">选择一个收藏夹…</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.title}（{folder.count}）
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          data-testid="fav-extract"
          onClick={extract}
          disabled={selectedVideos.length === 0 || job?.status === "running"}
          className="mono h-9 border border-charcoal bg-charcoal px-4 text-[9px] uppercase tracking-[0.16em] text-paper disabled:opacity-40"
        >
          批量提取（{selectedVideos.length}）
        </button>
      </div>

      {cursor && (
        <p className="mono mt-2 text-[9px] text-ink-faded">
          上次扫描 {cursor.lastScannedAt ? cursor.lastScannedAt.slice(0, 19).replace("T", " ") : "—"} · 增量跳过 {skipped} 条
        </p>
      )}
      {error && <p data-testid="fav-error" className="mono mt-2 border border-[#B3261E] px-2 py-1 text-[9px] text-[#B3261E]">{error}</p>}

      {job && (
        <div data-testid="fav-job" className="mono mt-2 border border-hairline-strong bg-white px-2 py-1 text-[9px] text-ink-soft">
          {job.message}（{job.index}/{job.total}）
          {job.status === "done" && " · 完成"}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setSelected(new Set(videos.filter((video) => !video.ingested).map((video) => video.bvid)))}
          className="mono text-[9px] uppercase tracking-[0.12em] text-ink-soft underline underline-offset-4"
        >
          全选本页
        </button>
        <span className="mono text-[9px] text-ink-faded">
          已选 {selected.size} / {videos.length} · 共 {total} 条
        </span>
      </div>

      <ul data-testid="fav-list" className="mt-2 border border-charcoal bg-white">
        {videos.map((video) => {
          const result = job?.results.find((item) => item.bvid === video.bvid);
          return (
            <li key={video.bvid} data-bvid={video.bvid} className="flex items-start gap-3 border-b border-hairline p-2 last:border-b-0">
              <input
                type="checkbox"
                checked={selected.has(video.bvid)}
                onChange={() => toggle(video.bvid)}
                disabled={Boolean(video.ingested)}
                className="mt-1 disabled:opacity-30"
                aria-label={`选择 ${video.title}`}
              />
              {video.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={video.cover} alt="" referrerPolicy="no-referrer" className="h-[48px] w-[84px] border border-hairline object-cover" />
              )}
              <div className="min-w-0 flex-1">
                <p className={`line-clamp-1 text-[12px] font-bold ${video.ingested ? "text-ink-faded" : "text-charcoal"}`}>
                  {video.title}
                  {video.ingested && (
                    <span className="mono ml-2 border border-hairline-strong px-1 py-[1px] text-[7px] uppercase tracking-[0.1em] text-ink-faded">
                      已提取
                    </span>
                  )}
                </p>
                <p className="mono mt-1 text-[9px] text-ink-faded">
                  {video.author || "—"} · {video.bvid}
                </p>
                {result && (
                  <p className={`mono mt-1 text-[9px] ${result.status === "error" ? "text-[#B3261E]" : "text-ink-soft"}`}>
                    {result.message}
                  </p>
                )}
              </div>
            </li>
          );
        })}
        {videos.length === 0 && !loading && (
          <li className="px-3 py-6 text-[12px] text-ink-faded">{mediaId ? "这个收藏夹没有新视频。" : "先选一个收藏夹。"}</li>
        )}
      </ul>

      {hasMore && (
        <button
          type="button"
          onClick={() => void load(mediaId, page + 1)}
          disabled={loading}
          className="mono mt-3 h-9 w-full border border-charcoal px-4 text-[9px] uppercase tracking-[0.16em] text-charcoal disabled:opacity-40"
        >
          {loading ? "加载中…" : "加载下一页"}
        </button>
      )}
    </div>
  );
}
