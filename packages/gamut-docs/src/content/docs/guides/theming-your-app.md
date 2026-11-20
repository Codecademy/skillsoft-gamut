---
title: Theming your app
description: Choose and wire up a Gamut theme for your application.
---

Every Emotion component in Gamut has typed access to the current theme's tokens, without any extra imports: through the `theme` prop every styled component receives, or through the `theme` object imported from `@skillsoft/gamut-styles`.

## 1. Choose a theme

See [Themes](/foundations/themes/) for the themes Gamut ships (Skillsoft, Original Codecademy, Admin, Platform, LX Studio) and what each one is for. Use Storybook's Theme Switcher (paintbrush icon in the toolbar) to preview your components in each theme before committing to one, and the Color Mode selector to check light and dark.

## 2. Wire up the theme

Pass the theme to `GamutProvider` (covered in [Installation](/getting-started/installation/)). It puts the theme's values on Emotion's context and its brand's colors on the page:

```tsx
import {
  GamutProvider,
  originalCodecademyTheme,
} from '@skillsoft/gamut-styles';

export const App = ({ children }) => (
  <GamutProvider theme={originalCodecademyTheme}>{children}</GamutProvider>
);
```

Without a `theme`, `GamutProvider` uses `skillsoftTheme`. From there, reach a token:

```tsx
import { css } from '@skillsoft/gamut-styles';
import styled from '@emotion/styled';

// Preferred: through a system prop, with a color role
const Panel = styled.div(css({ bg: 'surface-raised', p: 4 }));
const Callout = styled.div(css({ color: 'action-primary', p: 4 }));
```

```tsx
// Directly off the theme prop, when you're not using system props
import styled from '@emotion/styled';

const styles = styled.div`
  color: ${({ theme }) => theme.colors['text-subtle']};
`;
```

Prefer the first form, a [system prop](/foundations/system-props/), whenever one exists for what you're styling. It's type-checked against the theme's scales, so a typo or an out-of-range value is a compile error instead of a silent fallback.

## 3. Check your work across themes

Re-open the Theme Switcher and step through every theme your app might run under, in both color modes. A component built entirely from roles and system props should need no extra work to look right everywhere. If something looks off in one theme, a raw value or a palette color usually snuck in where a role belonged.

See [Design tokens](/foundations/design-tokens/) for the token categories, [Color modes](/concepts/color-modes/) for how color mode combines with a brand, and [Color system](/concepts/color-system/#pick-a-role-by-its-job) for which role fits which job.
