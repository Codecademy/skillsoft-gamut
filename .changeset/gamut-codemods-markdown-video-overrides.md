---
'@skillsoft/gamut-codemods': minor
---

`scope-swap` now covers the Markdown video changes. `<Markdown>` no longer renders `<iframe>` and `<video>` through `Video` by default, and `skipDefaultOverrides.iframe` / `.video` are gone. The new `markdown-video-overrides` migration adds `iframeOverride` / `videoOverride` (with `Iframe` and `MarkdownVideo` imported from `/Video`) to each `<Markdown>` that didn't opt out, so rendering is unchanged. Where a skip was `true`, it writes `iframeOverride={undefined}` so a second run stays a no-op. Video moves also print a checklist item for the `@vidstack/react` and `react-player` peer dependencies.
