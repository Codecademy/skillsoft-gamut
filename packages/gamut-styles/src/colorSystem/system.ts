import { converter, differenceCiede2000, formatHex } from 'culori';

import type { BrandInput, ResolvedBrand, Slot } from './brand';
import { NEUTRAL_SLOTS, resolveBrand, SLOTS, sourceHexes } from './brand';
import type { Grade, Ramp } from './ramp';
import { generateRamp, GRADES, oklchToHex } from './ramp';
import type { Gradient, Mode, Ref, Role, RoleValue } from './roles';
import { MODES, ROLES } from './roles';

/*
 * A brand in, a fully resolved color system out. Pure: no React, no Emotion,
 * no DOM. The build script calls it today; a server or runtime can call it
 * later for tenant themes without a rewrite.
 */

export interface Color {
  l: number;
  c: number;
  h: number;
  alpha?: number;
  hex: string;
}

export interface ResolvedValue extends Color {
  /* The palette key this value comes from, e.g. `palette-primary-800`. */
  key: string;
}

export interface ColorSystem {
  brand: ResolvedBrand;
  ramps: Record<Slot, Ramp>;
  /* Every opaque primitive, keyed as the theme and CSS name it. */
  palette: Record<string, Color>;
  roles: Record<Mode, Record<string, ResolvedValue>>;
  /* Each gradient role's circles, after the brand's gradient overrides. */
  gradients: Record<Mode, Record<string, Gradient>>;
}

const deltaE2000 = differenceCiede2000();
const toOklch = converter('oklch');

export const BOUNDARY: Record<'white' | 'black', Color> = {
  white: { l: 1, c: 0, h: 0, hex: '#ffffff' },
  black: { l: 0, c: 0, h: 0, hex: '#000000' },
};

export const paletteKey = (ref: Ref): string =>
  typeof ref === 'string' ? ref : `palette-${ref.slot}-${ref.grade}`;

/* `palette-primary-600` at 6% → `palette-primary-600-a6`. */
export const valueKey = ({ ref, alpha }: RoleValue): string =>
  alpha === undefined
    ? paletteKey(ref)
    : `${paletteKey(ref)}-a${Math.round(alpha * 100)}`;

export const createColorSystem = (input: BrandInput): ColorSystem => {
  const brand = resolveBrand(input);

  const ramps = Object.fromEntries(
    SLOTS.map((slot) => [
      slot,
      generateRamp(brand.hues[slot], NEUTRAL_SLOTS.includes(slot)),
    ])
  ) as Record<Slot, Ramp>;

  /*
   * Palette overrides, at the precision tokens.css prints (L and C to 4
   * places, H to 2), so the emitted value is the measured one. C is rounded,
   * not floored like a generated rung: the source is already in sRGB, and
   * flooring nudges an edge-of-gamut color like #FFD300 off its hex. Guarded:
   * the rounded value has to land back on the same hex.
   */
  const paletteOverrides = Object.entries(input.overrides?.palette ?? {});
  for (const [key, value] of paletteOverrides) {
    const [, slot, g] = /^(.+)-(\d+)$/.exec(key)!;
    const grade = Number(g) as Grade;
    if (!SLOTS.includes(slot as Slot) || !GRADES.includes(grade)) {
      throw new Error(`${brand.name}: no palette rung ${key}`);
    }
    const hex = formatHex(value)!;
    const exact = toOklch(hex)!;
    const rung = {
      grade,
      l: Number(exact.l.toFixed(4)),
      c: Number(exact.c.toFixed(4)),
      h: Number((exact.h ?? brand.hues[slot as Slot]).toFixed(2)),
      hex,
    };
    if (oklchToHex(rung.l, rung.c, rung.h) !== hex) {
      throw new Error(
        `${brand.name}: ${key} ${hex} doesn't survive 4-dp OKLCH`
      );
    }
    ramps[slot as Slot][grade] = rung;
  }
  if (input.overrides) {
    brand.overrides = {
      ...input.overrides,
      palette: Object.fromEntries(
        paletteOverrides.map(([k, v]) => [k, formatHex(v)!])
      ),
    };
  }

  const sources = Object.entries(sourceHexes(input)) as [Slot, string][];
  if (sources.length) {
    brand.sources = Object.fromEntries(
      sources.map(([slot, hex]) => {
        const [nearest, deltaE] = GRADES.map(
          (g) => [g, deltaE2000(hex, ramps[slot][g].hex)] as const
        ).reduce((a, b) => (b[1] < a[1] ? b : a));
        return [slot, { hex, nearest, deltaE: Number(deltaE.toFixed(2)) }];
      })
    );
  }

  const palette: Record<string, Color> = { ...BOUNDARY };
  for (const slot of SLOTS) {
    for (const grade of GRADES) {
      const { l, c, h, hex } = ramps[slot][grade];
      palette[paletteKey({ slot, grade })] = { l, c, h, hex };
    }
  }

  const resolve = (value: RoleValue): ResolvedValue => {
    const base = palette[paletteKey(value.ref)];
    return value.alpha === undefined
      ? { ...base, key: valueKey(value) }
      : { ...base, alpha: value.alpha, key: valueKey(value) };
  };

  /* Role overrides repoint a role in one mode, keeping its alpha. */
  const roleOverrides = input.overrides?.roles ?? {};
  for (const [mode, tokens] of Object.entries(roleOverrides)) {
    for (const token of Object.keys(tokens ?? {})) {
      if (!ROLES.some((r) => r.token === token)) {
        throw new Error(
          `${brand.name}: no role ${token} to override (${mode})`
        );
      }
    }
  }
  const valueFor = (r: Role, mode: Mode): RoleValue => {
    const ref = roleOverrides[mode]?.[r.token];
    return ref ? { ...r[mode], ref } : r[mode];
  };

  const roles = Object.fromEntries(
    MODES.map((mode) => [
      mode,
      Object.fromEntries(
        ROLES.map((r: Role) => [r.token, resolve(valueFor(r, mode))])
      ),
    ])
  ) as ColorSystem['roles'];

  /* Gradient overrides move a gradient role's circles to another slot. */
  const gradientOverrides = input.overrides?.gradients ?? {};
  for (const [token, slots] of Object.entries(gradientOverrides)) {
    if (!ROLES.some((r) => r.token === token && r.gradient)) {
      throw new Error(`${brand.name}: no gradient role ${token} to override`);
    }
    for (const [from, to] of Object.entries(slots)) {
      if (!SLOTS.includes(from as Slot) || !SLOTS.includes(to)) {
        throw new Error(`${brand.name}: ${token} moves ${from} to ${to}`);
      }
    }
  }
  const gradients = Object.fromEntries(
    MODES.map((mode) => [
      mode,
      Object.fromEntries(
        ROLES.filter((r) => r.gradient).map((r) => {
          const slots = gradientOverrides[r.token] ?? {};
          const circles = r.gradient![mode].circles.map((c) => {
            const to =
              typeof c.ref === 'string' ? undefined : slots[c.ref.slot];
            return to && typeof c.ref !== 'string'
              ? { ...c, ref: { ...c.ref, slot: to } }
              : c;
          });
          return [r.token, { circles }];
        })
      ),
    ])
  ) as ColorSystem['gradients'];

  return { brand, ramps, palette, roles, gradients };
};
