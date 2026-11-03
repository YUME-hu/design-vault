import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { readDraftFile, readStylesFile, writeDraftFile, writeStylesFile } from "@/lib/data";
import { slugSchema, styleSchema, stylesSchema } from "@/lib/schema";

/**
 * 草案确认：draft → styles。
 * 前端只传一个 id，剩下的信任链全部在服务端：
 * 重新读盘 → 找条目 → 整条过 styleSchema → 去重 → 写临时文件再 rename。
 */

const requestSchema = z.object({ id: slugSchema }).strict();

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "请求体必须是 JSON" },
      { status: 400 },
    );
  }

  const parsedRequest = requestSchema.safeParse(payload);
  if (!parsedRequest.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "请求体不合法：需要 { id: kebab-case }",
        issues: parsedRequest.error.issues.map(
          (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
        ),
      },
      { status: 400 },
    );
  }

  const { id } = parsedRequest.data;

  let styles;
  let drafts;
  try {
    styles = readStylesFile();
    drafts = readDraftFile();
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: `读取数据失败：${(error as Error).message}` },
      { status: 500 },
    );
  }

  const draftIndex = drafts.findIndex((item) => item.id === id);
  if (draftIndex === -1) {
    return NextResponse.json(
      { ok: false, error: `草案 "${id}" 不存在（可能已确认或已被删除）` },
      { status: 404 },
    );
  }

  if (styles.some((item) => item.id === id)) {
    return NextResponse.json(
      { ok: false, error: `"${id}" 已经在已确认库里，不重复写入` },
      { status: 409 },
    );
  }

  const candidate = styleSchema.safeParse(drafts[draftIndex]);
  if (!candidate.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "这条草案没通过 Style 校验，拒绝入库",
        issues: candidate.error.issues.map(
          (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
        ),
      },
      { status: 422 },
    );
  }

  const nextStyles = stylesSchema.safeParse([...styles, candidate.data]);
  const nextDrafts = stylesSchema.safeParse(
    drafts.filter((item) => item.id !== id),
  );

  if (!nextStyles.success || !nextDrafts.success) {
    return NextResponse.json(
      { ok: false, error: "写入前整体校验失败，已中止（未改动任何文件）" },
      { status: 422 },
    );
  }

  try {
    // 先写 styles 再写 draft：万一第二步失败，宁可短暂重复，也不丢记录。
    writeStylesFile(nextStyles.data);
    writeDraftFile(nextDrafts.data);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: `写入失败：${(error as Error).message}` },
      { status: 500 },
    );
  }

  revalidatePath("/library");
  revalidatePath(`/library/${id}`);

  return NextResponse.json({
    ok: true,
    id,
    confirmedCount: nextStyles.data.length,
    draftCount: nextDrafts.data.length,
  });
}
