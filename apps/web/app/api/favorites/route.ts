import { NextResponse } from "next/server";
import { getFavFolders } from "@design-vault/adapters/ingest/favorites";
import { readIngestState } from "@design-vault/store/state";

/** 当前用户自建收藏夹 + 上次扫描游标 */
export async function GET() {
  try {
    const folders = await getFavFolders();
    return NextResponse.json({ ok: true, folders, state: readIngestState().favorites });
  } catch (error) {
    const message = (error as Error).message;
    const status = /未登录|过期/.test(message) ? 401 : 502;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
