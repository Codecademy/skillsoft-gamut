---
title: Color modes
description: How light and dark mode work, and how they combine with a brand.
---

Gamut components use color roles, not color values. Each role names a job, not a look:

- `text-default`, for body text and headings.
- `surface-default`, for the page.
- `surface-raised`, for cards, menus, dialogs and fields.
- `action-primary`, for the main interactive fill, links and focus rings.

Every role points at a palette color once for light mode and once for dark mode. A color mode is the choice between those two. Switching the mode switches every role at once, so a component built on roles works in both modes with no extra code. The full list of roles is on the [Color system](/concepts/color-system/#roles) page.

## Modes are HTML attributes

The `data-color-mode` attribute sets a mode, and the roles under it resolve in plain CSS. `ColorMode` sets the attribute for you:

```tsx
import { ColorMode } from '@skillsoft/gamut-styles';

const Panel = ({ children }) => <ColorMode mode="dark">{children}</ColorMode>;
```

Modes nest: a light section can hold a dark panel, which can hold a light card. Each mode block also sets the CSS `color-scheme`, so scrollbars and native form controls follow the mode. A page starts in its brand's initial mode, which is light for every brand but Platform, with nothing set on `<html>`.

## Modes and brands

A brand decides which palette the roles draw from: Skillsoft's, Original Codecademy's, and so on. A mode decides which of that brand's two mappings is active. The two combine: `action-primary` is a different color in each brand and each mode, but it always means the main action.

Each theme carries one brand, and a page carries one brand's colors. See [Themes](/foundations/themes/) for the brands Gamut ships, and [Supporting dark mode](/guides/supporting-dark-mode/) for how to apply a mode or build a component that adapts to it.
