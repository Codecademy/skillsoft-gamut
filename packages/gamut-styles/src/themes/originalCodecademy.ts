import * as values from '../tokens/generated/brands/originalCodecademy.values';
import { coreElevation, fontFamily, fontWeight } from '../variables';
import { createBrandTheme } from './createBrandTheme';

/*
 * Original Codecademy: old core rebuilt as a brand of the generated color
 * system (colorSystem/brands/originalCodecademy.ts). Fonts, weights and
 * elevation are old core's, unchanged. Lives next to `coreTheme` until the
 * rebuild is signed off.
 */
export const originalCodecademyTheme = createBrandTheme(values, {
  name: 'originalCodecademy',
  fontFamily,
  fontWeight,
  elevation: coreElevation,
});
