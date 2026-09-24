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

  movedExports: [
    {
      from: '@codecademy/gamut',
      to: '@codecademy/gamut/Video',
      names: ['Video', 'VideoProps'],
      note: 'Video is no longer on the root barrel. See packages/gamut/src/index.tsx.',
    },
  ],

  /*
    From the GMT-1740 deep-import inventory. Rows are only added once the
    target is really exported; manifest.test.ts checks.
  */
  deepImports: [
    {
      from: '@codecademy/gamut/dist/PopoverContainer/types',
      to: '@codecademy/gamut',
    },
    {
      from: '@codecademy/gamut/dist/Form/SelectDropdown/types',
      to: '@codecademy/gamut',
    },
    { from: '@codecademy/gamut/dist/Form/types', to: '@codecademy/gamut' },
    {
      from: '@codecademy/gamut/dist/Box/props',
      to: '@codecademy/gamut',
      onlyNames: ['BoxProps', 'FlexBoxProps', 'GridBoxProps'],
    },
    {
      from: '@codecademy/gamut/dist/Tip/shared/types',
      to: '@codecademy/gamut',
    },
    {
      from: '@codecademy/gamut/dist/Button/shared',
      to: '@codecademy/gamut',
      onlyNames: ['ButtonBaseProps', 'ButtonProps', 'buttonProps'],
    },
    {
      from: '@codecademy/gamut/dist/Markdown/libs/overrides',
      to: '@codecademy/gamut',
      onlyNames: [
        'HTMLToReactNode',
        'MarkdownOverrideSetting',
        'MarkdownOverrideSettings',
        'createCodeBlockOverride',
        'createInputOverride',
        'createTagOverride',
        'createVideoOverride',
        'standardOverrides',
      ],
    },
    /*
      Renamed on the way to the root: `List` and `IconOption` collided with
      the public List component and IconOption type. This is the rename
      upstream GMT-1740 held back (upstream 009aa43f6); skillsoft-gamut
      ships it.
    */
    {
      from: '@codecademy/gamut/dist/Menu/elements',
      to: '@codecademy/gamut',
      renames: {
        List: 'MenuList',
        ListProps: 'MenuListProps',
        ListItem: 'MenuListItem',
        ListItemProps: 'MenuListItemProps',
        ListLink: 'MenuListLink',
        ListLinkProps: 'MenuListLinkProps',
        ListButton: 'MenuListButton',
      },
    },
    {
      from: '@codecademy/gamut/dist/Form/SelectDropdown/elements',
      to: '@codecademy/gamut',
      renames: { IconOption: 'IconOptionComponent' },
      onlyNames: ['IconOption'],
    },
    {
      from: '@codecademy/gamut/dist/ButtonBase/ButtonBase',
      to: null,
      note: 'ButtonBase is deliberately not public. Use FillButton, StrokeButton, TextButton, IconButton, or CTAButton.',
    },
    {
      from: '@codecademy/gamut/dist/Form/styles',
      to: '@codecademy/gamut',
      onlyNames: [
        'conditionalStyles',
        'formFieldPaddingStyles',
        'formFieldStyles',
      ],
      note: 'The rest of Form/styles is internal. Inline the styles, or use system props / css().',
    },
    {
      from: '@codecademy/gamut-styles/dist/AssetProvider',
      to: '@codecademy/gamut-styles',
    },
    {
      from: '@codecademy/gamut-icons/dist/types',
      to: '@codecademy/gamut-icons',
    },
    {
      from: '@codecademy/gamut-icons/dist/props',
      to: '@codecademy/gamut-icons',
      onlyNames: ['GamutIconProps', 'IconStyleProps'],
    },
    {
      from: '@codecademy/variance/dist/types/config',
      to: '@codecademy/variance',
    },
  ],

  eslintPlugin: { from: 'gamut', to: '@skillsoft/gamut' },
};
