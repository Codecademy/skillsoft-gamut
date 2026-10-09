---
name: gamut-scope-swap
description: Use this skill when moving an app from @codecademy/gamut* packages to @skillsoft/gamut* — running or re-running the scope-swap codemod (@skillsoft/gamut-codemods), triaging its warnings and leftovers, and fixing what it can't rewrite, such as deep imports, Video, renamed Menu exports, tsconfig dom, jest mocks, ESLint plugin keys, Module Federation shared config, the removed gamut-kit, and preview builds. Not for day-to-day Gamut usage after the move (see gamut-review) or for building new UI.
---

# Gamut Scope Swap

Help an app move from `@codecademy/gamut*` to `@skillsoft/gamut*`. The codemod does the mechanical rewrite. This skill covers what the codemod reports, what it leaves for a person, and how to check the result.

For a short overview of every breaking change, read [BREAKING_CHANGES.md](BREAKING_CHANGES.md). Load it only when you need the full list. The sections below cover triage.

Sources of truth, in order:

1. The codemod's README in `@skillsoft/gamut-codemods`, and `npx @skillsoft/gamut-codemods list` for the migrations in each preset.
2. The installed `@skillsoft/gamut` type declarations in `node_modules`. Before you suggest an import, confirm the symbol is actually exported there. Don't invent replacements.
3. The rest of the Gamut skills in this plugin, for choosing a replacement component or style API.

## Workflow

1. **Check the starting state.** Run `git status`. The codemod refuses to write into uncommitted changes unless it gets `--force`. If the tree is dirty, ask the user to commit or stash first. Don't add `--force` on your own.
2. **Preview.** Run `npx @skillsoft/gamut-codemods scope-swap . --dry`. It prints every file it would change and its warnings, and writes nothing. Run this before a real run.
3. **Run it,** once the user confirms: `npx @skillsoft/gamut-codemods scope-swap .`. Options:
   - `--only=deep-imports,scope-rename` runs a subset of migrations.
   - `--no-report` skips the leftovers report.
   - To undo a run, `git checkout .`. That only restores the original state if the tree was clean before the run.
4. **Triage the output in this order.** Warnings first, because some change runtime behavior. Then leftovers. Then next steps.
5. **Verify.** Reinstall with `yarn`, run the formatter, then type-check, lint, test, and build. If the app uses Module Federation, test the host and its remotes together.

If the codemod has already run, ask the user to paste the warnings and the leftovers list. If they can't, find the old names yourself. Exclude lockfiles and build output:

```sh
grep -rn "@codecademy/gamut" --exclude-dir=node_modules --exclude-dir=dist --exclude=yarn.lock .
```

## Warnings

Each warning starts with `[migration-name] file:line`. The migration name tells you what to check.

