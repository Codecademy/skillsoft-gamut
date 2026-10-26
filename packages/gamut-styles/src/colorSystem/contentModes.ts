import { contrast } from './ramp';
import type { Mode } from './roles';
import { MODES } from './roles';
import type { Color, ColorSystem } from './system';

/*
 * Which mode's content sits on a color, decided at build time.
 *
 * Background used to work this out at runtime, with polished's contrast math
 * on every render. The rule is the same — the mode whose `text-default`
 * contrasts most with the color — but measured once, on the OKLCH floats, and
 * shipped as data. A zero-runtime engine can't measure contrast at all, so
 * this table is what a CSS-only Background reads: put the color down, then
 * set `data-color-mode` to the mode listed here.
 */

export const contentModeFor = (system: ColorSystem, color: Color): Mode =>
  MODES.reduce((best, mode) =>
    contrast(system.roles[mode]['text-default'], color) >
    contrast(system.roles[best]['text-default'], color)
      ? mode
      : best
  );

/* Every opaque palette color → the mode its content uses. */
export const contentModes = (system: ColorSystem): Record<string, Mode> =>
  Object.fromEntries(
    Object.entries(system.palette).map(([key, color]) => [
      key,
      contentModeFor(system, color),
    ])
  );
