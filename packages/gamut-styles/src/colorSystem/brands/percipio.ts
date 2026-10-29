import type { BrandInput } from '../brand';

/*
 * Percipio: old percipio rebuilt on the generated system, as close to what
 * it renders today as the system allows. Each slot takes its hue from the
 * color old percipio uses in that job (variables/colors.ts, percipioColors).
 * Old percipio only overrode core's light mode, so the jobs it left alone
 * keep core's colors: yellow is still the accent (Badge, Card, ProgressBar),
 * and dark mode is core's, primary yellow included. Old percipio has no
 * second accent, so `accent-alt` stays on the gamut default (sandbox D4).
 *
 * Its neutrals are nearly gray (chroma 0.002 and 0.004), so their hues
 * carry little; the pins keep the page and text exact. As with Original
 * Codecademy's navy, the text color sits at 1100, one step darker than light
 * mode's text-default.
 */
export const percipioBrand: BrandInput = {
  name: 'percipio',
  hues: {
    'neutral-light': '#FAFBFC', // percipioBgPrimary
    'neutral-dark': '#222325', // percipioTextPrimary
    primary: '#1C50BB', // sapphire
    accent: '#FFD300', // core's yellow-500, inherited
    danger: '#B83C3C', // percipioDanger
    warning: '#EF5B0D', // percipioFeedbackWarning
    success: '#1B8057', // percipioFeedbackSuccess
  },
  overrides: {
    palette: {
      'neutral-light-100': '#FAFBFC', // percipioBgPrimary
      'neutral-dark-1100': '#222325', // percipioTextPrimary
      'accent-300': '#FFD300', // yellow-500
      'accent-400': '#CCA900', // yellow-400
    },
    /* Core's dark mode, which old percipio inherits, uses yellow for primary. */
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
