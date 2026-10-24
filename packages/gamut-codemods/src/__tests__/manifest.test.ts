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
  const byModule = new Map<string, Set<string>>();
  const add = (spec: string | null, names: string[]) => {
    if (!spec) return;
    const set = byModule.get(spec) ?? new Set<string>();
    names.forEach((name) => set.add(name));
    byModule.set(spec, set);
  };
  for (const preset of Object.values(presets)) {
    const m = preset.manifest;
    for (const rule of m.movedExports) {
      add(renameSpecifier(m, rule.to), rule.names);
    }
    for (const row of m.deepImports) {
      if (!row.to) continue;
      const to = renameSpecifier(m, row.to);
      if (row.onlyNames) {
        add(
          to,
          row.onlyNames.map((name) => row.renames?.[name] ?? name)
        );
      }
      if (row.renames) add(to, Object.values(row.renames));
    }
  }
  return [...byModule]
    .map(
      ([spec, names]) =>
        `import type { ${[...names].join(', ')} } from '${spec}';`
    )
    .join('\n');
};

/* `@codecademy/gamut/dist/Form/styles` -> packages/gamut/src/Form/styles(.ts|/index.tsx|...) */
const sourceModuleFor = (deepPath: string) => {
  const match = /^@codecademy\/([\w-]+)\/dist\/(.+)$/.exec(deepPath);
  if (!match) return null;
  const base = path.join(REPO, 'packages', match[1], 'src', match[2]);
  return (
    ['.ts', '.tsx', '/index.ts', '/index.tsx']
      .map((ext) => base + ext)
      .find((file) => fs.existsSync(file)) ?? null
  );
};

/* Export names of each module specifier, resolved like a bundler would. */
const exportsOf = (specifiers: string[]) => {
  const file = path.join(REPO, 'packages/gamut-codemods/__exports-check__.ts');
  const source = specifiers
    .map((spec, i) => `import * as m${i} from '${spec}';`)
    .join('\n');
  const host = ts.createCompilerHost({});
  const readFile = host.readFile.bind(host);
  host.readFile = (f) => (f === file ? source : readFile(f));
  const fileExists = host.fileExists.bind(host);
  host.fileExists = (f) => f === file || fileExists(f);
  const program = ts.createProgram(
    [file],
    {
      noEmit: true,
      skipLibCheck: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      types: [],
    },
    host
  );
  const checker = program.getTypeChecker();
  const imports = program
    .getSourceFile(file)!
    .statements.filter(ts.isImportDeclaration);
  return specifiers.map((_, i) => {
    const symbol = checker.getSymbolAtLocation(imports[i].moduleSpecifier);
    return new Set(
      symbol ? checker.getExportsOfModule(symbol).map((s) => s.name) : []
    );
  });
};

describe('manifests', () => {
  /*
    A deep-import row sends every name imported from `from` to `to`, so
    everything `from` exports has to be available there: directly, via
    `renames`, or be left out on purpose by listing what is public in
    `onlyNames`. Otherwise the codemod writes imports that don't compile.
  */
  it('only rewrite deep imports whose names all exist at the target', () => {
    const rows = manifest.deepImports.filter((row) => row.to && !row.onlyNames);
    const sources = rows.map((row) => sourceModuleFor(row.from));
    const targets = rows.map((row) => renameSpecifier(manifest, row.to!)!);
    const found = exportsOf([
      ...sources.map((s) => s ?? 'missing'),
      ...targets,
    ]);

    const problems = rows.flatMap((row, i) => {
      if (!sources[i]) return [`${row.from}: no source module found`];
      const available = found[rows.length + i];
      const missing = [...found[i]]
        .map((name) => row.renames?.[name] ?? name)
        .filter((name) => !available.has(name));
      return missing.length
        ? [`${row.from} -> ${targets[i]}: missing ${missing.join(', ')}`]
        : [];
    });

    expect(problems).toEqual([]);
  });

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
