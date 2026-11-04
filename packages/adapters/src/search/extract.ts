import { pendingItemSchema, type PendingItem } from "../schema";
import { parseGithubRepo } from "../ingest/github";
import { makePendingId } from "../ingest/pending-store";
import { normalizeComponentCandidate, normalizeEffectCandidate } from "@design-vault/core/components";
import type { ExtractDeps, ExtractOutcome, SearchVideo } from "./types";

/**
 * 单视频提取（/search 的「提取此视频」）：
 * 完整简介 → GitHub → README → DeepSeek；没有 GitHub 就降级字幕。
 * 两个都拿不到就明确返回「无有效文本信息」，不写 pending。
 */

function dateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function buildPending(
  video: SearchVideo,
  input: {
    confidence: number;
    notes: string;
    url: string;
    candidate: Record<string, unknown>;
    colorDirection: PendingItem["color_direction"];
    reasoning: string;
    raw: string;
    duplicateOf: string | null;
    extractedEffects?: PendingItem["extracted_effects"];
    itemType?: "style" | "effect" | "component";
    componentCandidate?: Record<string, unknown> | null;
    effectCandidate?: Record<string, unknown> | null;
    now: Date;
  },
): PendingItem {
  const candidate = input.candidate;
  const name =
    (typeof candidate.name === "string" && candidate.name.trim()) || video.title.trim() || video.bvid;

  return pendingItemSchema.parse({
    id: makePendingId(),
    status: "pending",
    created_at: dateString(input.now),
    confidence: input.confidence,
    sources: [
      {
        type: "bilibili-search",
        url: input.url,
        upstream: video.author ? `${video.author} (${video.mid})` : String(video.mid),
        video: video.bvid,
      },
    ],
    upstream_name: video.author,
    video_title: video.title,
    name,
    candidate,
    color_direction: input.colorDirection,
    duplicate_of: input.duplicateOf,
    extracted_effects: input.extractedEffects ?? [],
    item_type: input.itemType ?? "style",
    component_candidate: normalizeComponentCandidate(input.componentCandidate ?? null),
    effect_candidate: normalizeEffectCandidate(input.effectCandidate ?? null),
    reasoning: input.reasoning,
    notes: input.notes,
    raw_response: (input.raw ?? "").slice(0, 12_000),
  });
}

