import type { Style, PendingItem } from "../schema";

/**
 * 跨源同名查重：纯字符串算法（归一化 + 包含关系 + bigram Dice）。
 * 不调模型：同样的名字永远得到同样的分数，方便测试与解释。
 */

export type SimilarityLevel = "high" | "medium" | "none";

export type SimilarCandidate = {
  id: string;
  name: string;
  kind: "style" | "draft" | "pending";
};

export type SimilarityMatch = SimilarCandidate & {
  level: Exclude<SimilarityLevel, "none">;
  score: number;
};

export const HIGH_THRESHOLD = 0.85;
export const MEDIUM_THRESHOLD = 0.6;

export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[\s\-_·:：,，。.!！?？'"“”‘’()（）[\]【】]/g, "")
    .trim();
}

function bigrams(value: string): string[] {
  const chars = [...value];
  if (chars.length < 2) return chars;
  const pairs: string[] = [];
  for (let index = 0; index < chars.length - 1; index += 1) {
    pairs.push(chars[index] + chars[index + 1]);
  }
  return pairs;
}

export function similarity(a: string, b: string): number {
  const left = normalizeName(a);
  const right = normalizeName(b);
  if (!left || !right) return 0;
  if (left === right) return 1;

  if (left.includes(right) || right.includes(left)) {
    const shorter = Math.min(left.length, right.length);
    const longer = Math.max(left.length, right.length);
    // 包含关系算「很像」，但长度差太多要打折，避免 "ui" 命中一切
    return shorter >= 3 ? 0.82 + 0.15 * (shorter / longer) : 0.5 * (shorter / longer);
  }

  const leftPairs = bigrams(left);
  const rightPairs = bigrams(right);
  if (leftPairs.length === 0 || rightPairs.length === 0) return 0;

  const pool = [...rightPairs];
  let overlap = 0;
  for (const pair of leftPairs) {
    const index = pool.indexOf(pair);
    if (index >= 0) {
      overlap += 1;
      pool.splice(index, 1);
    }
  }
  return (2 * overlap) / (leftPairs.length + rightPairs.length);
}

export function classify(score: number): SimilarityLevel {
  if (score >= HIGH_THRESHOLD) return "high";
  if (score >= MEDIUM_THRESHOLD) return "medium";
  return "none";
}

export function collectCandidates(input: {
  styles: Style[];
  drafts: Style[];
  pending: PendingItem[];
}): SimilarCandidate[] {
  return [
    ...input.styles.map((style) => ({ id: style.id, name: style.name, kind: "style" as const })),
    ...input.drafts.map((style) => ({ id: style.id, name: style.name, kind: "draft" as const })),
    ...input.pending.map((item) => ({ id: item.id, name: item.name, kind: "pending" as const })),
  ];
}

export function findSimilar(name: string, candidates: SimilarCandidate[]): SimilarityMatch | null {
  let best: SimilarityMatch | null = null;

  for (const candidate of candidates) {
    const score = similarity(name, candidate.name);
    const level = classify(score);
    if (level === "none") continue;
    if (!best || score > best.score) {
      best = { ...candidate, level, score };
    }
  }

  return best;
}
