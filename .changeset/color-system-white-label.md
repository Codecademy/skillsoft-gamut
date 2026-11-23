---
'@skillsoft/gamut-brand': minor
'@skillsoft/gamut-styles': minor
---

Add `@skillsoft/gamut-brand`, for teams building their own brand on gamut, and give every brand its own `tokens.css`.

- `@skillsoft/gamut-brand` is new, and build-time only: install it as a dev dependency. `defineBrand({ name, hues })` types a brand, and `gamut-brand build <brand file>` writes its `values.ts`, `tokens.css` and DTCG JSON, refusing a brand that fails a contrast check. `--watch` regenerates when the brand file changes; `--check` fails CI when the files are out of date. The generator, the role table, the checks and gamut's own brands moved here from `@skillsoft/gamut-styles`.
- `createBrandTheme`, `BrandBase` and `BrandValues` are exported from `@skillsoft/gamut-styles`. `createBrandTheme(values, base)` turns a generated `values.ts` into a theme with the same type as gamut's own, so system props and styling functions stay typed against it.
- Each theme now carries only its own brand's colors. `GamutProvider` injects that brand's CSS, which puts its palette and its initial mode on `:root`, so a page starts in the right brand and mode without attributes on `<html>`. A brand's role overrides apply under a bare `data-color-mode` too.
- **Breaking:** the generated files moved to one folder per brand. Import `@skillsoft/gamut-styles/tokens/<brand>.css` for a brand's CSS (`tokens.css` is still the default brand) and `@skillsoft/gamut-styles/tokens/<brand>/{palette,light,dark}.tokens.json` for its DTCG files. `tokens/brands/*` is gone, and `brands` in `@skillsoft/gamut-styles/tokens` now includes the default brand.
- **Breaking:** `initialMode` moved from `createBrandTheme`'s second argument to the brand (`defineBrand({ initialMode: 'dark' })`), because the brand's CSS has to know it. `BrandBase` now requires gamut's font family and font weight keys.
- `platformTheme` now starts in dark mode in its CSS as well as in its theme, so a server-rendered page starts dark.
- The DTCG mode files include each brand's role overrides. They had the default roles for every brand.
