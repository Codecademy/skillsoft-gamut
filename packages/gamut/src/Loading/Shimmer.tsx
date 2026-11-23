import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { css, theme } from '@skillsoft/gamut-styles';
import type * as React from 'react';

import type { BoxProps } from '../Box';
import { Box } from '../Box';

const slide = keyframes({
  from: { left: -500 },
  to: { left: 500 },
});

const fade = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
});

/*
 * Design's shimmer: a `surface-sunken` base with a `surface-raised` sweep,
 * so it follows the mode on its own.
 */
const ShimmerForeground = styled(Box)(
  css({
    animation: `${slide} 2s linear infinite, ${fade} 1s linear infinite alternate`,
    background: `linear-gradient(
      to right,
      transparent 20%,
      ${theme.colors['surface-raised']} 50%,
      transparent 80%
    )`,
  })
);

export const Shimmer: React.FC<BoxProps> = (props) => (
  <Box {...props}>
    <Box bg="surface-sunken" fit overflow="hidden" position="relative">
      <ShimmerForeground height={1} position="absolute" width={500} />
    </Box>
  </Box>
);
