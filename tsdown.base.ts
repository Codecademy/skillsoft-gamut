import type { UserConfig } from 'tsdown';

/*
 * Shared across every package's tsdown.config.ts.
 */
export const baseConfig: UserConfig = {
  format: ['esm', 'cjs'],
  // Declarations come from `tsc --emitDeclarationOnly` instead, to avoid
  // TS4023 and rolldown-plugin-dts#174.
  dts: false,
  outDir: 'dist',
  // Shared with tsc's declaration output; the build target's `rm -rf ./dist` owns cleaning.
  clean: false,
  // File-by-file output, not one bundle: a single flat bundle defeats
  // tree-shaking (~15x size increase, verified on gamut/gamut-icons).
  unbundle: true,
  platform: 'neutral',
  sourcemap: true,
  treeshake: true,
};
