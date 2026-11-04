import { z } from "zod";

/**
 * 全部入库数据的唯一真相源。
 * 任何写 data/*.json 的路径（M0 手动、M1 推荐、M2 采集）都必须先过这里的校验。
 */

// ---------- 基础原子 ----------

export const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const hexColorSchema = z
  .string()
  .regex(HEX_PATTERN, "必须是 #RGB / #RRGGBB 形式的十六进制色值");

export const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id 必须是 kebab-case（小写字母/数字/连字符）");

export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD");

// ---------- 项目类型 ----------

/**
 * 项目类型固定枚举：M1 的推荐打分与标签体系都以此为基准，
 * 新增类型会改变已有风格的适配语义，因此不允许随手扩展。
 */
export const PROJECT_TYPES = [
  "portfolio",
  "dashboard",
  "ecommerce",
  "editorial",
  "marketing",
  "blog",
  "docs",
  "saas-tool",
  "ai-product",
  "game",
  "children",
  "data-viz",
] as const;

export const projectTypeSchema = z.enum(PROJECT_TYPES);

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  portfolio: "作品集",
  dashboard: "数据看板",
  ecommerce: "电商",
  editorial: "内容 / 杂志",
  marketing: "营销落地页",
  blog: "博客",
  docs: "文档站",
  "saas-tool": "工具型应用",
  "ai-product": "AI 产品",
  game: "游戏 / 互动",
  children: "儿童 / 教育",
  "data-viz": "数据可视化",
};

// ---------- 风格库 ----------

export const styleSourceSchema = z
  .object({
    /** extracted-draft：从官方设计文档/官方分发包里提取的草案，人工确认后才进正式库 */
    type: z.enum(["manual", "bilibili", "bilibili-search", "reference", "skill-library", "github", "ref", "extracted-draft"]),
    /** 空字符串表示没有来源链接；有值就必须是合法 URL（草案必须能溯源到官方文档） */
    url: z.union([z.literal(""), z.string().url()]).default(""),
    upstream: z.string().default(""),
    video: z.string().default(""),
  })
  .strict();

/** 一条记录可以挂多个信源（合并后的风格尤其需要） */
export const styleSourcesSchema = z.array(styleSourceSchema).min(1);

/** 语义色槽：核心 5 色必填，其余语义色按风格需要追加。 */
export const paletteSchema = z
  .object({
    primary: hexColorSchema,
    bg: hexColorSchema,
    surface: hexColorSchema,
    text: hexColorSchema,
    muted: hexColorSchema,
    info: hexColorSchema.optional(),
    warning: hexColorSchema.optional(),
    danger: hexColorSchema.optional(),
    success: hexColorSchema.optional(),
  })
  .catchall(hexColorSchema);

export const typographySchema = z
  .object({
    heading: z.string().min(1),
    body: z.string().min(1),
    mono: z.string().min(1).optional(),
    scale: z.string().min(1),
  })
  .strict();

/** 设计令牌：核心 4 项必填，其余键按风格自由追加。 */
export const tokensSchema = z
  .object({
    radius: z.string().min(1),
    border: z.string().min(1),
    shadow: z.string().min(1),
    spacing: z.string().min(1),
  })
  .catchall(z.string().min(1));

export const styleSchema = z
  .object({
    id: slugSchema,
    name: z.string().min(1),
    /** 一条风格可以有多个信源（UP 主视频 / 官方文档 / 手动） */
    sources: styleSourcesSchema,
    original_prompt: z.string().default(""),
    prompt_type: z.enum(["image-generation", "frontend", "manual"]),
    frontend_prompt: z.string().min(1, "前端提示词不能为空：这是这个库最核心的可复制资产"),
    suitable_projects: z.array(projectTypeSchema),
    unsuitable_projects: z.array(projectTypeSchema),
    project_tags: z.array(z.string().min(1)),
    palette: paletteSchema,
    palette_source: z.enum([
      "manual",
      "radix",
      "tailwind",
      "bilibili-search",
      "official-docs",
      "direction-mapped",
    ]),
    identity_colors: z.array(hexColorSchema),
    typography: typographySchema,
    tokens: tokensSchema,
    components: z.record(z.string(), z.string().min(1)),
    performance_notes: z.string().default(""),
    /** 人工备注：例如草案里某个槽位是映射值、需要复核对比度 */
    notes: z.string().default(""),
    related_effects: z.array(z.string()).default([]),
    confidence: z.number().min(0).max(1),
    created_at: isoDateSchema,
    updated_at: isoDateSchema,
  })
  .strict();

export const stylesSchema = z.array(styleSchema);

// ---------- 待审核队列（M2）----------

const HEX_IN_TEXT = /#[0-9a-fA-F]{3,8}\b/;

/**
 * 色彩方向：只允许语义描述，禁止 HEX。
 * DeepSeek 的约束、pending 的校验、verify:m2a 的断言都用这一份。
 */
