import { getDeepSeekKey } from "../auth/api-keys";
import { dataPath } from "@design-vault/store/paths";
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { colorDirectionSchema, PROJECT_TYPES, projectTypeSchema, styleSchema } from "../schema";
import type { Style } from "../schema";
import { fetchText, sleep } from "./http";
import type { ExtractedEffect, LlmExtraction, LlmInput } from "./types";

/**
 * DeepSeek 提取适配器。
 * 硬约束：只从候选信源提取；配色只给语义方向（禁止 HEX）；标签必须在枚举内；
 * 严格 JSON；zod 校验失败重试一次，仍失败就把原文交回上层（pending confidence 0）。
 */

export const DEEPSEEK_MODEL = "deepseek-chat";
export const DEFAULT_BASE_URL = "https://api.deepseek.com";
/** 生成比普通 API 慢，单独放宽；其余外部请求默认 10s */
export const LLM_TIMEOUT_MS = 30_000;

export const USAGE_LOG_FILE = dataPath("llm-usage.log");

export type UsageLogEntry = {
  ts: string;
  model: string;
  upstream: string;
  video: string;
  attempt: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  ok: boolean;
  error?: string;
};

export function appendUsageLog(entry: UsageLogEntry, file: string = USAGE_LOG_FILE): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, "utf8");
}

export function buildSystemPrompt(allowedTags: string[]): string {
  return `你是「前端设计风格资产」提取器。只允许从用户给出的候选信源（视频标题、视频简介、GitHub README、视频 CC 字幕）中提取信息。

硬性规则：
1. 禁止发明：风格名、配色值、适配项目、字体、组件规则，凡是信源里没有的，一律不要输出。
2. 禁止输出 Markdown、代码块、解释性文字。只输出一个 JSON 对象。
3. 配色只能给「色彩方向」，绝对不能出现 HEX、rgb()、hsl() 等具体色值：
   color_direction = { temperature: warm|cool|neutral, saturation: muted|balanced|vivid, contrast: low|medium|high, semantic_hint: 一句中文描述 }
4. project_tags 只能从这个枚举里选，不在枚举里的直接丢弃：${allowedTags.join(", ")}
5. suitable_projects / unsuitable_projects 只能从这些项目类型里选：${PROJECT_TYPES.join(", ")}
6. 如果 README 与简介里没有可提取的界面 / 视觉 / 设计信息，把 has_design_info 设为 false，其余字段可以留空。
7. extracted_effects 只提取信源里「明确提到」或「有明显画面特征」的技术方案：
   - 值得提取：核心布局模式（Grid、Flex、多列/瀑布流）、专门的动效库（GSAP、Framer Motion、Lottie）、特定实现技巧（CSS mask、Canvas 粒子、ScrollTrigger、clip-path、WebGL）。
   - 不要提取：通用基础 CSS（color、margin、padding、font-size、border-radius 这类）不算 effect；任何没被提到的库或技巧都不要猜。
   - 每个 effect 的 description 必须说清「怎么实现的」或「用在什么场景」，一句话以上的中文。
   - 如果信源完全没提技术方案，extracted_effects 返回空数组 []，不要硬编。

输出字段：
{
  "name": "风格名（必须来自信源里的项目名或主题词）",
  "summary": "一句话说清这是什么风格",
  "has_design_info": true,
  "frontend_prompt": "中文前端提示词，只写信源里真实存在的视觉规则",
  "project_tags": ["..."],
  "suitable_projects": ["dashboard"],
  "unsuitable_projects": ["game"],
  "color_direction": { "temperature": "cool", "saturation": "balanced", "contrast": "high", "semantic_hint": "冷色高对比，接近工业化控制台" },
  "typography": { "heading": "信源里出现的字体", "body": "…", "scale": "…" },
  "tokens": { "radius": "…", "border": "…", "shadow": "…", "spacing": "…" },
  "components": { "button": "…" },
  "performance_notes": "…",
  "extracted_effects": [
    { "name": "两列网格 + 绝对定位背景", "tech_stack": ["CSS Grid"], "description": "用 grid-cols-2 分栏，背景网格用绝对定位叠在内容下方", "code_snippet": "", "performance_notes": "" }
  ]
}`;
}

export function buildUserPrompt(input: LlmInput): string {
  return [
    `UP 主：${input.upstreamName || input.video.bvid}`,
    `视频标题：${input.video.title}`,
    `视频简介：${input.video.desc.slice(0, 1200) || "（空）"}`,
    `参考链接：${input.repoUrl || "（无 GitHub，本条来自字幕）"}`,
    `${input.sourceKind === "subtitle" ? "视频字幕（CC）原文" : "README 原文"}（可能被截断）：`,
    input.readme.slice(0, 12_000),
  ].join("\n");
}

const llmTypographySchema = z
  .object({
    heading: z.string().optional(),
    body: z.string().optional(),
    scale: z.string().optional(),
  })
  .partial();

