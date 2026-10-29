import styled from '@emotion/styled';
import {
  css,
  fontSmoothPixel,
  states,
  timing,
  variant,
} from '@skillsoft/gamut-styles';
import type { StyleProps } from '@skillsoft/variance';

import { Box } from '../../Box';
import { InteractiveSelectors } from '../../ButtonBase/ButtonBase';
import {
  tooltipArrowHeight,
  tooltipBgColor,
  tooltipVariantStyles,
} from '../shared/styles/styles';
import type { TipPlacementComponentProps } from '../shared/types';

const textColor = 'action-neutral';

export const infoButtonStyles = css({
  borderColor: 'transparent',
  color: textColor,
  height: 24,
  width: 24,
  [InteractiveSelectors.HOVER]: {
    color: textColor,
    bg: 'state-hover',
  },
  [InteractiveSelectors.FOCUS_VISIBLE]: {
    color: textColor,
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
});

export type InfoButtonStatesProps = StyleProps<typeof infoButtonStates>;

export const infoTipAlignmentVariants = variant({
  prop: 'alignment',
  base: {
    bg: 'transparent',
    fontSmoothPixel,
    display: 'flex',
    transition: `opacity ${timing.fast}`,
    transitionDelay: `${timing.fast}`,
    position: 'absolute',
    '&::after': {
      bg: tooltipBgColor,
      content: '""',
      display: 'block',
      height: `${tooltipArrowHeight}`,
      position: 'absolute',
      width: `${tooltipArrowHeight}`,
      borderStyle: 'solid',
    },
  },
  variants: tooltipVariantStyles,
});

export const infoButtonStates = states({
  active: { bg: 'state-selected' },
});

export const infoVisibilityStates = states({
  hideTip: { visibility: 'hidden', opacity: 0 },
});

export const InfoTipContainer = styled(Box)<
  Pick<TipPlacementComponentProps, 'alignment'> &
    StyleProps<typeof infoVisibilityStates>
>`
  ${infoVisibilityStates}
  ${infoTipAlignmentVariants}
`;
