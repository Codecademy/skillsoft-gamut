import type { BrandInput } from '../brand';

/*
 * LX Studio: old lxStudio rebuilt on the generated system. Old lxStudio was
 * old core with a sapphire primary, a near-white page (lxStudioBgPrimary)
 * and its own success green in light mode. Everything else is core's: navy
 * text, yellow accent, red danger, orange warning (as Original Codecademy
 * reads it) and core's dark mode, primary yellow included. Old lxStudio has
 * no second accent, so `accent-alt` stays on the gamut default (sandbox D4).
 *
 * Not carried over: old lxStudio's `interface` on hyper-500 (there's no
 * interface role; interactive color is `action-primary`) and its primary
 * hover on navy-800 (hover grades are design's).
 */
export const lxStudioBrand: BrandInput = {
  name: 'lxStudio',
  hues: {
    'neutral-light': '#FAFBFC', // lxStudioBgPrimary
    'neutral-dark': '#10162F', // core's navy-800, text
    primary: '#1C50BB', // sapphire
    accent: '#FFD300', // core's yellow-500
    danger: '#E91C11', // core's red-500
    warning: '#FF8C00', // core's orange-500, the notice Alert
    success: '#06844F', // lxStudioSuccess
  },
  overrides: {
    palette: {
      'neutral-light-100': '#FAFBFC', // lxStudioBgPrimary
      'neutral-dark-1100': '#10162F', // navy-800
      'accent-300': '#FFD300', // yellow-500
      'accent-400': '#CCA900', // yellow-400
    },
    /* Core's dark mode, which old lxStudio inherits, uses yellow for primary. */
    roles: {
      dark: {
        'action-primary': { slot: 'accent', grade: 300 },
        'action-primary-hover': { slot: 'accent', grade: 400 },
        'action-primary-pressed': { slot: 'accent', grade: 500 },
      },
    },
    /* As for Original Codecademy: primary + accent-alt, not blue to yellow. */
    gradients: {
      'surface-brand': { accent: 'accent-alt' },
    },
  },
};
