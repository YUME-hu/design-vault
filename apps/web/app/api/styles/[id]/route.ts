import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateStyle } from "@design-vault/adapters/style-write";

/**
 * 编辑已有风格：PUT /api/styles/[id]
 * 只认路径里的 id；请求体里的 id / created_at 会被服务端覆盖，updated_at 自动刷新。
 */
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体必须是 JSON" }, { status: 400 });
  }

  const result = updateStyle(id, payload);
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, issues: result.issues },
      { status: result.status },
    );
  }

  revalidatePath("/library");
  revalidatePath(`/library/${id}`);

  return NextResponse.json({
    ok: true,
    id: result.style.id,
    target: result.target,
    updated_at: result.style.updated_at,
  });
}
