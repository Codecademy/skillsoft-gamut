import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // Hybrid: declarations come from `tsc --project tsconfig.lib.json`, not from here.
  // tsdown's own `dts` produces bundled declarations that downstream packages can't
  // name (TS4023) — keeping tsc also makes rolldown-plugin-dts#174 (directives
  // leaking into .d.ts) structurally unreachable, since declarations carry no
  // statements to leak through.
  dts: false,
  outDir: 'dist',
  // dist/ is shared with tsc's declaration output — never clean from here. The
  // build target's `rm -rf ./dist` step owns cleaning.
  clean: false,
  // No explicit `external`/`deps.neverBundle` needed: tsdown reads this package's
  // own `dependencies` + `peerDependencies` (csstype, lodash, @emotion/react,
  // typescript) and externalizes them automatically. That matches today's Babel
  // build exactly — it never bundled third-party deps either.
  // Mirror src/ file-by-file instead of concatenating into one dist/index.mjs.
  // A single flat bundle defeats downstream tree-shaking entirely — verified on
  // `gamut`: a single-component import pulled in the whole bundle plus every
  // dependency any component uses (~15x the size of an unbundled equivalent).
  unbundle: true,
  platform: 'neutral',
  sourcemap: true,
  treeshake: true,
});
