import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { readEffectsFile, writeEffectsFile } from "@design-vault/adapters/data";
import { effectSchema } from "@design-vault/adapters/schema";

const payloadSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(60),
  tech_stack: z.array(z.string()).default([]),
  description: z.string().trim().min(1).max(2000),
  code_snippet: z.string().default(""),
  performance_notes: z.string().default(""),
  related_styles: z.array(z.string()).default([]),
});

function slug(name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  return base.length >= 2 ? base : `effect-${Date.now()}`;
}

export async function POST(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "参数不合法", issues: parsed.error.issues.map((i) => i.message) }, { status: 400 });
  }
  const effects = readEffectsFile();
  const used = new Set(effects.map((effect) => effect.id));
  let id = parsed.data.id?.trim() || slug(parsed.data.name);
  while (used.has(id)) id = `${id}-2`;
  const effect = effectSchema.parse({ ...parsed.data, id });
  writeEffectsFile([...effects, effect]);
  revalidatePath("/effects");
  return NextResponse.json({ ok: true, effect });
}

export async function PUT(request: Request) {
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !parsed.data.id) {
    return NextResponse.json({ ok: false, error: "需要 id 和完整字段" }, { status: 400 });
  }
  const effects = readEffectsFile();
  const index = effects.findIndex((effect) => effect.id === parsed.data.id);
  if (index === -1) return NextResponse.json({ ok: false, error: "effect 不存在" }, { status: 404 });
  const next = [...effects];
  next[index] = effectSchema.parse({ ...effects[index], ...parsed.data, id: effects[index].id });
  writeEffectsFile(next);
  revalidatePath("/effects");
  revalidatePath("/library");
  return NextResponse.json({ ok: true, effect: next[index] });
}
