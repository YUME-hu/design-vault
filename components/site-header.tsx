import Link from "next/link";
import { getVaultCounts } from "@/lib/data";

const pad = (value: number) => String(value).padStart(3, "0");

/** 顶部状态栏：左侧标识，右侧库体量读数。整个工具只有这一处常驻红色方块。 */
export function SiteHeader() {
  const counts = getVaultCounts();

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal bg-paper">
      <div className="hazard h-[6px] w-full" aria-hidden />
      <div className="mx-auto flex h-[56px] max-w-console items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/library" className="group flex min-w-0 items-center gap-3">
          <span className="h-[10px] w-[10px] shrink-0 bg-signal" aria-hidden />
          <span className="mono truncate text-[13px] font-bold uppercase leading-none tracking-[0.28em] text-charcoal">
            Design&nbsp;Vault
          </span>
          <span className="hidden shrink-0 border-l border-hairline-strong pl-3 text-[11px] leading-none tracking-[0.08em] text-ink-faded sm:inline">
            设计资产库
          </span>
        </Link>

        <div className="mono flex shrink-0 items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-ink-faded sm:gap-5 sm:text-[10px]">
          <span className="hidden items-center gap-2 md:flex">
            <span className="h-[5px] w-[5px] bg-signal" aria-hidden />
            M4a / 效果库
          </span>
          <span className="hidden h-[10px] w-px bg-hairline-strong md:block" aria-hidden />
          <span>
            STYLES <span className="text-charcoal">{pad(counts.styles)}</span>
          </span>
          <span>
            DRAFT <span className="text-charcoal">{pad(counts.drafts)}</span>
          </span>
          <span className="hidden sm:inline">
            PENDING <span className="text-charcoal">{pad(counts.pending)}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
