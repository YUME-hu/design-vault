"use client";

import { useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      data-testid="copy-component-code"
      onClick={copy}
      className="mono border border-charcoal bg-charcoal px-2 py-[3px] text-[8px] uppercase tracking-[0.12em] text-paper"
    >
      {copied ? "已复制" : "复制代码"}
    </button>
  );
}
