import { NextResponse } from "next/server";
import { getDeepSeekKey, deepSeekKeySource } from "@design-vault/adapters/auth/api-keys";
import { deleteNamedSecret, maskSecret, saveNamedSecret } from "@design-vault/store/secrets";
import { vaultHome, vaultHomeSource } from "@design-vault/store/paths";

export async function GET() {
  const key = getDeepSeekKey();
  const masked = maskSecret(key);
  return NextResponse.json({
    ok: true,
    deepseek: { configured: masked.configured, last4: masked.last4, source: deepSeekKeySource() },
    vault: { path: vaultHome(), source: vaultHomeSource() },
  });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as { deepseekKey?: string } | null;
  if (!body?.deepseekKey) return NextResponse.json({ ok: false, error: "缺少 deepseekKey" }, { status: 400 });
  const key = body.deepseekKey.trim();
  if (!/^sk-[A-Za-z0-9_-]{10,}$/.test(key)) {
    return NextResponse.json({ ok: false, error: "密钥格式不对（应以 sk- 开头）" }, { status: 400 });
  }
  try {
    saveNamedSecret("deepseek", key);
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deepseek: { ...maskSecret(key), source: "encrypted" } });
}

export async function DELETE() {
  try {
    deleteNamedSecret("deepseek");
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, deepseek: { configured: false, last4: "", source: deepSeekKeySource() } });
}
