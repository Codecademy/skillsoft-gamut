import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import jscodeshift from 'jscodeshift';

import { parseArgs } from '../cli';
import { dirtyTreeReason } from '../lib/git';
import { findLeftovers } from '../lib/leftovers';
import type { Manifest } from '../lib/manifest';
import { deepImports } from '../migrations/deep-imports';
import { validatePreset } from '../presets';
import { scopeSwap } from '../presets/scope-swap';
import { manifest } from '../presets/scope-swap/manifest';

const tmp = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'gamut-codemods-test-'));

describe('deep-imports renames', () => {
  /* scope-swap has no rename rows today, so this uses its own manifest. */
  it('renames the export and keeps the local binding', () => {
    const j = jscodeshift.withParser('tsx');
    const root = j(
      "import { List, ListItem as Item } from '@codecademy/gamut/dist/Menu/elements';"
    );
    const withRenames: Manifest = {
      ...manifest,
      deepImports: [
        {
          from: '@codecademy/gamut/dist/Menu/elements',
          to: '@codecademy/gamut',
          renames: { List: 'MenuList', ListItem: 'MenuListItem' },
        },
      ],
    };
    deepImports.run({
      j,
      root,
      source: '',
      manifest: withRenames,
      warn: () => {},
      note: () => {},
    });
    expect(root.toSource({ quote: 'single' })).toBe(
      "import { MenuList as List, MenuListItem as Item } from '@codecademy/gamut';"
    );
  });
});

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
});
