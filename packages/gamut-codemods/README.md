# @skillsoft/gamut-codemods

Codemods for moving a repo onto `@skillsoft/gamut` and between its releases.

## Presets

Each preset is one upgrade. Run them in order if you're more than one behind.

| Preset        | What it's for                                                    |
| ------------- | ---------------------------------------------------------------- |
| `scope-swap`  | Moving from `@codecademy/gamut*` to `@skillsoft/gamut*`          |
| `color-roles` | Moving Gamut color names onto the generated color system's roles |

`npx @skillsoft/gamut-codemods list` shows every preset and the migrations inside it.

## Running scope-swap

Start from a clean working tree. The codemod won't write into uncommitted changes (pass `--force` to override), so `git checkout .` always undoes a run.

```sh
# Preview without writing anything
npx @skillsoft/gamut-codemods scope-swap . --dry

# Run it
npx @skillsoft/gamut-codemods scope-swap .

# Run only some migrations
npx @skillsoft/gamut-codemods scope-swap . --only=moved-exports,scope-rename
```

A run ends with three things:

1. **Warnings**, prefixed with the migration name, e.g. `[moved-exports] src/Player.test.tsx:12 mock of '@codecademy/gamut' stubs Video/VideoProps`. Each one says what to do.
2. **Leftovers**: every line that still names an old package. These are for you to fix: jest `moduleNameMapper` regexes, tsconfig `paths`, flat ESLint configs, comments, and docs.
3. **Next steps**, built from what actually happened in the run.

### Getting help from an AI agent

The `gamut-scope-swap` skill, in [`@skillsoft/gamut-agent-tools`](../gamut-agent-tools/README.md), knows what this codemod does and what it leaves behind. It can go through the warnings and leftovers with you and help fix what the codemod can't rewrite. Install it from the app repo once `@skillsoft/gamut` is in place:

```sh
# Cursor
gamut plugin install cursor

# Claude Code
gamut plugin install claude
```

Then ask the agent to work through the output. Paste the warnings and leftovers, or let it grep for old names. The skill won't run the codemod unless you ask it to.

### Trying it against a preview build

Every skillsoft-gamut pull request publishes installable previews through pkg.pr.new. To test a migration against one:

1. Add the `@skillsoft/*` packages to your root `package.json` first, pointed at the preview URLs. The codemod keeps any `@skillsoft/*` entry that's already there.
2. Preview packages point at each other through commit-pinned URLs, so without help yarn installs a second copy of `gamut-styles`, `variance`, and so on under `@skillsoft/gamut/node_modules`. Pin every `@skillsoft/*` package you use with `resolutions`:

   ```json
   "resolutions": {
     "@skillsoft/gamut": "https://pkg.pr.new/@skillsoft/gamut@<pr>",
     "@skillsoft/gamut-styles": "https://pkg.pr.new/@skillsoft/gamut-styles@<pr>",
     "@skillsoft/variance": "https://pkg.pr.new/@skillsoft/variance@<pr>"
   }
   ```

   Published releases don't need this. The packages share one version through the changesets `fixed` group, so their dependencies on each other line up.

3. Commit, then run the codemod (or pass `--force`).

### What scope-swap changes

