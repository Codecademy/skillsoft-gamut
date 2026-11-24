---
'@skillsoft/gamut-styles': minor
---

Add groundwork for static component styles. No component uses it yet.

- `defineRecipe` describes a component's styles as data (base, variant groups, defaults, compound variants), in Chakra's and Panda's recipe shape with gamut's style objects. `recipe.styles` styles it through Emotion; `recipe.classNames` gives stable class names.
- `compileRecipe` turns a recipe into plain CSS in `@layer recipes`, and `checkRecipe` reports whether it compiles the same for every brand theme.
- `StaticStyles` puts compiled CSS on the page once, through the Emotion cache, so SSR, nonces and stylis plugins work as before.
