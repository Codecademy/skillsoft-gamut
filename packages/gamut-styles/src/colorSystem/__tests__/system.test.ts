import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { skillsoftBrand } from '../brands/skillsoft';
import { toTsModule } from '../emit';
import { validateMigration } from '../migration';
import { createColorSystem } from '../system';
import { validate } from '../validate';

/* The full report, including the tokens.css round-trip, is `yarn validate:tokens`. */
describe('color system', () => {
  const system = createColorSystem(skillsoftBrand);

  it.each(
    [...validate(system), ...validateMigration(system)].filter(
      (c) => !c.reported
    )
  )('$name', (check) => {
    expect(check.worst).toBeGreaterThanOrEqual(check.floor);
  });

  it('generated values are current — run `yarn build:tokens`', () => {
    const generated = readFileSync(
      join(__dirname, '../../tokens/generated/values.ts'),
      'utf8'
    );
    expect(generated).toBe(toTsModule(system));
  });

  it('derives a tier 1 brand from one hue', () => {
    const tenant = createColorSystem({ name: 'tenant', hues: { primary: 45 } });
    expect(tenant.brand.tier).toBe(1);
    expect(tenant.brand.hues['neutral-dark']).toBe(53.3);
    expect(
      [...validate(tenant), ...validateMigration(tenant)].every((c) => c.pass)
    ).toBe(true);
  });
});
