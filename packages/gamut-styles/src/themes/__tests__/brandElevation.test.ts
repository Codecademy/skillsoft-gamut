import { adminTheme } from '../admin';
import { lxStudioTheme } from '../lxStudio';
import { originalCodecademyTheme } from '../originalCodecademy';
import { platformTheme } from '../platform';
import { skillsoftTheme } from '../skillsoft';

/*
 * Brand elevations draw every depth in the shadow roles (sandbox df33b47), so
 * no shadow names a color the brand theme doesn't have. The theme flattens
 * the scale to `<state>-shadow` and `<state>-transform`.
 */
const STATES = ['rest', 'hover', 'hoverMirrored'] as const;

describe('brand elevation', () => {
  it.each([
    ['skillsoft', skillsoftTheme],
    ['originalCodecademy', originalCodecademyTheme],
    ['admin', adminTheme],
    ['platform', platformTheme],
    ['lxStudio', lxStudioTheme],
  ])('%s composes shadow-key and shadow-ambient at every depth', (_, theme) => {
    const elevation = theme.elevation as Record<string, string>;
    for (const state of STATES) {
      const shadow = elevation[`${state}-shadow`];
      expect(shadow).not.toContain('undefined');
      expect(shadow).toContain('var(--colors-shadow-key)');
      expect(shadow).toContain('var(--colors-shadow-ambient)');
    }
  });

  it.each([
    ['skillsoft', skillsoftTheme],
    ['admin', adminTheme],
    ['platform', platformTheme],
    ['lxStudio', lxStudioTheme],
  ])('gives %s the soft raised shadow', (_, theme) => {
    expect(theme.elevation).toMatchObject({
      'rest-shadow':
        '0 1px 4px 0 var(--colors-shadow-key), 0 2px 7px 0 var(--colors-shadow-ambient)',
      'hover-shadow':
        '0 2px 6px 0 var(--colors-shadow-key), 0 6px 16px 0 var(--colors-shadow-ambient)',
    });
  });

  it("gives Original Codecademy old core's hard offset", () => {
    expect(originalCodecademyTheme.elevation).toMatchObject({
      'rest-shadow':
        '-4px 4px 0 0 var(--colors-shadow-key), 0 0 0 0 var(--colors-shadow-ambient)',
      'hover-shadow':
        '-8px 8px 0 0 var(--colors-shadow-key), 0 0 0 0 var(--colors-shadow-ambient)',
      'hover-transform': 'translate(4px, -4px)',
    });
  });

  /* Admin and platform share old core's pins, not its hard-offset shadow. */
  it('makes shadow-ambient transparent for Original Codecademy only', () => {
    const transparent = Object.entries({
      skillsoft: skillsoftTheme,
      originalCodecademy: originalCodecademyTheme,
      admin: adminTheme,
      platform: platformTheme,
      lxStudio: lxStudioTheme,
    })
      .filter(([, theme]) =>
        /--colors-shadow-ambient: var\(--colors-[\w-]+-a0\);/.test(
          theme.tokensCss
        )
      )
      .map(([name]) => name);
    expect(transparent).toEqual(['originalCodecademy']);
  });
});
