import { getDraftStyles, getStyles } from "../data";
import { BRAND_KEYWORDS } from "../recommend";
import { mergeAllowedTags } from "../../../core/src/ingest/tags";

/**
 * project_tags 的可选枚举：现有风格里出现过的标签 + 推荐用的品牌关键词。
 * 读文件的部分留在这里，纯合并逻辑在 @design-vault/core。
 */
export function collectAllowedTags(): string[] {
  try {
    const existing = [...getStyles(), ...getDraftStyles()].flatMap((style) => style.project_tags);
    return mergeAllowedTags(BRAND_KEYWORDS, existing);
  } catch {
    // 数据文件读不出来时退回纯关键词表，不影响抓取
    return mergeAllowedTags(BRAND_KEYWORDS, []);
  }
}
