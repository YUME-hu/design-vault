import { pendingItemSchema, type PendingItem } from "../schema";
import { parseGithubRepo } from "./github";
import { normalizeComponentCandidate, normalizeEffectCandidate } from "@design-vault/core/components";
import { makePendingId } from "./pending-store";
import {
  SessionExpiredError,
  type IngestDeps,
  type IngestError,
  type IngestProgress,
  type IngestResult,
  type IngestSummary,
  type PendingDraft,
  type Video,
} from "./types";

/**
 * 抓取链路（纯编排，不直接发请求）：
 *   视频简介 → GitHub 仓库 → README → DeepSeek → pending
 * 任何外部依赖都从 deps 注入，verify:m2a 用假实现跑完整链路。
 */

function dateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isSessionExpired(error: unknown): boolean {
  return (
    error instanceof SessionExpiredError ||
    (error as { code?: string } | null)?.code === "SESSION_EXPIRED"
  );
}

function buildPending(args: {
  upstreamUid: string;
  upstreamName: string;
  video: Video;
  confidence: number;
  notes: string;
  draft: Partial<PendingDraft>;
  duplicateOf?: string | null;
  itemType?: "style" | "effect" | "component";
  componentCandidate?: Record<string, unknown> | null;
  effectCandidate?: Record<string, unknown> | null;
  now: Date;
}): PendingItem {
  const { upstreamUid, upstreamName, video, confidence, notes, draft, duplicateOf, itemType, componentCandidate, effectCandidate, now } = args;

  const candidate = draft.candidate ?? {};
  const name =
    (typeof candidate.name === "string" && candidate.name.trim()) ||
    video.title.trim() ||
    video.bvid;

  return pendingItemSchema.parse({
    id: makePendingId(),
    status: "pending",
    created_at: dateString(now),
    confidence,
    sources: draft.sources ?? [
      { type: "bilibili", url: "", upstream: upstreamUid, video: video.bvid },
    ],
    upstream_name: upstreamName,
    video_title: video.title,
    name,
    candidate,
    color_direction: draft.color_direction ?? null,
    extracted_effects: draft.extracted_effects ?? [],
    duplicate_of: duplicateOf ?? null,
    item_type: itemType ?? "style",
    component_candidate: normalizeComponentCandidate(componentCandidate ?? null),
    effect_candidate: normalizeEffectCandidate(effectCandidate ?? null),
    reasoning: draft.reasoning ?? "",
    notes,
    raw_response: (draft.raw_response ?? "").slice(0, 12_000),
  });
}

