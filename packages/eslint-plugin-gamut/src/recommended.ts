export default {
  rules: {
    '@skillsoft/gamut/no-css-standalone': 'error',
    '@skillsoft/gamut/no-inline-style': 'error',
    '@skillsoft/gamut/prefer-themed': 'error',
    '@skillsoft/gamut/import-paths': 'error',
    '@skillsoft/gamut/require-styled-target-for-selector': 'error',
  },
  /*
    Literal severities, so the export fits ESLint's Plugin type. As `string`,
    `plugins: { gamut }` in a typed flat config doesn't type-check.
  */
} as const;
