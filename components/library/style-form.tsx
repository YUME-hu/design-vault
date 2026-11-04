"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { normalizeUrl } from "@design-vault/adapters/url";
import { PaletteEditor } from "@/components/editor/palette-editor";
import { PROJECT_TYPES, PROJECT_TYPE_LABELS, type ProjectType, type Style } from "@design-vault/adapters/schema";
import { isHexColor, normalizeHex } from "@design-vault/adapters/color";
import { cn } from "@design-vault/adapters/utils";

const INPUT =
  "mono h-9 w-full min-w-0 border border-hairline-strong bg-paper px-2 text-[11px] text-charcoal placeholder:text-ink-faded focus:border-charcoal focus:outline-none";
const TEXTAREA =
  "mono w-full min-w-0 border border-hairline-strong bg-paper p-2 text-[11px] leading-relaxed text-charcoal placeholder:text-ink-faded focus:border-charcoal focus:outline-none";

const PALETTE_SOURCES = ["manual", "radix", "tailwind", "bilibili-search", "official-docs", "direction-mapped"] as const;
const SOURCE_TYPES = ["manual", "bilibili", "bilibili-search", "reference", "skill-library", "github", "ref", "extracted-draft"] as const;
const PROMPT_TYPES = ["manual", "frontend", "image-generation"] as const;

const DEFAULT_PALETTE: Record<string, string> = {
  primary: "#D63A2C",
  bg: "#ECE5D6",
  surface: "#FFFFFF",
  text: "#191919",
  muted: "#4C5A68",
  info: "#21467A",
  warning: "#D45814",
};

type FormState = {
  id: string;
  name: string;
  sourceType: (typeof SOURCE_TYPES)[number];
  sourceUrl: string;
  upstream: string;
  video: string;
  promptType: (typeof PROMPT_TYPES)[number];
  originalPrompt: string;
  frontendPrompt: string;
  suitable: ProjectType[];
  unsuitable: ProjectType[];
  tags: string;
  palette: Record<string, string>;
  paletteSource: (typeof PALETTE_SOURCES)[number];
  identity: string;
  heading: string;
  body: string;
  mono: string;
  scale: string;
  radius: string;
  border: string;
  shadow: string;
  spacing: string;
  extraTokens: string;
  components: string;
  performance: string;
  notes: string;
  confidence: string;
};

