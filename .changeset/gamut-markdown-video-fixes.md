---
'@skillsoft/gamut': patch
---

Fix two `Markdown` video bugs. A `<video>` without `width` or `height` no longer passes `NaN` sizes to `Video`, and a `<video>...</video>` written on one line is no longer wrapped in a `<p>`.
