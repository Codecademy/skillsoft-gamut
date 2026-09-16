import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // Hybrid: declarations come from `tsc --emitDeclarationOnly`, not from here.
  // See packages/variance/tsdown.config.ts for the full rationale.
  dts: false,
  outDir: 'dist',
  // dist/ is shared with tsc's declaration output — never clean from here.
  clean: false,
  // No explicit external needed — this package's own dependencies +
  // peerDependencies (@skillsoft/gamut-styles, @skillsoft/variance,
  // @emotion/*, lodash, react) are auto-externalized by tsdown.
  // Mirror src/ file-by-file rather than bundling all 377 icons into one
  // dist/index.mjs — verified a single flat bundle here means importing ONE
  // icon pulls in all 377 (586KB) regardless of `sideEffects: false`, since
  // named-export elision within one shared module scope doesn't happen in
  // practice. unbundle + sideEffects: false together restore real
  // per-icon tree-shaking, same convention most icon packages use.
  unbundle: true,
  platform: 'neutral',
  sourcemap: true,
  treeshake: true,
});
