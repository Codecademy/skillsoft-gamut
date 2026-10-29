import * as values from '../tokens/generated/values';
import {
  fontWeightMediumTitle,
  percipioElevation,
  percipioFontFamily,
} from '../variables';
import { createBrandTheme } from './createBrandTheme';

/*
 * The default brand of the generated color system, and the theme gamut is
 * typed against. Its type stands for every brand theme: they share palette
 * keys and roles (createBrandTheme.ts).
 */
export const skillsoftTheme = createBrandTheme(values, {
  name: 'skillsoft',
  fontFamily: percipioFontFamily,
  fontWeight: fontWeightMediumTitle,
  elevation: percipioElevation,
});

export type SkillsoftThemeShape = typeof skillsoftTheme;

export interface SkillsoftTheme extends SkillsoftThemeShape {}