function toFormState(style?: Style): FormState {
  if (!style) {
    return {
      id: "",
      name: "",
      sourceType: "manual",
      sourceUrl: "",
      upstream: "",
      video: "",
      promptType: "manual",
      originalPrompt: "",
      frontendPrompt: "",
      suitable: [],
      unsuitable: [],
      tags: "",
      palette: { ...DEFAULT_PALETTE },
      paletteSource: "manual",
      identity: "",
      heading: "Space Mono",
      body: "Noto Sans SC",
      mono: "",
      scale: "12/14/16/20/28/40",
      radius: "0",
      border: "1px solid #191919",
      shadow: "none",
      spacing: "4/8/12/16/24/32/48",
      extraTokens: "",
      components: "",
      performance: "",
      notes: "",
      confidence: "0.8",
    };
  }

  const extraTokenLines = Object.entries(style.tokens)
    .filter(([key]) => !["radius", "border", "shadow", "spacing"].includes(key))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  return {
    id: style.id,
    name: style.name,
    sourceType: style.sources[0]?.type ?? "manual",
    sourceUrl: style.sources[0]?.url ?? "",
    upstream: style.sources[0]?.upstream ?? "",
    video: style.sources[0]?.video ?? "",
    promptType: style.prompt_type,
    originalPrompt: style.original_prompt,
    frontendPrompt: style.frontend_prompt,
    suitable: [...style.suitable_projects],
    unsuitable: [...style.unsuitable_projects],
    tags: style.project_tags.join(", "),
    palette: { ...style.palette },
    paletteSource: style.palette_source,
    identity: style.identity_colors.join(", "),
    heading: style.typography.heading,
    body: style.typography.body,
    mono: style.typography.mono ?? "",
    scale: style.typography.scale,
    radius: style.tokens.radius,
    border: style.tokens.border,
    shadow: style.tokens.shadow,
    spacing: style.tokens.spacing,
    extraTokens: extraTokenLines,
    components: Object.entries(style.components)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n"),
    performance: style.performance_notes,
    notes: style.notes ?? "",
    confidence: String(style.confidence),
  };
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <label
        htmlFor={htmlFor}
        className="mono flex items-baseline gap-1 text-[9px] uppercase tracking-[0.14em] text-ink-faded"
      >
        {label}
        {required && (
          <span aria-hidden className="text-signal">
            *
          </span>
        )}
      </label>
      {hint && (
        <p className="mt-0.5 text-[10px] leading-snug text-ink-faded">{hint}</p>
      )}
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Section({
  index,
  title,
  children,
  description,
}: {
  index: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-charcoal py-4">
      <div className="flex items-baseline gap-3">
        <span className="mono text-[10px] text-signal">{index}</span>
        <h2 className="text-[14px] font-bold text-charcoal">{title}</h2>
      </div>
      {description && (
        <p className="mt-1 text-[11px] leading-relaxed text-ink-faded">{description}</p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function parseList(value: string): string[] {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseKeyValues(
  value: string,
  field: string,
): { ok: true; entries: Record<string, string> } | { ok: false; errors: string[] } {
  const entries: Record<string, string> = {};
  const errors: string[] = [];

  for (const rawLine of value.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) {
      errors.push(`${field}: 这一行缺少 "=" —— ${line.slice(0, 40)}`);
      continue;
    }
    const key = line.slice(0, separator).trim();
    const item = line.slice(separator + 1).trim();
    if (!key || !item) {
      errors.push(`${field}: 键或值为空 —— ${line.slice(0, 40)}`);
      continue;
    }
    entries[key] = item;
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, entries };
}

export function StyleForm({
  mode,
  initial,
  pendingId,
}: {
  mode: "create" | "edit";
  initial?: Style;
  pendingId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initial));
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, setPending] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  function toggleProject(key: "suitable" | "unsuitable", project: ProjectType) {
    setForm((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(project)
          ? list.filter((item) => item !== project)
          : [...list, project],
      };
    });
  }

  function buildPayload(): { ok: true; payload: unknown } | { ok: false; errors: string[] } {
    const problems: string[] = [];

    const identity = parseList(form.identity).map((item) => normalizeHex(item));
    if (identity.some((item) => !item)) {
      problems.push(`identity_colors: 有非法 HEX —— ${form.identity}`);
    }

    const tags = parseList(form.tags);
    if (tags.length === 0) problems.push("project_tags: 至少写一个标签");

    const extras = parseKeyValues(form.extraTokens, "tokens");
    const components = parseKeyValues(form.components, "components");
    if (!extras.ok) problems.push(...extras.errors);
    if (!components.ok) problems.push(...components.errors);
    if (components.ok && Object.keys(components.entries).length === 0) {
      problems.push("components: 至少写一条组件规格");
    }

    const confidence = Number(form.confidence);
    if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
      problems.push("confidence: 必须是 0–1 之间的数字");
    }

    for (const key of ["primary", "bg", "surface", "text", "muted"]) {
      if (!isHexColor(form.palette[key] ?? "")) {
        problems.push(`palette.${key}: 必须是合法 HEX`);
      }
    }

    if (problems.length > 0) return { ok: false, errors: problems };

    const typography: Record<string, string> = {
      heading: form.heading,
      body: form.body,
      scale: form.scale,
    };
    if (form.mono.trim()) typography.mono = form.mono.trim();

    const payload = {
      id: form.id.trim(),
      name: form.name.trim(),
      sources: [
        {
          type: form.sourceType,
          url: form.sourceUrl.trim() ? normalizeUrl(form.sourceUrl) : "",
          upstream: form.upstream.trim(),
          video: form.video.trim(),
        },
        ...(initial ? initial.sources.slice(1).map((source) => ({ ...source })) : []),
      ],
      original_prompt: form.originalPrompt,
      prompt_type: form.promptType,
      frontend_prompt: form.frontendPrompt,
      suitable_projects: form.suitable,
      unsuitable_projects: form.unsuitable,
      project_tags: tags,
      palette: form.palette,
      palette_source: form.paletteSource,
      identity_colors: identity.filter(Boolean),
      typography,
      tokens: {
        radius: form.radius,
        border: form.border,
        shadow: form.shadow,
        spacing: form.spacing,
        ...(extras.ok ? extras.entries : {}),
      },
      components: components.ok ? components.entries : {},
      performance_notes: form.performance,
      notes: form.notes,
      confidence,
    };

    return { ok: true, payload: pendingId ? { ...payload, pendingId } : payload };
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const built = buildPayload();
    if (!built.ok) {
      setErrors(built.errors);
      return;
    }

    setPending(true);
    setErrors([]);
    try {
      const response = await fetch(
        mode === "create" ? "/api/styles" : `/api/styles/${initial?.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(built.payload),
        },
      );
      const data = (await response.json()) as {
        ok?: boolean;
        id?: string;
        error?: string;
        issues?: string[];
      };

      if (!response.ok || !data.ok) {
        setErrors([data.error ?? `服务端返回 ${response.status}`, ...(data.issues ?? [])]);
        setPending(false);
        return;
      }

      router.push(`/library/${data.id ?? form.id}`);
      router.refresh();
    } catch (cause) {
      setErrors([`请求失败：${(cause as Error).message}`]);
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      data-testid="style-form"
      className="mt-4 border border-charcoal bg-white"
    >
      <div className="hazard h-[6px] w-full" aria-hidden />

      <div className="p-4 sm:p-5">
        <Section index="01" title="身份">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ID" htmlFor="style-id" required hint="kebab-case，创建后不可改">
              <input
                id="style-id"
                data-testid="style-id"
                value={form.id}
                disabled={mode === "edit"}
                onChange={(event) => set("id", event.target.value)}
                placeholder="my-style-name"
                className={cn(INPUT, mode === "edit" && "opacity-60")}
              />
            </Field>
            <Field label="Name" htmlFor="style-name" required>
              <input
                id="style-name"
                data-testid="style-name"
                value={form.name}
                onChange={(event) => set("name", event.target.value)}
                placeholder="风格名"
                className={INPUT}
              />
            </Field>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <Field label="Source type" required>
              <select
                value={form.sourceType}
                onChange={(event) =>
                  set("sourceType", event.target.value as FormState["sourceType"])
                }
                className={INPUT}
              >
                {SOURCE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Source URL" hint="可为空；有值必须是合法 URL">
              <input
                value={form.sourceUrl}
                onChange={(event) => set("sourceUrl", event.target.value)}
                placeholder="https://…"
                className={INPUT}
              />
            </Field>
            <Field label="Upstream">
              <input
                value={form.upstream}
                onChange={(event) => set("upstream", event.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Video">
              <input
                value={form.video}
                onChange={(event) => set("video", event.target.value)}
                className={INPUT}
              />
            </Field>
          </div>
        </Section>

        <Section index="02" title="提示词" description="frontend_prompt 是这个库最核心的复制资产。">
          <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
            <Field label="Prompt type" required>
              <select
                value={form.promptType}
                onChange={(event) =>
                  set("promptType", event.target.value as FormState["promptType"])
                }
                className={INPUT}
              >
                {PROMPT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Original prompt" hint="有就填，没有留空">
              <textarea
                value={form.originalPrompt}
                onChange={(event) => set("originalPrompt", event.target.value)}
                rows={3}
                className={TEXTAREA}
              />
            </Field>
          </div>
          <Field label="Frontend prompt" required className="mt-3">
            <textarea
              data-testid="style-prompt"
              value={form.frontendPrompt}
              onChange={(event) => set("frontendPrompt", event.target.value)}
              rows={8}
              placeholder="把视觉规则写成可执行的前端提示词…"
              className={TEXTAREA}
            />
          </Field>
        </Section>

        <Section index="03" title="适配与标签">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">
                适用项目 <span className="text-signal">*</span>
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {PROJECT_TYPES.map((project) => {
                  const active = form.suitable.includes(project);
                  return (
                    <button
                      key={project}
                      type="button"
                      aria-pressed={active}
                      data-testid={`suitable-${project}`}
                      onClick={() => toggleProject("suitable", project)}
                      className={cn(
                        "border px-2 py-1 text-[10px] leading-none",
                        active
                          ? "border-charcoal bg-charcoal text-paper"
                          : "border-hairline-strong text-charcoal hover:border-charcoal",
                      )}
                    >
                      {PROJECT_TYPE_LABELS[project]}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">
                不适用项目
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {PROJECT_TYPES.map((project) => {
                  const active = form.unsuitable.includes(project);
                  return (
                    <button
                      key={project}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleProject("unsuitable", project)}
                      className={cn(
                        "border px-2 py-1 text-[10px] leading-none",
                        active
                          ? "border-signal bg-signal text-paper"
                          : "border-hairline-strong text-charcoal hover:border-charcoal",
                      )}
                    >
                      {PROJECT_TYPE_LABELS[project]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Field
            label="Project tags"
            required
            hint="逗号分隔，推荐打分靠它"
            className="mt-3"
          >
            <input
              data-testid="style-tags"
              value={form.tags}
              onChange={(event) => set("tags", event.target.value)}
              placeholder="industrial, high-contrast, monospace"
              className={INPUT}
            />
          </Field>
        </Section>

        <Section index="04" title="配色" description="改任一颜色，右边色阶、对比度、预览实时更新。">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Palette source" required>
              <select
                value={form.paletteSource}
                onChange={(event) =>
                  set("paletteSource", event.target.value as FormState["paletteSource"])
                }
                className={INPUT}
              >
                {PALETTE_SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Identity colors" hint="逗号分隔；留空则没有身份色">
              <input
                data-testid="style-identity"
                value={form.identity}
                onChange={(event) => set("identity", event.target.value)}
                placeholder="#4C5A68, #7A7F4E"
                className={INPUT}
              />
            </Field>
          </div>

          <div className="mt-3">
            <PaletteEditor
              palette={form.palette}
              onChange={(next) => set("palette", next)}
              name={form.name || "palette"}
            />
          </div>
        </Section>

        <Section index="05" title="字体与令牌">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Heading" required>
              <input
                value={form.heading}
                onChange={(event) => set("heading", event.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Body" required>
              <input
                value={form.body}
                onChange={(event) => set("body", event.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Mono" hint="可选">
              <input
                value={form.mono}
                onChange={(event) => set("mono", event.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Scale" required>
              <input
                value={form.scale}
                onChange={(event) => set("scale", event.target.value)}
                className={INPUT}
              />
            </Field>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Radius" required>
              <input
                value={form.radius}
                onChange={(event) => set("radius", event.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Border" required>
              <input
                value={form.border}
                onChange={(event) => set("border", event.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Shadow" required>
              <input
                value={form.shadow}
                onChange={(event) => set("shadow", event.target.value)}
                className={INPUT}
              />
            </Field>
            <Field label="Spacing" required>
              <input
                value={form.spacing}
                onChange={(event) => set("spacing", event.target.value)}
                className={INPUT}
              />
            </Field>
          </div>

          <Field
            label="Extra tokens"
            hint="一行一条 key=value，可选（如 focus=2px solid #0F62FE）"
            className="mt-3"
          >
            <textarea
              value={form.extraTokens}
              onChange={(event) => set("extraTokens", event.target.value)}
              rows={3}
              className={TEXTAREA}
            />
          </Field>
        </Section>

        <Section index="06" title="组件规格与备注">
          <Field
            label="Components"
            required
            hint='一行一条 key=value，如 button=直角，1px 炭黑边'
          >
            <textarea
              data-testid="style-components"
              value={form.components}
              onChange={(event) => set("components", event.target.value)}
              rows={5}
              placeholder={"button=直角、1px 边、Hover 黑白反转\ncard=白底 + 1px 边 + 铆钉角标"}
              className={TEXTAREA}
            />
          </Field>

          <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
            <Field label="Performance notes">
              <textarea
                value={form.performance}
                onChange={(event) => set("performance", event.target.value)}
                rows={2}
                className={TEXTAREA}
              />
            </Field>
            <Field label="Confidence" required hint="0–1">
              <input
                data-testid="style-confidence"
                value={form.confidence}
                onChange={(event) => set("confidence", event.target.value)}
                inputMode="decimal"
                className={INPUT}
              />
            </Field>
          </div>

          <Field label="Notes" hint="人工备注，会显示在详情页" className="mt-3">
            <textarea
              data-testid="style-notes"
              value={form.notes}
              onChange={(event) => set("notes", event.target.value)}
              rows={2}
              className={TEXTAREA}
            />
          </Field>
        </Section>
      </div>

      <div className="flex flex-col gap-3 border-t border-charcoal bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="mono text-[9px] uppercase tracking-[0.14em] text-ink-faded">
            保存前服务端会重新校验：zod · 查重 · 整体数组
          </p>
          {errors.length > 0 && (
            <ul
              role="alert"
              data-testid="form-errors"
              className="mt-2 max-h-[160px] space-y-0.5 overflow-auto border border-[#B3261E] bg-white p-2"
            >
              {errors.map((error) => (
                <li key={error} className="mono text-[9px] leading-relaxed text-[#B3261E]">
                  · {error}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={mode === "edit" && initial ? `/library/${initial.id}` : "/library"}
            className="mono flex h-10 items-center border border-hairline-strong px-4 text-[10px] uppercase tracking-[0.16em] text-charcoal hover:border-charcoal"
          >
            取消
          </Link>
          <button
            type="submit"
            data-testid="submit-style"
            disabled={pending}
            className="mono h-10 border border-charcoal bg-charcoal px-5 text-[10px] uppercase tracking-[0.18em] text-paper hover:border-signal hover:bg-signal disabled:opacity-40"
          >
            {pending ? "Saving…" : mode === "create" ? (pendingId ? "保存并入库 →" : "创建风格 →") : "保存修改 →"}
          </button>
        </div>
      </div>
    </form>
  );
}
