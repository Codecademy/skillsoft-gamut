import {
  clampChroma,
  converter,
  formatHex,
  inGamut,
  wcagContrast,
} from 'culori';

/*
 * The ramp generator, ported from gamut-sandbox PR #34 (`generate.ts` at dffd84b).
 *
 * One input per family: its hue. Lightness is fixed per grade and shared by
 * every family, so two colors at the same grade read as equally light. Chroma
 * is a percentage of the most sRGB can show at that lightness and hue, so the
 * same curve works for any hue a tenant hands us. Hex falls out last and is
 * never read back as an input.
 */

const toRgb = converter('rgb');
const rgbInGamut = inGamut('rgb');

export const GRADES = [
  100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100,
] as const;

export type Grade = (typeof GRADES)[number];

/* Which grade mirrors which: light-mode grade → its dark-mode partner. */
export const MIRROR: Record<Grade, Grade> = {
  100: 1100,
  200: 1000,
  300: 900,
  400: 800,
  500: 700,
  600: 600,
  700: 500,
  800: 400,
  900: 300,
  1000: 200,
  1100: 100,
};

/* Authored, not derived. Shared by every family at each grade. */
export const FIXED_LIGHTNESS: Record<Grade, number> = {
  100: 0.9862,
  200: 0.9364,
  300: 0.8497,
  400: 0.7628,
  500: 0.6707,
  600: 0.5835,
  700: 0.4972,
  800: 0.4115,
  900: 0.3346,
  1000: 0.2499,
  1100: 0.1925,
};

/*
 * Chroma as a share of the in-gamut maximum at each grade. Peaks at 600, the
 * UI grade in both modes.
 */
export const CHROMA_CURVE: Record<Grade, number> = {
  100: 1.0,
  200: 0.4,
  300: 0.55,
  400: 0.7,
  500: 0.88,
  600: 1.0,
  700: 0.95,
  800: 0.9,
  900: 0.88,
  1000: 0.84,
  1100: 0.8,
};

/* Neutral families keep their hue but take a fifth of the curve. */
export const NEUTRAL_CHROMA_MULTIPLIER = 0.2;

/*
 * Verified by sweep, not solved for: any two grades 500 apart clear 3:1
 * (non-text) and any two 600 apart clear 4.5:1 (text), at every hue.
 */
export const SEPARATION_GUARANTEE = {
  nonText: { minGap: 500, floor: 3 },
  text: { minGap: 600, floor: 4.5 },
} as const;

export interface Rung {
  grade: Grade;
  l: number;
  c: number;
  h: number;
  /* Generated. Never an input. */
  hex: string;
}

export type Ramp = Record<Grade, Rung>;

/* Floor to 4 decimals, so a rounded chroma can never land outside the gamut. */
const floor4 = (x: number): number => Math.floor(x * 1e4) / 1e4;

const oklch = (l: number, c: number, h: number) =>
  ({ mode: 'oklch', l, c, h } as const);

export const oklchToHex = (l: number, c: number, h: number): string =>
  formatHex(clampChroma(toRgb(oklch(l, c, h)), 'rgb'));

/*
 * The largest chroma sRGB can display at this lightness and hue. Bisection,
 * because the sRGB boundary in OKLCH has no closed form.
 */
export const maxChroma = (l: number, h: number): number => {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 40; i += 1) {
    const mid = (lo + hi) / 2;
    if (rgbInGamut(oklch(l, mid, h))) lo = mid;
    else hi = mid;
  }
  return lo;
};

export const rungFor = (h: number, grade: Grade, neutral: boolean): Rung => {
  const l = FIXED_LIGHTNESS[grade];
  const pct = CHROMA_CURVE[grade] * (neutral ? NEUTRAL_CHROMA_MULTIPLIER : 1);
  const c = floor4(maxChroma(l, h) * pct);
  return { grade, l, c, h, hex: oklchToHex(l, c, h) };
};

export const generateRamp = (hue: number, neutral: boolean): Ramp =>
  Object.fromEntries(
    GRADES.map((grade) => [grade, rungFor(hue, grade, neutral)])
  ) as Ramp;

/*
 * WCAG contrast measured on the OKLCH values, not the rounded hex. 8-bit hex
 * can't resolve the differences the ladder is built on.
 */
export const contrast = (
  a: Pick<Rung, 'l' | 'c' | 'h'>,
  b: Pick<Rung, 'l' | 'c' | 'h'>
): number => wcagContrast(oklch(a.l, a.c, a.h), oklch(b.l, b.c, b.h));
