import type { Theme } from '@emotion/react';
import { css as emotionCss } from '@emotion/react';
import type { Middleware } from 'stylis';
import { compile, middleware, serialize, stringify } from 'stylis';

import { originalCodecademyTheme, skillsoftTheme } from '../themes';
import { css } from '../variance';
import type { Recipe, StyleObject, VariantGroups } from './defineRecipe';
import { variantClassName } from './defineRecipe';

/*
 * Recipe → plain CSS, in `@layer recipes` (declared by tokens.css). Emotion's
 * styles stay unlayered, so style props and `styled()` overrides still win
 * over a compiled recipe with no specificity games.
 *
 * Always logical properties: static CSS can't follow GamutProvider's
 * `useLogicalProperties`. In left-to-right, horizontal text they render the
 * same as physical ones (`block-size` is `height`). Under `dir="rtl"` inline
 * spacing and borders follow the text direction, physical mode or not.
 *
 * The output is unprefixed and doesn't run gamut's stylis plugins. Whatever
 * delivers it does that: StaticStyles inserts through the Emotion cache,
 * which runs them, the same as for every other style. A future build step
 * that writes a stylesheet has to run them itself.
 */

export const RECIPE_LAYER = 'recipes';

export interface CompileOptions {
  theme?: Theme;
  useLogicalProperties?: boolean;
}

/* Emotion's babel plugin labels css() calls; the cache strips them, so do we. */
const removeLabel: Middleware = (element) => {
  if (element.type === 'decl' && element.props === 'label') {
    element.return = '';
    element.value = '';
  }
  return undefined;
};

const rule = (selector: string, style: StyleObject, theme: Theme) => {
  /* A fresh css() each time: it caches the first theme it's called with. */
  const object = css(style)({ theme });
  if (!Object.keys(object).length) return '';
  return serialize(
    compile(`${selector}{${emotionCss(object as never).styles}}`),
    middleware([removeLabel, stringify])
  );
};

export const compileRecipe = <V extends VariantGroups>(
  recipe: Recipe<V>,
  { theme = skillsoftTheme, useLogicalProperties = true }: CompileOptions = {}
): string => {
  const { className, base = {} } = recipe.config;
  const variants = (recipe.config.variants ?? {}) as Record<
    keyof V,
    Record<string, StyleObject>
  >;
  const compounds = recipe.config.compoundVariants ?? [];
  const themed = { ...theme, useLogicalProperties } as Theme;

  const rules = [
    rule(`.${className}`, base, themed),
    ...recipe.variantKeys.flatMap((group) =>
      Object.entries(variants[group]).map(([value, style]) =>
        rule(
          `.${variantClassName(className, String(group), value)}`,
          style,
          themed
        )
      )
    ),
    ...compounds.map(({ css: style, ...when }) =>
      rule(
        Object.entries(when)
          .map(
            ([group, value]) =>
              `.${variantClassName(className, group, String(value))}`
          )
          .join(''),
        style,
        themed
      )
    ),
  ];

  return `@layer ${RECIPE_LAYER}{${rules.join('')}}`;
};

/*
 * A recipe compiles to static CSS only if its output doesn't depend on which
 * brand theme is active: colors are role variables and the same everywhere,
 * but fonts, font weights and elevation are still per-theme values. Compile
 * it for every brand and compare.
 *
 * The old themes (core, admin, …) aren't on the color roles, so they're left
 * out until they're rebuilt as brands.
 */
export const STATIC_CASES: Required<CompileOptions>[] = [
  skillsoftTheme,
  originalCodecademyTheme,
].map((theme) => ({
  theme: theme as unknown as Theme,
  useLogicalProperties: true,
}));

export interface StaticCheck {
  pass: boolean;
  /* Names of the themes that compiled differently from the first. */
  differs: string[];
}

export const checkRecipe = <V extends VariantGroups>(
  recipe: Recipe<V>,
  cases: Required<CompileOptions>[] = STATIC_CASES
): StaticCheck => {
  const [first, ...rest] = cases.map((options) =>
    compileRecipe(recipe, options)
  );
  const differs = rest
    .map((output, i) => ({ output, options: cases[i + 1] }))
    .filter(({ output }) => output !== first)
    .map(({ options }) => String((options.theme as { name?: string }).name));
  return { pass: differs.length === 0, differs };
};
