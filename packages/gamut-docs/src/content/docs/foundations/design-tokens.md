---
title: Design tokens
description: Color, spacing, radius, and other token values, and the keys used to access them.
---

Every theme exposes the same token categories, each on the Emotion theme object under its own key. Exact values differ per theme; see [Themes](/foundations/themes/) for the themes Gamut ships, or open Storybook's Theme Switcher (paintbrush icon in the toolbar) to browse live values for any theme and color mode.

## Color — `colors`

Colors come from the [color system](/concepts/color-system/), in two layers:

- **Roles**, such as `surface-raised`, `text-default` and `action-primary`. Each names a job and resolves to a different color in light and dark mode. Components and app code use roles.
- **Palette colors**, named `palette-<slot>-<grade>`, such as `palette-primary-800`, plus `white` and `black`. A palette color is the same in every mode. Roles point at these; components shouldn't.

Each color is also a CSS custom property with a `--color-` prefix, such as `var(--color-surface-raised)`, for stylesheets and pages without React.

See [Color modes](/concepts/color-modes/) for how roles follow the mode.

## Typography

- Font family — `fontFamily`
- Font size — `fontSize`
- Font weight — `fontWeight`
- Line height — `lineHeight`

## Space

- Spacing scale — `spacing`

## Layout

- Breakpoints — `breakpoints`. See [Responsive properties](/foundations/system-props/responsive-properties/) for how these map to the prop syntax.

## Border radius

- `borderRadii`

## Elevation

- `elevation` — how a surface like Card renders shadow and lift. Three states, `rest`, `hover` and `hoverMirrored`, each with a `shadow` and a `transform` token, accessed as `elevation['<state>-<property>']`. `hoverMirrored` is for a surface that casts its shadow to the right instead of the left. Every shadow is drawn in two roles, `shadow-key` (the tight contact layer) and `shadow-ambient` (the soft falloff), so shadows follow color mode automatically. Each theme supplies its own geometry: Original Codecademy keeps a hard offset, and the other themes use a soft shadow with no lift.

## Accessing tokens directly

Reach for a token directly only when a [system prop](/foundations/system-props/) can't express what you need. Most components should consume tokens through system props instead.

```tsx
// on the theme prop of any styled component
const styles = styled.div`
  color: ${({ theme }) => theme.colors['text-subtle']};
`;

// or imported directly
import { theme } from '@skillsoft/gamut-styles';
const myStyles = css`
  font-size: ${theme.fontSize[14]};
`;
```
