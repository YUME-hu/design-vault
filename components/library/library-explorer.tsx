"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PROJECT_TYPE_LABELS, type ProjectType } from "@/lib/schema";
import { cn } from "@/lib/utils";

export type LibraryRecord = {
  id: string;
  index: string;
  name: string;
  sourceType: string;
  confidence: number;
  updatedAt: string;
  palette: [string, string][];
  tags: string[];
  suitable: ProjectType[];
  unsuitable: ProjectType[];
  promptType: string;
};

type Props = {
  records: LibraryRecord[];
  tags: string[];
};

/**
 * 风格库浏览器：列表 + 搜索 + 标签筛选（AND 语义）。
 * 数据在服务端读好再传进来，这里只做过滤与呈现，不碰 fs。
 */
export function LibraryExplorer({ records, tags }: Props) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return records.filter((record) => {
      const hitTag = activeTags.every((tag) => record.tags.includes(tag));
      if (!hitTag) return false;
      if (!needle) return true;
      const haystack = [
        record.name,
        record.id,
        record.sourceType,
        ...record.tags,
        ...record.suitable.map((item) => PROJECT_TYPE_LABELS[item]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [records, query, activeTags]);

  const toggleTag = (tag: string) =>
    setActiveTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );

  const hasFilter = query.trim().length > 0 || activeTags.length > 0;

  return (
    <div className="mt-6">
      {/* ---------- 过滤条 ---------- */}
      <div className="flex flex-col gap-3 border border-charcoal bg-white/40 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <label htmlFor="vault-search" className="label shrink-0 pl-1">
            Search
          </label>
          <input
            id="vault-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="名称 / ID / 标签 / 项目类型"
            className="mono h-9 w-full min-w-0 border border-hairline-strong bg-paper px-3 text-[12px] tracking-[0.04em] text-charcoal placeholder:text-ink-faded focus:border-charcoal focus:outline-none"
          />
        </div>
        <div className="mono flex shrink-0 items-center gap-3 text-[10px] uppercase tracking-[0.16em] text-ink-faded">
          <span>
            MATCH <span className="text-charcoal">{String(filtered.length).padStart(3, "0")}</span> /
            TOTAL <span className="text-charcoal">{String(records.length).padStart(3, "0")}</span>
          </span>
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setActiveTags([]);
              }}
              className="border border-hairline-strong px-2 py-1 text-[9px] hover:border-charcoal hover:bg-charcoal hover:text-paper"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ---------- 标签 ---------- */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="label mr-1">Filter</span>
        {tags.map((tag) => {
          const active = activeTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              aria-pressed={active}
              onClick={() => toggleTag(tag)}
              className={cn(
                "mono border px-2 py-[3px] text-[10px] lowercase tracking-[0.1em]",
                active
                  ? "border-charcoal bg-charcoal text-paper"
                  : "border-hairline-strong text-ink-faded hover:border-charcoal hover:text-charcoal",
              )}
            >
              #{tag}
            </button>
          );
        })}
      </div>

      {/* ---------- 记录清单 ---------- */}
      <ol className="rivet relative mt-6 border border-charcoal">
        {filtered.map((record) => (
          <li key={record.id} className="border-t border-charcoal first:border-t-0">
            <Link
              href={`/library/${record.id}`}
              className="group grid grid-cols-[40px_1fr] bg-paper outline-offset-[-2px] hover:bg-charcoal focus-visible:bg-charcoal sm:grid-cols-[56px_1fr] lg:grid-cols-[56px_72px_1fr_auto]"
            >
              {/* 编号 */}
              <div className="mono flex items-start justify-center border-r border-hairline py-4 text-[11px] tracking-[0.1em] text-ink-faded group-hover:text-paper/60">
                {record.index}
              </div>

              {/* 竖向色带（桌面） */}
              <div
                className="hidden flex-col divide-y divide-charcoal/15 border-r border-charcoal lg:flex"
                aria-hidden
              >
                {record.palette.slice(0, 8).map(([key, hex]) => (
                  <span key={key} className="flex-1" style={{ backgroundColor: hex }} />
                ))}
              </div>

              <div className="min-w-0 px-4 py-4 sm:px-5">
                {/* 横向色带（移动） */}
                <div className="mb-3 flex h-[6px] w-full divide-x divide-charcoal/20 lg:hidden" aria-hidden>
                  {record.palette.slice(0, 8).map(([key, hex]) => (
                    <span key={key} className="flex-1" style={{ backgroundColor: hex }} />
                  ))}
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="label flex flex-wrap items-baseline gap-x-1.5 group-hover:text-paper/55">
                      <span className="whitespace-nowrap">Record {record.index}</span>
                      <span className="whitespace-nowrap">· {record.sourceType}</span>
                      <span className="whitespace-nowrap">· Conf {Math.round(record.confidence * 100)}%</span>
                    </p>
                    <h2 className="mono mt-2 text-[20px] font-bold leading-[1.2] text-charcoal group-hover:text-paper sm:text-[26px]">
                      {record.name}
                    </h2>
                    <p className="mono mt-1 truncate text-[10px] tracking-[0.1em] text-ink-faded group-hover:text-paper/45">
                      {record.id}
                    </p>
                  </div>

                  <span className="mono flex shrink-0 items-center gap-2 pt-1 text-[10px] uppercase tracking-[0.18em] text-ink-faded group-hover:text-paper/70">
                    <span className="hidden sm:inline">Open Record</span>
                    <span aria-hidden>→</span>
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="label group-hover:text-paper/45">适用</span>
                  {record.suitable.map((project) => (
                    <span
                      key={project}
                      className="border border-hairline-strong px-2 py-[2px] text-[11px] leading-tight text-charcoal group-hover:border-paper/35 group-hover:text-paper/85"
                    >
                      {PROJECT_TYPE_LABELS[project]}
                      <span className="mono ml-1 text-[9px] text-ink-faded group-hover:text-paper/40">
                        {project}
                      </span>
                    </span>
                  ))}
                  <span className="label ml-2 group-hover:text-paper/45">不适用</span>
                  {record.unsuitable.map((project) => (
                    <span
                      key={project}
                      className="border border-hairline px-2 py-[2px] text-[11px] leading-tight text-ink-faded line-through group-hover:border-paper/20 group-hover:text-paper/40"
                    >
                      {PROJECT_TYPE_LABELS[project]}
                    </span>
                  ))}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {record.tags.map((tag) => (
                    <span
                      key={tag}
                      className="mono text-[10px] lowercase tracking-[0.08em] text-ink-faded group-hover:text-paper/45"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 置信度仪表（大屏） */}
              <div className="hidden w-[136px] shrink-0 border-l border-hairline px-4 py-4 lg:block">
                <p className="label group-hover:text-paper/45">Confidence</p>
                <p className="mono mt-1 text-[26px] leading-none text-charcoal group-hover:text-paper">
                  {Math.round(record.confidence * 100)}
                  <span className="text-[11px]">%</span>
                </p>
                <div className="mt-2 flex gap-[2px]" aria-hidden>
                  {Array.from({ length: 10 }).map((_, cell) => (
                    <span
                      key={cell}
                      className={cn(
                        "h-[8px] flex-1",
                        cell < Math.round(record.confidence * 10)
                          ? "bg-signal group-hover:bg-paper"
                          : "bg-charcoal/15 group-hover:bg-paper/25",
                      )}
                    />
                  ))}
                </div>
                <p className="mono mt-3 text-[9px] uppercase tracking-[0.14em] text-ink-faded group-hover:text-paper/40">
                  upd {record.updatedAt}
                </p>
              </div>
            </Link>
          </li>
        ))}

        {filtered.length === 0 && (
          <li className="flex flex-col items-start gap-1 px-5 py-10">
            <p className="mono text-[12px] uppercase tracking-[0.2em] text-charcoal">
              No record matches
            </p>
            <p className="text-[12px] text-ink-faded">
              清掉搜索词或标签再试。当前库里只有 {records.length} 条种子记录。
            </p>
          </li>
        )}
      </ol>

      {records.length < 5 && (
        <div className="mt-4 flex flex-col gap-2 border border-dashed border-hairline-strong px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="label">Slot {String(records.length + 1).padStart(3, "0")}–005</p>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              M0 只放 NASA-Punk 一条种子，其余 4 条手动补进{" "}
              <code className="mono border border-hairline bg-white px-1 py-[1px] text-[11px]">
                data/styles.json
              </code>
              ，不生成占位风格。
            </p>
          </div>
          <span className="mono shrink-0 text-[9px] uppercase tracking-[0.2em] text-ink-faded">
            Manual Entry
          </span>
        </div>
      )}
    </div>
  );
}
