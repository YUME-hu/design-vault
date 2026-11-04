import { vaultHome } from "@design-vault/store/paths";
import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

/** 仅供审核页查看视觉兜底的拼图 */
export async function GET(_request: Request, context: { params: Promise<{ bvid: string }> }) {
  const { bvid } = await context.params;
  if (!/^[A-Za-z0-9]+$/.test(bvid)) {
    return NextResponse.json({ ok: false, error: "bvid 不合法" }, { status: 400 });
  }
  const file = path.join(vaultHome(), "data", "frames", bvid, "montage.png");
  if (!fs.existsSync(file)) {
    return NextResponse.json({ ok: false, error: "没有拼图" }, { status: 404 });
  }
  return new NextResponse(fs.readFileSync(file), {
    headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
  });
}
