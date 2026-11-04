import type { BrandInput, ResolvedBrand, Slot } from './brand';
import { NEUTRAL_SLOTS, resolveBrand, SLOTS } from './brand';
import type { Ramp } from './ramp';
import { generateRamp, GRADES } from './ramp';
import type { Mode, Ref, Role, RoleValue } from './roles';
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
}

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

  const roles = Object.fromEntries(
    MODES.map((mode) => [
      mode,
      Object.fromEntries(ROLES.map((r: Role) => [r.token, resolve(r[mode])])),
    ])
  ) as ColorSystem['roles'];

  return { brand, ramps, palette, roles };
};
