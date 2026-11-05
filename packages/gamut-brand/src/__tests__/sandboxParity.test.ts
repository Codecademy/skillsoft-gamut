import sandbox from '../__fixtures__/sandbox.json';
import type { Slot } from '../brand';
import { DEFAULT_BRAND } from '../brands';
import type { Grade } from '../ramp';
import { MODES } from '../roles';
import { createColorSystem } from '../system';

/*
  The generator is a port of design's sandbox. This test holds it to the
  sandbox's own output, saved in `__fixtures__/sandbox.json`: every palette
  step and every role, in both modes, for the default brand (the sandbox's
  only brand).

  The fixture records which sandbox commit it came from. When design changes
  the sandbox, re-dump it with `yarn workspace @skillsoft/gamut-brand
  dump:sandbox <sandbox checkout>`, port the change, and this test says what
  still differs. A failure without a sandbox change means the generator
  drifted.
*/

const source = `${sandbox.source.repo} ${sandbox.source.branch} at ${sandbox.source.commit}`;

/* The sandbox names its families by hue; the port names them by job. */
const FAMILY_TO_SLOT: Record<string, Slot> = {
  'neutral-light': 'neutral-light',
  'neutral-dark': 'neutral-dark',
  blue: 'primary',
  magenta: 'accent',
  violet: 'accent-alt',
  red: 'danger',
  amber: 'warning',
  teal: 'success',
};

/* `magenta-300 @ 12%` → `palette-accent-300`; white and black keep their names. */
const paletteKey = (primitive: string) => {
  const base = primitive.split(' @ ')[0];
  if (base === 'white' || base === 'black') return base;
  const i = base.lastIndexOf('-');
  return `palette-${FAMILY_TO_SLOT[base.slice(0, i)]}-${base.slice(i + 1)}`;
};

describe(`color system matches design's sandbox (${source})`, () => {
  const system = createColorSystem(DEFAULT_BRAND);

  it('has every sandbox family as a slot', () => {
    const unmapped = Object.keys(sandbox.families).filter(
      (family) => !FAMILY_TO_SLOT[family]
    );
    expect(unmapped).toEqual([]);
  });

  it('reproduces every palette step (OKLCH to 4 dp, hex exact)', () => {
    const misses = Object.entries(sandbox.families).flatMap(([family, f]) =>
      Object.entries(f.rungs).flatMap(([grade, theirs]) => {
        const ours =
          system.ramps[FAMILY_TO_SLOT[family]][Number(grade) as Grade];
        const same =
          ours.l === theirs.l && ours.c === theirs.c && ours.hex === theirs.hex;
        return same
          ? []
          : [
              `${family}-${grade}: sandbox ${theirs.hex}, ours ${ours.hex} (l ${ours.l} vs ${theirs.l}, c ${ours.c} vs ${theirs.c})`,
            ];
      })
    );
    expect(misses).toEqual([]);
  });

  it('has the same roles', () => {
    const theirs = sandbox.roles.map((r) => r.token).sort();
    const ours = Object.keys(system.roles.light).sort();
    expect(ours).toEqual(theirs);
  });

  it.each(sandbox.roles)(
    '$token points at the same palette color in both modes',
    (role) => {
      const misses = MODES.flatMap((mode) => {
        const ours = system.roles[mode][role.token];
        const theirs = role[mode];
        /* A gradient (`… on …`) has no single palette ref; its hex is still compared. */
        const gradient = theirs.primitive.includes(' on ');
        const sameRef =
          gradient ||
          ours.key.replace(/-a\d+$/, '') === paletteKey(theirs.primitive);
        return sameRef && ours.hex === theirs.hex
          ? []
          : [
              `${mode}: sandbox ${theirs.primitive} (${theirs.hex}), ours ${ours.key} (${ours.hex})`,
            ];
      });
      expect(misses).toEqual([]);
    }
  );
});
