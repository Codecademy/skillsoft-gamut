import { adminBrand } from './admin';
import { lxStudioBrand } from './lxStudio';
import { originalCodecademyBrand } from './originalCodecademy';
import { percipioBrand } from './percipio';
import { platformBrand } from './platform';
import { skillsoftBrand } from './skillsoft';

/*
 * Every brand the build emits. The default brand's palette sits on :root;
 * each other brand's palette applies under `[data-brand="<name>"]`. Roles
 * reference palette variables and map the same way for every brand, so
 * they're emitted once; a brand's role overrides go in their own block.
 */
export const DEFAULT_BRAND = skillsoftBrand;

export const BRANDS = [
  skillsoftBrand,
  originalCodecademyBrand,
  adminBrand,
  platformBrand,
  percipioBrand,
  lxStudioBrand,
];
