import type { UserConfig } from 'tsdown';

/**
 * Shared across every package's tsdown.config.ts.
 */
export const baseConfig: UserConfig = {
  format: ['esm', 'cjs'],
  // Hybrid: declarations come from `tsc --emitDeclarationOnly`, not from here.
  // tsdown's own `dts` produces bundled declarations that downstream packages can't
  // name (TS4023) — keeping tsc also makes rolldown-plugin-dts#174 (directives
  // leaking into .d.ts) structurally unreachable, since declarations carry no
  // statements to leak through.
  dts: false,
  outDir: 'dist',
  // dist/ is shared with tsc's declaration output — never clean from here. The
  // build target's `rm -rf ./dist` step owns cleaning.
  clean: false,
  // Mirror src/ file-by-file instead of concatenating into one dist/index.mjs. A
  // single flat bundle defeats downstream tree-shaking entirely — verified on
  // `gamut`: a single-component import pulled in the whole bundle plus every
  // dependency any component uses (~15x the size of an unbundled equivalent), and
  // on `gamut-icons` (586KB for one icon vs 73KB with this on). No explicit
  // `external`/`deps.neverBundle` is needed for most packages either: tsdown reads
  // each package's own `dependencies` + `peerDependencies` and externalizes them
  // automatically, matching today's Babel build, which never bundled third-party
  // deps.
  unbundle: true,
  platform: 'neutral',
  sourcemap: true,
  treeshake: true,
};
