import styled from '@emotion/styled';
import { css } from '@skillsoft/gamut-styles';

export const KeyboardKey = styled.kbd(
  css({
    mx: 2 as any,
    fontFamily: 'monospace',
    fontSize: '0.75rem' as any,
    bg: 'surface-sunken',
    border: 1,
    borderColor: 'border-subtle',
    borderRadius: 'sm',
    px: 4,
    py: 2 as any,
    boxShadow: 'inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
  })
);
