import fs from 'node:fs';
import path from 'node:path';

import { applyTransform } from 'jscodeshift/src/testUtils';

import { presets } from '../presets';
import * as transform from '../transform';

/*
  Fixture-driven. Every `<case>.input.<ext>` in a migration's
  __testfixtures__ runs through that migration alone and must match
  `<case>.output.<ext>`. An optional `<case>.warnings.json` lists substrings
  that must each appear in some warning. `{{version}}` in an output stands
  for this package's version. Adding a case means adding files, not code.
*/

const { version } = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../package.json'), 'utf8')
) as { version: string };

interface Case {
  name: string;
  ext: string;
  input: string;
  output: string;
  warnings: string[];
}

const readCases = (dir: string): Case[] => {
  if (!fs.existsSync(dir)) return [];
  const read = (f: string) => fs.readFileSync(path.join(dir, f), 'utf8');
  return fs
    .readdirSync(dir)
    .filter((f) => f.includes('.input.'))
    .map((input) => {
      const [name, ext] = input.split('.input.');
      const warnings = `${name}.warnings.json`;
      return {
        name,
        ext,
        input: read(input),
        output: read(`${name}.output.${ext}`).replace(/{{version}}/g, version),
        warnings: fs.existsSync(path.join(dir, warnings))
          ? (JSON.parse(read(warnings)) as string[])
          : [],
      };
    });
};

const fixtureDir = (migration: string) =>
  path.join(__dirname, '../migrations', migration, '__testfixtures__');

const expectWarnings = (actual: string[], expected: string[]) => {
  for (const needle of expected) {
    expect(actual.join('\n')).toContain(needle);
  }
};

const runSource = (preset: string, source: string, only?: string) => {
  const warnings: string[] = [];
  const out = applyTransform(
    transform,
    { preset, only, onWarn: (w: string) => warnings.push(w) },
    { source, path: 'fixture.tsx' },
    { parser: 'tsx' }
  );
  return { out: out || source, warnings };
};

describe.each(Object.values(presets))('preset $name', (preset) => {
  for (const migration of preset.migrations) {
    const cases = readCases(fixtureDir(migration.name));
    if (cases.length === 0) continue;

    describe(migration.name, () => {
      it.each(cases)('$name', (c) => {
        if (migration.kind === 'file') {
          const warnings: string[] = [];
          const out = migration.run({
            source: c.input,
            manifest: preset.manifest,
            warn: (w) => warnings.push(w),
            note: () => {},
          });
          expect((out ?? c.input).trim()).toBe(c.output.trim());
          expectWarnings(warnings, c.warnings);
          return;
        }

        const { out, warnings } = runSource(
          preset.name,
          c.input,
          migration.name
        );
        expect(out.trim()).toBe(c.output.trim());
        expectWarnings(warnings, c.warnings);

        /* Idempotent: a second run over the output changes nothing. */
        expect(
          runSource(preset.name, c.output, migration.name).out.trim()
        ).toBe(c.output.trim());
      });
    });
  }

  const endToEnd = readCases(path.join(__dirname, '__testfixtures__'));
  if (endToEnd.length > 0) {
    it.each(endToEnd)('every migration: $name', (c) => {
      expect(runSource(preset.name, c.input).out.trim()).toBe(c.output.trim());
    });
  }
});
