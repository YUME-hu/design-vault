/**
 * The design-system table behind the preview — every dimension the panel
 * exposes is data here, so the canvas, the exported DesignConfig and any future
 * CSS writer read the same numbers.
 *
 * Tokens are Capitalised on purpose: they are the values that reach the export,
 * so they should read as design vocabulary (`Airy`, `Editorial Serif`), not as
 * size abbreviations.
 *
 * @module design-vault-plugin/client/style-tokens
 */

import { hexToRgb } from "../shared/color.ts";

/** Radius ladder. `Full` is the pill/circle cap. */
export const RADIUS_TOKENS = ["None", "Sm", "Md", "Lg", "Full"] as const;
export type RadiusToken = (typeof RADIUS_TOKENS)[number];

/** Corner radius per token, in px. */
export const RADIUS_PX: Record<RadiusToken, number> = {
  None: 0,
  Sm: 6,
  Md: 12,
  Lg: 20,
  Full: 999,
};

/** Shadow ladder: five steps from flat to floating. */
export const SHADOW_TOKENS = ["None", "Sm", "Md", "Lg", "Xl"] as const;
export type ShadowToken = (typeof SHADOW_TOKENS)[number];

export const SHADOW_CSS: Record<ShadowToken, string> = {
  None: "none",
  Sm: "0 1px 2px rgba(0,0,0,.10), 0 1px 1px rgba(0,0,0,.06)",
  Md: "0 4px 10px rgba(0,0,0,.14), 0 2px 4px rgba(0,0,0,.08)",
  Lg: "0 12px 28px rgba(0,0,0,.20), 0 4px 10px rgba(0,0,0,.10)",
  Xl: "0 28px 60px rgba(0,0,0,.28), 0 10px 20px rgba(0,0,0,.14)",
};

/** Visual density, five steps from packed to airy. */
export const DENSITY_TOKENS = ["Compact", "Dense", "Balanced", "Comfortable", "Airy"] as const;
export type DensityToken = (typeof DENSITY_TOKENS)[number];

/** Gap between blocks, padding around them, and padding inside each block. */
export const DENSITY_CSS: Record<DensityToken, { gap: number; padding: number; inset: number }> = {
  Compact: { gap: 6, padding: 10, inset: 8 },
  Dense: { gap: 8, padding: 12, inset: 10 },
  Balanced: { gap: 14, padding: 20, inset: 14 },
  Comfortable: { gap: 18, padding: 24, inset: 16 },
  Airy: { gap: 22, padding: 28, inset: 18 },
};

/** Type pairings: family, weight, tracking and leading move together. */
export const TYPOGRAPHY_TOKENS = [
  "Modern Sans",
  "Geometric Sans",
  "Editorial Serif",
  "Brutalist Mono",
  "Mixed",
  // The five below are the vendored motion-web typography archetypes, mapped onto
  // system stacks with their measured weight / tracking / leading.
  "Editorial Thin",
  "Grotesk Bold",
  "Swiss System",
  "Serif + Sans",
  "Technical Mono",
] as const;
export type TypographyToken = (typeof TYPOGRAPHY_TOKENS)[number];

export type TypographySpec = {
  /** Body family. */
  body: string;
  /** Heading family; differs from `body` only for `Mixed`. */
  heading: string;
  weight: number;
  headingWeight: number;
  tracking: string;
  leading: number;
};

const SANS = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF = 'ui-serif, Georgia, Cambria, "Times New Roman", serif';
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
const GEOMETRIC = '"Avenir Next", Avenir, Futura, "Century Gothic", ui-sans-serif, sans-serif';

export const TYPOGRAPHY_CSS: Record<TypographyToken, TypographySpec> = {
  "Modern Sans": {
    body: SANS,
    heading: SANS,
    weight: 500,
    headingWeight: 800,
    tracking: "-0.01em",
    leading: 1.45,
  },
  "Geometric Sans": {
    body: GEOMETRIC,
    heading: GEOMETRIC,
    weight: 500,
    headingWeight: 700,
    tracking: "-0.02em",
    leading: 1.4,
  },
  // Serif gets the loosest leading: smaller x-height, more air between lines.
  "Editorial Serif": {
    body: SERIF,
    heading: SERIF,
    weight: 400,
    headingWeight: 700,
    tracking: "0.01em",
    leading: 1.72,
  },
  // Mono gets heavier and tighter: terminals fill the glyph box.
  "Brutalist Mono": {
    body: MONO,
    heading: MONO,
    weight: 700,
    headingWeight: 800,
    tracking: "-0.03em",
    leading: 1.28,
  },
  // Mixed is the editorial pairing: serif display over sans text.
  Mixed: {
    body: SANS,
    heading: SERIF,
    weight: 450,
    headingWeight: 700,
    tracking: "0em",
    leading: 1.55,
  },
  // ── vendored from data/visual-bank.json (t-01…t-05) ────────────────────
  // Upstream names webfonts; the stacks below are the closest system
  // approximations, while weight / tracking / leading keep upstream's numbers.
  "Editorial Thin": {
    body: SANS,
    heading: SANS,
    weight: 400,
    headingWeight: 300,
    tracking: "-0.035em",
    leading: 1.05,
  },
  "Grotesk Bold": {
    body: SANS,
    heading: SANS,
    weight: 400,
    headingWeight: 700,
    tracking: "-0.04em",
    leading: 1,
  },
  "Swiss System": {
    body: SANS,
    heading: SANS,
    weight: 400,
    headingWeight: 500,
    tracking: "-0.02em",
    leading: 1.15,
  },
  "Serif + Sans": {
    body: SANS,
    heading: SERIF,
    weight: 400,
    headingWeight: 400,
    tracking: "-0.01em",
    leading: 1.2,
  },
  "Technical Mono": {
    body: SANS,
    heading: MONO,
    weight: 400,
    headingWeight: 500,
    tracking: "0em",
    leading: 1.4,
  },
};

