import type { BrandInput } from '../brand';
import { BRANDS, DEFAULT_BRAND } from '../brands';
import { validateMigration } from '../migration';
import type { Grade } from '../ramp';
import {
  CHROMA_CURVE,
  contrast,
  FIXED_LIGHTNESS,
  generateRamp,
  GRADES,
  maxChroma,
  NEUTRAL_CHROMA_MULTIPLIER,
  oklchToHex,
  SEPARATION_GUARANTEE,
} from '../ramp';
import { MODES, ROLE_TOKENS } from '../roles';
import { createColorSystem } from '../system';
import { validate } from '../validate';

/*
  What the generator promises for any brand, not just ours. The values gamut's
  own brands generate are checked in under gamut-styles' src/tokens/generated,
  and `build:tokens --check` fails if they drift, so a change to a value shows
  up as a diff there. These tests hold the rules those values come from.
*/

/* Every 5°, enough to cross each sRGB gamut corner. */
const HUES = Array.from({ length: 72 }, (_, i) => i * 5);

const brands = BRANDS.map((b) => [b.name, b] as const);

describe('ramps', () => {
  it.each(HUES)('hue %i° keeps every rule of the ladder', (hue) => {
    const misses = [false, true].flatMap((neutral) => {
      const ramp = generateRamp(hue, neutral);
      const at = `${neutral ? 'neutral' : 'chromatic'} ${hue}°`;
      return GRADES.flatMap((grade) => {
        const { l, c, h, hex } = ramp[grade];
        const ceiling =
          maxChroma(l, h) *
          CHROMA_CURVE[grade] *
          (neutral ? NEUTRAL_CHROMA_MULTIPLIER : 1);
        return [
          l !== FIXED_LIGHTNESS[grade] && `${at} ${grade}: L ${l}`,
          h !== hue && `${at} ${grade}: H ${h}`,
          c > ceiling && `${at} ${grade}: C ${c} over ${ceiling}`,
          hex !== oklchToHex(l, c, h) && `${at} ${grade}: hex ${hex}`,
        ].filter(Boolean);
      });
    });
    expect(misses).toEqual([]);
  });

  it('gets darker at every grade', () => {
    const ls = GRADES.map((g) => FIXED_LIGHTNESS[g]);
    expect(ls).toEqual([...ls].sort((a, b) => b - a));
    expect(new Set(ls).size).toBe(ls.length);
  });

  it.each(HUES)('hue %i° keeps the separation guarantee', (hue) => {
    const ramp = generateRamp(hue, false);
    const misses = Object.entries(SEPARATION_GUARANTEE).flatMap(
      ([kind, { minGap, floor }]) =>
        GRADES.flatMap((a) =>
          GRADES.filter((b) => b - a >= minGap).flatMap((b: Grade) => {
            const ratio = contrast(ramp[a], ramp[b]);
            return ratio < floor
              ? [`${kind}: ${a} on ${b} is ${ratio.toFixed(2)}`]
              : [];
          })
        )
    );
    expect(misses).toEqual([]);
  });
});

describe('roles', () => {
  it.each(brands)(
    '%s resolves every role to a palette color in both modes',
    (_, brand) => {
      const system = createColorSystem(brand);
      const misses = MODES.flatMap((mode) =>
        ROLE_TOKENS.flatMap((token) => {
          const value = system.roles[mode][token];
          if (!value) return [`${mode}: ${token} missing`];
          const base = value.key.replace(/-a\d+$/, '');
          return system.palette[base] ? [] : [`${mode}: ${token} → ${base}`];
        })
      );
      expect(misses).toEqual([]);
    }
  );

  /* One role mapping for every brand; only a brand's own role overrides differ. */
  it.each(brands)(
    '%s maps roles like the default brand, except where it overrides them',
    (_, brand) => {
      const base = createColorSystem(DEFAULT_BRAND);
      const system = createColorSystem(brand);
      const differ = MODES.flatMap((mode) =>
        ROLE_TOKENS.filter(
          (t) => system.roles[mode][t].key !== base.roles[mode][t].key
        ).map((t) => `${mode}: ${t}`)
      );
      const overridden = MODES.flatMap((mode) =>
        Object.keys(brand.overrides?.roles?.[mode] ?? {}).map(
          (t) => `${mode}: ${t}`
        )
      );
      expect(differ.sort()).toEqual(overridden.sort());
    }
  );
});

describe('checks', () => {
  const failing = (brand: BrandInput) => {
    const system = createColorSystem(brand);
    return [...validate(system), ...validateMigration(system)]
      .filter((c) => !c.pass)
      .map((c) => `${c.name}: ${c.worst.toFixed(2)} at ${c.at}`);
  };

  it.each(brands)('%s passes every check', (_, brand) => {
    expect(failing(brand)).toEqual([]);
  });

  /* Contrast comes from the fixed lightness, so it can't depend on the hue. */
  it.each(HUES)(
    'a brand with only a primary at %i° passes every check',
    (hue) => {
      expect(failing({ name: 'sweep', hues: { primary: hue } })).toEqual([]);
    }
  );
});
