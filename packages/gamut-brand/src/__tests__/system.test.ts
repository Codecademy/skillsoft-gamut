import { originalCodecademyBrand } from '../brands/originalCodecademy';
import { skillsoftBrand } from '../brands/skillsoft';
import { gradientCssVars, toDtcgMode, toDtcgPalette } from '../emit';
import { validateMigration } from '../migration';
import { ROLE_TOKENS, ROLES } from '../roles';
import { createColorSystem } from '../system';
import { validate } from '../validate';

/*
  Generating a brand's files, tokens.css round-trip included, is covered end
  to end in cli.test.ts. The full report for gamut's own brands is
  `yarn workspace @skillsoft/gamut-styles validate:tokens`.
*/
describe('color system', () => {
  const system = createColorSystem(skillsoftBrand);

  it.each(
    [...validate(system), ...validateMigration(system)].filter(
      (c) => !c.reported
    )
  )('$name', (check) => {
    expect(check.worst).toBeGreaterThanOrEqual(check.floor);
  });

  /* RoleToken types brand overrides; it has to name exactly the real roles. */
  it('lists every role in ROLE_TOKENS, in order', () => {
    expect(ROLES.map((r) => r.token)).toEqual([...ROLE_TOKENS]);
  });

  it('derives a tier 1 brand from one hue', () => {
    const tenant = createColorSystem({ name: 'tenant', hues: { primary: 45 } });
    expect(tenant.brand.tier).toBe(1);
    expect(tenant.brand.hues['neutral-dark']).toBe(53.3);
    expect(
      [...validate(tenant), ...validateMigration(tenant)].every((c) => c.pass)
    ).toBe(true);
  });

  /* Only a hex's hue is kept; its distance is reported. */
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
    expect(ocd.brand.sources!.accent!.deltaE).toBe(0);
    /* Navy and beige aren't pinned: their generated steps are used as is. */
    expect(ocd.palette['palette-neutral-dark-1100'].hex).not.toBe('#10162f');
    expect(ocd.brand.sources!['neutral-dark']!.deltaE).toBeGreaterThan(0);
    expect(ocd.roles.dark['action-primary'].key).toBe('palette-accent-300');
    /* Light mode isn't overridden. */
    expect(ocd.roles.light['action-primary'].key).toBe('palette-primary-800');
    expect(
      [...validate(ocd), ...validateMigration(ocd)].every((c) => c.pass)
    ).toBe(true);
  });

  /* Design's shadow roles: key and ambient, per mode. */
  it('draws shadows in the dark neutral in light mode and black in dark', () => {
    expect(system.roles.light['shadow-key'].key).toBe(
      'palette-neutral-dark-1100-a16'
    );
    expect(system.roles.dark['shadow-key'].key).toBe('black-a32');
    expect(system.roles.light['shadow-ambient'].alpha).toBe(0.12);
    expect(system.roles.dark['shadow-ambient'].alpha).toBe(0.24);
    expect(system.roles.light['shadow-scrim'].key).toBe('black-a60');
  });

  /* The Codecademy theme's hard offset has no soft layer. */
  it('lets a role override set alpha, and emits the value it introduces', () => {
    const ocd = createColorSystem(originalCodecademyBrand);
    expect(ocd.roles.light['shadow-ambient'].alpha).toBe(0);
    expect(ocd.roles.dark['shadow-ambient'].key).toBe('black-a0');
    /* A bare ref keeps the role's alpha; only shadow-ambient changes. */
    expect(ocd.roles.light['shadow-key'].alpha).toBe(0.16);
    expect(
      (toDtcgPalette(ocd).palette as Record<string, Record<string, unknown>>)[
        'neutral-dark'
      ]['1100-a0']
    ).toBeDefined();
    expect(system.roles.light['shadow-ambient'].alpha).toBe(0.12);
  });

  /* Figma and other DTCG readers see the brand's overrides, not the defaults. */
  it("writes a brand's role overrides into its DTCG mode file", () => {
    const ocd = createColorSystem(originalCodecademyBrand);
    const dark = toDtcgMode(ocd, 'dark') as Record<string, { $value: string }>;
    expect(dark['action-primary'].$value).toBe('{palette.accent.300}');
    expect(
      (toDtcgMode(system, 'dark') as Record<string, { $value: string }>)[
        'action-primary'
      ].$value
    ).not.toBe('{palette.accent.300}');
  });

  it('moves a gradient to another slot for one brand only', () => {
    const slots = (system: ReturnType<typeof createColorSystem>) =>
      system.gradients.light['surface-brand'].circles.map((c) =>
        typeof c.ref === 'string' ? c.ref : c.ref.slot
      );
    const ocd = createColorSystem(originalCodecademyBrand);
    expect(slots(ocd)).toEqual(['accent-alt', 'primary']);
    expect(
      ocd.gradients.dark['surface-brand'].circles.map((c) => c.ref)
    ).toEqual([
      { slot: 'accent-alt', grade: 900 },
      { slot: 'primary', grade: 900 },
    ]);
    expect(slots(createColorSystem(skillsoftBrand))).toEqual([
      'accent',
      'primary',
    ]);
    expect(gradientCssVars(ocd.gradients.light['surface-brand'])).toContain(
      'radial-gradient(circle calc(0.85 * 100cqw) at 100% -5%, color-mix(in oklab, var(--colors-palette-accent-alt-300)'
    );
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
    expect(
      brand({ gradients: { 'text-default': { accent: 'primary' } } })
    ).toThrow('no gradient role text-default');
    expect(
      brand({ gradients: { 'surface-brand': { accent: 'acent' } } })
    ).toThrow('surface-brand moves accent to acent');
  });
});
