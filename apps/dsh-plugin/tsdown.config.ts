/**
 * Library build for both halves.
 *
 * The client bundle has to arrive as one script that calls
 * `window.__ModuleLoader__.load`, so the CJS output is wrapped with a banner and
 * footer here — never in the source.
 *
 * @module tsdown.config
 */
import pkg from './package.json' with { type: 'json' }

const moduleBanner = `window.__ModuleLoader__.load({ id: ${JSON.stringify(pkg.name)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports;`
const moduleFooter = `return module.exports; } });`

export default [
  {
    entry: { index: 'src/host/index.ts' },
    outDir: 'lib',
    format: 'esm',
    platform: 'node',
    dts: false,
    clean: true,
    deps: { alwaysBundle: ['@design-vault/core'] },
    outputOptions: { entryFileNames: 'index.js' }
  },
  {
    entry: { client: 'src/client/index.tsx' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    // React comes from the shell's module table, so it stays external. Everything
    // else has to be inlined: the client bundle is loaded by `__ModuleLoader__`
    // with a fixed `require`, so a real `require("culori")` would miss the table.
    // `culori` is a `dependencies` entry, and tsdown externalises those by default,
    // hence the explicit opt-back-in.
    deps: {
      neverBundle: ['react', 'react/jsx-runtime'],
      alwaysBundle: ['culori', '@design-vault/core', 'zod'],
      // Fail the build if anything else starts being bundled: a new dependency
      // would be externalised by default and miss the shell's module table.
      onlyBundle: ['culori', '@design-vault/core', 'zod'],
    },
    dts: false,
    clean: false,
    outputOptions: {
      entryFileNames: 'client.js',
      banner: moduleBanner,
      footer: moduleFooter
    }
  }
]
