import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { parseArgs } from '../cli';
import { findFlatEslintConfig } from '../lib/eslint';
import { dirtyTreeReason } from '../lib/git';
import { findLeftovers } from '../lib/leftovers';
import { isAtLeast, isNewerThan, minVersion } from '../lib/manifest';
import type { Migration } from '../lib/types';
import { markdownVideoOverrides } from '../migrations/markdown-video-overrides';
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
    const migration = (name: string, kind: 'ast' | 'splice') =>
      ({ name, kind, description: name } as Migration);
    expect(() =>
      validatePreset({
        ...scopeSwap,
        migrations: [
          migration('first-ast', 'ast'),
          migration('a-splice', 'splice'),
          migration('late-ast', 'ast'),
        ],
      })
    ).toThrow(/late-ast/);
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

describe('findFlatEslintConfig', () => {
  it('finds a flat config inside the target', () => {
    const dir = tmp();
    fs.mkdirSync(path.join(dir, 'libs', 'a'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'libs', 'a', 'eslint.config.mjs'), '');
    expect(findFlatEslintConfig([dir])).toBe(
      path.join(dir, 'libs', 'a', 'eslint.config.mjs')
    );
  });

  it('finds a flat config above the target', () => {
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

  it('returns null for a legacy .eslintrc repo', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, '.eslintrc.json'), '{}');
    expect(findFlatEslintConfig([dir])).toBeNull();
  });
});

describe('eslint-comments skipReason', () => {
  it('runs for legacy .eslintrc repos', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, '.eslintrc.json'), '{}');
    expect(eslintComments.skipReason?.([dir], manifest)).toBeNull();
  });

  it('skips when a flat config is inside the target', () => {
    const dir = tmp();
    fs.mkdirSync(path.join(dir, 'libs', 'a'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'libs', 'a', 'eslint.config.mjs'), '');
    expect(eslintComments.skipReason?.([dir], manifest)).toMatch(
      /flat ESLint config/
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

describe('isAtLeast', () => {
  it.each([
    ['74.0.0', true],
    ['^74.1.0', true],
    ['~75.0.0', true],
    ['73.6.3', false],
    ['^73.6.1', false],
    ['*', false],
  ])('%s >= 74.0.0 is %s', (range, expected) => {
    expect(isAtLeast(range, '74.0.0')).toBe(expected);
  });
});

describe('markdown-video-overrides skipReason', () => {
  const repo = (deps: Record<string, string>[]) => {
    const dir = tmp();
    deps.forEach((dependencies, i) => {
      const pkgDir = i === 0 ? dir : path.join(dir, 'libs', String(i));
      fs.mkdirSync(pkgDir, { recursive: true });
      fs.writeFileSync(
        path.join(pkgDir, 'package.json'),
        JSON.stringify({ dependencies })
      );
    });
    return dir;
  };

  it('skips when every pinned @codecademy/gamut is 74.0.0 or newer', () => {
    const dir = repo([
      { '@codecademy/gamut': '74.0.0' },
      { '@codecademy/gamut': '*' },
    ]);
    expect(markdownVideoOverrides.skipReason?.([dir], manifest)).toMatch(
      /already at 74\.0\.0/
    );
  });

  it('runs when any package is older than 74.0.0', () => {
    const dir = repo([
      { '@codecademy/gamut': '74.0.0' },
      { '@codecademy/gamut': '^73.6.1' },
    ]);
    expect(markdownVideoOverrides.skipReason?.([dir], manifest)).toBeNull();
  });

  it('runs when no version can be read', () => {
    const dir = repo([{ '@codecademy/gamut': '*' }]);
    expect(markdownVideoOverrides.skipReason?.([dir], manifest)).toBeNull();
  });
});

describe('findLeftovers: scoped directives under a flat config', () => {
  const directive =
    '// eslint-disable-next-line @skillsoft/gamut/no-inline-style';

  it('lists them when no file registers the scoped plugin key', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'eslint.config.ts'), 'plugins: { gamut }');
    fs.writeFileSync(path.join(dir, 'a.tsx'), directive);
    const hits = findLeftovers([dir], manifest, { eslintRuleKeys: false });
    expect(hits).toHaveLength(1);
    expect(hits[0].note).toMatch(/plugins key/);
  });

  it('leaves them alone when the plugin is registered under that key', () => {
    const dir = tmp();
    fs.writeFileSync(
      path.join(dir, 'eslint.config.ts'),
      "plugins: { '@skillsoft/gamut': gamut }"
    );
    fs.writeFileSync(path.join(dir, 'a.tsx'), directive);
    expect(findLeftovers([dir], manifest, { eslintRuleKeys: false })).toEqual(
      []
    );
  });

  it('is not checked for legacy configs', () => {
    const dir = tmp();
    fs.writeFileSync(path.join(dir, 'a.tsx'), directive);
    expect(findLeftovers([dir], manifest)).toEqual([]);
  });
});
