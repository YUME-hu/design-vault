import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyCode } from "@/components/components/copy-code";
import { EffectEditor } from "@/components/effects/effect-editor";
import { getEffects, getStyles } from "@design-vault/adapters/data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const effect = getEffects().find((item) => item.id === id);
  return { title: effect?.name ?? "效果不存在" };
}

export default async function EffectDetailPage({ params }: PageProps) {
  const { id } = await params;
  const effect = getEffects().find((item) => item.id === id);
  if (!effect) notFound();

  const styleIds = getStyles().map((style) => ({ id: style.id, name: style.name }));

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 lg:px-8">
      <nav className="mono flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-ink-faded">
        <Link href="/effects" className="hover:text-charcoal hover:underline">效果库</Link>
        <span aria-hidden>/</span>
        <span className="text-charcoal">{effect.id}</span>
      </nav>

      <div className="mt-3 border-b border-charcoal pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-strong">{effect.tech_stack.join(" · ") || "未标注技术栈"}</p>
            <h1 className="mt-2 text-[26px] font-bold leading-tight text-charcoal">{effect.name}</h1>
          </div>
          <EffectEditor effect={effect} />
        </div>
        <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-ink-soft">{effect.description}</p>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between border border-charcoal bg-white px-3 py-2">
          <p className="label-strong">代码片段</p>
          {effect.code_snippet ? <CopyCode code={effect.code_snippet} /> : null}
        </div>
        {effect.code_snippet ? (
          <pre className="mono max-h-[480px] overflow-auto border border-t-0 border-charcoal bg-white p-3 text-[11px] leading-relaxed text-ink-soft">
            {effect.code_snippet}
          </pre>
        ) : (
          <p className="mono border border-t-0 border-charcoal bg-white p-3 text-[10px] text-ink-faded">这条效果没有代码片段。</p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="border border-charcoal bg-white p-3">
            <p className="label">性能备注</p>
            <p className="mono mt-2 text-[10px] leading-relaxed text-ink-soft">{effect.performance_notes || "—"}</p>
          </div>
          <div className="border border-charcoal bg-white p-3">
            <p className="label">关联风格</p>
            {effect.related_styles.length > 0 ? (
              <ul className="mt-2 space-y-1">
                {effect.related_styles.map((styleId) => {
                  const style = styleIds.find((item) => item.id === styleId);
                  return (
                    <li key={styleId}>
                      <Link href={`/library/${styleId}`} className="mono text-[10px] text-charcoal underline underline-offset-4">
                        {style?.name ?? styleId}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mono mt-2 text-[10px] text-ink-faded">暂未关联（允许孤立效果）。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
