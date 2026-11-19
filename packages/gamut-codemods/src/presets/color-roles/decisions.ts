/*
  Hand-written decisions for old palette names, which have no role of their
  own. aliases.ts is generated from design's map, so the choices that map
  doesn't make live here.

  The codemod replaces a palette name only when it knows what the color is
  for (a background, a text color, or a border, from the prop it sits in). A
  theme lookup or a CSS variable doesn't say, so those stay warnings.

  - red: an error. A fill is the error tint (the Alert's surface); text and
    borders take the error ink, which is how design's map pairs feedback-error.
    A destructive button should be `action-danger` instead, so a red fill on
    a button needs a look.
  - green: the same for success.
  - white: the surface on a light page (fill), the light ink on a dark one
    (text), and a hairline (border). White is a translucent tint in the old
    palette, so its brightness depends on what sits behind it; these three
    are what it means in practice.
  - navy: picked by brightness. Each step is composited over the light page
    and matched to the nearest role in its family. Dark navy fills (400 and
    up) have no dark background role in the light palette, so they stay
    warnings for design to decide.
*/

export type UseKind = 'fill' | 'text' | 'border';

const PROP_KINDS: [RegExp, UseKind][] = [
  [/^(bg|background|backgroundColor)$/, 'fill'],
  [/^(color|textColor)$/, 'text'],
  [/^border(Color)?/, 'border'],
];

/* What a palette site is used as, from the `where` the visitor records. */
export const kindOfUse = (where: string): UseKind | null => {
  const match = /^the `([^`]+)` (?:prop|value)$/.exec(where);
  if (!match) return null;
  return PROP_KINDS.find(([re]) => re.test(match[1]))?.[1] ?? null;
};

const ERROR: Record<UseKind, string> = {
  fill: 'surface-error',
  text: 'text-error',
  border: 'text-error',
};

const SUCCESS: Record<UseKind, string> = {
  fill: 'surface-success',
  text: 'text-success',
  border: 'text-success',
};

const WHITE: Record<UseKind, string> = {
  fill: 'surface-raised',
  text: 'text-inverse',
  border: 'border-subtle',
};

const NAVY: Record<UseKind, Record<string, string>> = {
  fill: {
    '100': 'surface-default',
    '200': 'surface-sunken',
    '300': 'surface-sunken',
  },
  text: {
    '400': 'text-subtle',
    '500': 'text-subtle',
    '600': 'text-subtle',
    '700': 'text-subtle',
    '800': 'text-default',
  },
  border: {
    '100': 'border-subtle',
    '200': 'border-subtle',
    '300': 'border-subtle',
    '400': 'border-default',
    '500': 'border-default',
    '600': 'border-default',
    '700': 'border-strong',
    '800': 'border-strong',
  },
};

/*
  The role a palette name takes in this use, or null to leave it for a
  person. A bare `navy` is navy-800, and a bare `white` is the full white.
*/
export const paletteDefault = (name: string, where: string): string | null => {
  const kind = kindOfUse(where);
  if (!kind) return null;
  const family = name.replace(/-\d+$/, '');
  const shade = /-(\d+)$/.exec(name)?.[1];
  switch (family) {
    case 'red':
      return ERROR[kind];
    case 'green':
      return SUCCESS[kind];
    case 'white':
      return WHITE[kind];
    case 'navy':
      return NAVY[kind][shade ?? '800'] ?? null;
    default:
      return null;
  }
};

/* Every role a default can name. manifest.test.ts checks these exist. */
export const DEFAULT_ROLES = [
  ...Object.values(ERROR),
  ...Object.values(SUCCESS),
  ...Object.values(WHITE),
  ...Object.values(NAVY).flatMap((steps) => Object.values(steps)),
];
