/** 收藏夹相关的纯解析：B 站 payload → 归一化模型 + 增量过滤。不做网络。 */

export type FavFolder = {
  id: string;
  title: string;
  count: number;
};

export type FavVideo = {
  bvid: string;
  title: string;
  author: string;
  cover: string;
  duration: number;
  pubtime: number;
};

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function number(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function cover(value: unknown): string {
  const url = text(value);
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) return url;
  return `https://${url.replace(/^\/+/, "")}`;
}

export function parseFavFolders(payload: unknown): FavFolder[] {
  const list = (payload as { data?: { list?: unknown } } | null)?.data?.list;
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => {
      const record = item as Record<string, unknown>;
      const id = record.id;
      const title = text(record.title);
      if ((typeof id !== "string" && typeof id !== "number") || !title) return null;
      return { id: String(id), title, count: number(record.media_count) };
    })
    .filter((item): item is FavFolder => item !== null);
}

export type FavVideoPage = {
  videos: FavVideo[];
  hasMore: boolean;
  total: number;
};

export function parseFavVideos(payload: unknown): FavVideoPage {
  const data = (payload as { data?: Record<string, unknown> } | null)?.data;
  const medias = Array.isArray(data?.medias) ? (data!.medias as Record<string, unknown>[]) : [];
  const videos = medias
    .map((item) => {
      const bvid = text(item.bvid);
      const title = text(item.title);
      if (!bvid || !title) return null;
      return {
        bvid,
        title,
        author: text((item.upper as { name?: unknown } | undefined)?.name),
        cover: cover(item.cover),
        duration: number(item.duration),
        pubtime: number(item.pubtime) || number(item.ctime),
      };
    })
    .filter((item): item is FavVideo => item !== null);

  return {
    videos,
    hasMore: Boolean(data?.has_more),
    total: number((data?.info as { media_count?: unknown } | undefined)?.media_count) || videos.length,
  };
}

/** 增量：pubtime 严格大于上次扫描到的最大 pubtime 才算「新」 */
export function filterNewVideos(videos: FavVideo[], lastPubtime: number): FavVideo[] {
  if (!lastPubtime) return videos;
  return videos.filter((video) => video.pubtime > lastPubtime);
}
