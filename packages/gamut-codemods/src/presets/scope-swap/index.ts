import type { Preset } from '../../lib/types';
import { deepImports } from '../../migrations/deep-imports';
import { eslintComments } from '../../migrations/eslint-comments';
import { eslintConfig } from '../../migrations/eslint-config';
import { mfShared } from '../../migrations/mf-shared';
import { movedExports } from '../../migrations/moved-exports';
import { packageJson } from '../../migrations/package-json';
import { scopeRename } from '../../migrations/scope-rename';
import { manifest } from './manifest';

export const scopeSwap: Preset = {
  name: 'scope-swap',
  description: 'Move from @codecademy/gamut* to @skillsoft/gamut*.',
  manifest,
  migrations: [
    deepImports,
    movedExports,
    mfShared,
    eslintComments,
    /* Last: everything above matches on @codecademy names. */
    scopeRename,
    packageJson,
    eslintConfig,
  ],
  checklist: [
    'Run your formatter (prettier --write / eslint --fix). Split imports come out in recast style.',
    'Reinstall (yarn), then type-check and run your tests.',
    'Work through the warnings above and the leftovers list.',
  ],
  conditionalChecklist: {
    'removed:@codecademy/gamut-kit':
      'gamut-kit is gone. Delete anything that reads it for versions, such as a sync-gamut-deps script.',
    'mf-shared':
      "Module Federation shared config changed. Gamut is now a real singleton: run the host and every remote together, and update the remotes' shared config to match.",
  },
};
