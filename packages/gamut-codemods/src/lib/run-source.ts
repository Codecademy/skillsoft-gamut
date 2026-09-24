import type { JSCodeshift } from 'jscodeshift';

import type { Manifest } from './manifest';
import type {
  AstMigration,
  Edit,
  Locatable,
  Note,
  SourceMigration,
  SpliceMigration,
} from './types';

/*
  Runs source migrations over one piece of source text. Two phases:

  1. AST migrations share one parse and mutate it. If any changed
     something, recast prints the text once and `postPrint` hooks run.
  2. Splice migrations run in order, each against a fresh parse of the
     current text, returning `{ start, end, text }` edits applied back to
     front. The re-parse means a later splice sees an earlier one's output
     (mf-shared writes @codecademy keys that scope-rename then renames).

  Shared by the jscodeshift transform (whole files) and file migrations
  that embed code, like MDX's ESM blocks.
*/

export interface RunSourceOptions {
  j: JSCodeshift;
  source: string;
  migrations: SourceMigration[];
  manifest: Manifest;
  warnFor: (migration: string) => (node: Locatable, message: string) => void;
  note: Note;
}

const applyEdits = (source: string, edits: Edit[]) =>
  [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce(
      (out, { start, end, text }) =>
        out.slice(0, start) + text + out.slice(end),
      source
    );

export const runSourceMigrations = ({
  j,
  source: original,
  migrations,
  manifest,
  warnFor,
  note,
}: RunSourceOptions) => {
  let source = original;

  const astMigrations = migrations.filter(
    (m): m is AstMigration => m.kind === 'ast'
  );
  if (astMigrations.length > 0) {
    const root = j(source);
    let changed = false;
    for (const m of astMigrations) {
      changed =
        m.run({ j, root, source, manifest, warn: warnFor(m.name), note }) ||
        changed;
    }
    if (changed) {
      source = astMigrations.reduce(
        (out, m) => (m.postPrint ? m.postPrint(out, { manifest }) : out),
        root.toSource({ quote: 'single' })
      );
    }
  }

  for (const m of migrations.filter(
    (x): x is SpliceMigration => x.kind === 'splice'
  )) {
    const root = j(source);
    const edits = m.edits({
      j,
      root,
      source,
      manifest,
      warn: warnFor(m.name),
      note,
    });
    if (edits.length > 0) source = applyEdits(source, edits);
  }

  return source;
};

/* The pre-filter every caller uses so big repos don't parse every file. */
export const mentionsOldNames = (manifest: Manifest, source: string) =>
  [
    ...Object.keys(manifest.packages),
    ...Object.keys(manifest.removedPackages),
    `${manifest.eslintPlugin.from}/`,
  ].some((name) => source.includes(name));

export const activeSourceMigrations = (
  migrations: { kind: string; name: string }[],
  only?: string
) => {
  const names = only ? new Set(only.split(',')) : null;
  return migrations.filter(
    (m) => m.kind !== 'file' && (!names || names.has(m.name))
  ) as SourceMigration[];
};
