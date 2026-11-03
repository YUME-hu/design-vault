"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  text: string;
  label: string;
  hint?: string;
  variant?: ButtonProps["variant"];
  className?: string;
  /** 外层用于显示「最近一次复制成功」的提示，可选 */
  onCopied?: (label: string) => void;
};

/**
 * 复制按钮：直角、无动效，点击后立即打勾。
 * 复制失败时显示失败态而不是假装成功。
 */
export function CopyButton({
  text,
  label,
  hint,
  variant = "default",
  className,
  onCopied,
}: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "ok" | "fail">("idle");

  async function handleCopy() {
    const ok = await copyText(text);
    setState(ok ? "ok" : "fail");
    if (ok) onCopied?.(label);
    window.setTimeout(() => setState("idle"), 1600);
  }

  return (
    <Button
      variant={state === "ok" ? "solid" : variant}
      onClick={handleCopy}
      aria-live="polite"
      className={cn("w-full justify-between", className)}
      title={`复制${label}`}
    >
      <span className="flex items-center gap-2">
        <span aria-hidden className={cn("h-[6px] w-[6px]", state === "fail" ? "bg-signal" : "bg-current")} />
        {state === "ok" ? "Copied ✓" : state === "fail" ? "复制失败，请手动选中" : label}
      </span>
      {hint && (
        <span className={cn("mono text-[9px] tracking-[0.1em] opacity-60")}>{hint}</span>
      )}
    </Button>
  );
}
