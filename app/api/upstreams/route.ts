import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addUpstream, removeUpstream } from "@design-vault/adapters/upstreams-write";
import { lookupUpstreamName } from "@design-vault/adapters/ingest/upstreams-lookup";
import { readIngestState, writeIngestState } from "@design-vault/adapters/ingest/state";

/** 订阅管理：POST 添加（服务端查昵称）/ DELETE 移除 */

const uidSchema = z.string().regex(/^\d{5,12}$/, "UID 必须是 5–12 位数字");

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "请求体必须是 JSON" }, { status: 400 });
  }

  const parsed = z.object({ uid: uidSchema }).strict().safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "UID 不合法：需要 5–12 位数字",
        issues: parsed.error.issues.map((issue) => issue.message),
      },
      { status: 400 },
    );
  }

  const { uid } = parsed.data;

  const lookup = await lookupUpstreamName(uid);
  if (!lookup.ok) {
    const status = /缺少 BILIBILI_SESSDATA/.test(lookup.error) ? 400 : 502;
    return NextResponse.json({ ok: false, error: lookup.error }, { status });
  }

  let state = readIngestState();
  const added = addUpstream(uid, lookup.name, undefined, (existingUid) => {
    return state.upstreams[existingUid]?.name ?? "";
  });
  if (!added.ok) {
    return NextResponse.json({ ok: false, error: added.error }, { status: 409 });
  }

  try {
    state.upstreams[uid] = {
      name: lookup.name,
      lastCheckedAt: state.upstreams[uid]?.lastCheckedAt ?? "",
    };
    writeIngestState(state);
  } catch {
    // 状态写失败不影响订阅本身
  }

  revalidatePath("/subscriptions");

  return NextResponse.json({
    ok: true,
    upstream: { uid, name: lookup.name },
    count: added.entries.length,
  });
}

export async function DELETE(request: Request) {
  const uid = new URL(request.url).searchParams.get("uid") ?? "";
  const parsed = uidSchema.safeParse(uid);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "UID 不合法" }, { status: 400 });
  }

  const removed = removeUpstream(uid);
  if (!removed.ok) {
    return NextResponse.json({ ok: false, error: removed.error }, { status: 404 });
  }

  try {
    const state = readIngestState();
    delete state.upstreams[uid];
    writeIngestState(state);
  } catch {
    // 忽略
  }

  revalidatePath("/subscriptions");

  return NextResponse.json({ ok: true, count: removed.entries.length });
}
