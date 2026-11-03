import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { approvePending } from "@/lib/ingest/pending-actions";

/** 通过并入库：候选补全 → styleSchema 校验 → 写 styles.json → 从 pending 删除 */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const result = approvePending(id);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, issues: result.issues },
      { status: result.status },
    );
  }

  revalidatePath("/pending");
  revalidatePath("/library");
  revalidatePath("/effects");
  revalidatePath(`/library/${result.style.id}`);

  return NextResponse.json({
    ok: true,
    id: result.style.id,
    name: result.style.name,
  });
}
