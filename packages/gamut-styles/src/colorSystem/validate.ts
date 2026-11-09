import type { Color as CuloriColor } from 'culori';
import { converter, differenceCiede2000, wcagContrast } from 'culori';

import { SLOTS } from './brand';
import { contentModeFor } from './contentModes';
import { contrast, GRADES, SEPARATION_GUARANTEE } from './ramp';
import type { Mode } from './roles';
import { MODES, ROLES, STATE_ALPHA } from './roles';
import type { Color, ColorSystem } from './system';

/*
 * The guarantees, as a function of any color system — ours or a tenant's.
 * Ported from the checks in gamut-sandbox `scripts/validate-colors.ts` that
 * the token output depends on. Every number is measured on OKLCH floats, not
 * on rounded hex.
 */

export interface Check {
  name: string;
  pass: boolean;
  /* Measured for the record, never fails the run. */
  reported?: boolean;
  /* The tightest measurement the check saw, for the report. */
  worst: number;
  floor: number;
  at: string;
}

const toRgb = converter('rgb');
const deltaE = differenceCiede2000();

const asCulori = (c: Pick<Color, 'l' | 'c' | 'h'>): CuloriColor => ({
  mode: 'oklch',
  l: c.l,
  c: c.c,
  h: c.h,
});

/*
 * Paint `top` at `alpha` over `base`, in gamma-encoded sRGB — what a browser
 * does with an rgba() / oklch(/ a) fill.
 */
export const composite = (
  top: Color,
  alpha: number,
  base: Color | CuloriColor
): CuloriColor => {
  const t = toRgb(asCulori(top));
  const b = 'mode' in base ? toRgb(base) : toRgb(asCulori(base));
  const mix = (x: number, y: number) => alpha * x + (1 - alpha) * y;
  return { mode: 'rgb', r: mix(t.r, b.r), g: mix(t.g, b.g), b: mix(t.b, b.b) };
};

class Tracker {
  worst = Infinity;
  at = '';
  see(value: number, at: string) {
    if (value < this.worst) {
      this.worst = value;
      this.at = at;
    }
  }
}

/* Any two grades 500 apart clear 3:1, 600 apart clear 4.5:1 — every slot pair. */
const gradeSeparation = (system: ColorSystem): Check[] =>
  (['nonText', 'text'] as const).map((kind) => {
    const { minGap, floor } = SEPARATION_GUARANTEE[kind];
    const t = new Tracker();
    for (const a of SLOTS) {
      for (const b of SLOTS) {
        for (const g1 of GRADES) {
          for (const g2 of GRADES) {
            if (g2 - g1 < minGap) continue;
            t.see(
              contrast(system.ramps[a][g1], system.ramps[b][g2]),
              `${a}-${g1} / ${b}-${g2}`
            );
          }
        }
      }
    }
    return {
      name: `grade separation (${minGap} apart, ${kind})`,
      pass: t.worst >= floor,
      worst: t.worst,
      floor,
      at: t.at,
    };
  });

/* Each role against every role it's declared to sit with, in both modes. */
const roleFloors = (system: ColorSystem): Check[] =>
  ROLES.filter((r) => r.floor !== undefined).map((role) => {
    const t = new Tracker();
    for (const mode of MODES) {
      for (const other of role.against ?? []) {
        t.see(
          contrast(system.roles[mode][role.token], system.roles[mode][other]),
          `${mode}: ${other}`
        );
      }
    }
    return {
      name: `${role.token} ≥ ${role.floor}:1`,
      pass: t.worst >= role.floor!,
      worst: t.worst,
      floor: role.floor!,
      at: t.at,
    };
  });

const ELEVATION = ['surface-sunken', 'surface-default', 'surface-raised'];

/* The veil stacks a real element can be in. Selected is the only base. */
const VEIL_STACKS: [string, string[]][] = [
  ['hover', ['state-hover']],
  ['pressed', ['state-pressed']],
  ['selected', ['state-selected']],
  ['selected+hover', ['state-selected', 'state-hover']],
  ['selected+pressed', ['state-selected', 'state-pressed']],
];

/*
 * The sandbox leaves border-default on a selected stack out of scope: "no
 * component pairs a bare border with a selected state". Measured and
 * reported here, not asserted, so the carve-out stays visible.
 */
const isCarvedOut = (token: string, stack: string[]) =>
  token === 'border-default' && stack.includes('state-selected');

