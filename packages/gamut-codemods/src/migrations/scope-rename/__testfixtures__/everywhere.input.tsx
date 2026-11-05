import { Box } from '@codecademy/gamut';
import { theme } from '@codecademy/gamut-styles';
import { Video } from '@codecademy/gamut/Video';
import { setupRtl } from '@codecademy/gamut-tests';
import type { CoreTheme } from '@codecademy/gamut-styles';
import { Kit } from '@codecademy/gamut-kit';
import { Other } from '@codecademy/gamut-extra-thing';

export * from '@codecademy/gamut-icons';

declare module '@codecademy/gamut-styles' {
  interface Theme extends CoreTheme {}
}

jest.mock('@codecademy/variance');
const lazy = () => import('@codecademy/gamut-patterns');
const req = require('@codecademy/gamut-illustrations');
type T = import('@codecademy/gamut').BoxProps;

export const transpilePackages = ['@codecademy/gamut'];
