---
'@skillsoft/gamut-codemods': minor
---

Add a `color-roles` preset that moves Gamut color names onto the generated color system's roles, using design's migration map.

- Renames and merges are applied. Names that split, were retired or are still pending stay in place, with a `/* color-roles: … */` comment carrying design's rule, and keep failing the type check until someone picks.
- Old palette names (`navy`, `gray-200`) and color names built at runtime get a warning.
- Old `--color-*` CSS variables are renamed to `--colors-<role>` in `.css`, `.scss` and `.less` files and inside JS strings and template literals; splits get the same comment. The type check can't see stylesheets, so the leftovers report lists every one left. Indented-syntax `.sass` isn't rewritten.
- Card's `variant` moves onto design's two: `white`, `beige` and `navy` become `default`, `yellow` and `hyper` become `brand`. A `navy` card gets a comment, since it now renders light.
- Old theme names move to the brand themes that replace them: `percipioTheme` → `skillsoftTheme`, `coreTheme` → `originalCodecademyTheme`, and the `PercipioTheme` type → `SkillsoftTheme`. An aliased import (`percipioTheme as theme`) only changes the imported name. A `CoreTheme` type gets a comment pointing at `SkillsoftTheme`, which types every brand.
- Follows design's map: `shadow-primary` and `shadow-secondary` split onto `shadow-key` and `shadow-ambient`.
- Presets can bring their own manifest type, pre-filter and leftovers report. `scope-swap` is unchanged.
