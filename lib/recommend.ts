import { z } from "zod";
import {
  PROJECT_TYPES,
  PROJECT_TYPE_LABELS,
  projectTypeSchema,
  type ProjectType,
  type Style,
} from "./schema";
import type { StyleStage } from "./data";

/**
 * M1a 推荐引擎：纯规则、纯函数、可复现。
 * 不做 embedding、不调 LLM —— 相同输入 + 相同数据必需得到完全相同的排序。
 *
 * 打分 = 画像标签与风格标签的交集权重之和 + 项目类型适配加减分。
 * 排序 = 分数降序 → 标签分降序 → id 升序（兜底保证确定性）。
 */

export const TARGET_USERS = ["consumer", "enterprise", "developer", "creator", "internal"] as const;
export const PAGE_TYPES = ["landing", "app", "article", "catalog", "form"] as const;
export const COLOR_MODES = ["light", "dark", "any"] as const;
export const BRAND_KEYWORDS = [
  "minimal",
  "industrial",
  "editorial",
  "high-contrast",
  "systematic",
  "friendly",
  "data-dense",
  "bold-type",
  "rounded",
  "retro-futurism",
  "technical",
  "clean",
] as const;

export const TARGET_USER_LABELS: Record<(typeof TARGET_USERS)[number], string> = {
  consumer: "普通消费者",
  enterprise: "企业客户",
  developer: "开发者",
  creator: "创作者",
  internal: "内部团队",
};

export const PAGE_TYPE_LABELS: Record<(typeof PAGE_TYPES)[number], string> = {
  landing: "落地页",
  app: "应用界面",
  article: "长文 / 内容页",
  catalog: "列表 / 目录",
  form: "表单 / 流程",
};

export const COLOR_MODE_LABELS: Record<(typeof COLOR_MODES)[number], string> = {
  light: "浅色",
  dark: "深色",
  any: "不限",
};

export const BRAND_KEYWORD_LABELS: Record<(typeof BRAND_KEYWORDS)[number], string> = {
  minimal: "极简",
  industrial: "工业",
  editorial: "编辑感",
  "high-contrast": "高对比",
  systematic: "系统化",
  friendly: "友好",
  "data-dense": "数据密集",
  "bold-type": "大胆字型",
  rounded: "圆润",
  "retro-futurism": "复古未来",
  technical: "科技感",
  clean: "干净",
};

export const profileSchema = z
  .object({
    projectType: projectTypeSchema,
    targetUser: z.enum(TARGET_USERS),
    keywords: z.array(z.enum(BRAND_KEYWORDS)).max(6).default([]),
    pageType: z.enum(PAGE_TYPES),
    colorMode: z.enum(COLOR_MODES),
  })
  .strict();

export type Profile = z.infer<typeof profileSchema>;

// ---------- 画像 → 标签权重 ----------

const PROJECT_TAG_MAP: Record<ProjectType, string[]> = {
  portfolio: ["editorial", "minimal", "high-contrast", "bold-type"],
  dashboard: ["data-dense", "technical", "systematic", "monospace"],
  ecommerce: ["clean", "friendly", "trust", "rounded"],
  editorial: ["editorial", "bold-type", "high-contrast", "clean"],
  marketing: ["bold-type", "high-contrast", "clean", "trust"],
  blog: ["editorial", "clean", "neutral", "minimal"],
  docs: ["systematic", "technical", "neutral", "clean"],
  "saas-tool": ["systematic", "clean", "neutral", "trust"],
  "ai-product": ["technical", "data-dense", "monospace", "enterprise"],
  game: ["bold-type", "retro-futurism", "technical", "high-contrast"],
  children: ["friendly", "rounded", "clean", "editorial"],
  "data-viz": ["data-dense", "technical", "neutral", "high-contrast"],
};

const TARGET_TAG_MAP: Record<(typeof TARGET_USERS)[number], string[]> = {
  consumer: ["friendly", "rounded", "clean"],
  enterprise: ["enterprise", "systematic", "neutral"],
  developer: ["developer", "technical", "monospace", "data-dense"],
  creator: ["bold-type", "editorial", "retro-futurism"],
  internal: ["systematic", "data-dense", "enterprise", "clean"],
};

const PAGE_TAG_MAP: Record<(typeof PAGE_TYPES)[number], string[]> = {
  landing: ["bold-type", "high-contrast", "trust"],
  app: ["systematic", "data-dense", "clean"],
  article: ["editorial", "neutral", "clean"],
  catalog: ["data-dense", "neutral", "systematic"],
  form: ["clean", "trust", "systematic"],
};

