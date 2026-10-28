import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { tokensCss } from '../../tokens/generated/tokensCss';
import { originalCodecademyBrand } from '../brands/originalCodecademy';
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

  it('tokensCss is tokens.css — run `yarn build:tokens`', () => {
    const css = readFileSync(
      join(__dirname, '../../tokens/generated/tokens.css'),
      'utf8'
    );
    expect(tokensCss).toBe(css);
  });

  it('derives a tier 1 brand from one hue', () => {
    const tenant = createColorSystem({ name: 'tenant', hues: { primary: 45 } });
    expect(tenant.brand.tier).toBe(1);
    expect(tenant.brand.hues['neutral-dark']).toBe(53.3);
    expect(
      [...validate(tenant), ...validateMigration(tenant)].every((c) => c.pass)
    ).toBe(true);
  });

  /* Sandbox D1: only a hex's hue is kept; its distance is reported. */
  it('keeps the hue of a supplied hex and reports how far it lands', () => {
    const tenant = createColorSystem({
      name: 'tenant',
      hues: { primary: '#3A10E5' },
    });
    expect(tenant.brand.hues.primary).toBe(274.1);
    expect(tenant.brand.derived.accent).toBe('held at the gamut default');

    const { hex, nearest, deltaE } = tenant.brand.sources!.primary!;
    expect(hex).toBe('#3a10e5');
    expect(tenant.palette[`palette-primary-${nearest}`].hex).not.toBe(hex);
    expect(deltaE).toBeGreaterThan(0);
  });

  it('applies palette and role overrides, and still measures them', () => {
    const ocd = createColorSystem(originalCodecademyBrand);
    expect(ocd.palette['palette-accent-300'].hex).toBe('#ffd300');
    expect(ocd.palette['palette-neutral-dark-1100'].hex).toBe('#10162f');
    expect(ocd.brand.sources!['neutral-dark']!.deltaE).toBe(0);
    expect(ocd.roles.dark['action-primary'].key).toBe('palette-accent-300');
    /* Light mode isn't overridden. */
    expect(ocd.roles.light['action-primary'].key).toBe('palette-primary-800');
    expect(
      [...validate(ocd), ...validateMigration(ocd)].every((c) => c.pass)
    ).toBe(true);
  });

  it('refuses an override it cannot place', () => {
    const brand = (overrides: object) => () =>
      createColorSystem({ name: 'x', hues: { primary: 45 }, overrides });
    expect(
      brand({
        roles: { dark: { 'action-primry': { slot: 'accent', grade: 300 } } },
      })
    ).toThrow('no role action-primry');
    expect(brand({ palette: { 'primary-150': '#000000' } })).toThrow(
      'no palette rung primary-150'
    );
  });
});
