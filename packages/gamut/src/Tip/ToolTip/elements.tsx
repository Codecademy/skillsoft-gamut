import styled from '@emotion/styled';
import type { StyleProps } from '@skillsoft/variance';

import { Box } from '../../Box';
import { toolTipAlignmentVariants } from '../shared/styles/styles';

export interface ToolTipContainerProps
  extends StyleProps<typeof toolTipAlignmentVariants> {}

export const ToolTipContainer = styled(Box)<ToolTipContainerProps>(
  toolTipAlignmentVariants
);
