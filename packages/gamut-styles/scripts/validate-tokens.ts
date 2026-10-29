/* eslint-disable no-console -- CLI script; the console is its output. */
/*
 * Proves the emitted tokens are the system we meant to ship.
 *
 *   yarn workspace @skillsoft/gamut-styles validate:tokens
 *
 * 1. The ported generator reproduces gamut-sandbox at dffd84b exactly.
 * 2. The guarantees hold on the source system.
 * 3. The guarantees hold again on values parsed back out of tokens.css —
 *    so nothing Style Dictionary did (rounding, references) broke them.
 * 4. The generated files are up to date with the generator.
 * 5. The content-mode table picks what Background's runtime math picked.
 * 6. Sample tenants, run through the probe.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getContrast } from 'polished';

import type { BrandInput, Slot } from '../src/colorSystem/brand';
import { SLOTS } from '../src/colorSystem/brand';
import { BRANDS, DEFAULT_BRAND } from '../src/colorSystem/brands';
import { contentModes } from '../src/colorSystem/contentModes';
import { toTsModule } from '../src/colorSystem/emit';
import { validateMigration } from '../src/colorSystem/migration';
import { probeTenant } from '../src/colorSystem/probe';
import type { Grade, Ramp } from '../src/colorSystem/ramp';
import { GRADES } from '../src/colorSystem/ramp';
import { MODES, ROLES } from '../src/colorSystem/roles';
import type { ColorSystem, ResolvedValue } from '../src/colorSystem/system';
import { createColorSystem } from '../src/colorSystem/system';
import type { Check } from '../src/colorSystem/validate';
import { validate } from '../src/colorSystem/validate';

const ROOT = join(__dirname, '..');
const GENERATED = join(ROOT, 'src/tokens/generated');

const FAMILY_TO_SLOT: Record<string, Slot> = {
  'neutral-light': 'neutral-light',
  'neutral-dark': 'neutral-dark',
  blue: 'primary',
  magenta: 'accent',
  violet: 'accent-alt',
  red: 'danger',
  amber: 'warning',
  teal: 'success',
};

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

const sandboxParity = async (system: ColorSystem) => {
  const fixture = JSON.parse(
    await readFile(
      join(ROOT, 'src/colorSystem/__fixtures__/sandbox-dffd84b.json'),
      'utf8'
    )
  );
  let rungs = 0;
  const rungMisses: string[] = [];
  for (const [family, f] of Object.entries<any>(fixture.families)) {
    for (const [grade, r] of Object.entries<any>(f.rungs)) {
      rungs += 1;
      const mine = system.ramps[FAMILY_TO_SLOT[family]][Number(grade) as Grade];
      if (mine.l !== r.l || mine.c !== r.c || mine.hex !== r.hex) {
        rungMisses.push(`${family}-${grade}`);
      }
    }
  }
  report(
    rungMisses.length === 0,
    `${rungs} rungs match sandbox (l, c to 4 dp; hex exact)${
      rungMisses.length ? `: ${rungMisses.join(', ')}` : ''
    }`
  );

  const toKey = (primitive: string) => {
    const base = primitive.split(' @ ')[0];
    if (base === 'white' || base === 'black') return base;
    const i = base.lastIndexOf('-');
    return `palette-${FAMILY_TO_SLOT[base.slice(0, i)]}-${base.slice(i + 1)}`;
  };
  const roleMisses: string[] = [];
  for (const r of fixture.roles) {
    for (const mode of MODES) {
      const mine = system.roles[mode][r.token];
      const gradient = r[mode].primitive.includes(' on ');
      const sameRef =
        gradient || mine.key.replace(/-a\d+$/, '') === toKey(r[mode].primitive);
      if (!mine || !sameRef || mine.hex !== r[mode].hex) {
        roleMisses.push(`${r.token} (${mode})`);
      }
    }
  }
  report(
    roleMisses.length === 0,
    `${fixture.roles.length} roles × 2 modes match sandbox (primitive + hex)${
      roleMisses.length ? `: ${roleMisses.join(', ')}` : ''
    }`
  );
};

/*
 * Read tokens.css back into a ColorSystem-shaped object for one brand:
 * palette values from the :root block with the brand's `[data-brand]` block
 * over it, each role's var() resolved inside its mode block.
 */
