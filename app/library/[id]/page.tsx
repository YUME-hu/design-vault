import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmDraftButton } from "@/components/library/confirm-draft-button";
import { ExportPanel } from "@/components/library/export-panel";
import { PaletteGrid } from "@/components/library/palette-grid";
import { Badge } from "@/components/ui/badge";
import { getEffects, getRefs, getStyleById, getStyleRecord } from "@/lib/data";
import { orderedPaletteEntries, toCssVariables, toTailwindTheme } from "@/lib/export";
import { PROJECT_TYPE_LABELS } from "@/lib/schema";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const style = getStyleById(id);
  if (!style) return { title: "记录不存在" };
  return {
    title: style.name,
    description: style.frontend_prompt.slice(0, 130),
  };
}

function Section({
  index,
  zh,
  en,
  children,
  aside,
}: {
  index: string;
  zh: string;
  en: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="border-t border-charcoal py-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="flex min-w-0 items-baseline gap-2.5">
          <span className="mono shrink-0 text-[11px] leading-none text-signal">{index}</span>
          <span className="text-[15px] font-bold leading-tight text-charcoal">{zh}</span>
          <span className="mono truncate text-[9px] uppercase tracking-[0.2em] text-ink-faded">
            {en}
          </span>
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export default async function StyleDetailPage({ params }: PageProps) {
  const { id } = await params;
  const record = getStyleRecord(id);
  if (!record) notFound();

  const { style, stage } = record;
  const relatedEffects = getEffects().filter((effect) => style.related_effects.includes(effect.id));
  const linkedRefs = getRefs().filter((ref) => ref.linked_style_id === style.id);
  const index = String(record.index).padStart(3, "0");
  const paletteEntries = orderedPaletteEntries(style.palette);
  const tokenEntries = Object.entries(style.tokens);
  const componentEntries = Object.entries(style.components);
  const scaleSizes = (style.typography.scale.match(/\d+/g) ?? [])
    .map(Number)
    .filter((size) => size >= 10 && size <= 72);

  return (
    <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      {/* ---------- 面包屑 ---------- */}
      <nav
        aria-label="面包屑"
        className="mono flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-ink-faded"
      >
        <Link href="/library" className="hover:text-charcoal hover:underline underline-offset-4">
          风格库
        </Link>
        <span aria-hidden>/</span>
        <span className="text-charcoal">Record {index}</span>
      </nav>

      {stage === "draft" && (
        <div className="mt-3 flex flex-col gap-3 border border-charcoal bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mono text-[10px] uppercase tracking-[0.16em] text-signal">
              Draft · 未确认
            </p>
            <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">
              从官方设计文档提取的草案（confidence 0.6）。确认后会写入{" "}
              <code className="mono border border-hairline bg-paper px-1 text-[10px]">
                data/styles.json
              </code>
              ，并从草案区移除。
            </p>
          </div>
          <div className="w-full shrink-0 sm:w-[160px]">
            <ConfirmDraftButton id={style.id} redirectTo="/library" size="sm" />
          </div>
        </div>
      )}

      {/* ---------- 记录头 ---------- */}
      <header className="mt-3 overflow-hidden border border-charcoal bg-white">
        <div className="hazard h-[6px] w-full" aria-hidden />
        <div className="grid lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 p-5 sm:p-7">
            <p className="label-strong flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Record {index}</span>
              <span aria-hidden className="text-hairline-strong">/</span>
              <span>{style.sources[0]?.type ?? "manual"}</span>
              <span aria-hidden className="text-hairline-strong">/</span>
              <span>zod ✓</span>
            </p>
            <h1 className="mono mt-3 text-balance break-words text-[26px] font-bold leading-[1.14] text-charcoal sm:text-[40px]">
              {style.name}
            </h1>
            <p className="mono mt-2 break-all text-[11px] tracking-[0.1em] text-ink-faded">
              {style.id}
            </p>

            <ul className="mt-5 flex flex-wrap items-center gap-2">
              {style.project_tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="outline" className="lowercase tracking-[0.08em]">
                    #{tag}
                  </Badge>
                </li>
              ))}
            </ul>

            {style.sources[0]?.url && (
              <p className="mono mt-4 break-all text-[10px] tracking-[0.06em] text-ink-faded">
                SOURCE:{" "}
                <a
                  href={style.sources[0]?.url}
                  className="text-charcoal underline underline-offset-4 hover:text-signal"
                  target="_blank"
                  rel="noreferrer"
                >
                  {style.sources[0]?.url}
                </a>
              </p>
            )}
          </div>

          <div className="border-t border-charcoal lg:border-l lg:border-t-0">
            <div className="p-5">
              <p className="label">Confidence</p>
              <p className="mono mt-2 text-[40px] leading-none text-charcoal">
                {Math.round(style.confidence * 100)}
                <span className="text-[14px]">%</span>
              </p>
              <div className="mt-3 flex gap-[2px]" aria-hidden>
                {Array.from({ length: 10 }).map((_, cell) => (
                  <span
                    key={cell}
                    className={
                      cell < Math.round(style.confidence * 10)
                        ? "h-[10px] flex-1 bg-signal"
                        : "h-[10px] flex-1 bg-charcoal/15"
                    }
                  />
                ))}
              </div>
              <p className="mono mt-3 text-[9px] uppercase tracking-[0.14em] text-ink-faded">
                updated {style.updated_at}
              </p>
            </div>
            <div className="border-t border-hairline p-5">
              <dl className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="label">Palette src</dt>
                  <dd className="mono text-[11px] text-charcoal">{style.palette_source}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="label">Prompt type</dt>
                  <dd className="mono text-[11px] text-charcoal">{style.prompt_type}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="label">Created</dt>
                  <dd className="mono text-[11px] text-charcoal">{style.created_at}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </header>

      {/* ---------- 正文 + 复制面板 ---------- */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="order-2 min-w-0 lg:order-1">
          <Section index="01" zh="适配范围" en="Suitability">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-charcoal bg-white p-4">
                <p className="label">适用 Suit</p>
                <ul className="mt-3">
                  {style.suitable_projects.map((project) => (
                    <li
                      key={project}
                      className="flex items-baseline justify-between gap-3 border-b border-hairline py-1.5 last:border-b-0"
                    >
                      <span className="text-[13px] text-charcoal">
                        {PROJECT_TYPE_LABELS[project]}
                      </span>
                      <span className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
                        {project}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-hairline-strong bg-white p-4">
                <p className="label">不适用 Unsuitable</p>
                <ul className="mt-3">
                  {style.unsuitable_projects.map((project) => (
                    <li
                      key={project}
                      className="flex items-baseline justify-between gap-3 border-b border-hairline py-1.5 last:border-b-0"
                    >
                      <span className="text-[13px] text-ink-faded line-through">
                        {PROJECT_TYPE_LABELS[project]}
                      </span>
                      <span className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
                        {project}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Section>

          <Section
            index="02"
            zh="色板"
            en="Palette"
            aside={
              <span className="mono shrink-0 text-[9px] uppercase tracking-[0.14em] text-ink-faded">
                点击复制 HEX
              </span>
            }
          >
            <PaletteGrid entries={paletteEntries} identity={style.identity_colors} />
          </Section>

          <Section index="03" zh="字体" en="Typography">
            <div className="grid gap-px border border-charcoal bg-charcoal sm:grid-cols-2">
              <div className="bg-white p-4">
                <p className="label">Heading</p>
                <p className="mono mt-2 text-[26px] font-bold leading-none text-charcoal">
                  {style.typography.heading}
                </p>
                <p className="mono mt-2 text-[9px] uppercase tracking-[0.14em] text-ink-faded">
                  Aa Bb 0123 · 700 · uppercase / tracking-widest
                </p>
              </div>
              <div className="bg-white p-4">
                <p className="label">Body</p>
                <p className="mt-2 text-[22px] leading-none text-charcoal">
                  {style.typography.body}
                </p>
                <p className="mt-2 text-[10px] leading-relaxed text-ink-faded">
                  中文正文示例：克制、精确、可信。
                </p>
              </div>
            </div>

            <div className="mt-3 border border-charcoal bg-white">
              <div className="flex items-baseline justify-between border-b border-hairline px-3 py-2">
                <span className="label">Type scale</span>
                <span className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
                  {scaleSizes.length} steps
                </span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3 p-4">
                {scaleSizes.map((size) => (
                  <div key={size} className="flex flex-col gap-1">
                    <span className="leading-none text-charcoal" style={{ fontSize: `${size}px` }}>
                      Aa 设计
                    </span>
                    <span className="mono text-[9px] tracking-[0.1em] text-ink-faded">
                      {size}px
                    </span>
                  </div>
                ))}
              </div>
              <p className="mono border-t border-hairline px-3 py-2 text-[10px] leading-relaxed text-ink-soft">
                {style.typography.scale}
              </p>
            </div>
          </Section>

          <Section index="04" zh="设计令牌" en="Tokens">
            <div className="grid gap-4 sm:grid-cols-[96px_minmax(0,1fr)]">
              <div className="hidden sm:block">
                <p className="label">Preview</p>
                <div
                  aria-hidden
                  className="mt-2 h-[72px] w-[72px] bg-white"
                  style={{
                    border: style.tokens.border,
                    borderRadius: style.tokens.radius,
                    boxShadow: style.tokens.shadow,
                  }}
                />
                <p className="mono mt-2 text-[9px] uppercase tracking-[0.1em] text-ink-faded">
                  radius {style.tokens.radius}
                </p>
              </div>
              <dl className="min-w-0 divide-y divide-hairline border border-charcoal bg-white">
                {tokenEntries.map(([key, value]) => (
                  <div
                    key={key}
                    className="grid grid-cols-1 gap-1 px-3 py-2 sm:grid-cols-[132px_minmax(0,1fr)] sm:gap-3"
                  >
                    <dt className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faded">
                      {key}
                    </dt>
                    <dd className="mono break-words text-[11px] leading-relaxed text-charcoal">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Section>

          <Section index="05" zh="组件规格" en="Components">
            <ol className="border border-charcoal bg-white">
              {componentEntries.map(([key, description]) => (
                <li
                  key={key}
                  className="grid grid-cols-1 gap-1 border-b border-hairline px-4 py-3 last:border-b-0 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4"
                >
                  <span className="mono text-[10px] uppercase leading-relaxed tracking-[0.14em] text-charcoal">
                    {key}
                  </span>
                  <span className="text-[13px] leading-relaxed text-ink-soft">{description}</span>
                </li>
              ))}
            </ol>
          </Section>

          <Section index="06" zh="前端提示词" en="Frontend Prompt">
            <div className="border border-charcoal bg-charcoal">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper/20 px-3 py-2">
                <span className="mono text-[9px] uppercase tracking-[0.16em] text-paper/60">
                  frontend_prompt · {style.frontend_prompt.length} chars
                </span>
                <span className="mono text-[9px] uppercase tracking-[0.16em] text-paper/40">
                  {style.prompt_type}
                </span>
              </div>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words p-4 text-[12px] leading-[1.9] text-paper/90">
                {style.frontend_prompt}
                <span className="cursor-block ml-1" aria-hidden />
              </pre>
            </div>

            <div className="mt-3 border border-hairline bg-white">
              <p className="label border-b border-hairline px-3 py-2">
                Original Prompt / 原始提示词
              </p>
              <p className="px-3 py-3 text-[12px] leading-relaxed text-ink-faded">
                {style.original_prompt ||
                  "无 —— 本条为手工录入（manual），没有上游图片生成提示词；前端提示词由人工整理。"}
              </p>
            </div>
          </Section>

          <Section index="07" zh="性能约束" en="Performance">
            <div className="border border-charcoal border-l-[4px] border-l-signal bg-white p-4">
              <p className="label">Performance notes</p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
                {style.performance_notes}
              </p>
            </div>
          </Section>

          {style.notes && (
            <Section index="08" zh="人工备注" en="Notes">
              <div className="border border-charcoal border-l-[4px] border-l-[#B3261E] bg-white p-4">
                <p className="label">Notes</p>
                <p
                  data-testid="style-notes"
                  className="mt-2 text-[13px] leading-relaxed text-ink-soft"
                >
                  {style.notes}
                </p>
              </div>
            </Section>
          )}

          {relatedEffects.length > 0 ? (
            <Section index="09" zh="配套技术方案" en="Effects">
              <ul data-testid="related-effects" className="border border-charcoal bg-white">
                {relatedEffects.map((effect) => (
                  <li key={effect.id} className="border-b border-hairline px-4 py-3 last:border-b-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[13px] font-bold text-charcoal">{effect.name}</p>
                      <div className="flex flex-wrap gap-1">
                        {effect.tech_stack.map((tech) => (
                          <span key={tech} className="mono border border-hairline-strong px-1.5 py-[1px] text-[8px] uppercase tracking-[0.1em] text-ink-soft">{tech}</span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{effect.description}</p>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          {linkedRefs.length > 0 ? (
            <Section index="10" zh="参考网站" en="References">
              <ul data-testid="linked-refs" className="grid gap-3 border border-charcoal bg-white p-3 sm:grid-cols-2">
                {linkedRefs.map((ref) => (
                  <li key={ref.id}>
                    <a href={ref.url} target="_blank" rel="noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/refs/${ref.id}/shot`} alt="" className="h-[130px] w-full border border-hairline object-cover" />
                      <p className="mono mt-1 truncate text-[9px] text-ink-soft">{ref.url}</p>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section index="11" zh="来源追踪" en="Sources">
            <ol data-testid="sources-list" className="border border-charcoal bg-white">
              {style.sources.map((source, position) => (
                <li
                  key={`${source.video || source.url || source.type}-${position}`}
                  className="border-b border-hairline px-4 py-3 last:border-b-0"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="mono text-[10px] uppercase tracking-[0.14em] text-charcoal">
                      {String(position + 1).padStart(2, "0")} · {source.type}
                    </span>
                    {source.video && (
                      <a
                        href={`https://www.bilibili.com/video/${source.video}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mono text-[10px] tracking-[0.06em] text-ink-faded underline underline-offset-4 hover:text-signal"
                      >
                        BV {source.video} ↗
                      </a>
                    )}
                  </div>
                  <dl className="mono mt-2 grid gap-1 text-[10px] leading-relaxed text-ink-soft sm:grid-cols-2">
                    <div className="flex gap-2">
                      <dt className="w-[56px] shrink-0 text-ink-faded">upstream</dt>
                      <dd className="break-all">{source.upstream || "—"}</dd>
                    </div>
                    <div className="flex gap-2 sm:col-span-2">
                      <dt className="w-[56px] shrink-0 text-ink-faded">url</dt>
                      <dd className="break-all">
                        {source.url ? (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline underline-offset-4 hover:text-signal"
                          >
                            {source.url}
                          </a>
                        ) : (
                          "—"
                        )}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          </Section>
        </div>
        <aside className="order-1 min-w-0 lg:order-2 lg:sticky lg:top-[79px] lg:self-start">
          <Link
            href={`/library/${style.id}/edit`}
            data-testid="edit-style-link"
            className="mono mb-3 flex h-10 items-center justify-between border border-charcoal px-3 text-[10px] uppercase tracking-[0.16em] text-charcoal hover:bg-charcoal hover:text-paper"
          >
            编辑 · 打开调色器
            <span aria-hidden>→</span>
          </Link>
          <ExportPanel
            cssVariables={toCssVariables(style)}
            tailwindTheme={toTailwindTheme(style)}
            prompt={style.frontend_prompt}
            meta={{
              id: style.id,
              confidence: style.confidence,
              promptType: style.prompt_type,
              paletteSource: style.palette_source,
              sourceType: style.sources[0]?.type ?? "manual",
              updatedAt: style.updated_at,
            }}
          />
          <p className="mono mt-3 px-1 text-[9px] uppercase leading-relaxed tracking-[0.14em] text-ink-faded">
            数据来自 data/{stage === "draft" ? "styles.draft.json" : "styles.json"} · 改数据即改页面
          </p>
        </aside>
      </div>
    </div>
  );
}
