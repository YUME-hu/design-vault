import { NextResponse } from "next/server";
import { z } from "zod";
import { getBatchJob, MAX_BATCH, startBatch } from "@design-vault/adapters/search/batch";

const videoSchema = z.object({
  bvid: z.string().min(4),
  title: z.string().max(200).default(""),
  author: z.string().max(80).default(""),
  mid: z.number().int().nonnegative().default(0),
});

/** 批量提取：一次最多 20 条，串行 */
export async function POST(request: Request) {
  const parsed = z
    .object({ videos: z.array(videoSchema).min(1).max(MAX_BATCH) })
    .safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "参数不合法（最多 20 条）" }, { status: 400 });
  }

  const started = startBatch(
    parsed.data.videos.map((video) => ({
      ...video,
      play: 0,
      cover: "",
      duration: "",
      pubdate: 0,
    })),
  );

  if (!started.ok) {
    return NextResponse.json({ ok: false, error: started.error }, { status: started.status });
  }
  return NextResponse.json({ ok: true, jobId: started.jobId }, { status: 202 });
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const job = getBatchJob(id);
  if (!job) return NextResponse.json({ ok: false, error: "任务不存在或已过期" }, { status: 404 });
  return NextResponse.json({ ok: true, job });
}
