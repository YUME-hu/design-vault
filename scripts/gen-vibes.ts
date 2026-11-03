/**
 * Generate the client-side snapshots from the local design vault:
 *
 *   src/shared/vibes.generated.ts     — id, name and palette of every style
 *   src/shared/palettes.generated.ts  — the curated palette presets
 *
 * The client half has no filesystem access, so the vault is baked in here as a
 * build-time snapshot. Run by hand after the vault changes; it is deliberately
 * outside `pnpm verify` so a missing vault never blocks the build:
 *
 *     node scripts/gen-vibes.ts
 *
 * Read-only: the vault is opened for reading and nothing is written back.
 *
 * @module scripts/gen-vibes
 */

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { readVaultStyles, vaultRoot } from "../src/host/vault-reader.ts";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const vibesTarget = join(projectRoot, "src", "shared", "vibes.generated.ts");
const palettesTarget = join(projectRoot, "src", "shared", "palettes.generated.ts");

export type Vibe = { id: string; name: string; palette: Record<string, string> };
export type PalettePreset = { id: string; name: string; category: string; colors: string[] };

/**
 * Normalise a style name into a stable id.
 *
 * Letters and digits survive in any script (so 中文 names keep their identity),
 * everything else collapses into single dashes.
 */
function slugifyName(name: string): string {
  return name
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** Keep the palette keys in a stable, readable order. */
const PALETTE_KEYS = [
  "primary",
  "bg",
  "surface",
  "text",
  "muted",
  "info",
  "warning",
  "danger",
  "success",
] as const;

function orderedPalette(palette: Record<string, string>): Record<string, string> {
  const ordered: Record<string, string> = {};
  for (const key of PALETTE_KEYS) {
    if (palette[key] !== undefined) ordered[key] = palette[key];
  }
  for (const [key, value] of Object.entries(palette)) {
    if (ordered[key] === undefined) ordered[key] = value;
  }
  return ordered;
}

/* ---------- styles ---------- */

const { file, styles } = await readVaultStyles();

const seen = new Map<string, number>();
const vibes: Vibe[] = styles.map((style) => {
  const base = slugifyName(style.name) || "vibe";
  const count = (seen.get(base) ?? 0) + 1;
  seen.set(base, count);
  return {
    id: count === 1 ? base : `${base}-${count}`,
    name: style.name,
    palette: orderedPalette(style.palette),
  };
});

const vibeRows = vibes
  .map(
    (vibe) =>
      `  {\n    id: ${JSON.stringify(vibe.id)},\n    name: ${JSON.stringify(vibe.name)},\n` +
      `    palette: ${JSON.stringify(vibe.palette)},\n  },`,
  )
  .join("\n");

const vibesSource = `/**
 * Generated file — do not edit by hand.
 *
 * Source: ${file}
 * Generator: node scripts/gen-vibes.ts
 */
export type VibePalette = Record<string, string>;

export type Vibe = {
  /** Normalised style name, the stable key. */
  id: string;
  /** The style name as stored in the vault. */
  name: string;
  /** The style's real palette, straight from styles.json. */
  palette: VibePalette;
};

/** One entry per style in the vault, keyed by a normalised name. */
export const VIBES: Vibe[] = [
${vibeRows}
];
`;

await writeFile(vibesTarget, vibesSource, "utf8");

/* ---------- curated palettes ---------- */

const palettesFile = join(vaultRoot(), "data", "palettes.json");

/** Accept only well-formed rows; a broken entry must not poison the snapshot. */
function readPreset(row: unknown): PalettePreset | null {
  if (typeof row !== "object" || row === null) return null;
  const candidate = row as { id?: unknown; name?: unknown; colors?: unknown; category?: unknown };
  if (typeof candidate.id !== "string" || typeof candidate.name !== "string") return null;
  if (!Array.isArray(candidate.colors)) return null;
  const colors = candidate.colors.filter((hex): hex is string => typeof hex === "string");
  if (colors.length === 0) return null;
  const category = typeof candidate.category === "string" ? candidate.category : "";
  return { id: candidate.id, name: candidate.name, category, colors };
}

let palettes: PalettePreset[] = [];
try {
  const raw = await readFile(palettesFile, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("expected a JSON array");
  palettes = parsed.map(readPreset).filter((preset): preset is PalettePreset => preset !== null);
  const dropped = parsed.length - palettes.length;
  if (dropped > 0) console.warn(`[gen-vibes] skipped ${dropped} malformed palette row(s)`);
} catch (error) {
  const reason = error instanceof Error ? error.message : String(error);
  console.warn(`[gen-vibes] palettes.json not read (${reason}); writing an empty list`);
}

const paletteRows = palettes
  .map(
    (preset) =>
      `  {\n    id: ${JSON.stringify(preset.id)},\n    name: ${JSON.stringify(preset.name)},\n` +
      `    category: ${JSON.stringify(preset.category)},\n` +
      `    colors: ${JSON.stringify(preset.colors)},\n  },`,
  )
  .join("\n");

const palettesSource = `/**
 * Generated file — do not edit by hand.
 *
 * Source: ${palettesFile}
 * Generator: node scripts/gen-vibes.ts
 */
export type PalettePreset = {
  /** Stable key, referenced by the export. */
  id: string;
  /** Display name. */
  name: string;
  /** Grouping key, e.g. "nagai" or "brand"; empty means uncategorised. */
  category: string;
  /** Raw HEX list; the client maps it onto the five surfaces. */
  colors: string[];
};

/** Curated palettes, in the order they appear in the vault file. */
export const PALETTES: PalettePreset[] = [
${paletteRows}
];
`;

await writeFile(palettesTarget, palettesSource, "utf8");

// eslint-disable-next-line no-console -- this is a script, its output is the report
console.log(`wrote ${vibes.length} vibes to ${vibesTarget}`);
for (const vibe of vibes.slice(0, 3)) {
  console.log(`  ${vibe.id}  <-  ${vibe.name}  ${JSON.stringify(vibe.palette)}`);
}
if (vibes.length > 3) console.log(`  ... ${vibes.length - 3} more`);

console.log(`wrote ${palettes.length} palettes to ${palettesTarget}`);
for (const preset of palettes) {
  console.log(`  ${preset.category.padEnd(8)} ${preset.id.padEnd(24)} ${preset.name}`);
}
