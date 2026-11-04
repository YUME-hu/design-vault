import fs from "node:fs";
import os from "node:os";
import path, { join } from "node:path";
import { readFile } from "node:fs/promises";
import { z } from "zod";
import { formatHex, oklch, rgb } from "culori";
// \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
// src/shared/constants.ts
/** Package name; must equal package.json `name` (the client bundle id). */
const NAME = "design-vault-plugin";
// src/shared/schema.ts
var schema_exports = /* @__PURE__ */ __exportAll({});
import * as import__design_vault_core_schema from "@design-vault/core/schema";
__reExport(schema_exports, import__design_vault_core_schema);
/** Resolve the vault root: explicit argument, then env, then the local default. */
function vaultRoot(override) {
	return override ?? process.env.DESIGN_VAULT_ROOT ?? "D:\\design-vault";
}
/**
* Read `data/styles.json` from the vault.
*
* A single bad row must not hide the other fourteen, so the whole-array parse is
* tried first and rows are re-checked one by one when it fails.
*
* @param root - vault root; defaults to {@link vaultRoot}.
*/
async function readVaultStyles(root) {
	const file = join(vaultRoot(root), "data", "styles.json");
	const raw = await readFile(file, "utf8");
	const parsed = JSON.parse(raw);
	if (!Array.isArray(parsed)) throw new Error(`${file}: expected a JSON array of styles, got ${typeof parsed}`);
	const whole = schema_exports.stylesSchema.safeParse(parsed);
	if (whole.success) return {
		file,
		styles: whole.data,
		rejected: []
	};
	const styles = [];
	const rejected = [];
	parsed.forEach((row, index) => {
		const one = schema_exports.stylesSchema.element.safeParse(row);
		if (one.success) styles.push(one.data);
		else rejected.push({
			index,
			message: one.error.issues[0]?.message ?? "invalid style"
		});
	});
	return {
		file,
		styles,
		rejected
	};
}
/** Minimal text list: one line per style, stable stored order, no truncation. */
function renderStyleList(styles) {
	return [`${styles.length} style${styles.length === 1 ? "" : "s"}`, ...styles.map((style, index) => {
		return `${String(index + 1).padStart(2, " ")}. ${style.name} (${style.id}) primary=${style.palette.primary}`;
	})].join("\n");
}
// src/host/ping.ts
const PING_PATH = "/plugins/design-vault/ping";
/** M10b spike：验证宿主能否注册 HTTP 路由、客户端能否同源访问 */
function pingHandler(req, res) {
	const url = new URL(req.url ?? "/", "http://127.0.0.1");
	const count = Math.min(Math.max(Number(url.searchParams.get("n") ?? "0") || 0, 0), 500);
	const styles = readVaultStyles();
	const body = {
		ok: true,
		plugin: NAME,
		vault: vaultRoot(),
		styles: Array.isArray(styles) ? styles.length : 0,
		n: count,
		items: Array.from({ length: count }, (_, index) => ({
			index,
			bvid: `BVspike${String(index).padStart(4, "0")}`,
			title: `spike payload ${index}`
		})),
		at: (/* @__PURE__ */ new Date()).toISOString()
	};
	res.writeHead(200, {
		"Content-Type": "application/json; charset=utf-8",
		"Cache-Control": "no-store"
	});
	res.end(JSON.stringify(body));
}
/** 在宿主注册 ping 路由；返回 disposer（webServer 不可用时为 null） */
function registerPing(ctx) {
	if (!ctx.webServer) {
		ctx.logger?.warn?.(`[${NAME}] webServer unavailable, ping route skipped`);
		return null;
	}
	return ctx.webServer.register({
		kind: "exact",
		path: PING_PATH,
		handler: pingHandler
	});
}
const hexColorSchema = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "必须是 #RGB / #RRGGBB 形式的十六进制色值");
const slugSchema = z.string().min(2).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "id 必须是 kebab-case（小写字母/数字/连字符）");
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日期格式必须为 YYYY-MM-DD");
const projectTypeSchema = z.enum([
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
	"data-viz"
]);
const styleSourceSchema = z.object({
	/** extracted-draft：从官方设计文档/官方分发包里提取的草案，人工确认后才进正式库 */
	type: z.enum([
		"manual",
		"bilibili",
		"bilibili-search",
		"reference",
		"skill-library",
		"github",
		"ref",
		"extracted-draft"
	]),
	/** 空字符串表示没有来源链接；有值就必须是合法 URL（草案必须能溯源到官方文档） */
	url: z.union([z.literal(""), z.string().url()]).default(""),
	upstream: z.string().default(""),
	video: z.string().default("")
}).strict();
/** 一条记录可以挂多个信源（合并后的风格尤其需要） */
const styleSourcesSchema = z.array(styleSourceSchema).min(1);
/** 语义色槽：核心 5 色必填，其余语义色按风格需要追加。 */
const paletteSchema = z.object({
	primary: hexColorSchema,
	bg: hexColorSchema,
	surface: hexColorSchema,
	text: hexColorSchema,
	muted: hexColorSchema,
	info: hexColorSchema.optional(),
	warning: hexColorSchema.optional(),
	danger: hexColorSchema.optional(),
	success: hexColorSchema.optional()
}).catchall(hexColorSchema);
const typographySchema = z.object({
	heading: z.string().min(1),
	body: z.string().min(1),
	mono: z.string().min(1).optional(),
	scale: z.string().min(1)
}).strict();
/** 设计令牌：核心 4 项必填，其余键按风格自由追加。 */
const tokensSchema = z.object({
	radius: z.string().min(1),
	border: z.string().min(1),
	shadow: z.string().min(1),
	spacing: z.string().min(1)
}).catchall(z.string().min(1));
const styleSchema = z.object({
	id: slugSchema,
	name: z.string().min(1),
	/** 一条风格可以有多个信源（UP 主视频 / 官方文档 / 手动） */
	sources: styleSourcesSchema,
	original_prompt: z.string().default(""),
	prompt_type: z.enum([
		"image-generation",
		"frontend",
		"manual"
	]),
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
		"direction-mapped"
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
	updated_at: isoDateSchema
}).strict();
z.array(styleSchema);
const HEX_IN_TEXT = /#[0-9a-fA-F]{3,8}\b/;
/**
* 色彩方向：只允许语义描述，禁止 HEX。
* DeepSeek 的约束、pending 的校验、verify:m2a 的断言都用这一份。
*/
const colorDirectionSchema = z.object({
	temperature: z.enum([
		"warm",
		"cool",
		"neutral"
	]),
	saturation: z.enum([
		"muted",
		"balanced",
		"vivid"
	]),
	contrast: z.enum([
		"low",
		"medium",
		"high"
	]),
	semantic_hint: z.string().min(1).max(80)
}).strict().superRefine((value, ctx) => {
	if (HEX_IN_TEXT.test(value.semantic_hint)) ctx.addIssue({
		code: z.ZodIssueCode.custom,
		message: "色彩方向里不允许出现 HEX 色值",
		path: ["semantic_hint"]
	});
});
const pendingItemSchema = z.object({
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
	extracted_effects: z.array(z.object({
		name: z.string().min(1),
		tech_stack: z.array(z.string()).default([]),
		description: z.string().min(1),
		code_snippet: z.string().default(""),
		performance_notes: z.string().default("")
	}).strict()).default([]),
	/** AI 判定的产物类型；人工可在审核页用 as 覆盖 */
	item_type: z.enum([
		"style",
		"effect",
		"component"
	]).default("style"),
	component_candidate: z.object({
		name: z.string().min(1),
		category: z.enum([
			"navigation",
			"hero",
			"card",
			"form",
			"button",
			"table",
			"feedback",
			"overlay",
			"layout",
			"animation",
			"other"
		]).default("other"),
		description: z.string().default(""),
		framework: z.enum(["react", "html"]).default("react"),
		code: z.string().default(""),
		dependencies: z.array(z.string()).default([]),
		states: z.array(z.object({
			name: z.string(),
			description: z.string().default("")
		}).strict()).default([])
	}).strict().nullable().default(null),
	effect_candidate: z.object({
		name: z.string().min(1),
		tech_stack: z.array(z.string()).default([]),
		description: z.string().default(""),
		code_snippet: z.string().default("")
	}).strict().nullable().default(null),
	raw_response: z.string().default("")
}).strict();
z.array(pendingItemSchema);
z.object({
	upstream: z.string().default(""),
	video: z.string().default(""),
	repo: z.string().default("")
}).strict();
const effectSchema = z.object({
	id: slugSchema,
	name: z.string().min(1),
	tech_stack: z.array(z.string().min(1)).default([]),
	description: z.string().min(1),
	code_snippet: z.string().default(""),
	performance_notes: z.string().default(""),
	related_styles: z.array(z.string()).default([])
}).strict();
z.array(effectSchema);
const COMPONENT_CATEGORIES = [
	"navigation",
	"hero",
	"card",
	"form",
	"button",
	"table",
	"feedback",
	"overlay",
	"layout",
	"animation",
	"other"
];
const componentSchema = z.object({
	id: slugSchema,
	name: z.string().min(1),
	category: z.enum(COMPONENT_CATEGORIES),
	description: z.string().min(1),
	framework: z.enum(["react", "html"]).default("react"),
	/** 允许空串：已登记、待补代码 */
	code: z.string().default(""),
	dependencies: z.array(z.string()).default([]),
	states: z.array(z.object({
		name: z.string(),
		description: z.string().default("")
	}).strict()).default([]),
	related_styles: z.array(z.string()).default([]),
	related_effects: z.array(z.string()).default([]),
	sources: styleSourcesSchema,
	notes: z.string().default(""),
	confidence: z.number().min(0).max(1),
	created_at: isoDateSchema,
	updated_at: isoDateSchema
}).strict();
z.array(componentSchema);
const refTokensSchema = z.object({
	colors: z.array(z.object({
		hex: hexColorSchema,
		weight: z.number().min(0).max(1).default(0)
	})).default([]),
	fonts: z.array(z.string().min(1)).default([]),
	spacing: z.array(z.string().min(1)).default([]),
	border_radius: z.array(z.string().min(1)).default([]),
	shadows: z.array(z.string().min(1)).default([]),
	css_variables: z.record(z.string()).default({})
}).strict();
const refSchema = z.object({
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
		css_variables: {}
	}),
	ai_analysis: z.object({
		name: z.string().min(1),
		summary: z.string().default(""),
		color_direction: colorDirectionSchema,
		layout: z.string().default(""),
		components: z.array(z.string()).default([])
	}).strict().nullable().default(null),
	generated_code: z.string().default(""),
	capture_warning: z.string().default(""),
	extracted: z.object({
		dominant_colors: z.array(hexColorSchema),
		fonts: z.array(z.string().min(1))
	}).strict().optional(),
	my_tags: z.array(z.string().min(1)),
	/** 核心字段：没有「我为什么喜欢它」，参考库就退化成书签夹。 */
	why_i_like_it: z.string().trim().min(4, "why_i_like_it 不能为空：参考库必须写下「为什么喜欢」"),
	linked_style_id: z.string().nullable().default(null)
}).strict();
z.array(refSchema);
// ../../packages/core/src/color.ts
/**
* 颜色引擎：纯函数，不碰 DOM、不碰 fs。
*
* 色阶在 OKLCH 空间生成：固定感知亮度步长（ΔL = 0.08），色相不变，
* 彩度沿"以锚点为中心"的帐篷曲线衰减，超 sRGB 色域时二分降彩度而不是裁通道，
* 这样每一阶的 L 都能保住 —— 相邻阶的 ΔL 才真的均匀。
*
* 锚点规则：用户输入的那一阶必须精确等于输入值（按 RGB 比较），
* 其余阶围绕它等距展开。
*/
const SCALE_STEPS = [
	50,
	100,
	200,
	300,
	400,
	500,
	600,
	700,
	800,
	900
];
const HEX_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
/** 名义亮度曲线：oklch L 从 0.97（50）到 0.25（900），步长恒定 */
const NOMINAL_LIGHTEST = .97;
const DELTA_L = .08;
const L_MIN = .08;
const L_MAX = .995;
function isHexColor(value) {
	return HEX_PATTERN.test(value.trim());
}
/** 归一化成 #RRGGBB（大写）；非法输入返回 null */
function normalizeHex(value) {
	const trimmed = value.trim();
	if (!HEX_PATTERN.test(trimmed)) return null;
	let hex = trimmed.slice(1);
	if (hex.length === 3) hex = hex.split("").map((char) => char + char).join("");
	return `#${hex.toUpperCase()}`;
}
function hexToRgb(hex) {
	const normalized = normalizeHex(hex);
	if (!normalized) throw new Error(`不是合法 HEX：${hex}`);
	return {
		r: parseInt(normalized.slice(1, 3), 16),
		g: parseInt(normalized.slice(3, 5), 16),
		b: parseInt(normalized.slice(5, 7), 16)
	};
}
function channelToLinear(channel) {
	const value = channel / 255;
	return value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
}
/** WCAG 2.1 相对亮度 */
function relativeLuminance(hex) {
	const { r, g, b } = hexToRgb(hex);
	return .2126 * channelToLinear(r) + .7152 * channelToLinear(g) + .0722 * channelToLinear(b);
}
/** WCAG 2.1 对比度：1 ~ 21 */
function contrastRatio(foreground, background) {
	const a = relativeLuminance(foreground);
	const b = relativeLuminance(background);
	const lighter = Math.max(a, b);
	const darker = Math.min(a, b);
	return (lighter + .05) / (darker + .05);
}
function formatRatio(ratio) {
	return `${ratio.toFixed(2)}:1`;
}
function hexToOklch(hex) {
	const converted = oklch(hex);
	if (!converted) throw new Error(`无法转换为 OKLCH：${hex}`);
	return {
		l: converted.l,
		c: converted.c ?? 0,
		h: Number.isFinite(converted.h) ? converted.h : 0
	};
}
function inSrgbGamut(l, c, h) {
	const converted = rgb({
		mode: "oklch",
		l,
		c,
		h
	});
	if (!converted) return false;
	const { r, g, b } = converted;
	return Number.isFinite(r) && Number.isFinite(g) && Number.isFinite(b) && r >= -1e-4 && r <= 1.0001 && g >= -1e-4 && g <= 1.0001 && b >= -1e-4 && b <= 1.0001;
}
/** OKLCH → HEX：保 L 与 H，彩度超出 sRGB 时二分收敛到色域边界 */
function oklchToHex(color) {
	const l = Math.min(L_MAX, Math.max(L_MIN, color.l));
	const h = Number.isFinite(color.h) ? color.h : 0;
	let c = Math.max(0, color.c);
	if (!inSrgbGamut(l, c, h)) {
		let low = 0;
		let high = c;
		for (let index = 0; index < 24; index += 1) {
			const mid = (low + high) / 2;
			if (inSrgbGamut(l, mid, h)) low = mid;
			else high = mid;
		}
		c = low;
	}
	const converted = rgb({
		mode: "oklch",
		l,
		c,
		h
	});
	return (converted ? formatHex(converted) : "#000000").toUpperCase();
}
function nominalLightness(index) {
	return NOMINAL_LIGHTEST - index * DELTA_L;
}
/**
* 生成 50–900 色阶。
* - 锚点阶 = base 本身（按输入值原样输出，不过色彩空间）
* - 其余阶：L 以 ΔL 等距展开，彩度按距锚点的距离衰减
*/
function generateScale(input) {
	const base = normalizeHex(input);
	if (!base) throw new Error(`不是合法 HEX：${input}`);
	const { l: baseL, c: baseC, h: baseH } = hexToOklch(base);
	let anchorIndex = 0;
	let bestDistance = Number.POSITIVE_INFINITY;
	SCALE_STEPS.forEach((_, index) => {
		const distance = Math.abs(nominalLightness(index) - baseL);
		if (distance < bestDistance) {
			bestDistance = distance;
			anchorIndex = index;
		}
	});
	const entries = SCALE_STEPS.map((step, index) => {
		const distance = Math.abs(index - anchorIndex);
		if (index === anchorIndex) return {
			step,
			hex: base,
			l: Math.min(1, Math.max(0, baseL)),
			c: baseC,
			h: baseH,
			anchor: true
		};
		const l = Math.min(L_MAX, Math.max(L_MIN, baseL + (anchorIndex - index) * DELTA_L));
		const chromaFactor = Math.max(.12, 1 - distance * .12);
		const hex = oklchToHex({
			l,
			c: baseC * chromaFactor,
			h: baseH
		});
		const achieved = hexToOklch(hex);
		return {
			step,
			hex,
			l: Math.min(1, Math.max(0, achieved.l)),
			c: achieved.c,
			h: achieved.h,
			anchor: false
		};
	});
	return {
		base,
		anchorStep: SCALE_STEPS[anchorIndex],
		entries
	};
}
const CONTRAST_RULES = [
	{
		id: "text-bg",
		label: "正文 text / bg",
		fg: "text",
		bg: "bg",
		threshold: 4.5,
		kind: "body"
	},
	{
		id: "text-surface",
		label: "正文 text / surface",
		fg: "text",
		bg: "surface",
		threshold: 4.5,
		kind: "body"
	},
	{
		id: "primary-bg",
		label: "主色 primary / bg",
		fg: "primary",
		bg: "bg",
		threshold: 3,
		kind: "large"
	},
	{
		id: "primary-text",
		label: "主色 primary / text",
		fg: "primary",
		bg: "text",
		threshold: 3,
		kind: "large"
	}
];
function contrastChecks(palette) {
	const checks = [];
	for (const rule of CONTRAST_RULES) {
		const foreground = palette[rule.fg];
		const background = palette[rule.bg];
		if (!foreground || !background) continue;
		if (!isHexColor(foreground) || !isHexColor(background)) continue;
		const ratio = contrastRatio(foreground, background);
		checks.push({
			id: rule.id,
			label: rule.label,
			foreground,
			background,
			ratio,
			threshold: rule.threshold,
			kind: rule.kind,
			pass: ratio >= rule.threshold
		});
	}
	return checks;
}
/** 给一组 palette 生成全部色阶 */
function buildScales(palette) {
	const scales = {};
	for (const [key, value] of Object.entries(palette)) {
		if (!isHexColor(value)) continue;
		scales[key] = generateScale(value);
	}
	return scales;
}
z.object({
	projectType: projectTypeSchema,
	targetUser: z.enum([
		"consumer",
		"enterprise",
		"developer",
		"creator",
		"internal"
	]),
	keywords: z.array(z.enum([
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
		"clean"
	])).max(6).default([]),
	pageType: z.enum([
		"landing",
		"app",
		"article",
		"catalog",
		"form"
	]),
	colorMode: z.enum([
		"light",
		"dark",
		"any"
	])
}).strict();
new Set(COMPONENT_CATEGORIES);
// src/host/design-config.ts
/**
* Turn one vault style into a `DesignConfig`: the deterministic artefact a
* consuming project can be generated from.
*
* Every colour here comes out of the shared colour engine, never out of a model
* call, so the same style always produces the same config. Pure: no IO, no
* clock reads unless the caller passes one in.
*
* @module design-vault-plugin/host/design-config
*/
function toContrast(check) {
	return {
		id: check.id,
		label: check.label,
		foreground: check.foreground,
		background: check.background,
		ratio: Number(check.ratio.toFixed(2)),
		ratioLabel: formatRatio(check.ratio),
		threshold: check.threshold,
		kind: check.kind,
		pass: check.pass
	};
}
/** Build the config for a single style. Pure: same input, same output. */
function buildDesignConfig(style, options = {}) {
	return {
		schema: "design-vault/design-config@1",
		generatedAt: (options.now ?? /* @__PURE__ */ new Date()).toISOString(),
		source: {
			styleId: style.id,
			styleName: style.name,
			...options.file === void 0 ? {} : { file: options.file }
		},
		palette: style.palette,
		scales: buildScales(style.palette),
		contrast: contrastChecks(style.palette).map(toContrast)
	};
}
/** Serialise for writing to disk: stable 2-space JSON with a trailing newline. */
function renderDesignConfig(config) {
	return `${JSON.stringify(config, null, 2)}\n`;
}
// src/host/index.ts
/**
* Host half of design-vault-plugin.
*
* Keep this file free of browser APIs: it runs in the DSH Host process.
* Replace the example with the service, tool or route this plugin owns.
*
* @module design-vault-plugin/host
*/
/** Cordis plugin name; must equal the package name so the client bundle id matches. */
const name = NAME;
/** Host services this plugin reads. Declare them so the loader waits for them. */
const inject = [];
/**
* @param ctx - the Host Cordis context.
*/
function debug(line) {
	try {
		fs.appendFileSync(path.join(os.tmpdir(), "dsh-design-vault-host.log"), `${(/* @__PURE__ */ new Date()).toISOString()} ${line}\n`);
	} catch {}
}
function apply(ctx) {
	debug(`apply webServer=${Boolean(ctx.webServer)} inject=${typeof ctx.inject}`);
	ctx.effect(() => {
		ctx.logger?.info?.(`[${NAME}] host half loaded`);
	}, `${NAME}: host`);
	ctx.effect(() => {
		let dispose = null;
		let tries = 0;
		const timer = setInterval(() => {
			if (dispose) return;
			if (ctx.webServer) {
				debug("webServer ready, registering ping");
				try {
					dispose = registerPing(ctx);
					debug(`ping registered=${Boolean(dispose)}`);
					ctx.logger?.info?.(`[${NAME}] ping route registered`);
				} catch (error) {
					ctx.logger?.warn?.(`[${NAME}] ping route failed: ${error.message}`);
				}
				clearInterval(timer);
				return;
			}
			tries += 1;
			if (tries % 10 === 0) debug(`wait #${tries} webServer=${Boolean(ctx.webServer)}`);
			if (tries >= 60) clearInterval(timer);
		}, 1e3);
		return () => {
			clearInterval(timer);
			dispose?.();
		};
	}, `${NAME}: ping route`);
}
export { PING_PATH, apply, buildDesignConfig, inject, name, pingHandler, readVaultStyles, registerPing, renderDesignConfig, renderStyleList, vaultRoot };
