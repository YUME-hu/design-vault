import {
  parseFavFolders,
  parseFavVideos,
  type FavFolder,
  type FavVideoPage,
} from "@design-vault/core/favorites";
import { getBiliCookie } from "../auth/session";
import { extractSessdata } from "./bilibili";
import { sleep } from "./http";

const BASE_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  Referer: "https://www.bilibili.com/",
};

let lastCall = 0;

async function biliGap(): Promise<void> {
  const wait = Math.max(0, lastCall + 1200 - Date.now());
  if (wait > 0) await sleep(wait);
  lastCall = Date.now();
}

function cookieString(): string {
  const { cookie } = getBiliCookie();
  if (!cookie) throw new Error("未登录：请先在 /settings 扫码，或配置 BILIBILI_SESSDATA");
  return cookie;
}

function uidFromCookie(cookie: string): string {
  const match = cookie.match(/DedeUserID=(\d+)/);
  return match?.[1] ?? "";
}

async function biliJson(url: string, cookie: string): Promise<unknown> {
  await biliGap();
  const response = await fetch(url, { headers: { ...BASE_HEADERS, Cookie: cookie } });
  if (!response.ok) throw new Error(`B 站接口返回 ${response.status}`);
  const json = (await response.json()) as { code?: number; message?: string };
  if (json.code === -101) throw new Error("SESSDATA 已过期，请重新扫码");
  if (json.code !== 0) throw new Error(`B 站接口错误：${json.message ?? json.code}`);
  return json;
}

/** 当前登录用户的自建收藏夹 */
export async function getFavFolders(): Promise<FavFolder[]> {
  const cookie = cookieString();
  const uid = uidFromCookie(cookie) || uidFromCookie(extractSessdata(cookie));
  if (!uid) throw new Error("无法从登录态解析 uid，请重新扫码");
  const json = await biliJson(
    `https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${encodeURIComponent(uid)}`,
    cookie,
  );
  return parseFavFolders(json);
}

/** 指定收藏夹的一页视频（每页 20） */
export async function getFavVideos(mediaId: string, page = 1): Promise<FavVideoPage> {
  const cookie = cookieString();
  const json = await biliJson(
    `https://api.bilibili.com/x/v3/fav/resource/list?media_id=${encodeURIComponent(mediaId)}&pn=${page}&ps=20&platform=web`,
    cookie,
  );
  return parseFavVideos(json);
}
