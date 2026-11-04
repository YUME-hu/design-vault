import type { Metadata } from "next";
import Link from "next/link";
import { ExportPanel } from "@/components/library/export-panel";
import { PaletteGrid } from "@/components/library/palette-grid";
import { getRefs, getStylePool } from "@design-vault/adapters/data";
import { orderedPaletteEntries, toCssVariables, toTailwindTheme } from "@design-vault/adapters/export";
import {
  BRAND_KEYWORD_LABELS,
  COLOR_MODE_LABELS,
  PAGE_TYPE_LABELS,
  TARGET_USER_LABELS,
  parseProfileQuery,
  recommend,
  type RankedResult,
} from "@design-vault/adapters/recommend";
import { PROJECT_TYPE_LABELS } from "@design-vault/adapters/schema";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "推荐结果",
  description: "按标签交集打分的规则推荐结果：主推荐 + 备选。",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** 结果指纹：同一份输入 + 同一份库 → 同一个指纹。用来肉眼确认「确定性」。 */
function fingerprint(results: { style: { id: string }; score: number }[]): string {
  const payload = JSON.stringify(results.map((item) => [item.style.id, item.score]));
  let hash = 0;
  for (let index = 0; index < payload.length; index += 1) {
    hash = (hash * 31 + payload.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

function StageBadge({ stage }: { stage: RankedResult["stage"] }) {
  if (stage === "confirmed") {
    return (
      <span className="mono border border-hairline-strong px-1.5 py-[2px] text-[9px] uppercase tracking-[0.12em] text-ink-faded">
        Confirmed
      </span>
    );
  }
  return (
    <span className="mono border border-signal px-1.5 py-[2px] text-[9px] uppercase tracking-[0.12em] text-signal">
      Draft
    </span>
  );
}

function MatchedTags({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return (
      <p className="text-[11px] leading-relaxed text-ink-faded">
        没有命中标签 —— 仅靠项目适配度进入排序。
      </p>
    );
  }
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <li
          key={tag}
          data-testid="matched-tag"
          className="mono border border-charcoal px-2 py-[3px] text-[10px] lowercase tracking-[0.06em] text-charcoal"
        >
          #{tag}
        </li>
      ))}
    </ul>
  );
}

