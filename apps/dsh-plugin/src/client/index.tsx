/**
 * Browser half of design-vault-plugin.
 *
 * React is provided by the DSH shell at runtime; it is never bundled. The build
 * wraps this entry in `window.__ModuleLoader__.load({ id, factory })`.
 *
 * Visual language: close to the DeepSeek site — a near-white ground, sections as
 * very light blocks instead of hairlines, brand blue for every selected state,
 * borderless inputs that lift into a focus ring. The stylesheet below is scoped
 * to `.dvp-*` and injected with the tree, so it cannot reach the host shell.
 *
 * @module design-vault-plugin/client
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { NAME, NS } from "../shared/constants.ts";
import { PALETTES } from "../shared/palettes.generated.ts";
import { BANK_PALETTES } from "../shared/visual-bank.ts";
import { VIBES } from "../shared/vibes.generated.ts";
import { copyText } from "./clipboard.ts";
import { groupPalettes } from "./palette-categories.ts";
import { bankPalette, slotsFromColors } from "./palette-slots.ts";
import { buildDesignConfigExport, paletteFromStyle, type PreviewPalette } from "./preview.ts";
import { MOTION_RECIPES, buildPreviewDoc, previewMessage } from "./preview-doc.ts";
import { composePrompt } from "./prompt.ts";
import { GUIDANCE } from "../shared/guidance.ts";
import {
  type BorderToken,
  type DensityToken,
  type LayoutToken,
  type MotionToken,
  type RadiusToken,
  type ShadowToken,
  type ShapeControls,
  type TypographyToken,
} from "./style-tokens.ts";

/**
 * One scoped stylesheet. Hand-written on purpose: the plugin ships a single CJS
 * bundle with no CSS pipeline, and inline styles cannot express `:hover`,
 * `:focus` or a ring.
 */
