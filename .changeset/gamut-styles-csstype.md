---
'@skillsoft/gamut-styles': patch
---

Add `csstype` as a dependency. The published types import from it, and it only resolved before because `@skillsoft/variance` depends on it.
