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
  // peerDependencies (@emotion/*, @skillsoft/variance, lodash, react, stylis,
  // framer-motion, polished, get-nonce) are auto-externalized by tsdown.
  platform: 'neutral',
  sourcemap: true,
  treeshake: true,
});
