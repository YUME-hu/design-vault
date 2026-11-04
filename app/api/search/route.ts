import { NextResponse } from "next/server";
import { z } from "zod";
import { buildCookie, extractSessdata, getBuvid3, searchVideos } from "@design-vault/adapters/ingest/bilibili";
import { parseSearchPayload } from "@design-vault/adapters/search/parse";
import { SessionExpiredError } from "@design-vault/adapters/ingest/types";

/** 关键词搜索：服务端带 SESSDATA 调 B 站，前端只拿整理好的结果 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体必须是 JSON" }, { status: 400 });
  }

  const parsed = z
    .object({ keyword: z.string().trim().min(1).max(40) })
    .strict()
    .safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "关键词长度需要在 1–40 字之间" },
      { status: 400 },
    );
  }

  const sessdata = extractSessdata(process.env.BILIBILI_SESSDATA ?? "");
  if (!sessdata) {
    return NextResponse.json(
      { ok: false, error: "缺少 BILIBILI_SESSDATA，无法搜索" },
      { status: 400 },
    );
  }

  try {
    const buvid3 = await getBuvid3({ cookie: "" });
    const json = await searchVideos(parsed.data.keyword, {
      cookie: buildCookie(sessdata, buvid3),
      limit: 20,
    });
    return NextResponse.json({ ok: true, results: parseSearchPayload(json) });
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      return NextResponse.json(
        { ok: false, error: "SESSDATA 已过期，请更新 .env.local 后重试" },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { ok: false, error: `搜索失败：${(error as Error).message}` },
      { status: 502 },
    );
  }
}
