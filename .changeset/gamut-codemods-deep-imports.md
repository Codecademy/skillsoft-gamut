---
'@skillsoft/gamut-codemods': minor
---

`scope-swap` now rewrites `/dist/` deep imports that have a public replacement to the package root, and merges them into an existing import from the same package. Renamed exports keep their local name, so `import { List } from '@codecademy/gamut/dist/Menu/elements'` becomes `import { MenuList as List } from '@skillsoft/gamut'`. Imports of names that stayed internal, deep imports with no public replacement (`ButtonBase`), unknown deep imports, and deep paths in mocks or `require()` get a warning.
