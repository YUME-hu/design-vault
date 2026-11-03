import { NextResponse } from "next/server";
import { readUsage } from "@/lib/ingest/usage";

/** LLM 用量统计：直接读 data/llm-usage.log */
export async function GET() {
  return NextResponse.json({ ok: true, usage: readUsage() });
}
