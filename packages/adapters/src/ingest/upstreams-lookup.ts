import { getBiliCookie } from "../auth/session";
import { buildCookie, extractSessdata, getBuvid3, getUserName } from "./bilibili";

/** 添加订阅时用 SESSDATA 查一次真实昵称；查不到就明确报错，不写脏 UID */
export async function lookupUpstreamName(
  uid: string,
): Promise<{ ok: true; name: string } | { ok: false; error: string }> {
  const bili = getBiliCookie();
  const sessdata = extractSessdata(bili.cookie);
  if (!sessdata) {
    return { ok: false, error: "缺少 B 站登录凭证（扫码或配置 BILIBILI_SESSDATA）" };
  }

  try {
    const buvid3 = await getBuvid3({ cookie: "" });
    const name = await getUserName(uid, { cookie: buildCookie(sessdata, buvid3) });
    if (!name) {
      return { ok: false, error: `没有查到 UID ${uid} 的昵称，确认 UID 是否正确` };
    }
    return { ok: true, name };
  } catch (error) {
    return { ok: false, error: `B 站接口失败：${(error as Error).message}` };
  }
}
