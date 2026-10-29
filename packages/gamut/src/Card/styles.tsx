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
 * Design's card map (colorSystem/migration.ts, COMPONENTS): the palette
 * variants become surfaces. Yellow and hyper are a featured card on the brand
 * gradient, and navy is `surface-raised` inside a dark-mode scope (Card sets
 * the scope through Background). Every card keeps a `border-subtle` hairline.
 */
export const cardSurfaces = {
  default: 'surface-raised',
  white: 'surface-raised',
  beige: 'surface-default',
  yellow: 'surface-brand',
  hyper: 'surface-brand',
  navy: 'surface-raised',
} as const;

export const cardVariants = variant({
  defaultVariant: 'default',
  base: {
    color: 'text-default',
    borderColor: 'border-subtle',
  },
  variants: {
    default: { bg: cardSurfaces.default },
    white: { bg: cardSurfaces.white },
    yellow: { bg: cardSurfaces.yellow },
    beige: { bg: cardSurfaces.beige },
    navy: { bg: cardSurfaces.navy },
    hyper: { bg: cardSurfaces.hyper },
  },
});

/*
 * Design's card map, Interactive: hover is the `state-hover` veil over the
 * card's own fill, with a `border-strong` edge. The veil is a layer behind the
 * content, so it tints the fill (and a brand gradient, which sits on the layer
 * below it) but not the text. It keys off the motion wrapper's hover, the same
 * trigger as the lift. Design adds the elevation lift to the veil once
 * elevation tokens exist; until then the theme's elevation hover stays.
 */
export const interactiveStates = states({
  isInteractive: {
    isolation: 'isolate',
    transition: transitionConcat(['border-color'], 'fast', 'ease-in'),
    '&::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      zIndex: -1,
      borderRadius: 'inherit',
      pointerEvents: 'none',
      transition: transitionConcat(['background-color'], 'fast', 'ease-in'),
    },
    '*:hover > &': {
      borderColor: 'border-strong',
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

export const useCardElevation = (
  shadow: StyleProps<typeof shadowVariants>['shadow'],
  borderRadius?: string
) => {
  const { elevation } = useTheme();
  const hoverState: ElevationState =
    shadow === 'patternRight' ? 'hoverMirrored' : 'hover';

  return {
    initial: {
      ...getElevationStyles(elevation, 'rest'),
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
      ...getElevationStyles(elevation, 'rest'),
      boxShadow: `-${SHADOW_OFFSET_INITIAL}px ${SHADOW_OFFSET_INITIAL}px 0 0px ${theme.colors['background-current']}, -${SHADOW_OFFSET_INITIAL}px ${SHADOW_OFFSET_INITIAL}px 0 1px ${theme.colors['border-subtle']}`,
      borderRadius,
      transition: REST_TRANSITION,
    },
    /*
     * `shadow-primary` waits on design's pending `shadow` role. Until then the
     * offset shadow is `action-neutral`, the same holding color design gives
     * CTAButton's offset shadow.
     */
    animateOutline: {
      ...getElevationStyles(elevation, 'hover'),
      boxShadow: `-${SHADOW_OFFSET}px ${SHADOW_OFFSET}px 0 0px ${theme.colors['action-neutral']}, -${SHADOW_OFFSET}px ${SHADOW_OFFSET}px 0 1px ${theme.colors['action-neutral']}`,
      borderRadius,
      transition: HOVER_TRANSITION,
    },
  };
};
