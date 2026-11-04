import { NextResponse } from "next/server";
import { requestQr } from "@design-vault/adapters/auth/login";
import { createQrSession, QR_COOKIE, QR_TTL_MS } from "@/lib/auth/qr-state";

/** 生成二维码：qrcode_key 只留在服务端，前端拿到 URL 自行渲染 */
export async function POST() {
  try {
    const { url, key } = await requestQr();
    const sessionId = createQrSession(key);
    const response = NextResponse.json({ ok: true, url });
    response.cookies.set(QR_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/api/auth/bili",
      maxAge: Math.floor(QR_TTL_MS / 1000),
    });
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 502 });
  }
}
