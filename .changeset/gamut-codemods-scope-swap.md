---
'@skillsoft/gamut-codemods': minor
---

Add `@skillsoft/gamut-codemods`, a CLI for moving a repo from `@codecademy/gamut*` to `@skillsoft/gamut*`. Run `npx @skillsoft/gamut-codemods scope-swap .` from a clean working tree. This release adds the runner and the `scope-swap` preset with no migrations yet: a run lists every line that still names an old package and prints next steps. Pass `--dry` to preview, `--only=a,b` to pick migrations, and `--no-report` to skip the leftovers list.
