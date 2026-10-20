---
'@skillsoft/gamut-codemods': minor
---

`scope-swap` now moves `Video` and `VideoProps` imports off the root onto `@skillsoft/gamut/Video`, splitting mixed imports and merging into an existing `/Video` import. Namespace imports, `export *`, and mocks that stub `Video` get a warning instead. A new report-only `tsconfig-dom` migration warns about tsconfig files whose `lib` has no `"dom"`, since Video used to supply the DOM types through the root import.
