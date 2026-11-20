# @skillsoft/gamut-brand

Builds a gamut color brand from a few hues. Give it a primary color, and optionally the other seven slots, and it writes the brand's palette, light and dark roles, `tokens.css`, DTCG JSON for Figma, and a typed `values.ts` for `createBrandTheme` in `@skillsoft/gamut-styles`. It refuses a brand that fails a contrast check and names the check.

It runs at build time only. Install it as a dev dependency; nothing in it reaches the browser. Apps on gamut's own themes don't need it.

The package is also where gamut's color system lives: the generator, the roles, the checks, and gamut's own five brands, which `@skillsoft/gamut-styles` builds its themes from.

## Build a brand

```sh
yarn add -D @skillsoft/gamut-brand
```

Write the brand. Only `name` and `hues.primary` are required:

```ts
// src/theme/acme.brand.ts
import { defineBrand } from '@skillsoft/gamut-brand';

export default defineBrand({
  name: 'acme',
  hues: { primary: '#0A5CFF', accent: '#FFB000' },
});
```

Generate its files:

```sh
gamut-brand build src/theme/acme.brand.ts
```

That writes `src/theme/acme/`:

| File                                                           | What it is                                                                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `values.ts`                                                    | The palette, roles, content modes and the brand's CSS as typed constants. `createBrandTheme` takes this module |
| `tokens.css`                                                   | `--color-*` and `--gradient-*` custom properties for this brand only, starting on `:root` in its initial mode  |
| `palette.tokens.json`, `light.tokens.json`, `dark.tokens.json` | DTCG 2025.10 for Figma and other tools. Each color is OKLCH with its hex alongside                             |

Check the files in, like any generated source. Then build the theme from them:

```tsx
// src/theme/index.ts
import {
  createBrandTheme,
  fontWeightMediumTitle,
  percipioFontFamily,
  softElevation,
} from '@skillsoft/gamut-styles';

import * as values from './acme/values';

export const acmeTheme = createBrandTheme(values, {
  name: 'acme',
  fontFamily: percipioFontFamily,
  fontWeight: fontWeightMediumTitle,
  elevation: softElevation,
});
```

```tsx
<GamutProvider theme={acmeTheme}>
  <App />
</GamutProvider>
```

`GamutProvider` injects the brand's CSS, so the app loads nothing else. A page without React loads `acme/tokens.css` instead.

## Keep it current

```sh
gamut-brand build src/theme/acme.brand.ts --watch   # regenerates when the brand file, or a file next to it, changes
gamut-brand build src/theme/acme.brand.ts --check   # writes nothing; exits 1 if acme/ is out of date
```

Run `--watch` next to your dev server; it only rewrites files whose contents changed, so the dev server reloads once per real change. Run `--check` in CI. `--out <dir>` puts the files somewhere other than a folder named after the brand.

## Types

Every brand has the same palette keys and the same 45 roles, so a theme from `createBrandTheme` has the same type as gamut's own themes. System props, `css()`, `variant()` and `states()` stay typed against it. Declare the Emotion theme once, as for any gamut app:

```ts
// emotion.d.ts
import '@emotion/react';
import type { SkillsoftTheme } from '@skillsoft/gamut-styles';

declare module '@emotion/react' {
  export interface Theme extends SkillsoftTheme {}
}
```

`<Box bg="surface-raised" />` then compiles and `<Box bg="surface-raisd" />` doesn't. The brand file is typed too: `defineBrand` rejects a slot, role or palette rung that doesn't exist.

## What a brand can set

| Field         | What it does                                                                                                                                                                |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`        | Becomes `data-brand` and the output folder's name. Letters, digits and `_`, starting with a letter                                                                          |
| `hues`        | A hue in degrees or a color to take the hue from, per slot: `primary` (required), `neutral-light`, `neutral-dark`, `accent`, `accent-alt`, `danger`, `warning`, `success`   |
| `initialMode` | `'light'` (default) or `'dark'`: the mode `tokens.css` puts on `:root` and the theme starts in                                                                              |
| `overrides`   | Exact colors the generator wouldn't produce: a pinned palette rung, a role pointed at another palette color in one mode, or a gradient moved to another slot. Still checked |

Only a color's hue is kept. `#0A5CFF` means "this blue's hue"; every grade's lightness is fixed, so contrast between grades is the same for every brand. To keep an exact color, pin it with `overrides.palette`.

