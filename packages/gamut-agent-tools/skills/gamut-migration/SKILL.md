---
name: gamut-migration
description: Use this skill when running a @skillsoft/gamut-codemods preset to migrate code, or triaging what it reports. Covers scope-swap (moving an app from @codecademy/gamut* packages to @skillsoft/gamut*, including deep imports, Video, renamed Menu exports, tsconfig dom, jest mocks, ESLint plugin keys, Module Federation shared config, the removed gamut-kit, and preview builds), color-roles (moving color names onto color roles), and any later preset. Not for day-to-day Gamut usage after a migration (see gamut-review) or for building new UI.
---

# Gamut Migration

Help an app move with a `@skillsoft/gamut-codemods` preset. The codemod does the mechanical rewrite. This skill covers what each preset reports, what it leaves for a person, and how to check the result. Read the section for the preset you're running. The Workflow and What not to do apply to all of them.

## Presets

| Preset        | Use it for                                                  | Run order          |
| ------------- | ----------------------------------------------------------- | ------------------ |
| `scope-swap`  | Moving from `@codecademy/gamut*` to `@skillsoft/gamut*`     | First              |
| `color-roles` | Moving Gamut color names onto the roles of the color system | After `scope-swap` |

For a short overview of every breaking change in the scope move, read [BREAKING_CHANGES.md](BREAKING_CHANGES.md). Load it only when you need the full list.

Sources of truth, in order:

1. The codemod's README in `@skillsoft/gamut-codemods`, and `npx @skillsoft/gamut-codemods list` for the presets and the migrations in each.
2. The installed `@skillsoft/gamut` type declarations in `node_modules`. Before you suggest an import, confirm the symbol is actually exported there. Don't invent replacements.
3. The rest of the Gamut skills in this plugin, for choosing a replacement component or style API.

## Workflow (every preset)

1. **Check the starting state.** Run `git status`. The codemod refuses to write into uncommitted changes unless it gets `--force`. If the tree is dirty, ask the user to commit or stash first. Don't add `--force` on your own.
2. **Preview.** Run `npx @skillsoft/gamut-codemods <preset> . --dry`. It prints every file it would change and its warnings, and writes nothing. Run this before a real run.
3. **Run it,** once the user confirms: `npx @skillsoft/gamut-codemods <preset> .`. Run `scope-swap` before `color-roles`. Options:
   - `--only=a,b` runs a subset of a preset's migrations, by name.
   - `--no-report` skips the leftovers report.
   - To undo a run, `git checkout .`. That only restores the original state if the tree was clean before the run.
4. **Triage the output in this order.** Warnings first, because some change runtime behavior. Then leftovers and comments. Then next steps.
5. **Verify.** Reinstall with `yarn`, run the formatter, then type-check, lint, test, and build. If the app uses Module Federation, test the host and its remotes together.

If the codemod has already run, ask the user to paste the warnings and the leftovers list. If they can't, find the old names yourself (for `scope-swap`). Exclude lockfiles and build output:

```sh
grep -rn "@codecademy/gamut" --exclude-dir=node_modules --exclude-dir=dist --exclude=yarn.lock .
```

## Preset: scope-swap

Moves `@codecademy/gamut*` to `@skillsoft/gamut*`. Its migrations: `deep-imports`, `moved-exports`, `markdown-video-overrides`, `mf-shared`, `eslint-comments`, `scope-rename`, `package-json`, `eslint-config`, `mdx-imports`, `yarnrc`, `tsconfig-dom`, `next-config`. Run `--only=deep-imports,scope-rename` to run a subset.

### Warnings

Each warning starts with `[migration-name] file:line`. The migration name tells you what to check. A skipped migration prints `[migration-name] skipped: <reason>` before the run. `eslint-comments` skips itself when the repo has a flat ESLint config (see Leftovers).

