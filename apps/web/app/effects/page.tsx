import type { Metadata } from "next";
import Link from "next/link";
import { EffectForm } from "@/components/effects/effect-form";
import { getEffects, getStyles } from "@design-vault/adapters/data";

export const metadata: Metadata = { title: "效果库", description: "技术栈与布局/动效方案，手工录入 + 抓取提取共用。" };
export const dynamic = "force-dynamic";

type PageProps = { searchParams: Promise<{ tech?: string; edit?: string; q?: string }> };

export default async function EffectsPage({ searchParams }: PageProps) {
  const { tech, edit, q } = await searchParams;
  const effects = getEffects();
  const styles = getStyles();
  const techs = [...new Set(effects.flatMap((effect) => effect.tech_stack))].sort();
  const keyword = (q ?? "").trim().toLowerCase();
  const matched = keyword
    ? effects.filter((effect) =>
        [effect.name, effect.description, ...effect.tech_stack]
          .join(" ")
          .toLowerCase()
          .includes(keyword),
      )
    : effects;
  const filtered = tech ? matched.filter((effect) => effect.tech_stack.includes(tech)) : matched;
  const editing = edit ? effects.find((effect) => effect.id === edit) : undefined;

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 lg:px-8">
      <div className="border-b border-charcoal pb-5">
        <div className="flex items-start justify-between gap-3"><p className="label-strong flex items-center gap-2"><span aria-hidden className="h-[6px] w-[6px] bg-signal" />INDEX 04 / EFFECTS · M4a</p><a href="#effect-form" data-testid="new-effect-link" className="mono shrink-0 border border-charcoal bg-charcoal px-3 py-1.5 text-[9px] uppercase tracking-[0.14em] text-paper hover:border-signal hover:bg-signal">+ 新建效果</a></div>
        <h1 className="mt-3 text-[28px] font-bold leading-[1.15] text-charcoal sm:text-[40px]">效果库</h1>
        <p className="mt-3 max-w-[56ch] text-[13px] leading-[1.9] text-ink-soft">技术栈、布局与动效方案。手工录入和抓取提取共用一套数据，通过 related_styles 与风格双向关联。</p>
      </div>

      <form method="get" data-testid="effect-search-form" className="mt-4 flex gap-2 border border-charcoal bg-white p-3">
        <input
          name="q"
          data-testid="effect-search-input"
          defaultValue={q ?? ""}
          placeholder="搜索名称 / 描述 / 技术栈，例如：GSAP、网格"
          className="mono h-9 min-w-0 flex-1 border border-hairline-strong bg-paper px-3 text-[11px] text-charcoal placeholder:text-ink-faded focus:border-charcoal focus:outline-none"
        />
        {tech ? <input type="hidden" name="tech" value={tech} /> : null}
        <button type="submit" data-testid="effect-search-submit" className="mono h-9 shrink-0 border border-charcoal bg-charcoal px-4 text-[9px] uppercase tracking-[0.16em] text-paper">搜索</button>
        {keyword ? <Link href="/effects" className="mono flex h-9 items-center px-2 text-[9px] uppercase tracking-[0.12em] text-ink-faded underline underline-offset-4">清除</Link> : null}
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href="/effects" className={`mono border px-2 py-1 text-[9px] uppercase tracking-[0.12em] ${!tech ? "border-charcoal bg-charcoal text-paper" : "border-hairline-strong text-ink-soft"}`}>全部 {effects.length}</Link>
        {techs.map((item) => (
          <Link key={item} href={`/effects?tech=${encodeURIComponent(item)}`} className={`mono border px-2 py-1 text-[9px] uppercase tracking-[0.12em] ${tech === item ? "border-charcoal bg-charcoal text-paper" : "border-hairline-strong text-ink-soft"}`}>{item}</Link>
        ))}
      </div>

      <div id="effect-form">
        <EffectForm initial={editing} />
      </div>

      <ul data-testid="effect-list" className="mt-4 border border-charcoal bg-white">
        {filtered.map((effect) => (
          <li key={effect.id} data-testid="effect-card" data-effect-id={effect.id} className="border-b border-charcoal p-4 last:border-b-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-[15px] font-bold text-charcoal">{effect.name}</h2>
              <Link href={`/effects?edit=${effect.id}`} className="mono text-[9px] underline underline-offset-4 hover:text-signal">编辑 →</Link>
            </div>
            <div className="mt-1 flex flex-wrap gap-1">
              {effect.tech_stack.map((item) => (
                <span key={item} className="mono border border-hairline-strong px-1.5 py-[1px] text-[8px] uppercase tracking-[0.1em] text-ink-soft">{item}</span>
              ))}
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{effect.description}</p>
            {effect.code_snippet && (
              <pre data-testid="effect-code-block" className="mono mt-2 max-h-[180px] overflow-auto border border-hairline bg-paper p-2 text-[10px] leading-relaxed text-ink-soft">{effect.code_snippet}</pre>
            )}
            {effect.related_styles.length > 0 && (
              <p className="mono mt-2 text-[9px] uppercase tracking-[0.1em] text-ink-faded">
                关联风格：{effect.related_styles.map((id) => styles.find((style) => style.id === id)?.name ?? id).join(" · ")}
              </p>
            )}
          </li>
        ))}
        {filtered.length === 0 && <li className="px-4 py-8 text-[12px] text-ink-faded">{keyword ? "没有匹配的技术方案，换个关键词试试。" : "还没有技术方案。抓取时提取到的会自动出现在这里，也可以在上面手工新建。"}</li>}
      </ul>
    </div>
  );
}
