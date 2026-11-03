"use client";

import { useState } from "react";
import { copyText } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

const SEMANTIC_ZH: Record<string, string> = {
  primary: "主色",
  bg: "底色",
  surface: "面层",
  text: "文字",
  muted: "弱化",
  info: "信息",
  warning: "警示",
  danger: "危险",
  success: "成功",
  sand: "沙色",
};

type Props = {
  entries: [string, string][];
  identity: string[];
};

/** 色板：语义色大格 + 身份色细条。点任意一格复制 HEX。 */
export function PaletteGrid({ entries, identity }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  async function handleCopy(hex: string) {
    const ok = await copyText(hex);
    if (!ok) return;
    setCopied(hex);
    window.setTimeout(() => setCopied((current) => (current === hex ? null : current)), 1400);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-px border border-charcoal bg-charcoal sm:grid-cols-3 xl:grid-cols-4">
        {entries.map(([key, hex]) => {
          const isCopied = copied === hex;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleCopy(hex)}
              aria-label={`复制色值 ${key} ${hex}`}
              className="group flex flex-col bg-white text-left"
            >
              <span className="block h-[68px] w-full sm:h-[76px]" style={{ backgroundColor: hex }} />
              <span className="flex items-baseline justify-between gap-2 border-t border-hairline px-2 py-[6px] group-hover:bg-charcoal">
                <span className="mono text-[9px] uppercase leading-tight tracking-[0.14em] text-ink-faded group-hover:text-paper/60">
                  {key}
                  <span className="ml-1 text-[8px] normal-case tracking-normal text-ink-faded/80 group-hover:text-paper/40">
                    {SEMANTIC_ZH[key] ?? ""}
                  </span>
                </span>
                <span
                  className={cn(
                    "mono text-[10px] uppercase leading-tight tracking-[0.04em]",
                    isCopied ? "text-signal group-hover:text-signal" : "text-charcoal group-hover:text-paper",
                  )}
                >
                  {isCopied ? "COPIED" : hex}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {identity.length > 0 && (
        <div className="border border-charcoal bg-white">
          <div className="flex items-baseline justify-between border-b border-hairline px-3 py-2">
            <span className="label">Identity Colors / 身份色</span>
            <span className="mono text-[9px] tracking-[0.12em] text-ink-faded">
              {String(identity.length).padStart(2, "0")} swatches
            </span>
          </div>
          <div className="grid grid-cols-2 gap-px bg-charcoal sm:grid-cols-4">
            {identity.map((hex, index) => (
              <button
                key={`${hex}-${index}`}
                type="button"
                onClick={() => handleCopy(hex)}
                aria-label={`复制身份色 ${hex}`}
                className="group flex items-center gap-2 bg-white px-2 py-2"
              >
                <span className="h-8 w-8 shrink-0 border border-charcoal" style={{ backgroundColor: hex }} />
                <span className="mono min-w-0 truncate text-[10px] tracking-[0.04em] text-charcoal group-hover:text-signal">
                  {copied === hex ? "COPIED" : hex}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