export async function extractVideo(
  deps: ExtractDeps,
  video: SearchVideo,
): Promise<ExtractOutcome> {
  // 必须走 /view 拿完整简介：搜索结果里的 desc 是截断的
  deps.onStep?.("desc", "正在读完整简介…");
  let desc = "";
  let descError = "";
  try {
    desc = (await deps.getDesc(video.bvid)) ?? "";
  } catch (error) {
    descError = (error as Error).message;
  }
  if (!desc && !descError) descError = "完整简介为空";

  deps.onStep?.("github", `正在找 GitHub 链接…（简介 ${desc.length} 字）`);
  const repo = parseGithubRepo(desc);

  let text = "";
  let source: "readme" | "subtitle" = "readme";
  let url = "";
  let readmeError = "";

  if (repo) {
    deps.onStep?.("readme", "正在读 README…");
    const readme = await deps.fetchReadme(repo);
    if (readme.ok && readme.text.trim().length > 0) {
      text = readme.text;
      url = repo.url;
    } else {
      readmeError = readme.ok ? "README 为空" : `README ${readme.reason ?? "获取失败"}`;
    }
  }

  if (!text) {
    deps.onStep?.("subtitle", "没有可用 README，正在找 CC 字幕…");
    try {
      const subtitle = await deps.getSubtitle(video.bvid);
      if (subtitle && subtitle.trim().length > 40) {
        text = subtitle;
        source = "subtitle";
      }
    } catch {
      // 字幕失败就直接判定无有效文本
    }
  }

  if (!text && deps.vision) {
    deps.onStep?.("vision", "文本不可用，尝试视觉截帧…");
    const visual = await deps.vision(video);
    if (visual.ok) {
      const name = visual.visual.name;
      const duplicate = deps.findDuplicate(name);
      if (duplicate?.level === "high") {
        return { ok: true, kind: "duplicate", name, matchId: duplicate.match.id, matchName: duplicate.match.name };
      }
      const item = buildPending(video, {
        confidence: 0.7,
        notes: `来源：视觉截帧提取 ${visual.montage}`,
        url: "",
        candidate: {
          name: visual.visual.name,
          frontend_prompt: visual.visual.summary,
          project_tags: visual.visual.project_tags,
        },
        colorDirection: visual.visual.color_direction,
        reasoning: "视觉模型分析拼图得出",
        raw: JSON.stringify(visual.visual),
        duplicateOf: duplicate?.level === "medium" ? duplicate.match.id : null,
        now: deps.now(),
      });
      deps.appendPending([item]);
      deps.onStep?.("done", `已写入 pending：${item.name}`);
      return { ok: true, kind: "pending", pendingId: item.id, name: item.name, confidence: 0.7, duplicateOf: item.duplicate_of, source: "readme" };
    }
    deps.onStep?.("error", visual.error);
    return { ok: false, error: visual.error };
  }

  if (!text) {
    const reason = repo
      ? `找到 GitHub 链接（${repo.url}）但 ${readmeError}，且无 CC 字幕`
      : `完整简介无 GitHub，且无 CC 字幕${descError ? `（简介读取：${descError}）` : ""}`;
    deps.onStep?.("error", reason);
    return { ok: false, error: reason };
  }

  deps.onStep?.("analyze", "正在分析文本…");
  const extraction = await deps.llm.extract({
    upstreamName: video.author,
    video: {
      bvid: video.bvid,
      title: video.title,
      desc,
      pubdate: video.pubdate,
    },
    readme: text,
    repoUrl: url,
    sourceKind: source,
  });

  if (!extraction.ok || !extraction.hasDesignInfo) {
    // 文本已经抓到了，只是模型判定没有设计信息：写一条 0.3 的低置信候选，仍可在审核页处理
    const note = extraction.ok
      ? "模型判定文本中没有可提取的设计信息"
      : `模型输出不合法：${extraction.error}`;
    const item = buildPending(video, {
      confidence: 0.3,
      notes: note,
      url,
      candidate: { name: video.title.trim() || video.bvid },
      colorDirection: null,
      reasoning: "",
      raw: extraction.ok ? extraction.raw : extraction.raw,
      duplicateOf: null,
      now: deps.now(),
    });
    deps.appendPending([item]);
    deps.onStep?.("done", `已写入低置信 pending：${item.name}`);
    return { ok: true, kind: "pending", pendingId: item.id, name: item.name, confidence: 0.3, duplicateOf: null, source };
  }

  const name = extraction.candidate.name?.trim() || video.title.trim() || video.bvid;
  deps.onStep?.("dedupe", "正在查重…");
  const duplicate = deps.findDuplicate(name);

  if (duplicate?.level === "high") {
    deps.onStep?.("done", `发现相似风格：${duplicate.match.name}`);
    return {
      ok: true,
      kind: "duplicate",
      name,
      matchId: duplicate.match.id,
      matchName: duplicate.match.name,
    };
  }

  const notes = [
    source === "subtitle" ? "来源：字幕提取" : "",
    duplicate ? `发现相似风格：${duplicate.match.name}（可合并）` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const item = buildPending(video, {
    confidence: source === "subtitle" ? 0.5 : 0.6,
    notes,
    url,
    candidate: extraction.candidate as Record<string, unknown>,
    colorDirection: extraction.colorDirection,
    reasoning: extraction.reasoning,
    raw: extraction.raw,
    duplicateOf: duplicate?.level === "medium" ? duplicate.match.id : null,
    extractedEffects: extraction.extractedEffects ?? [],
    now: deps.now(),
  });

  const { added } = deps.appendPending([item]);
  if (added === 0) {
    deps.onStep?.("done", "该视频已经提取过，跳过");
    return { ok: false, error: "这条视频已经提取过（同名 pending 已存在）" };
  }

  deps.onStep?.("done", `已写入 pending：${item.name}`);

  return {
    ok: true,
    kind: "pending",
    pendingId: item.id,
    name: item.name,
    confidence: item.confidence,
    duplicateOf: item.duplicate_of,
    source,
  };
}
