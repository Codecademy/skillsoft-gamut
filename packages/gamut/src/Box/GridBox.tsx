import styled from '@emotion/styled';
import { styledOptions, system } from '@skillsoft/gamut-styles';

import type { GridBoxProps} from './props';
import { boxProps, gridStates, sharedStates } from './props';

export const GridBox = styled(
  'div',
  styledOptions(['fit', 'center', 'fitContent'])
)<GridBoxProps>(
  system.css({ display: 'grid' }),
  sharedStates,
  gridStates,
  boxProps
);

export type { GridBoxProps } from './props';
