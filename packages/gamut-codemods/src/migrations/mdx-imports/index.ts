import type { FileMigration } from '../../lib/types';

/*
  MDX files (Storybook docs, mostly) import from Gamut like any module, but
  jscodeshift can't parse MDX. This pulls out the top-level ESM statements
  (`import ... from '...'`, `export ... from '...'`) and runs each one
  through the preset's source migrations, so stories get the same scope
  rename, Video split, and deep-import rewrites as .tsx files.

  Fenced code blocks are left alone. They're documentation, and a code
  sample that still says @codecademy is the leftovers report's job.
*/

const FENCE = /^\s*(```|~~~)/;
const STATEMENT_START = /^(import\s|export\s+(\*|\{|type\s+\{))/;
const STATEMENT_END =
  /(from\s*(['"])[^'"\n]*\2|^import\s*(['"])[^'"\n]*\3)\s*;?\s*$/;
/* A statement that runs longer than this isn't one we understand. */
const MAX_STATEMENT_LINES = 50;

export const mdxImports: FileMigration = {
  name: 'mdx-imports',
  kind: 'file',
  description:
    'Run the source migrations over import/export statements in .mdx files.',
  match: (file) => file.endsWith('.mdx'),
  run({ source, transformSource }) {
    const lines = source.split('\n');
    const out: string[] = [];
    let inFence = false;
    let changed = false;

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (FENCE.test(line)) inFence = !inFence;
      if (inFence || !STATEMENT_START.test(line)) {
        out.push(line);
        continue;
      }

      let end = i;
      while (
        end < lines.length - 1 &&
        end - i < MAX_STATEMENT_LINES &&
        !STATEMENT_END.test(lines.slice(i, end + 1).join('\n'))
      ) {
        end += 1;
      }
      const statement = lines.slice(i, end + 1).join('\n');
      if (!STATEMENT_END.test(statement)) {
        out.push(line);
        continue;
      }

      const next = transformSource(statement);
      if (next !== statement) changed = true;
      out.push(next);
      i = end;
    }

    return changed ? out.join('\n') : null;
  },
};
