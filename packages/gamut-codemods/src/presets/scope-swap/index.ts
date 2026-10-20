import type { Preset } from '../../lib/types';
import { mdxImports } from '../../migrations/mdx-imports';
import { mfShared } from '../../migrations/mf-shared';
import { nextConfig } from '../../migrations/next-config';
import { packageJson } from '../../migrations/package-json';
import { scopeRename } from '../../migrations/scope-rename';
import { yarnrc } from '../../migrations/yarnrc';
import { manifest } from './manifest';

export const scopeSwap: Preset = {
  name: 'scope-swap',
  description: 'Move from @codecademy/gamut* to @skillsoft/gamut*.',
  manifest,
  migrations: [
    mfShared,
    /* Last: everything above matches on @codecademy names. */
    scopeRename,
    packageJson,
    mdxImports,
    yarnrc,
    nextConfig,
  ],
  checklist: [
    'Run your formatter and lint autofix (prettier --write, then eslint --fix). Split imports come out in recast style, `@skillsoft` sorts differently from `@codecademy` for import-order rules like simple-import-sort, and the shorter scope lets some wrapped imports fit on one line.',
    'Reinstall (yarn), then type-check and run your tests.',
    'Work through the warnings above and the leftovers list.',
  ],
  conditionalChecklist: {
    'removed:@codecademy/gamut-kit':
      "gamut-kit is gone. Delete anything that reads it for versions, such as a sync-gamut-deps script. @skillsoft/gamut-styles has @emotion/cache and stylis peer dependencies, so add them if yarn warns that they aren't provided.",
    'next-esm-externals':
      'Some next.config files set `experimental.esmExternals: false` (see the next-config warnings). Remove it, and any @emotion/* resolve.alias or transpilePackages entries that were working around default-import interop, then rebuild: the failure only shows up when Next collects page data.',
    'mf-shared':
      "Module Federation shared config changed. Gamut is now a real singleton: run the host and every remote together, and update the remotes' shared config to match.",
  },
};
