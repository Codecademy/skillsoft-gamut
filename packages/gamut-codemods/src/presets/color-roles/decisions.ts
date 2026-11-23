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

/*
  The warning family. yellow-0 is the warning tint and bare yellow or
  yellow-900 is the warning ink, as the old core theme uses them. yellow-400
  and yellow-500 are the accent, so they stay warnings for a person.
*/
const YELLOW_FILL_WARNING = 'surface-warning';
const YELLOW_TEXT_WARNING = 'text-warning';

/*
  hyper is the old primary: primary fills, links and focus. Only hyper and
  hyper-500 map, since the other steps are hover and pressed tints.
*/
const HYPER: Record<UseKind, string> = {
  fill: 'action-primary',
  text: 'action-primary',
  border: 'action-primary',
};

/*
  blue-500 is admin's light-mode primary. Its text is interactive (links,
  focus), so it takes action-primary. Its fills and borders mix interactive
  uses (selection buttons) with decoration (the Skillsoft family block), and
  the codemod can't tell them apart, so they stay warnings. Bare `blue` is
  the same color.
*/
const BLUE_TEXT = 'action-primary';

/*
  The greys are neutral (no hue), and a brightness match would make the
  mid greys text-inverse, which is light ink on a light page. So they follow
  what the use is: fills by lightness, every grey text as text-subtle, and
  borders by weight. Gray-100 to 300 text stays a warning, since it would be
  close to invisible on a light page.
*/
const GRAY_FILL: Record<string, string> = {
  '100': 'surface-default',
  '200': 'surface-sunken',
  '300': 'surface-sunken',
};
const GRAY_TEXT: Record<string, string> = {
  '600': 'text-subtle',
  '800': 'text-subtle',
  '900': 'text-subtle',
};
const GRAY_BORDER: Record<string, string> = {
  '300': 'border-subtle',
  '600': 'border-default',
  '800': 'border-default',
  '900': 'border-default',
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
    case 'gray': {
      const table = { fill: GRAY_FILL, text: GRAY_TEXT, border: GRAY_BORDER }[
        kind
      ];
      return table[shade ?? ''] ?? null;
    }
    case 'blue':
      return (shade === undefined || shade === '500') && kind === 'text'
        ? BLUE_TEXT
        : null;
    case 'yellow':
      if (kind === 'fill' && shade === '0') return YELLOW_FILL_WARNING;
      if (kind === 'text' && (shade === undefined || shade === '900'))
        return YELLOW_TEXT_WARNING;
      return null;
    case 'hyper':
      return shade === undefined || shade === '500' ? HYPER[kind] : null;
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
  YELLOW_FILL_WARNING,
  YELLOW_TEXT_WARNING,
  ...Object.values(NAVY).flatMap((steps) => Object.values(steps)),
];
