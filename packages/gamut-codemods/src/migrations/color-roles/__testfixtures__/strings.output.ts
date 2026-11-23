import styled from '@emotion/styled';

export const Panel = styled.div`
  color: var(--color-text-default);
  border: 1px solid var(--color-border-default);
`;

export const Raised = styled.div/* color-roles: 'background' splits into surface-raised | surface-default. Anything that sits on the page (card, input, menu, popover, dialog) takes `surface-raised`. Where `background` fills the page itself, it is `surface-default`. */ `
  background: var(--color-background);
`;

export const fill = /* color-roles: 'navy-800' is an old palette color with no role of its own, used as a CSS variable. Pick the role from design's component map (@skillsoft/gamut-brand src/migration.ts, COMPONENTS). */ 'var(--color-navy-800)';
export const link = { color: 'var(--color-action-primary)' };
