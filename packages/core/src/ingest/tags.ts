/**
 * 纯函数：品牌关键词 + 现有标签 → 去重排序后的可用标签集。
 * 不读文件、不碰 IO，方便插件/测试直接复用。
 */
export function mergeAllowedTags(
  brandTags: readonly string[],
  existingTags: Iterable<string>,
): string[] {
  const tags = new Set<string>(brandTags);
  for (const tag of existingTags) tags.add(tag);
  return [...tags].sort();
}
