import { NextResponse } from "next/server";
import { getFavVideos } from "@design-vault/adapters/ingest/favorites";
import { filterNewVideos } from "@design-vault/core/favorites";
import { readIngestState, writeIngestState } from "@design-vault/store/state";
import { readPending } from "@design-vault/store/pending";
import { readStylesFile } from "@design-vault/store/collections";

/** 收藏夹一页视频；since=上次 pubtime 时只返回更新的视频 */
export async function GET(
  request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  const { mediaId } = await context.params;
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
  const since = Number(url.searchParams.get("since") ?? "0") || 0;

  try {
    const result = await getFavVideos(mediaId, page);
    const fresh = filterNewVideos(result.videos, since);

    // 已入库（pending 或 styles）的 bvid，UI 上置灰防重复
    const ingested = new Set<string>();
    for (const item of readPending()) {
      const bvid = item.sources[0]?.video;
      if (bvid) ingested.add(bvid);
    }
    for (const style of readStylesFile()) {
      const bvid = style.sources[0]?.video;
      if (bvid) ingested.add(bvid);
    }
    const videos = fresh.map((video) => ({ ...video, ingested: ingested.has(video.bvid) }));

    return NextResponse.json({
      ok: true,
      page,
      videos,
      skipped: result.videos.length - fresh.length,
      hasMore: result.hasMore,
      total: result.total,
    });
  } catch (error) {
    const message = (error as Error).message;
    const status = /未登录|过期/.test(message) ? 401 : 502;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

/** 扫描完成后写入游标（lastScannedAt / lastVideoPubtime / lastPage） */
export async function POST(
  request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  const { mediaId } = await context.params;
  const body = (await request.json().catch(() => null)) as
    | { title?: string; lastScannedAt?: string; lastVideoPubtime?: number; lastPage?: number }
    | null;
  if (!body) return NextResponse.json({ ok: false, error: "请求体必须是 JSON" }, { status: 400 });

  const state = readIngestState();
  const previous = state.favorites[mediaId];
  state.favorites[mediaId] = {
    title: body.title ?? previous?.title ?? "",
    lastScannedAt: body.lastScannedAt ?? new Date().toISOString(),
    // 保守策略：没有明确传 pubtime 时保留旧游标，绝不因为「提取了 2 条」就把整页标记为已读
    lastVideoPubtime:
      typeof body.lastVideoPubtime === "number"
        ? body.lastVideoPubtime
        : (previous?.lastVideoPubtime ?? 0),
    lastPage: typeof body.lastPage === "number" ? body.lastPage : (previous?.lastPage ?? 1),
  };
  writeIngestState(state);
  return NextResponse.json({ ok: true, state: state.favorites[mediaId] });
}