export const TAG_WEIGHTS = {
  projectType: 3,
  keyword: 2,
  colorMode: 2,
  targetUser: 1,
  pageType: 1,
} as const;

/** 同一个标签可能被多个答案命中，取最高权重，不叠加。 */
export function buildProfileWeights(profile: Profile): Map<string, number> {
  const weights = new Map<string, number>();
  const add = (tags: string[], weight: number) => {
    for (const tag of tags) {
      weights.set(tag, Math.max(weights.get(tag) ?? 0, weight));
    }
  };

  add(PROJECT_TAG_MAP[profile.projectType], TAG_WEIGHTS.projectType);
  add(TARGET_TAG_MAP[profile.targetUser], TAG_WEIGHTS.targetUser);
  add(PAGE_TAG_MAP[profile.pageType], TAG_WEIGHTS.pageType);
  for (const keyword of profile.keywords) {
    add([keyword], TAG_WEIGHTS.keyword);
  }
  if (profile.colorMode !== "any") {
    add([profile.colorMode], TAG_WEIGHTS.colorMode);
  }

  return weights;
}

// ---------- 打分 ----------

const SUITABLE_BONUS = 3;
const UNSUITABLE_PENALTY = -6;

export type RankedResult = {
  style: Style;
  stage: StyleStage;
  score: number;
  tagScore: number;
  suitability: number;
  matchedTags: string[];
  reasons: string[];
};

export function scoreStyle(
  style: Style,
  profile: Profile,
  weights: Map<string, number>,
): Omit<RankedResult, "stage"> {
  const matchedTags = style.project_tags.filter((tag) => weights.has(tag));
  const tagScore = matchedTags.reduce((sum, tag) => sum + (weights.get(tag) ?? 0), 0);

  let suitability = 0;
  if (style.suitable_projects.includes(profile.projectType)) suitability += SUITABLE_BONUS;
  if (style.unsuitable_projects.includes(profile.projectType)) suitability += UNSUITABLE_PENALTY;

  const reasons: string[] = [];
  if (matchedTags.length > 0) {
    reasons.push(
      `命中 ${matchedTags.length} 个标签：${matchedTags
        .map((tag) => `${tag}(+${weights.get(tag) ?? 0})`)
        .join(" · ")}`,
    );
  } else {
    reasons.push("没有命中任何标签：仅靠项目适配度参与排序");
  }
  if (suitability > 0) {
    reasons.push(`项目适配：${PROJECT_TYPE_LABELS[profile.projectType]} +${SUITABLE_BONUS}`);
  } else if (suitability < 0) {
    reasons.push(`项目冲突：不适合 ${PROJECT_TYPE_LABELS[profile.projectType]} ${UNSUITABLE_PENALTY}`);
  }

  return {
    style,
    score: tagScore + suitability,
    tagScore,
    suitability,
    matchedTags,
    reasons,
  };
}

export function recommend(
  pool: { style: Style; stage: StyleStage }[],
  profile: Profile,
  limit = 5,
): RankedResult[] {
  const weights = buildProfileWeights(profile);

  return pool
    .map(({ style, stage }) => ({ ...scoreStyle(style, profile, weights), stage }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.tagScore - a.tagScore ||
        a.style.id.localeCompare(b.style.id),
    )
    .slice(0, limit);
}

// ---------- URL 参数 ↔ 画像 ----------

export function profileToQuery(profile: Profile): string {
  const params = new URLSearchParams({
    projectType: profile.projectType,
    targetUser: profile.targetUser,
    pageType: profile.pageType,
    colorMode: profile.colorMode,
  });
  if (profile.keywords.length > 0) params.set("keywords", profile.keywords.join(","));
  return params.toString();
}

export function parseProfileQuery(
  input: Record<string, string | string[] | undefined>,
): { ok: true; profile: Profile } | { ok: false; issues: string[] } {
  const first = (value: string | string[] | undefined): string | undefined =>
    Array.isArray(value) ? value[0] : value;

  const keywordsRaw = first(input.keywords) ?? "";

  const parsed = profileSchema.safeParse({
    projectType: first(input.projectType),
    targetUser: first(input.targetUser),
    pageType: first(input.pageType),
    colorMode: first(input.colorMode),
    keywords: keywordsRaw
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean),
  });

  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map(
        (issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`,
      ),
    };
  }
  return { ok: true, profile: parsed.data };
}

export { PROJECT_TYPES, PROJECT_TYPE_LABELS };
