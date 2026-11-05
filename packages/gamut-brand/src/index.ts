/*
 * @skillsoft/gamut-brand: build a gamut color brand at build time.
 *
 *   // acme.brand.ts
 *   import { defineBrand } from '@skillsoft/gamut-brand';
 *   export default defineBrand({ name: 'acme', hues: { primary: '#0A5CFF' } });
 *
 *   gamut-brand build acme.brand.ts            # writes ./acme/
 *   gamut-brand build acme.brand.ts --watch    # regenerates on save
 *   gamut-brand build acme.brand.ts --check    # CI: fails if ./acme/ is stale
 *
 * The output's `values.ts` goes to `createBrandTheme` in
 * `@skillsoft/gamut-styles`. Nothing here runs in the browser.
 */
import type { BrandInput } from './brand';

/*
 * Types a brand and returns it unchanged. Typos in a slot, role or palette
 * rung fail to compile. Not generic on purpose: a generic parameter would
 * skip TypeScript's excess-property check, and `acent: '#f00'` would pass.
 */
export const defineBrand = (brand: BrandInput): BrandInput => brand;

export type {
  BrandInput,
  BrandOverrides,
  HueInput,
  ResolvedBrand,
  RoleOverride,
  Slot,
  Tier,
} from './brand';
export { DEFAULT_HUES, SLOTS } from './brand';
export type { Grade } from './ramp';
export { GRADES } from './ramp';
export type { Mode, Ref, Role, RoleToken, RoleValue } from './roles';
export { MODES, ROLE_TOKENS, ROLES } from './roles';
export type { ColorSystem } from './system';
export { createColorSystem } from './system';
export type { Check } from './validate';
export { validate } from './validate';
export { TOKEN_MAP, validateMigration } from './migration';
export { probeTenant } from './probe';
export type { GeneratedBrand } from './generate';
export {
  BrandCheckError,
  FILES,
  generateBrand,
  staleFiles,
  writeBrand,
} from './generate';

/* gamut's own brands, to extend: `{ ...skillsoftBrand, name: 'acme', hues: { ... } }`. */
export * from './brands';
