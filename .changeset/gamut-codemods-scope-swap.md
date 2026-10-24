---
'@skillsoft/gamut-codemods': minor
---

Add `@skillsoft/gamut-codemods` with a `scope-swap` preset for moving a repo from `@codecademy/gamut*` to `@skillsoft/gamut*`. Run `npx @skillsoft/gamut-codemods scope-swap .` from a clean working tree. It renames imports, mocks, and dependencies, moves `Video` imports to `@skillsoft/gamut/Video`, rewrites `/dist/` deep imports, replaces `@codecademy/gamut-kit`, and finishes with a list of what's left to fix by hand.
