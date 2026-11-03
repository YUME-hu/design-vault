/**
 * Read the local design vault, print the minimal style list and generate one
 * `DesignConfig` artefact next to the plugin.
 *
 * Read-only by design: nothing is written back to the vault, and the generated
 * JSON lands in this project's `artifacts/` directory.
 *
 * @module scripts/read-vault
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { buildDesignConfig, renderDesignConfig } from "../src/host/design-config.ts";
import { readVaultStyles, renderStyleList } from "../src/host/vault-reader.ts";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const { file, styles, rejected } = await readVaultStyles();

console.log(`read ${styles.length} styles from ${file}`);
if (rejected.length > 0) {
  console.log(
    `rejected ${rejected.length} invalid rows: ${rejected.map((r) => r.index).join(", ")}`,
  );
}

console.log("");
console.log(renderStyleList(styles));

const style = styles[0];
if (style === undefined) throw new Error(`${file}: no style to build a DesignConfig from`);

const config = buildDesignConfig(style, { file });
const target = join(projectRoot, "artifacts", `${style.id}.design-config.json`);
await mkdir(dirname(target), { recursive: true });
await writeFile(target, renderDesignConfig(config), "utf8");

const scaleCount = Object.keys(config.scales).length;
const steps = config.scales[Object.keys(config.scales)[0] ?? ""]?.entries.length ?? 0;
const passes = config.contrast.filter((check) => check.pass).length;

console.log("");
console.log(`generated ${target}`);
console.log(`  style:    ${config.source.styleName} (${config.source.styleId})`);
console.log(`  palette:  ${Object.keys(config.palette).length} keys`);
console.log(`  scales:   ${scaleCount} ramps x ${steps} steps`);
console.log(`  contrast: ${passes}/${config.contrast.length} checks pass`);
for (const check of config.contrast) {
  console.log(
    `            ${check.id.padEnd(13)} ${check.ratioLabel} (>= ${check.threshold}) ${check.pass ? "pass" : "FAIL"}`,
  );
}