export default async function ResultPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const parsed = parseProfileQuery(params);

  if (!parsed.ok) {
    return (
      <div className="px-4 pb-10 pt-8 sm:px-6 lg:px-8">
        <p className="label-strong flex items-center gap-2">
          <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
          INDEX 04 / RESULT · M1a
        </p>
        <h1 className="mt-3 text-[28px] font-bold text-charcoal sm:text-[40px]">参数不完整</h1>
        <p className="mt-3 max-w-[52ch] text-[13px] leading-relaxed text-ink-soft">
          这个结果页只认真实的画像参数。回表单重新选一遍就能出结果。
        </p>
        <ul className="mt-4 space-y-1">
          {parsed.issues.map((issue) => (
            <li key={issue} className="mono text-[10px] text-ink-faded">
              · {issue}
            </li>
          ))}
        </ul>
        <Link
          href="/"
          className="mono mt-6 inline-block border border-charcoal px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-charcoal hover:bg-charcoal hover:text-paper"
        >
          回画像表单 →
        </Link>
      </div>
    );
  }

  const { profile } = parsed;
  const results = recommend(getStylePool(), profile, 5);
  const main = results[0];
  const mainRef = main ? getRefs().find((ref) => ref.linked_style_id === main.style.id) : undefined;
  const alternates = results.slice(1, 3);
  const digest = fingerprint(results);

  const summary = [
    PROJECT_TYPE_LABELS[profile.projectType],
    TARGET_USER_LABELS[profile.targetUser],
    PAGE_TYPE_LABELS[profile.pageType],
    COLOR_MODE_LABELS[profile.colorMode],
    ...profile.keywords.map((keyword) => BRAND_KEYWORD_LABELS[keyword]),
  ];

  return (
    <div className="px-4 pb-10 pt-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 border-b border-charcoal pb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="label-strong flex items-center gap-2">
            <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
            INDEX 04 / RESULT · M1a
          </p>
          <h1 className="mt-3 text-balance text-[28px] font-bold leading-[1.15] text-charcoal sm:text-[40px]">
            推荐结果
          </h1>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {summary.map((item) => (
              <li
                key={item}
                className="border border-hairline-strong px-2 py-[3px] text-[11px] leading-none text-ink-soft"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="shrink-0 md:text-right">
          <p className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faded">
            pool {String(results.length).padStart(2, "0")} / digest{" "}
            <span data-testid="result-digest">{digest}</span>
          </p>
          <Link
            href="/"
            className="mono mt-2 inline-block border border-charcoal px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-charcoal hover:bg-charcoal hover:text-paper"
          >
            ← 改答案
          </Link>
        </div>
      </div>

      {!main ? (
        <div className="mt-6 border border-dashed border-hairline-strong p-6">
          <p className="mono text-[12px] uppercase tracking-[0.18em] text-charcoal">
            库里还没有可推荐的风格
          </p>
          <p className="mt-2 text-[12px] text-ink-faded">
            先去 /library 把草案确认几条，再回来重跑一次。
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="order-2 min-w-0 lg:order-1">
            {/* ---------- 主推荐 ---------- */}
            <article
              data-testid="main-recommendation"
              className="relative overflow-hidden border border-charcoal bg-white"
            >
              <div className="hazard h-[6px] w-full" aria-hidden />
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="label-strong flex items-center gap-2">
                    <span className="text-signal">RANK 01</span>
                    <span aria-hidden className="text-hairline-strong">/</span>
                    <span>Main</span>
                  </p>
                  <span
                    data-testid="score-value"
                    className="mono text-[11px] tracking-[0.1em] text-charcoal"
                  >
                    SCORE {main.score}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-baseline gap-2">
                  <h2 className="mono text-balance text-[24px] font-bold leading-tight text-charcoal">
                    {main.style.name}
                  </h2>
                  <StageBadge stage={main.stage} />
                </div>
                <p className="mono mt-1 break-all text-[10px] tracking-[0.08em] text-ink-faded">
                  <span data-testid="main-style-id">{main.style.id}</span>
                </p>
                {mainRef ? (
                  <a
                    href={mainRef.url}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="main-ref-link"
                    className="mono mt-2 inline-flex items-center gap-1 border border-hairline-strong px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-charcoal underline-offset-4 hover:border-charcoal hover:underline"
                  >
                    查看参考网站 ↗
                  </a>
                ) : null}

                <div className="mt-4">
                  <p className="label">Matched tags / 命中标签</p>
                  <div className="mt-2">
                    <MatchedTags tags={main.matchedTags} />
                  </div>
                </div>

                <ul className="mt-3 space-y-1">
                  {main.reasons.map((reason) => (
                    <li key={reason} className="text-[11px] leading-relaxed text-ink-soft">
                      · {reason}
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  <p className="label">Palette preview</p>
                  <div className="mt-2">
                    <PaletteGrid
                      entries={orderedPaletteEntries(main.style.palette)}
                      identity={main.style.identity_colors}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-hairline pt-4">
                  <Link
                    href={`/library/${main.style.id}`}
                    className="mono border border-charcoal px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-charcoal hover:bg-charcoal hover:text-paper"
                  >
                    查看完整记录 →
                  </Link>
                  <span className="mono self-center text-[9px] uppercase tracking-[0.14em] text-ink-faded">
                    tag {main.tagScore} · suit {main.suitability >= 0 ? "+" : ""}
                    {main.suitability}
                  </span>
                </div>
              </div>
            </article>

            {/* ---------- 备选 ---------- */}
            <div className="mt-6">
              <div className="flex items-baseline justify-between border-b border-charcoal pb-2">
                <h2 className="text-[15px] font-bold text-charcoal">备选</h2>
                <span className="mono text-[9px] uppercase tracking-[0.16em] text-ink-faded">
                  top 2 of {results.length}
                </span>
              </div>

              {alternates.length === 0 ? (
                <p className="mt-3 text-[12px] text-ink-faded">
                  库里只有一条风格，暂时没有备选。
                </p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {alternates.map((item, position) => (
                    <article
                      key={item.style.id}
                      data-testid="alternate-card"
                      className="flex min-w-0 flex-col border border-charcoal bg-white"
                    >
                      <div className="flex items-baseline justify-between gap-2 px-4 pt-3">
                        <p className="label">
                          Rank {String(position + 2).padStart(2, "0")} / Alt
                        </p>
                        <span className="mono text-[10px] tracking-[0.08em] text-charcoal">
                          {item.score}
                        </span>
                      </div>
                      <h3 className="mono mt-1 px-4 text-[16px] font-bold leading-tight text-charcoal">
                        {item.style.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 px-4">
                        <StageBadge stage={item.stage} />
                        {item.matchedTags.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            data-testid="matched-tag"
                            className="mono text-[9px] text-ink-faded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex h-[6px] w-full" aria-hidden>
                        {orderedPaletteEntries(item.style.palette).map(([key, hex]) => (
                          <span key={key} className="flex-1" style={{ backgroundColor: hex }} />
                        ))}
                      </div>
                      <Link
                        href={`/library/${item.style.id}`}
                        className="mono mt-auto border-t border-hairline px-4 py-2 text-[9px] uppercase tracking-[0.16em] text-ink-faded hover:bg-charcoal hover:text-paper"
                      >
                        Open record →
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <p className="mono mt-6 border-t border-hairline pt-3 text-[9px] uppercase leading-relaxed tracking-[0.14em] text-ink-faded">
              引擎 rules/tag-intersection/v1 · 没有命中标签的记录也可能因项目适配进入榜单 ·
              结果按分数 → 标签分 → id 排序，同输入必然同结果
            </p>
          </div>

          <aside className="order-1 min-w-0 lg:order-2 lg:sticky lg:top-[79px] lg:self-start">
            <ExportPanel
              cssVariables={toCssVariables(main.style)}
              tailwindTheme={toTailwindTheme(main.style)}
              prompt={main.style.frontend_prompt}
              meta={{
                id: main.style.id,
                confidence: main.style.confidence,
                promptType: main.style.prompt_type,
                paletteSource: main.style.palette_source,
                sourceType: main.style.sources[0]?.type ?? "manual",
                updatedAt: main.style.updated_at,
              }}
            />
            <p className="mono mt-3 px-1 text-[9px] uppercase leading-relaxed tracking-[0.14em] text-ink-faded">
              复制面板来自主推荐 · {main.style.name}
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
