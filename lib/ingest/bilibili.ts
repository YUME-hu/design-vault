import crypto from "node:crypto";
import { fetchText } from "./http";
import { SessionExpiredError, type Video } from "./types";

/**
 * B 站适配器：SESSDATA 只读，WBI 签名，请求间由 pipeline 负责加 1–3 秒延迟。
 * -101 一律抛 SessionExpiredError，让上层显式提示「SESSDATA 已过期」。
 */

const BILI_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// B 站 WBI 的 mixin 表（官方前端逻辑）
const MIXIN_TABLE = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19, 29, 28,
  14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40, 61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54,
  21, 56, 59, 6, 63, 57, 62, 11, 36, 20, 34, 44, 52,
];

export type BiliOptions = {
  cookie: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  backoffMs?: number;
};

export function extractSessdata(raw: string): string {
  if (!raw) return "";
  const match = raw.match(/SESSDATA=([^;]+)/i);
  return (match ? match[1] : raw).trim();
}

function headers(cookie: string): Record<string, string> {
  return {
    "User-Agent": BILI_UA,
    Referer: "https://space.bilibili.com/",
    Accept: "application/json, text/plain, */*",
    ...(cookie ? { Cookie: cookie } : {}),
  };
}

function filenameFromUrl(url: string): string {
  const name = url.split("/").pop() ?? "";
  return name.split(".")[0] ?? "";
}

export function mixinKey(imgKey: string, subKey: string): string {
  const raw = imgKey + subKey;
  return MIXIN_TABLE.map((index) => raw[index] ?? "").join("").slice(0, 32);
}

export function signWbi(
  params: Record<string, string | number>,
  imgKey: string,
  subKey: string,
  nowSeconds = Math.round(Date.now() / 1000),
): string {
  const mixin = mixinKey(imgKey, subKey);
  const merged: Record<string, string> = { ...params, wts: String(nowSeconds) };
  const query = Object.keys(merged)
    .sort()
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          String(merged[key]).replace(/[!'()*]/g, ""),
        )}`,
    )
    .join("&");
  const wRid = crypto.createHash("md5").update(query + mixin).digest("hex");
  return `${query}&w_rid=${wRid}`;
}

function parseBili(json: { code?: number; message?: string }): void {
  if (json.code === -101) throw new SessionExpiredError();
  if (json.code !== 0) {
    throw new Error(`B 站接口返回 ${json.code}：${json.message ?? "未知错误"}`);
  }
}

export async function getWbiKeys(options: BiliOptions): Promise<{ imgKey: string; subKey: string }> {
  const res = await fetchText(
    "https://api.bilibili.com/x/web-interface/nav",
    { headers: headers(options.cookie) },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!res.ok) throw new Error(`B 站 nav 请求失败：${res.error ?? res.status}`);
  const json = JSON.parse(res.text) as {
    code?: number;
    message?: string;
    data?: { wbi_img?: { img_url?: string; sub_url?: string } };
  };
  parseBili(json);
  const imgUrl = json.data?.wbi_img?.img_url ?? "";
  const subUrl = json.data?.wbi_img?.sub_url ?? "";
  if (!imgUrl || !subUrl) throw new Error("B 站 nav 没有返回 wbi_img");
  return { imgKey: filenameFromUrl(imgUrl), subKey: filenameFromUrl(subUrl) };
}

export async function getBuvid3(options: BiliOptions): Promise<string> {
  const res = await fetchText(
    "https://api.bilibili.com/x/frontend/finger/spi",
    { headers: headers("") },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!res.ok) return "";
  try {
    const json = JSON.parse(res.text) as { data?: { b_3?: string } };
    return json.data?.b_3 ?? "";
  } catch {
    return "";
  }
}

export function buildCookie(sessdata: string, buvid3: string): string {
  return [sessdata ? `SESSDATA=${sessdata}` : "", buvid3 ? `buvid3=${buvid3}` : ""]
    .filter(Boolean)
    .join("; ");
}

export async function listVideos(
  uid: string,
  options: BiliOptions & { limit?: number },
): Promise<Video[]> {
  const limit = options.limit ?? 5;
  const { imgKey, subKey } = await getWbiKeys(options);

  const query = signWbi(
    {
      mid: uid,
      ps: limit,
      pn: 1,
      order: "pubdate",
      platform: "web",
      web_location: 1550101,
      dm_img_list: "[]",
      dm_img_str: "",
      dm_cover_img_str: "",
    },
    imgKey,
    subKey,
  );

  const res = await fetchText(
    `https://api.bilibili.com/x/space/wbi/arc/search?${query}`,
    { headers: headers(options.cookie) },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!res.ok) throw new Error(`B 站视频列表请求失败：${res.error ?? res.status}`);

  const json = JSON.parse(res.text) as {
    code?: number;
    message?: string;
    data?: {
      list?: {
        vlist?: {
          bvid?: string;
          title?: string;
          description?: string;
          created?: number;
        }[];
      };
    };
  };
  parseBili(json);

  const list = json.data?.list?.vlist ?? [];
  return list
    .filter((item) => Boolean(item.bvid))
    .slice(0, limit)
    .map((item) => ({
      bvid: item.bvid ?? "",
      title: item.title ?? "",
      desc: item.description ?? "",
      pubdate: item.created ?? 0,
    }));
}