const PANEL_CSS = `
.dvp-root{
  --dvp-accent:#4D6BFE;
  --dvp-ink:#111827;
  --dvp-ink-2:#6B7280;
  --dvp-field:#F3F4F6;
  --dvp-field-hover:#ECEEF2;
  display:grid;
  grid-template-columns:320px minmax(0,1fr);
  gap:24px;
  padding:24px 28px;
  background:#F9F9F9;
  border-radius:22px;
  color:var(--dvp-ink);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;
  font-size:13px;
  line-height:1.65;
  -webkit-font-smoothing:antialiased;
}
.dvp-rail{
  display:grid;align-content:start;gap:14px;overflow-y:auto;max-height:calc(100vh - 150px);padding-right:4px;
  scrollbar-width:thin;scrollbar-color:#D8DAE0 transparent;
}
.dvp-section{
  display:grid;gap:12px;padding:16px;background:#FFFFFF;border-radius:16px;
  box-shadow:0 1px 2px rgba(16,24,40,.04),0 1px 3px rgba(16,24,40,.03);
}
.dvp-title{font-size:12.5px;font-weight:600;color:var(--dvp-ink);letter-spacing:.01em}
.dvp-field{
  width:100%;padding:10px 12px;border:0;border-radius:10px;background:var(--dvp-field);color:var(--dvp-ink);
  font:inherit;font-size:13px;line-height:1.6;appearance:none;outline:none;
  transition:background .18s ease,box-shadow .18s ease;
}
.dvp-field:hover{background:var(--dvp-field-hover)}
.dvp-field:focus{background:#FFFFFF;box-shadow:0 0 0 3px rgba(77,107,254,.18)}
select.dvp-field{
  padding-right:34px;cursor:pointer;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>");
  background-repeat:no-repeat;background-position:right 12px center;
}
.dvp-label{display:block;margin-bottom:6px;font-size:11.5px;color:var(--dvp-ink-2)}
.dvp-btn{
  display:inline-flex;align-items:center;justify-content:center;gap:6px;width:100%;
  padding:10px 16px;border:0;border-radius:999px;background:var(--dvp-field);color:var(--dvp-ink);
  font:inherit;font-size:13px;font-weight:500;cursor:pointer;
  transition:background .18s ease,transform .18s ease,box-shadow .18s ease,color .18s ease;
}
.dvp-btn:hover{background:var(--dvp-field-hover)}
.dvp-btn:active{transform:scale(.985)}
.dvp-btn:focus-visible{box-shadow:0 0 0 3px rgba(77,107,254,.2);outline:none}
.dvp-btn--primary{background:var(--dvp-accent);color:#FFFFFF;box-shadow:0 6px 16px rgba(77,107,254,.28)}
.dvp-btn--primary:hover{background:#3F5CF0}
.dvp-btn--primary:disabled{opacity:.45;cursor:default;box-shadow:none}
.dvp-btn--ghost{background:transparent;color:var(--dvp-ink-2);width:auto;padding:8px 12px}
.dvp-btn--ghost:hover{background:var(--dvp-field)}
.dvp-btn--sm{padding:9px 14px;font-size:12px;width:auto}
.dvp-presets{display:flex;gap:6px}
.dvp-presets .dvp-btn{flex:1;padding:8px 6px;font-size:12px}
.dvp-chips{display:flex;gap:10px}
.dvp-chip{display:grid;justify-items:center;gap:7px;flex:1;min-width:0;cursor:pointer}
.dvp-chip-swatch{
  position:relative;width:34px;height:34px;border-radius:50%;border:0;
  box-shadow:0 1px 2px rgba(16,24,40,.14),0 4px 10px rgba(16,24,40,.06);
  transition:transform .18s ease,box-shadow .18s ease;
}
.dvp-chip:hover .dvp-chip-swatch{transform:translateY(-2px) scale(1.05);box-shadow:0 6px 14px rgba(16,24,40,.14)}
.dvp-chip input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.dvp-chip-label{font-size:10.5px;color:var(--dvp-ink-2);white-space:nowrap}
.dvp-row{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
.dvp-dots{display:flex;gap:5px;margin-top:2px}
.dvp-dot{width:13px;height:13px;border-radius:50%;box-shadow:0 1px 2px rgba(16,24,40,.2)}
.dvp-status{font-size:11px;color:var(--dvp-ink-2)}
.dvp-status--error{color:#DC2626}
.dvp-recipes{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.dvp-recipe{
  display:flex;align-items:center;gap:6px;padding:8px 9px;border:0;border-radius:9px;
  background:var(--dvp-field);color:#374151;font:inherit;font-size:11.5px;text-align:left;cursor:pointer;
  transition:background .18s ease,color .18s ease,box-shadow .18s ease;
}
.dvp-recipe:hover{background:var(--dvp-field-hover)}
.dvp-recipe:focus-visible{box-shadow:0 0 0 3px rgba(77,107,254,.2);outline:none}
.dvp-recipe--active{background:rgba(77,107,254,.10);color:#3F5CF0;box-shadow:inset 0 0 0 1.5px rgba(77,107,254,.35)}
.dvp-recipe-index{font-variant-numeric:tabular-nums;font-size:9.5px;opacity:.5}
.dvp-recipe-label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dvp-preview{display:grid;gap:16px;align-content:start;min-width:0}
.dvp-tray{display:grid;place-items:center;padding:28px;border-radius:20px;background:#F1F2F4}
.dvp-paper{
  width:100%;max-width:920px;border-radius:16px;overflow:hidden;background:#FFFFFF;
  box-shadow:0 24px 60px rgba(16,24,40,.12),0 4px 12px rgba(16,24,40,.05);
}
.dvp-paper iframe{display:block;width:100%;height:520px;border:0}
.dvp-export{display:grid;gap:10px}
.dvp-tabs{display:flex;gap:6px}
.dvp-tab{
  padding:7px 14px;border:0;border-radius:999px;background:transparent;color:var(--dvp-ink-2);
  font:inherit;font-size:12px;font-weight:500;cursor:pointer;transition:background .18s ease,color .18s ease;
}
.dvp-tab:hover{background:var(--dvp-field)}
.dvp-tab--active{background:#FFFFFF;color:var(--dvp-ink);box-shadow:0 1px 2px rgba(16,24,40,.08)}
.dvp-export-bar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.dvp-note{font-size:11.5px;color:var(--dvp-ink-2)}
.dvp-textarea{
  width:100%;padding:16px;border:0;border-radius:16px;background:#FFFFFF;color:var(--dvp-ink);
  font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.65;
  box-shadow:0 1px 2px rgba(16,24,40,.04);resize:vertical;outline:none;
  transition:box-shadow .18s ease;
}
.dvp-textarea:focus{box-shadow:0 0 0 3px rgba(77,107,254,.18)}
`.trim();

