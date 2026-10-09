import type { Preset } from '../../lib/types';
import { deepImports } from '../../migrations/deep-imports';
import { eslintComments } from '../../migrations/eslint-comments';
import { eslintConfig } from '../../migrations/eslint-config';
import { mdxImports } from '../../migrations/mdx-imports';
import { mfShared } from '../../migrations/mf-shared';
import { movedExports } from '../../migrations/moved-exports';
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
    mfShared,
    eslintComments,
    /* Last: everything above matches on @codecademy names. */
    scopeRename,
    packageJson,
    eslintConfig,
    mdxImports,
    yarnrc,
    tsconfigDom,
  ],
  checklist: [
    'Run your formatter (prettier --write / eslint --fix). Split imports come out in recast style.',
    'Reinstall (yarn), then type-check and run your tests.',
    'Work through the warnings above and the leftovers list.',
  ],
  conditionalChecklist: {
    'removed:@codecademy/gamut-kit':
      'gamut-kit is gone. Delete anything that reads it for versions, such as a sync-gamut-deps script.',
    'tsconfig-no-dom':
      'Some tsconfig files set "lib" without "dom" (see the tsconfig-dom warnings). Video no longer loads with the root import, and it was supplying the DOM types. Add "dom" to those files if type-checking fails on document, HTMLElement, ResizeObserver, and so on.',
    'mf-shared':
      "Module Federation shared config changed. Gamut is now a real singleton: run the host and every remote together, and update the remotes' shared config to match.",
  },
};
