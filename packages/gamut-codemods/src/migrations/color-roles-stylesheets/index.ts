import type { FileMigration } from '../../lib/types';
import type { ColorRolesManifest } from '../../presets/color-roles/manifest';
import {
  commentText,
  describe,
  findOldVars,
  markedBefore,
  mentionsOldVar,
  paletteMessage,
} from '../color-roles/cssVars';

/*
  Old color variables in stylesheets: `var(--color-text)` in .css, .scss and
  .less. The type check can't see these, so this is the only place they're
  caught.

  - Renames and merges become `--color-<role>`.
  - Splits, retirements and pending names stay, with a
    `/* color-roles: … *\/` comment carrying design's rule in front of them.
    The preset's leftovers report lists every one by file and line.
  - Old palette colors (`--color-navy-800`) only warn.

  Indented-syntax .sass isn't rewritten: its comment rules differ, so a
  comment mid-value could break the file.
*/
export const colorRolesStylesheets: FileMigration<ColorRolesManifest> = {
  name: 'color-roles-stylesheets',
  kind: 'file',
  description:
    'Rename old `--color-*` variables in stylesheets; mark the ones a person has to pick.',
  appliesTo: (file) => /\.(css|scss|less)$/.test(file),
  run({ source, manifest, warn, note }) {
    if (!mentionsOldVar(source)) return null;
    const hits = findOldVars(source, manifest);
    if (hits.length === 0) return null;

    let out = '';
    let last = 0;
    for (const hit of hits) {
      out += source.slice(last, hit.at);
      last = hit.at;
      if (hit.role) {
        out += `--color-${hit.role}`;
        last = hit.at + `--color-${hit.name}`.length;
      } else if (hit.alias) {
        /* In front of the `var(` the variable sits in, if there is one. */
        const varAt = source.lastIndexOf('var(', hit.at);
        const at =
          varAt !== -1 && source.slice(varAt + 4, hit.at).trim() === ''
            ? varAt
            : hit.at;
        if (!markedBefore(source, at)) {
          out =
            out.slice(0, out.length - (hit.at - at)) +
            commentText(hit.name, hit.alias) +
            source.slice(at, hit.at);
        }
        warn(describe(hit.name, hit.alias));
        note('color-roles:manual');
      } else if (hit.palette) {
        warn(paletteMessage(hit.name));
        note('color-roles:palette');
      }
    }
    out += source.slice(last);
    note('color-roles:stylesheets');
    return out === source ? null : out;
  },
};
