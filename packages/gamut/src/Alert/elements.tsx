import styled from '@emotion/styled';
import { Background, css } from '@skillsoft/gamut-styles';
import { motion } from 'framer-motion';
import type { ComponentProps} from 'react';
import { forwardRef } from 'react';

import { Box } from '../Box';
import { FillButton } from '../Button';
import type { AlertProps } from './Alert';
import { placementVariants } from './variants';

const StyledAlertBanner =
  styled(Background)<Pick<AlertProps, 'type' | 'placement'>>(placementVariants);

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

const StyledAlertBox =
  styled(Box)<Pick<AlertProps, 'type' | 'placement'>>(placementVariants);

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
