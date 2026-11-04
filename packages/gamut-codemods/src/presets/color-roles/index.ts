import fs from 'node:fs';

import type { Leftover } from '../../lib/leftovers';
import { walk } from '../../lib/leftovers';
import type { Preset } from '../../lib/types';
import { colorRoles } from '../../migrations/color-roles';
import { colorRolesStylesheets } from '../../migrations/color-roles-stylesheets';
import type { ColorRolesManifest } from './manifest';
import { manifest } from './manifest';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/*
  A quoted old name, one read off `theme.colors`, an old `--color-*`
  variable, or a Card (whose variants are renamed).
*/
const OLD_NAMES = new RegExp(
  `['"\`](?:${[...Object.keys(manifest.aliases), ...manifest.oldPalette]
    .map(escape)
    .join('|')})['"\`]|colors\\.[A-Za-z]|--color-[A-Za-z0-9]|<Card\\b`
);

/* Source files, and the stylesheets color-roles-stylesheets rewrites. */
const SOURCE = /\.(m?[jt]sx?|c[jt]s|css|scss|less)$/;

export const colorRolesPreset: Preset<ColorRolesManifest> = {
  name: 'color-roles',
  description:
    'Move Gamut color names onto the roles of the generated color system.',
  manifest,
  mentions: (source) => OLD_NAMES.test(source),
  /* Every name the run marked for a person and nobody has resolved yet. */
  leftovers(roots) {
    const hits: Leftover[] = [];
    for (const root of roots) {
      const files = fs.statSync(root).isDirectory() ? walk(root) : [root];
      for (const file of files) {
        if (!SOURCE.test(file)) continue;
        fs.readFileSync(file, 'utf8')
          .split('\n')
          .forEach((text, i) => {
            if (text.includes('color-roles:')) {
              hits.push({ file, line: i + 1, text: text.trim() });
            }
          });
      }
    }
    return hits;
  },
  migrations: [colorRoles, colorRolesStylesheets],
  checklist: [
    'Run your formatter (prettier --write). The `color-roles:` comments can make lines long.',
    'Type-check. Every name the codemod left in place is still an old name, so it fails until someone picks its role.',
    'Work through the leftovers: each `color-roles:` comment carries design’s rule for choosing. Replace the name, then delete the comment.',
  ],
  conditionalChecklist: {
    'color-roles:manual':
      'Some names are splits, retirements or pending (see the warnings). Splits need the role for where the color is used; retired names have a rule instead of a role; pending names wait for a system that doesn’t exist yet. Shadows split onto `shadow-key` and `shadow-ambient`, the two layers every elevation shadow draws.',
    'color-roles:stylesheets':
      'Stylesheets used old `--color-*` variables. Renames are done; the type check can’t see stylesheets, so the leftovers report below is the only list of what’s left. Indented-syntax .sass files aren’t rewritten: search them for `--color-` by hand.',
    'color-roles:card-navy':
      'Some Cards used the `navy` variant. It becomes `default`, which renders light; wrap a card in `<ColorMode mode="dark">` where it should stay dark, then delete the comment.',
    'color-roles:palette':
      'Some code uses old palette colors (navy, hyper-500, …) directly. No role replaces them by name. Pick each one from design’s component map, in @skillsoft/gamut-styles colorSystem/migration.ts (COMPONENTS).',
    'color-roles:runtime':
      'Some color names are built at runtime, like `${variant}-hover`. The codemod can’t see their values; check each name the template can produce.',
  },
};
