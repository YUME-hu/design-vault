import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { approvePending } from "@design-vault/adapters/ingest/pending-actions";

/** 通过并入库：候选补全 → styleSchema 校验 → 写 styles.json → 从 pending 删除 */
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body = (await request.json().catch(() => null)) as { as?: "style" | "effect" | "component" } | null;
  const as = body?.as;

  const result = approvePending(id, as);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, issues: result.issues },
      { status: result.status },
    );
  }

  revalidatePath("/pending");
  revalidatePath("/library");
  revalidatePath("/effects");
  revalidatePath("/components");

  if (result.kind === "style") {
    revalidatePath(`/library/${result.style.id}`);
    return NextResponse.json({ ok: true, kind: "style", id: result.style.id, name: result.style.name });
  }

  revalidatePath(`/components/${result.id}`);
  revalidatePath(`/effects/${result.id}`);
  return NextResponse.json({ ok: true, kind: result.kind, id: result.id, name: result.name });
}
