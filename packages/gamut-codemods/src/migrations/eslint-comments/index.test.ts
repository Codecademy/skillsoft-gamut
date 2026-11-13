import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { manifest } from '../../presets/scope-swap/manifest';
import { eslintComments } from '.';

const tmp = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'gamut-codemods-test-'));

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
