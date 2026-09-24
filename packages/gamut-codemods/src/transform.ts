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
    const line = node?.loc ? `:${node.loc.start.line}` : '';
    const text = `[${name}] ${file.path}${line} ${message}`;
    if (options.onWarn) options.onWarn(text);
    else api.report(text);
  };

  const source = runSourceMigrations({
    j: api.jscodeshift,
    source: file.source,
    migrations: activeSourceMigrations(preset.migrations, options.only),
    manifest,
    warnFor,
    note,
  });

  return source === file.source ? undefined : source;
}

export const parser = 'tsx';
