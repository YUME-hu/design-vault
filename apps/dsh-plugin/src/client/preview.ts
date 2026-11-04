/**
 * Palette bridge between the vault snapshot and the preview.
 *
 * The colours are the style's own: `bg`, `surface`, `muted` and `text` come
 * straight from `styles.json`. The seed only nudges the accent's OKLCH hue by at
 * most ±18°, so a style can be explored without losing its identity.
 *
 * @module design-vault-plugin/client/preview
 */

import { hexToOklch, normalizeHex, oklchToHex } from "../shared/color.ts";
import { GUIDANCE, type Guidance } from "../shared/guidance.ts";
import type { ShapeControls } from "./style-tokens.ts";

/** The five colours the preview paints with. */
export type PreviewPalette = {
  background: string;
  card: string;
  content: string;
  title: string;
  accent: string;
  /** Degrees the accent was rotated away from the style's own primary. */
  hueShift: number;
};

/** Used only when a vault row is missing a key; never on a normal path. */
const FALLBACK = {
  primary: "#4C6EF5",
  bg: "#F4F5F7",
  surface: "#FFFFFF",
  text: "#111318",
  muted: "#5B6270",
};

/** FNV-1a over UTF-16 code units: small, stable, no dependencies. */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Rotate a colour's OKLCH hue by a seed-derived amount.
 *
 * @param primary - the style's own primary colour.
 * @param seed - free-form text; empty means "no shift".
 */
export function deriveAccent(primary: string, seed: string): { hex: string; hueShift: number } {
  const base = normalizeHex(primary) ?? FALLBACK.primary;
  const trimmed = seed.trim();
  if (trimmed === "") return { hex: base, hueShift: 0 };

  // -18°…+18°: enough to feel different, small enough to stay recognisable.
  const hueShift = (fnv1a(trimmed) % 37) - 18;
  if (hueShift === 0) return { hex: base, hueShift: 0 };

  const oklch = hexToOklch(base);
  const shifted = oklchToHex({ l: oklch.l, c: oklch.c, h: (oklch.h + hueShift + 360) % 360 });
  return { hex: shifted, hueShift };
}

/**
 * Read the preview palette out of a style's stored palette.
 *
 * @param palette - the style's palette exactly as stored in the vault.
 * @param seed - free-form text that slightly rotates the accent.
 */
export function paletteFromStyle(palette: Record<string, string>, seed: string): PreviewPalette {
  const accent = deriveAccent(palette.primary ?? FALLBACK.primary, seed);
  return {
    background: normalizeHex(palette.bg ?? "") ?? FALLBACK.bg,
    card: normalizeHex(palette.surface ?? "") ?? FALLBACK.surface,
    content: normalizeHex(palette.muted ?? "") ?? FALLBACK.muted,
    title: normalizeHex(palette.text ?? "") ?? FALLBACK.text,
    accent: accent.hex,
    hueShift: accent.hueShift,
  };
}

/** The deliverable: the shipped dimensions, the inputs that produced them, nothing else. */
export type DesignConfigExport = {
  /** Normalised vibe id, the key the palette was built from. */
  vibe: string;
  /** Human-readable name of that vibe, as it appears in the picker. */
  vibeName: string;
  seed: string;
  /** Visual density token: Airy | Balanced | Dense. */
  density: ShapeControls["density"];
  /** Type pairing token: Modern Sans | Editorial Serif | Brutalist Mono. */
  typography: ShapeControls["typography"];
  /** Aggregation token: Split | Bento | Stack. */
  layout: ShapeControls["layout"];
  /** Radius ladder token: none | sm | md | lg. */
  radius: ShapeControls["radius"];
  /** Shadow ladder token: none | sm | md | lg. */
  shadow: ShapeControls["shadow"];
  /** Border weight token: None | Hairline | Heavy. */
  border: ShapeControls["border"];
  /** Motion token: None | Restrained | Springy. */
  motion: ShapeControls["motion"];
  /** Where the palette came from: `style:<id>`, `preset:<id>` or `custom`. */
  paletteId: string;
  palette: {
    background: string;
    card: string;
    content: string;
    title: string;
  };
  /** Motion recipes, anti-slop rules and hard specs the generated UI must obey. */
  guidance: Guidance;
};

/** Everything the export needs: the inputs, the resolved palette and the shape tokens. */
export type BuildDesignConfigExportInput = {
  vibeId: string;
  vibeName: string;
  seed: string;
  /** Which source produced the palette, so the JSON cannot lie about it. */
  paletteId: string;
  /** The seven geometry/type dimensions, passed as a unit. */
  controls: ShapeControls;
  palette: PreviewPalette;
};

/**
 * Project the live preview into the exported shape.
 *
 * A pure mapping, so the JSON on screen is always exactly the panel on screen.
 *
 * @param input - current controls, shape tokens and the palette being painted.
 */
export function buildDesignConfigExport(input: BuildDesignConfigExportInput): DesignConfigExport {
  const { vibeId, vibeName, seed, paletteId, controls, palette } = input;
  return {
    vibe: vibeId,
    vibeName,
    seed,
    paletteId,
    density: controls.density,
    typography: controls.typography,
    layout: controls.layout,
    radius: controls.radius,
    shadow: controls.shadow,
    border: controls.border,
    motion: controls.motion,
    palette: {
      background: palette.background,
      card: palette.card,
      content: palette.content,
      title: palette.title,
    },
    guidance: GUIDANCE,
  };
}
