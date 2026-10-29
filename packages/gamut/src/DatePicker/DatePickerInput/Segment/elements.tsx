import styled from '@emotion/styled';
import { css, states } from '@skillsoft/gamut-styles';
import type { StyleProps } from '@skillsoft/variance';

const segmentStyles = states({
  isEmpty: {
    color: 'text-subtle',
  },
  isYear: {
    minWidth: '4ch',
  },
});

type SegmentStyleProps = StyleProps<typeof segmentStyles>;

export const Segment = styled.span<SegmentStyleProps>(
  css({
    display: 'inline-block',
    textAlign: 'center',
    minWidth: '2ch',
    padding: 0,
    margin: 0,
    color: 'text-default',
    cursor: 'text',
    '&:focus': {
      bg: 'action-primary',
      color: 'text-inverse',
      borderRadius: 'md',
    },
    '&:focus-visible': {
      outline: 'none',
    },
  }),
  segmentStyles
);

export const SegmentLiteral = styled.span(
  css({
    color: 'text-subtle',
    userSelect: 'none',
    px: 4,
  })
);
