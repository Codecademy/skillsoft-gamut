---
'@skillsoft/eslint-plugin-gamut': patch
---

`configs.recommended` uses literal `'error'` severities, so the plugin type-checks as an ESLint `Plugin` in a typed flat config (`plugins: { gamut }`).
