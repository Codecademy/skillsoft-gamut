---
'@skillsoft/gamut': patch
---

Migrate Form stories into packages/gamut and fix the SelectDropdown "Remove all" button, which was focusable but `aria-hidden`. Screen readers now announce it by its label.
