import styled from '@emotion/styled';
import { css, theme, transitionConcat, variant } from '@skillsoft/gamut-styles';

export type conditionalStyleProps = {
  error?: boolean;
  activated?: boolean;
  isFocused?: boolean | null;
  isDisabled?: boolean | null;
};

export enum InputSelectors {
  HOVER = '&:hover',
  ACTIVE = '&:active',
  PLACEHOLDER = '&:placeholder',
  FOCUS = '&:focus',
  FOCUS_LABEL_DIV_CHILD = '&:focus + label > div',
  DISABLED = "&:disabled, &[aria-disabled='true']",
  BEFORE = '&::before',
  AFTER = '&::after',
  BEFORE_AND_AFTER = '&::before, &::after',
  CHECKED_BEFORE = '&:checked + label::before',
  CHECKED_AFTER = '&:checked + label::after',
  HOVER_FOCUS_BEFORE = '&:hover + label::before, &:focus + label::before',
}

export const formBaseStyles = {
  fontWeight: 'base',
  fontSize: 16,
  color: 'text-default',
} as const;

export const formBaseComponentStyles = {
  width: 1,
  outline: 'none',
  bg: 'surface-raised',
  minWidth: 'auto',
  ...formBaseStyles,
} as const;

export const formFieldFocusStyles = {
  borderColor: 'action-primary',
  boxShadow: `inset 0 0 0 1px ${theme.colors['action-primary']}`,
} as const;

/* A disabled label is `action-disabled`, the same color as a disabled fill. */
export const formFieldTextDisabledStyles = {
  color: 'action-disabled',
  cursor: 'not-allowed',
} as const;

export const formFieldBaseDisabledStyles = {
  borderColor: 'currentColor',
  opacity: 1,
  ...formFieldTextDisabledStyles,
} as const;

/*
 * Inside a disabled field the value is `text-subtle`, the one place it stays,
 * and the outline is `border-default`.
 */
export const formFieldDisabledStyles = {
  ...formFieldBaseDisabledStyles,
  color: 'text-subtle',
  borderColor: 'border-default',
  bg: 'action-disabled',
  [InputSelectors.HOVER]: {
    borderColor: 'border-default',
  },
} as const;

export const formFieldPaddingStyles = {
  py: 12,
  px: 8,
} as const;

export const formBaseFieldStylesObject = {
  ...formBaseComponentStyles,
  transition: transitionConcat(
    ['background-color', 'box-shadow'],
    'slow',
    'ease-in-out'
  ),
  border: 1,
  borderColor: 'border-default',
  borderRadius: 'md',
  /* Hover darkens the outline; blue only ever means focus. */
  [InputSelectors.HOVER]: {
    borderColor: 'border-strong',
  },
  [InputSelectors.PLACEHOLDER]: {
    fontStyle: 'italic',
  },
  [InputSelectors.DISABLED]: {
    ...formFieldDisabledStyles,
  },
} as const;

export const formBaseFieldStyles = css(formBaseFieldStylesObject);

const inputWrapper = css({
  margin: '0.25rem 0',
  width: '100%',
  fontWeight: 'normal',
  display: 'flex',
});

export const InputWrapper = styled.div(inputWrapper);

export const formFieldStyles = css({
  ...formBaseFieldStylesObject,
  ...formFieldPaddingStyles,
  lineHeight: 'base',
  [InputSelectors.FOCUS]: formFieldFocusStyles,
});

export const conditionalStyles = variant({
  variants: {
    error: {
      borderColor: 'text-error',
      [InputSelectors.HOVER]: {
        borderColor: 'text-error',
      },
      [InputSelectors.FOCUS]: {
        borderColor: 'text-error',
        boxShadow: `inset 0 0 0 1px ${theme.colors['text-error']}`,
      },
    },
    activated: { borderColor: 'currentColor' },
  },
});

export const conditionalStyleState = (error: boolean, activated: boolean) => {
  return error ? 'error' : activated ? 'activated' : undefined;
};

export const inputSizeStyles = variant({
  prop: 'inputSize',
  defaultVariant: 'base',
  base: {
    px: 8,
  },
  variants: {
    base: {
      ...formFieldPaddingStyles,
    },
    small: {
      py: 3 as any,
    },
    smallFile: {
      py: 2 as any,
    },
  },
});
