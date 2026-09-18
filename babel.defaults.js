// Shared across every package's babel.config.js. Every package extended this
// file already for the `ignore` patterns below; `presets` was previously
// re-declared byte-for-byte in all 7 of them (differing only in whether
// @emotion/babel-plugin was added). Babel's `extends` merges arrays rather
// than overriding them, so putting the shared presets here means each
// package's own config only needs to add what's actually different for it.
let ignorePatterns = [];

if (process.env.NODE_ENV !== 'test') {
  ignorePatterns = [
    ...ignorePatterns,
    '**/*.(test|spec).ts{,.snap}',
    '**/*.(test|spec).tsx',
    '**/tests/**/*',
    '**/__tests__',
    '**/__mocks__',
    '**/__fixtures__',
    './**/*.d.ts',
  ];
}

module.exports = {
  ignore: ignorePatterns,
  presets: [
    [
      '@babel/env',
      {
        modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false,
        targets: 'defaults',
      },
    ],
    [
      '@babel/react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ],
};
