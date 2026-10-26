import type { Slot } from './brand';
import type { Grade } from './ramp';

/*
 * The role layer, as data. Ported from gamut-sandbox `roles.ts` at dffd84b
 * with every hue family swapped for its slot (blue → primary, magenta →
 * accent, violet → accent-alt, red → danger, amber → warning, teal → success).
 *
 * The sandbox's prose ("why this grade") stays in the sandbox; this file
 * keeps only what code needs: the values, the contrast floor a role is held
 * to, and what it's held against.
 */

export type Mode = 'light' | 'dark';
export const MODES: readonly Mode[] = ['light', 'dark'];

export type Boundary = 'white' | 'black';

export type Ref = { slot: Slot; grade: Grade } | Boundary;

export interface RoleValue {
  ref: Ref;
  /* Set for the translucent roles: state veils and the backdrop. */
  alpha?: number;
}

export interface GradientCircle {
  ref: Ref;
  /* Radius as a multiple of the element's width. */
  radius: number;
  /* CSS background-position for the circle's centre. */
  at: string;
}

export interface Gradient {
  circles: GradientCircle[];
}

export type RoleGroup =
  | 'surface'
  | 'text'
  | 'border'
  | 'action'
  | 'state'
  | 'viz'
  | 'other';

export interface Role {
  token: string;
  group: RoleGroup;
  light: RoleValue;
  dark: RoleValue;
  usage: string;
  /* Minimum WCAG contrast against every role in `against`. */
  floor?: number;
  against?: string[];
  gradient?: Record<Mode, Gradient>;
}

const at = (slot: Slot, grade: Grade): RoleValue => ({
  ref: { slot, grade },
});
const boundary = (ref: Boundary): RoleValue => ({ ref });
const veil = (slot: Slot, grade: Grade, alpha: number): RoleValue => ({
  ref: { slot, grade },
  alpha,
});

/*
 * Veil strengths. The binding constraint is `border-default` against the
 * veiled fill it encloses, at 3:1 (see the sandbox's STATE_ALPHA notes).
 */
export const STATE_ALPHA = {
  'state-hover': 0.06,
  'state-pressed': 0.09,
  'state-selected': 0.08,
} as const;

/* The six-stop falloff every gradient circle uses: [position %, alpha]. */
export const FALLOFF: [number, number][] = [
  [0, 0.45],
  [16, 0.43],
  [36, 0.24],
  [56, 0.11],
  [76, 0.04],
  [100, 0],
];

const ELEVATION = ['surface-sunken', 'surface-default', 'surface-raised'];
const ALL_SURFACES = [
  ...ELEVATION,
  'surface-success',
  'surface-warning',
  'surface-error',
];

const AA_TEXT = 4.5;
const AA_NON_TEXT = 3;

