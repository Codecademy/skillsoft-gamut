---
'@skillsoft/gamut': minor
---

Export `formFieldStyles`, `formFieldPaddingStyles`, and `conditionalStyles` from the package root, for custom inputs that should look like `Input`, such as third-party hosted payment fields. The rest of `Form/styles` stays internal. Coming from `@codecademy/gamut/dist/Form/styles`, `npx @skillsoft/gamut-codemods scope-swap .` rewrites imports of these three.
