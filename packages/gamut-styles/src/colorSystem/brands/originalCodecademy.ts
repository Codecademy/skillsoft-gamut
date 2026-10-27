import type { BrandInput } from '../brand';

/*
 * Original Codecademy: old core rebuilt on the generated system, as close to
 * old core's own colors as the system allows. Each slot it supplies takes its
 * hue from the color old core used in that job (variables/colors.ts). Yellow
 * is old core's second brand color (Card, Badge accent, ProgressBar, dark-mode
 * primary), so it fills `accent`, and warning moves to the orange of old
 * core's notice Alert to keep the accent and warning chart colors apart. Old
 * core has no second accent in use, so `accent-alt` stays on the gamut
 * default (sandbox D4), which makes this tier 3.
 *
 * Overrides keep the colors the generator wouldn't produce: navy and beige
 * exactly, and old core's yellow dark-mode primary.
 */
export const originalCodecademyBrand: BrandInput = {
  name: 'originalCodecademy',
  hues: {
    'neutral-light': '#FFF0E5', // beige, background-primary
    'neutral-dark': '#10162F', // navy-800, text
    primary: '#3A10E5', // hyper-500, primary
    accent: '#FFD300', // yellow-500, the second brand color
    danger: '#E91C11', // red-500, danger
    warning: '#FF8C00', // orange-500, the notice Alert
    success: '#008A27', // green-700, feedback-success
  },
  overrides: {
    /* Each at the grade whose fixed lightness is nearest. */
    palette: {
      'neutral-light-100': '#FFF0E5', // beige
      'neutral-dark-1100': '#10162F', // navy-800
      'accent-300': '#FFD300', // yellow-500
      'accent-400': '#CCA900', // yellow-400
    },
    /* Old core's dark mode uses yellow for primary. */
    roles: {
      dark: {
        'action-primary': { slot: 'accent', grade: 300 },
        'action-primary-hover': { slot: 'accent', grade: 400 },
        'action-primary-pressed': { slot: 'accent', grade: 500 },
      },
    },
  },
};
