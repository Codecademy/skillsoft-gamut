---
'@skillsoft/gamut': patch
---

- `@skillsoft/gamut/Video` now resolves under TypeScript's `moduleResolution: "node"` (node10) and in bundlers that ignore `package.json#exports`, through a `Video/package.json` stub.
- Export the `HTMLToReactNode` and `ButtonBaseProps` types from the package root.
