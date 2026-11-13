import type { BrandInput } from '../brand';

/*
 * Skillsoft is tier 4: every slot supplied. Hues come from the brand deck via
 * OKLCH (gamut-sandbox `palette.ts` at dffd84b); only the hue survives, so no
 * brand hex appears verbatim in the ramps.
 */
export const skillsoftBrand: BrandInput = {
  name: 'skillsoft',
  hues: {
    'neutral-light': 93.7, // Paper #FFFBED
    'neutral-dark': 270.7, // Navy #151C36
    primary: 262.4, // Sapphire #1C50BB
    accent: 357.3, // Mulberry #CD427F
    'accent-alt': 287.1, // Lilac #B5B2E7
    danger: 17.3, // Red #FF375B
    warning: 88.0, // no brand source; solved for status-trio separation
    success: 200.0, // no brand source; solved jointly with warning
  },
};
