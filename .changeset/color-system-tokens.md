---
'@skillsoft/gamut-styles': minor
'@skillsoft/gamut': minor
---

Add the generated color system from design's sandbox (gamut-sandbox PR #34).

- `@skillsoft/gamut-styles/tokens`, `/tokens.css` and `/tokens/*.tokens.json` export an OKLCH palette and 43 semantic roles in light and dark, as static CSS, DTCG JSON and TS constants. The `tokens` entry has no React or Emotion dependency.
- `skillsoftTheme` is the new default theme. Its color values come from `tokens.css`, which `GamutProvider` injects; pass `useTokens={false}` if the page loads `@skillsoft/gamut-styles/tokens.css` itself. The static file also works without React or Emotion.
- `Background` picks the content mode from a build-time table on generated themes, instead of measuring contrast at runtime.
- `Alert` follows design's mapping: status tints, an icon color per variant, and the brand gradient on Feature.
