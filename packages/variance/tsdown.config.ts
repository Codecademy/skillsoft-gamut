import { defineConfig } from 'tsdown';

// The explicit `.ts` extension is required, not stylistic: tsdown's default config
// loader runs on Node's native TS-stripping ESM loader, which (unlike a bundler)
// doesn't do extension probing on relative imports.
import { baseConfig } from '../../tsdown.base.ts';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
});
