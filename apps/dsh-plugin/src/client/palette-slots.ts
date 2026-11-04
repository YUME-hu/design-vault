/**
 * Turn an unordered HEX list into the five surfaces the canvas paints.
 *
 * A curated palette carries no roles, so placement has to be deterministic —
 * and it has to survive palettes that were never meant to be UIs: pastel-only
 * sets with no dark colour, or dark sets whose brightest colour is a neon accent.
 *
 * The rules, in order:
 *
 *   1. paper is the lightest colour — unless the lightest is a vivid colour and
 *      something much darker exists, which means the palette is a dark one;
 *   2. accent is the most chromatic colour that is not the paper;
 *   3. ink is whatever contrasts most with the paper, pushed darker (or lighter)
 *      until it clears 4.5:1 — a pastel palette gets a synthesized title colour;
 *   4. content is the next best contrast, nudged toward the paper and re-checked,
 *      so body text never lands on the midpoint grey that fails AA;
 *   5. surface is a neutral step off the paper, derived when the palette has none.
 *
 * @module design-vault-plugin/client/palette-slots
 */

import {
  contrastRatio,
  hexToOklch,
  normalizeHex,
  oklchToHex,
  type OklchColor,
} from "../shared/color.ts";
import type { BankPalette } from "../shared/visual-bank.ts";
import { deriveAccent, type PreviewPalette } from "./preview.ts";

/**
 * Use a vendored visual-bank archetype as-is.
 *
 * These arrive with explicit roles (`text_primary` → title, `text_secondary` →
 * content), so nothing is inferred; only the accent follows the seed.
 *
 * @param entry - one `BANK_PALETTES` row.
 * @param seed - rotates the accent.
 */
export function bankPalette(entry: BankPalette, seed: string): PreviewPalette {
  const accent = deriveAccent(entry.accent, seed);
  return {
    background: entry.background,
    card: entry.surface,
    content: entry.content,
    title: entry.title,
    accent: accent.hex,
    hueShift: accent.hueShift,
  };
}

type Ranked = { hex: string; oklch: OklchColor };

/** Below this chroma a colour reads as neutral and may become a surface. */
const NEUTRAL_CHROMA = 0.06;
/** Lightness gap below which a surface would read as the paper. */
const CARD_SEPARATION = 0.04;
/** AA for body text. */
const MIN_CONTRAST = 4.5;
/** A paper above this chroma is assumed to be a vivid colour, not paper. */
const VIVID_PAPER_CHROMA = 0.12;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

const isNeutral = (color: OklchColor): boolean => color.c < NEUTRAL_CHROMA;

/**
 * Move a colour away from the paper until it clears `target` contrast.
 *
 * Walks in 40 steps toward the far end of the lightness axis, shedding chroma as
 * it goes, so a synthesized ink still carries the palette's hue.
 */
function pushForContrast(seed: string, paper: string, target: number): string {
  const seedColor = hexToOklch(seed);
  const paperL = hexToOklch(paper).l;
  const goLighter = paperL < 0.5;
  const end = goLighter ? 0.98 : 0.05;
  let candidate = seed;

  for (let step = 1; step <= 40; step += 1) {
    const ratio = step / 40;
    const lightness = seedColor.l + (end - seedColor.l) * ratio;
    candidate = oklchToHex({
      l: clamp(lightness, 0.03, 0.99),
      c: seedColor.c * (1 - ratio * 0.6),
      h: seedColor.h,
    });
    if (contrastRatio(candidate, paper) >= target) return candidate;
  }
  return candidate;
}

/** A surface that is one step off the paper in the direction the theme allows. */
function deriveSurface(paper: OklchColor, dark: boolean): OklchColor {
  return {
    l: clamp(paper.l + (dark ? 0.06 : -0.045), 0.02, 0.98),
    c: paper.c * 0.8,
    h: paper.h,
  };
}

/**
 * Map a raw colour list onto the five surfaces.
 *
 * @param colors - HEX strings; invalid entries are dropped.
 * @param seed - rotates the accent, exactly like a style palette.
 * @returns the palette, or `null` when no colour survived validation.
 */
