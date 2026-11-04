/**
 * Grouping for the curated palette picker.
 *
 * The vault stores a machine key per preset (`nagai`, `brand`, …); this module
 * owns the display order and the Chinese labels, and collects anything unknown
 * into a trailing group so a new category never disappears from the picker.
 *
 * @module design-vault-plugin/client/palette-categories
 */

import type { PalettePreset } from "../shared/palettes.generated.ts";

/** Display order of the known groups. */
export const CATEGORY_ORDER = [
  "washed",
  "nagai",
  "pop",
  "jewel",
  "brand",
  "classic",
  "modern",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  washed: "长期洗涤",
  nagai: "永井博 · City Pop",
  pop: "波普插画",
  jewel: "珠宝情绪",
  brand: "品牌标准色",
  classic: "经典范式",
  modern: "当代科技",
};

/** Label used for presets whose category is empty or unknown. */
export const UNCATEGORISED_LABEL = "未分类";

export type PaletteGroup = {
  category: string;
  label: string;
  items: PalettePreset[];
};

/**
 * Bucket presets into ordered groups, dropping empty ones.
 *
 * @param presets - the generated snapshot, in vault order.
 */
export function groupPalettes(presets: PalettePreset[]): PaletteGroup[] {
  const buckets = new Map<string, PalettePreset[]>();
  for (const preset of presets) {
    const key = preset.category === "" ? "uncategorised" : preset.category;
    const bucket = buckets.get(key) ?? [];
    bucket.push(preset);
    buckets.set(key, bucket);
  }

  const known = new Set<string>(CATEGORY_ORDER);
  const groups: PaletteGroup[] = [];

  for (const category of CATEGORY_ORDER) {
    const items = buckets.get(category);
    if (items && items.length > 0) {
      groups.push({ category, label: CATEGORY_LABELS[category] ?? category, items });
    }
  }

  // Anything the table does not know yet still shows up, at the end.
  for (const [category, items] of buckets) {
    if (known.has(category)) continue;
    const label =
      category === "uncategorised" ? UNCATEGORISED_LABEL : (CATEGORY_LABELS[category] ?? category);
    groups.push({ category, label, items });
  }

  return groups;
}
