import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { manifest } from '../presets/scope-swap/manifest';
import { findLeftovers } from './leftovers';

const tmp = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'gamut-codemods-test-'));

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
