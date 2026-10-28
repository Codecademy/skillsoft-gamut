---
'@skillsoft/gamut-codemods': minor
---

Add `@skillsoft/gamut-codemods`, a CLI for moving a repo from `@codecademy/gamut*` to `@skillsoft/gamut*`. Run `npx @skillsoft/gamut-codemods scope-swap .` from a clean working tree. Pass `--dry` to preview, `--only=a,b` to pick migrations, and `--no-report` to skip the leftovers list.

`scope-swap` does the following:

- Renames every `@codecademy/gamut*` package and `eslint-plugin-gamut` to `@skillsoft/*` in imports, exports, `require`, `import()`, `jest.mock`/`vi.mock`, `declare module`, import types, comments, `package.json`, `.mdx` ESM blocks, and `.yarnrc.yml` lists.
- Replaces `@codecademy/gamut-kit`, which has no `@skillsoft` replacement, with the packages it bundled, in `package.json` and Module Federation `shared` config. Gamut is now a singleton across host and remotes, so the run ends with a reminder to deploy them together.
- Moves `Video` and `VideoProps` onto `@skillsoft/gamut/Video`, and adds `iframeOverride` / `videoOverride` to each `<Markdown>` that didn't opt out.
- Warns about tsconfig files whose `lib` has no `"dom"`, and about dependencies on a newer upstream release than `@skillsoft` has caught up to.
- Updates the ESLint plugin prefix from `gamut/` to `@skillsoft/gamut/` in legacy `.eslintrc` files. Flat configs are left alone, and the run says why.
