/**
 * Vendored from the motion-web skill: `data/visual-bank.json` (v1.1, 2026-09-05).
 *
 * Upstream ships `rgba()` values for translucent surfaces and secondary text.
 * The colour engine only understands HEX, so every such value was composited
 * over its archetype's own background at vendoring time. Roles are upstream's
 * own (`text_primary` → title, `text_secondary` → content), not inferred.
 *
 * Do not edit by hand: re-run the vendoring step to refresh.
 *
 * @module design-vault-plugin/shared/visual-bank
 */

export type BankPalette = {
  id: string;
  name: string;
  mood: string[];
  background: string;
  surface: string;
  border: string;
  title: string;
  content: string;
  accent: string;
  usage: string;
  avoid: string;
};

export type BankTypography = {
  id: string;
  name: string;
  mood: string[];
  headingFont: string;
  bodyFont: string;
  h1Size: string;
  h1Weight: string;
  h1LineHeight: string;
  h1LetterSpacing: string;
  bodySize: string;
  bodyLineHeight: string;
  pairingRule: string;
};

export type BankLayout = {
  id: string;
  name: string;
  structure: string;
  maxWidth: string;
  sectionSpacing: string;
  density: string;
  collapse: string;
};

/** Seven palette archetypes, roles already resolved to opaque HEX. */
export const BANK_PALETTES: BankPalette[] = [
  {
    id: "p-01",
    name: "Deep Void",
    mood: ["premium", "cinematic", "focused"],
    background: "#080808",
    surface: "#111111",
    border: "#1C1C1C",
    title: "#F0F0F0",
    content: "#888888",
    accent: "#FFFFFF",
    usage: "AI research, premium SaaS, editorial presentations",
    avoid: "Avoid for consumer brands, children's products, anything requiring warmth",
  },
  {
    id: "p-02",
    name: "Warm Cream",
    mood: ["approachable", "editorial", "human"],
    background: "#F7F2ED",
    surface: "#FFFFFF",
    border: "#E3DFDA",
    title: "#1A1A18",
    content: "#666666",
    accent: "#000000",
    usage: "Blogs, editorial sites, personal portfolios, coaching services",
    avoid: "Tech products, developer tools, anything signaling precision or speed",
  },
  {
    id: "p-03",
    name: "Warm Beige (Smithery tone)",
    mood: ["warm", "technical", "approachable"],
    background: "#E7E5DF",
    surface: "#F5F5F5",
    border: "#D4D2CC",
    title: "#242424",
    content: "#666666",
    accent: "#FF5500",
    usage: "AI tools, developer platforms, community products that want approachability",
    avoid: "Copy the orange directly — it's Smithery-specific. Pick a new accent.",
  },
  {
    id: "p-04",
    name: "Cool Near-White",
    mood: ["clean", "systematic", "technical"],
    background: "#F5F5F5",
    surface: "#FFFFFF",
    border: "#E5E5E5",
    title: "#000000",
    content: "#666666",
    accent: "#000000",
    usage: "Design tools, portfolios, agencies with Swiss/minimal sensibility",
    avoid: "Contexts needing emotional warmth or brand differentiation from competitors",
  },
  {
    id: "p-05",
    name: "Warm Gray",
    mood: ["refined", "quiet", "human"],
    background: "#EDEDED",
    surface: "#F7F7F7",
    border: "#DADADA",
    title: "#000000",
    content: "#8F8F8F",
    accent: "#000000",
    usage: "Interaction design portfolios, minimal personal sites, subtle brand presences",
    avoid: "High-density or data-rich contexts — breathing room is mandatory",
  },
  {
    id: "p-06",
    name: "Soft Green / Organic",
    mood: ["natural", "healthy", "premium-consumer"],
    background: "#E8EFE4",
    surface: "#F5F9F3",
    border: "#D5DCD2",
    title: "#1A2416",
    content: "#5A6B52",
    accent: "#2D5A1B",
    usage: "Health, food, sustainability, wellness, premium packaged goods",
    avoid: "Tech contexts, financial services",
  },
  {
    id: "p-07",
    name: "Bold Black + Signal Accent",
    mood: ["bold", "high-contrast", "experimental"],
    background: "#000000",
    surface: "#0D0D0D",
    border: "#1F1F1F",
    title: "#FFFEF4",
    content: "#909090",
    accent: "#FF0000",
    usage: "Creative agencies, award sites, experimental portfolios, bold studios",
    avoid:
      "Any signal accent must be used sparingly — one per page max. Don't pair two signal colors.",
  },
];

