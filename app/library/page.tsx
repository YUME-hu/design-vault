import type { Metadata } from "next";
import Link from "next/link";
import { DraftList } from "@/components/library/draft-list";
import { LibraryExplorer, type LibraryRecord } from "@/components/library/library-explorer";
import { getAllTags, getDraftStyles, getStyles } from "@/lib/data";
import { orderedPaletteEntries } from "@/lib/export";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "风格库",
  description: "已确认的设计风格与从官方文档提取的草案。",
};

// 数据来自本地 JSON：改完文件刷新即见效，不依赖构建期快照。
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

function TabLink({
  href,
  active,
  zh,
  en,
  count,
  testId,
}: {
  href: string;
  active: boolean;
  zh: string;
  en: string;
  count: number;
  testId: string;
}) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={active}
      data-testid={testId}
      className={cn(
        "flex flex-1 items-center justify-between gap-2 px-3 py-3 sm:flex-none sm:justify-start sm:gap-5",
        active ? "bg-charcoal text-paper" : "text-charcoal hover:bg-charcoal/5",
      )}
    >
      <span className="flex items-baseline gap-2">
        <span className="text-[13px] font-bold leading-none">{zh}</span>
        <span
          className={cn(
            "mono text-[9px] uppercase tracking-[0.18em]",
            active ? "text-paper/55" : "text-ink-faded",
          )}
        >
          {en}
        </span>
      </span>
      <span className="mono text-[11px] leading-none tracking-[0.08em]">
        {String(count).padStart(3, "0")}
      </span>
    </Link>
  );
}

export default async function LibraryPage({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  const activeTab = tab === "draft" ? "draft" : "confirmed";

  const styles = getStyles();
  const drafts = getDraftStyles();
  const tags = getAllTags().map((entry) => entry.tag);

  const records: LibraryRecord[] = styles.map((style, position) => ({
    id: style.id,
    index: String(position + 1).padStart(3, "0"),
    name: style.name,
    sourceType: style.sources[0]?.type ?? "manual",
    confidence: style.confidence,
    updatedAt: style.updated_at,
    palette: orderedPaletteEntries(style.palette),
    tags: style.project_tags,
    suitable: style.suitable_projects,
    unsuitable: style.unsuitable_projects,
    promptType: style.prompt_type,
  }));

  const lastUpdated =
    [...styles, ...drafts].map((style) => style.updated_at).sort((a, b) => b.localeCompare(a))[0] ??
    "—";

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 lg:px-8">
      {/* ---------- 页头 ---------- */}
      <div className="flex flex-col gap-6 border-b border-charcoal pb-6 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="label-strong flex items-center gap-2">
            <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
            INDEX 01 / STYLE LIBRARY
          </p>
          <h1 className="mt-3 text-balance text-[28px] font-bold leading-[1.15] text-charcoal sm:text-[40px]">
            设计资产库
          </h1>
          <p className="mt-3 max-w-[48ch] text-[13px] leading-[1.9] text-ink-soft">
            已确认的才叫资产，草案只是候选。草案从官方设计文档提取、置信度 0.6，
            你点「确认入库」之后才会进入正式库并参与推荐。
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/library/new"
              data-testid="new-style-link"
              className="mono flex h-9 items-center border border-charcoal px-3 text-[10px] uppercase tracking-[0.16em] text-charcoal hover:bg-charcoal hover:text-paper"
            >
              ＋ 新建风格
            </Link>
          </div>
        </div>

        <dl className="flex shrink-0 items-end gap-6 sm:gap-10">
          <div>
            <dt className="label">Records</dt>
            <dd className="mono mt-1 text-[26px] leading-none text-charcoal">
              {String(styles.length).padStart(3, "0")}
            </dd>
          </div>
          <div>
            <dt className="label">Drafts</dt>
            <dd className="mono mt-1 text-[26px] leading-none text-charcoal">
              {String(drafts.length).padStart(3, "0")}
            </dd>
          </div>
          <div>
            <dt className="label">Updated</dt>
            <dd className="mono mt-1 text-[12px] leading-none tracking-[0.1em] text-charcoal">
              {lastUpdated}
            </dd>
          </div>
        </dl>
      </div>

      {/* ---------- Tabs ---------- */}
      <div
        role="tablist"
        aria-label="风格库分区"
        className="mt-6 flex border border-charcoal"
      >
        <TabLink
          href="/library"
          active={activeTab === "confirmed"}
          zh="已确认"
          en="Confirmed"
          count={styles.length}
          testId="tab-confirmed"
        />
        <div className="w-px shrink-0 bg-charcoal" aria-hidden />
        <TabLink
          href="/library?tab=draft"
          active={activeTab === "draft"}
          zh="草案"
          en="Drafts"
          count={drafts.length}
          testId="tab-draft"
        />
      </div>

      {activeTab === "confirmed" ? (
        <LibraryExplorer records={records} tags={tags} />
      ) : (
        <DraftList drafts={drafts} />
      )}

      {/* TODO(M1b)：手动新建风格表单（/library/new → 写入 data/styles.json，先过 zod） */}
    </div>
  );
}
