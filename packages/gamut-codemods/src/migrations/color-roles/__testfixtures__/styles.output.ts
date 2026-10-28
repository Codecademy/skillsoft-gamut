import styled from '@emotion/styled';
import { css, states, themed, variant } from '@skillsoft/gamut-styles';

export const base = css({
  bg: 'action-primary',
  /* color-roles: 'background' splits into surface-raised | surface-default. Anything that sits on the page (card, input, menu, popover, dialog) takes `surface-raised`. Where `background` fills the page itself, it is `surface-default`. */ color: 'background',
  '&:hover': { bg: 'action-primary-hover' },
});

export const variants = variant({
  variants: {
    quiet: { textColor: 'text-subtle', /* color-roles: 'border-tertiary' splits into border-subtle | border-strong. A divider or card hairline is `border-subtle`. Where it marks an active field or a selected row, it is `border-strong`. Gamut’s own two usages, the FeatureShimmer edge and the List scroll shadow, are both `border-subtle`. Core resolves it to a light navy and Percipio to a dark one, so check each app usage for which it meant. */ borderColor: 'border-tertiary' },
    loud: { bg: 'action-danger', variant: 'primary' },
  },
});

export const flags = states({ selected: { bg: 'state-selected' } });

export const Swatch = styled.div<{ variant: string }>`
  color: ${({ theme }) => theme.colors['text-default']};
  background: ${(props) => /* color-roles: 'background-hover' splits into state-hover | surface-sunken. As a hover, it is the `state-hover` veil. Used as a resting fill (the subtle Alert, a tinted panel), it is `surface-sunken`. */ props.theme.colors['background-hover']};
  border-color: ${({ theme }) => /* color-roles: 'background' splits into surface-raised | surface-default. Anything that sits on the page (card, input, menu, popover, dialog) takes `surface-raised`. Where `background` fills the page itself, it is `surface-default`. */ theme.colors.background};
  outline-color: ${themed('colors.action-primary')};
`;

export const runtime = (v: string) => css({ bg: `${v}-hover` });

const kind = 'primary';
export const untouched = { variant: kind, label: 'text' };