/** A left-navigation glyph: replace with the plugin's own mark. */
function Icon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="none" aria-hidden="true">
      <rect x="2.75" y="2.75" width="10.5" height="10.5" rx="2" stroke="currentColor" />
      <path d="M5.5 8h5" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
}

const DEFAULT_CONTROLS: ShapeControls = {
  density: "Balanced",
  typography: "Modern Sans",
  layout: "Split",
  radius: "Md",
  shadow: "Sm",
  border: "Hairline",
  motion: "Springy",
};

const DEFAULT_SEED = "aurora";

/** Where the current five colours came from. */
type PaletteSource =
  | { kind: "style" }
  | { kind: "preset"; id: string }
  | { kind: "bank"; id: string }
  | { kind: "colors"; colors: string[] };

const VIBE_OPTIONS: { value: string; label: string }[] = VIBES.map((vibe) => ({
  value: vibe.id,
  label: vibe.name,
}));

const DENSITY_OPTIONS: { value: DensityToken; label: string }[] = [
  { value: "Compact", label: "紧凑 Compact" },
  { value: "Dense", label: "紧密 Dense" },
  { value: "Balanced", label: "均衡 Balanced" },
  { value: "Comfortable", label: "舒适 Comfortable" },
  { value: "Airy", label: "宽松 Airy" },
];

const TYPOGRAPHY_OPTIONS: { value: TypographyToken; label: string }[] = [
  { value: "Modern Sans", label: "现代无衬线" },
  { value: "Geometric Sans", label: "几何无衬线" },
  { value: "Editorial Serif", label: "复古衬线" },
  { value: "Brutalist Mono", label: "粗野等宽" },
  { value: "Mixed", label: "混排（衬线标题 + 无衬线正文）" },
  // vendored visual-bank archetypes
  { value: "Editorial Thin", label: "编辑细体 Editorial Thin（w300 / -0.035em / 1.05）" },
  { value: "Grotesk Bold", label: "粗犷 Grotesk Bold（w700 / -0.04em / 1.0）" },
  { value: "Swiss System", label: "瑞士系统 Swiss System（w500 / -0.02em / 1.15）" },
  { value: "Serif + Sans", label: "衬线 + 无衬线 Serif + Sans（1.2 行高）" },
  { value: "Technical Mono", label: "技术等宽 Technical Mono（w500 / 1.4 行高）" },
];

const LAYOUT_OPTIONS: { value: LayoutToken; label: string }[] = [
  { value: "Split", label: "左右分屏" },
  { value: "Bento", label: "网格拼图" },
  { value: "ThreeColumn", label: "三栏布局" },
  { value: "Stack", label: "垂直堆叠" },
];

const RADIUS_OPTIONS: { value: RadiusToken; label: string }[] = [
  { value: "None", label: "无圆角" },
  { value: "Sm", label: "极小" },
  { value: "Md", label: "适中" },
  { value: "Lg", label: "圆润" },
  { value: "Full", label: "全圆角" },
];

const SHADOW_OPTIONS: { value: ShadowToken; label: string }[] = [
  { value: "None", label: "无阴影" },
  { value: "Sm", label: "极轻" },
  { value: "Md", label: "轻" },
  { value: "Lg", label: "中" },
  { value: "Xl", label: "重" },
];

