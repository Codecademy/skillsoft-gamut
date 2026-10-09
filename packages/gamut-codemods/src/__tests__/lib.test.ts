import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parseArgs } from '../cli';
import { dirtyTreeReason } from '../lib/git';
import { findLeftovers } from '../lib/leftovers';
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
    const [deep, moved, mf] = scopeSwap.migrations;
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
});
