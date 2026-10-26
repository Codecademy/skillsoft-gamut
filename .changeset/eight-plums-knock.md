---
'@skillsoft/gamut': patch
---

Retypes Card's internal `MotionBox` so Storybook's props table no longer lists every DOM and aria attribute. `CardProps` accepts exactly the same props as before, and nothing changes at runtime.
