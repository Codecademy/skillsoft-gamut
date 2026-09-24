# @skillsoft/gamut-codemods

Codemods for moving a repo onto `@skillsoft/gamut` and between its releases.

## Presets

Each preset is one upgrade. Run them in order if you're more than one behind.

| Preset       | What it's for                                           |
| ------------ | ------------------------------------------------------- |
| `scope-swap` | Moving from `@codecademy/gamut*` to `@skillsoft/gamut*` |

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

### What scope-swap changes

| Migration         | What it does                                                                                                                                                                                                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deep-imports`    | `@codecademy/gamut/dist/PopoverContainer/types` → `@codecademy/gamut`, and the rest of the promoted deep imports. Warns on deep imports with no public replacement (`Menu/elements`, `Form/SelectDropdown/elements`, `ButtonBase/ButtonBase`, `Form/styles`) and on ones it doesn't know. |
| `moved-exports`   | Moves `Video` and `VideoProps` off the root import onto `/Video`. Warns on namespace imports, `export *`, and mocks that stub `Video`.                                                                                                                                                    |
| `mf-shared`       | Replaces `@codecademy/gamut-kit` in Module Federation `shared` config with the packages it bundled. Gamut becomes a real singleton, so test the host and remotes together.                                                                                                                |
| `eslint-comments` | `// eslint-disable-next-line gamut/x` → `@skillsoft/gamut/x`.                                                                                                                                                                                                                             |
| `scope-rename`    | Every `@codecademy/gamut*` module string becomes `@skillsoft/gamut*`: imports, exports, `require`, `import()`, `jest.mock`/`vi.mock`, `declare module`, and `import('x').T`. Also exact package-name strings elsewhere, like `transpilePackages`, with one warning per file.              |
| `package-json`    | Renames dependencies and sets their versions. Replaces `@codecademy/gamut-kit` with the individual packages.                                                                                                                                                                              |
| `eslint-config`   | `.eslintrc` / `.eslintrc.json`: plugin name, `plugin:` extends, and rule keys.                                                                                                                                                                                                            |

### Known limits

- Every file is parsed with the `tsx` parser, so Flow-typed JS won't parse.
- Flat ESLint configs (`eslint.config.*`) and `.eslintrc.js` aren't rewritten. In a flat config the rule prefix is whatever key you register the plugin under, so renaming rule keys blindly would break it. They show up in the leftovers.
- The leftovers report uses regex, not an AST, so expect some false positives.

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
- **`file`**: gets raw text for files its `match()` accepts (package.json, .eslintrc).

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
