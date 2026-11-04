import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { vaultHome, workspaceRoot } from "@design-vault/store/paths";

/** 切换 Vault：写指针文件，提示重启（不热切换） */
export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as { path?: string } | null;
  const target = body?.path?.trim() ?? "";
  if (!target) return NextResponse.json({ ok: false, error: "请填写目录路径" }, { status: 400 });
  if (!path.isAbsolute(target)) {
    return NextResponse.json({ ok: false, error: "必须是绝对路径" }, { status: 400 });
  }

  const resolved = path.resolve(target);
  try {
    const stat = fs.statSync(resolved);
    if (!stat.isDirectory()) throw new Error("不是目录");
    fs.accessSync(resolved, fs.constants.W_OK);
  } catch (error) {
    return NextResponse.json({ ok: false, error: `目录不可用：${(error as Error).message}` }, { status: 400 });
  }

  if (path.dirname(resolved) === resolved) {
    return NextResponse.json({ ok: false, error: "不能选文件系统根目录" }, { status: 400 });
  }

  const pointer = path.join(workspaceRoot(), ".design-vault-home");
  fs.writeFileSync(pointer, `${resolved}\n`, "utf8");
  revalidatePath("/settings");
  return NextResponse.json({
    ok: true,
    path: resolved,
    previous: vaultHome(),
    restartRequired: true,
  });
}
