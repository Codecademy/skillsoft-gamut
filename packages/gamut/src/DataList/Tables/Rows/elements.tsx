import styled from '@emotion/styled';
import { states } from '@skillsoft/gamut-styles';

import { TableHeader } from '../../../List';

export const StyledHeaderRow = styled(TableHeader)(
  states({
    invisible: { visibility: 'hidden', height: 0, overflow: 'hidden' },
    isDataList: {
      borderX: '1px solid transparent' as any,
    },
  })
);