const llmPayloadSchema = z
  .object({
    name: z.string().min(1).max(120),
    summary: z.string().default(""),
    has_design_info: z.boolean(),
    extracted_effects: z.array(z.unknown()).optional(),
    frontend_prompt: z.string().default(""),
    project_tags: z.array(z.string()).default([]),
    suitable_projects: z.array(z.string()).default([]),
    unsuitable_projects: z.array(z.string()).default([]),
    color_direction: colorDirectionSchema,
    typography: llmTypographySchema.optional(),
    tokens: z.record(z.string(), z.string()).optional(),
    components: z.record(z.string(), z.string()).optional(),
    performance_notes: z.string().optional(),
  })
  .strict();

export type LlmPayload = z.infer<typeof llmPayloadSchema>;

function parseJsonLoose(raw: string): unknown {
  const trimmed = raw.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // 模型偶尔会套 ```json```，这里只做一次容错，仍然走完整 zod 校验
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced) {
      try {
        return JSON.parse(fenced[1]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function mapEffects(raw: unknown): ExtractedEffect[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const name = typeof record.name === "string" ? record.name.trim() : "";
      const description = typeof record.description === "string" ? record.description.trim() : "";
      if (!name || !description) return null;
      return {
        name,
        description,
        tech_stack: Array.isArray(record.tech_stack)
          ? record.tech_stack.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
          : [],
        code_snippet: typeof record.code_snippet === "string" ? record.code_snippet : "",
        performance_notes: typeof record.performance_notes === "string" ? record.performance_notes : "",
      };
    })
    .filter((item): item is ExtractedEffect => item !== null);
}

/** 模型常把长句塞进枚举字段：按关键词收敛，避免整条被判非法 */
export function normalizeDirection(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const record = { ...(raw as Record<string, unknown>) };
  const direction = record.color_direction;
  if (direction && typeof direction === "object") {
    const d = direction as Record<string, unknown>;
    const pick = (value: unknown, pairs: [RegExp, string][], fallback: string) => {
      const text = typeof value === "string" ? value : "";
      for (const [pattern, result] of pairs) if (pattern.test(text)) return result;
      return fallback;
    };
    record.color_direction = {
      temperature: pick(d.temperature, [[/暖|warm/i, "warm"], [/冷|cool/i, "cool"]], "neutral"),
      saturation: pick(d.saturation, [[/高饱和|鲜艳|vivid/i, "vivid"], [/低饱和|灰|muted/i, "muted"]], "balanced"),
      contrast: pick(d.contrast, [[/高|high/i, "high"], [/低|low/i, "low"]], "medium"),
      semantic_hint: (typeof d.semantic_hint === "string" && d.semantic_hint.trim()) || String(d.temperature ?? "视觉方向").slice(0, 80),
    };
  }
  return record;
}

export function mapPayload(
  payload: LlmPayload,
  allowedTags: string[],
): { candidate: Record<string, unknown>; colorDirection: z.infer<typeof colorDirectionSchema> } | null {
  const tags = [...new Set(payload.project_tags.map((tag) => tag.trim()).filter((tag) => allowedTags.includes(tag)))];

  const suitable = [...new Set(payload.suitable_projects.filter((project) => projectTypeSchema.safeParse(project).success))];
  const unsuitable = [...new Set(payload.unsuitable_projects.filter((project) => projectTypeSchema.safeParse(project).success))].filter(
    (project) => !suitable.includes(project),
  );

  const candidate: Record<string, unknown> = {
    name: payload.name.trim(),
    project_tags: tags,
    suitable_projects: suitable,
    unsuitable_projects: unsuitable,
  };

  if (payload.frontend_prompt.trim()) candidate.frontend_prompt = payload.frontend_prompt.trim();
  if (payload.performance_notes?.trim()) candidate.performance_notes = payload.performance_notes.trim();

  if (payload.typography?.heading?.trim() && payload.typography.body?.trim() && payload.typography.scale?.trim()) {
    candidate.typography = {
      heading: payload.typography.heading.trim(),
      body: payload.typography.body.trim(),
      scale: payload.typography.scale.trim(),
    };
  }

  if (payload.tokens) {
    const { radius, border, shadow, spacing } = payload.tokens;
    if (radius?.trim() && border?.trim() && shadow?.trim() && spacing?.trim()) {
      candidate.tokens = {
        ...payload.tokens,
        radius: radius.trim(),
        border: border.trim(),
        shadow: shadow.trim(),
        spacing: spacing.trim(),
      };
    }
  }

  if (payload.components) {
    const components = Object.fromEntries(
      Object.entries(payload.components)
        .map(([key, value]) => [key.trim(), value.trim()])
        .filter(([key, value]) => key && value),
    );
    if (Object.keys(components).length > 0) candidate.components = components;
  }

  const validated = styleSchema.partial().safeParse(candidate);
  if (!validated.success) return null;

  return {
    candidate: validated.data as Record<string, unknown>,
    colorDirection: payload.color_direction,
  };
}

export type DeepseekOptions = {
  apiKey: string;
  allowedTags: string[];
  model?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  backoffMs?: number;
  usageLogFile?: string;
  /** 测试里可以把它关掉 */
  logUsage?: boolean;
};

export async function extractStyle(
  input: LlmInput,
  options: DeepseekOptions,
): Promise<LlmExtraction> {
  if (!options.apiKey) {
    return { ok: false, raw: "", error: "缺少 DEEPSEEK_API_KEY（.env.local）" };
  }

  const baseUrl = (
    options.baseUrl?.trim() ||
    process.env.DEEPSEEK_BASE_URL?.trim() ||
    DEFAULT_BASE_URL
  ).replace(/\/$/, "");
  const model = options.model ?? DEEPSEEK_MODEL;
  const system = buildSystemPrompt(options.allowedTags);
  const user = buildUserPrompt(input);

  let lastRaw = "";
  let lastError = "未知错误";

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const response = await fetchText(
      `${baseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 4000,
        }),
      },
      {
        fetchImpl: options.fetchImpl,
        timeoutMs: options.timeoutMs ?? LLM_TIMEOUT_MS,
        backoffMs: options.backoffMs,
      },
    );

    if (!response.ok) {
      lastError = response.error ?? `DeepSeek 返回 ${response.status}`;
      if (response.text) lastRaw = response.text.slice(0, 4000);
      if (attempt < 2) await sleep(400);
      continue;
    }

    let payloadJson: {
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
      choices?: { message?: { content?: string } }[];
    };
    try {
      payloadJson = JSON.parse(response.text);
    } catch {
      lastError = "DeepSeek 响应不是 JSON";
      lastRaw = response.text.slice(0, 4000);
      if (attempt < 2) await sleep(400);
      continue;
    }

    const content = payloadJson.choices?.[0]?.message?.content ?? "";
    lastRaw = content;

    if (options.logUsage !== false) {
      const usage = payloadJson.usage ?? {};
      appendUsageLog(
        {
          ts: new Date().toISOString(),
          model,
          upstream: input.upstreamName,
          video: input.video.bvid,
          attempt,
          prompt_tokens: usage.prompt_tokens ?? 0,
          completion_tokens: usage.completion_tokens ?? 0,
          total_tokens: usage.total_tokens ?? 0,
          ok: true,
        },
        options.usageLogFile,
      );
    }

    const parsed = parseJsonLoose(content);
    const validated = parsed === null ? null : llmPayloadSchema.safeParse(normalizeDirection(parsed));

    if (!validated || !validated.success) {
      lastError = validated
        ? `输出未通过 zod 校验：${validated.error.issues.map((i) => `${i.path.join(".")} ${i.message}`).slice(0, 2).join("；")}`
        : "模型输出不是合法 JSON（可能被 max_tokens 截断）";
      if (attempt < 2) await sleep(400);
      continue;
    }

    if (!validated.data.has_design_info) {
      return { ok: true, hasDesignInfo: false, raw: content };
    }

    const mapped = mapPayload(validated.data, options.allowedTags);
    if (!mapped) {
      lastError = "候选没通过 Style 校验";
      if (attempt < 2) await sleep(400);
      continue;
    }

    return {
      ok: true,
      hasDesignInfo: true,
      extractedEffects: mapEffects(validated.data.extracted_effects),
      candidate: mapped.candidate as Partial<Style>,
      colorDirection: mapped.colorDirection,
      reasoning: validated.data.summary ?? "",
      raw: content,
    };
  }

  return { ok: false, raw: lastRaw, error: `${lastError}（已重试 1 次）` };
}

/** 视觉兜底：把拼图当 data URI 发给视觉模型，返回 JSON（30s 超时） */
export async function analyzeImage(
  imagePath: string,
  options: { apiKey?: string; model?: string; baseUrl?: string } = {},
): Promise<unknown> {
  const apiKey = options.apiKey ?? getDeepSeekKey();
  const model = options.model ?? process.env.VISION_MODEL?.trim() ?? "deepseek-flash";
  const baseUrl = (options.baseUrl?.trim() || process.env.DEEPSEEK_BASE_URL?.trim() || DEFAULT_BASE_URL).replace(/\/$/, "");
  const base64 = (await import("node:fs")).readFileSync(imagePath).toString("base64");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "你是前端设计专家。请分析这张包含 3 个画面帧的图片，提取其视觉风格、颜色倾向、排版特征。" +
              "只输出 JSON：{name, summary, color_direction:{temperature,saturation,contrast,semantic_hint}, project_tags}。" +
              "color_direction 只能写语义描述，禁止任何 HEX 色值。",
          },
          {
            role: "user",
            content: [
              { type: "text", text: "分析这 3 帧拼图里的视觉语言。" },
              { type: "image_url", image_url: { url: `data:image/png;base64,${base64}` } },
            ],
          },
        ],
      }),
    });
    if (!response.ok) throw new Error(`视觉模型返回 ${response.status}`);
    const json = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    return JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
  } finally {
    clearTimeout(timer);
  }
}
