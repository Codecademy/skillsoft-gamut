import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

import { renameSpecifier } from '../lib/manifest';
import { presets } from '../presets';
import { manifest } from '../presets/scope-swap/manifest';

/*
  Guards against a manifest that promises something the packages don't
  deliver. Runs against the built dist, so `^build` has to run first
  (project.json wires that up).
*/

const REPO = path.join(__dirname, '../../../..');
const readJson = (file: string) =>
  JSON.parse(fs.readFileSync(path.join(REPO, file), 'utf8'));

/*
  Every name a manifest claims is importable from a new entry point:
  moved exports at their destination, and renamed deep-import exports at
  theirs. Written as one virtual file so tsc resolves it the way a
  consumer's bundler would, through the exports map.
*/
const importsToCheck = () => {
  const lines: string[] = [];
  for (const preset of Object.values(presets)) {
    const m = preset.manifest;
    for (const rule of m.movedExports) {
      lines.push(
        `import type { ${rule.names.join(', ')} } from '${renameSpecifier(
          m,
          rule.to
        )}';`
      );
    }
    for (const row of m.deepImports) {
      if (row.to && row.onlyNames) {
        lines.push(
          `import type { ${row.onlyNames.join(', ')} } from '${renameSpecifier(
            m,
            row.to
          )}';`
        );
      }
      if (!row.to || !row.renames) continue;
      lines.push(
        `import type { ${Object.values(row.renames).join(
          ', '
        )} } from '${renameSpecifier(m, row.to)}';`
      );
    }
  }
  return lines.join('\n');
};

describe('manifests', () => {
  it('only point at exports that exist in the built packages', () => {
    const file = path.join(
      REPO,
      'packages/gamut-codemods/__manifest-check__.ts'
    );
    const host = ts.createCompilerHost({});
    const source = importsToCheck();
    const readFile = host.readFile.bind(host);
    host.readFile = (f) => (f === file ? source : readFile(f));
    const fileExists = host.fileExists.bind(host);
    host.fileExists = (f) => f === file || fileExists(f);

    const program = ts.createProgram(
      [file],
      {
        noEmit: true,
        skipLibCheck: true,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        types: [],
      },
      host
    );
    const errors = ts
      .getPreEmitDiagnostics(program)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, '\n'));

    expect(errors).toEqual([]);
  });

  it('rename every package to one that exists in this repo', () => {
    const published = new Set(
      fs
        .readdirSync(path.join(REPO, 'packages'))
        .map((dir) => path.join(REPO, 'packages', dir, 'package.json'))
        .filter((file) => fs.existsSync(file))
        .map((file) => JSON.parse(fs.readFileSync(file, 'utf8')).name)
    );
    for (const { to } of Object.values(manifest.packages)) {
      expect(published).toContain(to);
    }
  });

  it('keep scope-swap target versions in step with the packages', () => {
    const { fixed } = readJson('.changeset/config.json') as {
      fixed: string[][];
    };
    const group =
      fixed.find((g) => g.includes('@skillsoft/gamut-codemods')) ?? [];
    const eslintPlugin = readJson('packages/eslint-plugin-gamut/package.json');

    for (const [pkg, range] of Object.entries(manifest.targetVersions)) {
      if (pkg === eslintPlugin.name) {
        expect(range).toBe(`^${eslintPlugin.version}`);
      } else {
        /* Versioned by the fixed group, which is what makes GROUP_RANGE right. */
        expect(group).toContain(pkg);
      }
    }
  });
});
