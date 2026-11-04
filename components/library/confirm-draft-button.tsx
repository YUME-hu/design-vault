"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@design-vault/adapters/utils";

type Props = {
  id: string;
  /** 确认后跳哪里；不传则原地刷新（草案 tab 会少一条） */
  redirectTo?: string;
  size?: "sm" | "default";
};

/**
 * 草案确认按钮。真正的校验与落盘全在 /api/drafts/confirm，
 * 这里只负责发 id、显示结果、刷新列表。
 */
export function ConfirmDraftButton({ id, redirectTo, size = "default" }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function handleConfirm() {
    setState("pending");
    setError("");
    try {
      const response = await fetch("/api/drafts/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !payload.ok) {
        setState("error");
        setError(payload.error ?? `确认失败（${response.status}）`);
        return;
      }
      setState("done");
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
      router.refresh();
    } catch (cause) {
      setState("error");
      setError(`请求失败：${(cause as Error).message}`);
    }
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        onClick={handleConfirm}
        disabled={state === "pending" || state === "done"}
        data-testid="confirm-draft"
        data-draft-id={id}
        className={cn(
          "mono w-full border px-3 uppercase tracking-[0.16em] disabled:opacity-50",
          size === "sm" ? "h-8 text-[9px]" : "h-10 text-[10px]",
          state === "done"
            ? "border-charcoal bg-charcoal text-paper"
            : "border-charcoal bg-transparent text-charcoal hover:bg-charcoal hover:text-paper",
        )}
      >
        {state === "pending" && "确认中…"}
        {state === "done" && "已入库 ✓"}
        {(state === "idle" || state === "error") && "确认入库"}
      </button>

      {state === "error" && (
        <p role="alert" className="mono mt-1 text-[9px] leading-relaxed text-[#B3261E]">
          {error}
        </p>
      )}
      {state === "done" && (
        <p className="mono mt-1 text-[9px] uppercase tracking-[0.1em] text-ink-faded">
          已移入{" "}
          <Link href="/library" className="underline underline-offset-2 hover:text-charcoal">
            已确认
          </Link>
        </p>
      )}
    </div>
  );
}
