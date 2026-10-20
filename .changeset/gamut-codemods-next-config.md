---
'@skillsoft/gamut-codemods': minor
---

`scope-swap` now warns about `experimental.esmExternals: false` in `next.config.*`. `@skillsoft/gamut` ships strict-ESM `.mjs`, and with that flag Next `require()`s server externals, so `@emotion/styled` and `react-select` default imports fail while Next collects page data. The run ends with a checklist item to remove the flag and any aliases that were working around it.
