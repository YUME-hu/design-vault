"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * pending 的三个动作（M2b）：
 *   通过并入库（服务端补全 + 写 styles + 清 pending）
 *   去调色（带着预填数据进调色器，保存时入库并清 pending）
 *   丢弃（直接从 pending 删除）
 */
export function PendingActions({ id, duplicateOf }: { id: string; duplicateOf?: string | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"approve" | "discard" | "merge" | null>(null);
  const [error, setError] = useState("");
  const [approvedId, setApprovedId] = useState("");

  async function approve() {
    setBusy("approve");
    setError("");
    try {
      const response = await fetch(`/api/pending/${id}/approve`, { method: "POST" });
      const data = (await response.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
        issues?: string[];
      };
      if (!response.ok || !data.ok) {
        setError([data.error ?? `入库失败（${response.status}）`, ...(data.issues ?? [])].join(" · "));
        return;
      }
      setApprovedId(data.id ?? "");
      router.refresh();
    } catch (cause) {
      setError(`请求失败：${(cause as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function discard() {
    setBusy("discard");
    setError("");
    try {
      const response = await fetch(`/api/pending/${id}/discard`, { method: "POST" });
      const data = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? `丢弃失败（${response.status}）`);
        return;
      }
      router.refresh();
    } catch (cause) {
      setError(`请求失败：${(cause as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  async function merge() {
    setBusy("merge");
    setError("");
    try {
      const response = await fetch(`/api/pending/${id}/merge`, { method: "POST" });
      const data = (await response.json()) as { ok?: boolean; error?: string; targetId?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? `合并失败（${response.status}）`);
        return;
      }
      router.refresh();
    } catch (cause) {
      setError(`请求失败：${(cause as Error).message}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-3 border-t border-hairline pt-3">
      <p className="label">Review / 审核动作</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          data-testid="approve-pending"
          onClick={approve}
          disabled={busy !== null}
          className="mono h-9 border border-charcoal bg-charcoal px-3 text-[9px] uppercase tracking-[0.16em] text-paper hover:border-signal hover:bg-signal disabled:opacity-40"
        >
          {busy === "approve" ? "入库中…" : "通过并入库"}
        </button>
        <Link
          href={`/library/new?pending=${id}`}
          data-testid="polish-pending"
          className="mono flex h-9 items-center border border-charcoal px-3 text-[9px] uppercase tracking-[0.16em] text-charcoal hover:bg-charcoal hover:text-paper"
        >
          去调色 →
        </Link>
        {duplicateOf && (
          <button
            type="button"
            data-testid="merge-pending"
            onClick={merge}
            disabled={busy !== null}
            className="mono h-9 border border-charcoal bg-white px-3 text-[9px] uppercase tracking-[0.16em] text-charcoal hover:bg-charcoal hover:text-paper disabled:opacity-40"
          >
            {busy === "merge" ? "合并中…" : `合并信源 → ${duplicateOf}`}
          </button>
        )}
        <button
          type="button"
          data-testid="discard-pending"
          onClick={discard}
          disabled={busy !== null}
          className="mono h-9 border border-[#B3261E] px-3 text-[9px] uppercase tracking-[0.16em] text-[#B3261E] hover:bg-[#B3261E] hover:text-white disabled:opacity-40"
        >
          {busy === "discard" ? "丢弃中…" : "丢弃"}
        </button>

        {approvedId && (
          <Link
            href={`/library/${approvedId}`}
            data-testid="approved-link"
            className="mono text-[9px] uppercase tracking-[0.14em] text-charcoal underline underline-offset-4 hover:text-signal"
          >
            已入库：查看记录 →
          </Link>
        )}
      </div>

      {error && (
        <p
          role="alert"
          data-testid="pending-error"
          className="mono mt-2 border border-[#B3261E] bg-white px-2 py-1.5 text-[9px] leading-relaxed text-[#B3261E]"
        >
          {error}
        </p>
      )}
      <p className="mono mt-2 text-[8px] uppercase leading-relaxed tracking-[0.12em] text-ink-faded">
        入库前服务端会补全缺失字段并跑完整 Style 校验 · 丢弃不可撤销
      </p>
    </div>
  );
}
