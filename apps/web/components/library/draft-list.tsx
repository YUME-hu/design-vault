import Link from "next/link";
import { ConfirmDraftButton } from "@/components/library/confirm-draft-button";
import { orderedPaletteEntries } from "@design-vault/adapters/export";
import type { Style } from "@design-vault/adapters/schema";

function hostOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

/**
 * 草案区：条目全部来自官方设计文档的提取结果（confidence 0.6），
 * 没经过人工确认不会出现在「已确认」里。
 */
export function DraftList({ drafts }: { drafts: Style[] }) {
  if (drafts.length === 0) {
    return (
      <div className="mt-6 border border-dashed border-hairline-strong p-6">
        <p className="mono text-[12px] uppercase tracking-[0.18em] text-charcoal">
          草案区为空
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-ink-faded">
          全部草案都已确认或还没有写入 <code className="mono border border-hairline bg-white px-1">data/styles.draft.json</code>。
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border border-charcoal bg-white/40 px-3 py-2">
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
          Draft {String(drafts.length).padStart(3, "0")} · 未确认不会进正式库
        </p>
        <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">
          每条都能点回官方文档
        </p>
      </div>

      <ol className="rivet relative mt-3 border border-charcoal">
        {drafts.map((style, position) => {
          const entries = orderedPaletteEntries(style.palette);
          return (
            <li key={style.id} className="border-t border-charcoal first:border-t-0">
              <article
                data-testid="draft-row"
                data-draft-id={style.id}
                className="grid grid-cols-[40px_minmax(0,1fr)] bg-paper sm:grid-cols-[56px_minmax(0,1fr)] lg:grid-cols-[56px_64px_minmax(0,1fr)_200px]"
              >
                <div className="mono flex items-start justify-center border-r border-hairline py-4 text-[11px] tracking-[0.1em] text-ink-faded">
                  {String(position + 1).padStart(3, "0")}
                </div>

                <div
                  className="hidden flex-col divide-y divide-charcoal/15 border-r border-charcoal lg:flex"
                  aria-hidden
                >
                  {entries.slice(0, 8).map(([key, hex]) => (
                    <span key={key} className="flex-1" style={{ backgroundColor: hex }} />
                  ))}
                </div>

                <div className="min-w-0 px-4 py-4 sm:px-5">
                  <div
                    className="mb-3 flex h-[6px] w-full divide-x divide-charcoal/20 lg:hidden"
                    aria-hidden
                  >
                    {entries.slice(0, 8).map(([key, hex]) => (
                      <span key={key} className="flex-1" style={{ backgroundColor: hex }} />
                    ))}
                  </div>

                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="label group-hover:text-paper/55">
                      Draft {String(position + 1).padStart(3, "0")}
                    </span>
                    <span className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
                      conf {Math.round(style.confidence * 100)}%
                    </span>
                  </div>

                  <h3 className="mono mt-2 text-balance text-[19px] font-bold leading-[1.25] text-charcoal sm:text-[22px]">
                    <Link
                      href={`/library/${style.id}`}
                      className="underline-offset-4 hover:underline"
                    >
                      {style.name}
                    </Link>
                  </h3>
                  <p className="mono mt-1 break-all text-[10px] tracking-[0.06em] text-ink-faded">
                    {style.id}
                  </p>

                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {style.project_tags.map((tag) => (
                      <li
                        key={tag}
                        className="mono border border-hairline-strong px-1.5 py-[2px] text-[9px] lowercase tracking-[0.06em] text-ink-soft"
                      >
                        #{tag}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={style.sources[0]?.url}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="draft-source-link"
                    className="mono mt-3 inline-flex max-w-full items-baseline gap-1.5 text-[10px] tracking-[0.04em] text-charcoal underline decoration-hairline-strong underline-offset-4 hover:text-signal"
                  >
                    <span aria-hidden>↗</span>
                    <span className="truncate">官方文档</span>
                    <span className="truncate text-[9px] text-ink-faded">
                      {hostOf(style.sources[0]?.url ?? "")}
                    </span>
                  </a>
                </div>

                <div className="col-span-2 border-t border-hairline px-3 py-3 sm:px-4 lg:col-span-1 lg:border-l lg:border-t-0 lg:py-4">
                  <div className="flex gap-2 lg:block">
                    <div className="min-w-0 flex-1 lg:flex-none">
                      <ConfirmDraftButton id={style.id} size="sm" />
                    </div>
                    <Link
                      href={`/library/${style.id}`}
                      className="mono flex min-w-0 flex-1 items-center justify-center border border-hairline-strong px-2 py-2 text-center text-[9px] uppercase tracking-[0.14em] text-ink-soft hover:border-charcoal hover:bg-charcoal hover:text-paper lg:mt-2"
                    >
                      查看记录 →
                    </Link>
                  </div>
                  <p className="mono mt-2 hidden text-[8px] uppercase leading-relaxed tracking-[0.1em] text-ink-faded lg:block">
                    {style.sources[0]?.type ?? "manual"}
                  </p>
                </div>
              </article>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
