# Color system generator

Build tooling for gamut-styles' color tokens. It takes each brand's hues and
writes the OKLCH palette and roles that the checked-in files under
`src/tokens/generated/` contain.

Nothing under `src/colorSystem/` runs in the browser. The themes import the
generated output, and only the build scripts import this folder. For what the
output contains and how to use it, see the gamut-styles README.

## The pipeline

```
brands/skillsoft.ts         one hue per slot (or just `primary`)
  → brand.ts                fills missing slots, reports the white-label tier
  → ramp.ts                 11 grades per slot: fixed L, chroma as % of gamut
  → roles.ts                43 roles, light + dark, named by slot not hue
  → system.ts               resolved system
  → contentModes.ts         which mode's content goes on each color (build time)
  → validate.ts             contrast guarantees, veil floors, status trio
  → migration.ts            old → new color names and component slots, checked per brand
  → emit.ts                 DTCG-shaped JSON and TS constants
  → scripts/build-tokens.ts writes everything into src/tokens/generated
```

- `build-tokens` refuses to emit if a guarantee or a migration check fails.
- Style Dictionary renders `tokens.css`. The script also writes the three
  `*.tokens.json` files, `tokensCss.ts` and `values.ts`.
- `probe.ts` (tenant probes) is report-only. `validate:tokens` prints the
  results and doesn't assert them.

## Commands

```sh
yarn workspace @skillsoft/gamut-styles build:tokens     # regenerate src/tokens/generated
yarn workspace @skillsoft/gamut-styles validate:tokens  # parity with design's reference fixture and CSS round-trip; prints tenant probes
npx nx test gamut-styles                                # guarantees; values.ts and tokens.css are current
```

Re-run `build:tokens` after any change to a brand input or to the generator,
and commit the output with the change.

## What CI checks

- `nx test` runs in CI. It checks the guarantees, and that `values.ts` and
  `tokens.css` match the generator.
- It does not check the JSON token files. That's a known gap, listed below.
- `validate:tokens` is not run in CI. It's the full report, run by hand.

## Known gaps

- The JSON token files are not covered by the drift test; only `values.ts` and
  `tokens.css` are.
- Brand input isn't validated at the boundary. A non-finite hue is accepted and
  produces a gray ramp, and a brand `name` is written into generated comments
  unchecked.
- The generator's type declarations are emitted into the package build, because
  `tsconfig.lib.json` doesn't exclude this folder. Nothing in the public exports
  imports them.
- Some exported tables are mutable (`DEFAULT_HUES`, `CHROMA_CURVE`,
  `FIXED_LIGHTNESS`, `FALLOFF`, `ROLES`). A consumer that changes one changes
  later builds in the same process.
- `migration.ts` is a rename table: each alias is a rename, merge, split or
  retire. Only rename and merge are mechanical. The codemod keeps its own copy
  of the alias table, so the two can drift.
- The categorical solver isn't ported, so the `viz-*` chart colors aren't
  re-solved for a new brand.
- The reference fixture measures component slots on rounded hex, and this
  generator measures OKLCH floats. The 200-pairing check and its 0.074 ratio
  spread come from that comparison and aren't reproduced by a test in this
  package.

## Naming

Output names are defined in the gamut-styles README. The generator's own
naming rule: a token's name comes from its slot or role, not from its hue, so
changing a brand's hue doesn't rename anything.
