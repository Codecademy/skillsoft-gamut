---
'@skillsoft/gamut': minor
---

First component in the Storybook testing revamp, ported end-to-end. Dialog's Jest render/interaction tests now live as co-located Storybook stories in packages/gamut (run as browser tests via addon-vitest, with axe a11y), and only the ref-forwarding contracts remain as a co-located node test. The old Jest suite and the styleguide story + mdx are removed.
