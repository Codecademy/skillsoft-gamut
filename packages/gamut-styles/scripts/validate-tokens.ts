/* eslint-disable no-console -- CLI script; the console is its output. */
/*
 * Proves the emitted tokens are the system we meant to ship.
 *
 *   yarn workspace @skillsoft/gamut-styles validate:tokens
 *
 * For each of gamut's brands:
 * 1. The guarantees hold on the source system.
 * 2. The guarantees hold again on values parsed back out of the brand's
 *    tokens.css, so nothing Style Dictionary did (rounding, references) broke
 *    them. gamut-brand refuses to generate a brand that fails this; the
 *    report shows the numbers.
 * 3. The brand's generated files are up to date with the generator.
 * 4. The content-mode table picks what Background's runtime math picked.
 * Then sample tenants, run through the probe.
 *
 * Parity with design's sandbox is a test in @skillsoft/gamut-brand
 * (`src/__tests__/sandboxParity.test.ts`).
 */
import { readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { getContrast } from 'polished';

import type { BrandInput, Check } from '../../gamut-brand/src';
import {
  BRANDS,
  createColorSystem,
  DEFAULT_BRAND,
  probeTenant,
  staleFiles,
  validate,
  validateMigration,
} from '../../gamut-brand/src';
import { contentModes } from '../../gamut-brand/src/contentModes';
import {
  parseTokensCss,
  roundTripMisses,
} from '../../gamut-brand/src/roundTrip';
import type { ColorSystem } from '../../gamut-brand/src/system';

const GENERATED = join(__dirname, '../src/tokens/generated');

let failures = 0;
const report = (ok: boolean, line: string) => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${line}`);
};
const printChecks = (checks: Check[]) => {
  for (const c of checks) {
    const line = `${c.name} — worst ${c.worst.toFixed(3)} (${c.at})`;
    if (c.reported) console.log(`INFO  ${line}`);
    else report(c.pass, line);
  }
};

const TENANTS: BrandInput[] = [
  { name: 'tier 1: warm primary (orange)', hues: { primary: 45 } },
  { name: 'tier 1: primary near our accent', hues: { primary: 290 } },
  { name: 'tier 1: from a hex (#E4002B)', hues: { primary: '#E4002B' } },
  {
    name: 'tier 4: hostile, eight hues in a 40° arc',
    hues: {
      'neutral-light': 250,
      'neutral-dark': 255,
      'accent-alt': 260,
      primary: 265,
      accent: 270,
      danger: 275,
      warning: 280,
      success: 285,
    },
  },
];

/*
 * Background picked a mode by running polished's getContrast on sRGB hex.
 * The table measures OKLCH floats instead, so it can only disagree on a color
 * sitting right at the crossover. Any disagreement is listed.
 *
 * polished rounds to two decimals, so on an exact tie its `>` falls back to
 * light without having measured a difference. A tie isn't a disagreement;
 * it's listed on its own, with the table's pick.
 */
const backgroundParity = (system: ColorSystem) => {
  const table = contentModes(system);
  const text = (mode: 'light' | 'dark') =>
    system.roles[mode]['text-default'].hex;
  const ties: string[] = [];
  const differ = Object.entries(system.palette).filter(([key, { hex }]) => {
    const dark = getContrast(text('dark'), hex);
    const light = getContrast(text('light'), hex);
    if (dark === light) {
      ties.push(`${key} (${dark}:1 both ways, table picks ${table[key]})`);
      return false;
    }
    return (dark > light ? 'dark' : 'light') !== table[key];
  });
  if (ties.length) console.log(`INFO  polished ties: ${ties.join(', ')}`);
  report(
    differ.length === 0,
    `${
      Object.keys(table).length
    } palette colors pick the same mode as runtime Background${
      differ.length ? `; differ: ${differ.map(([k]) => k).join(', ')}` : ''
    }`
  );
};

const main = async () => {
  for (const brand of BRANDS) {
    const system = createColorSystem(brand);
    const dir = join(GENERATED, brand.name);
    const isDefault = brand.name === DEFAULT_BRAND.name;
    console.log(`\n══ ${brand.name}${isDefault ? ' (default)' : ''}`);

    console.log('\n— guarantees, source system');
    printChecks(validate(system));

    console.log('\n— migration map');
    printChecks(validateMigration(system));

    console.log(`\n— guarantees, re-measured on ${brand.name}/tokens.css`);
    const css = await readFile(join(dir, 'tokens.css'), 'utf8');
    const parsed = parseTokensCss(css, system);
    const misses = roundTripMisses(parsed, system);
    report(
      misses.length === 0,
      `tokens.css round-trips every role to the source value and reference${
        misses.length ? `: ${misses.join(', ')}` : ''
      }`
    );
    printChecks([...validate(parsed), ...validateMigration(parsed)]);

    console.log('\n— generated files are current');
    const stale = await staleFiles(brand, dir);
    report(
      stale.length === 0,
      `${brand.name}/ matches the generator${
        stale.length
          ? `; stale: ${stale.map((p) => relative(GENERATED, p)).join(', ')}`
          : ''
      }`
    );

    console.log('\n— content-mode table vs runtime Background');
    backgroundParity(system);
  }

  console.log('\n— tenant probes (reported, not asserted)');
  for (const tenant of [...BRANDS, ...TENANTS]) {
    const p = probeTenant(tenant);
    console.log(
      `INFO  ${p.brand}: tier ${p.tier}, contrast ${
        p.contrastHolds ? 'holds' : `fails (${p.failedChecks.join('; ')})`
      }, status trio ${p.statusSeparation.toFixed(2)} ΔE (${p.statusWorst})${
        p.derived.length ? `, derived: ${p.derived.join(', ')}` : ''
      }`
    );
  }

  console.log(failures ? `\n${failures} failed` : '\nall checks pass');
  process.exit(failures ? 1 : 0);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
