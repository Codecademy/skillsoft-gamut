---
title: Design tokens
description: Color, spacing, radius, and other token values, and the keys used to access them.
sidebar:
  label: Overview
  order: 0
---

Every theme exposes the same token categories, each accessible on the Emotion theme object via its own key. The tables on these pages list the Core theme's values. Other themes share the same keys with their own values — see [Themes](/foundations/themes/) for the available themes, or open Storybook's Theme Switcher (paintbrush icon in the toolbar) to browse live values for any theme and color mode.

- [Colors](/foundations/design-tokens/colors/) — `colors`: standard colors, swatches, and color mode aliases.
- [Typography](/foundations/design-tokens/typography/) — `fontFamily`, `fontSize`, `fontWeight`, and `lineHeight`.
- [Space](/foundations/design-tokens/space/) — `spacing`.
- [Layout](/foundations/design-tokens/layout/) — `breakpoints`.
- [Border radius](/foundations/design-tokens/border-radius/) — `borderRadii`.
- [Elevation](/foundations/design-tokens/elevation/) — `elevation`: shadow and lift for surfaces like Card.

## Accessing tokens directly

Reach for a token directly only when a [system prop](/foundations/system-props/) can't express what you need — most components should consume tokens through system props instead.

```tsx
// on the theme prop of any styled component
const styles = styled.div`
  color: ${({ theme }) => theme.colors.blue};
`;

// or imported directly
import { theme } from '@skillsoft/gamut-styles';
const myStyles = css`
  font-size: ${theme.fontSize[14]};
`;
```
