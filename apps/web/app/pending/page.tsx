import type { Metadata } from "next";
import Link from "next/link";
import { PendingActions } from "@/components/pending/pending-actions";
import { readPending } from "@design-vault/adapters/ingest/pending-store";
import { cn } from "@design-vault/adapters/utils";

export const metadata: Metadata = {
  title: "审核队列",
  description: "采集到的候选风格（M2a 只读展示）。",
};

export const dynamic = "force-dynamic";

function confidenceTone(confidence: number) {
  if (confidence === 0) return "border-[#B3261E] bg-[#B3261E] text-white";
  if (confidence < 0.5) return "border-signal text-signal";
  return "border-charcoal bg-charcoal text-paper";
}

export default function PendingPage() {
  const pending = [...readPending()].sort((a, b) =>
    b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id),
  );

  const buckets = {
    zero: pending.filter((item) => item.confidence === 0).length,
    low: pending.filter((item) => item.confidence > 0 && item.confidence < 0.5).length,
    ok: pending.filter((item) => item.confidence >= 0.5).length,
  };

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 border-b border-charcoal pb-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="label-strong flex items-center gap-2">
            <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
            INDEX 02 / PENDING QUEUE · M2b
          </p>
          <h1 className="mt-3 text-balance text-[28px] font-bold leading-[1.15] text-charcoal sm:text-[40px]">
            审核队列
          </h1>
          <p className="mt-3 max-w-[56ch] text-[13px] leading-[1.9] text-ink-soft">
            抓取产物先落在这里，人工确认之前绝不进正式库。展开一条后可以「通过并入库」「去调色」或「丢弃」。
          </p>
        </div>

        <dl className="flex shrink-0 items-end gap-5">
          <div>
            <dt className="label">Total</dt>
            <dd className="mono mt-1 text-[26px] leading-none text-charcoal">
              {String(pending.length).padStart(3, "0")}
            </dd>
          </div>
          <div>
            <dt className="label">Conf 0</dt>
            <dd className="mono mt-1 text-[20px] leading-none text-[#B3261E]">
              {String(buckets.zero).padStart(2, "0")}
            </dd>
          </div>
          <div>
            <dt className="label">0.3</dt>
            <dd className="mono mt-1 text-[20px] leading-none text-signal">
              {String(buckets.low).padStart(2, "0")}
            </dd>
          </div>
          <div>
            <dt className="label">≥0.5</dt>
            <dd className="mono mt-1 text-[20px] leading-none text-charcoal">
              {String(buckets.ok).padStart(2, "0")}
            </dd>
          </div>
        </dl>
      </div>

      {pending.length === 0 ? (
        <div className="mt-6 border border-dashed border-hairline-strong p-6">
          <p className="mono text-[12px] uppercase tracking-[0.18em] text-charcoal">
            队列为空
          </p>
          <p className="mt-2 max-w-[52ch] text-[12px] leading-relaxed text-ink-faded">
            去{" "}
            <Link href="/subscriptions" className="underline underline-offset-4 hover:text-charcoal">
              订阅页
            </Link>{" "}
            点一次「检查更新」。抓取产物会落到{" "}
            <code className="mono border border-hairline bg-white px-1">data/pending.json</code>。
          </p>
        </div>
      ) : (
        <div className="mt-6 border border-charcoal bg-white">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-charcoal px-3 py-2">
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-ink-soft">
              {String(pending.length).padStart(3, "0")} 条候选 · 点标题展开详情
            </p>
            <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">
              review · m2b
            </p>
          </div>

          <ul className="divide-y divide-charcoal">
            {pending.map((item) => {
              const direction = item.color_direction;
              return (
                <li key={item.id}>
                  <details
                    data-testid="pending-row"
                    data-pending-id={item.id}
                    className="group"
                  >
                    <summary className="flex cursor-pointer list-none flex-wrap items-start justify-between gap-3 px-3 py-3 hover:bg-charcoal/[0.04] [&::-webkit-details-marker]:hidden">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="mono text-[14px] font-bold leading-tight text-charcoal">
                            {item.name}
                          </span>
                          <span
                            className={cn(
                              "mono border px-1.5 py-[1px] text-[8px] uppercase tracking-[0.12em]",
                              confidenceTone(item.confidence),
                            )}
                          >
                            conf {item.confidence}
                          </span>
                          <span className="mono border border-hairline-strong px-1.5 py-[1px] text-[8px] uppercase tracking-[0.12em] text-ink-faded">
                            {item.status}
                          </span>
                          <span
                        data-testid="item-type"
                        className="mono border border-charcoal px-1.5 py-[1px] text-[8px] uppercase tracking-[0.12em] text-charcoal"
                      >
                        {item.item_type === "component" ? "组件" : item.item_type === "effect" ? "动效" : "风格"}
                      </span>
                      {item.duplicate_of && (
                            <span
                              data-testid="duplicate-badge"
                              className="mono border border-signal px-1.5 py-[1px] text-[8px] uppercase tracking-[0.12em] text-signal"
                            >
                              相似 → {item.duplicate_of}
                            </span>
                          )}
                        </div>
                        <p className="mono mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[9px] uppercase tracking-[0.1em] text-ink-faded">
                          <span>UP {item.upstream_name || item.sources[0]?.upstream}</span>
                          <span>BV {item.sources[0]?.video || "—"}</span>
                          <span>uid {item.sources[0]?.upstream}</span>
                          <span>{item.created_at}</span>
                        </p>
                        {item.notes && (
                          <p className="mt-1 text-[11px] leading-relaxed text-[#B3261E]">
                            {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="mono shrink-0 pt-1 text-[9px] uppercase tracking-[0.14em] text-ink-faded group-open:text-charcoal">
                        展开 <span aria-hidden className="inline-block group-open:rotate-90">→</span>
                      </span>
                    </summary>

                    <div
                      data-testid="pending-detail"
                      className="border-t border-hairline bg-paper px-3 py-3"
                    >
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="min-w-0 border border-hairline bg-white p-3">
                          <p className="label">Source</p>
                          <dl className="mono mt-2 space-y-1 text-[10px] leading-relaxed text-ink-soft">
                            <div className="flex gap-2">
                              <dt className="w-[64px] shrink-0 text-ink-faded">type</dt>
                              <dd>{item.sources[0]?.type}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="w-[64px] shrink-0 text-ink-faded">upstream</dt>
                              <dd className="break-all">
                                {item.upstream_name || "—"} · {item.sources[0]?.upstream}
                              </dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="w-[64px] shrink-0 text-ink-faded">video</dt>
                              <dd className="break-all">{item.sources[0]?.video || "—"}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="w-[64px] shrink-0 text-ink-faded">url</dt>
                              <dd className="break-all">
                                {item.sources[0]?.url ? (
                                  <a
                                    href={item.sources[0]?.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="underline underline-offset-4 hover:text-signal"
                                  >
                                    {item.sources[0]?.url}
                                  </a>
                                ) : (
                                  "无"
                                )}
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="min-w-0 border border-hairline bg-white p-3">
                          <p className="label">Color direction</p>
                          {direction ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {[
                                ["temperature", direction.temperature],
                                ["saturation", direction.saturation],
                                ["contrast", direction.contrast],
                              ].map(([key, value]) => (
                                <span
                                  key={key}
                                  className="mono border border-hairline-strong px-2 py-[3px] text-[9px] lowercase tracking-[0.06em] text-ink-soft"
                                >
                                  {key}: {value}
                                </span>
                              ))}
                              <p className="mt-1 w-full text-[11px] leading-relaxed text-ink-soft">
                                {direction.semantic_hint}
                              </p>
                            </div>
                          ) : (
                            <p className="mt-2 text-[11px] text-ink-faded">无（未调用模型）</p>
                          )}
                          {item.reasoning && (
                            <p className="mt-2 border-t border-hairline pt-2 text-[11px] leading-relaxed text-ink-soft">
                              {item.reasoning}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 border border-hairline bg-white">
                        <p className="label border-b border-hairline px-3 py-2">
                          Candidate JSON
                        </p>
                        <pre className="max-h-[260px] overflow-auto p-3 text-[10px] leading-relaxed text-ink-soft">
                          {JSON.stringify(item.candidate, null, 2)}
                        </pre>
                      </div>

                      <div className="mt-2 border border-hairline bg-white">
                        <p className="label border-b border-hairline px-3 py-2">
                          Raw response
                        </p>
                        <pre className="max-h-[260px] overflow-auto p-3 text-[10px] leading-relaxed text-ink-faded">
                          {item.raw_response || "（未调用模型：无 GitHub 链接 / README 不可用）"}
                        </pre>
                      </div>

                      {item.extracted_effects.length > 0 ? (
                        <div data-testid="pending-effects" className="mt-2 border border-hairline bg-white">
                          <p className="label border-b border-hairline px-3 py-2">
                            提取到的技术方案 · {item.extracted_effects.length}
                          </p>
                          <ul className="divide-y divide-hairline">
                            {item.extracted_effects.map((effect, position) => (
                              <li key={`${effect.name}-${position}`} className="px-3 py-2">
                                <p className="text-[12px] font-bold text-charcoal">{effect.name}</p>
                                <p className="mono mt-1 text-[9px] uppercase tracking-[0.1em] text-ink-faded">
                                  {effect.tech_stack.join(" · ") || "未标注技术栈"}
                                </p>
                                <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{effect.description}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {item.notes.includes("视觉截帧") && item.sources[0]?.video ? (
                        <div data-testid="montage-preview" className="mt-2 border border-hairline bg-white">
                          <p className="label border-b border-hairline px-3 py-2">
                            视觉截帧拼图（10% / 50% / 90%）
                          </p>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/frames/${item.sources[0].video}`}
                            alt="视觉截帧拼图"
                            className="w-full"
                          />
                        </div>
                      ) : null}

                      <PendingActions id={item.id} duplicateOf={item.duplicate_of} itemType={item.item_type} />
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <p className="mono mt-6 border-t border-hairline pt-3 text-[9px] uppercase leading-relaxed tracking-[0.14em] text-ink-faded">
        m2b · 通过 / 调色 / 丢弃都会落盘并原子写入 · 低置信不自动入库
      </p>
    </div>
  );
}
