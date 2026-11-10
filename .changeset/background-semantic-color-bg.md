---
'@skillsoft/gamut-styles': patch
---

Fix `Background` painting the flipped mode's color when `bg` is a semantic color. `<Background bg="primary">` on a light core page painted dark mode's yellow; it now paints the semantic color's value in the surrounding mode.
