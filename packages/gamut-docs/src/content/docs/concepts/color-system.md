---
title: Color system
description: How Gamut generates its colors from a few brand hues, checks them, and ships them as roles for light and dark mode.
---

Gamut's colors come from a generator in `@skillsoft/gamut-styles`. A brand supplies a few hues. The generator turns them into a palette, maps the palette onto named roles for light and dark mode, checks every pairing for contrast, and writes the result as CSS, JSON and TypeScript. Components and app code use the role names.

This page covers the generated system. The [Color modes](/concepts/color-modes/) page still describes the older alias names (`text`, `background`, `primary`).

## How it works

Each step feeds the next one:

1. A brand names a hue for each slot.
2. The generator builds a palette of 11 grades per slot.
3. Roles point at palette colors, once per mode.
4. The build checks contrast and stops if anything fails.
5. The build writes `tokens.css`, DTCG JSON and TypeScript constants.
6. `GamutProvider` puts `tokens.css` on the page.
7. HTML attributes pick the mode and the brand.

The generator lives in `packages/gamut-styles/src/colorSystem/`, and its output is checked in at `packages/gamut-styles/src/tokens/generated/`.

### Brand inputs

A brand is a `BrandInput` object with a name and a hue for each of eight slots. A new brand needs only this object, with no hand-written theme or alias table. The slots are:

- `neutral-light` and `neutral-dark`, for surfaces, text and borders
- `primary`, for actions, links and focus rings
- `accent` and `accent-alt`, for brand gradients and charts
- `danger`, `warning` and `success`, for status

Only `primary` is required. A brand that leaves out its neutrals gets neutrals derived from the primary hue. A brand that leaves out a status or accent slot gets Gamut's default hue for it, so red still means error.

The generator keeps only the hue of each input. `#3A10E5` means "this blue-violet hue", and the generator decides how light and how colorful each step is.

```ts
export const originalCodecademyBrand: BrandInput = {
  name: 'originalCodecademy',
  hues: {
    'neutral-light': '#FFF0E5',
    'neutral-dark': '#10162F',
    primary: '#3A10E5',
    accent: '#FFD300',
    // ...
  },
};
```

When a brand has to keep an exact color the generator wouldn't produce, it can add overrides. An override pins a palette step to a hex value, points a role at a different palette color in one mode, or moves a gradient's colors to another slot. Original Codecademy uses overrides to keep its exact yellow and to make dark mode's primary action yellow. Its navy and beige aren't pinned: exact, they carry far more chroma than the generated surfaces next to them, so the generated steps at their hues are used instead. Overrides go through the same checks as everything else.

Six brands ship today:

- `skillsoft`, the default. Its theme is `skillsoftTheme`.
- `originalCodecademy`, the old Core theme rebuilt as a brand. Its theme is `originalCodecademyTheme`.
- `admin`, `platform`, `percipio` and `lxStudio`, the other old themes rebuilt the same way. Their themes keep their old names: `adminTheme`, `platformTheme`, `percipioTheme` and `lxStudioTheme`.

Each rebuilt brand takes its colors from what its old theme showed in each job, and keeps that theme's fonts, weights and elevation. `platformTheme` still starts in dark mode and keeps its `editor-*` code editor colors, which aren't part of the generated system.

### Palette

Each slot becomes a ramp of 11 grades, from `100` (lightest) to `1100` (darkest). The generator works in [OKLCH](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/oklch), a way of writing a color as lightness, chroma (how colorful it is) and hue. OKLCH lightness matches how bright people see a color, so two colors with the same lightness look equally light whatever their hue.

Every grade has a fixed lightness, and that lightness is the same in every slot and every brand. Chroma is a share of the most color a screen can show at that lightness and hue. Because lightness is fixed, the contrast between two grades barely changes from brand to brand: `primary-800` on `neutral-light-100` has close to the same contrast whatever the primary hue is. That is what lets every brand share one role mapping.

Palette colors are [CSS custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) named `--colors-palette-<slot>-<grade>`, for example `--colors-palette-primary-800`. A few steps also come in translucent versions, such as `--colors-palette-primary-600-a6` at 6% opacity. `--colors-white` and `--colors-black` sit outside the ramps. Palette colors exist for the system to build roles from. Components don't use them.

