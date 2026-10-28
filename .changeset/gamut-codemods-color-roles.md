---
'@skillsoft/gamut-codemods': minor
---

Add a `color-roles` preset that moves Gamut color names onto the generated color system's roles, using design's migration map.

- Renames and merges are applied. Names that split, were retired or are still pending stay in place, with a `/* color-roles: … */` comment carrying design's rule, and keep failing the type check until someone picks.
- Old palette names (`navy`, `gray-200`) and color names built at runtime get a warning.
- Presets can bring their own manifest type, pre-filter and leftovers report. `scope-swap` is unchanged.
