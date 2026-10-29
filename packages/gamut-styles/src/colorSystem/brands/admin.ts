import type { BrandInput } from '../brand';
import { originalCodecademyBrand } from './originalCodecademy';

/*
 * Admin: old admin rebuilt on the generated system. Old admin was old core
 * with a blue primary (blue-500, hover blue-400) in light mode, so this is
 * Original Codecademy with primary's hue taken from blue-500. Dark mode keeps
 * core's yellow primary, as old admin did. Old admin's one dark override
 * (success on green-400) was already core's value.
 */
export const adminBrand: BrandInput = {
  ...originalCodecademyBrand,
  name: 'admin',
  hues: {
    ...originalCodecademyBrand.hues,
    primary: '#1557FF', // blue-500, admin's primary
  },
};
