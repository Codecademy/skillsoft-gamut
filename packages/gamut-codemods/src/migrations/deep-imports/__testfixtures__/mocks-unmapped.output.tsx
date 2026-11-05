import { Box } from '@codecademy/gamut/dist/Box';

jest.mock('@codecademy/gamut/dist/Nope/thing', () => ({}));
const button = require('@codecademy/gamut/dist/ButtonBase/ButtonBase');
export const B = [Box, button];
