import styled from '@emotion/styled';
import { styledOptions } from '@skillsoft/gamut-styles';

import type { BoxProps } from './props';
import { boxProps, sharedStates } from './props';

export const Box = styled('div', styledOptions(['fit']))<BoxProps>(
  sharedStates,
  boxProps
);

export type { BoxProps } from './props';
