# `eslint-plugin-gamut`

Recommended eslint plugins for all Gamut applications. ✨

## Usage

```tsx
// eslintrc.js

module.exports = {
  root: true,

  plugins: ['@skillsoft/gamut'],

  rules: {
    '@skillsoft/gamut/prefer-themed': 'error',
    '@skillsoft/gamut/no-css-standalone': 'error',
    '@skillsoft/gamut/import-paths': 'error',
    '@skillsoft/gamut/no-inline-style': 'error',
  },
};
```
