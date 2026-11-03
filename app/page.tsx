import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";
import { getVaultCounts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const counts = getVaultCounts();

  return (
    <div className="home-enter px-4 pb-10 pt-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 border-b border-charcoal pb-6 md:flex-row md:items-end md:justify-between">
        <div className="ef-stagger min-w-0">
          <p className="label-strong flex items-center gap-2">
            <span aria-hidden className="h-[6px] w-[6px] bg-signal" />
            INDEX 00 / PROFILE · M1a
          </p>
          <h1 className="mt-3 text-balance text-[28px] font-bold leading-[1.15] text-charcoal sm:text-[40px]">
            项目画像
          </h1>
          <p className="mt-3 max-w-[48ch] text-[13px] leading-[1.9] text-ink-soft">
            回答五个问题，拿回 1 个主推荐 + 2 个备选。打分只看标签交集，规则确定：
            同样的答案、同样的库，结果永远一样。
          </p>
        </div>
        <p className="mono shrink-0 text-[9px] uppercase leading-relaxed tracking-[0.16em] text-ink-faded">
          pool = confirmed {String(counts.styles).padStart(3, "0")} + draft{" "}
          {String(counts.drafts).padStart(3, "0")}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0">
          <ProfileForm />
        </div>

        <aside className="min-w-0 lg:sticky lg:top-[79px] lg:self-start">
          <div className="panel rivet overflow-hidden">
            <div className="hazard h-[6px] w-full" aria-hidden />
            <div className="p-4">
              <p className="label">Engine</p>
              <p className="mt-1 text-[14px] font-bold text-charcoal">规则打分 v1</p>
              <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-ink-soft">
                <li className="flex gap-2">
                  <span aria-hidden className="mono text-signal">01</span>
                  画像答案展开成标签权重（项目类型 3 / 关键词 2 / 深浅色 2 / 其余 1）
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="mono text-signal">02</span>
                  与每条风格的 project_tags 求交集，权重相加
                </li>
                <li className="flex gap-2">
                  <span aria-hidden className="mono text-signal">03</span>
                  项目适配 +3、项目冲突 −6；同分按标签分、再按 id 排序
                </li>
              </ul>
              <p className="mono mt-4 border-t border-hairline pt-3 text-[9px] uppercase leading-relaxed tracking-[0.14em] text-ink-faded">
                no llm · no embedding · deterministic
              </p>
            </div>
          </div>

          <Link
            href="/library"
            className="mono mt-3 flex items-center justify-between border border-charcoal px-4 py-3 text-[10px] uppercase tracking-[0.18em] text-charcoal hover:bg-charcoal hover:text-paper"
          >
            先看风格库
            <span aria-hidden>→</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
