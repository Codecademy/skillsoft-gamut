import styled from '@emotion/styled';
import { css, styledOptions } from '@skillsoft/gamut-styles';

import type { FlexBoxProps } from './props';
import { boxProps, flexStates, sharedStates } from './props';

export const FlexBox = styled(
  'div',
  styledOptions(['fit', 'wrap', 'center', 'column', 'row', 'inline'])
)<FlexBoxProps>(css({ display: 'flex' }), sharedStates, flexStates, boxProps);

export type { FlexBoxProps } from './props';
