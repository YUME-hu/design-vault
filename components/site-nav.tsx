"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@design-vault/adapters/utils";

type NavItem = {
  index: string;
  href: string;
  zh: string;
  en: string;
  milestone: "M0" | "M1a" | "M2a" | "M3a" | "M4" | "M4a" | "M4b";
  ready: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { index: "01", href: "/library", zh: "风格库", en: "Library", milestone: "M0", ready: true },
  { index: "02", href: "/pending", zh: "审核队列", en: "Pending", milestone: "M2a", ready: true },
  { index: "03", href: "/", zh: "项目画像", en: "Recommend", milestone: "M1a", ready: true },
  { index: "04", href: "/effects", zh: "效果库", en: "Effects", milestone: "M4a", ready: true },
  { index: "05", href: "/refs", zh: "参考库", en: "Refs", milestone: "M4b", ready: true },
  { index: "06", href: "/subscriptions", zh: "订阅", en: "Feeds", milestone: "M2a", ready: true },
  { index: "07", href: "/search", zh: "搜索", en: "Search", milestone: "M3a", ready: true },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/" || pathname.startsWith("/result");
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * 左侧导航。当前项左侧压一条 4px 信号红；未开工的里程碑不做假链接，
 * 只保留编号与 Milestone 标记，避免点进去发现是空壳。
 */
export function SiteNav({
  counts,
}: {
  counts: { styles: number; drafts: number; pending: number };
}) {
  const pathname = usePathname();
  const pad = (value: number) => String(value).padStart(3, "0");

  return (
    <nav
      aria-label="主导航"
      className="border-b border-charcoal bg-paper lg:w-[204px] lg:shrink-0 lg:border-b-0 lg:border-r"
    >
      <ul className="flex w-full lg:block">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href) && item.ready;
          const content = (
            <>
              <span
                className={cn(
                  "mono hidden h-full w-[30px] shrink-0 items-center justify-center border-r border-hairline text-[10px] sm:flex",
                  active ? "text-signal" : "text-ink-faded",
                )}
              >
                {item.index}
              </span>
              <span className="flex min-w-0 flex-1 items-baseline justify-center gap-2 sm:justify-between">
                <span className="flex min-w-0 flex-col items-center sm:items-start">
                  <span className="truncate text-[12px] leading-tight text-charcoal sm:text-[13px]">
                    {item.zh}
                  </span>
                  <span className="mono hidden truncate text-[9px] uppercase tracking-[0.2em] text-ink-faded sm:block">
                    {item.en}
                  </span>
                </span>
                {!item.ready && (
                  <span className="mono hidden shrink-0 text-[9px] uppercase tracking-[0.14em] text-ink-faded sm:inline">
                    {item.milestone}
                  </span>
                )}
              </span>
            </>
          );

          return (
            <li key={`${item.index}-${item.zh}`} className="relative min-w-0 flex-1 sm:flex-none lg:shrink">
              {item.ready ? (
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex h-[38px] items-center justify-center gap-2 px-1 transition-none hover:bg-charcoal/5 sm:justify-start sm:gap-3 sm:px-3 lg:h-[58px]",
                    active && "bg-charcoal/[0.04]",
                  )}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute bottom-0 left-0 top-0 w-[4px] bg-signal"
                    />
                  )}
                  {content}
                </Link>
              ) : (
                <div
                  aria-disabled="true"
                  className="flex h-[38px] cursor-not-allowed items-center justify-center gap-2 px-1 opacity-45 sm:justify-start sm:gap-3 sm:px-3 lg:h-[58px]"
                >
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="hidden border-t border-hairline p-3 lg:block">
        <p className="label mb-2">Vault Status</p>
        <dl className="mono space-y-1 text-[10px] uppercase tracking-[0.12em] text-ink-faded">
          <div className="flex items-baseline justify-between gap-2">
            <dt>Styles</dt>
            <dd className="text-charcoal">{pad(counts.styles)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt>Drafts</dt>
            <dd className="text-charcoal">{pad(counts.drafts)}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt>Pending</dt>
            <dd className="text-charcoal">{pad(counts.pending)}</dd>
          </div>
        </dl>
        <p className="mono mt-3 border-t border-hairline pt-2 text-[9px] uppercase leading-relaxed tracking-[0.12em] text-ink-faded">
          local · fs · no&nbsp;api
        </p>
      </div>
    </nav>
  );
}
