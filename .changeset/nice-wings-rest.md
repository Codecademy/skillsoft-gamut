---
'@skillsoft/gamut': minor
---

Migrates a batch of components out of the retiring packages/styleguide into co-located .stories.tsx files in packages/gamut/src, as stories-as-tests under @storybook/addon-vitest. Stories are regrouped from the old Atoms/Molecules taxonomy into semantic sidebar categories that match the new docs site, behavioral coverage from the old Jest tests is folded into play functions, and node-only tests are kept co-located for concerns that can't run in the browser.
