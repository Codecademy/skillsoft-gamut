---
'@skillsoft/gamut': minor
---

Components use the color system's roles, following design's component map.

- **Breaking:** every color name a component uses is a role (`surface-raised`, `text-subtle`, `action-primary`, `state-hover`, …). Code that passes old names (`background`, `primary`, `navy`, `text-disabled`) to gamut props has to move; the `color-roles` codemod in `@skillsoft/gamut-codemods` does most of it.
- **Breaking:** old `coreTheme` doesn't define the roles, so components lose their colors on it. Use `originalCodecademyTheme`, its rebuild, or `skillsoftTheme`. Admin, platform, percipio and lxStudio are rebuilt as brands and keep their names.
- Buttons map onto the action families: `secondary` is `action-neutral`, `interface` merges into primary, labels on fills are `text-inverse`, every variant takes the `action-primary` focus ring, and StrokeButton and TextButton hover and press with veils.
- Fields, menus, popovers and tooltips are `surface-raised` with a `border-default` edge; field hover is `border-strong`, so blue only means focus. A checked Radio is `action-primary`.
- Card's palette variants become surfaces: yellow and hyper are a featured card on the brand gradient, navy is a dark-mode scope.
- ProgressBar's blue and yellow bars are `text-default` on a sunken track. Block Tabs follow the page's mode instead of forcing dark.
- `Tag`: navigation and suggestion tags have no fill of their own, so they sit on the surface they're on. Disabled tags drop the `action-disabled` fill and take the disabled ink, keeping their edge.
