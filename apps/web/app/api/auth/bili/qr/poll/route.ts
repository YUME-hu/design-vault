import { NextResponse, type NextRequest } from "next/server";
import { pollQr, fetchUserName } from "@design-vault/adapters/auth/login";
import { clearBiliSession, saveBiliSession, secretsReady } from "@design-vault/store/secrets";
import { deleteQrSession, getQrSession, QR_COOKIE } from "@/lib/auth/qr-state";

/** 轮询扫码状态；成功时加密落盘并清掉短期 key */
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(QR_COOKIE)?.value ?? "";
  const entry = sessionId ? getQrSession(sessionId) : null;
  if (!entry) {
    return NextResponse.json({ ok: false, status: "expired", error: "二维码已过期，请重新生成" }, { status: 410 });
  }

  try {
    const result = await pollQr(entry.key);
    if (result.status !== "confirmed") {
      return NextResponse.json({ ok: true, status: result.status });
    }

    if (!secretsReady()) {
      return NextResponse.json(
        { ok: false, status: "error", error: "缺少 DESIGN_VAULT_SECRET，无法保存登录凭证" },
        { status: 500 },
      );
    }

    const now = new Date();
    const expiresAt = result.expiresAt || new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString();
    const name = await fetchUserName(result.cookie ?? "");
    saveBiliSession({
      uid: result.uid ?? "",
      name,
      cookie: result.cookie ?? "",
      createdAt: now.toISOString(),
      expiresAt,
    });

    deleteQrSession(sessionId);
    const response = NextResponse.json({ ok: true, status: "confirmed", uid: result.uid, name });
    response.cookies.set(QR_COOKIE, "", { path: "/api/auth/bili", maxAge: 0 });
    return response;
  } catch (error) {
    return NextResponse.json({ ok: false, status: "error", error: (error as Error).message }, { status: 502 });
  }
}
