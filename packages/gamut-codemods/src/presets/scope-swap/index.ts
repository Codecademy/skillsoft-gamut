import type { Preset } from '../../lib/types';
import { deepImports } from '../../migrations/deep-imports';
import { eslintComments } from '../../migrations/eslint-comments';
import { eslintConfig } from '../../migrations/eslint-config';
import { mdxImports } from '../../migrations/mdx-imports';
import { mfShared } from '../../migrations/mf-shared';
import { markdownVideoOverrides } from '../../migrations/markdown-video-overrides';
import { movedExports } from '../../migrations/moved-exports';
import { nextConfig } from '../../migrations/next-config';
import { packageJson } from '../../migrations/package-json';
import { scopeRename } from '../../migrations/scope-rename';
import { tsconfigDom } from '../../migrations/tsconfig-dom';
import { yarnrc } from '../../migrations/yarnrc';
import { manifest } from './manifest';

export const scopeSwap: Preset = {
  name: 'scope-swap',
  description: 'Move from @codecademy/gamut* to @skillsoft/gamut*.',
  manifest,
  migrations: [
    deepImports,
    movedExports,
    markdownVideoOverrides,
    mfShared,
    eslintComments,
    /* Last: everything above matches on @codecademy names. */
    scopeRename,
    packageJson,
    eslintConfig,
    mdxImports,
    yarnrc,
    tsconfigDom,
    nextConfig,
  ],
  checklist: [
    'Run your formatter and lint autofix (prettier --write, then eslint --fix). Split imports come out in recast style, `@skillsoft` sorts differently from `@codecademy` for import-order rules like simple-import-sort, and the shorter scope lets some wrapped imports fit on one line.',
    'Reinstall (yarn), then type-check and run your tests.',
    'Work through the warnings above and the leftovers list.',
  ],
  conditionalChecklist: {
    'removed:@codecademy/gamut-kit':
      "gamut-kit is gone. Delete anything that reads it for versions, such as a sync-gamut-deps script. @skillsoft/gamut-styles has a stylis peer dependency, so add stylis if yarn warns that it isn't provided.",
    'video-peers':
      'Video needs two peer dependencies that Gamut no longer installs for you: `@vidstack/react` and `react-player`. Gamut supports @vidstack/react 1.12.x only (its npm `latest` tag is 0.6.x). Install them: `yarn add @vidstack/react@~1.12.12 react-player@^3.4.0`.',
    'tsconfig-no-dom':
      'Some tsconfig files set "lib" without "dom" (see the tsconfig-dom warnings). Video no longer loads with the root import, and it was supplying the DOM types. Add "dom" to those files if type-checking fails on document, HTMLElement, ResizeObserver, and so on.',
    'newer-than-source':
      'Some @codecademy packages were on a newer release than @skillsoft has caught up to (see the package-json warnings). Expect type errors wherever the code uses what that release added, and check the upstream CHANGELOG for it.',
    'skipped:eslint-comments':
      "ESLint directive comments were left as is because the repo uses a flat config, where the rule prefix is the key the plugin is registered under (for example `plugins: { gamut }`). Keep that key, or rename it and every 'gamut/' rule and directive together.",
    'next-esm-externals':
      'Some next.config files set `experimental.esmExternals: false` (see the next-config warnings). Remove it, and any @emotion/* resolve.alias or transpilePackages entries that were working around default-import interop, then rebuild: the failure only shows up when Next collects page data.',
    'mf-shared':
      "Module Federation shared config changed. Gamut is now a real singleton: run the host and every remote together, and update the remotes' shared config to match.",
  },
};
