import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-start justify-center px-4 py-16 sm:px-6 lg:px-8">
      <p className="mono text-[10px] uppercase tracking-[0.22em] text-signal">Error 404</p>
      <h1 className="mt-3 text-[32px] font-bold leading-tight text-charcoal sm:text-[40px]">
        没有这条记录
      </h1>
      <p className="mt-3 max-w-[42ch] text-[13px] leading-relaxed text-ink-soft">
        ID 不在 <code className="mono border border-hairline bg-white px-1">data/styles.json</code>{" "}
        里，或者这条风格已经被丢弃。
      </p>
      <Link
        href="/library"
        className="mono mt-6 border border-charcoal px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-charcoal hover:bg-charcoal hover:text-paper"
      >
        返回风格库 →
      </Link>
    </div>
  );
}
