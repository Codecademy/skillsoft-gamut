import { transitionConcat, variant } from '@skillsoft/gamut-styles';
import type { CSSObject, ThemeProps } from '@skillsoft/variance';

import { InteractiveSelectors } from '../../ButtonBase/ButtonBase';
import { buttonVariants, templateVariants } from './styles';

const hoverBackgroundTransition = transitionConcat(
  ['background-color', 'box-shadow'],
  'fast',
  'ease-in'
);

/*
 * Design's button map (gamut-brand src/migration.ts, COMPONENTS): each variant
 * takes an action family, and interface merges into primary. Every variant
 * gets the one `action-primary` focus ring.
 */
const actionFamily = {
  primary: 'action-primary',
  secondary: 'action-neutral',
  danger: 'action-danger',
  interface: 'action-primary',
} as const;

const hover = {
  primary: 'action-primary-hover',
  secondary: 'action-neutral-hover',
  danger: 'action-danger-hover',
  interface: 'action-primary-hover',
} as const;

const pressed = {
  primary: 'action-primary-pressed',
  secondary: 'action-neutral-pressed',
  danger: 'action-danger-pressed',
  interface: 'action-primary-pressed',
} as const;

/*
 * Labels on a fill are `text-inverse`. A disabled fill's label is a knockout:
 * the surface the control sits on shows through.
 */
export const fillButtonVariants = templateVariants(
  buttonVariants,
  (variant) => ({
    bg: actionFamily[variant],
    color: 'text-inverse',
    [InteractiveSelectors.OUTLINE]: { borderColor: 'action-primary' },
    [InteractiveSelectors.HOVER]: {
      bg: hover[variant],
      color: 'text-inverse',
      transition: hoverBackgroundTransition,
    },
    [InteractiveSelectors.ACTIVE]: {
      bg: pressed[variant],
      color: 'text-inverse',
    },
    [InteractiveSelectors.DISABLED]: {
      color: 'surface-raised',
      bg: 'action-disabled',
    },
  })
);

/*
 * The label keeps its color; hover and press are veils over whatever the
 * button sits on. Interface is `text-default`.
 */
export const textButtonVariants = templateVariants(
  buttonVariants,
  (variant) => {
    const label =
      variant === 'interface' ? 'text-default' : actionFamily[variant];
    return {
      borderColor: 'transparent',
      color: label,
      [InteractiveSelectors.HOVER]: {
        bg: 'state-hover',
        transition: hoverBackgroundTransition,
      },
      [InteractiveSelectors.OUTLINE]: {
        borderColor: 'action-primary',
      },
      [InteractiveSelectors.ACTIVE]: {
        bg: 'state-pressed',
      },
      [InteractiveSelectors.DISABLED]: {
        color: 'action-disabled',
        bg: 'transparent',
      },
    };
  }
);

/* Stroke and label take the action color; hover and press are veils. */
export const strokeButtonVariants = templateVariants(
  buttonVariants,
  (variant) => ({
    borderColor: actionFamily[variant],
    bg: 'transparent',
    color: actionFamily[variant],
    [InteractiveSelectors.HOVER]: {
      bg: 'state-hover',
      transition: hoverBackgroundTransition,
    },
    [InteractiveSelectors.OUTLINE]: {
      borderColor: 'action-primary',
    },
    [InteractiveSelectors.ACTIVE]: {
      bg: 'state-pressed',
    },
    [InteractiveSelectors.DISABLED]: {
      borderColor: 'action-disabled',
      color: 'action-disabled',
      bg: 'transparent',
    },
  })
);

/*
 * Design's CTAButton map (sandbox df33b47): fills follow primary FillButton,
 * and the shadow comes from the theme's elevation, raised at rest and
 * raised-hover on hover. That's the soft shadow on most brands and the hard
 * offset in the Codecademy theme. `ctaButtonElevation` runs before the
 * variants, so pressed and disabled still clear it.
 */
export const ctaButtonElevation = <T extends ThemeProps>({
  theme,
}: T): CSSObject => ({
  boxShadow: theme?.elevation?.['rest-shadow'],
  [InteractiveSelectors.HOVER]: {
    boxShadow: theme?.elevation?.['hover-shadow'],
  },
});

export const ctaButtonVariants = templateVariants(['primary'], (variant) => ({
  borderRadius: 'md',
  fontFamily: 'accent',
  fontWeight: 'title',
  color: 'text-inverse',
  py: 12,
  px: 24,
  bg: actionFamily[variant],
  [InteractiveSelectors.OUTLINE]: {
    borderColor: 'action-primary',
    bottom: -9,
    left: -9,
  },
  [InteractiveSelectors.HOVER]: {
    bg: hover[variant],
    transition: hoverBackgroundTransition,
  },
  [InteractiveSelectors.ACTIVE]: {
    boxShadow: 'none',
    bg: pressed[variant],
  },
  [InteractiveSelectors.DISABLED]: {
    boxShadow: 'none',
    color: 'surface-raised',
    bg: 'action-disabled',
  },
}));

export const sizeVariants = variant({
  prop: 'size',
  defaultVariant: 'normal',
  base: { fontWeight: 'title' },
  variants: {
    normal: {
      fontSize: 16,
      height: 40,
      minWidth: 40,
      py: 4,
      px: 16,
    },
    small: {
      fontSize: 14,
      height: 32,
      minWidth: 32,
      py: 4,
      px: 8,
    },
    large: {
      fontSize: 18,
      height: 56,
      minWidth: 40,
      py: 4,
      px: 16,
    },
  },
});

export const iconSizeVariants = variant({
  prop: 'size',
  defaultVariant: 'normal',
  variants: {
    normal: {
      height: 40,
      width: 40,
    },
    small: {
      height: 32,
      width: 32,
    },
    large: {
      width: 56,
      height: 56,
    },
  },
});
