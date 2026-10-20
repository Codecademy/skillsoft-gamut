import * as Gamut from '@codecademy/gamut';

export * from '@codecademy/gamut';

jest.mock('@codecademy/gamut', () => ({
  ...jest.requireActual('@codecademy/gamut'),
  Video: () => null,
}));

export const V = Gamut.Video;
