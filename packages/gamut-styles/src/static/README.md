# Static styles (groundwork)

Groundwork for moving gamut's components off runtime Emotion styles. Nothing
uses it yet: no component has moved, and `GamutProvider` still delivers the
color tokens. Notes and the plan are in Base Camp, `gamut/color-tokens/how-it-works.md`
("Moving off Emotion, slowly").

Today every gamut component serializes its styles with Emotion on each render.
A component on a recipe ships CSS compiled ahead of time and only picks class
names at render.

## The pieces

| Export                       | What                                                                                                                                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `defineRecipe`               | A component's styles as data: `className`, `base`, `variants` (named groups), `defaultVariants`, `compoundVariants`. Chakra's and Panda's recipe shape, written with the same style objects as `css()` and `variant()` |
| `recipe.styles`              | The recipe as an Emotion style function, for `styled.div(recipe.styles)`. Writes what the matching `variant()` calls would                                                                                             |
| `recipe.classNames(props)`   | `gamut-chip gamut-chip--intent_danger gamut-chip--size_sm`. Defaults filled in; `false` turns a group off                                                                                                              |
| `compileRecipe(recipe)`      | Plain CSS for those class names, in `@layer recipes`                                                                                                                                                                   |
| `checkRecipe(recipe)`        | Whether the recipe compiles the same for every brand theme. If not, it can't be static yet                                                                                                                             |
| `<StaticStyles id styles />` | Puts compiled CSS on the page once, through the Emotion cache (SSR, nonce and stylis plugins work as they do now)                                                                                                      |

## Moving a component

1. Rewrite its `variant()` calls as one recipe and style it with
   `recipe.styles`. Still Emotion; snapshots and visuals shouldn't change. This
   step is safe to ship alone.
2. Add `expect(checkRecipe(recipe).pass).toBe(true)` to its tests. If it fails,
   the recipe uses a per-brand value (see the rules) and stays on step 1.
3. Compile it once at module scope and render it:

   ```tsx
   const styles = compileRecipe(chip);

   export const Chip = ({ className, ...props }: ChipProps) => {
     const [variants, rest] = chip.splitProps(props);
     return (
       <>
         <StaticStyles id={chip.className} styles={styles} />
         <Box className={cx(chip.classNames(variants), className)} {...rest} />
       </>
     );
   };
   ```

   Style props and `styled(Chip)` still work and still win: they're Emotion,
   unlayered, and the recipe is in `@layer recipes`.

4. Later, a build step writes `compileRecipe` output to a generated module (or
   a stylesheet), so it doesn't run in the browser at all. Components don't
   change for that.

## Rules for a recipe that compiles

- **Colors are roles.** They compile to `var(--color-<role>)`, the same for
  every brand and mode.
- **No per-brand values.** Fonts, font weights and elevation are still literal
  values per theme, so `fontFamily: 'accent'` fails `checkRecipe`. Those move
  to CSS variables in phase 2 of the plan.
- **No render-time values.** Nothing from props beyond the variant groups, no
  `useTheme()`, no polished math. Those stay in Emotion next to the recipe.
- **Always logical properties.** Static CSS can't follow `useLogicalProperties`,
  so `height` compiles to `block-size` and `px` to `padding-inline-*`. Same
  rendering in left-to-right horizontal text; under `dir="rtl"` inline spacing
  follows the text direction even if the app uses physical mode.
- **`className` is unique,** `gamut-<component>`. It's the class prefix and the
  `StaticStyles` id.

## Not done

- No build step: `compileRecipe` runs once per module in the browser.
- No boolean variants yet, so `states()` (`disabled`, `active`, …) stays in
  Emotion next to the recipe. Panda and Chakra take `true` / `false` keys;
  that's the shape to add.
- Delivery is the Emotion cache. React 19's `<style href precedence>` or an
  imported stylesheet would replace `StaticStyles`'s insides only.
- `checkRecipe` covers the brand themes. The old themes (core, admin, …) join
  once they're rebuilt as brands.
- Types are as strict as `css()`: selections are checked, style values only as
  far as `css()` checks them.
