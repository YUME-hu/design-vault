import { clearBiliSession, loadBiliSession } from "@design-vault/store/secrets";

export type BiliCookieSource = "session" | "env" | "none";

export type BiliCookie = {
  cookie: string;
  source: BiliCookieSource;
};

/** 加密会话优先，其次 .env.local 的 BILIBILI_SESSDATA（CI / 脚本兼容） */
export function getBiliCookie(): BiliCookie {
  try {
    const session = loadBiliSession();
    if (session?.cookie) {
      const expired = session.expiresAt ? Date.parse(session.expiresAt) <= Date.now() : false;
      if (!expired) return { cookie: session.cookie, source: "session" };
    }
  } catch {
    // 凭证损坏时退回环境变量
  }

  const env = process.env.BILIBILI_SESSDATA?.trim() ?? "";
  if (env) return { cookie: env, source: "env" };
  return { cookie: "", source: "none" };
}

/** B 站返回 -101 时调用：清掉加密凭证，前端提示重新扫码 */
export function clearExpiredBiliSession(): void {
  try {
    clearBiliSession();
  } catch {
    // 删除失败不影响后续提示
  }
}
