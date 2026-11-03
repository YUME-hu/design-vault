import { paletteSchema, styleSchema, type PendingItem, type Style } from "../schema";
import { paletteDirectionNote, paletteFromDirection } from "./palette-from-direction";

/**
 * pending 候选 → 完整 Style。
 * 缺的东西要么来自信源（candidate），要么由确定性算法补齐（palette 来自色彩方向），
 * 补出来的部分都会写进 notes，方便审核时复核。
 */

const PLACEHOLDER = /^(未提及|未说明|不详|未知|无|none|null|n\/a|na|—|-|待补充)$/i;

export function isPlaceholder(value: string | undefined): boolean {
  return !value || PLACEHOLDER.test(value.trim());
}

const BASELINE_TOKENS = {
  radius: "0",
  shadow: "none",
  spacing: "4/8/12/16/24/32/48",
};

const BASELINE_SCALE = "14/16/20/28/40";

export function slugify(value: string, fallback: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return slug.length >= 2 ? slug : fallback;
}

function uniqueId(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  for (let index = 2; index < 100; index += 1) {
    const candidate = `${base}-${index}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now()}`;
}

export type BuildOptions = {
  takenIds: Set<string>;
  today: string;
};

export function buildStyleFromPending(item: PendingItem, options: BuildOptions): Style {
  const notes: string[] = [];
  const candidate = item.candidate;

  if (item.notes) notes.push(item.notes);

  // ---- palette：优先用候选自带的，否则从色彩方向确定性映射 ----
  const candidatePalette = paletteSchema.safeParse(candidate.palette);
  let palette: Record<string, string>;
  let paletteSource: Style["palette_source"] = "manual";

  if (candidatePalette.success) {
    palette = candidatePalette.data;
  } else {
    const direction = item.color_direction ?? {
      temperature: "neutral" as const,
      saturation: "muted" as const,
      contrast: "medium" as const,
      semantic_hint: "未提供色彩方向，使用中性基线",
    };
    palette = paletteFromDirection(direction);
    paletteSource = "direction-mapped";
    notes.push(paletteDirectionNote(direction));
  }

  // ---- typography ----
  const typographyCandidate = candidate.typography;
  const heading = !isPlaceholder(typographyCandidate?.heading ?? "")
    ? typographyCandidate!.heading
    : "system-ui";
  const body = !isPlaceholder(typographyCandidate?.body ?? "")
    ? typographyCandidate!.body
    : heading;
  const scale = !isPlaceholder(typographyCandidate?.scale ?? "")
    ? typographyCandidate!.scale!
    : BASELINE_SCALE;
  if (isPlaceholder(typographyCandidate?.heading ?? "")) {
    notes.push("信源未给出字体，先用 system-ui，建议替换。");
  }

  // ---- tokens ----
  const tokensCandidate = (candidate.tokens ?? {}) as Record<string, string>;
  const tokens: Record<string, string> = {
    radius: !isPlaceholder(tokensCandidate.radius) ? tokensCandidate.radius! : BASELINE_TOKENS.radius,
    border: !isPlaceholder(tokensCandidate.border)
      ? tokensCandidate.border!
      : `1px solid ${palette.text.toLowerCase()}`,
    shadow: !isPlaceholder(tokensCandidate.shadow) ? tokensCandidate.shadow! : BASELINE_TOKENS.shadow,
    spacing: !isPlaceholder(tokensCandidate.spacing)
      ? tokensCandidate.spacing!
      : BASELINE_TOKENS.spacing,
  };
  for (const [key, value] of Object.entries(tokensCandidate)) {
    if (!["radius", "border", "shadow", "spacing"].includes(key) && !isPlaceholder(value)) {
      tokens[key] = value;
    }
  }
  if (isPlaceholder(tokensCandidate.radius) || isPlaceholder(tokensCandidate.spacing)) {
    notes.push("部分设计令牌未在信源中出现，使用了零圆角 / 8px 网格基线。");
  }

  // ---- components ----
  const components = Object.fromEntries(
    Object.entries((candidate.components ?? {}) as Record<string, string>)
      .map(([key, value]) => [key.trim(), value.trim()])
      .filter(([key, value]) => Boolean(key) && !isPlaceholder(value)),
  );
  if (Object.keys(components).length === 0) {
    components.layout = "信源未提供组件细节，需人工补充。";
    notes.push("组件规格缺失，已占位，入库后需要补。");
  }

  // ---- 适配项目 ----
  const suitable = [...new Set(candidate.suitable_projects ?? [])];
  const unsuitable = [...new Set(candidate.unsuitable_projects ?? [])].filter(
    (project) => !suitable.includes(project),
  );

  const name = candidate.name?.trim() || item.video_title.trim() || item.name;
  const frontendPrompt = !isPlaceholder(candidate.frontend_prompt ?? "")
    ? candidate.frontend_prompt!
    : `参考「${name}」的视觉语言；信源没有给出更细的规则，入库后请补充前端提示词。`;

  if (item.raw_response && item.confidence === 0) {
    notes.push("该条曾因模型输出不合格被降级，人工复核后再用。");
  }

  const id = uniqueId(slugify(name, `pending-${item.id.slice(0, 8)}`), options.takenIds);

  return styleSchema.parse({
    id,
    name,
    sources: item.sources.map((source, index) =>
      index === 0 && item.upstream_name
        ? { ...source, upstream: `${item.upstream_name} (${source.upstream})` }
        : { ...source },
    ),
    original_prompt: "",
    prompt_type: "frontend",
    frontend_prompt: frontendPrompt,
    suitable_projects: suitable,
    unsuitable_projects: unsuitable,
    project_tags: candidate.project_tags ?? [],
    palette,
    palette_source: paletteSource,
    identity_colors: [],
    typography: { heading, body, scale },
    tokens,
    components,
    performance_notes: !isPlaceholder(candidate.performance_notes ?? "")
      ? candidate.performance_notes!
      : "",
    notes: notes.join(" "),
    confidence: item.confidence,
    created_at: options.today,
    updated_at: options.today,
  });
}
