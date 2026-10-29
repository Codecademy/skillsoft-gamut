import { converter, formatHex } from 'culori';

import type { Grade } from './ramp';
import type { Mode, Ref } from './roles';

/*
 * Brands, as data.
 *
 * Roles never name a hue ("blue-800"). They name a slot ("primary-800"), and a
 * brand maps slots to hues. White-labelling a tenant means writing a new
 * `BrandInput`, not a new theme.
 *
 * A brand only has to supply `primary`. Anything it leaves out is filled in by
 * the derivation rules below (gamut-sandbox `whiteLabel.ts`, D1–D4), and the
 * resolved brand reports which tier that puts it on.
 */

export const SLOTS = [
  'neutral-light',
  'neutral-dark',
  'primary',
  'accent',
  'accent-alt',
  'danger',
  'warning',
  'success',
] as const;

export type Slot = (typeof SLOTS)[number];

export const NEUTRAL_SLOTS: readonly Slot[] = ['neutral-light', 'neutral-dark'];
export const STATUS_SLOTS: readonly Slot[] = ['success', 'warning', 'danger'];
export const ACCENT_SLOTS: readonly Slot[] = ['accent', 'accent-alt'];

/* A hue in degrees, or a hex to take the OKLCH hue from. */
export type HueInput = number | string;

/*
 * Manual overrides, for a brand that has to keep a color the generator
 * wouldn't produce (Original Codecademy's yellow). They depart from the
 * sandbox, whose D1 keeps only a hex's hue, so they're explicit and few. Each
 * one is still measured: the build refuses a brand whose overrides break a
 * guarantee.
 *
 * - `palette`: an exact hex in place of a generated rung, keyed `slot-grade`.
 *   Pick the grade whose fixed lightness is nearest, or the ladder bends.
 * - `roles`: a role pointed at another palette color in one mode.
 * - `gradients`: a gradient role's circles moved from one slot to another,
 *   in both modes. Grades, sizes and positions stay design's.
 */
export interface BrandOverrides {
  palette?: Partial<Record<`${Slot}-${Grade}`, string>>;
  roles?: Partial<Record<Mode, Record<string, Ref>>>;
  gradients?: Record<string, Partial<Record<Slot, Slot>>>;
}

export interface BrandInput {
  name: string;
  hues: { primary: HueInput } & Partial<Record<Slot, HueInput>>;
  overrides?: BrandOverrides;
}

export type Tier = 1 | 2 | 3 | 4;

/*
 * How far a supplied hex lands from its family's nearest generated rung
 * (sandbox D1: only the hue is kept, and the distance is reported rather than
 * hidden). Filled in by createColorSystem, which has the ramps.
 */
export interface SourceDistance {
  hex: string;
  nearest: Grade;
  deltaE: number;
}

export interface ResolvedBrand {
  name: string;
  hues: Record<Slot, number>;
  /* Slots the brand didn't supply, and where their hue came from. */
  derived: Partial<Record<Slot, string>>;
  tier: Tier;
  /* Slots supplied as a hex, measured after overrides. */
  sources?: Partial<Record<Slot, SourceDistance>>;
  overrides?: BrandOverrides;
}

/*
 * The cool neutral sits a few degrees past the primary. Skillsoft's navy and
 * Sapphire already measure this offset (270.7° vs 262.4°); nobody arranged it.
 */
export const COOL_NEUTRAL_OFFSET = 8.3;

/* The warm neutral sits opposite the cool one. Skillsoft's pair is 177° apart. */
export const WARM_NEUTRAL_OFFSET = 180;

/*
 * Status and accent hues a tenant doesn't supply stay on these. They aren't
 * free parameters: red means error everywhere, and amber/teal were solved for
 * status-trio separation under color-vision deficiency.
 */
export const DEFAULT_HUES: Record<Slot, number> = {
  'neutral-light': 93.7,
  'neutral-dark': 270.7,
  primary: 262.4,
  accent: 357.3,
  'accent-alt': 287.1,
  danger: 17.3,
  warning: 88.0,
  success: 200.0,
};

const toOklch = converter('oklch');

const wrap = (deg: number): number =>
  Number((((deg % 360) + 360) % 360).toFixed(1));

export const hueOf = (input: HueInput): number => {
  if (typeof input === 'number') return wrap(input);
  const color = toOklch(input);
  if (color?.h === undefined) {
    throw new Error(`"${input}" has no hue — supply a chromatic color`);
  }
  return wrap(color.h);
};

const tierOf = (supplied: Set<Slot>): Tier => {
  if (SLOTS.every((s) => supplied.has(s))) return 4;
  if (STATUS_SLOTS.every((s) => supplied.has(s))) return 3;
  if (NEUTRAL_SLOTS.every((s) => supplied.has(s))) return 2;
  return 1;
};

export const resolveBrand = (input: BrandInput): ResolvedBrand => {
  const supplied = new Set(Object.keys(input.hues) as Slot[]);
  const hues = {} as Record<Slot, number>;
  const derived: ResolvedBrand['derived'] = {};

  for (const slot of supplied) hues[slot] = hueOf(input.hues[slot]!);

  if (!supplied.has('neutral-dark')) {
    hues['neutral-dark'] = supplied.has('neutral-light')
      ? wrap(hues['neutral-light'] - WARM_NEUTRAL_OFFSET)
      : wrap(hues.primary + COOL_NEUTRAL_OFFSET);
    derived['neutral-dark'] = supplied.has('neutral-light')
      ? 'opposite neutral-light'
      : `primary + ${COOL_NEUTRAL_OFFSET}°`;
  }
  if (!supplied.has('neutral-light')) {
    hues['neutral-light'] = wrap(hues['neutral-dark'] + WARM_NEUTRAL_OFFSET);
    derived['neutral-light'] = 'opposite neutral-dark';
  }
  for (const slot of [...STATUS_SLOTS, ...ACCENT_SLOTS]) {
    if (supplied.has(slot)) continue;
    hues[slot] = DEFAULT_HUES[slot];
    derived[slot] = 'held at the gamut default';
  }

  return { name: input.name, hues, derived, tier: tierOf(supplied) };
};

/* The supplied hexes, normalized, by slot. Numbers carry no source color. */
export const sourceHexes = (input: BrandInput): Partial<Record<Slot, string>> =>
  Object.fromEntries(
    Object.entries(input.hues)
      .filter(([, v]) => typeof v === 'string')
      .map(([slot, v]) => [slot, formatHex(v as string)!])
  );
