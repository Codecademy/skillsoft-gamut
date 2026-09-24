/* eslint-disable no-console -- it's a CLI; stdout is the interface. */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { dirtyTreeReason } from './lib/git';
import { findLeftovers, walk } from './lib/leftovers';
import type { FileMigration, Preset } from './lib/types';
import { getPreset, presets } from './presets';

/* No published types for the Runner; it's jscodeshift's programmatic API. */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Runner = require('jscodeshift/src/Runner') as {
  run(
    transformFile: string,
    paths: string[],
    options: Record<string, unknown>
  ): Promise<{ error: number }>;
};

const USAGE = `Usage: gamut-codemods <preset> <path...> [options]
       gamut-codemods list

Options:
  --dry         Don't write anything; show what would change
  --force       Run even if the target has uncommitted changes
  --only=a,b    Run only these migrations
  --no-report   Skip the leftovers report`;

interface Options {
  preset?: string;
  paths: string[];
  dry: boolean;
  force: boolean;
  only?: string;
  report: boolean;
}

export const parseArgs = (argv: string[]): Options | 'help' | 'list' => {
  const [command, ...rest] = argv;
  if (!command || command === '-h' || command === '--help') return 'help';
  if (command === 'list') return 'list';

  const opts: Options = {
    preset: command,
    paths: [],
    dry: false,
    force: false,
    report: true,
  };
  for (const arg of rest) {
    if (arg === '--dry') opts.dry = true;
    else if (arg === '--force') opts.force = true;
    else if (arg === '--no-report') opts.report = false;
    else if (arg.startsWith('--only=')) opts.only = arg.slice('--only='.length);
    else if (arg.startsWith('--')) throw new Error(`unknown option ${arg}`);
    else opts.paths.push(path.resolve(arg));
  }
  return opts;
};

const heading = (text: string) => console.log(`\n— ${text} —`);

const runFileMigrations = (
  preset: Preset,
  opts: Options,
  note: (key: string) => void
) => {
  const only = opts.only ? new Set(opts.only.split(',')) : null;
  const active = preset.migrations.filter(
    (m): m is FileMigration => m.kind === 'file' && (!only || only.has(m.name))
  );
  let changed = 0;

  for (const root of opts.paths) {
    const files = fs.statSync(root).isDirectory() ? walk(root) : [root];
    for (const file of files) {
      for (const migration of active) {
        if (!migration.match(file)) continue;
        const source = fs.readFileSync(file, 'utf8');
        const warn = (msg: string) =>
          console.log(`[${migration.name}] ${file} ${msg}`);
        const next = migration.run({
          source,
          manifest: preset.manifest,
          warn,
          note,
        });
        if (next === null) continue;
        changed += 1;
        console.log(`${opts.dry ? 'would update' : 'updated'} ${file}`);
        if (!opts.dry) fs.writeFileSync(file, next);
      }
    }
  }
  return changed;
};

const printChecklist = (preset: Preset, notes: Set<string>) => {
  heading('next steps');
  const items = [
    ...Object.entries(preset.conditionalChecklist)
      .filter(([key]) => notes.has(key))
      .map(([, text]) => text),
    ...preset.checklist,
  ];
  items.forEach((item, i) => console.log(`${i + 1}. ${item}`));
};

export const main = async (argv: string[]) => {
  const opts = parseArgs(argv);

  if (opts === 'help') {
    console.log(USAGE);
    return 0;
  }
  if (opts === 'list') {
    for (const preset of Object.values(presets)) {
      console.log(`${preset.name}  ${preset.description}`);
      for (const m of preset.migrations) {
        console.log(`  ${m.name.padEnd(18)} ${m.description}`);
      }
    }
    return 0;
  }

  const preset = getPreset(opts.preset!);
  if (opts.paths.length === 0) {
    console.log(USAGE);
    return 1;
  }

  if (!opts.dry && !opts.force) {
    const reasons = opts.paths.map(dirtyTreeReason).filter(Boolean);
    if (reasons.length > 0) {
      reasons.forEach((reason) => console.error(reason));
      console.error(
        'Re-run with --force to write anyway, or --dry to preview.'
      );
      return 1;
    }
  }

  const notesDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gamut-codemods-'));
  try {
    heading('source files');
    const result = await Runner.run(
      path.join(__dirname, 'transform.js'),
      opts.paths,
      {
        preset: preset.name,
        only: opts.only,
        notesDir,
        dry: opts.dry,
        extensions: 'ts,tsx,js,jsx,mjs,cjs,mts,cts',
        /* .d.ts stays in: Emotion theme augmentations import gamut-styles. */
        ignorePattern: ['**/node_modules/**', '**/dist/**', '**/build/**'],
        parser: 'tsx',
        babel: false,
        verbose: 0,
      }
    );

    const notes = new Set(fs.readdirSync(notesDir).map(decodeURIComponent));

    heading('package.json and .eslintrc');
    const changed = runFileMigrations(preset, opts, (key) => notes.add(key));
    console.log(`${changed} file(s) ${opts.dry ? 'would change' : 'changed'}`);

    if (opts.report && opts.dry) {
      heading(
        'leftovers skipped in --dry (nothing was written, so everything would show up)'
      );
    } else if (opts.report) {
      const hits = findLeftovers(opts.paths, preset.manifest);
      heading(`leftovers (${hits.length})`);
      hits.forEach((hit) =>
        console.log(`${hit.file}:${hit.line}  ${hit.text}`)
      );
    }

    if (!opts.dry) printChecklist(preset, notes);
    return result.error > 0 ? 1 : 0;
  } finally {
    fs.rmSync(notesDir, { recursive: true, force: true });
  }
};
