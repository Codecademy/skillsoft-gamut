---
'@skillsoft/gamut': patch
---

Disclosure's button now always sets `aria-expanded`. Before, leaving out `initiallyExpanded` left the attribute off until the first toggle, so screen readers didn't announce the collapsed state.
