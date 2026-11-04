import type { SearchVideo } from "./types";

/** 搜索结果解析：纯函数，便于 mock 测试（B 站标题里带 <em> 高亮标签） */

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

export function normalizeCover(url: string): string {
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("http")) return url;
  return `https://${url.replace(/^\/+/, "")}`;
}

export function parseSearchPayload(json: unknown): SearchVideo[] {
  const data = (json as { data?: { result?: unknown } } | null)?.data;
  const result = Array.isArray(data?.result) ? (data!.result as Record<string, unknown>[]) : [];

  return result
    .filter((item) => typeof item.bvid === "string" && item.bvid.length > 0)
    .map((item) => ({
      bvid: String(item.bvid),
      title: stripHtml(String(item.title ?? "")),
      author: String(item.author ?? ""),
      mid: Number(item.mid) || 0,
      play: Number(item.play) || 0,
      cover: normalizeCover(String(item.pic ?? "")),
      duration: String(item.duration ?? ""),
      pubdate: Number(item.pubdate) || 0,
    }));
}
