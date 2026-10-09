module.exports = {
  root: true,

  extends: [
    require.resolve('@codecademy/eslint-config'),
    'plugin:react/jsx-runtime',
    'plugin:@skillsoft/gamut/recommended',
  ],

  plugins: ['@skillsoft/gamut'],

  ignorePatterns: ['packages/code-connect/**/*'],

  settings: {
    'import/parsers': {
      [require.resolve('@typescript-eslint/parser')]: [
        '.ts',
        '.cts',
        '.mts',
        '.tsx',
        '.js',
        '.jsx',
        '.mjs',
        '.cjs',
      ],
    },
  },

  rules: {
    'import/no-extraneous-dependencies': 'off',
  },

  overrides: [
    {
      files: ['**/typings/*', '*.d.ts'],
      rules: {
        '@typescript-eslint/no-namespace': 'off',
      },
    },
    {
      files: ['*.mdx'],
      rules: {
        '@skillsoft/gamut/import-paths': 'off',
      },
    },
    {
      // We need to override them here, because as a result of the `extends` command pulling
      // in additional plugins, the base rules settings of turning this rules off were NOT
      // being respected. By moving them into this override definition, they are properly
      // being applied to subsequent plugin imports/extensions. Wild.
      files: ['*.tsx', '*.ts'],
      rules: {
        // Bundlers (esbuild/Vite dev, tsdown/rolldown) elide type-only
        // imports based on per-file usage heuristics, not full type info.
        // A value-imported type re-exported via `export type {}` can look
        // used to the heuristic, get preserved as a runtime import, and
        // crash at runtime since the source has no matching runtime export.
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'separate-type-imports',
            disallowTypeAnnotations: false,
          },
        ],
        '@typescript-eslint/no-empty-object-type': [
          'error',
          {
            allowInterfaces: 'with-single-extends',
            allowObjectTypes: 'always',
          },
        ],
        'no-void': ['error', { allowAsStatement: true }],
        // These rules could be useful, but we haven't gotten around to enabling them here
        // See WEB-2 for general tracking.
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        'import/no-cycle': 'off',
        'react/no-unknown-property': [
          'error',
          { ignore: ['mask-type', 'xmlns-x', 'xmlns-i', 'xmlns-graph'] },
        ],
        'react/jsx-sort-props': [
          1,
          {
            callbacksLast: true,
          },
        ],
      },
    },
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      plugins: ['lodash'],
      rules: {
        'lodash/import-scope': ['error', 'method'],
      },
    },
    {
      files: ['packages/gamut-illustrations/**'],
      rules: {
        '@skillsoft/gamut/no-inline-style': 'off',
      },
    },
    {
      files: ['packages/styleguide/**/*.mdx'],
      rules: {
        '@skillsoft/gamut/no-kbd-element': 'error',
      },
    },
  ],
};