export const colorDirectionSchema = z
  .object({
    temperature: z.enum(["warm", "cool", "neutral"]),
    saturation: z.enum(["muted", "balanced", "vivid"]),
    contrast: z.enum(["low", "medium", "high"]),
    semantic_hint: z.string().min(1).max(80),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (HEX_IN_TEXT.test(value.semantic_hint)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "色彩方向里不允许出现 HEX 色值",
        path: ["semantic_hint"],
      });
    }
  });

export const pendingItemSchema = z
  .object({
    id: z.string().min(8),
    status: z.literal("pending"),
    created_at: isoDateSchema,
    confidence: z.number().min(0).max(1),
    /** 采集链路的原始来源（可能合并多条：同一个风格被多个视频提到） */
    sources: styleSourcesSchema,
    /** 中等相似时指向已存在的风格 id，审核页可一键合并信源 */
    duplicate_of: z.string().nullable().default(null),
    upstream_name: z.string().default(""),
    video_title: z.string().default(""),
    /** 命名与去重用的名字（LLM 风格名，取不到时退回视频标题） */
    name: z.string().min(1),
    candidate: styleSchema.partial().default({}),
    color_direction: colorDirectionSchema.nullable().default(null),
    reasoning: z.string().default(""),
    notes: z.string().default(""),
    /** 原始响应：LLM 原文；未调用模型时为空 */
    extracted_effects: z
      .array(
        z
          .object({
            name: z.string().min(1),
            tech_stack: z.array(z.string()).default([]),
            description: z.string().min(1),
            code_snippet: z.string().default(""),
            performance_notes: z.string().default(""),
          })
          .strict(),
      )
      .default([]),
    raw_response: z.string().default(""),
  })
  .strict();

export const pendingSchema = z.array(pendingItemSchema);

export type ColorDirection = z.infer<typeof colorDirectionSchema>;

// ---------- 效果库 ----------

export const effectSourceSchema = z
  .object({
    upstream: z.string().default(""),
    video: z.string().default(""),
    repo: z.string().default(""),
  })
  .strict();

export const effectSchema = z
  .object({
    id: slugSchema,
    name: z.string().min(1),
    tech_stack: z.array(z.string().min(1)).default([]),
    description: z.string().min(1),
    code_snippet: z.string().default(""),
    performance_notes: z.string().default(""),
    related_styles: z.array(z.string()).default([]),
  })
  .strict();

export const effectsSchema = z.array(effectSchema);

// ---------- 参考库 ----------

export const refTokensSchema = z
  .object({
    colors: z
      .array(z.object({ hex: hexColorSchema, weight: z.number().min(0).max(1).default(0) }))
      .default([]),
    fonts: z.array(z.string().min(1)).default([]),
    spacing: z.array(z.string().min(1)).default([]),
    border_radius: z.array(z.string().min(1)).default([]),
    shadows: z.array(z.string().min(1)).default([]),
    css_variables: z.record(z.string()).default({}),
  })
  .strict();

export const refSchema = z
  .object({
    id: slugSchema,
    url: z.string().url(),
    title: z.string().default(""),
    screenshot: z.string().min(1),
    design_tokens: refTokensSchema.default({
      colors: [],
      fonts: [],
      spacing: [],
      border_radius: [],
      shadows: [],
      css_variables: {},
    }),
    ai_analysis: z
      .object({
        name: z.string().min(1),
        summary: z.string().default(""),
        color_direction: colorDirectionSchema,
        layout: z.string().default(""),
        components: z.array(z.string()).default([]),
      })
      .strict()
      .nullable()
      .default(null),
    generated_code: z.string().default(""),
    capture_warning: z.string().default(""),
    extracted: z
      .object({
        dominant_colors: z.array(hexColorSchema),
        fonts: z.array(z.string().min(1)),
      })
      .strict()
      .optional(),
    my_tags: z.array(z.string().min(1)),
    /** 核心字段：没有「我为什么喜欢它」，参考库就退化成书签夹。 */
    why_i_like_it: z
      .string()
      .trim()
      .min(4, "why_i_like_it 不能为空：参考库必须写下「为什么喜欢」"),
    linked_style_id: z.string().nullable().default(null),
  })
  .strict();

export const refsSchema = z.array(refSchema);

// ---------- 派生类型 ----------

export type ProjectType = (typeof PROJECT_TYPES)[number];
export type StyleSource = z.infer<typeof styleSourceSchema>;
export type StylePalette = z.infer<typeof paletteSchema>;
export type StyleTokens = z.infer<typeof tokensSchema>;
export type Style = z.infer<typeof styleSchema>;
export type Effect = z.infer<typeof effectSchema>;
export type Ref = z.infer<typeof refSchema>;
export type PendingItem = z.infer<typeof pendingItemSchema>;

/** 主信源（列表/卡片只展示第一条） */
export function primarySource<T extends { sources: StyleSource[] }>(entity: T): StyleSource {
  return entity.sources[0];
}
