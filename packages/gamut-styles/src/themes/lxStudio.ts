import * as values from '../tokens/generated/brands/lxStudio.values';
import {
  coreElevation,
  fontMonospace,
  fontSystem,
  fontWeightMediumTitle,
  percipioFontFamily,
} from '../variables';
import { createBrandTheme } from './createBrandTheme';

/*
 * LX Studio: old lxStudio rebuilt as a brand of the generated color system
 * (colorSystem/brands/lxStudio.ts). Fonts, weights, radii and elevation are
 * old lxStudio's, unchanged.
 */

const lxStudioFontFamily = {
  accent: percipioFontFamily.accent,
  base: percipioFontFamily.base,
  monospace: fontMonospace,
  system: fontSystem,
} as const;

export const lxStudioBorderRadii = {
  none: '0px',
  sm: '4px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '999px',
};

export const lxStudioTheme = createBrandTheme(values, {
  name: 'lxStudio',
  fontFamily: lxStudioFontFamily,
  fontWeight: fontWeightMediumTitle,
  elevation: coreElevation,
  borderRadii: lxStudioBorderRadii,
});

export type LxStudioThemeShape = typeof lxStudioTheme;

export type LxStudioTheme = LxStudioThemeShape;
