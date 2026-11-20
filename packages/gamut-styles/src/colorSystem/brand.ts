import { converter } from 'culori';

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

export interface BrandInput {
  name: string;
  hues: { primary: HueInput } & Partial<Record<Slot, HueInput>>;
}

export type Tier = 1 | 2 | 3 | 4;

export interface ResolvedBrand {
  name: string;
  hues: Record<Slot, number>;
  /* Slots the brand didn't supply, and where their hue came from. */
  derived: Partial<Record<Slot, string>>;
  tier: Tier;
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
