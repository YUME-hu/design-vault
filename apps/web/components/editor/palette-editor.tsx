"use client";

import { useMemo, useState } from "react";
import { CopyButton } from "@/components/library/copy-button";
import {
  buildScales,
  contrastChecks,
  formatRatio,
  isHexColor,
  normalizeHex,
  type ColorScale,
} from "@design-vault/adapters/color";
import { toPaletteCss, toPaletteJson, toPaletteTailwind } from "@design-vault/adapters/export";
import { copyText } from "@design-vault/adapters/clipboard";
import { cn } from "@design-vault/adapters/utils";

const CORE_KEYS = ["primary", "bg", "surface", "text", "muted"];

const SLOT_LABELS: Record<string, string> = {
  primary: "主色",
  bg: "底色",
  surface: "面层",
  text: "文字",
  muted: "弱化",
  info: "信息",
  warning: "警示",
  danger: "危险",
  success: "成功",
  sand: "沙色",
};

type Props = {
  palette: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
  /** 导出文件头里用的名字 */
  name: string;
};

function ScaleStrip({ scale }: { scale: ColorScale }) {
  return (
    <div className="flex h-[10px] w-full overflow-hidden border border-hairline">
      {scale.entries.map((entry) => (
        <span
          key={entry.step}
          className="flex-1"
          style={{ backgroundColor: entry.hex }}
          title={`${entry.step} · ${entry.hex}`}
        />
      ))}
    </div>
  );
}

/**
 * 调色器：每个语义色一个拾色器 + HEX 输入，实时生成 OKLCH 色阶、跑对比度、更新预览、导出。
 * /library/new 与 /library/[id]/edit 共用这一个组件。
 */
