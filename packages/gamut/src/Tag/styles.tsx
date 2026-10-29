import { css, states, theme, variant } from '@skillsoft/gamut-styles';

import { InteractiveSelectors, Selectors } from '../ButtonBase/ButtonBase';

export const tagLabelFontSize = 14;
export const tagLabelPadding = 8;
export const tagBaseStyles = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'center',
  maxWidth: '100%',
  width: 'fit-content',
};
export const dismissSharedStyles = {
  alignItems: 'center',
  display: 'flex',
  height: '100%',
  justifyContent: 'center',
  minWidth: '24px',
};

const textDefaultVerticalPadding = 1.5;
const textLargeVerticalPadding = 5.5;
const anchorDefaultVerticalPadding = 0.5;
const anchorLargeVerticalPadding = 4.5;
const hoverAndFocus = `${Selectors.HOVER}, ${Selectors.FOCUS}` as const;

export const outlineStyling = css({
  // This is a bit of a hack as we don't have access to focus-visible from this component. If you are not properly dismissing your tags you may see this primary colored outline after clicking X, but otherwise you should never hit this behavior.
  borderRadius: 'md',
  flexDirection: 'row',
  maxWidth: 'fit-content',
  overflow: 'hidden',
  width: '100%',
  '&:focus-within': {
    outline: `2px solid ${theme.colors['action-primary']}`,
    outlineOffset: '2px',
  },
  '&:active': {
    outlineColor: `transparent`,
  },
});

export const outlineStates = states({
  disabled: {
    cursor: 'not-allowed',
    userSelect: 'none',
  },
  readOnly: {
    borderRadius: 'none',
  },
});

export const tagUsageVariants = variant({
  defaultVariant: 'readOnly',
  base: {
    alignItems: 'center',
    borderRadius: 'md',
    display: 'flex',
    justifyContent: 'center',
    maxWidth: '100%',
    width: 'fit-content',
  },
  variants: {
    readOnly: {
      bg: 'surface-sunken',
      borderRadius: 'none',
      color: 'text-default',
    },
    selection: {
      bg: 'text-subtle',
      borderRadiusRight: 'none',
      color: 'text-inverse',
    },
    /*
     * Navigation and suggestion tags have no fill of their own: they sit on
     * whatever surface they're on (design, 2026-10-29). Hover and press are
     * veils over it.
     */
    navigation: {
      bg: 'transparent',
      border: 1,
      borderColor: 'border-default',
      [InteractiveSelectors.ACTIVE]: {
        bg: 'state-pressed',
      },
    },
    suggestion: {
      bg: 'transparent',
      border: 1,
      borderColor: 'action-primary',
      color: 'text-default',
    },
  },
});

export const textSizeVariants = variant({
  defaultVariant: 'default',
  prop: 'size',
  variants: {
    default: {
      pt: (textDefaultVerticalPadding + 1) as any,
      pb: (textDefaultVerticalPadding - 1) as any,
    },
    large: {
      pt: (textLargeVerticalPadding + 1) as any,
      pb: (textLargeVerticalPadding - 1) as any,
    },
  },
});

export const anchorSizeVariants = variant({
  defaultVariant: 'default',
  prop: 'size',
  variants: {
    default: {
      py: anchorDefaultVerticalPadding as any,
    },
    large: {
      py: anchorLargeVerticalPadding as any,
    },
  },
});

export const tagWrapperStates = states({
  readOnly: {
    borderRadius: 'none',
  },
  disabled: {
    // Needed for suggestion's bordercolor since the text element won't have the correct style
    borderColor: 'border-default',
  },
  /*
   * A disabled tag has no fill (design, 2026-10-29), so there's nothing for
   * a knockout label to sit on. The label takes the disabled ink instead,
   * and the chip keeps an edge, inset so disabling it doesn't resize it.
   */
  selectionDisabled: {
    bg: 'transparent',
    color: 'action-disabled',
    boxShadow: `inset 0 0 0 1px ${theme.colors['border-default']}`,
  },
});

export const tagTextStyling = css({
  fontSize: tagLabelFontSize,
  lineHeight: 1.5 as any,
  px: tagLabelPadding,
});

export const anchorVariants = variant({
  prop: 'interactiveType',
  base: {
    fontSize: 14,
    lineHeight: 1.5 as any,
    px: tagLabelPadding,
    textDecoration: 'none',
    ':before': {
      display: 'none',
    },
    color: 'text-default',
    [InteractiveSelectors.FOCUS_VISIBLE]: {
      outline: 'none',
      border: 'none',
    },
    [InteractiveSelectors.FOCUS]: {
      textDecoration: 'none',
    },
    [InteractiveSelectors.HOVER]: {
      bg: 'state-hover',
    },
    [InteractiveSelectors.DISABLED]: {
      borderColor: 'border-default',
      bg: 'transparent',
      color: 'action-disabled',
    },
  },
  variants: {
    /* Hover and press are veils over the tag's surface. */
    navigation: {
      [InteractiveSelectors.ACTIVE]: {
        bg: 'state-pressed',
        textDecoration: 'none',
      },
    },
    suggestion: {
      [InteractiveSelectors.ACTIVE]: {
        bg: 'state-pressed',
        textDecoration: 'none',
      },
    },
  },
});

export const dismissButtonOverrides = {
  // These pseudo elements add an extra slightly opaque border on hover/focus
  '::before, ::after': {
    display: 'none',
  },
  // This removes a black solid outline on focus
  [InteractiveSelectors.OUTLINE_FOCUS_VISIBLE]: {
    opacity: 0,
  },
};

export const dismissButtonLargeStyling = states({
  isLarge: {
    minWidth: 32,
  },
});

export const dismissButtonStyling = css({
  bg: 'text-subtle',
  border: 'none',
  borderRadiusLeft: 'none',
  borderRadiusRight: 'md',
  color: 'text-inverse',
  width: '100%',
  [hoverAndFocus]: {
    color: 'text-inverse',
    bg: 'text-default',
  },
  [InteractiveSelectors.DISABLED]: {
    bg: 'transparent',
    color: 'action-disabled',
  },
  ...dismissSharedStyles,
  ...dismissButtonOverrides,
});

export const defaultMiniDeleteIconStyling = css({
  color: 'inherit',
  width: 12,
});

export const largeMiniDeleteIconStyling = css({
  color: 'inherit',
  width: 16,
});