| Migration       | Warning starts with                                                   | What to do                                                                                                                                                                                                                                                        |
| --------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deep-imports`  | `unmapped deep import '…'`                                            | The codemod has no mapping for this path. Find the symbol in the installed `@skillsoft/gamut` types. If it's exported from the root, import it from there. If it isn't public, don't deep-import the `dist` path. Ask the Gamut team.                             |
| `deep-imports`  | `… has no public replacement`                                         | `ButtonBase` is deliberately private. Use `FillButton`, `StrokeButton`, `TextButton`, `IconButton`, or `CTAButton`. See the `gamut-buttons` skill for which one.                                                                                                  |
| `deep-imports`  | `… is only partly public`                                             | Only some names from this path are public. Inline the styles, or use system props or `css()`. See `gamut-style-utilities` and `gamut-system-props`.                                                                                                               |
| `deep-imports`  | `deep import … in a mock or require() needs a manual rewrite`         | Rewrite the mock or `require()` path by hand.                                                                                                                                                                                                                     |
| `deep-imports`  | `rewrote … in a mock or require(). That now covers the whole package` | `jest.mock` of a deep path now mocks the whole package. Check the test still mocks what it needs. If the rename list applies, update renamed names too.                                                                                                           |
| `moved-exports` | `namespace import uses …`                                             | `import * as Gamut` can't be rewritten safely. Replace it with named imports. `Video` and `VideoProps` come from `@skillsoft/gamut/Video`.                                                                                                                        |
| `moved-exports` | `'export *' from … no longer re-exports …`                            | Add an explicit re-export from `@skillsoft/gamut/Video` if other code depends on it.                                                                                                                                                                              |
| `moved-exports` | `mock of … stubs Video/VideoProps`                                    | Mock `@skillsoft/gamut/Video` instead of the root package.                                                                                                                                                                                                        |
| `scope-rename`  | `'@codecademy/gamut-kit' has no replacement package`                  | `gamut-kit` is removed, with no `@skillsoft` replacement. Depend on the individual packages it bundled.                                                                                                                                                           |
| `scope-rename`  | `renamed N package-name string(s) outside imports. Check the diff.`   | Review those lines in the diff. They're usually config or log strings, and a few may not be package names at all.                                                                                                                                                 |
| `package-json`  | `…: replaced '@codecademy/gamut-kit' with its individual packages`    | The individual packages are written at the release range (`^<version>`), not at the kit's old version. They all land in the field `gamut-kit` was in, so `@skillsoft/gamut-tests` may end up in `dependencies`. Move it to `devDependencies` if it belongs there. |
| `mf-shared`     | `replaced … in Module Federation shared config`                       | This is a runtime change. Gamut is now actually shared as a singleton, so host and remotes must agree. Update each remote's shared config to match and deploy them together.                                                                                      |
| `tsconfig-dom`  | `"lib" has no "dom"`                                                  | The root import used to bring in DOM types through `Video`. Add `"dom"` to that tsconfig's `lib` only if type-checking now fails on `document`, `HTMLElement`, `ResizeObserver`, and similar.                                                                     |

## Leftovers

The leftovers list shows every line that still names an old package. The codemod doesn't rewrite these, and the regex can produce false positives. Go through them one by one:

- **Jest `moduleNameMapper` regexes and tsconfig `paths`.** Update them to the `@skillsoft/*` names. A stale mapper makes tests fail to resolve modules.
- **Flat ESLint configs (`eslint.config.*`) and `.eslintrc.js`.** The codemod doesn't rewrite these. Legacy `.eslintrc` and `.eslintrc.json` files are rewritten, and `eslint-comments` rewrites disable directives. Keep the plugin key consistent with the directives, or ESLint reports rules it can't find:
  - Directives become `// eslint-disable-next-line @skillsoft/gamut/<rule>`. In a flat config, register the plugin under the key `@skillsoft/gamut`. Rule names don't change.
  - In a legacy config, use `plugin:@skillsoft/gamut/...` and `"@skillsoft/gamut/<rule>"`. `eslint-config` rewrites these for you.
  - If the plugin is registered under another key, rename either the key or the directives, but not just one of them.
- **Storybook config, docs, and comments.** Update them or leave them, but know they still say the old name.
- **Code samples in `.mdx`.** Fenced code blocks are left alone on purpose. Update them by hand if they matter.
- **Files the parser skipped.** Every file is parsed as `tsx`, so Flow-typed JavaScript is skipped. Fix any old names left in those files by hand.

Don't edit `yarn.lock` by hand. Reinstalling updates it.

## Next steps

After the migrations finish:

1. Reinstall with `yarn`.
2. Run the formatter (`prettier --write` or `eslint --fix`). Split imports from `moved-exports` come out in a different style until you do.
3. Type-check, run tests, and build.
4. If the app uses Module Federation, run the host and every remote together.
5. If the app depends on preview builds, pin them with `resolutions`. The codemod README has the exact JSON. Published releases don't need it.

## Common failures

| Symptom                                                                            | Likely cause                                                                         | Fix                                                                                                                                |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Module '"@skillsoft/gamut"' has no exported member 'Video'`                       | `Video` was imported from the root                                                   | Import from `@skillsoft/gamut/Video`.                                                                                              |
| `Cannot find name 'document'`, `HTMLElement`, or `ResizeObserver`                  | The affected tsconfig's `lib` has no `"dom"`                                         | Add `"dom"` to that tsconfig's `compilerOptions.lib`.                                                                              |
| Components render unstyled, or theme values don't apply                            | Two copies of `@skillsoft/gamut-styles` or `@skillsoft/variance` are installed       | Run `yarn why @skillsoft/gamut-styles`. Make every `@skillsoft/*` package resolve to one version. Pin previews with `resolutions`. |
| `MenuList`, `MenuListItem`, or `IconOptionComponent` is not exported               | Menu's `List*` and SelectDropdown's `IconOption` were renamed on the way to the root | Import the new name. Keep the local alias if the code relies on it, e.g. `import { MenuList as List }`.                            |
| Jest can't resolve `@skillsoft/...` modules, or a mock doesn't apply               | A stale `moduleNameMapper` regex, or a mock still points at the root package         | Update the mapper. Mock `@skillsoft/gamut/Video` for `Video`.                                                                      |
| `Cannot find module '@codecademy/gamut/dist/...'` after the run                    | The file was skipped by the parser, or the path is in a code sample                  | Rewrite the import by hand, following the rules above.                                                                             |
| ESLint: `Definition for rule '…' was not found`, or a disable comment does nothing | The plugin key doesn't match the rewritten directives                                | Make the plugin key match the directive prefix (see Leftovers).                                                                    |
| Remotes load a second copy of Gamut at runtime                                     | Module Federation `shared` still lists old names on a remote                         | Update that remote's `shared` config and deploy it with the host.                                                                  |

## What not to do

- Don't re-add `@codecademy/gamut-kit`, and don't create `@skillsoft/gamut-kit`.`@codecademy/gamut-kit` is deprecated and `@skillsoft/gamut-kit` never existed. Depend on the individual packages it bundled.
- Don't fix a warning by deep-importing a `dist` path. Find a public export, or ask the Gamut team.
- Don't silence a warning or leftover by removing the `@skillsoft` entry it points at.
- Don't bump any `@skillsoft/*` package outside the group's shared version. The packages move together.
- Don't run the codemod on a dirty tree, and don't pass `--force` to get past the check.

## Reporting back

Say what the codemod changed, which warnings and leftovers are still open, which ones you fixed, and what the user should verify by hand. If you haven't seen the codemod output, ask for it before you start guessing at fixes.
