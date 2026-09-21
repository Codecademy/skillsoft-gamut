# Fixed release group membership follows consumer coupling, not the dependency graph

Migrating off Nx Release (fully independent per-package versioning) to Changesets, we needed to decide which packages version in lockstep.
The linked Confluence doc ("Fixed NX Release Groups") proposed grouping by internal dependency edges: a `core` fixed group of `gamut`, `gamut-styles`, `variance`, `gamut-icons`, and `gamut-patterns`, plus independent `assets` (`gamut-illustrations`) and `tooling` (`gamut-tests`, `eslint-plugin-gamut`, `gamut-agent-tools`) groups.

The fixed group is `@skillsoft/gamut`, `gamut-styles`, `gamut-icons`, `gamut-patterns`, `variance`, and `gamut-agent-tools`.
`gamut-illustrations`, `gamut-tests`, and `eslint-plugin-gamut` version independently.
`macros` is private and is not published.

The dividing line is whether a consumer expects to upgrade a package alongside the rest of the design system, not whether it declares a `package.json` dependency on `gamut`.
That reasoning pulls `gamut-agent-tools` into the fixed group despite it having no dependency edge, because it ships skill and design documentation describing a specific version of the component API.
If it drifts from `gamut`, agents get instructions for components that don't exist.
`gamut-tests` and `eslint-plugin-gamut` are dev tooling, which a consumer never expects to bump in step with UI changes.
`gamut-illustrations` sits outside the group for a different reason: adoption is thin enough that bumping its version on every design-system release would be churn with no consumer benefit.

The problem this migration solves is that independent versioning left consumers coordinating updates across several `gamut-*` packages to pick up one feature.
Grouping by dependency edges alone wouldn't fix that, since the edges don't describe how consumers actually adopt the packages.

Package boundaries are not settled.
Naming and inter-package dependency direction are both expected to keep moving before 1.0.0.
One example is whether `gamut-styles` is a regular or peer dependency of the React package, so non-React consumers can take design tokens and CSS output on their own.
Group membership needs revisiting as that decomposition evolves (GMT-1761).
