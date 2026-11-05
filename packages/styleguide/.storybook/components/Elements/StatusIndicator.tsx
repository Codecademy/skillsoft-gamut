import styled from '@emotion/styled';
import { css, variant } from '@skillsoft/gamut-styles';
import { StyleProps } from '@skillsoft/variance';

export const badgeVariants = variant({
  prop: 'status',
  variants: {
    static: {
      textColor: 'text-success',
    },
    current: {
      textColor: 'text-success',
    },
    updating: {
      textColor: 'action-primary',
    },
    deprecated: {
      textColor: 'text-warning',
    },
  },
});

export const StatusIndicator = styled.span(badgeVariants, css({ mr: 4 }));

export const StatusTab = styled.div<StyleProps<typeof badgeVariants>>`
  position: absolute;
  left: calc(100% + 1rem);
  top: 0;
  height: 100%;
  width: 0.5rem;
  border-radius: 0.25rem 0 0 0.25rem;
  background-color: currentColor;
  ${badgeVariants}
`;
