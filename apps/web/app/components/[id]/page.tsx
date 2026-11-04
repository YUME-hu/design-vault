import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyCode } from "@/components/components/copy-code";
import { getComponents, getStyles } from "@design-vault/adapters/data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const component = getComponents().find((item) => item.id === id);
  return { title: component?.name ?? "组件不存在" };
}

export default async function ComponentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const component = getComponents().find((item) => item.id === id);
  if (!component) notFound();

  const styles = getStyles();
  const related = styles.filter((style) => component.related_styles.includes(style.id));

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 lg:px-8">
      <nav className="mono flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-ink-faded">
        <Link href="/components" className="hover:text-charcoal hover:underline">组件库</Link>
        <span aria-hidden>/</span>
        <span className="text-charcoal">{component.id}</span>
      </nav>

      <div className="mt-3 border-b border-charcoal pb-4">
        <p className="label-strong">{component.category} · {component.framework} · CONF {component.confidence}</p>
        <h1 className="mt-2 text-[26px] font-bold leading-tight text-charcoal">{component.name}</h1>
        <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-ink-soft">{component.description}</p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <div className="flex items-center justify-between border border-charcoal bg-white px-3 py-2">
            <p className="label-strong">源码</p>
            {component.code ? <CopyCode code={component.code} /> : null}
          </div>
          {component.code ? (
            <pre className="mono max-h-[520px] overflow-auto border border-t-0 border-charcoal bg-white p-3 text-[11px] leading-relaxed text-ink-soft">
              {component.code}
            </pre>
          ) : (
            <p className="mono border border-t-0 border-charcoal bg-white p-3 text-[10px] text-[#B3261E]">
              待补代码：这条来自 pending 分流，源码还没补。
            </p>
          )}

          <div className="mt-4 border border-charcoal bg-white p-3">
            <p className="label">状态</p>
            {component.states.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {component.states.map((state) => (
                  <li key={state.name} className="mono text-[10px] text-ink-soft">
                    <span className="text-charcoal">{state.name}</span> · {state.description || "—"}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mono mt-2 text-[10px] text-ink-faded">未记录状态。</p>
            )}
          </div>
        </div>

        <aside className="min-w-0">
          <div className="border border-charcoal bg-white p-3">
            <p className="label">依赖</p>
            <p className="mono mt-2 break-all text-[10px] text-ink-soft">
              {component.dependencies.length > 0 ? component.dependencies.join(" · ") : "无"}
            </p>
            <p className="label mt-3">来源</p>
            <ul className="mono mt-2 space-y-1 text-[9px] text-ink-soft">
              {component.sources.map((source) => (
                <li key={`${source.video}-${source.url}`} className="break-all">
                  {source.type} · {source.video || source.url || "—"}
                </li>
              ))}
            </ul>
            <p className="label mt-3">关联风格</p>
            {related.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {related.map((style) => (
                  <li key={style.id}>
                    <Link href={`/library/${style.id}`} className="mono text-[10px] text-charcoal underline underline-offset-4">
                      {style.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mono mt-2 text-[10px] text-ink-faded">暂未关联。</p>
            )}
            {component.notes && <p className="mono mt-3 text-[9px] leading-relaxed text-ink-faded">{component.notes}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