/*
 * Every role with a floor still clears it once a state veil is composited
 * over the elevation surface underneath it.
 */
const veilFloors = (system: ColorSystem): Check[] => {
  const asserted = new Tracker();
  const carvedOut = new Tracker();
  for (const role of ROLES) {
    /* Viz marks don't sit on interactive fills; the sandbox doesn't pair them either. */
    if (role.floor === undefined || role.group === 'viz') continue;
    const surfaces = (role.against ?? []).filter((s) => ELEVATION.includes(s));
    for (const mode of MODES) {
      for (const surface of surfaces) {
        for (const [label, stack] of VEIL_STACKS) {
          const fill = stack.reduce<CuloriColor>(
            (acc, token) =>
              composite(
                system.roles[mode][token],
                system.roles[mode][token].alpha!,
                acc
              ),
            asCulori(system.roles[mode][surface])
          );
          const margin =
            wcagContrast(asCulori(system.roles[mode][role.token]), fill) -
            role.floor;
          const where = `${mode}: ${role.token} on ${surface} + ${label}`;
          (isCarvedOut(role.token, stack) ? carvedOut : asserted).see(
            margin,
            where
          );
        }
      }
    }
  }
  return [
    {
      name: 'every floor holds on every state veil (margin over floor)',
      pass: asserted.worst >= 0,
      worst: asserted.worst,
      floor: 0,
      at: asserted.at,
    },
    {
      name: 'carve-out: border-default on selected stacks (margin, reported)',
      pass: true,
      reported: true,
      worst: carvedOut.worst,
      floor: 0,
      at: carvedOut.at,
    },
  ];
};

/* Hover → pressed has to be a visible step, not just an authored one. */
export const STATE_STEP_FLOOR = 1.0;

const hoverPressedStep = (system: ColorSystem): Check => {
  const t = new Tracker();
  for (const mode of MODES as Mode[]) {
    for (const surface of ELEVATION) {
      const base = asCulori(system.roles[mode][surface]);
      const at = (token: keyof typeof STATE_ALPHA) =>
        composite(system.roles[mode][token], STATE_ALPHA[token], base);
      t.see(
        deltaE(at('state-hover'), at('state-pressed')),
        `${mode}: ${surface}`
      );
    }
  }
  return {
    name: `hover → pressed ≥ ${STATE_STEP_FLOOR} ΔE2000`,
    pass: t.worst >= STATE_STEP_FLOOR,
    worst: t.worst,
    floor: STATE_STEP_FLOOR,
    at: t.at,
  };
};

/*
 * Text on a surface, in the mode the content-mode table picks for it. This is
 * the guarantee Background makes, now that it reads the table instead of
 * measuring. Raw palette colors are reported only: a mid-ramp grade can't give
 * AA text in either mode, and that's a reason not to use it as a surface.
 */
const CONTENT_TEXT = ['text-default', 'text-subtle'];

const surfaceContent = (system: ColorSystem): Check[] => {
  const surfaces = new Tracker();
  for (const role of ROLES) {
    if (role.group !== 'surface') continue;
    for (const mode of MODES) {
      const surface = system.roles[mode][role.token];
      const content = contentModeFor(system, surface);
      for (const text of CONTENT_TEXT) {
        surfaces.see(
          contrast(system.roles[content][text], surface),
          `${mode}: ${text} (${content}) on ${role.token}`
        );
      }
    }
  }

  const palette = new Tracker();
  let belowFloor = 0;
  for (const [key, color] of Object.entries(system.palette)) {
    const content = contentModeFor(system, color);
    const measured = contrast(system.roles[content]['text-default'], color);
    if (measured < 4.5) belowFloor += 1;
    palette.see(measured, `text-default (${content}) on ${key}`);
  }

  return [
    {
      name: 'text on every surface role, in its content mode ≥ 4.5:1',
      pass: surfaces.worst >= 4.5,
      worst: surfaces.worst,
      floor: 4.5,
      at: surfaces.at,
    },
    {
      name: `text-default on raw palette colors (reported; ${belowFloor} below 4.5:1)`,
      pass: true,
      reported: true,
      worst: palette.worst,
      floor: 4.5,
      at: palette.at,
    },
  ];
};

export const validate = (system: ColorSystem): Check[] => [
  ...gradeSeparation(system),
  ...roleFloors(system),
  ...veilFloors(system),
  hoverPressedStep(system),
  ...surfaceContent(system),
];
