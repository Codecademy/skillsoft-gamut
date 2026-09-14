import styled from '@emotion/styled';
import { css } from '@skillsoft/gamut-styles';

import { FormGroupLabel } from '../../Form';
import { Select } from '../../Form/inputs/Select';

export const StyledFormGroupLabel = styled(FormGroupLabel)(
  css({
    mr: 8,
    mt: 4,
  })
);
export const WidthSelect = styled(Select)(
  css({
    width: 'max-content',
    pr: 12,
  })
);
