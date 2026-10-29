import * as values from '../tokens/generated/brands/percipio.values';
import {
  fontWeightMediumTitle,
  percipioElevation,
  percipioFontFamily,
} from '../variables';
import { createBrandTheme } from './createBrandTheme';

/*
 * Percipio: old percipio rebuilt as a brand of the generated color system
 * (colorSystem/brands/percipio.ts). Fonts, weights and elevation are old
 * percipio's, unchanged.
 */
export const percipioTheme = createBrandTheme(values, {
  name: 'percipio',
  fontFamily: percipioFontFamily,
  fontWeight: fontWeightMediumTitle,
  elevation: percipioElevation,
});

export type PercipioThemeShape = typeof percipioTheme;

export interface PercipioTheme extends PercipioThemeShape {}
