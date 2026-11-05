import { adminBrand } from './admin';
import { lxStudioBrand } from './lxStudio';
import { originalCodecademyBrand } from './originalCodecademy';
import { platformBrand } from './platform';
import { skillsoftBrand } from './skillsoft';

export {
  adminBrand,
  lxStudioBrand,
  originalCodecademyBrand,
  platformBrand,
  skillsoftBrand,
};
export { coreFamilyOverrides } from './originalCodecademy';

/*
 * gamut's own brands, which `@skillsoft/gamut-styles` builds its themes from.
 * Each one is generated on its own; the default is the theme gamut is typed
 * against and the brand `GamutProvider` falls back to.
 */
export const DEFAULT_BRAND = skillsoftBrand;

export const BRANDS = [
  skillsoftBrand,
  originalCodecademyBrand,
  adminBrand,
  platformBrand,
  lxStudioBrand,
];
