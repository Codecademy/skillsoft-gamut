# `eslint-plugin-gamut`

Recommended eslint plugins for all Gamut applications. ✨

## Usage

```tsx
// eslintrc.js

module.exports = {
  root: true,

  extends: ['plugin:@skillsoft/gamut/recommended'],

  plugins: ['@skillsoft/gamut'],
};
```

`plugin:@skillsoft/gamut/recommended` enables `prefer-themed`, `no-css-standalone`,
`no-inline-style`, and `import-paths` as errors. Override or add individual rules under
`rules` as needed, e.g. to enable `no-kbd-element` (off by default, since it only applies
to MDX content):

```tsx
rules: {
  '@skillsoft/gamut/no-kbd-element': 'error',
},
```
