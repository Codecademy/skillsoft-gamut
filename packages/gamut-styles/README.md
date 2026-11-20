# Gamut Styles

Design tokens, Emotion themes, and system props for the Gamut design system.

## Core/

This folder contains a base stylesheet for the app.
This should be imported **once** in your application.

## Color tokens

Colors come from a generated system: a palette of 8 slots × 11 grades, and 43
semantic roles in light and dark mode. The values are checked in and shipped
as static CSS, so the colors don't depend on Emotion.

| Import                                                            | What                                                                                                                                             |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@skillsoft/gamut-styles/tokens`                                  | TS constants: `palette`, `roles`, `gradients`, `contentModes`, `brand` (OKLCH + sRGB per token)                                                  |
| `@skillsoft/gamut-styles/tokens.css`                              | `--color-*` and `--gradient-*` custom properties. Palette on `:root`; roles on `:root, [data-color-mode="light"]` and `[data-color-mode="dark"]` |
| `@skillsoft/gamut-styles/tokens/{palette,light,dark}.tokens.json` | Color tokens in the DTCG shape: `{ colorSpace: "oklch", components, alpha, hex }`                                                                |
| `skillsoftTheme` (main entry)                                     | The default Emotion theme, built on the roles. Gamut components are typed against it                                                             |

### Tokens in the browser

`GamutProvider` injects `tokens.css` through Emotion by default. It does this
when the theme has `tokensCss` (`skillsoftTheme` does) and `useGlobals` is on,
so a React app gets the colors without loading anything.
Pages without React or Emotion can load `tokens.css` directly. An app that
loads it itself passes `useTokens={false}` to avoid injecting it twice.

- A mode switch is an attribute: `data-color-mode="light"` or `"dark"` on any
  element, nested as deep as you like. Each mode block also sets
  `color-scheme`, `color: var(--color-text-default)` and a default
  `--color-background-current`.
- Outside Emotion, paint a surface by resolving the role to its palette color
  in the outer mode (`roles[mode][role].ref`), using `var(--color-<palette>)`,
  and set `data-color-mode` to `contentModes[palette]`. The palette color is
  the same in both modes, so switching modes can't change the background under
  it.
- `Background` reads `theme.contentModes` when the theme has it, and falls back
  to polished's contrast math only on themes that don't.

Storybook has a live example under **Foundations / Color system / CSS contract**.

### Naming

- Palette primitives: `--color-palette-<slot>-<grade>`, for example
  `--color-palette-primary-800`. The slots are `neutral-light`,
  `neutral-dark`, `primary`, `accent`, `accent-alt`, `danger`, `warning`, and
  `success`. Use roles in components, not primitives.
- Translucent primitives add an alpha suffix: `--color-palette-primary-600-a6`
  (6% alpha) and `--color-black-a60`.
- Roles: `--color-<role>`, for example `--color-action-primary`.
- `white` and `black` keep their bare names as boundary tokens.

The `--color-` prefix is the color scale's prefix in variance, so the Emotion and
CSS routes use one naming scheme.

### Known limits

- The theme carries sRGB values, not OKLCH. `Background` and `BarChart` run
  polished's contrast math on theme values, and polished can't parse
  `oklch()`.
- Components that use older core primitives directly (`navy-900`, `gray-100`,
  `yellow`, and similar) don't map to this theme. Use roles instead.
- `skillsoftTheme` is the only theme in this package. It has no legacy color
  names, so components are checked against it alone. `ColorMode` and
  `Background` still fall back to old names through `roleOr`, which the
  brand themes that follow will use.
- The categorical chart palette (`viz-1` to `viz-8`) uses the slot and grade
  order chosen for Skillsoft's hues. A custom brand gets that order without
  re-solving the chart colors.

For how the color roles are meant to be used, see the design tokens page in
gamut-docs.
