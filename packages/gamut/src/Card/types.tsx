import type { PatternProps } from '@skillsoft/gamut-patterns';
import type { StyleProps } from '@skillsoft/variance';
import type { ComponentProps } from 'react';

import type { Box } from '../Box';
import type { WithChildrenProp } from '../utils';
import type { DynamicCardWrapper } from './elements';
import type { cardVariants, shadowVariants } from './styles';

export interface CardWrapperProps
  extends StyleProps<typeof cardVariants>,
    StyleProps<typeof shadowVariants>,
    WithChildrenProp {
  borderRadius?: ComponentProps<typeof Box>['borderRadius'];
  /** *
   * Optional prop to provide a Card with styling to indicate if is interactive
   * (e.g. a shadow hover effect and 'md' border radius).
   */
  isInteractive?: boolean;
  /** *
   * Optional prop to assign a Pattern other than CheckerDense
   */
  pattern?: React.ComponentType<PatternProps>;
}

export type CardProps = Omit<
  React.ComponentProps<typeof DynamicCardWrapper>,
  'bg'
>;
