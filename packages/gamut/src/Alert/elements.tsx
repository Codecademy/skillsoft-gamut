import styled from '@emotion/styled';
import { Background, css } from '@skillsoft/gamut-styles';
import { motion } from 'framer-motion';
import type { ComponentProps } from 'react';
import { forwardRef } from 'react';

import { Box } from '../Box';
import { FillButton } from '../Button';
import type { AlertProps } from './Alert';
import { placementVariants } from './variants';

/*
 * A brand gradient's circles are sized in `cqw` against the alert's width.
 * An element can't be its own query container, so the alert becomes one and
 * the gradient goes on a layer behind its content, over the flat `bg`
 * fallback (the sandbox's GradientLayer). Without it `cqw` falls back to the
 * viewport and the circles render page-sized.
 */
const gradientLayer = ({ gradient }: { gradient?: string }) =>
  gradient
    ? {
        position: 'relative' as const,
        isolation: 'isolate' as const,
        containerType: 'inline-size' as const,
        '&::before': {
          content: '""',
          position: 'absolute' as const,
          inset: 0,
          zIndex: -1,
          borderRadius: 'inherit',
          backgroundImage: gradient,
        },
      }
    : {};

const StyledAlertBanner = styled(Background)<
  Pick<AlertProps, 'type' | 'placement'> & { gradient?: string }
>(placementVariants, gradientLayer);

export const AlertBanner = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof StyledAlertBanner>
>(
  (
    {
      'aria-label': ariaLabel = 'alert banner',
      'aria-live': ariaLive = 'polite',
      role = 'status',
      ...rest
    },
    ref
  ) => (
    <StyledAlertBanner
      aria-label={ariaLabel}
      aria-live={ariaLive}
      ref={ref}
      role={role}
      {...rest}
    />
  )
);

const StyledAlertBox = styled(Box)<
  Pick<AlertProps, 'type' | 'placement'> & { gradient?: string }
>(placementVariants, gradientLayer);

export const AlertBox = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof StyledAlertBox>
>(
  (
    {
      'aria-label': ariaLabel = 'alert box',
      'aria-live': ariaLive = 'polite',
      role = 'status',
      ...rest
    },
    ref
  ) => (
    <StyledAlertBox
      aria-label={ariaLabel}
      aria-live={ariaLive}
      ref={ref}
      role={role}
      {...rest}
    />
  )
);

export const alertContentProps = {
  as: 'span',
  display: 'inline-block',
  width: '100%',
} as const;

export const CollapsibleContent = styled(motion.div)(
  css({
    py: 4,
    overflowY: 'hidden',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  })
);

export const CleanFillButton = styled(FillButton)(
  css({
    // Otherwise VoiceOver annouces the button's text twice
    '::before': {
      display: 'none',
    },
  })
);
