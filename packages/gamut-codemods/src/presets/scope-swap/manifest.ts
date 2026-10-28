import fs from 'node:fs';
import path from 'node:path';

import type { Manifest } from '../../lib/manifest';

/*
  What changed between @codecademy/gamut* and @skillsoft/gamut*. Every entry
  uses the OLD (@codecademy) names; scope-rename runs last and swaps the
  scope, so no other migration needs to know the new one.

  manifest.test.ts type-checks every export this file points at against the
  built packages, so a row can't reference an export that doesn't exist.
*/

/*
  This package is in the changesets `fixed` group with the packages it
  migrates to, so its own version is theirs.
*/
const { version } = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../../package.json'), 'utf8')
) as { version: string };

const GROUP_RANGE = `^${version}`;

export const manifest: Manifest = {
  packages: {
    '@codecademy/gamut': { to: '@skillsoft/gamut' },
    '@codecademy/gamut-styles': { to: '@skillsoft/gamut-styles' },
    '@codecademy/gamut-icons': { to: '@skillsoft/gamut-icons' },
    '@codecademy/gamut-illustrations': { to: '@skillsoft/gamut-illustrations' },
    '@codecademy/gamut-patterns': { to: '@skillsoft/gamut-patterns' },
    '@codecademy/gamut-tests': { to: '@skillsoft/gamut-tests' },
    '@codecademy/variance': { to: '@skillsoft/variance' },
    'eslint-plugin-gamut': { to: '@skillsoft/eslint-plugin-gamut' },
  },

  removedPackages: {
    '@codecademy/gamut-kit': {
      expandTo: [
        '@codecademy/gamut',
        '@codecademy/gamut-icons',
        '@codecademy/gamut-illustrations',
        '@codecademy/gamut-patterns',
        '@codecademy/gamut-styles',
        '@codecademy/gamut-tests',
        '@codecademy/variance',
      ],
      /* gamut-tests is test-only, so it has no business in a runtime share. */
      mfSharedAs: [
        '@codecademy/gamut',
        '@codecademy/gamut-icons',
        '@codecademy/gamut-illustrations',
        '@codecademy/gamut-patterns',
        '@codecademy/gamut-styles',
        '@codecademy/variance',
      ],
      note: 'gamut-kit is not published under @skillsoft. Depend on the individual packages instead.',
    },
  },

  targetVersions: {
    '@skillsoft/gamut': GROUP_RANGE,
    '@skillsoft/gamut-styles': GROUP_RANGE,
    '@skillsoft/gamut-icons': GROUP_RANGE,
    '@skillsoft/gamut-illustrations': GROUP_RANGE,
    '@skillsoft/gamut-patterns': GROUP_RANGE,
    '@skillsoft/gamut-tests': GROUP_RANGE,
    '@skillsoft/variance': GROUP_RANGE,
    /*
      Versioned outside the fixed group. manifest.test.ts fails if this
      falls behind packages/eslint-plugin-gamut/package.json.
    */
    '@skillsoft/eslint-plugin-gamut': '^0.0.1',
  },

  /*
    The upstream @codecademy release each package was forked from (the top
    of its CHANGELOG.md before any @skillsoft entries). Bump these when
    upstream changes are synced in.
  */
  sourceVersions: {
    '@codecademy/gamut': '73.6.1',
    '@codecademy/gamut-styles': '21.2.0',
    '@codecademy/gamut-icons': '10.2.0',
    '@codecademy/gamut-illustrations': '1.1.0',
    '@codecademy/gamut-patterns': '1.1.0',
    '@codecademy/gamut-tests': '7.1.0',
    '@codecademy/variance': '1.1.0',
    'eslint-plugin-gamut': '3.1.0',
  },

  movedExports: [
    {
      from: '@codecademy/gamut',
      to: '@codecademy/gamut/Video',
      names: ['Video', 'VideoProps'],
      note: 'Video is no longer on the root barrel. See packages/gamut/src/index.tsx.',
      checklist: 'video-peers',
    },
  ],

  deepImports: [],

  eslintPlugin: { from: 'gamut', to: '@skillsoft/gamut' },
};