| Migration                  | Warning starts with                                                             | What to do                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deep-imports`             | `unmapped deep import '…'`                                                      | The codemod has no mapping for this path. Find the symbol in the installed `@skillsoft/gamut` types. If it's exported from the root, import it from there. If it isn't public, don't deep-import the `dist` path. Ask the Gamut team.                                                                                                                                                                |
| `deep-imports`             | `… has no public replacement`                                                   | `ButtonBase` is deliberately private. Use `FillButton`, `StrokeButton`, `TextButton`, `IconButton`, or `CTAButton`. See the `gamut-buttons` skill for which one.                                                                                                                                                                                                                                     |
| `deep-imports`             | `… is only partly public`                                                       | Only some names from this path are public. Inline the styles, or use system props or `css()`. See `gamut-style-utilities` and `gamut-system-props`.                                                                                                                                                                                                                                                  |
| `deep-imports`             | `deep import … in a mock or require() needs a manual rewrite`                   | Rewrite the mock or `require()` path by hand.                                                                                                                                                                                                                                                                                                                                                        |
| `deep-imports`             | `rewrote … in a mock or require(). That now covers the whole package`           | `jest.mock` of a deep path now mocks the whole package. Check the test still mocks what it needs. If the rename list applies, update renamed names too.                                                                                                                                                                                                                                              |
| `moved-exports`            | `namespace import uses …`                                                       | `import * as Gamut` can't be rewritten safely. Replace it with named imports. `Video` and `VideoProps` come from `@skillsoft/gamut/Video`.                                                                                                                                                                                                                                                           |
| `moved-exports`            | `'export *' from … no longer re-exports …`                                      | Add an explicit re-export from `@skillsoft/gamut/Video` if other code depends on it.                                                                                                                                                                                                                                                                                                                 |
| `moved-exports`            | `mock of … stubs Video/VideoProps`                                              | Mock `@skillsoft/gamut/Video` instead of the root package.                                                                                                                                                                                                                                                                                                                                           |
| `markdown-video-overrides` | `skipDefaultOverrides is not an object literal` or `… is not a boolean literal` | The codemod couldn't tell whether this `<Markdown>` opted out of iframes or videos. Pass `iframeOverride={Iframe}` and `videoOverride={MarkdownVideo}` (both from `@skillsoft/gamut/Video`) unless it skipped them.                                                                                                                                                                                  |
| `markdown-video-overrides` | `a different import already uses the name Iframe or MarkdownVideo`              | Import the overrides under another local name and pass them by hand.                                                                                                                                                                                                                                                                                                                                 |
| `scope-rename`             | `'@codecademy/gamut-kit' has no replacement package`                            | `gamut-kit` is removed, with no `@skillsoft` replacement. Depend on the individual packages it bundled.                                                                                                                                                                                                                                                                                              |
| `scope-rename`             | `renamed N package-name string(s) outside imports. Check the diff.`             | Review those lines in the diff. They're usually config or log strings, and a few may not be package names at all.                                                                                                                                                                                                                                                                                    |
| `package-json`             | `…: replaced '@codecademy/gamut-kit' with its individual packages`              | The individual packages are written at the release range (`^<version>`), not at the kit's old version. They all land in the field `gamut-kit` was in, so `@skillsoft/gamut-tests` may end up in `dependencies`. Move it to `devDependencies` if it belongs there.                                                                                                                                    |
| `package-json`             | `… is newer than …, the last release … matches`                                 | The app was on a newer upstream release than `@skillsoft` has synced. Expect type errors where the code uses what that release added. Check the upstream CHANGELOG, and ask the Gamut team before working around it.                                                                                                                                                                                 |
| `mf-shared`                | `replaced … in Module Federation shared config`                                 | This is a runtime change. Gamut is now actually shared as a singleton, so host and remotes must agree. Update each remote's shared config to match and deploy them together.                                                                                                                                                                                                                         |
| `next-config`              | `` `experimental.esmExternals: false` makes Next require() … ``                 | A runtime change. Builds can fail when Next collects page data. See [NEXT_EMOTION_INTEROP.md](NEXT_EMOTION_INTEROP.md), then rebuild every Next app the warning names. Removing the flag is necessary but not always enough: an app can still fail at prerender afterwards (`reading 'push'` on a page, `reading 'slice'` on a dynamic route). Build each app and fix each failing route on its own. |
| `tsconfig-dom`             | `"lib" has no "dom"`                                                            | The root import used to bring in DOM types through `Video`. Add `"dom"` to that tsconfig's `lib` only if type-checking now fails on `document`, `HTMLElement`, `ResizeObserver`, and similar. The codemod warns only in projects that import `@skillsoft/gamut`, so a worker or script project that never imports Gamut doesn't need it.                                                             |

### Leftovers

The leftovers list shows every line that still names an old package. The codemod doesn't rewrite these, and the regex can produce false positives. Go through them one by one:

- **Jest `moduleNameMapper` regexes and tsconfig `paths`.** Update them to the `@skillsoft/*` names. A stale mapper makes tests fail to resolve modules.
- **Flat ESLint configs (`eslint.config.*`) and `.eslintrc.js`.** The codemod doesn't rewrite these. Only the package import changes (`import gamut from '@skillsoft/eslint-plugin-gamut'`). The rule prefix and directive prefix must match the key the plugin is registered under, or ESLint reports rules it can't find:
  - Flat config: the prefix is the `plugins` key. With `plugins: { gamut }`, rules and directives stay `gamut/<rule>`. When the repo has a flat config, `eslint-comments` leaves directives alone.
  - Legacy `.eslintrc` / `.eslintrc.json`: `eslint-config` and `eslint-comments` move everything to `plugin:@skillsoft/gamut/...` and `@skillsoft/gamut/<rule>`.
  - To rename the flat-config key, rename the key, every rule key, and every directive together.
- **Scripts and CI that read `@codecademy/gamut-kit`.** Version-sync scripts like `sync-gamut-deps` read the kit's `package.json` from `node_modules` and exit when it's missing, which fails CI. Delete them, or make them check that every `@skillsoft` Gamut package uses the same version (they're released together). Update the docs that point to them. The CI job that runs the script fails too: search `.github/workflows` for it (for example `sync-gamut-deps --check`), and change or remove that job in the same change.
- **Storybook config, docs, and comments.** Update them or leave them, but know they still say the old name.
- **Code samples in `.mdx`.** Fenced code blocks are left alone on purpose. Update them by hand if they matter.
- **Files the parser skipped.** Every file is parsed as `tsx`, so Flow-typed JavaScript is skipped. Fix any old names left in those files by hand.

Don't edit `yarn.lock` by hand. Reinstalling updates it.

### Runs from an older codemod build

Migrations match the old `@codecademy` names, so running a newer build over a repo that's already been swapped does nothing for code that has already been renamed. If the first run used an older build (a pkg.pr.new preview, say), check by hand what newer builds handle:

- **Directives under a flat config.** Older builds rewrote `gamut/` directives to `@skillsoft/gamut/` even when the flat config registers the plugin as `gamut`. Change them back. Lint doesn't always flag this, because a directive that names an unknown rule just stops suppressing anything. Current builds list these in the leftovers, with a note, unless a config registers the plugin as `'@skillsoft/gamut'`.
- **Duplicate imports.** Older `deep-imports` builds added a second `import … from '@skillsoft/gamut'` next to the existing one. `eslint --fix` merges them (`import/no-duplicates`).
- **`<Markdown>` iframes and videos.** Current builds skip `markdown-video-overrides` when the repo is already on upstream 74.0.0 or newer, because those apps already pass the overrides where they want them. On an older upstream release, add them as described under `markdown-video-overrides` above.
- **`esmExternals: false` and newer-than-source versions.** Run `npx @skillsoft/gamut-codemods scope-swap . --dry` with the current build. Report-only migrations like `next-config`, `tsconfig-dom`, and `package-json` still warn.

### Next steps

After the migrations finish:

1. Reinstall with `yarn`.
2. Run the formatter and lint autofix (`prettier --write`, then `eslint --fix`). Split imports from `moved-exports` come out in recast's style, and `@skillsoft` sorts differently from `@codecademy`, so import-order rules like `simple-import-sort` fail until you do.
3. Type-check, run tests, and build.
4. If the app uses Module Federation, run the host and every remote together.
5. If the app depends on preview builds, point every `@skillsoft/*` package at the same preview (including `@skillsoft/eslint-plugin-gamut`) and pin them all with `resolutions`. The codemod README has the exact JSON. Published releases don't need it.

### Common failures

| Symptom                                                                                                                 | Likely cause                                                                                                                                                                | Fix                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Module '"@skillsoft/gamut"' has no exported member 'Video'`                                                            | `Video` was imported from the root                                                                                                                                          | Import from `@skillsoft/gamut/Video`.                                                                                                                                                                                                                                                                                          |
| `Cannot find name 'document'`, `HTMLElement`, or `ResizeObserver`                                                       | The affected tsconfig's `lib` has no `"dom"`                                                                                                                                | Add `"dom"` to that tsconfig's `compilerOptions.lib`.                                                                                                                                                                                                                                                                          |
| Components render unstyled, or theme values don't apply                                                                 | Two copies of `@skillsoft/gamut-styles` or `@skillsoft/variance` are installed                                                                                              | Run `yarn why @skillsoft/gamut-styles`. Make every `@skillsoft/*` package resolve to one version. Pin previews with `resolutions`. After a `resolutions` pin, `yarn why` can list two lock locators for one package. Check `node_modules/<package>/package.json` for the copies that are actually installed; one copy is fine. |
| `MenuList`, `MenuListItem`, or `IconOptionComponent` is not exported                                                    | Menu's `List*` and SelectDropdown's `IconOption` were renamed on the way to the root                                                                                        | Import the new name. Keep the local alias if the code relies on it, e.g. `import { MenuList as List }`.                                                                                                                                                                                                                        |
| Jest can't resolve `@skillsoft/...` modules, or a mock doesn't apply                                                    | A stale `moduleNameMapper` regex, or a mock still points at the root package                                                                                                | Update the mapper. Mock `@skillsoft/gamut/Video` for `Video`.                                                                                                                                                                                                                                                                  |
| `Cannot find module '@skillsoft/gamut/Video'`, or `MenuList` is missing, right after install                            | The installed `@skillsoft/gamut` is older than the codemod. A range like `^0.0.1` can resolve to a release cut before these changes                                         | Check `node_modules/@skillsoft/gamut/package.json` and its `exports`. Point at a build that has them (a newer release, or the matching preview), not at the old deep paths.                                                                                                                                                    |
| A preview fix doesn't show up after a push, even after `yarn up`                                                        | Yarn treats a `@<pr>.tgz` URL as fixed. The lockfile entry and the global cache keep the first build it fetched                                                             | Delete the `@skillsoft/*` preview entries from `yarn.lock`, the matching `@skillsoft-*-https-*` zips in the Yarn cache (`yarn config get cacheFolder`), and `node_modules/@skillsoft`, then run `yarn`. Check a file you know changed before you trust the type-check.                                                         |
| `import/no-duplicates` on `@skillsoft/gamut`, or hundreds of `simple-import-sort` errors                                | Rewritten imports weren't merged or re-sorted                                                                                                                               | Run `eslint --fix`.                                                                                                                                                                                                                                                                                                            |
| `Cannot find module '@codecademy/gamut/dist/...'` after the run                                                         | The file was skipped by the parser, or the path is in a code sample                                                                                                         | Rewrite the import by hand, following the rules above.                                                                                                                                                                                                                                                                         |
| ESLint: `Definition for rule '…' was not found`, or a disable comment does nothing                                      | The plugin key doesn't match the rewritten directives                                                                                                                       | Make the plugin key match the directive prefix (see Leftovers).                                                                                                                                                                                                                                                                |
| Module not found: `@vidstack/react` or `react-player`, after the scope move                                             | The app uses `Video` without the peers it needs. Gamut no longer installs them                                                                                              | `package-json` adds `@vidstack/react` and `react-player` only when the app imports `Video` from gamut, so an app that doesn't use Video doesn't get them. Check its warnings. To add one by hand, use the range Gamut declares: `yarn add @vidstack/react@~1.12.12 react-player@^3.4.0`.                                       |
| Runtime error `Cannot read properties of undefined (reading 'push')` in stylis, from `@emotion/styled` inserting styles | Suspected: two copies of `stylis` in the tree. `@emotion/cache` ships its own, and a root copy at a different version can be picked up for the rest of Gamut. Not confirmed | Run `yarn why stylis`. Remove any root `stylis` the app added by hand; the codemod doesn't add one. If one copy is still at a different version from `@emotion/cache`'s, pin `stylis` in `resolutions` to the version `@emotion/cache` uses, and reload.                                                                       |
| Remotes load a second copy of Gamut at runtime                                                                          | Module Federation `shared` still lists old names on a remote                                                                                                                | Update that remote's `shared` config and deploy it with the host.                                                                                                                                                                                                                                                              |

## Preset: color-roles

`color-roles` moves Gamut color names onto the roles of the generated color system. Run it after `scope-swap`, with the same steps as the Workflow: a `--dry` preview first, then a real run once the user confirms, on a clean tree.

```sh
npx @skillsoft/gamut-codemods color-roles . --dry
```

What it rewrites: renamed and merged color names in the color props (JSX and style objects), `theme.colors.x`, `themed('colors.x')`, and old `--color-*` variables in stylesheets and JS strings. Renames and merges are applied. Anything else is left for a person, marked with a `color-roles:` comment or listed as a warning.

It skips build output (`node_modules`, `dist`, `build`, `coverage`, `.next`, `.nx`, `tmp`) and generated files (`worker-configuration.d.ts`, `next-env.d.ts`), so don't hand-edit those to make the run pass.

Warnings start with `[color-roles]`, `[color-roles-themes]` or `[color-roles-stylesheets]`. Work through them with these rules:

- **`'name' splits into …`, `is retired`, or `is pending`.** The name stays, so it fails the type check. The `color-roles:` comment gives design's rule. Pick the role that rule names for where the color is used, replace the name, then delete the comment. Don't pick by name alone.
- **Palette defaults (`color-roles:palette-default`).** The codemod replaces some old palette names in color props without a comment, because the use is known from the prop. Red becomes an error role: `surface-error` as a fill, `text-error` for text and borders. Green is the same with success (`surface-success`, `text-success`). White becomes `surface-raised` as a fill, `text-inverse` as text, and `border-subtle` as a border. Navy takes the nearest role by brightness: `surface-default` or `surface-sunken` for light fills, `text-subtle` or `text-default` for text, `border-*` for borders. The rules are in `presets/color-roles/decisions.ts`.
  Check each one in context. A red button fill should be `action-danger`, not `surface-error`, so that's the one to look at first. Navy fills at 400 and darker, and any palette name inside a theme lookup or a CSS variable, stay warnings for design.
- **`is an old palette color with no role of its own`.** No role replaces a palette name, and one name can map to different roles by slot: `navy` is a border in one place and text in another. The `color-roles:` comment says where the name is used (a prop, a `theme.colors` lookup, or a CSS variable). Pick the role for that use from design's component map, `COMPONENTS` in `@skillsoft/gamut-brand`'s `src/migration.ts`, then delete the comment.
- **`hyper` and `yellow` (no default yet).** Both stay warnings. They are the old primary and second brand color, so they don't map to a role by name, and the brand decides where they go.
  - `hyper` is the primary. In the light theme it fills primary buttons and marks links and focus. Map it to `action-primary` (with its hover and pressed roles), not to `accent-alt`: `accent-alt` is a second brand color, and it would turn primary buttons into that color.
  - `yellow` is the second brand color. It is the warning feedback color (`surface-warning` and `text-warning`), the dark-mode primary (`action-primary` through the brand's override), and decoration: Gantt tracks, badges, card fills, callouts. Split it by use. Warning goes to the warning roles; decoration goes to `surface-brand` or a `viz-*` series.
  - `accent` and `accent-alt` are palette slots, not roles. No role is named `accent`. A brand sets them, and `surface-brand` and the dark-mode primary read them. Which brand color yellow becomes is a brand decision: Original Codecademy keeps yellow as its accent, and Skillsoft's accent is a different color. Don't pick the accent color for a brand yourself.
- **`blue-500` and `blue` (partly defaulted).** `blue-500` is admin's light-mode primary (`#1557FF`), and bare `blue` is the same color. The codemod maps their text to `action-primary`, because link and focus text is interactive. Fills and borders stay warnings: they mix interactive uses (selection buttons) with decoration (the Skillsoft family block), and only a person can tell them apart. Map those to `action-primary` when they're interactive, and to `surface-brand` or a `viz-*` series when they're decoration.
  Don't map the brand's blue to the Skillsoft primary by hex. Skillsoft's primary is Sapphire, `#1C50BB`, which is close to LX Studio's and Percipio's primary but not the same as admin's blue.
- **`color name built at runtime`.** The codemod can't see the value. Check every name the template can produce, like `${variant}-hover`.
- **Card `variant="navy"` (`color-roles:card-navy`).** `navy` becomes `default`, which renders light. If the card should stay dark, wrap it in a `Background` with the surface color it paints, not a nested `ColorMode`, then delete the comment. Only use `ColorMode mode="dark"` if the whole page is meant to be dark. See "Background or ColorMode" below.
- **`percipioTheme`, `coreTheme`, `PercipioTheme`, `CoreTheme`.** Theme names move to their replacements: `skillsoftTheme`, `originalCodecademyTheme`, and `SkillsoftTheme`. A leftover `CoreTheme` type gets a comment. Brand themes share one shape, typed by `SkillsoftTheme`. That is a type, not a theme to switch to: keep the theme the app already uses.
- **`--color-*` in `.css`, `.scss` or `.less`.** The type check can't see stylesheets, so the leftovers report is the only list of what's left. Indented-syntax `.sass` isn't rewritten. Search those by hand for `--color-`.

**Keep each app's theme.** The codemod doesn't choose a brand theme. An app keeps the one it uses (`originalCodecademyTheme`, `adminTheme`, `platformTheme`, or `skillsoftTheme`). Changing the theme changes the spacing scale: in one repo, numeric `padding` and `border` values failed the type check under `skillsoftTheme` and passed under `originalCodecademyTheme`. Type-check after any theme change.

Checks before you call it done:

1. Run the formatter. The `color-roles:` comments make lines long.
2. Type-check. Any old name the codemod left still fails until someone picks its role.
3. The leftovers report lists no `color-roles:` comment.
4. A second `--dry` run over the result reports nothing new to change.

Don't:

- Replace a split or palette name with a role you chose by look. Use the rule in the comment, or design's component map.
- Delete a `color-roles:` comment without resolving the name it marks.
- Pass `--force` to get past the clean-tree check.

The codemod's README (`@skillsoft/gamut-codemods`, "Running color-roles") lists the positions it covers and its limits.

### Background or ColorMode

`ColorMode` sets the mode for everything inside it. Use it once, at the top of the app or page, where the mode is decided. Inside that, reach for `Background` for any surface that has its own color.

- **`ColorMode`** sets the mode you pass: `mode="light"`, `"dark"` or `"system"`. It doesn't look at the color behind it. Put it at the highest level, the app or page root, and leave it there. Only add a nested `ColorMode` when a smaller area has to be a different mode from the page around it, and say why in a comment.
- **`Background`** paints a `bg` color and picks the mode itself, choosing the one with the most contrast against that color. Its children stay readable whatever mode the page is in. Use it for any surface with a color of its own: a brand gradient, a featured panel, a dark block on a light page. It takes no `mode` prop; that's omitted from its props on purpose.

So a nested `ColorMode` is the exception, not the default. When you find one that wraps a surface, change it to `Background` with the color the surface paints, and check that the mode it picks is right.

## Working through open color decisions

Some palette names have no default, because the right role depends on the brand or the screen. When the user asks you to work through them, do it with them, one decision at a time. Don't pick a role for them.

1. List the open names from the codemod's warnings (`is an old palette color`), grouped by name, with the kind of use (fill, text, border) and a count.
2. For each name, show the uses the way a person can see them: the file, the component, and the prop. Name the candidate roles from the rules in this section, and say which one you'd pick and why.
3. Ask one question per name with the candidate roles as options, and leave room for another role or "keep the warning". Use AskUserQuestion when it's available.
4. Write the answer into `presets/color-roles/decisions.ts` in the codemod, with a comment naming the use it covers. Add a test for it, then run the suite, the type-check and the lint.
5. Record a decision the user made about a brand (which color is the accent, which blue is the primary) in the brand's own file, not in this skill.

Start with the names that have the most sites. Open today: `yellow` (its role depends on the brand), dark navy fills (400 and darker, since the closest surface is light), the `blue-500` and `blue` fills and borders, and the palette names the rules above don't cover.

## Adding a preset

When a preset ships in `@skillsoft/gamut-codemods`, document it here in the same change:

1. Add a row to the Presets table, with the name `list` prints.
2. Add a `## Preset: <name>` section with the command, what it rewrites and skips, the warning prefixes (`[migration-name]`) and what to do about each, and the checks before calling it done.
3. If the preset leaves comments or leftovers for a person, document the marker and how to resolve it, the way `color-roles:` does.
4. Keep the codemod README in step: its preset table and a "Running <name>" section. This skill points there for limits.

## What not to do

- Don't re-add `@codecademy/gamut-kit`, and don't create `@skillsoft/gamut-kit`.`@codecademy/gamut-kit` is deprecated and `@skillsoft/gamut-kit` never existed. Depend on the individual packages it bundled.
- Don't fix a warning by deep-importing a `dist` path. Find a public export, or ask the Gamut team.
- Don't silence a warning or leftover by removing the `@skillsoft` entry it points at.
- Don't bump any `@skillsoft/*` package outside the group's shared version. The packages move together.
- Don't run the codemod on a dirty tree, and don't pass `--force` to get past the check.
- Don't hand-edit build output or generated files to get a run to pass. The codemod skips them on purpose.

## Reporting back

Say what the codemod changed, which warnings and leftovers are still open, which ones you fixed, and what the user should verify by hand. If you haven't seen the codemod output, ask for it before you start guessing at fixes.
