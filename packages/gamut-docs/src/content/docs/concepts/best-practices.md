---
title: Best practices
description: General design and engineering best practices that apply across components.
---

For best practices specific to one component — like alerts, errors, or confirmation dialogs — see that component's own page.

## Prefer semantic tokens over raw values

Access colors through Gamut's color roles (`text-default`, `surface-raised`, `action-primary` and the rest) rather than raw values or palette colors; see [Color modes](/concepts/color-modes/) for why. Roles give you the right color for the theme and color mode, with the right types and states. [Color system](/concepts/color-system/#pick-a-role-by-its-job) lists which role fits which job.

```tsx
import { css } from '@skillsoft/gamut-styles';
import styled from '@emotion/styled';

// A single value
const Box = styled.div(css({ p: 4 }));

// A semantic color, not a raw one
const OtherCoolThing = styled.div(css({ color: 'action-primary', p: 4 }));
```

`variant` and `states` extend the same idea to whole sets of styles — see [Compose and variants](/foundations/system-props/compose-and-variants/) for the full API.

## Reach for system props first

[System props](/foundations/system-props/) exist so writing custom, one-off styles is rarely necessary. They come with type-safe access to the right token scale for the context you're in, and a [responsive syntax](/foundations/system-props/responsive-properties/) shared across every prop:

```tsx
import { Box } from '@skillsoft/gamut';

const MyContainer = ({ children }) => (
  <Box px={[16, 32, 64, , 96]}>{children}</Box>
);
```

`eslint-plugin-gamut`'s [`no-inline-style`](/foundations/eslint-rules/#gamutno-inline-style) and [`no-css-standalone`](/foundations/eslint-rules/#gamutno-css-standalone) rules enforce this in CI — an inline `style` prop or a standalone stylesheet is almost always a sign a system prop or a `variant`/`states` call should have been used instead.

## Avoid nested selectors

Nested selectors — tag selectors like `div`/`p`/`span`, or component selectors like `${Box}` — can produce side effects that are hard to predict and even harder to keep consistent through later updates. Reach for system props, `gamut-styles` utility functions, or a layout component like `FlexBox`/`GridBox` instead:

```tsx
// Avoid
const App = styled.main`
  display: flex;
  ${Box} {
    align-self: start;
  }
`;

// Prefer
const App = ({ children }) => (
  <FlexBox as="main">
    <Box alignSelf="start">{children}</Box>
  </FlexBox>
);
```
