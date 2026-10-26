import { createTheme } from '@skillsoft/variance';
import mapValues from 'lodash/mapValues';
import pickBy from 'lodash/pickBy';

import { contentModes, palette, roles } from '../tokens';
import {
  borderRadii,
  containerQueries,
  elements,
  fontSize,
  fontWeightMediumTitle,
  lineHeight,
  mediaQueries,
  percipioElevation,
  percipioFontFamily,
  spacing,
} from '../variables';

/*
 * The first brand on the generated color system (spike, see
 * colorSystem/README.md), and the theme gamut is typed against. It replaces
 * core and the other themes rather than extending them, so none of core's
 * primitives (navy-*, hyper-*, gray-*, …) or semantic names (text,
 * background, primary, …) come along; only `white` and `black` survive, as
 * the system's boundary tokens.
 *
 * `background-current` stays: it's ColorMode's mechanism for the color under
 * a Background, not a color of its own. Values are sRGB, not
 * OKLCH: Background and BarChart run polished's color math on theme values,
 * and polished can't parse oklch(). tokens.css carries the OKLCH, and the
 * brand gradients (--gradient-*), which the theme doesn't model.
 */

type Entries = Record<string, { ref: string }>;

const refsOf = <T extends Entries>(entries: T) =>
  mapValues(entries, (v) => v.ref) as { [K in keyof T]: T[K]['ref'] };

const srgbOf = <T extends Record<string, { srgb: string }>>(entries: T) =>
  mapValues(entries, (v) => v.srgb) as { [K in keyof T]: T[K]['srgb'] };

const built = createTheme({
  breakpoints: { ...mediaQueries, ...containerQueries },
  borderRadii,
  fontSize,
  fontFamily: percipioFontFamily,
  lineHeight,
  fontWeight: fontWeightMediumTitle,
  spacing,
  elements,
})
  .addColors(srgbOf(palette))
  .addColorModes('light', {
    light: {
      ...refsOf(roles.light),
      'background-current': roles.light['surface-default'].ref,
    },
    dark: {
      ...refsOf(roles.dark),
      'background-current': roles.dark['surface-default'].ref,
    },
  })
  .addScale('borders', ({ colors }: { colors: Record<string, string> }) => ({
    1: `1px solid ${colors['border-strong']}`,
    2: `2px solid ${colors['border-strong']}`,
  }))
  .addScale('elevation', percipioElevation)
  .createScaleVariables('elements')
  .addName('skillsoft')
  .build();

/*
 * tokens.css owns the color values: the theme doesn't inject the palette, so
 * the OKLCH in tokens.css is what renders, and the page needs
 * `@skillsoft/gamut-styles/tokens.css`. The theme keeps names (`var(--color-*)`),
 * the mode → palette mapping ColorMode still injects (identical to
 * tokens.css), and `contentModes`, which Background reads instead of
 * measuring contrast. `_getColorValue` still returns sRGB for the components
 * that run polished on it (BarChart).
 */
export const skillsoftTheme = {
  ...built,
  contentModes,
  _variables: {
    ...built._variables,
    root: pickBy(
      built._variables.root,
      (_, key) => !key.startsWith('--color-')
    ),
  },
};

export type SkillsoftThemeShape = typeof skillsoftTheme;

export interface SkillsoftTheme extends SkillsoftThemeShape {}
