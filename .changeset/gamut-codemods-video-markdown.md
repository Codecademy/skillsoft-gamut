---
'@skillsoft/gamut-codemods': minor
---

`scope-swap` now covers the Video and Markdown changes.

- `moved-exports` moves `Video` and `VideoProps` imports off the root onto `@skillsoft/gamut/Video`, splitting mixed imports and merging into an existing `/Video` import. Namespace imports, `export *`, and mocks that stub `Video` get a warning instead.
- `markdown-video-overrides` adds `iframeOverride` / `videoOverride` (with `Iframe` and `MarkdownVideo` imported from `/Video`) to each `<Markdown>` that didn't opt out, since `<Markdown>` no longer renders `<iframe>` and `<video>` through `Video` by default. It replaces the removed `skipDefaultOverrides.iframe` / `.video`, writing `iframeOverride={undefined}` where a skip was `true`, so a second run stays a no-op.
- `tsconfig-dom` (report only) warns about tsconfig files whose `lib` has no `"dom"`, since Video used to supply the DOM types through the root import.
- When a run moves Video, the next steps list the `@vidstack/react` and `react-player` peer dependencies.
