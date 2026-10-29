import type { Theme } from '@emotion/react';
import { useTheme } from '@emotion/react';
import { getContrast } from 'polished';
import type { ComponentProps } from 'react';
import { forwardRef, useCallback, useMemo } from 'react';

import type {
  ColorAlias,
  ColorModes,
  ColorModeShape,
  Colors,
} from './ColorMode';
import { ColorMode, roleOr, useColorModes } from './ColorMode';

export interface BackgroundProps
  extends Omit<
    ComponentProps<typeof ColorMode>,
    'mode' | 'alwaysSetVariables' | 'bg'
  > {
  bg: Colors;
}

/**
 * Type guard that checks whether a color is a semantic alias in the given mode
 * (e.g. "text", "primary") rather than a raw theme color key.
 *
 * @param mode - The color mode shape to check against
 * @param color - The color key to test
 * @returns `true` if `color` is a key in `mode` (i.e. a ColorAlias)
 */
export const isColorAlias = (
  mode: ColorModeShape,
  color: Colors
): color is ColorAlias => {
  return Object.keys(mode).includes(color);
};

const textOf = (mode: ColorModeShape) =>
  roleOr(mode as Record<string, string>, 'text-default', 'text') as Colors;

export const Background = forwardRef<HTMLDivElement, BackgroundProps>(
  ({ bg, ...rest }, ref) => {
    const [active, activeColors, modes, getColorValue] = useColorModes();
    /* Generated themes ship the answer (colorSystem/contentModes.ts). */
    const { contentModes } = useTheme() as Partial<Theme>;

    /** If a color alias was used then look up the true color key from the active mode */
    const trueColor = useMemo(() => {
      if (isColorAlias(activeColors, bg)) {
        return activeColors[bg];
      }
      return bg;
    }, [bg, activeColors]);

    const getTextContrast = useCallback(
      (foreground: Colors) => {
        return getContrast(getColorValue(foreground), getColorValue(trueColor));
      },
      [trueColor, getColorValue]
    );

    /**
     * This compares the contrast of the selected background color
     * and each color modes body text and returns the mode that has
     * the highest contrast standard. This is not perfect as it is
     * probable that certain color modes will never be reachable if
     * there are more than 2 color modes.
     *
     * This does not guarantee a level of A/AA/AA compliance.
     */

    const accessibleMode = useMemo(() => {
      const listed = contentModes?.[trueColor as keyof typeof contentModes];
      if (listed) return listed;

      /*
       * A bg the theme doesn't define (a core primitive on a theme without
       * it) can't be measured; polished throws on it. Keep the active mode.
       */
      if (!getColorValue(trueColor)) {
        // eslint-disable-next-line no-console
        console.warn(
          `Background: "${trueColor}" isn't a color in this theme; keeping the "${active}" color mode.`
        );
        return active;
      }

      const { [active]: activeMode, ...otherModes } = modes;
      const possibleModes = Object.entries(otherModes);

      /**
       * Reduce all remaining modes to the mode key with the highest contrast
       * value.
       *
       * TODO: Add a tiebreaker.  This could possibly have other dimensions as
       * it will likely fail to return a mode outside of the lightest and
       * darkest versions.
       */
      const [highestContrastMode] = possibleModes.reduce<[ColorModes, number]>(
        (
          [prevMode, prevContrast],
          [mode, shape]: [ColorModes, ColorModeShape]
        ) => {
          const contrast = getTextContrast(textOf(shape));

          // Keep the higher contrast mode.
          return contrast > prevContrast
            ? [mode, contrast]
            : [prevMode, prevContrast];
        },
        [active, getTextContrast(textOf(activeMode))]
      );

      return highestContrastMode;
    }, [
      modes,
      active,
      getTextContrast,
      getColorValue,
      trueColor,
      contentModes,
    ]);

    /*
     * Paint the palette color, not the alias. A palette color is the same in
     * every mode; an alias would resolve in the mode this flips to, so
     * `bg="primary"` on a light page painted the dark mode's primary.
     */
    return (
      <ColorMode {...rest} bg={trueColor} mode={accessibleMode} ref={ref} />
    );
  }
);
