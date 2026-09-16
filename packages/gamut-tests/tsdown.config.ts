import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['esm', 'cjs'],
  // Hybrid: declarations come from `tsc --emitDeclarationOnly`, not from here.
  // See packages/variance/tsdown.config.ts for the full rationale.
  dts: false,
  outDir: 'dist',
  // dist/ is shared with tsc's declaration output — never clean from here.
  clean: false,
  // No explicit external needed — dependencies + peerDependencies cover
  // everything this package imports. Consumed from jest setup files via
  // `require()`, so the CJS half of the dual output matters most here.
  // Mirror src/ file-by-file for consistency with every other package here.
  unbundle: true,
  platform: 'neutral',
  sourcemap: true,
  treeshake: true,
});
