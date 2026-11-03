import type { Metadata } from "next";
import Link from "next/link";
import { StyleForm } from "@/components/library/style-form";
import { getDraftStyles, getStyles } from "@/lib/data";
import { readPending } from "@/lib/ingest/pending-store";
import { buildStyleFromPending } from "@/lib/ingest/pending-to-style";
import type { Style } from "@/lib/schema";

export const metadata: Metadata = {
  title: "新建风格",
  description: "手动新建一条风格：调色器 + 服务端校验，直接进入已确认库。",
};

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ pending?: string }>;
};

export default async function NewStylePage({ searchParams }: PageProps) {
  const { pending } = await searchParams;
  const pendingItem = pending ? readPending().find((item) => item.id === pending) : undefined;

  let initial: Style | undefined;
  let buildError = "";

  if (pendingItem) {
    try {
      const taken = new Set([
        ...getStyles().map((style) => style.id),
        ...getDraftStyles().map((style) => style.id),
      ]);
      initial = buildStyleFromPending(pendingItem, {
        takenIds: taken,
        today: new Date().toISOString().slice(0, 10),
      });
    } catch (error) {
      buildError = (error as Error).message;
    }
  }

  return (
    <div className="px-4 pb-10 pt-7 sm:px-6 lg:px-8">
      <nav
        aria-label="面包屑"
        className="mono flex flex-wrap items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-ink-faded"
      >
        <Link href="/library" className="underline-offset-4 hover:text-charcoal hover:underline">
          风格库
        </Link>
        <span aria-hidden>/</span>
        {pendingItem ? (
          <>
            <Link
              href="/pending"
              className="underline-offset-4 hover:text-charcoal hover:underline"
            >
              审核队列
            </Link>
            <span aria-hidden>/</span>
          </>
        ) : null}
        <span className="text-charcoal">New</span>
      </nav>

      <div className="mt-3 border-b border-charcoal pb-5">
        <p className="label-strong flex items-center gap-2">
          <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
          {pendingItem ? "PENDING → POLISH · M2b" : "INDEX 05 / NEW STYLE · M1b"}
        </p>
        <h1 className="mt-3 text-balance text-[28px] font-bold leading-[1.15] text-charcoal sm:text-[40px]">
          {pendingItem ? "调色并入库" : "新建风格"}
        </h1>
        <p className="mt-3 max-w-[56ch] text-[13px] leading-[1.9] text-ink-soft">
          {pendingItem
            ? "这条候选已经预填：缺的字段用确定性规则补过了，调色器里改完保存即可入库，保存后会从 pending 队列移除。"
            : "手动创建的条目直接进已确认库（不是草案）。配色区就是完整调色器：拾色、OKLCH 色阶、WCAG 对比度、实时预览、带色阶的导出，都在这里。"}
        </p>
      </div>

      {pendingItem && (
        <div
          data-testid="from-pending-banner"
          className="mt-4 border border-charcoal border-l-[4px] border-l-signal bg-white p-3"
        >
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-signal">
            来源：pending
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
            {pendingItem.name} · UP {pendingItem.upstream_name || pendingItem.sources[0]?.upstream} ·{" "}
            BV {pendingItem.sources[0]?.video || "—"} · confidence {pendingItem.confidence}
            {pendingItem.notes ? ` · ${pendingItem.notes}` : ""}
          </p>
          {initial && (
            <p className="mono mt-1 text-[9px] leading-relaxed tracking-[0.08em] text-ink-faded">
              已自动补全：缺 palette 时按色彩方向映射；缺 tokens 时用零圆角 / 8px 网格基线。
            </p>
          )}
          {buildError && (
            <p className="mono mt-1 text-[10px] text-[#B3261E]">预填失败：{buildError}</p>
          )}
        </div>
      )}

      <StyleForm mode="create" initial={initial} pendingId={pendingItem?.id} />
    </div>
  );
}
