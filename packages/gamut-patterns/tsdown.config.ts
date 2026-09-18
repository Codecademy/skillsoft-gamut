import { defineConfig } from 'tsdown';

// Explicit `.ts` extension required — see packages/variance/tsdown.config.ts.
import { baseConfig } from '../../tsdown.base.ts';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.tsx'],
});
