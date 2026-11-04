import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StyleForm } from "@/components/library/style-form";
import { getStyleRecord } from "@design-vault/adapters/data";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const record = getStyleRecord(id);
  return {
    title: record ? `编辑 · ${record.style.name}` : "编辑风格",
  };
}

export default async function EditStylePage({ params }: PageProps) {
  const { id } = await params;
  const record = getStyleRecord(id);
  if (!record) notFound();

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
        <Link
          href={`/library/${record.style.id}`}
          className="underline-offset-4 hover:text-charcoal hover:underline"
        >
          {record.style.name}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-charcoal">Edit</span>
      </nav>

      <div className="mt-3 border-b border-charcoal pb-5">
        <p className="label-strong flex items-center gap-2">
          <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
          EDIT / {record.style.id} · {record.stage === "draft" ? "DRAFT" : "CONFIRMED"}
        </p>
        <h1 className="mt-3 text-balance text-[28px] font-bold leading-[1.15] text-charcoal sm:text-[40px]">
          编辑：{record.style.name}
        </h1>
        <p className="mt-3 max-w-[56ch] text-[13px] leading-[1.9] text-ink-soft">
          保存走后端校验（zod + 整体数组），不会直接改前端状态。
          {record.stage === "draft"
            ? "这条还在草案区，保存后仍留在草案里。"
            : "改动会写回 data/styles.json。"}
        </p>
      </div>

      <StyleForm mode="edit" initial={record.style} />
    </div>
  );
}
