import { NextResponse } from "next/server";
import { z } from "zod";
import { getExtractJob, startSearchExtract } from "@design-vault/adapters/search/job";

/** 单视频提取：POST 启动任务，GET 轮询进度 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体必须是 JSON" }, { status: 400 });
  }

  const parsed = z
    .object({
      bvid: z.string().min(4).max(20),
      title: z.string().max(200).default(""),
      author: z.string().max(80).default(""),
      mid: z.number().int().nonnegative().default(0),
    })
    .strict()
    .safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "视频参数不合法" }, { status: 400 });
  }

  const started = startSearchExtract({
    bvid: parsed.data.bvid,
    title: parsed.data.title,
    author: parsed.data.author,
    mid: parsed.data.mid,
    play: 0,
    cover: "",
    duration: "",
    pubdate: 0,
  });

  if (!started.ok) {
    return NextResponse.json({ ok: false, error: started.error }, { status: started.status });
  }

  return NextResponse.json({ ok: true, jobId: started.jobId }, { status: 202 });
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const job = getExtractJob(id);
  if (!job) {
    return NextResponse.json({ ok: false, error: "任务不存在或已过期" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, job });
}