/** Five typography archetypes with upstream's measured values. */
export const BANK_TYPOGRAPHY: BankTypography[] = [
  {
    id: "t-01",
    name: "Thin Editorial Display",
    mood: ["cinematic", "premium", "minimal"],
    headingFont: "DM Sans (weight 300) OR Neue Montreal (weight 200) OR GT Alpina",
    bodyFont: "DM Sans (weight 400) OR Inter",
    h1Size: "clamp(3.5rem, 7vw, 6rem)",
    h1Weight: "300",
    h1LineHeight: "1.05",
    h1LetterSpacing: "-0.03em to -0.04em",
    bodySize: "1rem",
    bodyLineHeight: "1.65",
    pairingRule: "Single weight family — distinction comes from size/case, not weight switches",
  },
  {
    id: "t-02",
    name: "Bold Grotesk Display",
    mood: ["bold", "impactful", "brand-forward"],
    headingFont: "GT Walsheim Pro OR Neue Montreal Bold OR NB International Pro",
    bodyFont: "Helvetica Neue OR Inter",
    h1Size: "clamp(4rem, 8vw, 7rem)",
    h1Weight: "600–700",
    h1LineHeight: "1.0",
    h1LetterSpacing: "-0.04em",
    bodySize: "1rem",
    bodyLineHeight: "1.5",
    pairingRule: "Extreme weight contrast — hero at 700, body at 400, nothing in between",
  },
  {
    id: "t-03",
    name: "Swiss Typographic",
    mood: ["precise", "systematic", "elegant"],
    headingFont: "Universal Sans OR Helvetica Neue OR Aktiv Grotesk",
    bodyFont: "Same family, lighter weight",
    h1Size: "clamp(2.5rem, 5vw, 4.5rem)",
    h1Weight: "500",
    h1LineHeight: "1.15",
    h1LetterSpacing: "-0.02em",
    bodySize: "1rem",
    bodyLineHeight: "1.6",
    pairingRule:
      "Same typeface across all sizes — weight is the only variable. No decorative typefaces.",
  },
  {
    id: "t-04",
    name: "Serif + Sans Pairing",
    mood: ["editorial", "trustworthy", "human"],
    headingFont: "Playfair Display OR GT Alpina OR Freight Display (serif)",
    bodyFont: "Satoshi OR Inter OR DM Sans (sans)",
    h1Size: "clamp(2.5rem, 5vw, 4rem)",
    h1Weight: "400 (serif weight is inherently heavier)",
    h1LineHeight: "1.2",
    h1LetterSpacing: "-0.01em",
    bodySize: "1.05rem",
    bodyLineHeight: "1.7",
    pairingRule:
      "Serif for headings creates warmth; sans for body ensures readability. Never mix at same size.",
  },
  {
    id: "t-05",
    name: "Monospace Technical",
    mood: ["technical", "developer", "precise"],
    headingFont: "DM Mono OR Fira Code OR Berkeley Mono",
    bodyFont: "Inter OR System UI",
    h1Size: "clamp(1.75rem, 3vw, 2.5rem)",
    h1Weight: "500",
    h1LineHeight: "1.4",
    h1LetterSpacing: "0",
    bodySize: "0.9rem",
    bodyLineHeight: "1.6",
    pairingRule:
      "Mono for all headings and code; sans for body and labels. Tight line-height for mono, looser for sans.",
  },
];

/** Five layout archetypes. Reference data: not previewable in the canvas. */
export const BANK_LAYOUTS: BankLayout[] = [
  {
    id: "l-01",
    name: "Bento Grid (Pixel-gap)",
    structure: "CSS Grid 12-column with 1px gap; gap IS the border",
    maxWidth: "1100–1200px centered",
    sectionSpacing: "5–6rem between major sections",
    density: "medium",
    collapse: "Stack cells to 1-column at 768px; maintain border-radius",
  },
  {
    id: "l-02",
    name: "Editorial Single Column",
    structure: "Single centered column, 680–720px max",
    maxWidth: "720px",
    sectionSpacing: "6–10rem (breathing is the design)",
    density: "low",
    collapse: "Full-width with 1.5rem padding at mobile; font-size stays same",
  },
  {
    id: "l-03",
    name: "Asymmetric Split",
    structure: "2:1 or 3:1 column ratio — primary content + sidebar or callout",
    maxWidth: "1100px",
    sectionSpacing: "4rem",
    density: "medium",
    collapse: "Reverse to 1-column at 768px; sidebar content moves below",
  },
  {
    id: "l-04",
    name: "Full-Bleed Immersive",
    structure: "100vw sections, content positioned within; no max-width container",
    maxWidth: "None (or internal content cap of 1400px)",
    sectionSpacing: "0 (section boundaries are visual, not spatial)",
    density: "variable",
    collapse: "Keep full-bleed; adjust padding to 1.5rem at mobile",
  },
  {
    id: "l-05",
    name: "Masonry Image Grid",
    structure: "CSS columns or JS Masonry; variable row heights",
    maxWidth: "1400px",
    sectionSpacing: "4rem",
    density: "high",
    collapse: "2 columns at 1024px; 1 column at 640px",
  },
];