export function slotsFromColors(colors: string[], seed: string): PreviewPalette | null {
  const ranked: Ranked[] = colors
    .map((hex) => normalizeHex(hex))
    .filter((hex): hex is string => hex !== null)
    .map((hex) => ({ hex, oklch: hexToOklch(hex) }))
    .sort((a, b) => a.oklch.l - b.oklch.l);

  if (ranked.length === 0) return null;

  const darkest = ranked[0];
  const lightest = ranked[ranked.length - 1];

  // A dark palette's brightest colour is an accent, not paper.
  const dark = lightest.oklch.c > VIVID_PAPER_CHROMA && darkest.oklch.l < 0.35;
  const paperEntry = dark ? darkest : lightest;
  const paper = paperEntry.hex;
  const paperColor = paperEntry.oklch;

  if (ranked.length === 1) {
    const ink = pushForContrast(paper, paper, MIN_CONTRAST);
    const accentOnly = deriveAccent(paper, seed);
    return {
      background: paper,
      card: oklchToHex(deriveSurface(paperColor, dark)),
      content: ink,
      title: ink,
      accent: accentOnly.hex,
      hueShift: accentOnly.hueShift,
    };
  }

  const others = ranked.filter((item) => item.hex !== paper);

  // 2. accent: the most chromatic colour that is not the paper.
  const chromatic = others.reduce((best, item) => (item.oklch.c > best.oklch.c ? item : best));
  const accent = deriveAccent(chromatic.hex, seed);

  // 3. ink: best contrast, synthesized when the palette has no dark enough tone.
  const inkSeed = others.reduce((best, item) =>
    contrastRatio(item.hex, paper) > contrastRatio(best.hex, paper) ? item : best,
  ).hex;
  const title =
    contrastRatio(inkSeed, paper) >= MIN_CONTRAST
      ? inkSeed
      : pushForContrast(inkSeed, paper, MIN_CONTRAST);

  // 4. content: second-best contrast, re-checked so it never sits at midpoint.
  const contentPool = others.filter((item) => item.hex !== title);
  const contentSeed =
    contentPool.length > 0
      ? contentPool.reduce((best, item) =>
          contrastRatio(item.hex, paper) > contrastRatio(best.hex, paper) ? item : best,
        ).hex
      : title;
  const direct = contrastRatio(contentSeed, paper) >= MIN_CONTRAST ? contentSeed : title;

  // When nothing else qualifies, body would equal the title; soften the title a
  // step toward the paper so the hierarchy still reads, as long as AA holds.
  const titleColor = hexToOklch(title);
  const towardPaper = paperColor.l < 0.5 ? -0.07 : 0.07;
  const softened = oklchToHex({
    l: clamp(titleColor.l + towardPaper, 0.03, 0.99),
    c: titleColor.c,
    h: titleColor.h,
  });
  const content =
    direct === title && contrastRatio(softened, paper) >= MIN_CONTRAST ? softened : direct;

  // 5. surface: a neutral step off the paper, derived when the palette has none.
  const surfaceTarget = deriveSurface(paperColor, dark);
  const surfaceCandidates = others.filter(
    (item) =>
      isNeutral(item.oklch) &&
      Math.abs(item.oklch.l - paperColor.l) >= CARD_SEPARATION &&
      // The candidate has to sit near the target, not merely be the closest one:
      // a near-black neutral is a fine text colour and a terrible card.
      Math.abs(item.oklch.l - surfaceTarget.l) <= 0.12,
  );
  const surfacePick = surfaceCandidates.reduce<Ranked | null>((best, item) => {
    if (best === null) return item;
    return Math.abs(item.oklch.l - surfaceTarget.l) < Math.abs(best.oklch.l - surfaceTarget.l)
      ? item
      : best;
  }, null);
  const card = surfacePick?.hex ?? oklchToHex(surfaceTarget);

  return { background: paper, card, content, title, accent: accent.hex, hueShift: accent.hueShift };
}
