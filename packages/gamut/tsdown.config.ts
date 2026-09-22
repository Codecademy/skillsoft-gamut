import { defineConfig } from 'tsdown';

// Explicit `.ts` extension required — see packages/variance/tsdown.config.ts.
import { baseConfig } from '../../tsdown.base.ts';

export default defineConfig({
  ...baseConfig,
  // Video gets its own entry rather than living only inside the root barrel's
  // graph — it's not re-exported from src/index.tsx (see the comment there), so
  // without its own entry here it wouldn't build at all. Matches the
  // `./Video` subpath in package.json's exports map.
  entry: ['src/index.tsx', 'src/Video/index.tsx'],
  // The one thing base config's dependency auto-externalization can't cover: the
  // single relative `.css` side-effect import
  // (Video/lib/VidstackPlayer/vidstack-styles.css). tsdown refuses to bundle a
  // `.css` import unless `@tsdown/css` is installed, and externalizing it matches
  // the current build exactly — it `cpy`s the CSS into dist and lets the
  // consumer's bundler handle the side-effect import.
  deps: {
    neverBundle: [/\.css$/],
  },
});
