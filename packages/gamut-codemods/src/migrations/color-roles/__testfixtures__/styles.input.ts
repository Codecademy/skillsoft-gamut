import styled from '@emotion/styled';
import { css, states, themed, variant } from '@skillsoft/gamut-styles';

export const base = css({
  bg: 'primary',
  color: 'background',
  '&:hover': { bg: 'primary-hover' },
});

export const variants = variant({
  variants: {
    quiet: { textColor: 'text-secondary', borderColor: 'border-tertiary' },
    loud: { bg: 'danger', variant: 'primary' },
  },
});

export const flags = states({ selected: { bg: 'background-selected' } });

export const Swatch = styled.div<{ variant: string }>`
  color: ${({ theme }) => theme.colors.text};
  background: ${(props) => props.theme.colors['background-hover']};
  border-color: ${({ theme }) => theme.colors.background};
  outline-color: ${themed('colors.primary')};
`;

export const runtime = (v: string) => css({ bg: `${v}-hover` });

const kind = 'primary';
export const untouched = { variant: kind, label: 'text' };
