import {
  css,
  theme,
  timing,
  transitionConcat,
  variant,
} from '@skillsoft/gamut-styles';

import {
  formBaseComponentStyles,
  formFieldBaseDisabledStyles,
  InputSelectors,
} from '.';

const consistentLabelStyles = {
  content: '""',
  display: 'block',
  width: 20,
  height: 20,
  minWidth: 20,
  borderRadius: 'full',
  mr: 8,
} as const;

export const radioLabel = css({
  ...formBaseComponentStyles,
  bg: 'transparent',
  display: 'flex',
  py: 16,
  alignItems: 'center',
  cursor: 'pointer',
  position: 'relative',
  [InputSelectors.BEFORE_AND_AFTER]: consistentLabelStyles,
  [InputSelectors.BEFORE]: {
    bg: 'surface-raised',
    boxShadow: `0 0 0 1px ${theme.colors['border-default']}`,
    transition: timing.medium,
  },
  [InputSelectors.AFTER]: {
    position: 'absolute',
    transition: transitionConcat(['transform'], 'medium', 'ease-in-out'),
    borderWidth: 5,
    borderStyle: 'solid',
    borderColor: 'surface-raised',
    transform: 'scale(0)',
  },
  width: 'max-content',
});

export const radioInput = css({
  [InputSelectors.CHECKED_AFTER]: {
    bg: 'action-primary',
    borderWidth: 4,
    borderStyle: 'solid',
    borderColor: 'surface-raised',
    transform: 'scale(1)',
  },
  [InputSelectors.CHECKED_BEFORE]: {
    boxShadow: `0 0 0 1px ${theme.colors['action-primary']}`,
  },
  [InputSelectors.HOVER_FOCUS_BEFORE]: {
    boxShadow: `0 0 0 2px ${theme.colors['action-primary']}`,
  },
});

/*
 * Design's radio map: the unchecked ring is `border-default`, and a checked
 * radio is `action-primary` (it used to take the label's text color). Error
 * and disabled keep drawing in the label's color.
 */
const currentColorRing = {
  [InputSelectors.BEFORE]: {
    boxShadow: `0 0 0 1px currentColor`,
  },
} as const;

const currentColorChecked = {
  [InputSelectors.CHECKED_AFTER]: {
    bg: 'currentColor',
  },
  [InputSelectors.CHECKED_BEFORE]: {
    boxShadow: `0 0 0 1px currentColor`,
  },
} as const;

export const conditionalRadioLabelStyles = variant({
  base: {
    [InputSelectors.BEFORE]: {
      boxShadow: `0 0 0 1px ${theme.colors['border-default']}`,
    },
  },
  variants: {
    error: {
      ...currentColorRing,
      [InputSelectors.BEFORE_AND_AFTER]: {
        color: 'text-error',
      },
    },
    disabled: {
      ...formFieldBaseDisabledStyles,
      ...currentColorRing,
    },
  },
});

export const conditionalRadioInputStyles = variant({
  base: {
    [InputSelectors.CHECKED_AFTER]: {
      bg: 'action-primary',
    },
    [InputSelectors.CHECKED_BEFORE]: {
      boxShadow: `0 0 0 1px ${theme.colors['action-primary']}`,
    },
  },
  variants: {
    error: {
      ...currentColorChecked,
      [InputSelectors.HOVER_FOCUS_BEFORE]: {
        boxShadow: `0 0 0 2px currentColor`,
      },
    },
    disabled: {
      ...formFieldBaseDisabledStyles,
      ...currentColorChecked,
      [InputSelectors.HOVER_FOCUS_BEFORE]: {
        boxShadow: `0 0 0 1px currentColor`,
      },
    },
  },
});
