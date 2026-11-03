/**
 * Add or replace curated palettes in the vault, then rebuild the client
 * snapshot in the same run.
 *
 * Single preset:
 *
 *     node scripts/add-palette.ts \
 *       --id silicon-valley-tech --category modern \
 *       --name "硅谷极简科技（Silicon Valley Tech）" \
 *       --colors "#F7F8FA,#D5DBE3,#12161C,#0A84FF"
 *
 * A whole series at once (a JSON array of `{ id, name, colors, category }`):
 *
 *     node scripts/add-palette.ts --file ./batch.json
 *
 * The vault file is the source of truth; this script only touches
 * `data/palettes.json` and then re-runs `gen-vibes.ts` exactly once. The client
 * bundle is a separate step (`pnpm build`), because the snapshot is compiled in.
 *
 * @module scripts/add-palette
 */

import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { vaultRoot } from "../src/host/vault-reader.ts";

type Preset = { id: string; name: string; colors: string[]; category: string };

const here = dirname(fileURLToPath(import.meta.url));
const palettesFile = join(vaultRoot(), "data", "palettes.json");

/** Read `--key value` pairs into an object. */
function parseArgs(argv: string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const next = argv[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      values[key] = next;
      index += 1;
    } else {
      values[key] = "";
    }
  }
  return values;
}

function normaliseColors(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toUpperCase())
    .filter((value) => value !== "");
}

/** Everything wrong with one preset, phrased for the person who typed it. */
function validate(preset: Preset, label: string): string[] {
  const problems: string[] = [];
  if (!/^[a-z0-9][a-z0-9-]*$/.test(preset.id)) {
    problems.push(`${label}: id must be lowercase kebab-case`);
  }
  if (preset.name.trim() === "") problems.push(`${label}: name must not be empty`);
  if (preset.category.trim() === "") problems.push(`${label}: category must not be empty`);
  if (!/^[a-z][a-z0-9-]*$/.test(preset.category)) {
    problems.push(`${label}: category must be lowercase kebab-case`);
  }
  if (preset.colors.length < 2) problems.push(`${label}: needs at least two HEX values`);
  for (const color of preset.colors) {
    if (!/^#[0-9A-F]{6}$/.test(color)) problems.push(`${label}: not a 6-digit HEX: ${color}`);
  }
  return problems;
}

function toPreset(row: Partial<Preset>): Preset {
  return {
    id: String(row.id ?? "").trim(),
    name: String(row.name ?? "").trim(),
    category: String(row.category ?? "").trim(),
    colors: normaliseColors(row.colors),
  };
}

async function readPalettes(): Promise<Preset[]> {
  const raw = await readFile(palettesFile, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error(`${palettesFile}: expected a JSON array`);
  return parsed as Preset[];
}

function runGenerator(): Promise<number> {
  const child = spawn(process.execPath, [join(here, "gen-vibes.ts")], { stdio: "inherit" });
  return new Promise((resolve) => child.on("exit", (code) => resolve(code ?? 1)));
}

/* ---------- gather the incoming presets ---------- */

const args = parseArgs(process.argv.slice(2));
const incoming: Preset[] = [];
const problems: string[] = [];

if (typeof args.file === "string" && args.file !== "") {
  let rows: unknown;
  try {
    rows = JSON.parse(await readFile(args.file, "utf8"));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`cannot read --file ${args.file}: ${reason}`);
    process.exit(1);
  }
  if (!Array.isArray(rows)) {
    console.error(`${args.file}: expected a JSON array of { id, name, colors, category }`);
    process.exit(1);
  }
  rows.forEach((row, index) => {
    const candidate = toPreset((row ?? {}) as Partial<Preset>);
    problems.push(...validate(candidate, `#${index + 1} ${candidate.id || "(no id)"}`));
    incoming.push(candidate);
  });
} else {
  const single = toPreset({
    id: args.id ?? "",
    name: args.name ?? "",
    category: args.category ?? "",
    colors: (args.colors ?? "").split(/[\s,]+/),
  });
  problems.push(...validate(single, "single preset"));
  incoming.push(single);
}

if (problems.length > 0) {
  console.error(problems.map((problem) => `- ${problem}`).join("\n"));
  process.exit(1);
}

/* ---------- upsert ---------- */

const presets = await readPalettes();
let added = 0;
let replaced = 0;

for (const preset of incoming) {
  const existing = presets.findIndex((item) => item.id === preset.id);
  if (existing >= 0) {
    presets[existing] = preset;
    replaced += 1;
  } else {
    presets.push(preset);
    added += 1;
  }
}

await writeFile(palettesFile, `${JSON.stringify(presets, null, 2)}\n`, "utf8");
console.log(`${palettesFile}: +${added} added, ${replaced} replaced, ${presets.length} total`);

const code = await runGenerator();
if (code !== 0) {
  console.error("gen-vibes.ts failed; the snapshot is stale");
  process.exit(code);
}

console.log(
  "\nnext: `pnpm build` (the snapshot is compiled into lib/client.js), then reload the app",
);
