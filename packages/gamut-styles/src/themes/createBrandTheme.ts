import { createTheme } from '@skillsoft/variance';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';

import { tokensCss } from '../tokens/generated/tokensCss';
import type * as defaults from '../tokens/generated/values';
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
 * An Emotion theme for one brand of the generated color system (see
 * colorSystem/README.md). Every brand has the same palette keys and the same
 * roles, so every brand theme has the same shape and gamut is typed against
 * any of them. Only `white` and `black` survive from the old themes, as the
 * system's boundary tokens.
 *
 * `background-current` stays: it's ColorMode's mechanism for the color under
 * a Background, not a color of its own. Values are sRGB, not OKLCH:
 * Background and BarChart run polished's color math on theme values, and
 * polished can't parse oklch(). tokens.css carries the OKLCH, and the brand
 * gradients (--gradient-*), which the theme doesn't model.
 */

type PaletteKey = keyof typeof defaults.palette;
type RoleName = keyof typeof defaults.roles.light;

export interface BrandValues {
  brand: { name: string };
  palette: Record<PaletteKey, { srgb: string }>;
  roles: Record<'light' | 'dark', Record<RoleName, { ref: string }>>;
  contentModes: Record<string, 'light' | 'dark'>;
}

/* What a brand keeps from its old theme: everything that isn't color. */
export interface BrandBase {
  name: string;
  fontFamily: Record<string, string>;
  fontWeight: Record<string | number, number | string>;
  elevation: ElevationScaleFactory;
}

export const createBrandTheme = (
  values: BrandValues,
  { name, fontFamily, fontWeight, elevation }: BrandBase
) => {
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
    borderRadii,
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
    .addColorModes('light', { light: refs('light'), dark: refs('dark') })
    .addScale('borders', ({ colors }: { colors: Record<string, string> }) => ({
      1: `1px solid ${colors['border-strong']}`,
      2: `2px solid ${colors['border-strong']}`,
    }))
    .addScale('elevation', elevation)
    .createScaleVariables('elements')
    .addName(name)
    .build();

  /*
   * tokens.css owns the color values, and the theme carries it as
   * `tokensCss` for GamutProvider to inject. It holds every brand, keyed on
   * `data-brand`. The theme doesn't also inject the palette as variables, so
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
    tokensCss,
    _variables: {
      ...built._variables,
      root: pickBy(
        built._variables.root,
        (_, key) => !key.startsWith('--colors-')
      ),
    },
  };
};
