import type { Preset } from '../../lib/types';
import { deepImports } from '../../migrations/deep-imports';
import { mdxImports } from '../../migrations/mdx-imports';
import { mfShared } from '../../migrations/mf-shared';
import { packageJson } from '../../migrations/package-json';
import { scopeRename } from '../../migrations/scope-rename';
import { yarnrc } from '../../migrations/yarnrc';
import { manifest } from './manifest';

export const scopeSwap: Preset = {
  name: 'scope-swap',
  description: 'Move from @codecademy/gamut* to @skillsoft/gamut*.',
  manifest,
  migrations: [
    deepImports,
    mfShared,
    /* Last: everything above matches on @codecademy names. */
    scopeRename,
    packageJson,
    mdxImports,
    yarnrc,
  ],
  checklist: [
    'Run your formatter and lint autofix (prettier --write, then eslint --fix). Split imports come out in recast style, `@skillsoft` sorts differently from `@codecademy` for import-order rules like simple-import-sort, and the shorter scope lets some wrapped imports fit on one line.',
    'Reinstall (yarn), then type-check and run your tests.',
    'Work through the warnings above and the leftovers list.',
  ],
  conditionalChecklist: {
    'removed:@codecademy/gamut-kit':
      "gamut-kit is gone. Delete anything that reads it for versions, such as a sync-gamut-deps script. @skillsoft/gamut-styles has @emotion/cache and stylis peer dependencies, so add them if yarn warns that they aren't provided.",
    'mf-shared':
      "Module Federation shared config changed. Gamut is now a real singleton: run the host and every remote together, and update the remotes' shared config to match.",
  },
};
