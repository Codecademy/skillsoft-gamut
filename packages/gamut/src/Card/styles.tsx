import type { Theme } from '@emotion/react';
import { useTheme } from '@emotion/react';
import type { ElevationState } from '@skillsoft/gamut-styles';
import {
  states,
  theme,
  timingValues,
  transitionConcat,
  variant,
} from '@skillsoft/gamut-styles';
import type { StyleProps } from '@skillsoft/variance';

/**
 * The theme's elevation scale is flattened to dashcase tokens (`rest-shadow`,
 * `hoverMirrored-transform`, ...), so per-state groups don't exist on the
 * theme at runtime. This regroups one state's tokens into a spreadable style
 * object, mapping the `shadow` token onto the `boxShadow` property
 * framer-motion animates.
 */
const getElevationStyles = (
  elevation: Theme['elevation'],
  state: ElevationState
) => ({
  boxShadow: elevation[`${state}-shadow`],
  transform: elevation[`${state}-transform`],
});

const SHADOW_OFFSET = 8;
const SHADOW_OFFSET_INITIAL = 6;

const REST_TRANSITION = {
  duration: timingValues.fast / 1000,
  ease: 'easeOut',
} as const;

const HOVER_TRANSITION = {
  duration: timingValues.fast / 1000,
  ease: 'easeIn',
} as const;

/*
 * Design's card map (gamut-brand src/migration.ts, COMPONENTS; sandbox df33b47):
 * two variants replace the old color names. `default` is `surface-raised`
 * (old default, white, beige and navy); `brand` is the featured card on the
 * `surface-brand` gradient (old yellow and hyper). Every card has a
 * `border-subtle` hairline.
 */
export const cardSurfaces = {
  default: 'surface-raised',
  brand: 'surface-brand',
} as const;

export const cardVariants = variant({
  defaultVariant: 'default',
  base: {
    color: 'text-default',
    borderColor: 'border-subtle',
  },
  variants: {
    default: { bg: cardSurfaces.default },
    brand: { bg: cardSurfaces.brand },
  },
});

/*
 * Design's card map, Interactive: on hover, the `state-hover` veil over the
 * card's own fill, with the raised-hover shadow (useCardElevation). The shadow
 * and veil show the card is interactive, so the border doesn't change. The
 * veil is a layer behind the content, so it tints the fill (and a brand
 * gradient, which sits on the layer below it) but not the text. It keys off
 * the motion wrapper's hover, the same trigger as the shadow.
 */
export const interactiveStates = states({
  isInteractive: {
    isolation: 'isolate',
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      transition: transitionConcat(['background-color'], 'fast', 'ease-in'),
    },
    '*:hover > &::after': {
      bg: 'state-hover',
    },
  },
});

export const shadowVariants = variant({
  defaultVariant: 'none',
  prop: 'shadow',
  variants: {
    none: {},
    patternLeft: {},
    patternRight: {},
    outline: {
      boxShadow: `-${SHADOW_OFFSET}px ${SHADOW_OFFSET}px ${theme.colors['background-current']}, -${SHADOW_OFFSET}px ${SHADOW_OFFSET}px 0 1px ${theme.colors['border-subtle']}`,
    },
  },
});

export const patternFadeInOut = {
  initial: {
    opacity: 1,
    transition: {
      duration: timingValues.medium / 1000,
      ease: 'easeOut' as const,
    },
  },
  animate: {
    opacity: 0,
    transition: {
      duration: timingValues.medium / 1000,
      ease: 'easeIn' as const,
    },
  },
};

/*
 * An interactive card sits at the theme's raised shadow and moves to its
 * raised-hover shadow on hover. A card that isn't interactive has no shadow
 * (design's card map, sandbox df33b47).
 */
export const useCardElevation = (
  shadow: StyleProps<typeof shadowVariants>['shadow'],
  borderRadius?: string,
  isInteractive = true
) => {
  const { elevation } = useTheme();
  const hoverState: ElevationState =
    shadow === 'patternRight' ? 'hoverMirrored' : 'hover';
  const rest = isInteractive
    ? getElevationStyles(elevation, 'rest')
    : { boxShadow: 'none', transform: elevation['rest-transform'] };

  return {
    initial: {
      ...rest,
      borderRadius,
      transition: REST_TRANSITION,
    },
    animate: {
      ...getElevationStyles(elevation, hoverState),
      borderRadius,
      transition: HOVER_TRANSITION,
    },
    // Outline styles are specific to Codecademy and will not be included in a theme
    initialOutline: {
      ...rest,
      boxShadow: `-${SHADOW_OFFSET_INITIAL}px ${SHADOW_OFFSET_INITIAL}px 0 0px ${theme.colors['background-current']}, -${SHADOW_OFFSET_INITIAL}px ${SHADOW_OFFSET_INITIAL}px 0 1px ${theme.colors['border-subtle']}`,
      borderRadius,
      transition: REST_TRANSITION,
    },
    /* The hard offset, drawn in `shadow-key` like the elevation's. */
    animateOutline: {
      ...getElevationStyles(elevation, 'hover'),
      boxShadow: `-${SHADOW_OFFSET}px ${SHADOW_OFFSET}px 0 0px ${theme.colors['shadow-key']}, -${SHADOW_OFFSET}px ${SHADOW_OFFSET}px 0 1px ${theme.colors['shadow-key']}`,
      borderRadius,
      transition: HOVER_TRANSITION,
    },
  };
};
