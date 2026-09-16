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
  // Mirror src/ file-by-file instead of concatenating into one dist/index.mjs.
  // A single flat bundle proved to defeat downstream tree-shaking entirely: an
  // esbuild single-import probe pulled in gamut's whole 428KB bundle plus
  // every heavy dependency any component uses (vidstack, framer-motion,
  // formatjs, react-aria, react-select — ~8MB pre-minify), none of which the
  // one imported component needed. unbundle keeps rolldown's speed and valid
  // ESM/CJS output while giving a downstream bundler per-file granularity to
  // actually shake, matching today's per-file Babel output shape.
  unbundle: true,
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
