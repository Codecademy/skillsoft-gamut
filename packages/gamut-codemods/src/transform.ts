import fs from 'node:fs';
import path from 'node:path';

import type { API, FileInfo } from 'jscodeshift';

import {
  activeSourceMigrations,
  mentionsOldNames,
  runSourceMigrations,
} from './lib/run-source';
import type { Locatable } from './lib/types';
import { getPreset } from './presets';

/*
  jscodeshift entry point: runs a preset's source migrations over one file
  (see lib/run-source.ts for the two phases).

  Options:
    preset:   preset name (default: scope-swap)
    only:     comma-separated migration names to run (default: all)
    skip:     comma-separated migration names the CLI ruled out for this
              run (see Migration.skipReason)
    notesDir: directory the CLI reads checklist notes back from. jscodeshift
              only aggregates api.stats in --dry runs, so workers leave an
              empty marker file per note key instead.
    warningsDir: directory each file's warnings are appended to, as JSON
              lines, so the CLI can print them grouped by file. Without it,
              warnings go to api.report.
    onWarn:   (message) => void, for tests; otherwise warnings go to api.report
*/

export interface RecordedWarning {
  migration: string;
  line?: number;
  message: string;
}

export interface TransformOptions {
  preset?: string;
  only?: string;
  skip?: string;
  notesDir?: string;
  warningsDir?: string;
  onWarn?: (message: string) => void;
}

export default function transform(
  file: FileInfo,
  api: API,
  options: TransformOptions = {}
) {
  const preset = getPreset(options.preset ?? 'scope-swap');
  const { manifest } = preset;
  if (!mentionsOldNames(manifest, file.source)) return undefined;

  const note = (key: string) => {
    if (options.notesDir) {
      fs.writeFileSync(
        path.join(options.notesDir, encodeURIComponent(key)),
        ''
      );
    }
  };
  const warnFor = (name: string) => (node: Locatable, message: string) => {
    const line = node?.loc ? node.loc.start.line : undefined;
    if (options.warningsDir) {
      const warning: RecordedWarning = { migration: name, line, message };
      fs.appendFileSync(
        path.join(options.warningsDir, encodeURIComponent(file.path)),
        `${JSON.stringify(warning)}\n`
      );
      return;
    }
    const text = `[${name}] ${file.path}${line ? `:${line}` : ''} ${message}`;
    if (options.onWarn) options.onWarn(text);
    else api.report(text);
  };

  const source = runSourceMigrations({
    j: api.jscodeshift,
    source: file.source,
    migrations: activeSourceMigrations(
      preset.migrations,
      options.only,
      options.skip
    ),
    manifest,
    warnFor,
    note,
  });

  return source === file.source ? undefined : source;
}

export const parser = 'tsx';
