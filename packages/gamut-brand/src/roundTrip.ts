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
/* Removes `/* … *\/` comments by indexOf, not a regex (CodeQL js/polynomial-redos). */
const stripComments = (s: string): string => {
  let out = '';
  let i = 0;
  for (;;) {
    const start = s.indexOf('/*', i);
    const end = start === -1 ? -1 : s.indexOf('*/', start + 2);
    if (start === -1 || end === -1) return out + s.slice(i);
    out += s.slice(i, start);
    i = end + 2;
  }
};

export const parseTokensCss = (
  css: string,
  source: ColorSystem
): ColorSystem => {
  // Plain string splitting rather than a regex: nested quantifiers over
  // untrusted CSS are a ReDoS risk (CodeQL js/polynomial-redos).
  const blocks = css.split('}').flatMap((raw) => {
    // Style Dictionary puts `/** … */` notes after declarations; without
    // stripping them, a note swallows the next declaration's name.
    const chunk = stripComments(raw);
    // Last '{' in the chunk: inside an @media block the inner rule's
    // selector comes after the at-rule's own brace.
    const open = chunk.lastIndexOf('{');
    if (open === -1) return [];
    const head = chunk.slice(0, open).split(';').pop()!;
    const decls: Record<string, string> = {};
    for (const decl of chunk.slice(open + 1).split(';')) {
      const colon = decl.indexOf(':');
      const name = decl.slice(0, colon).trim();
      if (colon === -1 || !/^--[\w-]+$/.test(name)) continue;
      decls[name] = decl.slice(colon + 1).trim();
    }
    return [
      {
        selectors: head.trim().split('\n').pop()!.trim().split(/,\s*/),
        decls,
      },
    ];
  });
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
