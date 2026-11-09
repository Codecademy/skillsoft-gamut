import type {
  AbstractProps,
  CSS,
  CSSObject,
  CSSPropMap,
  CSSProps,
  SystemProps,
  ThemeProps,
} from '@skillsoft/variance';
import merge from 'lodash/merge';

import { css } from '../variance';

/*
 * A recipe is a component's styles as data: a base, named groups of variants,
 * defaults, and compound variants for combinations. It's the shape Chakra and
 * Panda use (`defineRecipe` / `cva`), written with the same style objects as
 * gamut's `css()` and `variant()`.
 *
 * Because it's data, one recipe can be styled two ways:
 * - `recipe.styles`, an Emotion style function, for a component that hasn't
 *   moved yet. It writes what the matching `variant()` calls would.
 * - `compileRecipe(recipe)`, plain CSS with stable class names, for a
 *   component that renders `<StaticStyles>` and `recipe.classNames(props)`.
 *
 * See static/README.md for the rules a recipe has to follow to compile.
 */

type System = SystemProps<typeof css extends CSS<infer P> ? P : never>;

/*
 * Typed the way variant() is: the shapes are inferred from the literal, then
 * checked as gamut style objects, so role names and scale keys autocomplete.
 */
export type StyleObject<Props = AbstractProps> = CSSProps<Props, System>;

/* The inferred shape of a recipe's variants: group → value → style. */
export type VariantGroups = Record<string, Record<string, AbstractProps>>;

export type RecipeSelection<V extends VariantGroups> = {
  [K in keyof V]?: keyof V[K] | false;
};

/* Chakra's and Panda's shape: the groups to match, plus `css`. */
export type CompoundVariant<V extends VariantGroups, C = AbstractProps> = {
  [K in keyof V]?: keyof V[K];
} & { css: StyleObject<C> };

export interface RecipeConfig<
  V extends VariantGroups,
  B = AbstractProps,
  C = AbstractProps
> {
  /* Class name prefix, `gamut-<component>`. Has to be unique. */
  className: string;
  base?: StyleObject<B>;
  /*
   * `V &` gives TypeScript something to infer the literal from; three levels
   * of mapped types are too deep to infer through. The mapped half checks it.
   */
  variants?: V & { [K in keyof V]: CSSPropMap<V[K], System> };
  defaultVariants?: { [K in keyof V]?: keyof V[K] };
  compoundVariants?: CompoundVariant<V, C>[];
}

export interface Recipe<V extends VariantGroups> {
  className: string;
  config: RecipeConfig<V>;
  variantKeys: (keyof V)[];
  /* The selection with defaults filled in; `false` turns a group off. */
  resolve: (selection?: RecipeSelection<V>) => RecipeSelection<V>;
  classNames: (selection?: RecipeSelection<V>) => string;
  styles: (props: RecipeSelection<V> & ThemeProps) => CSSObject;
  /* Splits variant props from the rest, so they aren't forwarded. */
  splitProps: <P extends RecipeSelection<V>>(
    props: P
  ) => [RecipeSelection<V>, Omit<P, keyof V>];
}

export const variantClassName = (
  className: string,
  group: string,
  value: string
) => `${className}--${group}_${value}`;

export const matchesCompound = <V extends VariantGroups>(
  compound: CompoundVariant<V, unknown>,
  selection: RecipeSelection<V>
) =>
  Object.entries(compound)
    .filter(([group]) => group !== 'css')
    .every(([group, value]) => selection[group] === value);

export const defineRecipe = <
  V extends VariantGroups = Record<never, never>,
  B extends AbstractProps = AbstractProps,
  C extends AbstractProps = AbstractProps
>(
  config: RecipeConfig<V, B, C>
): Recipe<V> => {
  const { className, base = {}, compoundVariants = [] } = config;
  const defaultVariants: NonNullable<RecipeConfig<V>['defaultVariants']> =
    config.defaultVariants ?? {};
  const variants = (config.variants ?? {}) as Record<
    keyof V,
    Record<string, StyleObject>
  >;
  const variantKeys = Object.keys(variants) as (keyof V)[];

  const resolve = (selection: RecipeSelection<V> = {}) => {
    const resolved: RecipeSelection<V> = {};
    variantKeys.forEach((group) => {
      const value = selection[group] ?? defaultVariants[group];
      if (value !== undefined && value !== false) resolved[group] = value;
    });
    return resolved;
  };

  /* Built once, like variant(): css() caches the first theme it sees. */
  const baseFn = css(base as StyleObject);
  const variantFns = variantKeys.map(
    (group) =>
      [
        group,
        Object.fromEntries(
          Object.entries(variants[group]).map(([value, style]) => [
            value,
            css(style),
          ])
        ),
      ] as const
  );
  const compoundFns = compoundVariants.map(
    (compound) => [compound, css(compound.css as StyleObject)] as const
  );

  return {
    className,
    config: config as RecipeConfig<V>,
    variantKeys,
    resolve,
    classNames: (selection) => {
      const resolved = resolve(selection);
      return [
        className,
        ...variantKeys
          .filter((group) => resolved[group] !== undefined)
          .map((group) =>
            variantClassName(className, String(group), String(resolved[group]))
          ),
      ].join(' ');
    },
    /*
     * Same order as the compiled CSS: base, then each group in config order,
     * then compounds. Compiled compounds also win on specificity.
     */
    styles: (props) => {
      const resolved = resolve(props);
      const styles: CSSObject = {};
      merge(styles, baseFn(props));
      variantFns.forEach(([group, fns]) => {
        const value = resolved[group];
        if (value !== undefined) merge(styles, fns[String(value)]?.(props));
      });
      compoundFns.forEach(([compound, fn]) => {
        if (matchesCompound(compound, resolved)) merge(styles, fn(props));
      });
      return styles;
    },
    splitProps: (props) => {
      const picked: RecipeSelection<V> = {};
      const rest = { ...props };
      variantKeys.forEach((group) => {
        if (group in rest) {
          picked[group] = rest[group] as RecipeSelection<V>[keyof V];
          delete rest[group];
        }
      });
      return [picked, rest];
    },
  };
};