const parseCss = (css: string, source: ColorSystem): ColorSystem => {
  const blocks = [...css.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map((m) => ({
    selector: m[1].trim().split('\n').pop()!.trim(),
    decls: Object.fromEntries(
      [...m[2].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((d) => [d[1], d[2]])
    ),
  }));
  const brandBlock = (selector: string) =>
    blocks.find((b) => b.selector.split(', ').includes(selector))?.decls;
  const root = {
    ...brandBlock(':root')!,
    ...brandBlock(`[data-brand="${source.brand.name}"]`)!,
  };
  const oklch = (value: string) => {
    const m = value.match(
      /^oklch\(([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)$/
    );
    if (!m) throw new Error(`not an oklch() value: ${value}`);
    return {
      l: Number(m[1]),
      c: Number(m[2]),
      h: Number(m[3]),
      alpha: m[4] === undefined ? undefined : Number(m[4]),
    };
  };

  const ramps = Object.fromEntries(
    SLOTS.map((slot) => [
      slot,
      Object.fromEntries(
        GRADES.map((grade) => {
          const p = oklch(root[`--colors-palette-${slot}-${grade}`]);
          return [grade, { grade, l: p.l, c: p.c, h: p.h, hex: '' }];
        })
      ),
    ])
  ) as Record<Slot, Ramp>;

  const roles = Object.fromEntries(
    MODES.map((mode) => {
      /* The shared mode block, with this brand's role overrides over it. */
      const block = {
        ...blocks.find((b) =>
          b.selector.split(', ').includes(`[data-color-mode="${mode}"]`)
        )!.decls,
        ...blocks.find(
          (b) =>
            b.selector ===
            `[data-brand="${source.brand.name}"][data-color-mode="${mode}"]`
        )?.decls,
      };
      return [
        mode,
        Object.fromEntries(
          ROLES.map((r) => {
            const ref =
              block[`--colors-${r.token}`].match(/^var\((--[\w-]+)\)$/);
            if (!ref) throw new Error(`${r.token} (${mode}) is not a var()`);
            const p = oklch(root[ref[1]]);
            const value: ResolvedValue = {
              ...p,
              hex: '',
              key: ref[1].replace(/^--colors-/, ''),
            };
            return [r.token, value];
          })
        ),
      ];
    })
  ) as ColorSystem['roles'];

  return { ...source, ramps, roles };
};

const emittedMatchesSource = (parsed: ColorSystem, source: ColorSystem) => {
  const misses: string[] = [];
  for (const mode of MODES) {
    for (const r of ROLES) {
      const a = parsed.roles[mode][r.token];
      const b = source.roles[mode][r.token];
      const same =
        a.key === b.key &&
        a.l === b.l &&
        a.c === b.c &&
        a.h === b.h &&
        a.alpha === b.alpha;
      if (!same) misses.push(`${r.token} (${mode})`);
    }
  }
  report(
    misses.length === 0,
    `tokens.css round-trips every role to the source value and reference${
      misses.length ? `: ${misses.join(', ')}` : ''
    }`
  );
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
 */
const backgroundParity = (system: ColorSystem) => {
  const table = contentModes(system);
  const text = (mode: 'light' | 'dark') =>
    system.roles[mode]['text-default'].hex;
  const differ = Object.entries(system.palette).filter(([key, { hex }]) => {
    const runtime =
      getContrast(text('dark'), hex) > getContrast(text('light'), hex)
        ? 'dark'
        : 'light';
    return runtime !== table[key];
  });
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
  const css = await readFile(join(GENERATED, 'tokens.css'), 'utf8');

  for (const brand of BRANDS) {
    const system = createColorSystem(brand);
    const isDefault = brand.name === DEFAULT_BRAND.name;
    console.log(`\n══ ${brand.name}${isDefault ? ' (default)' : ''}`);

    if (isDefault) {
      console.log('\n— sandbox parity (dffd84b)');
      await sandboxParity(system);
    }

    console.log('\n— guarantees, source system');
    printChecks(validate(system));

    console.log('\n— migration map (sandbox c363244)');
    printChecks(validateMigration(system));

    console.log('\n— guarantees, re-measured on tokens.css');
    const parsed = parseCss(css, system);
    emittedMatchesSource(parsed, system);
    printChecks([...validate(parsed), ...validateMigration(parsed)]);

    console.log('\n— generated files are current');
    const file = isDefault ? 'values.ts' : `brands/${brand.name}.values.ts`;
    const ts = await readFile(join(GENERATED, file), 'utf8');
    report(ts === toTsModule(system), `${file} matches the generator`);

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
