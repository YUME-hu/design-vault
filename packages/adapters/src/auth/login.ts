import {
  buildQrGenerateUrl,
  buildQrPollUrl,
  parseSetCookieHeaders,
  qrStatusFromCode,
  type QrStatus,
} from "@design-vault/core/auth/bili-qr";

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  Referer: "https://www.bilibili.com/",
};

export async function requestQr(): Promise<{ url: string; key: string }> {
  const response = await fetch(buildQrGenerateUrl(), { headers: HEADERS });
  if (!response.ok) throw new Error(`B 站二维码接口返回 ${response.status}`);
  const json = (await response.json()) as {
    code?: number;
    message?: string;
    data?: { url?: string; qrcode_key?: string };
  };
  if (json.code !== 0 || !json.data?.url || !json.data.qrcode_key) {
    throw new Error(`生成二维码失败：${json.message ?? json.code ?? "未知错误"}`);
  }
  return { url: json.data.url, key: json.data.qrcode_key };
}

export type QrPollResult = {
  status: QrStatus;
  cookie?: string;
  uid?: string;
  expiresAt?: string;
};

export async function pollQr(qrcodeKey: string): Promise<QrPollResult> {
  const response = await fetch(buildQrPollUrl(qrcodeKey), { headers: HEADERS });
  if (!response.ok) throw new Error(`B 站轮询接口返回 ${response.status}`);
  const json = (await response.json()) as { code?: number; data?: { code?: number } };
  const status = qrStatusFromCode(json.data?.code ?? -1);
  if (status !== "confirmed") return { status };

  const headers =
    typeof response.headers.getSetCookie === "function" ? response.headers.getSetCookie() : [];
  return { status, ...parseSetCookieHeaders(headers) };
}

/** 扫码成功后用 cookie 换昵称，失败不阻塞登录 */
export async function fetchUserName(cookie: string): Promise<string> {
  try {
    const response = await fetch("https://api.bilibili.com/x/web-interface/nav", {
      headers: { ...HEADERS, Cookie: cookie },
    });
    const json = (await response.json()) as { data?: { uname?: string } };
    return json.data?.uname ?? "";
  } catch {
    return "";
  }
}
