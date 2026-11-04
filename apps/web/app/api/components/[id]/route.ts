import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { readComponentsFile, writeComponentsFile } from "@design-vault/store/collections";
import { componentSchema, COMPONENT_CATEGORIES } from "@design-vault/core/schema";

const patchSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    category: z.enum(COMPONENT_CATEGORIES).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
    framework: z.enum(["react", "html"]).optional(),
    code: z.string().max(200_000).optional(),
    dependencies: z.array(z.string().trim().min(1)).optional(),
    notes: z.string().max(2000).optional(),
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

  const components = readComponentsFile();
  const index = components.findIndex((item) => item.id === id);
  if (index === -1) return NextResponse.json({ ok: false, error: "组件不存在" }, { status: 404 });

  const next = [...components];
  try {
    next[index] = componentSchema.parse({
      ...components[index],
      ...parsed.data,
      id: components[index].id,
      updated_at: new Date().toISOString().slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: `更新后校验失败：${(error as Error).message}` }, { status: 422 });
  }

  writeComponentsFile(next);
  revalidatePath("/components");
  revalidatePath(`/components/${id}`);
  return NextResponse.json({ ok: true, component: next[index] });
}
