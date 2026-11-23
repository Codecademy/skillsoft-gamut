import {
  MiniCheckCircleIcon,
  MiniInfoCircleIcon,
  MiniRemoveCircleIcon,
  MiniStarIcon,
  MiniWarningTriangleIcon,
} from '@skillsoft/gamut-icons';
import { breakpoints, variant } from '@skillsoft/gamut-styles';

/*
 * Design's mapping (gamut-styles colorSystem/migration.ts, Alert): the fill
 * is a status tint or a surface, the icon carries the status, and the message
 * stays text-default. Feature paints the brand gradient over its flat
 * fallback.
 */
export const alertVariants = {
  general: {
    order: 4,
    bg: 'surface-sunken',
    iconColor: 'action-primary',
    icon: MiniInfoCircleIcon,
  },
  success: {
    order: 2,
    bg: 'surface-success',
    iconColor: 'text-success',
    icon: MiniCheckCircleIcon,
  },
  error: {
    order: 1,
    bg: 'surface-error',
    iconColor: 'text-error',
    icon: MiniRemoveCircleIcon,
  },
  notice: {
    order: 3,
    bg: 'surface-warning',
    iconColor: 'text-warning',
    icon: MiniWarningTriangleIcon,
  },
  feature: {
    order: 5,
    bg: 'surface-brand',
    backgroundImage: 'var(--gradient-surface-brand)',
    iconColor: 'action-primary',
    icon: MiniStarIcon,
  },
  subtle: {
    bg: 'surface-sunken',
    iconColor: 'text-subtle',
    icon: MiniInfoCircleIcon,
  },
} as const;

export const placementVariants = variant({
  prop: 'placement',
  base: {
    alignItems: 'start',
    borderRadius: 'sm',
    columnGap: { _: 4, xs: 8, sm: 12 },
    display: 'grid',
    maxWidth: `calc(${breakpoints.md} - 4rem)`,
    pl: 4,
    width: 1,
  },
  variants: {
    inline: {
      border: 'none',
      py: 8,
    },
    floating: {
      borderColor: 'border-default',
      borderStyle: 'solid',
      borderWidth: '2px',
      py: 4,
    },
  },
});

export interface buttonExistenceObject {
  cta?: boolean;
  onClose?: boolean;
  truncated?: boolean;
}

export const getGridTemplateColumns = (
  buttonExistenceObject: buttonExistenceObject
) => {
  const numOfButtons = Object.values(buttonExistenceObject).filter(
    (item) => item === true
  ).length;
  const repeatCount = numOfButtons <= 0 ? 1 : numOfButtons;
  return `max-content minmax(0, 1fr) repeat(${repeatCount}, max-content)`;
};

export const getAlertRightPadding = (onClose: boolean) => {
  return onClose ? 4 : ({ _: 4, xs: 12, sm: 16 } as const);
};
