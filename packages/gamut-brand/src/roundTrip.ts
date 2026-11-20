import type { Slot } from './brand';
import { SLOTS } from './brand';
import type { Ramp } from './ramp';
import { GRADES } from './ramp';
import { MODES, ROLES } from './roles';
import type { ColorSystem, ResolvedValue } from './system';

/*
 * Reads a brand's tokens.css back into a ColorSystem-shaped object: palette
 * values from the `[data-brand]` block, and each role's var() resolved inside
 * its mode block. The generator re-runs every check on the result, so what
 * ships is what was checked, whatever Style Dictionary did to the values
 * (rounding, references) on the way out.
 */
export const parseTokensCss = (
  css: string,
  source: ColorSystem
): ColorSystem => {
  const blocks = [...css.matchAll(/([^{};]+)\{([^{}]*)\}/g)].map((m) => ({
    selectors: m[1].trim().split('\n').pop()!.trim().split(/,\s*/),
    decls: Object.fromEntries(
      [...m[2].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((d) => [d[1], d[2]])
    ),
  }));
  const block = (selector: string) => {
    const found = blocks.find((b) => b.selectors.includes(selector));
    if (!found) throw new Error(`tokens.css has no ${selector} block`);
    return found.decls;
  };
  const palette = block(`[data-brand="${source.brand.name}"]`);
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
    SLOTS.map((slot: Slot) => [
      slot,
      Object.fromEntries(
        GRADES.map((grade) => {
          const p = oklch(palette[`--color-palette-${slot}-${grade}`]);
          return [grade, { grade, l: p.l, c: p.c, h: p.h, hex: '' }];
        })
      ),
    ])
  ) as Record<Slot, Ramp>;

  const roles = Object.fromEntries(
    MODES.map((mode) => {
      const decls = block(`[data-color-mode="${mode}"]`);
      return [
        mode,
        Object.fromEntries(
          ROLES.map((r) => {
            const ref =
              decls[`--color-${r.token}`]?.match(/^var\((--[\w-]+)\)$/);
            if (!ref) throw new Error(`${r.token} (${mode}) is not a var()`);
            const value: ResolvedValue = {
              ...oklch(palette[ref[1]]),
              hex: '',
              key: ref[1].replace(/^--color-/, ''),
            };
            return [r.token, value];
          })
        ),
      ];
    })
  ) as ColorSystem['roles'];

  return { ...source, ramps, roles };
};

/* Every role, in both modes, whose parsed value or reference isn't the source's. */
export const roundTripMisses = (
  parsed: ColorSystem,
  source: ColorSystem
): string[] => {
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
  return misses;
};