export async function getUserName(
  uid: string,
  options: BiliOptions,
): Promise<string | null> {  const res = await fetchText(
    `https://api.bilibili.com/x/web-interface/card?mid=${encodeURIComponent(uid)}`,
    { headers: headers(options.cookie) },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!res.ok) return null;
  try {
    const json = JSON.parse(res.text) as {
      code?: number;
      data?: { card?: { name?: string } };
    };
    if (json.code === -101) throw new SessionExpiredError();
    return json.data?.card?.name ?? null;
  } catch (error) {
    if (error instanceof SessionExpiredError) throw error;
    return null;
  }
}

/**
 * 完整简介：`/x/space/wbi/arc/search` 返回的 description 会被截断，
 * GitHub 链接经常就藏在被截掉的那一段里，所以逐条补一次 view 接口。
 */
export async function getVideoDesc(
  bvid: string,
  options: BiliOptions,
): Promise<string | null> {
  const res = await fetchText(
    `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`,
    { headers: headers(options.cookie) },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!res.ok) return null;

  try {
    const json = JSON.parse(res.text) as {
      code?: number;
      message?: string;
      data?: { desc?: string };
    };
    parseBili(json);
    return json.data?.desc ?? null;
  } catch (error) {
    if (error instanceof SessionExpiredError) throw error;
    return null;
  }
}


/**
 * CC 字幕：view 拿 cid → player/v2 拿字幕列表 → 下载字幕 JSON 拼成纯文本。
 * 没有字幕 / 接口失败都返回 null（降级链路由上层决定要不要写 pending）。
 */
export async function getSubtitle(
  bvid: string,
  options: BiliOptions,
): Promise<string | null> {
  const view = await fetchText(
    `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`,
    { headers: headers(options.cookie) },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!view.ok) return null;

  let cid = 0;
  try {
    const json = JSON.parse(view.text) as {
      code?: number;
      message?: string;
      data?: { cid?: number; pages?: { cid?: number }[] };
    };
    parseBili(json);
    cid = json.data?.cid ?? json.data?.pages?.[0]?.cid ?? 0;
  } catch (error) {
    if (error instanceof SessionExpiredError) throw error;
    return null;
  }
  if (!cid) return null;

  const player = await fetchText(
    `https://api.bilibili.com/x/player/v2?bvid=${encodeURIComponent(bvid)}&cid=${cid}`,
    { headers: headers(options.cookie) },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!player.ok) return null;

  let subtitleUrl = "";
  try {
    const json = JSON.parse(player.text) as {
      code?: number;
      data?: { subtitle?: { subtitles?: { lan?: string; subtitle_url?: string }[] } };
    };
    if (json.code === -101) throw new SessionExpiredError();
    const list = json.data?.subtitle?.subtitles ?? [];
    const picked = list.find((item) => /zh/i.test(item.lan ?? "")) ?? list[0];
    subtitleUrl = picked?.subtitle_url ?? "";
  } catch (error) {
    if (error instanceof SessionExpiredError) throw error;
    return null;
  }

  if (!subtitleUrl) return null;
  const url = subtitleUrl.startsWith("//") ? `https:${subtitleUrl}` : subtitleUrl;

  const subtitle = await fetchText(
    url,
    { headers: headers("") },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!subtitle.ok) return null;

  try {
    const json = JSON.parse(subtitle.text) as { body?: { content?: string }[] };
    const text = (json.body ?? [])
      .map((line) => line.content ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    return text.length > 40 ? text : null;
  } catch {
    return null;
  }
}

/** 关键词搜索（WBI 签名），返回原始 JSON，由 lib/search/parse 解析 */
export async function searchVideos(
  keyword: string,
  options: BiliOptions & { limit?: number; page?: number },
): Promise<unknown> {
  const { imgKey, subKey } = await getWbiKeys(options);
  const query = signWbi(
    {
      search_type: "video",
      keyword,
      page: options.page ?? 1,
      page_size: options.limit ?? 20,
    },
    imgKey,
    subKey,
  );

  const res = await fetchText(
    `https://api.bilibili.com/x/web-interface/wbi/search/type?${query}`,
    { headers: headers(options.cookie) },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!res.ok) throw new Error(`B 站搜索请求失败：${res.error ?? res.status}`);

  const json = JSON.parse(res.text) as { code?: number; message?: string };
  parseBili(json);
  return json;
}

/** 取一个低清直链（qn=16，durl）+ 时长，用于视觉截帧 */
export async function getPlayUrl(
  bvid: string,
  options: BiliOptions,
): Promise<{ url: string; durationSec: number } | null> {
  const view = await fetchText(
    `https://api.bilibili.com/x/web-interface/view?bvid=${encodeURIComponent(bvid)}`,
    { headers: headers(options.cookie) },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!view.ok) return null;
  const detail = JSON.parse(view.text) as { code?: number; data?: { cid?: number } };
  parseBili(detail);
  const cid = detail.data?.cid;
  if (!cid) return null;

  const play = await fetchText(
    `https://api.bilibili.com/x/player/playurl?bvid=${encodeURIComponent(bvid)}&cid=${cid}&qn=16&fnval=1`,
    { headers: headers(options.cookie) },
    { fetchImpl: options.fetchImpl, timeoutMs: options.timeoutMs, backoffMs: options.backoffMs },
  );
  if (!play.ok) return null;
  const json = JSON.parse(play.text) as {
    code?: number;
    data?: { durl?: { url?: string; length?: number }[] };
  };
  parseBili(json);
  const first = json.data?.durl?.[0];
  if (!first?.url) return null;
  return { url: first.url, durationSec: Math.round((first.length ?? 60_000) / 1000) };
}
