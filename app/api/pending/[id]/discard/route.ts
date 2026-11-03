import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { discardPending } from "@/lib/ingest/pending-actions";

/** 丢弃：直接从 pending 删除 */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const result = discardPending(id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  revalidatePath("/pending");
  return NextResponse.json({ ok: true });
}
