import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { manifest } from '../../presets/scope-swap/manifest';
import { markdownVideoOverrides } from '.';

const tmp = () =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'gamut-codemods-test-'));

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
