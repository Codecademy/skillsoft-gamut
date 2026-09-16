import { Alert } from '@skillsoft/gamut';

import styled from '@emotion/styled';
import { css } from '@skillsoft/gamut-styles';
import { ReactNode } from 'react';

const StyledAlert = styled(Alert)(
  css({
    my: 16,
  })
);

export const Callout: React.FC<{ text: string | ReactNode }> = ({ text }) => {
  return (
    <StyledAlert type="subtle" placement="inline">
      {text}
    </StyledAlert>
  );
};
