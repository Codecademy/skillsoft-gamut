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
  // everything this package imports.
  // Mirror src/ file-by-file — see packages/gamut-icons/tsdown.config.ts for
  // why (same shape: many pattern components, single bundle defeats shaking).
  unbundle: true,
  platform: 'neutral',
  sourcemap: true,
  treeshake: true,
});