### Roles

A role names a job and points at a palette color in each mode. There are 43 roles:

| Family      | Roles                                                                                 | Used for                                                         |
| ----------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `surface-*` | `default`, `raised`, `sunken`, `success`, `warning`, `error`, `brand`, `brand-subtle` | Anything with a background: the page, cards, wells, status tints |
| `text-*`    | `default`, `subtle`, `inverse`, `success`, `warning`, `error`                         | Text and icons                                                   |
| `border-*`  | `strong`, `default`, `subtle`                                                         | Borders and dividers                                             |
| `action-*`  | `primary`, `danger` and `neutral`, each with `-hover` and `-pressed`; `disabled`      | Interactive fills and inks: buttons, links, toggles              |
| `state-*`   | `hover`, `pressed`, `selected`                                                        | Translucent layers over elements that have no fill of their own  |
| `viz-*`     | `1` to `8` (categorical), `seq-1` to `seq-4` (sequential)                             | Charts                                                           |
| `backdrop`  |                                                                                       | The dimmed layer behind a modal                                  |

Each role has one meaning. `surface-raised` is for cards, panels, dialogs and menus, and nothing else. The mapping is the same for every brand: `text-subtle` is `neutral-dark-800` in light mode and `neutral-light-400` in dark mode on every brand. Only the palette under it changes.

Roles are custom properties named `--colors-<role>`, for example `--colors-action-primary`. The two brand surfaces also have a gradient. `--colors-surface-brand` is the flat fallback color, and `--gradient-surface-brand` is the gradient to paint over it. The same goes for `surface-brand-subtle`.

### Checks

The build refuses to write any output if a check fails, for any brand, in either mode. It checks that:

- every text role reaches a 4.5:1 [contrast ratio](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) on the surfaces it's meant for;
- every border, action and chart role that carries meaning reaches 3:1, the [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) minimum;
- the translucent `state-*` roles still meet those minimums once they're laid over each surface;
- `state-pressed` looks visibly different from `state-hover` on every surface;
- 210 text and icon pairings inside 25 real components, such as an `Alert` icon on its tint, meet their minimum.

`border-subtle` and `action-disabled` are exempt from contrast, because one is decorative and the other marks an inactive control. Separation of the three status colors for people with color-vision deficiencies is measured and reported, but doesn't fail the build.

To see the full report, run:

```sh
yarn workspace @skillsoft/gamut-styles validate:tokens
```

The report runs every check a second time on the values read back out of `tokens.css`, so what ships is what was checked.

### Outputs

One source produces three outputs:

| Output       | Import                                         | For                                                             |
| ------------ | ---------------------------------------------- | --------------------------------------------------------------- |
| `tokens.css` | `@skillsoft/gamut-styles/tokens.css`           | Every color as a custom property                                |
| DTCG JSON    | `@skillsoft/gamut-styles/tokens/*.tokens.json` | Tools outside JavaScript, such as Figma plugins and native apps |
| TS constants | `@skillsoft/gamut-styles/tokens`               | Code that needs the values or the role table itself             |

