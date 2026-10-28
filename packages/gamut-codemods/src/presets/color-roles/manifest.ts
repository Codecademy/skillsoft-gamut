import { aliases, oldPalette, roles } from './aliases';

/*
  color-roles: today's Gamut color names → the roles of the generated color
  system. The rows are design's (aliases.ts, generated); this file holds the
  shape and the props a color can appear in.
*/

/*
  - rename / merge: one role replaces the name. Applied.
  - split: one of several roles, depending on where it's used.
  - retire: no role replaces it; `rule` says what to do instead.
  - pending: decided, but its role arrives with a system that doesn't exist
    yet (shadows, with elevation).
  The last three need a person; the codemod leaves the name and a comment.
*/
export type ColorKind = 'rename' | 'merge' | 'split' | 'retire' | 'pending';

export interface ColorAlias {
  kind: ColorKind;
  /* Roles, most common first. Empty for some retire and pending rows. */
  to: string[];
  rule: string;
}

export interface ColorRolesManifest {
  aliases: Record<string, ColorAlias>;
  /* Every role of the generated system; alias targets must be among them. */
  roles: string[];
  /* Old palette names (navy, hyper-500, …). No role replaces them by name. */
  oldPalette: string[];
  /* Props whose values are color names: gamut-styles variance/config.ts `color`. */
  colorProps: string[];
}

export const manifest: ColorRolesManifest = {
  aliases,
  roles,
  oldPalette,
  colorProps: [
    'color',
    'textColor',
    'bg',
    'borderColor',
    'borderColorX',
    'borderColorY',
    'borderColorLeft',
    'borderColorRight',
    'borderColorTop',
    'borderColorBottom',
  ],
};

/* Applied by the codemod, vs. left for a person. */
export const isAutomatic = (alias: ColorAlias) =>
  alias.kind === 'rename' || alias.kind === 'merge';
