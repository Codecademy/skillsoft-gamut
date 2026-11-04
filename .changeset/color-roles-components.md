---
'@skillsoft/gamut': minor
---

Components use the color system's roles, following design's component map.

- **Breaking:** every color name a component uses is a role (`surface-raised`, `text-subtle`, `action-primary`, `state-hover`, …). Code that passes old names (`background`, `primary`, `navy`, `text-disabled`) to gamut props has to move; the `color-roles` codemod in `@skillsoft/gamut-codemods` does most of it.
- **Breaking:** old `coreTheme` doesn't define the roles, so components lose their colors on it. Use `originalCodecademyTheme`, its rebuild, or `skillsoftTheme`. Admin, platform and lxStudio are rebuilt as brands and keep their names.
- Buttons map onto the action families: `secondary` is `action-neutral`, `interface` merges into primary, labels on fills are `text-inverse`, every variant takes the `action-primary` focus ring, and StrokeButton and TextButton hover and press with veils.
- Fields are `surface-raised` with a `border-default` edge; field hover is `border-strong`, so blue only means focus. Floating surfaces (menus, popovers, tooltips, toasts, the SelectDropdown menu) are `surface-raised` with a `border-subtle` hairline and the theme's raised shadow. A checked Radio is `action-primary`.
- **Breaking:** Card's `variant` is `default` or `brand`. `white`, `beige` and `navy` become `default` (`surface-raised`); `yellow` and `hyper` become `brand`, the featured card on the brand gradient. Every card has a `border-subtle` hairline. An interactive card has the raised shadow at rest, and the `state-hover` veil with the raised-hover shadow on hover; its border no longer changes. A card that isn't interactive has no shadow.
- CTAButton's shadow comes from the theme's elevation: the soft raised shadow on most brands, old core's hard offset on Original Codecademy.
- Modal and Flyout's scrim is `shadow-scrim`, and Flyout's panel has a `border-subtle` inner edge.
- ProgressBar's blue and yellow bars are `text-default` on a sunken track. Block Tabs follow the page's mode instead of forcing dark.
- `Tag`: navigation and suggestion tags have no fill of their own, so they sit on the surface they're on. Disabled tags drop the `action-disabled` fill and take the disabled ink, keeping their edge.
- Every input-like control fills with `surface-raised`, an unchecked Checkbox included. Placeholders are `text-subtle`, an error is a 2px `text-error` outline at rest, and an edited field keeps its `border-default` outline. A disabled DatePicker field now looks disabled, and its error ring draws. FormGroup descriptions are `text-subtle`.
- The checker pattern behind Modal, Toast, PreviewTip and the DatePicker calendar is drawn only on Original Codecademy, in `border-subtle`. Themes from before the color system keep it.
- Smaller fixes from design's map: link hover is `action-primary-hover`, link focus rings are `action-primary`, the Breadcrumbs separator is `text-subtle`, List row hover is a veil over the row's fill, focus is a ring without a fill, and Shimmer is a `surface-sunken` base with a `surface-raised` sweep.
