---
'@skillsoft/gamut-styles': minor
'@skillsoft/variance': minor
'@skillsoft/gamut': minor
---

Brands on the generated color system, and `--color-*` variable names.

- **Breaking:** color CSS variables are renamed from `--color-*` to `--color-*`, in `@skillsoft/variance`'s `createTheme` and in `tokens.css`. Raw CSS that reads `var(--color-…)` has to be updated.
- **Breaking:** `tokens.css` puts its rules in `@layer tokens`, with `reset, base, tokens, recipes, utilities` declared first.
- Adds `originalCodecademyTheme`, today's core colors, fonts and hard-offset elevation rebuilt on the generated system. `tokens.css` carries a palette block per brand under `[data-brand]`.
- A brand can override a palette step with an exact hex, or point a role at a different step (and, optionally, a different alpha) in one mode. Overrides go through the same contrast checks as generated values.
- `ColorMode` on generated themes sets `data-color-mode` and `data-brand` instead of injecting every role variable.
- Fixes `Background` painting the flipped mode's color for an alias `bg`, such as `bg="primary"`.
- `Alert`: General uses `surface-brand-subtle`. Gradient alerts size their gradient to the alert, not the viewport. Status alerts (error, success, notice) put their status ink on the message, and a floating Alert's border takes the same ink. The CTA follows the Alert's color mode instead of always rendering dark.
- Original Codecademy no longer pins navy and beige; their generated steps are used as is. Yellow stays exact.
- **Breaking:** the `backdrop` role is renamed `shadow-scrim`, and two shadow roles are added: `shadow-key` and `shadow-ambient`, the two layers every elevation shadow is drawn in (design's sandbox, `df33b47`). Brand themes' `elevation` now uses them, so shadows no longer render `undefined`: Skillsoft gets the soft raised shadow, and Original Codecademy keeps old core's hard offset with a transparent `shadow-ambient`.
