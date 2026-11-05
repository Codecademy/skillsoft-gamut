import styled from '@emotion/styled';

export const Panel = styled.div`
  color: var(--colors-text-default);
  border: 1px solid var(--colors-border-default);
`;

export const Raised = styled.div/* color-roles: 'background' splits into surface-raised | surface-default. Anything that sits on the page (card, input, menu, popover, dialog) takes `surface-raised`. Where `background` fills the page itself, it is `surface-default`. */ `
  background: var(--color-background);
`;

export const fill = 'var(--color-navy-800)';
export const link = { color: 'var(--colors-action-primary)' };
