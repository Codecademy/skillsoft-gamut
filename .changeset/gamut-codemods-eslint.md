---
'@skillsoft/gamut-codemods': minor
---

`scope-swap` now updates the ESLint plugin prefix from `gamut/` to `@skillsoft/gamut/` in legacy `.eslintrc` / `.eslintrc.json` files (plugin name, `plugin:` extends, and rule keys). Under a flat config the prefix is the key the plugin is registered under, so directive comments are left as is and the run says why.
