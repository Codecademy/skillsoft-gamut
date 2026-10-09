import { Box } from '@skillsoft/gamut';
import { theme } from '@skillsoft/gamut-styles';
import { Video } from '@skillsoft/gamut/Video';
import { setupRtl } from '@skillsoft/gamut-tests';
import type { CoreTheme } from '@skillsoft/gamut-styles';
import { Kit } from '@codecademy/gamut-kit';
import { Other } from '@codecademy/gamut-extra-thing';

export * from '@skillsoft/gamut-icons';

declare module '@skillsoft/gamut-styles' {
  interface Theme extends CoreTheme {}
}

jest.mock('@skillsoft/variance');
const lazy = () => import('@skillsoft/gamut-patterns');
const req = require('@skillsoft/gamut-illustrations');
type T = import('@skillsoft/gamut').BoxProps;

export const transpilePackages = ['@skillsoft/gamut'];
