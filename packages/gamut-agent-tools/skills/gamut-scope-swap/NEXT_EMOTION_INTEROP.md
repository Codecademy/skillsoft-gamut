# Next.js and Emotion default imports

Use this if a Next.js app fails after moving to `@skillsoft/gamut*`.

## Symptoms

- Production build or prerender fails with `Element type is invalid: expected a string ... but got: object`. This often comes from `SelectDropdown`, which uses `react-select`.
- The server fails in `_app` with `c(...) is not a function`.

## Cause

With `experimental.esmExternals: false`, Next `require()`s every server external package. `@skillsoft/gamut` and `@skillsoft/gamut-styles` ship strict ESM `.mjs` files. A default import of a CJS package that sets `__esModule` (`react-select`, `@emotion/styled`, `@emotion/cache`, `@emotion/is-prop-valid`) gets the whole module object instead of the default export.

## Fix: use native ESM externals

1. Remove `experimental.esmExternals: false` from `next.config.js`.
2. Remove any `resolve.alias` entries for `@emotion/is-prop-valid`, `@emotion/styled`, or `@emotion/cache`.
3. Remove `@emotion/*` and `react-select` from `transpilePackages`. Keep `@skillsoft/*` packages there if they ship CSS imports.

Next then loads externals with `import()`, so Node resolves each package's `import` entry and default imports work. To confirm, check that the server bundle emits `import("react-select")` instead of `require("react-select")`.

## Fallback: keep `esmExternals: false`

If the app can't drop `esmExternals: false` yet, point the Emotion packages at their ESM builds and transpile them:

```js
const path = require('path');

const emotionEsm = (pkg, file) =>
  path.join(path.dirname(require.resolve(`${pkg}/package.json`)), 'dist', file);

// Inside webpack(config, { isServer }), merge into resolve.alias:
'@emotion/is-prop-valid$': emotionEsm(
  '@emotion/is-prop-valid',
  'emotion-is-prop-valid.esm.js'
),
'@emotion/styled$': emotionEsm(
  '@emotion/styled',
  isServer ? 'emotion-styled.esm.js' : 'emotion-styled.browser.esm.js'
),
'@emotion/cache$': emotionEsm(
  '@emotion/cache',
  isServer ? 'emotion-cache.esm.js' : 'emotion-cache.browser.esm.js'
),
```

Add `@emotion/is-prop-valid`, `@emotion/styled`, `@emotion/cache`, and `react-select` to `transpilePackages`.

Plan to remove this fallback. It only exists to work around the `esmExternals` setting.
