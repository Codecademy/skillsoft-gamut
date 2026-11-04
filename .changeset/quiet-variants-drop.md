---
'@skillsoft/gamut': patch
---

Storybook's props table and controls no longer list `false` as an option for `variant()` props, so stories now rely on inferred variant controls instead of hand-written options. Deep controls are off by default and will be re-enabled per story. Nothing changes at runtime.
