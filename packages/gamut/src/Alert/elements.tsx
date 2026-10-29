import type { Theme } from '@emotion/react';
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

type InkProps = Pick<AlertProps, 'placement'> & {
  ink?: string;
  theme: Theme;
};

/*
 * The variant's ink on the message, and on the edge of a floating Alert
 * (design's preview at sandbox 15c2195; its shared "Floating border" slot
 * still says border-default and is out of date).
 */
const alertInk = ({ ink, placement, theme }: InkProps) => {
  const color = ink && (theme.colors as Record<string, string>)[ink];
  if (!color) return {};
  return placement === 'floating' ? { color, borderColor: color } : { color };
};

const notInk = { shouldForwardProp: (prop: string) => prop !== 'ink' };

const StyledAlertBanner = styled(Background, notInk)<
  Pick<AlertProps, 'type' | 'placement'> & { gradient?: string; ink?: string }
>(placementVariants, gradientLayer, alertInk);

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

const StyledAlertBox = styled(Box, notInk)<
  Pick<AlertProps, 'type' | 'placement'> & { gradient?: string; ink?: string }
>(placementVariants, gradientLayer, alertInk);

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
