---
title: Creating a custom theme
description: Build your own brand with @skillsoft/gamut-brand and turn it into a theme with createBrandTheme.
---

## When to reach for this

Most apps should [choose an existing theme](/guides/theming-your-app/). Build your own only when a product needs its own colors, for example to white-label Gamut for a customer.

A custom theme has two parts:

- **A brand**: a few hues, which `@skillsoft/gamut-brand` turns into a palette, light and dark roles, and the CSS for them, all checked for contrast.
- **A theme**: the brand's generated values plus fonts, font weights and shadows, put together by `createBrandTheme` from `@skillsoft/gamut-styles`.

The result has the same type as Gamut's own themes, so every component, system prop and `css()` call works and stays type-checked. See [Color system](/concepts/color-system/) for how the generator works.

## 1. Install the generator

`@skillsoft/gamut-brand` runs at build time only, so install it as a dev dependency, on the same version as `@skillsoft/gamut-styles`:

```sh
yarn add -D @skillsoft/gamut-brand
```

## 2. Write the brand

Only `name` and `hues.primary` are required:

```ts
// src/theme/acme.brand.ts
import { defineBrand } from '@skillsoft/gamut-brand';

export default defineBrand({
  name: 'acme',
  hues: { primary: '#0A5CFF', accent: '#FFB000' },
});
```

`name` becomes the brand's `data-brand` attribute and its output folder: letters, digits and `_`, starting with a letter.

`hues` takes a hue in degrees, or a color to take the hue from, for each of eight slots: `primary`, `neutral-light`, `neutral-dark`, `accent`, `accent-alt`, `danger`, `warning` and `success`. Slots you leave out are filled in: neutrals from the primary's hue, and status and accent slots from Gamut's defaults, so red still means error.

Only a color's hue is kept. `#0A5CFF` means "this blue's hue", and the generator sets how light and how colorful each grade is, which is what keeps contrast the same for every brand. To start from one of Gamut's brands, spread it:

```ts
import { defineBrand, skillsoftBrand } from '@skillsoft/gamut-brand';

export default defineBrand({
  ...skillsoftBrand,
  name: 'acme',
  hues: { ...skillsoftBrand.hues, primary: '#0A5CFF' },
});
```

### Optional settings

- `initialMode: 'dark'` starts pages in dark mode. The default is `'light'`.
- `overrides` keeps colors the generator wouldn't produce. Use them sparingly; each one still goes through every check.

```ts
overrides: {
  // An exact color for one palette step. Pick the grade nearest its lightness.
  palette: { 'accent-300': '#FFB000' },
  // A role pointed at another palette color in one mode.
  roles: { dark: { 'action-primary': { slot: 'accent', grade: 300 } } },
  // A gradient's circles moved to another slot.
  gradients: { 'surface-brand': { accent: 'accent-alt' } },
},
```

`defineBrand` is typed, so a misspelled slot, role or palette step fails to compile.

## 3. Generate the files

```sh
gamut-brand build src/theme/acme.brand.ts
```

This writes `src/theme/acme/`:

| File                                                           | What it is                                                                        |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `values.ts`                                                    | The palette, roles and the brand's CSS as typed constants, for `createBrandTheme` |
| `tokens.css`                                                   | The brand's `--colors-*` and `--gradient-*` custom properties, and nothing else   |
| `palette.tokens.json`, `light.tokens.json`, `dark.tokens.json` | DTCG JSON for Figma and other design tools                                        |

Check the folder in, like any generated source.

A brand that fails a contrast check isn't written. The error names the check, its worst value and where:

```
refusing to generate "acme"; failed checks:
  text-inverse ≥ 4.5:1: 1.04 at light: action-primary
  action-primary ≥ 3:1: 1.04 at light: surface-sunken
```

Pick another hue, or change the override that caused it, and build again.

## 4. Keep the files current

Add the build to your scripts:

```json title="package.json"
{
  "scripts": {
    "brand": "gamut-brand build src/theme/acme.brand.ts",
    "brand:watch": "gamut-brand build src/theme/acme.brand.ts --watch",
    "brand:check": "gamut-brand build src/theme/acme.brand.ts --check"
  }
}
```

Run `--watch` next to your dev server. It regenerates when the brand file, or a file next to it, changes, and only rewrites files whose contents changed. Run `--check` in CI: it writes nothing, and fails when the files are out of date, including after an upgrade of `@skillsoft/gamut-brand`. `--out <dir>` writes somewhere other than a folder named after the brand.

## 5. Build the theme

`createBrandTheme` takes the generated values and everything about the brand that isn't color:

```ts
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

| Option        | What it sets                                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| `name`        | The theme's name                                                                                                  |
| `fontFamily`  | Every font family key Gamut uses. `percipioFontFamily` is Skillsoft's                                             |
| `fontWeight`  | Every font weight key, including `title`. `fontWeightMediumTitle` sets titles to 500                              |
| `elevation`   | How shadows are drawn. `softElevation` is the soft shadow; `offsetElevation` is Original Codecademy's hard offset |
| `borderRadii` | Optional. Defaults to Gamut's radii                                                                               |

Shadow colors come from the brand's `shadow-key` and `shadow-ambient` roles, so an elevation works with any brand.

## 6. Use it

Pass the theme to `GamutProvider`. It puts the brand's CSS on the page, so the app loads nothing else:

```tsx
<GamutProvider theme={acmeTheme}>
  <App />
</GamutProvider>
```

Declare the Emotion theme type once, as for any Gamut app. Every brand theme shares the `SkillsoftTheme` type:

```ts title="emotion.d.ts"
import '@emotion/react';
import type { SkillsoftTheme } from '@skillsoft/gamut-styles';

declare module '@emotion/react' {
  export interface Theme extends SkillsoftTheme {}
}
```

`<Box bg="surface-raised" />` then compiles, and `<Box bg="surface-raisd" />` doesn't.

A page without React loads the generated `acme/tokens.css` instead.

## Previewing in Gamut's Storybook

To preview a brand against real components in Gamut's own Storybook, add its theme to the theme switcher:

```tsx
// packages/.storybook/theming/GamutThemeProvider.tsx
const themeMap = {
  // ...Gamut's themes
  acme: acmeTheme,
} as const;
```

```ts
// packages/.storybook/preview.ts, under globalTypes.theme.toolbar.items
{ value: 'acme', title: 'Acme' },
```

## Best practices

- Supply as few hues as you need. Every hue you supply is one more you have to keep in step with your brand.
- Prefer a hue over an override. Overrides are for a color that has to be exact, such as a logo color.
- Use roles in your own code too, never palette colors. A palette color doesn't change with the mode.
- Check both modes in Storybook before shipping.
