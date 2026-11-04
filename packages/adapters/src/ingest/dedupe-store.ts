import { collectCandidates, findSimilar, type SimilarityMatch } from "./dedupe";
import { readDraftFile, readStylesFile } from "../data";
import { readPending } from "./pending-store";

/** 把磁盘上的三个库拼成查重候选，供 pipeline / 搜索提取使用 */
export function loadSimilarityCandidates() {
  try {
    return collectCandidates({
      styles: readStylesFile(),
      drafts: readDraftFile(),
      pending: readPending(),
    });
  } catch {
    return [];
  }
}

export function checkDuplicate(name: string): SimilarityMatch | null {
  return findSimilar(name, loadSimilarityCandidates());
}
