# Breaking changes: `@codecademy/gamut*` → `@skillsoft/gamut*`

Short list of what changed. The codemod handles most of these. Entries marked **manual** need a person. Source: `packages/gamut-codemods/src/presets/scope-swap/manifest.ts`.

## Packages

- Every `@codecademy/*` Gamut package is now `@skillsoft/*`: `gamut`, `gamut-styles`, `gamut-icons`, `gamut-illustrations`, `gamut-patterns`, `gamut-tests`, and `variance`.
- `eslint-plugin-gamut` is now `@skillsoft/eslint-plugin-gamut`.
- `@codecademy/gamut-kit` is removed, with no replacement. Depend on the individual packages it bundled.

## Imports

- `Video` and `VideoProps` moved off the root. Import them from `@skillsoft/gamut/Video`. **Manual** for namespace imports and `export *`.
- Menu's `List`, `ListProps`, `ListItem`, `ListItemProps`, `ListLink`, `ListLinkProps`, and `ListButton` are renamed `MenuList*` and `MenuListButton`. The codemod keeps local names with an alias, e.g. `MenuList as List`.
- SelectDropdown's `IconOption` is renamed `IconOptionComponent`.
- `ButtonBase` is not public. Use `FillButton`, `StrokeButton`, `TextButton`, `IconButton`, or `CTAButton`. **Manual.**
- From `Form/styles`, only `formFieldStyles`, `formFieldPaddingStyles`, and `conditionalStyles` are public. Anything else there is internal. **Manual.**
- Deep `/dist/` imports for these are promoted to the package root: form and select types, `Box`, `Tip`, `Button`, `Markdown` overrides, `AssetProvider`, the icon `types` and `props`, and the variance config types. Any `dist` path not on that list is unmapped. **Manual.**

## Runtime

- Gamut is now a real singleton. Module Federation host and remotes must share the same version, so update each remote's `shared` config and deploy them together. **Manual.**

## Build and tooling

- `Video` used to bring DOM types in through the root import. Add `"dom"` to a tsconfig's `lib` if type-checking fails after the move. **Manual.**
- ESLint rule prefix `gamut/` becomes `@skillsoft/gamut/` in directives and legacy configs. Rule names don't change. Flat configs need the plugin registered under the matching key. **Manual** for flat configs.
- Jest mocks of the root package that stub `Video` should mock `@skillsoft/gamut/Video`. **Manual.**
