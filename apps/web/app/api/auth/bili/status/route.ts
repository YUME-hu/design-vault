import { NextResponse } from "next/server";
import { getBiliCookie } from "@design-vault/adapters/auth/session";
import { loadBiliSession, secretsReady } from "@design-vault/store/secrets";

/** 当前登录状态：加密会话 > 环境变量 */
export async function GET() {
  const current = getBiliCookie();
  let uid = "";
  let name = "";
  let expiresAt = "";

  if (current.source === "session") {
    try {
      const session = loadBiliSession();
      uid = session?.uid ?? "";
      name = session?.name ?? "";
      expiresAt = session?.expiresAt ?? "";
    } catch {
      // 凭证损坏按未登录展示
    }
  }

  return NextResponse.json({
    ok: true,
    loggedIn: current.source !== "none",
    source: current.source,
    uid,
    name,
    expiresAt,
    secretsReady: secretsReady(),
  });
}