| Migration                  | What it does                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `deep-imports`             | `@codecademy/gamut/dist/PopoverContainer/types` → `@codecademy/gamut`, and the rest of the promoted deep imports. Menu's `List*` and SelectDropdown's `IconOption` component were renamed on the way to the root (`MenuList*`, `IconOptionComponent`); local names are kept, so `import { List }` becomes `import { MenuList as List }`. `Form/styles` is only partly public (`formFieldStyles`, `formFieldPaddingStyles`, `conditionalStyles`), so imports of anything else from it are left alone with a warning. A rewritten import is merged into an existing named import from the same package. Also warns on deep imports with no public replacement (`ButtonBase/ButtonBase`) and on ones it doesn't know. |
| `moved-exports`            | Moves `Video` and `VideoProps` off the root import onto `/Video`. Warns on namespace imports, `export *`, and mocks that stub `Video`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `markdown-video-overrides` | Markdown no longer renders `<iframe>` and `<video>` through `Video` by default. Adds `iframeOverride` / `videoOverride` to each `<Markdown>` that didn't skip them, importing `Iframe` and `MarkdownVideo` from `/Video`. Drops the removed `skipDefaultOverrides.iframe` / `.video` keys, writing `iframeOverride={undefined}` where they were `true`. Warns on a `skipDefaultOverrides` it can't read. Skipped when every `@codecademy/gamut` range in the repo is already 74.0.0 or newer, since that release made the change upstream.                                                                                                                                                                         |
| `mf-shared`                | Replaces `@codecademy/gamut-kit` in Module Federation `shared` config with the packages it bundled. Gamut becomes a real singleton, so test the host and remotes together.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `eslint-comments`          | `// eslint-disable-next-line gamut/x` → `@skillsoft/gamut/x`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `scope-rename`             | Every `@codecademy/gamut*` module string becomes `@skillsoft/gamut*`: imports, exports, `require`, `import()`, `jest.mock`/`vi.mock`, `declare module`, and `import('x').T`. Also exact package-name strings elsewhere, like `transpilePackages`, with one warning per file, and package names in comments (`/dist` paths and removed packages are left for the leftovers).                                                                                                                                                                                                                                                                                                                                        |
| `package-json`             | Renames dependencies and sets their versions. A new package that's already listed keeps its value (a preview URL, say), and a `*` peer range stays `*`. Replaces `@codecademy/gamut-kit` with the individual packages.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `eslint-config`            | `.eslintrc` / `.eslintrc.json`: plugin name, `plugin:` extends, and rule keys.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `mdx-imports`              | Runs the migrations above over `import`/`export` statements in `.mdx` files. Fenced code blocks are left alone.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `yarnrc`                   | `.yarnrc.yml` list items, like `npmPreapprovedPackages`: renames old package names, or drops them if a glob like `'@skillsoft/*'` already covers the new one.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `tsconfig-dom`             | Report only. Warns about `tsconfig` files whose `lib` has no `"dom"`, since Video used to supply the DOM types through the root import.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `next-config`              | Report only. Warns about `experimental.esmExternals: false` in `next.config.*`, which breaks default imports from Gamut's `.mjs` files when Next collects page data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### Known limits

- Every file is parsed with the `tsx` parser, so Flow-typed JS won't parse.
- Flat ESLint configs (`eslint.config.*`) and `.eslintrc.js` aren't rewritten. In a flat config the rule prefix is whatever key you register the plugin under, so renaming rule keys blindly would break it. They show up in the leftovers.
- The leftovers report uses regex, not an AST, so expect some false positives.
- The codemod doesn't change how Gamut loads at runtime. Next.js apps with `experimental.esmExternals: false` can fail at build or prerender on `@emotion/*` or `react-select` default imports, with errors like `Element type is invalid ... got: object` or `c(...) is not a function`. `next-config` warns about the flag; remove it, along with any `@emotion/*` aliases that were working around it. If you can't yet, see [NEXT_EMOTION_INTEROP.md](../gamut-agent-tools/skills/gamut-scope-swap/NEXT_EMOTION_INTEROP.md) for the fallback.

## Running color-roles

```sh
npx @skillsoft/gamut-codemods color-roles . --dry
npx @skillsoft/gamut-codemods color-roles .
```

It maps today's color names (`text`, `primary`, `background-current`, …) onto the roles of the generated color system, using design's migration map (`aliases.ts`, generated from gamut-styles `colorSystem/migration.ts`).

| Design's kind     | What the codemod does                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Rename, merge     | Replaces the name: `bg="background-primary"` → `bg="surface-default"`, `theme.colors.text` → `theme.colors['text-default']`     |
| Split             | Leaves the name and puts `/* color-roles: 'background' splits into surface-raised \| surface-default. <rule> */` in front of it |
| Retire, pending   | The same, with design's rule for what to do instead                                                                             |
| Old palette color | Warns. `navy`, `hyper-500` and the rest have no role of their own; design maps them per component                               |

A name left in place is still an old name, so it fails the type check until someone picks its role. The leftovers report lists every `color-roles:` comment still in the code; delete each one once its name is resolved.

It looks for color names where a color goes: the color props (`color`, `textColor`, `bg`, `borderColor`, `borderColor{X,Y,Left,Right,Top,Bottom}`) in JSX and in style objects, including ternaries, `&&`, and responsive objects and arrays; `theme.colors.x` and `theme.colors['x']`; and `themed('colors.x')`. `variant="primary"` and other strings that only look like color names are left alone.

Limits:

- A name held in a variable before it reaches a color prop (`const bg = 'background'`) isn't seen.
- Names built at runtime (`` `${variant}-hover` ``) only warn.
- MDX bodies aren't rewritten.

On gamut's own source (branch `cass-color-brands`), a run changes 60 files and 273 lines, warns 171 times (about 120 splits, retirements and pending names, 50 old palette colors, 3 runtime names), and takes the type errors from 284 to 145. A second run changes nothing.

## Contributing

### How it's put together

```
src/
  presets/
    index.ts                 # every preset the CLI can run
    <preset>/
      index.ts               # ordered migrations + next-steps checklist
      manifest.ts            # the data: what changed in this release
  migrations/<name>/
    index.ts                 # a reusable migration
    __testfixtures__/        # <case>.input.<ext>, .output.<ext>, optional .warnings.json
  lib/                       # shared types, module-string finder, leftovers, git guard
  transform.ts               # jscodeshift entry point
  cli.ts, bin.ts
