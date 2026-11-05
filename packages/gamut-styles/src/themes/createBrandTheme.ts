import { createTheme } from '@skillsoft/variance';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';

import type * as defaults from '../tokens/generated/skillsoft/values';
import type {
  fontFamily as baseFontFamily,
  fontWeight as baseFontWeight,
  fontWeightMediumTitle,
} from '../variables';
import {
  borderRadii,
  containerQueries,
  elements,
  fontSize,
  lineHeight,
  mediaQueries,
  spacing,
} from '../variables';
import type { ElevationScaleFactory } from '../variables/elevation';

/*
 * An Emotion theme for one brand of the generated color system, from the
 * `values.ts` that @skillsoft/gamut-brand writes for it: gamut's own brands
 * and any team's. Every brand has the same palette keys and the same roles,
 * so every brand theme has the same shape and type, and gamut's system props
 * and styling functions are typed against all of them (`SkillsoftTheme`).
 * Only `white` and `black` survive from the old themes, as the system's
 * boundary tokens.
 *
 * `background-current` stays: it's ColorMode's mechanism for the color under
 * a Background, not a color of its own. Values are sRGB, not OKLCH:
 * Background and BarChart run polished's color math on theme values, and
 * polished can't parse oklch(). tokens.css carries the OKLCH, and the brand
 * gradients (--gradient-*), which the theme doesn't model.
 */

type PaletteKey = keyof typeof defaults.palette;
type RoleName = keyof typeof defaults.roles.light;

/* A brand's generated `values.ts`, imported as a module: `import * as values from './acme/values'`. */
export interface BrandValues {
  brand: { name: string; initialMode: 'light' | 'dark' };
  palette: Record<PaletteKey, { srgb: string }>;
  roles: Record<'light' | 'dark', Record<RoleName, { ref: string }>>;
  contentModes: Record<string, 'light' | 'dark'>;
  /* The brand's tokens.css, which GamutProvider injects. */
  tokensCss: string;
}

type FontWeightKey = keyof typeof baseFontWeight;
type OptionalFontWeightKey = Exclude<
  keyof typeof fontWeightMediumTitle,
  FontWeightKey
>;

/*
 * Everything about a brand that isn't color. The keys are fixed, so every
 * brand theme has the type gamut is checked against: a font or weight a
 * brand leaves out would type-check and then render nothing.
 */
export interface BrandBase {
  name: string;
  fontFamily: Record<keyof typeof baseFontFamily, string>;
  /*
   * `bold` and `500` are optional only because the old core family's themes
   * never had them; Skillsoft's do. A new brand should set both.
   */
  fontWeight: Record<FontWeightKey, number | string> &
    Partial<Record<OptionalFontWeightKey, number | string>>;
  elevation: ElevationScaleFactory;
  /* Defaults to gamut's shared radii. */
  borderRadii?: Record<keyof typeof borderRadii, string>;
}

export const createBrandTheme = (
  values: BrandValues,
  {
    name,
    fontFamily,
    fontWeight,
    elevation,
    borderRadii: radii = borderRadii,
  }: BrandBase
) => {
  /* The brand's tokens.css puts this mode on :root, so the theme starts there too. */
  const { initialMode } = values.brand;
  const refs = (mode: 'light' | 'dark') => ({
    ...(mapValues(values.roles[mode], (v) => v.ref) as Record<
      RoleName,
      PaletteKey
    >),
    'background-current': values.roles[mode]['surface-default']
      .ref as PaletteKey,
  });

  const built = createTheme({
    breakpoints: { ...mediaQueries, ...containerQueries },
    borderRadii: radii,
    fontSize,
    fontFamily,
    lineHeight,
    fontWeight,
    spacing,
    elements,
  })
    .addColors(
      mapValues(values.palette, (v) => v.srgb) as Record<PaletteKey, string>
    )
    .addColorModes(initialMode, { light: refs('light'), dark: refs('dark') })
    .addScale('borders', ({ colors }: { colors: Record<string, string> }) => ({
      1: `1px solid ${colors['border-strong']}`,
      2: `2px solid ${colors['border-strong']}`,
    }))
    .addScale('elevation', elevation)
    .createScaleVariables('elements')
    .addName(name)
    .build();

  /*
   * tokens.css owns the color values, and the theme carries the brand's own
   * as `tokensCss` for GamutProvider to inject: this brand's palette and
   * roles, no other brand's. The theme doesn't also inject the palette as variables, so
   * the OKLCH in tokens.css is what renders. The theme keeps names
   * (`var(--colors-*)`), `brand` (ColorMode sets it as `data-brand`), and
   * `contentModes`, which Background reads instead of measuring contrast.
   * `_getColorValue` still returns sRGB for the components that run polished
   * on it (BarChart).
   */
  return {
    ...built,
    brand: values.brand.name,
    contentModes: values.contentModes,
    tokensCss: values.tokensCss,
    _variables: {
      ...built._variables,
      root: pickBy(
        built._variables.root,
        (_, key) => !key.startsWith('--colors-')
      ),
    },
  };
};
