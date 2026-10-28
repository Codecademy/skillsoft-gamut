import type { Color as CuloriColor } from 'culori';
import {
  differenceCiede2000,
  filterDeficiencyDeuter,
  filterDeficiencyProt,
  filterDeficiencyTrit,
} from 'culori';

import type { BrandInput, Tier } from './brand';
import { validateMigration } from './migration';
import type { Grade } from './ramp';
import { createColorSystem } from './system';
import { validate } from './validate';

/*
 * What a tenant's hues do to the system, before we ship them.
 *
 * Contrast is inherited by construction — the probe re-runs `validate` to
 * prove it, not to discover it. What isn't inherited is anything about hues
 * relative to each other. The status trio is ported here; the categorical
 * separation from gamut-sandbox `probeTenant` is not, because it needs the
 * categorical solver, which is deferred.
 */

/* Below this, the status trio can't be told apart even with an icon. */
export const STATUS_FLOOR = 2.3;

const VISION: [string, (c: CuloriColor) => CuloriColor][] = [
  ['normal', (c) => c],
  ['protanopia', filterDeficiencyProt(1)],
  ['deuteranopia', filterDeficiencyDeuter(1)],
  ['tritanopia', filterDeficiencyTrit(1)],
];

const deltaE = differenceCiede2000();

export interface TenantProbe {
  brand: string;
  tier: Tier;
  derived: string[];
  contrastHolds: boolean;
  failedChecks: string[];
  statusSeparation: number;
  statusWorst: string;
  statusPasses: boolean;
}

/* Worst pairwise ΔE2000 of success / warning / danger at one grade. */
export const statusTrioSeparation = (
  input: BrandInput,
  grade: Grade = 200
): { min: number; at: string } => {
  const { ramps } = createColorSystem(input);
  const trio = (['success', 'warning', 'danger'] as const).map((slot) => ({
    slot,
    color: { mode: 'oklch', ...ramps[slot][grade] } as CuloriColor,
  }));
  let min = Infinity;
  let at = '';
  for (let i = 0; i < trio.length; i += 1) {
    for (let j = i + 1; j < trio.length; j += 1) {
      for (const [vision, sim] of VISION) {
        const d = deltaE(sim(trio[i].color), sim(trio[j].color));
        if (d < min) {
          min = d;
          at = `${trio[i].slot}/${trio[j].slot}, ${vision}`;
        }
      }
    }
  }
  return { min, at };
};

export const probeTenant = (input: BrandInput): TenantProbe => {
  const system = createColorSystem(input);
  const failed = [...validate(system), ...validateMigration(system)].filter(
    (c) => !c.pass
  );
  const status = statusTrioSeparation(input);
  return {
    brand: input.name,
    tier: system.brand.tier,
    derived: Object.keys(system.brand.derived),
    contrastHolds: failed.length === 0,
    failedChecks: failed.map((c) => c.name),
    statusSeparation: status.min,
    statusWorst: status.at,
    statusPasses: status.min >= STATUS_FLOOR,
  };
};
