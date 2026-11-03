import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { mergePending } from "@/lib/ingest/pending-actions";

/** 合并信源：把当前 pending 的 sources 追加到 duplicate_of 指向的风格，然后删除 pending */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const result = mergePending(id);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status });
  }

  revalidatePath("/pending");
  revalidatePath("/library");
  revalidatePath(`/library/${result.targetId}`);

  return NextResponse.json({
    ok: true,
    targetId: result.targetId,
    added: result.added,
  });
}
