import { NextResponse } from "next/server";
import { clearBiliSession } from "@design-vault/store/secrets";

/** 登出：删掉加密凭证 */
export async function DELETE() {
  clearBiliSession();
  return NextResponse.json({ ok: true });
}
