import * as values from '../tokens/generated/brands/originalCodecademy.values';
import { fontFamily, fontWeight, offsetElevation } from '../variables';
import { createBrandTheme } from './createBrandTheme';

/*
 * Original Codecademy: old core rebuilt as a brand of the generated color
 * system (colorSystem/brands/originalCodecademy.ts). Fonts and weights are old
 * core's, unchanged; elevation is old core's hard offset, drawn in the shadow
 * roles. Lives next to `coreTheme` until the
 * rebuild is signed off.
 */
export const originalCodecademyTheme = createBrandTheme(values, {
  name: 'originalCodecademy',
  fontFamily,
  fontWeight,
  elevation: offsetElevation,
});
