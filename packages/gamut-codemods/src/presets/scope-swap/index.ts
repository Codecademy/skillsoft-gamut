import type { Preset } from '../../lib/types';
import { manifest } from './manifest';

export const scopeSwap: Preset = {
  name: 'scope-swap',
  description: 'Move from @codecademy/gamut* to @skillsoft/gamut*.',
  manifest,
  migrations: [],
  checklist: [
    'Run your formatter and lint autofix (prettier --write, then eslint --fix). Split imports come out in recast style, `@skillsoft` sorts differently from `@codecademy` for import-order rules like simple-import-sort, and the shorter scope lets some wrapped imports fit on one line.',
    'Reinstall (yarn), then type-check and run your tests.',
    'Work through the warnings above and the leftovers list.',
  ],
  conditionalChecklist: {},
};
