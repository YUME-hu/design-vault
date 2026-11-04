import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createStyle } from "@design-vault/adapters/style-write";

/**
 * 手动新建风格：POST /api/styles
 * 请求体是完整的 Style（可带一个 pendingId，用于「从 pending 去调色」入库后清队列）。
 * 服务端补日期、过 schema、查重、整体校验后原子写入 styles.json。
 */
export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体必须是 JSON" }, { status: 400 });
  }

  let pendingId: string | undefined;
  let styleInput = payload;

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    if (typeof record.pendingId === "string") {
      pendingId = record.pendingId;
      const { pendingId: _ignored, ...rest } = record;
      styleInput = rest;
    }
  }

  const result = createStyle(styleInput, { pendingId });
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, issues: result.issues },
      { status: result.status },
    );
  }

  revalidatePath("/library");
  revalidatePath("/pending");
  revalidatePath(`/library/${result.style.id}`);

  return NextResponse.json({
    ok: true,
    id: result.style.id,
    target: result.target,
    fromPending: Boolean(pendingId),
  });
}
