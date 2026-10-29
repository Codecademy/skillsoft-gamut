---
'@skillsoft/gamut-styles': minor
---

Rebuild `adminTheme`, `platformTheme`, `percipioTheme` and `lxStudioTheme` as brands of the generated color system, so they define every color role.

- Each brand takes its colors from what the old theme rendered in each job, including what it inherited from core: yellow accent and core's dark mode for percipio and lxStudio. Near-white pages, percipio's text gray and yellow are pinned exactly; navy and beige aren't, as for Original Codecademy.
- Fonts, weights, elevation and lxStudio's radii are unchanged. `platformTheme` still starts in dark mode and keeps its `editor-*` code editor colors with their old values.
- The two-color brand gradient pairs primary with accent-alt for every brand with a yellow accent.
- **Visual change:** the rebuilt themes aren't pixel-identical to the old ones; role grades come from design's system. Old color names that only these themes had (`percipioTextPrimary` and the rest) are gone.