Slots a brand leaves out are filled in: missing neutrals from the primary's hue, and missing status and accent slots from gamut's defaults. `createColorSystem(brand).brand.derived` says where each came from.

To start from one of gamut's brands, spread it:

```ts
import { defineBrand, skillsoftBrand } from '@skillsoft/gamut-brand';

export default defineBrand({
  ...skillsoftBrand,
  name: 'acme',
  hues: { ...skillsoftBrand.hues, primary: '#0A5CFF' },
});
```

## When a brand is refused

The build checks every text role against 4.5:1 and every border and icon role against 3:1 on the surfaces each is meant for, checks hover and selection veils on what they produce over each surface, keeps the three status colors apart, and checks 204 text and icon pairings inside 25 real components. It runs every check again on its own `tokens.css` read back, so what ships is what was checked.

A failure names the check, its worst value and where:

```
refusing to generate "acme"; failed checks:
  text-inverse ≥ 4.5:1: 1.04 at light: action-primary
  action-primary ≥ 3:1: 1.04 at light: surface-sunken
```

That brand pinned `primary-800` to a near-white, so the primary button lost its contrast.

Pick another hue, or pin the color with an override, and build again. Color-blindness separation is reported, not enforced.

## The API

The CLI is a thin layer over these, for build scripts that generate several brands:

| Export                                                                                      | What it does                                                                |
| ------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `defineBrand(brand)`                                                                        | Types a brand and returns it                                                |
| `generateBrand(brand)`                                                                      | Checks the brand and returns its files as strings; throws `BrandCheckError` |
| `writeBrand(brand, dir)`                                                                    | Writes the files that changed; returns their paths                          |
| `staleFiles(brand, dir)`                                                                    | The files in `dir` that are missing or out of date                          |
| `createColorSystem(brand)`, `validate(system)`                                              | The generator and its checks, for tooling that wants the numbers            |
| `skillsoftBrand`, `originalCodecademyBrand`, `adminBrand`, `platformBrand`, `lxStudioBrand` | gamut's own brands                                                          |

`@skillsoft/gamut-styles`' `build:tokens` script uses `writeBrand` for gamut's five brands.

## How the generator works

```
brands/skillsoft.ts         one hue per slot (or just `primary`)
  → brand.ts                fills missing slots, reports the white-label tier
  → ramp.ts                 11 grades per slot: fixed L, chroma as % of gamut
  → roles.ts                45 roles, light + dark, named by slot not hue
  → system.ts               resolved system, overrides applied
  → contentModes.ts         which mode's content goes on each color
  → validate.ts / probe.ts  contrast guarantees, veil floors, status trio
  → migration.ts            design's old → new map and component slots, checked per brand
  → emit.ts                 DTCG 2025.10 JSON + values.ts
  → generate.ts             Style Dictionary → tokens.css, read back and checked again
```

`src/__tests__/generator.test.ts` holds the rules: every grade's lightness, chroma inside sRGB, the separation guarantee at every hue, one role mapping for every brand, and every check passing for gamut's brands and for a primary at every 5° of hue.

After changing the generator, regenerate gamut's brands and review the diff:

```sh
npx nx test gamut-brand
yarn workspace @skillsoft/gamut-styles build:tokens      # rewrites src/tokens/generated
yarn workspace @skillsoft/gamut-styles validate:tokens   # full report for gamut's brands
```

## Naming

- Primitives: `--color-palette-<slot>-<grade>`, for example `--color-palette-primary-800`. Not for components; use roles.
- Translucent primitives: `--color-palette-primary-600-a6` (6% alpha), `--color-black-a60`.
- Roles: `--color-<role>`, for example `--color-action-primary`.
- `white` and `black` keep their bare names (boundary tokens).

The `--color-` prefix on primitives matches variance's `addColors`, which emits `--color-<key>`. One name for both the Emotion and CSS routes beat the shorter `--palette-*`.

## Known gaps

- There's no categorical solver. `viz-1` to `viz-8` use a slot and grade order solved for Skillsoft's hues; another brand gets that order unsolved, and categorical separation isn't checked.
- The theme carries sRGB copies of the values, because `BarChart` runs polished on them and polished can't parse `oklch()`.
- `tokens.css` needs `oklch()` and `color-mix()`. The hex fallback for older browsers isn't built yet.
