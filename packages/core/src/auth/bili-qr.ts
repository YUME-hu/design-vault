/** B 站扫码登录的纯逻辑：URL、状态码映射、Set-Cookie 解析。不做网络、不读文件。 */

export const QR_TTL_MS = 180_000;

export type QrStatus = "waiting" | "scanned" | "confirmed" | "expired" | "unknown";

/** 86101 未扫码 / 86090 已扫码待确认 / 0 成功 / 86038 过期 */
export function qrStatusFromCode(code: number): QrStatus {
  if (code === 0) return "confirmed";
  if (code === 86101) return "waiting";
  if (code === 86090) return "scanned";
  if (code === 86038) return "expired";
  return "unknown";
}

export function buildQrGenerateUrl(): string {
  return "https://passport.bilibili.com/x/passport-login/web/qrcode/generate";
}

export function buildQrPollUrl(qrcodeKey: string): string {
  return `https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${encodeURIComponent(qrcodeKey)}`;
}

const COOKIE_NAMES = ["SESSDATA", "bili_jct", "DedeUserID", "buvid3", "DedeUserID__ckMd5", "sid"];

export type ParsedCookies = {
  cookie: string;
  uid: string;
  expiresAt: string;
};

/** 从 passport 的 Set-Cookie 头里挑出登录相关 cookie（Node fetch 用 headers.getSetCookie()） */
export function parseSetCookieHeaders(headers: string[]): ParsedCookies {
  const pairs = new Map<string, string>();
  let expiresAt = "";

  for (const header of headers) {
    const [pair] = header.split(";");
    const index = pair.indexOf("=");
    if (index <= 0) continue;
    const name = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (!COOKIE_NAMES.includes(name)) continue;
    pairs.set(name, value);

    const expires = header.match(/Expires=([^;]+)/i)?.[1];
    if (expires) {
      const time = new Date(expires).getTime();
      if (Number.isFinite(time)) {
        const iso = new Date(time).toISOString();
        if (!expiresAt || iso > expiresAt) expiresAt = iso;
      }
    }
  }

  return {
    cookie: [...pairs.entries()].map(([name, value]) => `${name}=${value}`).join("; "),
    uid: pairs.get("DedeUserID") ?? "",
    expiresAt,
  };
}