export function PaletteEditor({ palette, onChange, name }: Props) {
  const keys = Object.keys(palette);
  const [activeKey, setActiveKey] = useState(keys[0] ?? "primary");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [newKey, setNewKey] = useState("");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const scales = useMemo(() => buildScales(palette), [palette]);
  const checks = useMemo(() => contrastChecks(palette), [palette]);

  const activeScale = scales[activeKey] ?? scales[keys[0]];
  const failing = checks.filter((check) => !check.pass).length;

  function setColor(key: string, value: string) {
    const normalized = normalizeHex(value);
    if (!normalized) return;
    onChange({ ...palette, [key]: normalized });
  }

  async function copyHex(hex: string) {
    if (!(await copyText(hex))) return;
    setCopiedHex(hex);
    window.setTimeout(() => setCopiedHex((current) => (current === hex ? null : current)), 1400);
  }

  function addSlot() {
    const key = newKey.trim().toLowerCase();
    if (!/^[a-z][a-z0-9-]*$/.test(key)) return;
    if (palette[key]) return;
    onChange({ ...palette, [key]: "#8A8A8A" });
    setActiveKey(key);
    setNewKey("");
  }

  function removeSlot(key: string) {
    if (CORE_KEYS.includes(key)) return;
    const next = { ...palette };
    delete next[key];
    onChange(next);
    if (activeKey === key) setActiveKey(CORE_KEYS[0]);
  }

  return (
    <div
      data-testid="palette-editor"
      className="border border-charcoal bg-white"
    >
      <div className="hazard h-[6px] w-full" aria-hidden />
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-charcoal px-3 py-2">
        <p className="label-strong">Palette / 调色器</p>
        <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">
          {keys.length} slots · {failing === 0 ? "contrast ok" : `${failing} contrast fail`}
        </p>
      </div>

      <div className="grid gap-0 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* ---------- 左：拾色器列表 ---------- */}
        <div className="border-b border-charcoal xl:border-b-0 xl:border-r">
          <ul>
            {keys.map((key) => {
              const value = palette[key];
              const draft = drafts[key] ?? value;
              const scale = scales[key];
              const active = key === activeKey;

              return (
                <li
                  key={key}
                  data-testid={`palette-row-${key}`}
                  className={cn(
                    "relative border-b border-hairline px-3 py-2",
                    active ? "bg-charcoal/[0.04]" : "hover:bg-charcoal/[0.02]",
                  )}
                >
                  {active && (
                    <span aria-hidden className="absolute bottom-0 left-0 top-0 w-[4px] bg-signal" />
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveKey(key)}
                      className="mono w-[74px] shrink-0 text-left text-[10px] uppercase tracking-[0.12em] text-charcoal hover:text-signal"
                      title={SLOT_LABELS[key] ?? "自定义槽位"}
                    >
                      {key}
                    </button>

                    <input
                      type="color"
                      data-testid={`palette-color-${key}`}
                      aria-label={`${key} 取色器`}
                      value={normalizeHex(value) ?? "#000000"}
                      onChange={(event) => setColor(key, event.target.value)}
                      className="h-8 w-8 shrink-0 cursor-pointer border border-charcoal bg-transparent p-0"
                    />

                    <input
                      type="text"
                      data-testid={`palette-hex-${key}`}
                      aria-label={`${key} HEX`}
                      value={draft}
                      spellCheck={false}
                      maxLength={7}
                      onChange={(event) => {
                        const next = event.target.value;
                        setDrafts((current) => ({ ...current, [key]: next }));
                        if (isHexColor(next)) setColor(key, next);
                      }}
                      onBlur={() => {
                        setDrafts((current) => {
                          const next = { ...current };
                          delete next[key];
                          return next;
                        });
                      }}
                      className={cn(
                        "mono h-8 w-[98px] min-w-0 border bg-paper px-2 text-[11px] uppercase tracking-[0.04em] focus:outline-none",
                        isHexColor(draft)
                          ? "border-hairline-strong text-charcoal focus:border-charcoal"
                          : "border-signal text-signal",
                      )}
                    />

                    <div className="hidden min-w-0 flex-1 sm:block">
                      {scale && <ScaleStrip scale={scale} />}
                    </div>

                    {!CORE_KEYS.includes(key) && (
                      <button
                        type="button"
                        onClick={() => removeSlot(key)}
                        aria-label={`删除 ${key}`}
                        className="mono h-8 w-6 shrink-0 border border-hairline-strong text-[12px] leading-none text-ink-faded hover:border-signal hover:text-signal"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="mt-2 sm:hidden">{scale && <ScaleStrip scale={scale} />}</div>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2 px-3 py-2">
            <input
              value={newKey}
              onChange={(event) => setNewKey(event.target.value)}
              placeholder="新增槽位，如 brand-2"
              className="mono h-8 min-w-0 flex-1 border border-hairline-strong bg-paper px-2 text-[11px] lowercase placeholder:text-ink-faded focus:border-charcoal focus:outline-none"
            />
            <button
              type="button"
              onClick={addSlot}
              disabled={!/^[a-z][a-z0-9-]*$/.test(newKey.trim()) || Boolean(palette[newKey.trim()])}
              className="mono h-8 shrink-0 border border-charcoal px-3 text-[9px] uppercase tracking-[0.14em] text-charcoal hover:bg-charcoal hover:text-paper disabled:opacity-40"
            >
              + Slot
            </button>
          </div>
        </div>

        {/* ---------- 右：色阶 + 对比度 + 预览 + 导出 ---------- */}
        <div className="min-w-0">
          {activeScale && (
            <div className="border-b border-charcoal p-3">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="label">
                  Scale · <span className="text-charcoal">{activeKey}</span>
                  <span className="ml-2 normal-case tracking-normal text-ink-faded">
                    {SLOT_LABELS[activeKey] ?? "自定义"}
                  </span>
                </p>
                <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
                  anchor {activeScale.anchorStep} ★ = input
                </p>
              </div>

              <ul className="mt-2 grid grid-cols-5 gap-px border border-charcoal bg-charcoal sm:grid-cols-10">
                {activeScale.entries.map((entry) => (
                  <li key={entry.step} className="bg-white">
                    <button
                      type="button"
                      data-testid="scale-item"
                      data-step={entry.step}
                      data-hex={entry.hex}
                      onClick={() => copyHex(entry.hex)}
                      className="group flex w-full flex-col"
                    >
                      <span
                        className={cn(
                          "block h-[52px] w-full",
                          entry.anchor && "outline outline-2 -outline-offset-2 outline-signal",
                        )}
                        style={{ backgroundColor: entry.hex }}
                      />
                      <span className="flex flex-col items-center border-t border-hairline px-1 py-1">
                        <span className="mono text-[9px] leading-none text-ink-faded">
                          {entry.step}
                          {entry.anchor ? "★" : ""}
                        </span>
                        <span className="mono mt-0.5 text-[8px] uppercase leading-none text-charcoal group-hover:text-signal">
                          {copiedHex === entry.hex ? "COPIED" : entry.hex}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 对比度 */}
          <div className="border-b border-charcoal p-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="label">Contrast · WCAG 2.1</p>
              <p className="mono text-[9px] uppercase tracking-[0.12em] text-ink-faded">
                正文 4.5:1 · 大字/图形 3:1
              </p>
            </div>
            <ul className="mt-2 divide-y divide-hairline border border-charcoal">
              {checks.map((check) => (
                <li
                  key={check.id}
                  data-testid="contrast-row"
                  data-check={check.id}
                  data-ratio={check.ratio.toFixed(2)}
                  data-pass={check.pass ? "true" : "false"}
                  className="flex flex-wrap items-center justify-between gap-2 px-2 py-1.5"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <span
                      aria-hidden
                      className="h-4 w-4 shrink-0 border border-charcoal"
                      style={{
                        background: `linear-gradient(135deg, ${check.foreground} 0 50%, ${check.background} 50% 100%)`,
                      }}
                    />
                    <span className="mono truncate text-[10px] tracking-[0.04em] text-charcoal">
                      {check.label}
                    </span>
                  </span>
                  <span className="mono flex items-center gap-3 text-[10px]">
                    <span
                      className={cn(
                        "tracking-[0.04em]",
                        check.pass ? "text-charcoal" : "text-[#B3261E]",
                      )}
                    >
                      {formatRatio(check.ratio)}{" "}
                      {check.pass ? "≥" : "<"} {check.threshold}
                    </span>
                    <span
                      className={cn(
                        "border px-1.5 py-[1px] text-[8px] uppercase tracking-[0.14em]",
                        check.pass
                          ? "border-hairline-strong text-ink-faded"
                          : "border-[#B3261E] bg-[#B3261E] text-white",
                      )}
                    >
                      {check.pass ? "Pass" : "Fail"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* 实时预览 */}
          <div className="border-b border-charcoal p-3">
            <p className="label">Live preview</p>
            <div
              className="mt-2 p-3"
              style={{ backgroundColor: palette.bg, color: palette.text }}
            >
              <div
                data-testid="preview-card"
                className="border p-3"
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.muted,
                  color: palette.text,
                }}
              >
                <p className="mono text-[9px] uppercase tracking-[0.16em]" style={{ color: palette.muted }}>
                  Component preview
                </p>
                <p data-testid="preview-text" className="mt-1 text-[12px] leading-relaxed">
                  正文示例：这套配色读起来是否舒服，按钮和输入框是否够清楚。
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    data-testid="preview-button"
                    className="border px-3 py-1.5 text-[11px] leading-none"
                    style={{
                      backgroundColor: palette.primary,
                      borderColor: palette.primary,
                      color: palette.bg,
                    }}
                  >
                    主按钮
                  </button>
                  <input
                    data-testid="preview-input"
                    readOnly
                    value="输入框"
                    aria-label="预览输入框"
                    className="h-[30px] w-[132px] min-w-0 border px-2 text-[11px]"
                    style={{
                      backgroundColor: palette.surface,
                      borderColor: palette.muted,
                      color: palette.text,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 导出 */}
          <div className="p-3">
            <p className="label">Export · 含 50–900 色阶</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              <div data-testid="export-css">
                <CopyButton
                  text={toPaletteCss(name || "palette", palette)}
                  label="CSS"
                  hint=":root"
                />
              </div>
              <div data-testid="export-tailwind">
                <CopyButton
                  text={toPaletteTailwind(name || "palette", palette)}
                  label="Tailwind"
                  hint="theme.extend"
                />
              </div>
              <div data-testid="export-json">
                <CopyButton
                  text={toPaletteJson(palette)}
                  label="Palette JSON"
                  hint="{ }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
