import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parseArgs } from '../cli';
import { findFlatEslintConfig } from '../lib/eslint';
import { dirtyTreeReason } from '../lib/git';
import { findLeftovers } from '../lib/leftovers';
import { isNewerThan, minVersion } from '../lib/manifest';
import { eslintComments } from '../migrations/eslint-comments';
import { validatePreset } from '../presets';
import { scopeSwap } from '../presets/scope-swap';
import { manifest } from '../presets/scope-swap/manifest';

const tmp = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'gamut-codemods-test-'));

describe('validatePreset', () => {
  it('accepts scope-swap', () => {
    expect(() => validatePreset(scopeSwap)).not.toThrow();
  });

  it('rejects an ast migration listed after a splice one', () => {
    const [deep, moved, mf] = [
      'deep-imports',
      'moved-exports',
      'mf-shared',
    ].map((name) => scopeSwap.migrations.find((m) => m.name === name)!);
    expect(() =>
      validatePreset({ ...scopeSwap, migrations: [deep, mf, moved] })
    ).toThrow(/moved-exports/);
  });
});

describe('parseArgs', () => {
  it('reads a preset, paths, and flags', () => {
    expect(
      parseArgs(['scope-swap', 'a', '--dry', '--only=scope-rename'])
    ).toEqual(
      expect.objectContaining({
        preset: 'scope-swap',
        paths: [path.resolve('a')],
        dry: true,
        force: false,
        only: 'scope-rename',
      })
    );
  });

  it('rejects unknown flags', () => {
    expect(() => parseArgs(['scope-swap', 'a', '--drry'])).toThrow(/--drry/);
  });
});

describe('dirtyTreeReason', () => {
  const git = (cwd: string, ...args: string[]) =>
    execFileSync('git', args, { cwd, stdio: 'ignore' });

  it('refuses outside a git repo, and on uncommitted changes', () => {
    const dir = tmp();
    expect(dirtyTreeReason(dir)).toMatch(/not inside a git repository/);

    git(dir, 'init', '-q');
    fs.writeFileSync(path.join(dir, 'a.ts'), '');
    expect(dirtyTreeReason(dir)).toMatch(/uncommitted changes/);

    git(dir, 'add', '-A');
    git(dir, '-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'x');
    expect(dirtyTreeReason(dir)).toBeNull();
  });
});

describe('findLeftovers', () => {
  it('finds old names but not new names that contain them', () => {
    const dir = tmp();
    fs.writeFileSync(
      path.join(dir, 'a.js'),
      [
        "moduleNameMapper: { '^@codecademy/gamut(.*)$': 'x' }",
        "'@skillsoft/eslint-plugin-gamut'",
        "'@skillsoft/gamut-styles'",
        "'@codecademy/gamut-kit'",
      ].join('\n')
    );
    expect(findLeftovers([dir], manifest).map((h) => h.line)).toEqual([1, 4]);
  });

  it('tags every old package the manifest replaces, including gamut-kit', () => {
    const dir = tmp();
    const old = [
      ...Object.keys(manifest.packages),
      ...Object.keys(manifest.removedPackages),
    ];
    fs.writeFileSync(
      path.join(dir, 'README.md'),
      old.map((name) => `import x from '${name}/dist/x';`).join('\n')
    );
    expect(findLeftovers([dir], manifest).map((h) => h.line)).toEqual(
      old.map((_, i) => i + 1)
    );
  });

  it('flags /dist paths into published packages only', () => {
    const dir = tmp();
    fs.writeFileSync(
      path.join(dir, 'README.md'),
      [
        "import { X } from '@codecademy/gamut-styles/dist/AssetProvider';",
        "import { Y } from '@codecademy/gamut-foo/dist/bar';",
        "import { Z } from '@skillsoft/gamut-styles/dist/bar';",
      ].join('\n')
    );
    expect(findLeftovers([dir], manifest).map((h) => h.line)).toEqual([1]);
  });

  it('reads editor config and extensionless scripts', () => {
    const dir = tmp();
    const line = "require('@codecademy/gamut-kit/package.json');";
    fs.writeFileSync(
      path.join(dir, 'sync-deps'),
      `#!/usr/bin/env node\n${line}`
    );
    fs.writeFileSync(path.join(dir, 'LICENSE'), line);
    fs.writeFileSync(path.join(dir, 'rules.mdc'), line);
    fs.writeFileSync(path.join(dir, 'react.code-snippets'), line);
    expect(
      findLeftovers([dir], manifest)
        .map((h) => path.basename(h.file))
        .sort()
    ).toEqual(['react.code-snippets', 'rules.mdc', 'sync-deps']);
  });

  it('skips quoted rule keys when told the repo uses a flat config', () => {
    const dir = tmp();
    fs.writeFileSync(
      path.join(dir, 'eslint.config.ts'),
      [
        "rules: { 'gamut/no-inline-style': 'error' },",
        "import gamut from '@codecademy/eslint-plugin-gamut';",
        "import gamut from 'eslint-plugin-gamut';",
      ].join('\n')
    );
    expect(findLeftovers([dir], manifest).map((h) => h.line)).toEqual([1, 3]);
    expect(
      findLeftovers([dir], manifest, { eslintRuleKeys: false }).map(
        (h) => h.line
      )
    ).toEqual([3]);
  });
});

describe('eslint-comments skipReason', () => {
  it('runs for legacy .eslintrc repos', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, '.eslintrc.json'), '{}');
    expect(eslintComments.skipReason?.([dir])).toBeNull();
  });

  it('skips when a flat config is inside the target', () => {
    const dir = tmp();
    fs.mkdirSync(path.join(dir, 'libs', 'a'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'libs', 'a', 'eslint.config.mjs'), '');
    expect(findFlatEslintConfig([dir])).toBe(
      path.join(dir, 'libs', 'a', 'eslint.config.mjs')
    );
    expect(eslintComments.skipReason?.([dir])).toMatch(/flat ESLint config/);
  });

  it('skips when the target is under a flat-config repo', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'eslint.config.ts'), '');
    fs.mkdirSync(path.join(dir, 'src'));
    fs.writeFileSync(path.join(dir, 'src', 'a.tsx'), '');
    expect(findFlatEslintConfig([path.join(dir, 'src')])).toBe(
      path.join(dir, 'eslint.config.ts')
    );
    expect(findFlatEslintConfig([path.join(dir, 'src', 'a.tsx')])).toBe(
      path.join(dir, 'eslint.config.ts')
    );
  });
});

describe('isNewerThan', () => {
  it.each([
    ['74.0.0', '73.6.1', true],
    ['^73.7.0', '73.6.1', true],
    ['~73.6.2', '73.6.1', true],
    ['npm:@codecademy/gamut@74.0.0', '73.6.1', true],
    ['73.6.1', '73.6.1', false],
    ['^73.0.0', '73.6.1', false],
    ['74.0.0-alpha.1', '74.0.0', false],
    ['*', '73.6.1', false],
    ['workspace:*', '73.6.1', false],
    ['https://example.com/gamut.tgz', '73.6.1', false],
  ])('%s vs %s -> %s', (range, version, expected) => {
    expect(isNewerThan(range, version)).toBe(expected);
  });

  it('reads the lowest version a range allows', () => {
    expect(minVersion('>= 1.2.3')).toEqual([1, 2, 3]);
    expect(minVersion('latest')).toBeNull();
  });
});
