---
title: Themes
description: The themes Gamut ships (Skillsoft, Original Codecademy, Admin, Platform and LX Studio) and how they relate to brands.
---

Every Emotion component in Gamut has typed access to the current theme's tokens, without any extra imports, most commonly through [system props](/foundations/system-props/) or the `theme` prop.

## Available themes

Each theme is one brand of the [color system](/concepts/color-system/), plus that brand's fonts, font weights and shadows:

| Theme                     | Brand                | For                                                             |
| ------------------------- | -------------------- | --------------------------------------------------------------- |
| `skillsoftTheme`          | `skillsoft`          | The default. Replaces `percipioTheme`                           |
| `originalCodecademyTheme` | `originalCodecademy` | Codecademy's public-facing product, rebuilt from the Core theme |
| `adminTheme`              | `admin`              | Internal admin and back-office tools                            |
| `platformTheme`           | `platform`           | The learning environment. Starts in dark mode                   |
| `lxStudioTheme`           | `lxStudio`           | LX Studio                                                       |

`GamutProvider` uses `skillsoftTheme` when you don't pass one. Every theme has the same palette keys and the same roles, so they all share one type, `SkillsoftTheme`, and a component that type-checks against one works on all of them.

`coreTheme` is still exported, on the old color names, until the move to roles is finished. Use `originalCodecademyTheme` for new work.

A team that needs its own colors can build its own brand and theme; see [Creating a custom theme](/guides/creating-a-custom-theme/).

## Comparing themes live

Use Storybook's Theme Switcher (paintbrush icon in the toolbar) to preview any component in every theme, and the Color Mode selector to check light and dark for each. Exact color values are theme-specific and aren't reproduced here.

## Choosing a theme

See [Theming your app](/guides/theming-your-app/) for wiring up `GamutProvider` with the right theme for your product.
