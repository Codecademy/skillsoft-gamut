import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { videoUsage } from '../lib/gamut-imports';
import { packageJson } from '../migrations/package-json';
import { manifest } from '../presets/scope-swap/manifest';

const dirWith = (files: Record<string, string>) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'video-peers-'));
  for (const [name, text] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), text);
  }
  return dir;
};

const uses = (files: Record<string, string>) => {
  const dir = dirWith(files);
  return videoUsage()(path.join(dir, 'package.json'));
};

describe('video usage', () => {
  it('counts an import of Video from the Video subpath', () => {
    expect(
      uses({ 'a.tsx': "import { Video } from '@skillsoft/gamut/Video';" })
    ).toBe(true);
  });

  it('counts a Video name imported from the root of either scope', () => {
    expect(
      uses({ 'a.tsx': "import { Box, Video } from '@skillsoft/gamut';" })
    ).toBe(true);
    expect(
      uses({
        'a.tsx':
          "import {\n  Video,\n  VideoProps,\n} from '@codecademy/gamut';",
      })
    ).toBe(true);
  });

  it('does not count gamut imports without Video', () => {
    expect(
      uses({ 'a.tsx': "import { Box, Text } from '@skillsoft/gamut';" })
    ).toBe(false);
    expect(
      uses({ 'a.tsx': "import { Markdown } from '@skillsoft/gamut';" })
    ).toBe(false);
  });

  it('does not count Video from other packages', () => {
    expect(uses({ 'a.tsx': "import { Video } from 'some-other-lib';" })).toBe(
      false
    );
  });
});

describe('vidstack and react-player', () => {
  const pkg = JSON.stringify({
    name: 'app',
    dependencies: { '@codecademy/gamut': '^73.0.0' },
  });
  const run = (usesVideo: boolean) =>
    JSON.parse(
      (packageJson.run as any)({
        source: pkg,
        manifest,
        warn: () => {},
        note: () => {},
        usesVideo: () => usesVideo,
      }) ?? pkg
    ).dependencies as Record<string, string>;

  it('are left out when the app does not use Video', () => {
    const deps = run(false);
    expect(deps).not.toHaveProperty('@vidstack/react');
    expect(deps).not.toHaveProperty('react-player');
    expect(deps).toHaveProperty('@skillsoft/gamut');
  });

  it('are added when the app uses Video', () => {
    const deps = run(true);
    expect(deps['@vidstack/react']).toBe('~1.12.12');
    expect(deps['react-player']).toBe('^3.4.0');
  });
});
