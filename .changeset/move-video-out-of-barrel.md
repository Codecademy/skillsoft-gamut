---
'@skillsoft/gamut': minor
---

Upgrade `react-player` to v3 and move `Video` out of the main barrel.

- `Video` is now imported from `@skillsoft/gamut/Video` instead of `@skillsoft/gamut`. It resolves under TypeScript's `moduleResolution: "node"` (node10) and in bundlers that ignore `package.json#exports`, through a `Video/package.json` stub.
- `@vidstack/react` and `react-player` are now peer dependencies. If you use `Video` (or the Markdown `Iframe`/`MarkdownVideo` overrides), install them: `yarn add @vidstack/react@~1.12.12 react-player@^3.4.0`. Gamut supports `@vidstack/react` 1.12.x only; its npm `latest` tag still points to 0.6.x.
- Markdown `<iframe>` and `<video>` tags render as plain tags unless you pass `iframeOverride` / `videoOverride`. The `skipDefaultOverrides.iframe` and `skipDefaultOverrides.video` options are removed.
- A Markdown `<video>` without `width` or `height` no longer passes `NaN` sizes to `Video`, and a `<video>...</video>` written on one line is no longer wrapped in a `<p>`.
- `react-player` v3 removes the `deepmerge@4.3.1` dependency, which had an unpatched prototype pollution vulnerability (CVE-2026-93753).
