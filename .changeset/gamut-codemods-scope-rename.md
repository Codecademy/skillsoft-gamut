---
'@skillsoft/gamut-codemods': minor
---

`scope-swap` now renames every `@codecademy/gamut*` package and `eslint-plugin-gamut` to `@skillsoft/*`: imports, exports, `require`, `import()`, `jest.mock`/`vi.mock`, `declare module`, import types, and package names in comments, `package.json`, `.mdx` ESM blocks, and `.yarnrc.yml` lists. `@codecademy/gamut-kit` has no `@skillsoft` replacement, so it's replaced with the packages it bundled, in `package.json` and in Module Federation `shared` config. That makes Gamut a real singleton across host and remotes, so the run ends with a reminder to deploy them together. Dependencies on a newer upstream release than `@skillsoft` has caught up to get a warning.
