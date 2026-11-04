import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { readEffectsFile, writeEffectsFile } from "@design-vault/store/collections";
import { effectSchema } from "@design-vault/core/schema";

const patchSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    tech_stack: z.array(z.string().trim().min(1)).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    code_snippet: z.string().max(200_000).optional(),
    performance_notes: z.string().max(2000).optional(),
    related_styles: z.array(z.string()).optional(),
  })
  .strict();

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "字段不合法", issues: parsed.error.issues.map((issue) => `${issue.path.join(".")} ${issue.message}`) },
      { status: 400 },
    );
  }

  const effects = readEffectsFile();
  const index = effects.findIndex((item) => item.id === id);
  if (index === -1) return NextResponse.json({ ok: false, error: "效果不存在" }, { status: 404 });

  const next = [...effects];
  try {
    next[index] = effectSchema.parse({ ...effects[index], ...parsed.data, id: effects[index].id });
  } catch (error) {
    return NextResponse.json({ ok: false, error: `更新后校验失败：${(error as Error).message}` }, { status: 422 });
  }

  writeEffectsFile(next);
  revalidatePath("/effects");
  revalidatePath(`/effects/${id}`);
  return NextResponse.json({ ok: true, effect: next[index] });
}
