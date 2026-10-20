---
'@skillsoft/gamut': patch
---

Video and Markdown fixes.

- `@skillsoft/gamut/Video` now resolves under TypeScript's `moduleResolution: "node"` (node10) and in bundlers that ignore `package.json#exports`, through a `Video/package.json` stub.
- A Markdown `<video>` without `width` or `height` no longer passes `NaN` sizes to `Video`.
- A `<video>...</video>` written on one line is no longer wrapped in a `<p>`.
