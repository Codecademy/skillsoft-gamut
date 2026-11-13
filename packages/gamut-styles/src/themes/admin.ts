import * as values from '../tokens/generated/brands/admin.values';
import { fontFamily, fontWeight, softElevation } from '../variables';
import { createBrandTheme } from './createBrandTheme';

/*
 * Admin: old admin rebuilt as a brand of the generated color system
 * (colorSystem/brands/admin.ts). Fonts and weights are old core's, which old
 * admin used, unchanged. Elevation is the soft shadow every brand but the
 * Codecademy theme uses (design's sandbox, df33b47).
 */
export const adminTheme = createBrandTheme(values, {
  name: 'admin',
  fontFamily,
  fontWeight,
  elevation: softElevation,
});

export type AdminThemeShape = typeof adminTheme;

export interface AdminTheme extends AdminThemeShape {}
