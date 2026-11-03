import { NextResponse } from "next/server";
import { getStylePool } from "@/lib/data";
import { profileSchema, recommend } from "@/lib/recommend";

/**
 * M1a 推荐接口：纯规则打分，不接 LLM、不落库。
 * 请求体就是画像对象（projectType / targetUser / keywords / pageType / colorMode），
 * 服务端重新用 zod 校验一遍 —— 前端传什么都不可信。
 */

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

  const parsed = profileSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "画像不合法",
        issues: parsed.error.issues.map(
          (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
        ),
      },
      { status: 400 },
    );
  }

  const pool = getStylePool();
  const results = recommend(pool, parsed.data, 5);

  return NextResponse.json({
    ok: true,
    engine: "rules/tag-intersection/v1",
    profile: parsed.data,
    poolSize: pool.length,
    results,
  });
}

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      error: "推荐接口只接受 POST（请求体为画像对象）",
      milestone: "M1a",
    },
    { status: 405, headers: { Allow: "POST" } },
  );
}
