---
title: ESLint rules
description: Gamut-specific ESLint rules and what they enforce.
---

`eslint-plugin-gamut` enforces consistent styling patterns and correct Gamut usage across projects.

## `gamut/no-inline-style`

**Level:** `error`

Disallows inline `style` props on JSX elements — they can't be optimized by build tools and don't benefit from Gamut's design tokens. Use a styled component, system props, or a `states`-driven styled component instead:

```tsx
// Instead of:
<Alert style={{ width: isOpen ? '100%' : '50%' }} />

// Use system props:
<Box width={isOpen ? '100%' : '50%'} />
```

Disable it for third-party components that require inline styles, like framer-motion animations:

```tsx
// eslint-disable-next-line gamut/no-inline-style
<motion.div style={{ transformOrigin: 'center' }} />
```

## `gamut/no-css-standalone`

**Level:** `error`

Disallows importing standalone `.css`/`.scss` files — they bypass theming and can cause specificity conflicts. Use `css`, `variant`, or `states` from `gamut-styles` instead.

## `gamut/import-paths`

**Level:** `error` · Auto-fixable

Enforces three import conventions: use relative imports within the same package, and never append `/src` or `/dist` to a Gamut package import.

```tsx
// Instead of:
import { FillButton } from '@skillsoft/gamut/src';

// Use:
import { FillButton } from '@skillsoft/gamut';
```

## `gamut/no-raw-z-index`

**Level:** `error`

Discourages raw numeric `zIndex` values — in JSX props (`<Box zIndex={2} />`) and style objects (`zIndex`/`'z-index'` in `css()` or styled-component style objects) — in favor of semantic tokens from the [`zIndexes` scale](/foundations/z-index/):

```tsx
// Instead of:
<Box position="relative" zIndex={100} />;

// Use a semantic token:
import { zIndexes } from '@skillsoft/gamut-styles';

<Box position="relative" zIndex={zIndexes.foreground} />;
```

Disable it inline, with a comment justifying the choice, for a deliberate in-between value that doesn't map to an existing token:

```tsx
// eslint-disable-next-line gamut/no-raw-z-index -- must sit one layer below the legacy FCN nav (12)
<Box zIndex={11} />
```

## `gamut/prefer-themed`

**Level:** `off` by default · Auto-fixable

Suggests the `themed()` utility over reaching directly into `theme` inside a styled component, for better type safety:

```tsx
// Instead of:
const StyledDiv = styled.div`
  color: ${({ theme }) => theme.colors.primary};
`;

// Prefer:
const StyledBox = styled(Box)(css({ color: themed('colors.primary') }));
```

## Configuration

```js
// .eslintrc.js
module.exports = {
  plugins: ['eslint-plugin-gamut'],
  rules: {
    'gamut/no-inline-style': 'error',
    'gamut/no-css-standalone': 'error',
    'gamut/import-paths': 'error',
    'gamut/no-raw-z-index': 'error',
    'gamut/prefer-themed': 'off',
  },
};
```

Override a rule for specific files with `overrides`:

```js
module.exports = {
  overrides: [
    {
      files: ['packages/gamut-illustrations/**'],
      rules: { 'gamut/no-inline-style': 'off' },
    },
  ],
};
```
