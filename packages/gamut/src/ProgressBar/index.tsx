import styled from '@emotion/styled';
import type { PatternProps } from '@skillsoft/gamut-patterns';
import { variant } from '@skillsoft/gamut-styles';
import * as React from 'react';

import { Box } from '../Box';
import { Text } from '../Typography';

export type ProgressBarProps = {
  /**
   * Whether to increase size and display the percentage as text.
   */
  size?: 'small' | 'medium' | 'large' | 'xl';

  /**
   * Minimum amount of the bar to fill in visually.
   */
  minimumPercent?: number;

  /**
   * How much of the bar to fill in, as a number in [0, 100].
   */
  percent: number;

  /**
   * Base variant display themes.
   */
  variant: 'blue' | 'yellow' | 'default';

  /**
   * Whether to flatten the bottom or top of the progress bar.
   */
  flat?: 'flat-bottom' | 'flat-top';

  /**
   * Pattern component to use as a background.
   */
  pattern?: React.ComponentType<PatternProps>;
};

const progressBarFlatVariants = variant({
  defaultVariant: 'default',
  prop: 'flat',
  variants: {
    'flat-bottom': {
      borderRadiusBottom: 'none',
    },
    'flat-top': {
      borderRadiusTop: 'none',
    },
    default: {},
  },
});

const progressBarSizeVariants = variant({
  defaultVariant: 'small',
  prop: 'size',
  base: {
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
  },
  variants: {
    small: {
      height: '6px',
      borderRadius: 'sm',
    },
    medium: {
      height: '8px',
      borderRadius: 'md',
    },
    large: {
      height: '18px',
      borderRadius: 'lg',
      fontSize: 14,
    },
    xl: {
      height: '36px',
      borderRadius: 'xl',
    },
  },
});

const progressBarBackgroundVariants = variant({
  defaultVariant: 'default',
  /* Design's progress map: every variant is the same sunken track. */
  base: {
    borderWidth: '1px',
    borderStyle: 'solid',
    bg: 'surface-sunken',
    borderColor: 'border-default',
  },
  variants: {
    blue: {},
    yellow: {},
    default: {},
  },
});

const progressBarBackgroundOverride = variant({
  defaultVariant: 'none',
  prop: 'backgroundOverride',
  variants: {
    pattern: {
      bg: 'transparent',
    },
    none: {},
  },
});

const progressBarForegroundVariants = variant({
  defaultVariant: 'default',
  base: {
    alignItems: 'center',
    height: '100%',
    display: 'flex',
    transition: 'width 0.5s',
    position: 'relative',
  },
  /* Every bar is `text-default`, blue and yellow included. */
  variants: {
    blue: {
      bg: 'text-default',
      textColor: 'text-inverse',
    },
    yellow: {
      bg: 'text-default',
      textColor: 'text-inverse',
    },
    default: {
      bg: 'text-default',
      textColor: 'text-inverse',
    },
  },
});

type ProgressBarElementProps = Pick<
  ProgressBarProps,
  'variant' | 'size' | 'flat'
>;

type ProgressBarElementWrapperProps = ProgressBarElementProps & {
  backgroundOverride: 'pattern' | 'none';
};

const ProgressBarWrapper = styled.div<ProgressBarElementWrapperProps>`
  ${progressBarBackgroundVariants};
  ${progressBarSizeVariants};
  ${progressBarBackgroundOverride};
  ${progressBarFlatVariants};
`;

const Bar = styled(Box)(progressBarForegroundVariants);

const DisplayedPercent = styled.span`
  font-weight: bold;
  padding: 0.5rem;
  text-align: right;
  width: 100%;
`;

export const ProgressBar: React.FC<ProgressBarProps> = ({
  flat,
  minimumPercent = 0,
  percent,
  pattern: Pattern,
  size = 'small',
  variant,
}) => {
  const id = React.useId();
  return (
    <ProgressBarWrapper
      aria-labelledby={id}
      aria-live="polite"
      backgroundOverride={Pattern ? 'pattern' : 'none'}
      flat={flat}
      role="figure"
      size={size}
      variant={variant}
    >
      <Text as="label" id={id} screenreader>{`Progress: ${percent}%`}</Text>
      {Pattern && <Pattern position="absolute" width="100%" zIndex={0} />}
      <Bar
        borderRadiusBottomRight={flat ? 'none' : 'inherit'}
        borderRadiusTopRight={flat ? 'none' : 'inherit'}
        data-testid="progress-bar-bar"
        variant={variant}
        width={`${Math.max(minimumPercent, percent)}%`}
      >
        {['large', 'xl'].includes(size) && (
          <DisplayedPercent aria-hidden>{percent}%</DisplayedPercent>
        )}
      </Bar>
    </ProgressBarWrapper>
  );
};
