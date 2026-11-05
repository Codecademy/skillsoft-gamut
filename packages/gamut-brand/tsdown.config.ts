import { defineConfig } from 'tsdown';

// Explicit `.ts` extension required — see packages/variance/tsdown.config.ts.
import { baseConfig } from '../../tsdown.base.ts';

/*
 * Build-time only, so ESM for Node: the CLI and the API both import Style
 * Dictionary, which is ESM-only.
 */
export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/cli.ts'],
  format: ['esm'],
  platform: 'node',
});
