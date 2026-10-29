import type { BrandInput } from '../brand';
import { originalCodecademyBrand } from './originalCodecademy';

/*
 * Platform (the learning environment): old platform rebuilt on the generated
 * system. Old platform was old core with a pale blue page background
 * (background-primary on blue-0) in light mode, so this is Original
 * Codecademy with `neutral-light` taken from blue-0, pinned exactly in place
 * of beige. Its code editor colors aren't part of the color system; the
 * theme carries them (themes/platform.ts).
 */
export const platformBrand: BrandInput = {
  ...originalCodecademyBrand,
  name: 'platform',
  hues: {
    ...originalCodecademyBrand.hues,
    'neutral-light': '#F5FCFF', // blue-0, background-primary
  },
  overrides: {
    ...originalCodecademyBrand.overrides,
    palette: {
      ...originalCodecademyBrand.overrides?.palette,
      'neutral-light-100': '#F5FCFF', // blue-0
    },
  },
};
