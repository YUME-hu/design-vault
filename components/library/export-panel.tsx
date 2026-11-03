"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CopyButton } from "@/components/library/copy-button";

type Props = {
  cssVariables: string;
  tailwindTheme: string;
  prompt: string;
  meta: {
    id: string;
    confidence: number;
    promptType: string;
    paletteSource: string;
    sourceType: string;
    updatedAt: string;
  };
};

/**
 * 复制面板：三种产物一键进剪贴板。
 * 内容全部在服务端由 lib/export.ts 的纯函数生成，这里只负责交互。
 */
export function ExportPanel({ cssVariables, tailwindTheme, prompt, meta }: Props) {
  const [status, setStatus] = useState("");

  return (
    <Card className="overflow-hidden">
      <div className="hazard h-[6px] w-full" aria-hidden />
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="label-strong">Export / 复制面板</p>
          <span className="mono text-[9px] tracking-[0.14em] text-ink-faded">3 项</span>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-ink-faded">
          全部由本地数据确定性生成，不请求任何接口。
        </p>

        <div className="mt-3 space-y-2">
          <CopyButton
            text={cssVariables}
            label="CSS Variables"
            hint=":root"
            onCopied={(label) => setStatus(`已复制：${label}`)}
          />
          <CopyButton
            text={tailwindTheme}
            label="Tailwind config"
            hint="theme.extend"
            onCopied={(label) => setStatus(`已复制：${label}`)}
          />
          <CopyButton
            text={prompt}
            label="前端提示词"
            hint={`${prompt.length} 字`}
            variant="solid"
            onCopied={(label) => setStatus(`已复制：${label}`)}
          />
        </div>

        <p
          aria-live="polite"
          className="mono mt-2 min-h-[16px] text-[9px] uppercase tracking-[0.14em] text-signal"
        >
          {status}
        </p>

        <dl className="mt-2 space-y-1.5 border-t border-hairline pt-3">
          {[
            ["Confidence", `${Math.round(meta.confidence * 100)}%`],
            ["Prompt type", meta.promptType],
            ["Palette src", meta.paletteSource],
            ["Source", meta.sourceType],
            ["Updated", meta.updatedAt],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline justify-between gap-3">
              <dt className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">{label}</dt>
              <dd className="mono text-[10px] tracking-[0.04em] text-charcoal">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mono mt-3 break-all border-t border-hairline pt-3 text-[9px] tracking-[0.06em] text-ink-faded">
          {meta.id}
        </p>
      </div>
    </Card>
  );
}
