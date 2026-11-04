---
'@skillsoft/gamut-styles': minor
---

Rebuild `adminTheme`, `platformTheme` and `lxStudioTheme` as brands of the generated color system, so they define every color role.

- Each brand takes its colors from what the old theme rendered in each job, including what it inherited from core, such as lxStudio's yellow accent. Admin and platform inherit Original Codecademy's pins (yellow exact; navy and beige not pinned). lxStudio pins only its near-white page; its yellow is generated, and its dark mode keeps the sapphire primary instead of core's yellow one.
- Fonts, weights and lxStudio's radii are unchanged. Elevation is the soft shadow drawn in the shadow roles (design's sandbox, `df33b47`); only Original Codecademy keeps the hard offset. `platformTheme` still starts in dark mode and keeps its `editor-*` code editor colors with their old values.
- The two-color brand gradient pairs primary with accent-alt for every brand with a yellow accent.
- **Visual change:** the rebuilt themes aren't pixel-identical to the old ones; role grades come from design's system. Old color names that only these themes had are gone.
- **Breaking:** `percipioTheme` and the `PercipioTheme` type are removed. The Percipio fonts and elevation stay, since `skillsoftTheme` and `lxStudioTheme` use them.
