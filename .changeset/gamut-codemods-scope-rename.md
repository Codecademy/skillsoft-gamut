---
'@skillsoft/gamut-codemods': minor
---

Add `@skillsoft/gamut-codemods`, a CLI for moving a repo from `@codecademy/gamut*` to `@skillsoft/gamut*`. Run `npx @skillsoft/gamut-codemods scope-swap .` from a clean working tree. Pass `--dry` to preview, `--only=a,b` to pick migrations, and `--no-report` to skip the leftovers list.

`scope-swap` does the following:

- Renames every `@codecademy/gamut*` package and `eslint-plugin-gamut` to `@skillsoft/*` in imports, exports, `require`, `import()`, `jest.mock`/`vi.mock`, `declare module`, import types, comments, `package.json`, `.mdx` ESM blocks, and `.yarnrc.yml` lists.
- Replaces `@codecademy/gamut-kit`, which has no `@skillsoft` replacement, with the packages it bundled, in `package.json` and Module Federation `shared` config. Gamut is now a singleton across host and remotes, so the run ends with a reminder to deploy them together.
- Rewrites `/dist/` deep imports that have a public replacement to the package root, merging them into an existing import from the same package. Renamed exports keep their local name, so `import { List } from '@codecademy/gamut/dist/Menu/elements'` becomes `import { MenuList as List } from '@skillsoft/gamut'`. Imports with no public replacement, and deep paths in mocks or `require()`, get a warning.
- Moves `Video` and `VideoProps` onto `@skillsoft/gamut/Video`, splitting mixed imports, and adds `iframeOverride` / `videoOverride` to each `<Markdown>` that didn't opt out. Namespace imports, `export *`, and mocks that stub `Video` get a warning instead. A second run is a no-op.
- Warns about `experimental.esmExternals: false` in `next.config.*`. With that flag, Next `require()`s server externals, so `@emotion/styled` and `react-select` default imports fail while Next collects page data. The run ends with a checklist item to remove the flag and any aliases that were working around it.
- Warns about tsconfig files whose `lib` has no `"dom"`, and about dependencies on a newer upstream release than `@skillsoft` has caught up to.
- Updates the ESLint plugin prefix from `gamut/` to `@skillsoft/gamut/` in legacy `.eslintrc` / `.eslintrc.json` files. Flat configs are left alone, and the run says why.
