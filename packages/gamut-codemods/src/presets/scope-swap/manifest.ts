import type { Manifest } from '../../lib/manifest';

/*
  What changed between @codecademy/gamut* and @skillsoft/gamut*. Every entry
  uses the OLD (@codecademy) names; scope-rename runs last and swaps the
  scope, so no other migration needs to know the new one.

  manifest.test.ts type-checks every export this file points at against the
  built packages, so a row can't reference an export that doesn't exist.
*/

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

  removedPackages: {},

  targetVersions: {},

  sourceVersions: {},

  movedExports: [],

  deepImports: [],

  eslintPlugin: { from: 'gamut', to: '@skillsoft/gamut' },
};
