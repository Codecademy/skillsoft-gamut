import { renameSpecifier } from '../../lib/manifest';
import type { FileMigration } from '../../lib/types';

/*
  Package names listed in .yarnrc.yml, like npmPreapprovedPackages:

    npmPreapprovedPackages:
      - '@skillsoft/*'
      - 'eslint-plugin-gamut'

  An old name is renamed, or dropped if a scope glob in the same file
  (`'@skillsoft/*'`) already covers the new one. Only exact list items are
  touched; anything more involved shows up in the leftovers report.
*/

const LIST_ITEM = /^(\s*-\s*)(['"]?)([^'"\s#]+)\2(\s*(#.*)?)$/;

export const yarnrc: FileMigration = {
  name: 'yarnrc',
  kind: 'file',
  description: 'Rename or drop old package names in .yarnrc.yml lists.',
  match: (file) => /(^|\/)\.yarnrc\.yml$/.test(file),
  run({ source, manifest }) {
    const lines = source.split('\n');
    const globs = lines
      .map((line) => LIST_ITEM.exec(line)?.[3])
      .filter((value): value is string => !!value?.endsWith('/*'))
      .map((glob) => glob.slice(0, -1));

    let changed = false;
    const out = lines.flatMap((line) => {
      const match = LIST_ITEM.exec(line);
      const next = match && renameSpecifier(manifest, match[3]);
      if (!match || !next) return [line];
      changed = true;
      if (globs.some((prefix) => next.startsWith(prefix))) return [];
      const [, lead, quote, , trail] = match;
      /* `@` is reserved in YAML, so a plain scalar can't start with it. */
      const q = quote || (next.startsWith('@') ? "'" : '');
      return [`${lead}${q}${next}${q}${trail}`];
    });

    return changed ? out.join('\n') : null;
  },
};