export async function runIngest(deps: IngestDeps): Promise<IngestResult> {
  const startedAt = deps.now();
  const summary: IngestSummary = { added: 0, skipped: 0, failed: 0, failures: [], duplicates: [] };
  const perUpstream = deps.perUpstream ?? 5;
  const [minDelay, maxDelay] = deps.delayRange ?? [1000, 3000];
  const delay = () =>
    deps.sleep(minDelay + Math.floor(deps.random() * Math.max(0, maxDelay - minDelay)));

  let progress: IngestProgress = {
    status: "running",
    upstreamIndex: 0,
    upstreamTotal: deps.upstreams.length,
    currentUpstream: "",
    currentUpstreamName: "",
    videoIndex: 0,
    videoTotal: 0,
    currentVideo: "",
    added: 0,
    skipped: 0,
    failed: 0,
    message: "准备开始",
  };

  const emit = (patch: Partial<IngestProgress>) => {
    progress = {
      ...progress,
      ...patch,
      added: summary.added,
      skipped: summary.skipped,
      failed: summary.failed,
    };
    deps.onProgress?.(progress);
  };

  let error: IngestError | undefined;

  const commit = (item: PendingItem) => {
    const { added, skipped } = deps.store.append([item]);
    summary.added += added;
    summary.skipped += skipped;
  };

  try {
    for (let index = 0; index < deps.upstreams.length; index += 1) {
      const upstream = deps.upstreams[index];
      const uid = upstream.uid;

      try {
        if (index > 0) await delay();

        let upstreamName = upstream.name ?? uid;
        emit({
          upstreamIndex: index + 1,
          currentUpstream: uid,
          currentUpstreamName: upstreamName,
          videoIndex: 0,
          videoTotal: 0,
          message: `读取 UP 主 ${uid}`,
        });

        const fetchedName = await deps.bilibili.getUserName(uid);
        if (fetchedName) upstreamName = fetchedName;

        await delay();
        emit({
          upstreamIndex: index + 1,
          currentUpstream: uid,
          currentUpstreamName: upstreamName,
          message: `拉取 ${upstreamName} 最近 ${perUpstream} 个视频`,
        });

        const videos = await deps.bilibili.listVideos(uid, perUpstream);
        emit({
          upstreamIndex: index + 1,
          currentUpstream: uid,
          currentUpstreamName: upstreamName,
          videoTotal: videos.length,
          message: `共 ${videos.length} 个视频`,
        });

        for (let videoIndex = 0; videoIndex < videos.length; videoIndex += 1) {
          const video = videos[videoIndex];
          emit({
            upstreamIndex: index + 1,
            currentUpstream: uid,
            currentUpstreamName: upstreamName,
            videoIndex: videoIndex + 1,
            videoTotal: videos.length,
            currentVideo: video.bvid,
            message: `处理 ${video.bvid}`,
          });

          try {
            // 搜索接口的简介是截断的，补一次完整简介（失败就退回列表里的简介）
            let desc = video.desc;
            if (deps.bilibili.getVideoDesc) {
              await delay();
              try {
                const full = await deps.bilibili.getVideoDesc(video.bvid);
                if (full && full.length > desc.length) desc = full;
              } catch (detailError) {
                if (isSessionExpired(detailError)) throw detailError;
              }
            }
            const videoFull: Video = { ...video, desc };
            const repo = parseGithubRepo(desc);

            if (!repo) {
              // 没有 GitHub 时降级：先试 CC 字幕，抓到就交给模型，抓不到维持 0.3
              let subtitle: string | null = null;
              if (deps.bilibili.getSubtitle) {
                await delay();
                try {
                  subtitle = await deps.bilibili.getSubtitle(video.bvid);
                } catch (subtitleError) {
                  if (isSessionExpired(subtitleError)) throw subtitleError;
                }
              }

              if (subtitle) {
                const subtitleExtraction = await deps.llm.extract({
                  upstreamName,
                  video: videoFull,
                  readme: subtitle,
                  repoUrl: "",
                  sourceKind: "subtitle",
                });

                if (subtitleExtraction.ok && subtitleExtraction.hasDesignInfo) {
                  const subtitleDuplicate = deps.dedupe?.(
                    subtitleExtraction.candidate.name?.trim() || video.title.trim() || video.bvid,
                  );
                  if (subtitleDuplicate?.level === "high") {
                    summary.skipped += 1;
                    summary.duplicates.push({
                      name: subtitleExtraction.candidate.name ?? video.title,
                      matchId: subtitleDuplicate.match.id,
                      matchName: subtitleDuplicate.match.name,
                    });
                    continue;
                  }

                  commit(
                    buildPending({
                      upstreamUid: uid,
                      upstreamName,
                      video: videoFull,
                      confidence: 0.5,
                      itemType: subtitleExtraction.itemType,
                      componentCandidate: subtitleExtraction.componentCandidate,
                      effectCandidate: subtitleExtraction.effectCandidate,
                      notes: subtitleDuplicate
                        ? `来源：字幕提取 发现相似风格：${subtitleDuplicate.match.name}（可合并）`
                        : "来源：字幕提取",
                      duplicateOf:
                        subtitleDuplicate?.level === "medium" ? subtitleDuplicate.match.id : null,
                      draft: {
                        sources: [
                          { type: "bilibili", url: "", upstream: uid, video: video.bvid },
                        ],
                        candidate: subtitleExtraction.candidate,
                        color_direction: subtitleExtraction.colorDirection,
                        extracted_effects: subtitleExtraction.extractedEffects ?? [],
                        reasoning: subtitleExtraction.reasoning,
                        raw_response: subtitleExtraction.raw,
                      },
                      now: deps.now(),
                    }),
                  );
                  continue;
                }
              }

              commit(
                buildPending({
                  upstreamUid: uid,
                  upstreamName,
                  video: videoFull,
                  confidence: 0.3,
                  notes: "无 GitHub 链接",
                  draft: { candidate: { name: video.title.trim() || video.bvid } },
                  now: deps.now(),
                }),
              );
              continue;
            }

            const readme = await deps.github.fetchReadme(repo);
            if (!readme.ok) {
              commit(
                buildPending({
                  upstreamUid: uid,
                  upstreamName,
                  video: videoFull,
                  confidence: 0.3,
                  notes:
                    readme.reason === "404" ? "README 404" : `README 获取失败：${readme.message}`,
                  draft: {
                    sources: [{ type: "bilibili", url: repo.url, upstream: uid, video: video.bvid }],
                    candidate: { name: video.title.trim() || repo.repo },
                  },
                  now: deps.now(),
                }),
              );
              continue;
            }

            const extraction = await deps.llm.extract({
              upstreamName,
              video: videoFull,
              readme: readme.text,
              repoUrl: repo.url,
              sourceKind: "readme",
            });

            if (!extraction.ok) {
              commit(
                buildPending({
                  upstreamUid: uid,
                  upstreamName,
                  video: videoFull,
                  confidence: 0,
                  notes: `DeepSeek 输出未通过校验：${extraction.error}`,
                  draft: {
                    sources: [{ type: "bilibili", url: repo.url, upstream: uid, video: video.bvid }],
                    candidate: { name: video.title.trim() || repo.repo },
                    raw_response: extraction.raw,
                  },
                  now: deps.now(),
                }),
              );
              continue;
            }

            if (!extraction.hasDesignInfo) {
              commit(
                buildPending({
                  upstreamUid: uid,
                  upstreamName,
                  video: videoFull,
                  confidence: 0.3,
                  notes: "README 无设计信息",
                  draft: {
                    sources: [{ type: "bilibili", url: repo.url, upstream: uid, video: video.bvid }],
                    candidate: { name: video.title.trim() || repo.repo },
                    raw_response: extraction.raw,
                  },
                  now: deps.now(),
                }),
              );
              continue;
            }

            const readmeDuplicate = deps.dedupe?.(
              extraction.candidate.name?.trim() || video.title.trim() || video.bvid,
            );
            if (readmeDuplicate?.level === "high") {
              summary.skipped += 1;
              summary.duplicates.push({
                name: extraction.candidate.name ?? video.title,
                matchId: readmeDuplicate.match.id,
                matchName: readmeDuplicate.match.name,
              });
              continue;
            }

            commit(
              buildPending({
                upstreamUid: uid,
                upstreamName,
                video: videoFull,
                confidence: 0.6,
                itemType: extraction.itemType,
                componentCandidate: extraction.componentCandidate,
                effectCandidate: extraction.effectCandidate,
                notes: readmeDuplicate
                  ? `发现相似风格：${readmeDuplicate.match.name}（可合并）`
                  : "",
                duplicateOf: readmeDuplicate?.level === "medium" ? readmeDuplicate.match.id : null,
                draft: {
                  sources: [{ type: "bilibili", url: repo.url, upstream: uid, video: video.bvid }],
                  candidate: extraction.candidate,
                  color_direction: extraction.colorDirection,
                  extracted_effects: extraction.extractedEffects ?? [],
                  reasoning: extraction.reasoning,
                  raw_response: extraction.raw,
                },
                now: deps.now(),
              }),
            );
          } catch (videoError) {
            summary.failed += 1;
            summary.failures.push({
              upstream: uid,
              video: video.bvid,
              title: video.title,
              stage: "video",
              reason: (videoError as Error).message,
            });
          }
        }
      } catch (upstreamError) {
        if (isSessionExpired(upstreamError)) throw upstreamError;
        // 单个 UP 主失败（例如 B 站 412 风控）不中断整轮
        summary.failed += 1;
        summary.failures.push({
          upstream: uid,
          video: "",
          title: upstream.name ?? uid,
          stage: "bilibili",
          reason: (upstreamError as Error).message,
        });
        emit({ message: `UP ${uid} 失败：${(upstreamError as Error).message}` });
        continue;
      }
    }

    emit({ status: "done", message: "抓取完成" });
  } catch (caught) {
    if (isSessionExpired(caught)) {
      error = {
        code: "SESSION_EXPIRED",
        message: (caught as Error).message || "SESSDATA 已过期",
      };
    } else {
      error = { code: "UNKNOWN", message: (caught as Error).message };
    }
    emit({ status: "failed", message: error.message });
  }

  return {
    summary,
    error,
    startedAt: startedAt.toISOString(),
    finishedAt: deps.now().toISOString(),
  };
}
