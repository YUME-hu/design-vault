/**
 * Read-only access to a local design-vault `data/` directory.
 *
 * The host half is the only half with filesystem access, so every vault read
 * goes through here. Nothing in this module writes: it opens `styles.json` for
 * reading, validates the rows with the shared schema, and returns them.
 *
 * @module design-vault-plugin/host/vault-reader
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { stylesSchema, type Style } from "../shared/schema.ts";

/** Default vault location; override with `DESIGN_VAULT_ROOT` when it moves. */
export const DEFAULT_VAULT_ROOT = "D:\\design-vault";

export type RejectedStyle = {
  /** Position in the source array, so a bad row can be found again. */
  index: number;
  /** First schema complaint, which is usually the useful one. */
  message: string;
};

export type VaultStyles = {
  /** Absolute path of the file that was read. */
  file: string;
  /** Rows that passed `stylesSchema`, in stored order. */
  styles: Style[];
  /** Rows that failed, reported instead of silently dropped. */
  rejected: RejectedStyle[];
};

/** Resolve the vault root: explicit argument, then env, then the local default. */
export function vaultRoot(override?: string): string {
  return override ?? process.env.DESIGN_VAULT_ROOT ?? DEFAULT_VAULT_ROOT;
}

/**
 * Read `data/styles.json` from the vault.
 *
 * A single bad row must not hide the other fourteen, so the whole-array parse is
 * tried first and rows are re-checked one by one when it fails.
 *
 * @param root - vault root; defaults to {@link vaultRoot}.
 */
export async function readVaultStyles(root?: string): Promise<VaultStyles> {
  const file = join(vaultRoot(root), "data", "styles.json");
  const raw = await readFile(file, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`${file}: expected a JSON array of styles, got ${typeof parsed}`);
  }

  const whole = stylesSchema.safeParse(parsed);
  if (whole.success) return { file, styles: whole.data, rejected: [] };

  const styles: Style[] = [];
  const rejected: RejectedStyle[] = [];
  parsed.forEach((row, index) => {
    const one = stylesSchema.element.safeParse(row);
    if (one.success) styles.push(one.data);
    else rejected.push({ index, message: one.error.issues[0]?.message ?? "invalid style" });
  });
  return { file, styles, rejected };
}

/** Minimal text list: one line per style, stable stored order, no truncation. */
export function renderStyleList(styles: Style[]): string {
  const header = `${styles.length} style${styles.length === 1 ? "" : "s"}`;
  const lines = styles.map((style, index) => {
    const number = String(index + 1).padStart(2, " ");
    return `${number}. ${style.name} (${style.id}) primary=${style.palette.primary}`;
  });
  return [header, ...lines].join("\n");
}
