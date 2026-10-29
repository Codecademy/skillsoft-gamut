import * as values from '../tokens/generated/brands/admin.values';
import { coreElevation, fontFamily, fontWeight } from '../variables';
import { createBrandTheme } from './createBrandTheme';

/*
 * Admin: old admin rebuilt as a brand of the generated color system
 * (colorSystem/brands/admin.ts). Fonts, weights and elevation are old
 * core's, which old admin used, unchanged.
 */
export const adminTheme = createBrandTheme(values, {
  name: 'admin',
  fontFamily,
  fontWeight,
  elevation: coreElevation,
});

export type AdminThemeShape = typeof adminTheme;

export interface AdminTheme extends AdminThemeShape {}
