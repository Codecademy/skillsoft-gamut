import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { findFlatEslintConfig } from './eslint';

const tmp = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'gamut-codemods-test-'));

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
