import { NextResponse } from "next/server";

/** 启动器健康检查 */
export async function GET() {
  return NextResponse.json({ ok: true, service: "design-vault", at: new Date().toISOString() });
}
