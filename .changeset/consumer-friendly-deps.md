---
'@skillsoft/gamut': patch
'@skillsoft/gamut-styles': patch
'@skillsoft/gamut-icons': patch
'@skillsoft/gamut-illustrations': patch
'@skillsoft/gamut-patterns': patch
'@skillsoft/gamut-tests': patch
'@skillsoft/variance': patch
---

Fewer packages to install by hand.

- `@skillsoft/gamut-styles`:
  - `lodash` is now a regular dependency instead of a peer dependency.
  - adds `csstype` as a dependency. The published types import from it, and it only resolved before because `@skillsoft/variance` depends on it.
- `@skillsoft/gamut-icons`: dropped an unused `lodash` peer dependency.
- `@skillsoft/variance`: the `typescript` peer dependency is now optional.
- `@skillsoft/*` packages depend on each other with `^` ranges instead of exact versions, so installs share one copy of `gamut-styles` and `variance`.
- `@skillsoft/gamut-tests`: `component-test-setup` is now `^0.3.1` instead of `*`.
