---
'@skillsoft/gamut': patch
'@skillsoft/gamut-styles': patch
'@skillsoft/gamut-icons': patch
'@skillsoft/gamut-illustrations': patch
'@skillsoft/gamut-patterns': patch
'@skillsoft/gamut-tests': patch
'@skillsoft/variance': patch
---

Fewer packages to install by hand. `@skillsoft/gamut` now needs only `react`, `react-dom`, `@emotion/react`, and `@emotion/styled` alongside it.

- `@skillsoft/gamut-styles`: `stylis`, `lodash`, and `@emotion/cache` are now regular dependencies instead of peer dependencies.
- `@skillsoft/gamut-icons`: dropped an unused `lodash` peer dependency.
- `@skillsoft/variance`: the `typescript` peer dependency is now optional.
- `@skillsoft/*` packages depend on each other with `^` ranges instead of exact versions, so installs share one copy of `gamut-styles` and `variance`.
- `@skillsoft/gamut-tests`: `component-test-setup` is now `^0.3.1` instead of `*`.
- `@skillsoft/gamut`: `@types/marked` moved to devDependencies. The published types don't reference it.
