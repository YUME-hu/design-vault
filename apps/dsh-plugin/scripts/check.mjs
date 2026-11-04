/**
 * Consistency checks a human or an agent can run without reading the code:
 * package name, patch row and constants must agree, the built bundle must carry
 * the same id, and it must not `require` anything the shell cannot provide.
 *
 * @module scripts/check
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const patch = await readFile(join(root, "cordis.patch.yml"), "utf8");
const constants = await readFile(join(root, "src/shared/constants.ts"), "utf8");

const problems = [];
if (!patch.includes(`name: ${pkg.name}`))
  problems.push("cordis.patch.yml does not reference the package name");
const declaredName = /NAME\s*=\s*["']([^"']+)["']/.exec(constants)?.[1];
if (declaredName !== pkg.name)
  problems.push("src/shared/constants.ts NAME does not match package.json");

/** Modules the DSH shell's `require` is documented to provide to a client bundle. */
const SHELL_MODULES = new Set(["react", "react/jsx-runtime"]);

let bundle;
try {
  bundle = await readFile(join(root, "lib/client.js"), "utf8");
} catch {
  problems.push("lib/client.js is missing: run `pnpm build` first");
}

if (bundle !== undefined) {
  if (!bundle.includes(`id: ${JSON.stringify(pkg.name)}`))
    problems.push("lib/client.js carries a different module id");

  // `__ModuleLoader__` hands the factory a fixed module table, so any other
  // `require` is an unresolved import at runtime — a blank panel, not an error
  // message. tsdown externalises `dependencies` by default, so this is the one
  // check that catches a missing `deps.alwaysBundle` before the GUI does.
  const required = new Set();
  for (const match of bundle.matchAll(/require\(\s*["']([^"']+)["']\s*\)/g)) {
    required.add(match[1]);
  }
  for (const id of required) {
    if (!SHELL_MODULES.has(id)) {
      problems.push(
        `lib/client.js requires "${id}", which the shell cannot provide — ` +
          "bundle it via tsdown `deps.alwaysBundle` (and list it in `deps.onlyBundle`)",
      );
    }
  }
}

if (problems.length > 0) {
  console.error(problems.map((problem) => `- ${problem}`).join("\n"));
  process.exit(1);
}
console.log("manifest, constants and bundle agree");
