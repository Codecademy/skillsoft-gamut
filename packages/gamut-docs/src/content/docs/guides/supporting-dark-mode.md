---
title: Supporting dark mode
description: Make a page or component work correctly in both color modes.
---

Gamut components are built on color roles (`text-default`, `surface-raised`, `action-primary` and the rest; see [Color modes](/concepts/color-modes/) for why), so most components support both color modes with no extra work. This guide covers the parts that need you to do something.

## Setting a color mode

Wrap a subtree in `<ColorMode>` to force a specific mode, or let it follow the reader's OS-level preference:

```tsx
import { ColorMode } from '@skillsoft/gamut-styles';

const Page = ({ children }) => <ColorMode mode="light">{children}</ColorMode>;
```

```tsx
// Follows the reader's OS-level light/dark preference automatically
const Page = ({ children }) => <ColorMode mode="system">{children}</ColorMode>;
```

## Setting a background without guessing the mode

Use `<Background>` instead of picking a color mode by hand for a section's background. It paints the color you give it and switches the mode inside to whichever one's text reads better on that color:

```tsx
import { Background } from '@skillsoft/gamut-styles';

const Page = ({ children }) => (
  <Background bg="action-primary">{children}</Background>
);
```

The choice is made at build time: for every opaque palette color, the color system records whether light-mode or dark-mode content reads better on it, and `Background` looks the answer up.

`<Background>` establishes a new color context for everything inside it, so you can safely nest one background inside another. A dark section can contain its own lighter card, and each still resolves its own roles correctly.

The color a `<Background>` paints is exposed as the `background-current` theme variable (`--colors-background-current` in CSS). Reach for it when a descendant needs to reference its ancestor's background directly, for example to simulate transparency against it.

## Reading the current mode in JS

Reach for these only when you need the mode value itself, not just correctly themed styles:

- `useColorModes()` returns `[mode, modeColors, modes, getColorValue]`, for when you need every mode's values, not just the active one.
- `useCurrentMode(mode?)` returns just the active mode key, or lets you override it.
- `usePrefersDarkMode()` returns a boolean from the reader's OS-level `prefers-color-scheme: dark` media query, independent of whatever `<ColorMode>` is active.

## Checking your work

Toggle color mode with Storybook's Color Mode selector while reviewing a component or page. A component built entirely from roles and system props should need no other changes to read correctly in both modes. If something looks wrong in one mode only, it's usually a palette color or a raw value that should have been a role. A palette color, such as `palette-neutral-light-100`, is the same in every mode, so it doesn't change when the mode does.
