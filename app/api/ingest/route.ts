import { NextResponse } from "next/server";
import { getSnapshot, startIngest } from "@/lib/ingest/job";
import { readIngestState } from "@/lib/ingest/state";

/** 手动触发一次抓取；GET 用来给订阅页轮询进度。 */
export async function POST() {
  const result = startIngest();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ok: true, jobId: result.jobId }, { status: 202 });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    job: getSnapshot(),
    state: readIngestState(),
  });
}
