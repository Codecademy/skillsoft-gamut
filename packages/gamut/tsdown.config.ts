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
  // This package's own dependencies + peerDependencies are auto-externalized by
  // tsdown. The one thing that auto-detection can't cover is the single relative
  // `.css` side-effect import (Video/lib/VidstackPlayer/vidstack-styles.css):
  // tsdown refuses to bundle a `.css` import unless `@tsdown/css` is installed,
  // and externalizing it matches the current build exactly — it `cpy`s the CSS
  // into dist and lets the consumer's bundler handle the side-effect import.
  deps: {
    neverBundle: [/\.css$/],
  },
  platform: 'neutral',
  sourcemap: true,
  treeshake: true,
});
