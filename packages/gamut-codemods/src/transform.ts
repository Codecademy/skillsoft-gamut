import fs from 'node:fs';
import path from 'node:path';

import type { API, FileInfo } from 'jscodeshift';

import type {
  AstMigration,
  Edit,
  Locatable,
  SourceMigration,
  SpliceMigration,
} from './lib/types';
import { getPreset } from './presets';

/*
  jscodeshift entry point. Two phases:

  1. AST migrations share one parse and mutate it. If any changed
     something, recast prints the file once and `postPrint` hooks run.
  2. Splice migrations run in order, each against a fresh parse of the
     current text, returning `{ start, end, text }` edits applied back to
     front. A re-parse between them means a later splice sees an earlier
     one's output (mf-shared writes @codecademy keys that scope-rename then
     renames).

  Options:
    preset: preset name (default: scope-swap)
    only:   comma-separated migration names to run (default: all)
    notesDir: directory the CLI reads checklist notes back from. jscodeshift
              only aggregates api.stats in --dry runs, so workers leave an
              empty marker file per note key instead.
    onWarn:   (message) => void, for tests; otherwise warnings go to api.report
*/

export interface TransformOptions {
  preset?: string;
  only?: string;
  notesDir?: string;
  onWarn?: (message: string) => void;
}

const applyEdits = (source: string, edits: Edit[]) =>
  [...edits]
    .sort((a, b) => b.start - a.start)
    .reduce(
      (out, { start, end, text }) =>
        out.slice(0, start) + text + out.slice(end),
      source
    );

export default function transform(
  file: FileInfo,
  api: API,
  options: TransformOptions = {}
) {
  const preset = getPreset(options.preset ?? 'scope-swap');
  const { manifest } = preset;

  /* Cheap pre-filter so big repos don't parse every file. */
  const oldNames = [
    ...Object.keys(manifest.packages),
    ...Object.keys(manifest.removedPackages),
    `${manifest.eslintPlugin.from}/`,
  ];
  if (!oldNames.some((name) => file.source.includes(name))) return undefined;

  const only = options.only ? new Set(options.only.split(',')) : null;
  const active = preset.migrations.filter(
    (m): m is SourceMigration =>
      m.kind !== 'file' && (!only || only.has(m.name))
  );

  const j = api.jscodeshift;
  const note = (key: string) => {
    if (options.notesDir) {
      fs.writeFileSync(
        path.join(options.notesDir, encodeURIComponent(key)),
        ''
      );
    }
  };
  const warnFor = (name: string) => (node: Locatable, message: string) => {
    const line = node?.loc ? `:${node.loc.start.line}` : '';
    const text = `[${name}] ${file.path}${line} ${message}`;
    if (options.onWarn) options.onWarn(text);
    else api.report(text);
  };

  let { source } = file;

  const astMigrations = active.filter(
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

  for (const m of active.filter(
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

  return source === file.source ? undefined : source;
}

export const parser = 'tsx';
