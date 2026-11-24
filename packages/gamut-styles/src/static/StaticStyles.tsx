import type { EmotionCache, SerializedStyles } from '@emotion/react';
import { withEmotionCache } from '@emotion/react';
import * as React from 'react';

/*
 * Puts a compiled stylesheet on the page once, however many components render
 * it. A component that has moved to a recipe renders
 * `<StaticStyles id={recipe.className} styles={compiledCss} />` next to its
 * element.
 *
 * For now it goes through the Emotion cache, the same way Emotion inserts a
 * class:
 * - one copy per page, deduplicated on `id` through `cache.inserted`;
 * - SSR, CSP nonces, a custom container and gamut's stylis plugins all work
 *   the way they already do;
 * - React 17, 18 and 19.
 *
 * Swapping the delivery later (React 19's `<style href precedence>`, or a
 * stylesheet the app imports) only changes this file. See static/README.md.
 */

export interface StaticStylesProps {
  /* Unique per stylesheet. A recipe's className. */
  id: string;
  /* compileRecipe output. Never user input: it's written into a <style>. */
  styles: string;
}

const isBrowser = typeof document !== 'undefined';

/*
 * React 17 has no useInsertionEffect. Emotion falls back to inserting during
 * render there, and so does this. The name is split so bundlers don't warn
 * about a missing export on React 17.
 */
const useInsertionEffect: (effect: () => void) => void =
  (React as unknown as Record<string, typeof React.useLayoutEffect>)[
    `useInsertion${'Effect'}`
  ] ?? ((effect: () => void) => effect());

const insert = (cache: EmotionCache, id: string, styles: string) => {
  if (cache.inserted[id] !== undefined) return undefined;
  const serialized: SerializedStyles = { name: id, styles, next: undefined };
  return cache.insert('', serialized, cache.sheet, true) as string | undefined;
};

export const StaticStyles = withEmotionCache<StaticStylesProps>(
  ({ id, styles }, cache) => {
    /*
     * On the server, Emotion's default cache returns the rules instead of
     * inserting them, and they're rendered inline. On the client, the cache
     * moves those tags into its container before hydration and marks `id` as
     * inserted, so nothing is inserted twice.
     */
    const ssrRules = isBrowser ? undefined : insert(cache, id, styles);

    useInsertionEffect(() => {
      if (isBrowser) insert(cache, id, styles);
    });

    if (!ssrRules) return null;
    return (
      <style
        /* How Emotion renders SSR styles, except `</style` is escaped. */
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: ssrRules.replace(/<\/style/gi, '<\\/style'),
        }}
        data-emotion={`${cache.key} ${id}`}
        nonce={cache.sheet.nonce}
      />
    );
  }
);
