import type { Metadata } from "next";
import Link from "next/link";
import { getComponents } from "@design-vault/adapters/data";

export const metadata: Metadata = { title: "组件库" };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ category?: string }> };

export default async function ComponentsPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const components = getComponents();
  const categories = [...new Set(components.map((item) => item.category))].sort();
  const filtered = category ? components.filter((item) => item.category === category) : components;

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 lg:px-8">
      <div className="border-b border-charcoal pb-5">
        <p className="label-strong flex items-center gap-2">
          <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
          INDEX 09 / COMPONENTS · V2.2
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-charcoal sm:text-[40px]">组件库</h1>
        <p className="mt-3 max-w-[56ch] text-[13px] leading-7 text-ink-soft">
          带 DOM 结构与交互的可复用部件。审核页分流到这里；代码只读展示，不执行。
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/components"
          className={`mono border px-2 py-1 text-[9px] uppercase tracking-[0.12em] ${
            !category ? "border-charcoal bg-charcoal text-paper" : "border-hairline-strong text-ink-soft"
          }`}
        >
          全部 {components.length}
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            href={`/components?category=${encodeURIComponent(item)}`}
            className={`mono border px-2 py-1 text-[9px] uppercase tracking-[0.12em] ${
              category === item ? "border-charcoal bg-charcoal text-paper" : "border-hairline-strong text-ink-soft"
            }`}
          >
            {item}
          </Link>
        ))}
      </div>

      <ul data-testid="component-list" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((component) => (
          <li key={component.id} data-testid="component-card" className="border border-charcoal bg-white p-3">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/components/${component.id}`} className="text-[13px] font-bold text-charcoal hover:underline">
                {component.name}
              </Link>
              <span className="mono shrink-0 border border-hairline-strong px-1 py-[1px] text-[7px] uppercase tracking-[0.1em] text-ink-faded">
                {component.category}
              </span>
            </div>
            <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-ink-soft">{component.description}</p>
            <div className="mono mt-2 flex flex-wrap gap-1 text-[8px] text-ink-faded">
              <span className="border border-hairline px-1">{component.framework}</span>
              {component.code ? (
                <span className="border border-hairline px-1">代码 {component.code.split("\n").length} 行</span>
              ) : (
                <span className="border border-[#B3261E] px-1 text-[#B3261E]">待补代码</span>
              )}
            </div>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="col-span-full px-3 py-8 text-[12px] text-ink-faded">还没有组件。去 /pending 把组件类候选分流进来。</li>
        )}
      </ul>
    </div>
  );
}
