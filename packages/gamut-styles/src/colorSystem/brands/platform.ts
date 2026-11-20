import type { BrandInput } from '../brand';
import {
  coreFamilyOverrides,
  originalCodecademyBrand,
} from './originalCodecademy';

/*
 * Platform (the learning environment): old platform rebuilt on the generated
 * system. Old platform was old core with a pale blue page background
 * (background-primary on blue-0) in light mode, so this is Original
 * Codecademy with `neutral-light` taken from blue-0. Blue-0 is nearly
 * achromatic, so unlike Original Codecademy's beige it stays pinned. Its code editor colors aren't part of the color system; the
 * theme carries them (themes/platform.ts).
 */
export const platformBrand: BrandInput = {
  ...originalCodecademyBrand,
  name: 'platform',
  hues: {
    ...originalCodecademyBrand.hues,
    'neutral-light': '#F5FCFF', // blue-0, background-primary
  },
  /* The core family's pins; not the Codecademy theme's hard-offset shadow. */
  overrides: {
    ...coreFamilyOverrides,
    palette: {
      ...coreFamilyOverrides.palette,
      'neutral-light-100': '#F5FCFF', // blue-0
    },
  },
};
