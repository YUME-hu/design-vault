import { NextResponse } from "next/server";
import { getStyles } from "@design-vault/adapters/data";

/** 插件只需要 id / name / 标签 / 调色板，避免把整个 vault 送到前端 */
const CORS_METHODS = "GET, OPTIONS";

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed =
    origin === "null" ||
    origin === "file://" ||
    (origin !== null &&
      (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        origin.startsWith("dsh-app://") ||
        origin.startsWith("file://")));
  return {
    ...(allowed ? { "Access-Control-Allow-Origin": origin! } : {}),
    "Access-Control-Allow-Methods": CORS_METHODS,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Private-Network": "true",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  };
}

export async function OPTIONS(request: Request) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

export async function GET(request: Request) {
  const styles = getStyles().map((style) => ({
    id: style.id,
    name: style.name,
    project_tags: style.project_tags,
    palette: style.palette,
    frontend_prompt: style.frontend_prompt,
  }));

  return NextResponse.json(
    {
      ok: true,
      version: 1,
      count: styles.length,
      generatedAt: new Date().toISOString(),
      styles,
    },
    {
      headers: {
        ...corsHeaders(request.headers.get("origin")),
        "Cache-Control": "no-store",
      },
    },
  );
}
