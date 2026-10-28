---
'@skillsoft/gamut-styles': patch
---

Fix `Background` painting the flipped mode's color when `bg` is an alias. `<Background bg="primary">` on a light core page painted dark mode's yellow; it now paints the alias's color in the surrounding mode.