const BORDER_OPTIONS: { value: BorderToken; label: string }[] = [
  { value: "None", label: "无边框" },
  { value: "Hairline", label: "极细线" },
  { value: "Medium", label: "中等边框" },
  { value: "Heavy", label: "粗边框" },
];

const MOTION_OPTIONS: { value: MotionToken; label: string }[] = [
  { value: "None", label: "无动效" },
  { value: "Restrained", label: "克制平滑" },
  { value: "Springy", label: "弹性阻尼" },
];

/** Three whole compositions, for when picking seven dimensions by hand is slow. */
const PRESETS: { label: string; hint: string; controls: ShapeControls }[] = [
  {
    label: "杂志编辑",
    hint: "宽松 · 复古衬线 · 左右分屏",
    controls: {
      density: "Comfortable",
      typography: "Editorial Serif",
      layout: "Split",
      radius: "Sm",
      shadow: "Sm",
      border: "Hairline",
      motion: "Restrained",
    },
  },
  {
    label: "瑞士网格",
    hint: "紧凑 · 几何无衬线 · 三栏",
    controls: {
      density: "Compact",
      typography: "Geometric Sans",
      layout: "ThreeColumn",
      radius: "None",
      shadow: "None",
      border: "Hairline",
      motion: "None",
    },
  },
  {
    label: "新粗野",
    hint: "紧密 · 粗野等宽 · 网格拼图",
    controls: {
      density: "Dense",
      typography: "Brutalist Mono",
      layout: "Bento",
      radius: "None",
      shadow: "Xl",
      border: "Heavy",
      motion: "Springy",
    },
  },
];

const SURFACES = [
  { key: "background", label: "背景" },
  { key: "card", label: "卡片/表面" },
  { key: "content", label: "正文" },
  { key: "title", label: "标题" },
  { key: "accent", label: "强调色" },
] as const;

type SurfaceKey = (typeof SURFACES)[number]["key"];

/* ---------- rail primitives ---------- */

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="dvp-section">
      <div className="dvp-title">{title}</div>
      {children}
    </section>
  );
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label>
      {label === undefined ? null : <span className="dvp-label">{label}</span>}
      <select
        className="dvp-field"
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** A colour chip that opens the native picker; the chip *is* the input. */
function ColorChip({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="dvp-chip" title={`${label} · ${value}`}>
      <span className="dvp-chip-swatch" style={{ background: value }}>
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
      <span className="dvp-chip-label">{label}</span>
    </label>
  );
}

/** One exported snapshot: the JSON plus a signature of the inputs behind it. */
type ExportSnapshot = { json: string; signature: string };