/** How the three blocks aggregate. */
export const LAYOUT_TOKENS = ["Split", "Bento", "ThreeColumn", "Stack"] as const;
export type LayoutToken = (typeof LAYOUT_TOKENS)[number];

/** Grid wiring per aggregation: container columns plus each block's placement. */
export const LAYOUT_CSS = {
  // Two columns: title over body on the left, the card takes the full right rail.
  Split: {
    container: { display: "grid", gridTemplateColumns: "1.25fr 1fr" },
    title: { gridColumn: "1", gridRow: "1" },
    content: { gridColumn: "1", gridRow: "2" },
    card: { gridColumn: "2", gridRow: "1 / span 2" },
  },
  // A bento tile: full-width shelf on top, two tiles beneath.
  Bento: {
    container: { display: "grid", gridTemplateColumns: "1fr 1fr" },
    title: { gridColumn: "1 / -1" },
    content: { gridColumn: "1" },
    card: { gridColumn: "2" },
  },
  // Three equal tracks: hero, body, deck side by side.
  ThreeColumn: {
    container: { display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr" },
    title: { gridColumn: "1" },
    content: { gridColumn: "2" },
    card: { gridColumn: "3" },
  },
  // One column, document order.
  Stack: {
    container: { display: "grid", gridTemplateColumns: "1fr" },
    title: { gridColumn: "1" },
    content: { gridColumn: "1" },
    card: { gridColumn: "1" },
  },
} as const;

/** Border weight ladder. */
export const BORDER_TOKENS = ["None", "Hairline", "Medium", "Heavy"] as const;
export type BorderToken = (typeof BORDER_TOKENS)[number];

/** Width in px, plus the alpha the border borrows from the palette. */
export const BORDER_CSS: Record<BorderToken, { width: number; alpha: number }> = {
  None: { width: 0, alpha: 0 },
  Hairline: { width: 1, alpha: 0.18 },
  Medium: { width: 2, alpha: 0.32 },
  Heavy: { width: 4, alpha: 0.55 },
};

/** Motion ladder: how the card answers the pointer. */
export const MOTION_TOKENS = ["None", "Restrained", "Springy"] as const;
export type MotionToken = (typeof MOTION_TOKENS)[number];

export const MOTION_CSS: Record<
  MotionToken,
  { transition: string; hoverTransform: string; duration: string; easing: string; lift: string }
> = {
  None: {
    transition: "none",
    hoverTransform: "none",
    duration: "0s",
    easing: "linear",
    lift: "none",
  },
  Restrained: {
    transition: "all 0.3s ease",
    hoverTransform: "translateY(-2px)",
    duration: "300ms",
    easing: "cubic-bezier(.22,.61,.36,1)",
    lift: "translateY(-6px)",
  },
  // Slight overshoot: the curve passes 1 before settling, so the lift reads as
  // spring-loaded rather than linear.
  Springy: {
    transition: "all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
    hoverTransform: "translateY(-4px) scale(1.03)",
    duration: "450ms",
    easing: "cubic-bezier(.34,1.56,.64,1)",
    lift: "translateY(-10px) scale(1.02)",
  },
};

/** Every shape/type dimension in one object, so it can be passed as a unit. */
export type ShapeControls = {
  density: DensityToken;
  typography: TypographyToken;
  layout: LayoutToken;
  radius: RadiusToken;
  shadow: ShadowToken;
  border: BorderToken;
  motion: MotionToken;
};

/** `#RRGGBB` plus an alpha, as a CSS `rgba()` the border can use. */
export function withAlpha(hex: string, alpha: number): string {
  if (alpha >= 1) return hex;
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
