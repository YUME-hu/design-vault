import { getDraftStyles, getStyles } from "../data";
import { BRAND_KEYWORDS } from "../recommend";

/**
 * project_tags 的可选枚举：现有风格里出现过的标签 + 推荐用的品牌关键词。
 * 让「提取」和「推荐」共用同一套词表，避免推荐时永远匹配不上。
 */
export function collectAllowedTags(): string[] {
  const tags = new Set<string>(BRAND_KEYWORDS);
  try {
    for (const style of [...getStyles(), ...getDraftStyles()]) {
      for (const tag of style.project_tags) tags.add(tag);
    }
  } catch {
    // 数据文件读不出来时退回纯关键词表，不影响抓取
  }
  return [...tags].sort();
}