/** The full page selected by the navigation entry. */
function Page({ t }: { t?: (key: string) => string }) {
  const [vibeId, setVibeId] = useState<string>(VIBES[0]?.id ?? "");
  const [vaultStatus, setVaultStatus] = useState<"loading" | "ok" | "fallback">("loading");
  const [vaultStyles, setVaultStyles] = useState<
    { id: string; name: string; palette: Record<string, string> }[]
  >([]);
  const [vaultStyleId, setVaultStyleId] = useState("");
  const [vaultError, setVaultError] = useState("");
  const [vaultBase, setVaultBase] = useState("http://127.0.0.1:3000");
  const [vaultOrigin, setVaultOrigin] = useState("");

  useEffect(() => {
    setVaultOrigin(window.location.origin);
    const stored = window.localStorage.getItem("dvp.webBase");
    const candidates = stored ? [stored] : ["http://127.0.0.1:3000", "http://localhost:3000"];
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    void (async () => {
      let lastError = "unknown";
      for (const base of candidates) {
        try {
          const response = await fetch(`${base}/api/vault/styles-lite`, {
            signal: controller.signal,
            cache: "no-store",
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = (await response.json()) as {
            ok?: boolean;
            styles?: { id: string; name: string; palette: Record<string, string> }[];
          };
          if (!data.ok || !Array.isArray(data.styles)) throw new Error("响应格式不对");
          setVaultStyles(data.styles);
          setVaultBase(base);
          setVaultStatus("ok");
          clearTimeout(timer);
          return;
        } catch (error) {
          const err = error as Error;
          lastError = `${err.name}: ${err.message} (${base})`;
        }
      }
      setVaultStatus("fallback");
      setVaultError(lastError);
    })();

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, []);
  const [seed, setSeed] = useState<string>(DEFAULT_SEED);
  const [controls, setControls] = useState<ShapeControls>(DEFAULT_CONTROLS);
  const [source, setSource] = useState<PaletteSource>({ kind: "style" });
  const [edits, setEdits] = useState<Partial<Record<SurfaceKey, string>>>({});
  const [recipe, setRecipe] = useState<{ id: number; nonce: number }>({ id: 0, nonce: 0 });
  const [exported, setExported] = useState<ExportSnapshot | null>(null);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");

  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [aiStatus, setAiStatus] = useState<"idle" | "copied" | "fail">("idle");
  const [pasteText, setPasteText] = useState<string>("");
  const [pasteError, setPasteError] = useState<string | null>(null);

  const vibe = VIBES.find((item) => item.id === vibeId) ?? VIBES[0];
  const vibeName = vibe?.name ?? vibeId;

  const activePreset =
    source.kind === "preset" ? PALETTES.find((preset) => preset.id === source.id) : undefined;

  /** Grouped for the picker: 31 presets in one flat list is unreadable. */
  const paletteGroups = useMemo(() => groupPalettes(PALETTES), []);

  const activeBank =
    source.kind === "bank" ? BANK_PALETTES.find((entry) => entry.id === source.id) : undefined;

  /** Base colours for the source, then the user's chip edits on top. */
  const palette = useMemo<PreviewPalette>(() => {
    const vaultStyle = vaultStyles.find((item) => item.id === vaultStyleId) ?? null;
    const stylePalette = paletteFromStyle(vaultStyle?.palette ?? vibe?.palette ?? {}, seed);
    if (source.kind === "bank" && activeBank) {
      // Vendored archetypes carry their own roles; nothing is inferred.
      return { ...bankPalette(activeBank, seed), ...edits };
    }
    if (source.kind === "preset" && activePreset) {
      return { ...(slotsFromColors(activePreset.colors, seed) ?? stylePalette), ...edits };
    }
    if (source.kind === "colors") {
      return { ...(slotsFromColors(source.colors, seed) ?? stylePalette), ...edits };
    }
    return { ...stylePalette, ...edits };
  }, [vibe, seed, source, activePreset, activeBank, edits]);

  const paletteId =
    source.kind === "bank"
      ? `bank:${source.id}`
      : source.kind === "preset"
        ? `preset:${source.id}`
        : source.kind === "colors"
          ? "custom"
          : `style:${vibeId}`;

  const label = (key: string, fallback: string): string => t?.(key) ?? fallback;

  const frameRef = useRef<HTMLIFrameElement | null>(null);

  // Built once: later changes are variable writes, so the canvas never reloads.
  const doc = useMemo(
    () =>
      buildPreviewDoc(
        paletteFromStyle(VIBES[0]?.palette ?? {}, DEFAULT_SEED),
        DEFAULT_CONTROLS,
        VIBES[0]?.name ?? "",
      ),
    [],
  );

  const send = useCallback(() => {
    const target = frameRef.current?.contentWindow;
    if (!target) return;
    target.postMessage(previewMessage(palette, controls, vibeName, recipe.id, recipe.nonce), "*");
  }, [palette, controls, vibeName, recipe]);

  useEffect(() => {
    send();
  }, [send]);

  const patch = <K extends keyof ShapeControls>(key: K, value: ShapeControls[K]): void => {
    setControls((current) => ({ ...current, [key]: value }));
  };

  const play = (index: number): void => {
    setRecipe((current) => ({ id: index + 1, nonce: current.nonce + 1 }));
  };

  const choosePreset = (id: string): void => {
    if (id.startsWith("bank:")) {
      setSource({ kind: "bank", id: id.slice("bank:".length) });
    } else {
      setSource(id === "" ? { kind: "style" } : { kind: "preset", id });
    }
    setEdits({});
  };

  /** Copy a ready-to-paste brief; the palette itself is baked on the next build. */
  const requestPalette = async (): Promise<void> => {
    const brief = `请生成一组配色（只输出 3–5 个 HEX，按冷/暖与明暗给出）：${aiPrompt.trim() || "（未填写描述）"}`;
    const ok = await copyText(brief);
    setAiStatus(ok ? "copied" : "fail");
  };

  const applyPaste = (): void => {
    const colors = pasteText.match(/#[0-9a-fA-F]{6}\b/g) ?? [];
    if (colors.length < 2) {
      setPasteError("至少需要 2 个 HEX，例如 #AABBCC, #DDEEFF");
      return;
    }
    setSource({ kind: "colors", colors });
    setEdits({});
    setPasteError(null);
  };

  const [tab, setTab] = useState<"json" | "prompt">("json");

  const currentConfig = useMemo(
    () => buildDesignConfigExport({ vibeId, vibeName, seed, paletteId, controls, palette }),
    [vibeId, vibeName, seed, paletteId, controls, palette],
  );
  const promptText = useMemo(() => composePrompt(currentConfig), [currentConfig]);

  const signature = JSON.stringify([paletteId, seed, controls, palette]);
  const stale = exported !== null && exported.signature !== signature;

  const exportConfig = (): void => {
    setExported({ json: JSON.stringify(currentConfig, null, 2), signature });
    setCopied("idle");
  };

  const activeText = tab === "json" ? (exported?.json ?? "") : promptText;

  const copyActive = async (): Promise<void> => {
    if (activeText === "") return;
    const ok = await copyText(activeText);
    setCopied(ok ? "ok" : "fail");
  };

  return (
    <div className="dvp-root">
      <style>{PANEL_CSS}</style>

      <aside className="dvp-rail">
        <Section title="Vault 服务">
          {vaultStatus === "ok" ? (
            <>
              <select
                className="dvp-field"
                value={vaultStyleId}
                onChange={(event) => setVaultStyleId(event.target.value)}
              >
                <option value="">静态快照（{VIBES.length} 个）</option>
                {vaultStyles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <span className="dvp-label">
                已连接 {vaultBase.replace("http://", "")} · {vaultStyles.length} 个风格
              </span>
            </>
          ) : (
            <>
              <span className="dvp-label">
                {vaultStatus === "loading"
                  ? "正在连接 Web 服务…"
                  : "未连接到 Web 服务，当前为静态快照"}
              </span>
              {vaultStatus === "fallback" && (
                <span className="dvp-label" style={{ color: "#B3261E", wordBreak: "break-all" }}>
                  origin: {vaultOrigin || "unknown"} · {vaultError || "no error detail"}
                </span>
              )}
            </>
          )}
        </Section>

        <Section title={label("panel.vibe", "风格")}>
          <SelectField value={vibeId} options={VIBE_OPTIONS} onChange={setVibeId} />
        </Section>

        <Section title="配色来源">
          <label>
            <span className="dvp-label">精选配色</span>
            <select
              className="dvp-field"
              value={
                source.kind === "bank"
                  ? `bank:${source.id}`
                  : source.kind === "preset"
                    ? source.id
                    : ""
              }
              onChange={(event) => choosePreset(event.target.value)}
            >
              <option value="">跟随风格（{vibeName}）</option>
              {paletteGroups.map((group) => (
                <optgroup key={group.category} label={`${group.label} · ${group.items.length}`}>
                  {group.items.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </optgroup>
              ))}
              <optgroup label={`视觉库 · ${BANK_PALETTES.length}（显式角色）`}>
                {BANK_PALETTES.map((entry) => (
                  <option key={entry.id} value={`bank:${entry.id}`}>
                    {entry.name}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
          {activePreset ? (
            <div className="dvp-dots">
              {activePreset.colors.map((hex) => (
                <span key={hex} className="dvp-dot" style={{ background: hex }} title={hex} />
              ))}
            </div>
          ) : null}

          <div>
            <span className="dvp-label">AI 配色</span>
            <div className="dvp-row">
              <input
                className="dvp-field"
                value={aiPrompt}
                onChange={(event) => {
                  setAiPrompt(event.target.value);
                  setAiStatus("idle");
                }}
                placeholder="描述你想要的氛围，如「雨后的冷调工业」"
              />
              <button
                type="button"
                className="dvp-btn dvp-btn--sm"
                onClick={() => void requestPalette()}
              >
                生成
              </button>
            </div>
            {aiStatus === "copied" ? (
              <p className="dvp-status" style={{ margin: "8px 0 0" }}>
                已复制生成请求 · 粘到对话里产出后，烘焙进预置库
              </p>
            ) : null}
            {aiStatus === "fail" ? (
              <p className="dvp-status dvp-status--error" style={{ margin: "8px 0 0" }}>
                复制失败，请手动复制描述
              </p>
            ) : null}
          </div>

          <div>
            <span className="dvp-label">Color Hunt / 粘贴 HEX</span>
            <div className="dvp-row">
              <input
                className="dvp-field"
                value={pasteText}
                onChange={(event) => {
                  setPasteText(event.target.value);
                  setPasteError(null);
                }}
                placeholder="#AABBCC, #DDEEFF, #112233"
              />
              <button type="button" className="dvp-btn dvp-btn--sm" onClick={applyPaste}>
                应用
              </button>
            </div>
            {pasteError ? (
              <p className="dvp-status dvp-status--error" style={{ margin: "8px 0 0" }}>
                {pasteError}
              </p>
            ) : null}
          </div>
        </Section>

        <Section title="当前配色">
          <div className="dvp-chips">
            {SURFACES.map((surface) => (
              <ColorChip
                key={surface.key}
                label={surface.label}
                value={palette[surface.key]}
                onChange={(value) => setEdits((current) => ({ ...current, [surface.key]: value }))}
              />
            ))}
          </div>
          <div className="dvp-row">
            <input
              className="dvp-field"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
              placeholder="色相种子"
              aria-label="色相种子"
            />
            <button type="button" className="dvp-btn dvp-btn--ghost" onClick={() => setEdits({})}>
              复位
            </button>
          </div>
        </Section>

        <Section title="预设组合">
          <div className="dvp-presets">
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="dvp-btn"
                title={preset.hint}
                onClick={() => setControls(preset.controls)}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </Section>

        <Section title={label("panel.density", "密度")}>
          <SelectField
            value={controls.density}
            options={DENSITY_OPTIONS}
            onChange={(value) => patch("density", value)}
          />
        </Section>

        <Section title={label("panel.typography", "字体")}>
          <SelectField
            value={controls.typography}
            options={TYPOGRAPHY_OPTIONS}
            onChange={(value) => patch("typography", value)}
          />
        </Section>

        <Section title={label("panel.layout", "聚合形式")}>
          <SelectField
            value={controls.layout}
            options={LAYOUT_OPTIONS}
            onChange={(value) => patch("layout", value)}
          />
        </Section>

        <Section title={label("panel.components", "圆角 · 阴影 · 边框")}>
          <SelectField
            label="圆角大小"
            value={controls.radius}
            options={RADIUS_OPTIONS}
            onChange={(value) => patch("radius", value)}
          />
          <SelectField
            label="阴影层级"
            value={controls.shadow}
            options={SHADOW_OPTIONS}
            onChange={(value) => patch("shadow", value)}
          />
          <SelectField
            label="边框粗细"
            value={controls.border}
            options={BORDER_OPTIONS}
            onChange={(value) => patch("border", value)}
          />
        </Section>

        <Section title={label("panel.motion", "动效手感")}>
          <SelectField
            value={controls.motion}
            options={MOTION_OPTIONS}
            onChange={(value) => patch("motion", value)}
          />
        </Section>

        <Section title={label("panel.recipes", "动效配方库")}>
          <div className="dvp-recipes">
            {MOTION_RECIPES.map((item, index) => {
              const active = recipe.id === index + 1;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => play(index)}
                  title={`播放：${item.label}`}
                  className={`dvp-recipe${active ? " dvp-recipe--active" : ""}`}
                >
                  <span className="dvp-recipe-index">{String(index + 1).padStart(2, "0")}</span>
                  <span className="dvp-recipe-label">{item.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <button type="button" className="dvp-btn dvp-btn--primary" onClick={exportConfig}>
          {label("panel.export", "导出 DesignConfig")}
        </button>
      </aside>

      <div className="dvp-preview">
        <div className="dvp-tray">
          <div className="dvp-paper">
            <iframe
              ref={frameRef}
              title="设计预览"
              srcDoc={doc}
              sandbox="allow-scripts"
              onLoad={send}
            />
          </div>
        </div>

        <div className="dvp-export">
          <div className="dvp-tabs">
            <button
              type="button"
              className={`dvp-tab${tab === "json" ? " dvp-tab--active" : ""}`}
              onClick={() => setTab("json")}
            >
              DesignConfig JSON
            </button>
            <button
              type="button"
              className={`dvp-tab${tab === "prompt" ? " dvp-tab--active" : ""}`}
              onClick={() => setTab("prompt")}
            >
              生成提示词
            </button>
          </div>

          <div className="dvp-export-bar">
            <button
              type="button"
              className="dvp-btn dvp-btn--ghost"
              onClick={() => void copyActive()}
              disabled={activeText === ""}
              style={{
                opacity: activeText === "" ? 0.45 : 1,
                cursor: activeText === "" ? "default" : "pointer",
              }}
            >
              {copied === "ok" ? "已复制" : tab === "json" ? "复制 JSON" : "复制提示词"}
            </button>
            {copied === "fail" ? <span className="dvp-note">复制失败，请手动选中复制</span> : null}
            {tab === "json" && stale ? (
              <span className="dvp-note">参数已变更，点「导出」刷新</span>
            ) : null}
            {tab === "prompt" ? (
              <span className="dvp-note">
                {GUIDANCE.version} ·{" "}
                {GUIDANCE.source === "placeholder"
                  ? "内置草案，待 motion-web 覆盖"
                  : GUIDANCE.source}
              </span>
            ) : null}
          </div>

          <textarea
            className="dvp-textarea"
            readOnly
            rows={tab === "json" ? 13 : 24}
            spellCheck={false}
            value={activeText}
            placeholder={tab === "json" ? "点击「导出 DesignConfig」生成 JSON" : ""}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * @param ctx - the client Cordis context.
 */
export function apply(ctx: any): void {
  ctx.effect(
    () =>
      ctx.locale.register(NS, {
        en: {
          "panel.title": "design-vault-plugin",
          "panel.vibe": "Style",
          "panel.density": "Density",
          "panel.typography": "Typography",
          "panel.layout": "Layout",
          "panel.components": "Radius · shadow · border",
          "panel.motion": "Motion feel",
          "panel.recipes": "Motion library",
          "panel.export": "Export DesignConfig",
        },
        zh: {
          "panel.title": "design-vault 预览",
          "panel.vibe": "风格",
          "panel.density": "密度",
          "panel.typography": "字体",
          "panel.layout": "聚合形式",
          "panel.components": "圆角 · 阴影 · 边框",
          "panel.motion": "动效手感",
          "panel.recipes": "动效配方库",
          "panel.export": "导出 DesignConfig",
        },
      }),
    `${NAME}: dictionaries`,
  );

  ctx.slots.inject("sidebar.panellist", () =>
    ctx.slots.register(
      {
        name: "sidebar.panellist",
        id: NAME,
        order: 60,
        label: () => ctx.locale.bind(NS)("panel.title"),
        locale: NS,
      },
      Icon,
    ),
  );

  ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: NAME, locale: NS }, Page));
}

export const name = NAME;
export const inject = ["slots", "locale"];
