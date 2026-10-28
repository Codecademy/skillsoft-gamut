# Color system (spike)

**Spike, not shipped API.** Branch `cass-color-spike`. Validates the generated
OKLCH color system from gamut-sandbox PR #34 (`stacey/color-tokens-v2`, pinned
at `dffd84b`; generator and roles unchanged through `c363244`) as a tokens-only output of gamut-styles. Research, decisions and
findings live in Base Camp: `gamut/color-tokens/`.

## The pipeline

```
brands/skillsoft.ts         one hue per slot (or just `primary`)
  → brand.ts                fills missing slots, reports the white-label tier
  → ramp.ts                 11 grades per slot: fixed L, chroma as % of gamut
  → roles.ts                ~45 roles, light + dark, named by slot not hue
  → system.ts               resolved system
  → contentModes.ts         which mode's content goes on each color (build time)
  → validate.ts / probe.ts  contrast guarantees, veil floors, status trio
  → migration.ts            design's old → new map and component slots (sandbox c363244), checked per brand
  → emit.ts                 DTCG 2025.10 JSON + TS constants
  → scripts/build-tokens.ts Style Dictionary → tokens.css
```

Output is checked in at `src/tokens/generated/` and ships as:

| Import                                                            | What                                                                                                                                            |
| ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `@skillsoft/gamut-styles/tokens`                                  | TS constants: `palette`, `roles`, `gradients`, `contentModes` (OKLCH + sRGB per token)                                                          |
| `@skillsoft/gamut-styles/tokens.css`                              | `--colors-*` / `--gradient-*` custom properties. Palette on `:root`; roles on `:root, [data-color-mode="light"]` and `[data-color-mode="dark"]` |
| `@skillsoft/gamut-styles/tokens/{palette,light,dark}.tokens.json` | DTCG 2025.10. Colors are `{ colorSpace: "oklch", components, alpha, hex }`                                                                      |
| `skillsoftTheme` (main entry)                                     | Emotion theme on the new roles; the default theme and what gamut is typed against                                                               |

## The CSS contract (branch `cass-color-css-contract`)

`tokens.css` owns the color values. `skillsoftTheme` carries it as
`tokensCss`, and `GamutProvider` injects it through Emotion, so a React app
gets the colors without loading anything. The static file is for pages
without React or Emotion; an app that loads it itself can pass
`useTokens={false}`.

- A mode switch is an attribute: `data-color-mode="light" | "dark"` on any
  element, nested as deep as you like. Mode blocks also set `color-scheme`,
  `color: var(--colors-text-default)` and a default
  `--colors-background-current`.
- A surface without Emotion: resolve the role to its palette color in the
  outer mode (`roles[mode][role].ref`), paint `var(--colors-<palette>)`, and
  set `data-color-mode` to `contentModes[palette]`. The palette color is the
  same in every mode, so the flip can't change the background under it.
- `Background` reads `theme.contentModes` when the theme has it, and only
  falls back to polished's contrast math on themes that don't.
- Example: Storybook `Foundations/Color system/CSS contract`.

## Commands

```sh
yarn workspace @skillsoft/gamut-styles build:tokens     # regenerate src/tokens/generated
yarn workspace @skillsoft/gamut-styles validate:tokens  # full report (sandbox parity, CSS round-trip, tenant probes)
npx nx test gamut-styles                                # guarantees + generated-files-current, in CI
```

## Naming

- Primitives: `--colors-palette-<slot>-<grade>`, e.g. `--colors-palette-primary-800`.
  Slots: `neutral-light`, `neutral-dark`, `primary`, `accent`, `accent-alt`,
  `danger`, `warning`, `success`. Not for components; use roles.
- Translucent primitives: `--colors-palette-primary-600-a6` (6% alpha), `--colors-black-a60`.
- Roles: `--colors-<role>`, e.g. `--colors-action-primary`.
- `white` / `black` keep their bare names (boundary tokens).

The `--colors-` prefix on primitives is there because variance's `addColors`
always emits `--colors-<key>`; keeping one name for both the Emotion and CSS
routes beat the shorter `--palette-*`.

## Known gaps

- The categorical solver isn't ported. `viz-1…8` use the slot/grade order the
  sandbox solved for Skillsoft's hues; a tenant gets that order unsolved.
- The theme carries sRGB, not OKLCH: `Background` and `BarChart` run
  polished's `getContrast` on theme values, and polished can't parse `oklch()`.
- Components that reference core primitives directly (`navy-900`, `gray-100`,
  `yellow`, …) render wrong on this theme. Listed in Base Camp `mapping.md`.
- gamut is typed against `skillsoftTheme`, which has no legacy names. The
  other themes are still exported but are no longer what components are
  checked against. `ColorMode` still works on them (`roleOr` falls back to
  the old names).
- `migration.ts` is design's rename table: each alias is a rename, merge,
  split or retire. Only rename and merge are mechanical. It isn't shipped in
  the tokens output; the codemod reads it from source.
- The sandbox measures component slots on rounded hex; this port measures
  OKLCH floats. Same 200 pairings, ratios within 0.074, same pass/fail.
