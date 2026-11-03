export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-charcoal">
      <div className="mx-auto flex max-w-console flex-col gap-2 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-ink-faded">
          Design Vault · v0.5 · M4a 效果库 · 数据源 data/*.json · 纯本地
        </p>
        <p className="mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-ink-faded">
          never invented here<span className="cursor-block ml-2" aria-hidden />
        </p>
      </div>
    </footer>
  );
}