The JSON follows the [Design Tokens Community Group](https://www.designtokens.org/) (DTCG) format, a shared JSON format for design tokens. There is one file each for the palette, light roles and dark roles, and each color is OKLCH with its hex value alongside. Other brands' files are under `@skillsoft/gamut-styles/tokens/brands/`. The TypeScript entry exports `palette`, `roles`, `gradients` and `contentModes`, and doesn't depend on React or Emotion.

`tokens.css` puts every value inside a [cascade layer](https://developer.mozilla.org/en-US/docs/Web/CSS/@layer) called `tokens`:

```css
@layer reset, base, tokens, recipes, utilities;

@layer tokens {
  :root,
  [data-brand='skillsoft'] {
    --colors-palette-primary-800: oklch(0.4115 0.1767 262.4);
    /* ... */
  }
  :root,
  [data-color-mode='light'] {
    --colors-text-default: var(--colors-palette-neutral-dark-1000);
    /* ... */
  }
  [data-color-mode='dark'] {
    --colors-text-default: var(--colors-palette-neutral-light-200);
    /* ... */
  }
  [data-brand='originalCodecademy'] {
    /* this brand's palette */
  }
}
```

Styles inside a layer lose to styles outside any layer, whatever the selector. Emotion's styles and your own unlayered CSS override a token value without needing a more specific selector.

### How the colors reach the page

A theme built on the color system carries `tokens.css` as a string, and `GamutProvider` injects it as an Emotion global style, the same way it injects its reset and typography styles. A React app gets every color without loading a file, and the colors are in the server-rendered HTML too.

The theme's own colors are `var()` names like `var(--colors-surface-raised)`, so `css()`, `variant()`, `states()` and system props keep working as they did before.

If your app loads `tokens.css` itself, pass `useTokens={false}` to `GamutProvider` to skip the injected copy. Loading both does no harm, because the rules are identical. Pages without React or Emotion, such as plain HTML or email, can link `tokens.css` directly.

### Modes and brands at runtime

A mode switch is an HTML attribute. `data-color-mode="dark"` on any element points every role inside it at its dark-mode color, through plain CSS, and it nests as deep as you need. Each mode block also sets [`color-scheme`](https://developer.mozilla.org/en-US/docs/Web/CSS/color-scheme), so scrollbars and native form controls follow the mode. The `ColorMode` component sets two attributes on its element, `data-color-mode` and `data-brand`.

A brand switch is an attribute too. `data-brand="originalCodecademy"` swaps the palette, and the roles on top stay the same.

The `Background` component decides its content mode at build time. For each of the 90 palette colors, the generator records whether light-mode or dark-mode content reads better on it. `Background` looks the answer up in that table instead of measuring contrast in the browser on every render.

## Intended use

### Pick a role by its job

| Job                                         | Role                                             |
| ------------------------------------------- | ------------------------------------------------ |
| The page or a section's background          | `surface-default`                                |
| A card, popover, menu or modal panel        | `surface-raised`                                 |
| An inset well or code block                 | `surface-sunken`                                 |
| Body text and headings                      | `text-default`                                   |
| Descriptions, metadata and helper text      | `text-subtle`                                    |
| Anything clickable                          | `action-*`                                       |
| Hover and press on something with no fill   | `state-hover`, `state-pressed`, `state-selected` |
| A border that carries meaning, like a field | `border-default`                                 |
| A decorative divider                        | `border-subtle`                                  |
| The dimmed layer behind a modal             | `backdrop`                                       |

```tsx
import { Box, Text } from '@skillsoft/gamut';

const Card = () => (
  <Box
    bg="surface-raised"
    color="text-default"
    border={1}
    borderColor="border-subtle"
    p={16}
  >
    <Text as="h3">Course progress</Text>
    <Text color="text-subtle">Updated 2 hours ago</Text>
  </Box>
);
```

### Use `text-inverse` on filled controls

A label on a filled action, such as `action-primary`, uses `text-inverse` in either mode. `text-inverse` is only checked against `action-primary`, `action-neutral` and `action-danger`.

```tsx
<Box bg="action-primary" color="text-inverse" px={16} py={8}>
  Start lesson
</Box>
```

### Pair a status tint with a status ink

A status message is a tint behind and an ink on top. An error box uses `surface-error` for the background and `text-error` for the icon and the message; each status ink clears text contrast on its own tint. A floating `Alert` takes the same ink on its border. Show warnings with an icon, not color alone.

### Put colored sections inside `Background`

`Background` paints a color and switches the mode inside it to whichever one reads better on that color. Inside, every role resolves in the new mode, so `text-default` stays readable without picking a mode by hand.

```tsx
import { Background } from '@skillsoft/gamut-styles';

const PromoBand = ({ children }) => (
  <Background bg="action-primary" p={32}>
    {children}
  </Background>
);
```

### Use `viz-*` for charts

Use `viz-1` to `viz-8` for categorical series and `viz-seq-1` to `viz-seq-4` for ordered steps from low to high. Don't rely on color alone to tell series apart; add labels, patterns or markers ([WCAG use of color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)). For the same reason, links keep their underline.

### Use roles, never palette colors

Write `bg="surface-raised"`, not `bg="palette-neutral-light-100"`. A palette color is the same in every mode, so it doesn't change when the mode does, and it breaks dark mode.

### Set up an app

A React app gets the colors from `GamutProvider`. Pass the theme for your brand:

```tsx
import {
  GamutProvider,
  originalCodecademyTheme,
} from '@skillsoft/gamut-styles';

export const App = ({ children }) => (
  <GamutProvider theme={originalCodecademyTheme}>{children}</GamutProvider>
);
```

Then put `data-brand` and `data-color-mode` on the `<html>` element. Without them, everything outside a `ColorMode`, `<body>` included, gets the default brand (`skillsoft`) in light mode.

```html
<html data-brand="originalCodecademy" data-color-mode="light"></html>
```

Pages without React load `@skillsoft/gamut-styles/tokens.css` and set the same two attributes.

## Compared with the old color system

### What stays the same

- Themes are still variance themes, and components still style with `css()`, `variant()`, `states()` and system props. Only the color names change.
- Components still use names, not values. The old themes already handed components `var()` names, and the new ones do the same.
- Color modes still work through CSS custom properties and still nest. An attribute drives them now instead of an injected class.
- `GamutProvider`, `ColorMode` and `Background` keep the same props, and `GamutProvider` still delivers the colors.
- The old look comes back as brands. Original Codecademy is old Core rebuilt from its navy, beige, hyper and yellow, with the same fonts and elevation. Admin, Platform, Percipio and LX Studio are rebuilt the same way, under their old theme names.

### What improves

|                   | Old                                                     | New                                                                 |
| ----------------- | ------------------------------------------------------- | ------------------------------------------------------------------- |
| Where values live | Emotion theme objects, written onto the page at runtime | One generated stylesheet, `tokens.css`, injected once               |
| Mode switch       | Every alias for the mode written into a new class       | One attribute                                                       |
| `Background`      | Contrast math on every render                           | A table decided at build time                                       |
| Accessibility     | Colors picked by hand and never checked                 | Every role pairing and 210 component pairings checked at build time |
| Names             | Ambiguous: `background` is both the page and a card     | One job each: `surface-default`, `surface-raised`                   |
| New brand         | A hand-written theme and alias table                    | A few hues, checked automatically                                   |
| Who can read it   | JavaScript only                                         | CSS, DTCG JSON and TypeScript from one source                       |
| Color space       | Hex, tuned by hand per step                             | OKLCH with fixed lightness per grade, hex alongside in the JSON     |

### What costs more

- Every color name changes. `text` becomes `text-default` and `primary` becomes `action-primary`. Some old names split into several roles depending on where they're used: `background` becomes `surface-raised` on a card and `surface-default` on the page, so a person has to choose each time. The type check fails on every old name until it's moved.
- Rebuilt themes aren't pixel-identical. Roles use the same grades on every brand, so some colors move noticeably even when the brand hues match the old theme. Overrides cover colors that have to stay exact.
- Colors that only one old theme had are gone, such as Percipio's `percipioTextPrimary`. Use the role for the job instead.
- The browser floor goes up. `tokens.css` uses `oklch()`, [`color-mix()`](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color-mix), `@layer` and [container query units](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries#container_query_length_units) with no hex fallback. Browsers older than about Chrome and Edge 111, Safari 16.2 or Firefox 113 get no color. Check [oklch support](https://caniuse.com/mdn-css_types_color_oklch) and [color-mix support](https://caniuse.com/mdn-css_types_color_color-mix) against your app's browser list.
- Any unlayered CSS overrides a token. That's on purpose, but a stray global rule can now change a color.
- Some pieces are missing. There is no shadow role yet. The chart colors use the order solved for Skillsoft's hues, so another brand gets that order without it being re-solved for its own hues.
- The Emotion theme carries sRGB copies of each color, because the [polished](https://polished.js.org/) library can't read OKLCH. Code that reads a color from the theme in JavaScript gets a very slightly different value from what's on screen.
