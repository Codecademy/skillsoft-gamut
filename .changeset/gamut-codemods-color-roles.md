---
'@skillsoft/gamut-codemods': minor
---

Add a `color-roles` preset that moves Gamut color names onto the generated color system's roles, using design's migration map.

- Renames and merges are applied. Names that split, were retired or are still pending stay in place, with a `/* color-roles: … */` comment carrying design's rule, and keep failing the type check until someone picks.
- Old palette names (`navy`, `gray-200`) and color names built at runtime get a warning.
- Old `--color-*` CSS variables are renamed to `--color-<role>` in `.css`, `.scss` and `.less` files and inside JS strings and template literals; splits get the same comment. The type check can't see stylesheets, so the leftovers report lists every one left. Indented-syntax `.sass` isn't rewritten.
- Card's `variant` moves onto design's two: `white`, `beige` and `navy` become `default`, `yellow` and `hyper` become `brand`. A `navy` card gets a comment, since it now renders light.
- Old theme names move to the brand themes that replace them: `percipioTheme` → `skillsoftTheme`, `coreTheme` → `originalCodecademyTheme`, and the `PercipioTheme` type → `SkillsoftTheme`. An aliased import (`percipioTheme as theme`) only changes the imported name. A `CoreTheme` type gets a comment pointing at `SkillsoftTheme`, which types every brand.
- Follows design's map: `shadow-primary` and `shadow-secondary` split onto `shadow-key` and `shadow-ambient`.
- Presets can bring their own manifest type, pre-filter and leftovers report. `scope-swap` is unchanged.
- The source run skips build output and caches (`.next`, `.nx`, `coverage`, `tmp`, plus the dirs it already skipped), so a dry run over an app no longer reads its bundles. `tsconfig-dom` warns only where gamut is imported.
- `scope-swap`'s `package-json` migration adds the peers the new packages need at runtime and no longer install: `@vidstack/react` and `react-player` for `@skillsoft/gamut`, and `stylis` for `@skillsoft/gamut-styles`. Each gets the range the package declares, and only when the app depends on a package that needs it and doesn't list it yet.
- Themes differ in their spacing scale. In our repo, numeric spacing values (`padding`, `border` and similar) failed the type check under `skillsoftTheme` and passed under `originalCodecademyTheme`. Switching the theme changes that scale, so pick the theme the app was on, not the one the codemod's docs suggest.