```

Two rules hold it together:

- **Manifests hold the data; migrations hold the code.** Most Gamut changes need a manifest row and a fixture, not a new migration.
- **Manifests use the old package names.** In `scope-swap`, `scope-rename` runs last and swaps the scope, so nothing before it needs to know the new one.

### Three kinds of migration

- **`splice`** (the default choice): uses the AST to find ranges, then edits the original text by offset. Use it for anything that swaps one string for another. recast never prints the file, so nothing else in it moves.
- **`ast`**: mutates the AST, and recast prints the file. Only for structural rewrites like splitting an import. recast can reprint more than you changed: mutating one string literal in a semicolon-less file added semicolons and changed JSX text whitespace in neighbouring statements. Presets must list every `ast` migration before any `splice` one, and `validatePreset` enforces it.
- **`file`**: gets raw text for files its `appliesTo()` accepts (package.json, .eslintrc).

### Changing a preset's manifest

1. Add the row to `src/presets/<preset>/manifest.ts`.
2. Add a fixture pair under the migration that handles it, e.g. `src/migrations/moved-exports/__testfixtures__/my-case.input.tsx` and `.output.tsx`.
3. If it should warn, add `my-case.warnings.json`: a list of substrings that must appear in the warnings.
4. `yarn nx test gamut-codemods`.

`manifest.test.ts` type-checks every export a manifest points at against the built packages, so a row can't promise an export that doesn't exist.

### Adding a migration

1. Create `src/migrations/<name>/index.ts` exporting an `AstMigration`, `SpliceMigration`, or `FileMigration` (see `src/lib/types.ts`).
2. Add it to the presets that need it. In `scope-swap`, put it before `scope-rename` if it matches on old names.
3. Add fixtures. They're picked up automatically, and every source migration is also checked for idempotence.
4. If you find a new place a module name can appear, teach `lib/module-strings.ts` rather than special-casing it.
5. If it leaves follow-up work, call `note('<key>')` and add the key to the preset's `conditionalChecklist`.

### Adding a preset

Create `src/presets/<name>/` with a manifest and an `index.ts`, register it in `src/presets/index.ts`, and reuse migrations from `src/migrations`.

### recast gotchas already hit

- Rebuild specifiers instead of mutating them. Changing `imported` on `import { List }` drops the alias, because `imported` and `local` share one source range.
- Clone nodes before moving them into a new declaration, or recast's patcher can crash.
- `insertAfter` and `replace(a, b)` copy the gap after the original node, which can leave a stray blank line. `moved-exports.postPrint` closes that specific gap.
