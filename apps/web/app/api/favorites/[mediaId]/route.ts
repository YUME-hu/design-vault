import { NextResponse } from "next/server";
import { getFavVideos } from "@design-vault/adapters/ingest/favorites";
import { filterNewVideos } from "@design-vault/core/favorites";
import { readIngestState, writeIngestState } from "@design-vault/store/state";

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
    return NextResponse.json({
      ok: true,
      page,
      videos: fresh,
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
  state.favorites[mediaId] = {
    title: body.title ?? state.favorites[mediaId]?.title ?? "",
    lastScannedAt: body.lastScannedAt ?? new Date().toISOString(),
    lastVideoPubtime: Number(body.lastVideoPubtime) || 0,
    lastPage: Number(body.lastPage) || 1,
  };
  writeIngestState(state);
  return NextResponse.json({ ok: true, state: state.favorites[mediaId] });
}