export const ROLES: Role[] = [
  /* surfaces */
  {
    token: 'surface-sunken',
    group: 'surface',
    light: at('neutral-light', 200),
    dark: boundary('black'),
    usage: 'Wells, insets, code blocks — anything recessed into the page.',
  },
  {
    token: 'surface-default',
    group: 'surface',
    light: at('neutral-light', 100),
    dark: at('neutral-dark', 1100),
    usage: 'The page background — the base every other surface elevates from.',
  },
  {
    token: 'surface-raised',
    group: 'surface',
    light: boundary('white'),
    dark: at('neutral-dark', 1000),
    usage: 'Cards, panels, dialogs, menus. Higher elevation is lighter.',
  },
  {
    token: 'surface-success',
    group: 'surface',
    light: at('success', 200),
    dark: at('success', 1000),
    usage: 'The success tint behind an alert or inline confirmation.',
  },
  {
    token: 'surface-warning',
    group: 'surface',
    light: at('warning', 200),
    dark: at('warning', 1000),
    usage: 'The warning tint behind an alert or inline caution.',
  },
  {
    token: 'surface-error',
    group: 'surface',
    light: at('danger', 200),
    dark: at('danger', 1000),
    usage: 'The error tint behind an alert or inline validation message.',
  },
  {
    token: 'surface-brand',
    group: 'surface',
    light: at('neutral-light', 100),
    dark: at('neutral-dark', 1100),
    usage:
      'The two-color brand gradient. The color is the flat fallback; the gradient ships as --gradient-surface-brand.',
    gradient: {
      light: {
        circles: [
          { ref: { slot: 'accent', grade: 300 }, radius: 0.85, at: '100% -5%' },
          { ref: { slot: 'primary', grade: 300 }, radius: 1.21, at: '5% 100%' },
        ],
      },
      dark: {
        circles: [
          { ref: { slot: 'accent', grade: 900 }, radius: 0.85, at: '100% -5%' },
          { ref: { slot: 'primary', grade: 900 }, radius: 1.21, at: '5% 100%' },
        ],
      },
    },
  },
  {
    token: 'surface-brand-subtle',
    group: 'surface',
    light: at('neutral-light', 100),
    dark: at('neutral-dark', 1100),
    usage:
      'The one-color brand gradient, for backgrounds behind real text. Ships as --gradient-surface-brand-subtle.',
    gradient: {
      light: {
        circles: [
          {
            ref: { slot: 'primary', grade: 300 },
            radius: 0.78,
            at: '50% -10%',
          },
        ],
      },
      dark: {
        circles: [
          {
            ref: { slot: 'primary', grade: 900 },
            radius: 0.78,
            at: '50% -10%',
          },
        ],
      },
    },
  },

  /* text */
  {
    token: 'text-default',
    group: 'text',
    light: at('neutral-dark', 1000),
    dark: at('neutral-light', 200),
    usage: 'Body copy and headings.',
    floor: AA_TEXT,
    against: ALL_SURFACES,
  },
  {
    token: 'text-subtle',
    group: 'text',
    light: at('neutral-dark', 800),
    dark: at('neutral-light', 400),
    usage: 'Secondary text — descriptions, metadata, helper copy.',
    floor: AA_TEXT,
    against: ALL_SURFACES,
  },
  {
    token: 'text-inverse',
    group: 'text',
    light: at('neutral-light', 200),
    dark: at('neutral-dark', 1000),
    usage: 'Labels on a filled control — action-primary, -neutral, -danger.',
    floor: AA_TEXT,
    against: ['action-primary', 'action-neutral', 'action-danger'],
  },
  {
    token: 'text-success',
    group: 'text',
    light: at('success', 900),
    dark: at('success', 300),
    usage: 'Success text and icons.',
    floor: AA_TEXT,
    against: [...ELEVATION, 'surface-success'],
  },
  {
    token: 'text-warning',
    group: 'text',
    light: at('warning', 900),
    dark: at('warning', 300),
    usage: 'Warning text and icons. Always with an icon.',
    floor: AA_TEXT,
    against: [...ELEVATION, 'surface-warning'],
  },
  {
    token: 'text-error',
    group: 'text',
    light: at('danger', 900),
    dark: at('danger', 300),
    usage: 'Error text and icons.',
    floor: AA_TEXT,
    against: [...ELEVATION, 'surface-error'],
  },

  /* borders */
  {
    token: 'border-strong',
    group: 'border',
    light: at('neutral-dark', 1100),
    dark: at('neutral-light', 100),
    usage: 'Emphasis — an active field, a selected row.',
    floor: AA_NON_TEXT,
    against: ALL_SURFACES,
  },
  {
    token: 'border-default',
    group: 'border',
    light: at('neutral-dark', 600),
    dark: at('neutral-light', 600),
    usage: 'Any border that carries meaning — control outlines, field borders.',
    floor: AA_NON_TEXT,
    against: ALL_SURFACES,
  },
  {
    token: 'border-subtle',
    group: 'border',
    light: at('neutral-dark', 300),
    dark: at('neutral-light', 900),
    usage: 'Decorative hairlines — table rules, dividers. Contrast-exempt.',
  },

  /* actions */
  ...(['primary', 'danger'] as const).flatMap((slot): Role[] => {
    const token = slot === 'primary' ? 'action-primary' : 'action-danger';
    return [
      {
        token,
        group: 'action',
        light: at(slot, 800),
        dark: at(slot, 400),
        usage:
          slot === 'primary'
            ? 'Primary interactive fills, strokes, links and focus rings.'
            : 'Destructive actions — delete, remove, revoke.',
        floor: AA_NON_TEXT,
        against: ELEVATION,
      },
      {
        token: `${token}-hover`,
        group: 'action',
        light: at(slot, 900),
        dark: at(slot, 300),
        usage: `Hover for ${token}.`,
        floor: AA_NON_TEXT,
        against: ELEVATION,
      },
      {
        token: `${token}-pressed`,
        group: 'action',
        light: at(slot, 1000),
        dark: at(slot, 200),
        usage: `Pressed for ${token}.`,
        floor: AA_NON_TEXT,
        against: ELEVATION,
      },
    ];
  }),
  {
    token: 'action-neutral',
    group: 'action',
    light: at('neutral-dark', 1000),
    dark: at('neutral-light', 200),
    usage: 'The neutral action fill. Button variant="secondary" resolves here.',
    floor: AA_NON_TEXT,
    against: ELEVATION,
  },
  {
    token: 'action-neutral-hover',
    group: 'action',
    light: at('neutral-dark', 1100),
    dark: at('neutral-light', 100),
    usage: 'Hover for action-neutral.',
    floor: AA_NON_TEXT,
    against: ELEVATION,
  },
  {
    token: 'action-neutral-pressed',
    group: 'action',
    light: boundary('black'),
    dark: boundary('white'),
    usage: 'Pressed for action-neutral.',
    floor: AA_NON_TEXT,
    against: ELEVATION,
  },
  {
    token: 'action-disabled',
    group: 'action',
    light: at('neutral-light', 400),
    dark: at('neutral-dark', 800),
    usage:
      'The disabled fill for every action variant. Contrast-exempt (inactive control).',
  },

  /* state veils: one hue, three strengths */
  ...(Object.keys(STATE_ALPHA) as (keyof typeof STATE_ALPHA)[]).map(
    (token): Role => ({
      token,
      group: 'state',
      light: veil('primary', 600, STATE_ALPHA[token]),
      dark: veil('primary', 600, STATE_ALPHA[token]),
      usage: {
        'state-hover': 'Rest → hover on rows, tabs, chips, menu items.',
        'state-pressed': 'Hover → pressed on the same elements.',
        'state-selected': 'The persistent "this one is chosen" tint.',
      }[token],
    })
  ),

  /*
   * Categorical viz. The slot order is the sandbox's categorical solve
   * (`categorical.ts`) for Skillsoft's hues, taken as fixed input: porting the
   * solver is deferred, so a tenant gets these slots and grades unsolved.
   */
  ...(
    [
      [at('primary', 800), at('primary', 500)],
      [at('accent', 700), at('accent', 500)],
      [at('warning', 700), at('warning', 400)],
      [at('accent-alt', 600), at('accent-alt', 600)],
      [at('success', 600), at('success', 300)],
      [at('danger', 600), at('danger', 600)],
      [at('neutral-dark', 1000), at('neutral-dark', 500)],
      [at('neutral-light', 600), at('neutral-light', 600)],
    ] as [RoleValue, RoleValue][]
  ).map(
    ([light, dark], i): Role => ({
      token: `viz-${i + 1}`,
      group: 'viz',
      light,
      dark,
      usage: `Categorical series ${i + 1}.`,
      floor: AA_NON_TEXT,
      against: ['surface-default'],
    })
  ),
  ...(
    [
      [600, 600],
      [700, 500],
      [800, 400],
      [900, 300],
    ] as [Grade, Grade][]
  ).map(
    ([light, dark], i): Role => ({
      token: `viz-seq-${i + 1}`,
      group: 'viz',
      light: at('primary', light),
      dark: at('primary', dark),
      usage: `Sequential step ${i + 1}, low to high.`,
      floor: AA_NON_TEXT,
      against: ['surface-default'],
    })
  ),

  /* other */
  {
    token: 'backdrop',
    group: 'other',
    light: { ref: 'black', alpha: 0.6 },
    dark: { ref: 'black', alpha: 0.6 },
    usage: 'The scrim behind modals and dialogs. Mode-independent.',
  },
];

export const roleFor = (token: string): Role | undefined =>
  ROLES.find((r) => r.token === token);
