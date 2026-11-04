import type { /* color-roles: 'CoreTheme' types the old core theme, which has no color roles. Brand themes share one shape: use 'SkillsoftTheme', which types every brand (originalCodecademyTheme included). */ CoreTheme, SkillsoftTheme } from '@skillsoft/gamut-styles';
import {
  originalCodecademyTheme,
  GamutProvider,
  skillsoftTheme as theme,
} from '@skillsoft/gamut-styles';

import { settings } from './settings';

export const Percipio = () => <GamutProvider theme={theme} />;

export const Core = () => <GamutProvider theme={originalCodecademyTheme} />;

export const themes = { coreTheme: originalCodecademyTheme, dark: { ...originalCodecademyTheme, mode: 'dark' } };

export const label = settings.coreTheme;

export type Typed = SkillsoftTheme;

declare module '@emotion/react' {
  export interface Theme extends CoreTheme {}
}
