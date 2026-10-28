---
'@skillsoft/gamut-codemods': minor
---

Add `@skillsoft/gamut-codemods`, a CLI for moving a repo from `@codecademy/gamut*` to `@skillsoft/gamut*`. Run `npx @skillsoft/gamut-codemods scope-swap .` from a clean working tree. Pass `--dry` to preview, `--only=a,b` to pick migrations, and `--no-report` to skip the leftovers list.

`scope-swap` renames every `@codecademy/gamut*` package and `eslint-plugin-gamut` to `@skillsoft/*`: imports, exports, `require`, `import()`, `jest.mock`/`vi.mock`, `declare module`, import types, and package names in comments, `package.json`, `.mdx` ESM blocks, and `.yarnrc.yml` lists. `@codecademy/gamut-kit` has no `@skillsoft` replacement, so it's replaced with the packages it bundled, in `package.json` and in Module Federation `shared` config. That makes Gamut a real singleton across host and remotes, so the run ends with a reminder to deploy them together. Dependencies on a newer upstream release than `@skillsoft` has caught up to get a warning.

It also covers the Video and Markdown changes.

- `moved-exports` moves `Video` and `VideoProps` imports off the root onto `@skillsoft/gamut/Video`, splitting mixed imports and merging into an existing `/Video` import. Namespace imports, `export *`, and mocks that stub `Video` get a warning instead.
- `markdown-video-overrides` adds `iframeOverride` / `videoOverride` (with `Iframe` and `MarkdownVideo` imported from `/Video`) to each `<Markdown>` that didn't opt out, since `<Markdown>` no longer renders `<iframe>` and `<video>` through `Video` by default. It replaces the removed `skipDefaultOverrides.iframe` / `.video`, writing `iframeOverride={undefined}` where a skip was `true`, so a second run stays a no-op.
- `tsconfig-dom` (report only) warns about tsconfig files whose `lib` has no `"dom"`, since Video used to supply the DOM types through the root import.
- When a run moves Video, the next steps list the `@vidstack/react` and `react-player` peer dependencies.
