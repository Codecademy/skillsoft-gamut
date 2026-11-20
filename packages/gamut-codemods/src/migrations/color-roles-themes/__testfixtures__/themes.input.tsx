import type { CoreTheme, PercipioTheme } from '@skillsoft/gamut-styles';
import {
  coreTheme,
  GamutProvider,
  percipioTheme as theme,
} from '@skillsoft/gamut-styles';

import { settings } from './settings';

export const Percipio = () => <GamutProvider theme={theme} />;

export const Core = () => <GamutProvider theme={coreTheme} />;

export const themes = { coreTheme, dark: { ...coreTheme, mode: 'dark' } };

export const label = settings.coreTheme;

export type Typed = PercipioTheme;

declare module '@emotion/react' {
  export interface Theme extends CoreTheme {}
}
