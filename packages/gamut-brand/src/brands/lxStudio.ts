import type { BrandInput } from '../brand';

/*
 * LX Studio: old lxStudio rebuilt on the generated system. Old lxStudio was
 * old core with a sapphire primary, a near-white page (lxStudioBgPrimary)
 * and its own success green in light mode. Everything else is core's: navy
 * text, yellow accent, red danger and orange warning (as Original Codecademy
 * reads it). Old lxStudio has no second accent, so `accent-alt` stays on the
 * gamut default.
 *
 * The yellow accent is generated like any other slot, not pinned to core's
 * grades, and dark mode keeps the generated sapphire primary rather than
 * core's yellow one (2026-10-29).
 *
 * Navy isn't pinned, as for Original Codecademy: pinned, it carries much
 * more chroma than the generated surfaces beside it (design, 2026-10-29).
 * The near-white page is nearly achromatic, so it stays exact.
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
    },
    /* As for Original Codecademy: primary + accent-alt, not blue to yellow. */
    gradients: {
      'surface-brand': { accent: 'accent-alt' },
    },
  },
};
