/*
 * The migration layer: how today's Gamut color aliases and component colors
 * land on the role layer. Ported from gamut-sandbox PR #34
 * (`src/colorSystem/migration.ts` at 4b73c2a), design's source of truth, shown
 * at #/migration. The data below is verbatim apart from `Slot` → `ComponentSlot`
 * (`Slot` here means a brand slot) and comment style. Re-syncing is a
 * deliberate step, like the rest of the port.
 *
 * Every target is a role token, never a primitive or a hex. `validateMigration`
 * holds the file to that for any color system, not just Skillsoft's: each
 * alias mapped exactly once, every target a real role, and each component's
 * text and icon slots clearing their tier on the fills they sit on, in both
 * modes.
 */

import type { Color as CuloriColor } from 'culori';
import { wcagContrast } from 'culori';

import type { Mode } from './roles';
import { FALLOFF, MODES, roleFor, ROLES } from './roles';
import type { ColorSystem } from './system';
import { paletteKey } from './system';
import type { Check } from './validate';
import { composite } from './validate';

// ------------------------------------------------------------- token map

/*
 * Every semantic color alias Gamut's themes define today, in the order
 * `coreTheme` declares them.
 *
 * Listed rather than read from the theme because the validator loads this
 * file outside the browser, where `@codecademy/gamut-styles` does not import.
 * The page diffs this list against the live theme at render time, so a
 * Gamut upgrade that adds an alias shows up there as unmapped.
 */
export const LEGACY_TOKENS = [
  'text',
  'text-accent',
  'text-disabled',
  'text-secondary',
  'feedback-error',
  'feedback-success',
  'feedback-warning',
  'background',
  'background-contrast',
  'background-current',
  'background-primary',
  'background-selected',
  'background-disabled',
  'background-hover',
  'background-success',
  'background-warning',
  'background-error',
  'shadow-primary',
  'shadow-secondary',
  'primary',
  'primary-hover',
  'primary-inverse',
  'secondary',
  'secondary-hover',
  'danger',
  'danger-hover',
  'interface',
  'interface-hover',
  'border-primary',
  'border-secondary',
  'border-tertiary',
  'border-disabled',
] as const;

export type LegacyToken = (typeof LEGACY_TOKENS)[number];

/*
 * What kind of move a mapping is, because the kind decides how much work a
 * find-and-replace can do.
 *
 * - `rename`: one alias, one role. Mechanical.
 * - `merge`: several aliases collapse onto one role. Mechanical, but the
 *   visual difference between the aliases goes away.
 * - `split`: one alias becomes one of several roles depending on where it is
 *   used. Needs a person, and `rule` says how to choose.
 * - `retire`: no role replaces it; `rule` says what to do instead.
 */
export type MapKind = 'rename' | 'merge' | 'split' | 'retire';

export const MAP_KIND_LABEL: Record<MapKind, string> = {
  rename: 'Rename',
  merge: 'Merge',
  split: 'Split',
  retire: 'Retire',
};

export interface TokenMapping {
  legacy: LegacyToken;
  kind: MapKind;
  /* Role tokens, most common target first. Empty only for `retire`. */
  to: string[];
  /* How to apply it. For a split, how to choose between the targets. */
  rule: string;
  /* A decision this mapping depends on that has not been made yet. */
  open?: string;
}

export const TOKEN_GROUPS: { id: string; label: string; prefix: RegExp }[] = [
  { id: 'text', label: 'Text', prefix: /^text/ },
  { id: 'feedback', label: 'Feedback', prefix: /^feedback/ },
  { id: 'background', label: 'Background', prefix: /^background/ },
  {
    id: 'action',
    label: 'Action',
    prefix: /^(primary|secondary|danger|interface)/,
  },
  { id: 'border', label: 'Border', prefix: /^border/ },
  { id: 'shadow', label: 'Shadow', prefix: /^shadow/ },
];

export const TOKEN_MAP: TokenMapping[] = [
  // ------------------------------------------------------------------ text
  {
    legacy: 'text',
    kind: 'rename',
    to: ['text-default'],
    rule: 'Body copy and headings.',
  },
  {
    legacy: 'text-accent',
    kind: 'merge',
    to: ['text-default'],
    rule: 'Headings take `text-default` too. Emphasis comes from weight and size, not from a second ink.',
  },
  {
    legacy: 'text-secondary',
    kind: 'rename',
    to: ['text-subtle'],
    rule: 'Descriptions, metadata, helper copy. An opaque color in every theme, so it no longer depends on what sits underneath it.',
  },
  {
    legacy: 'text-disabled',
    kind: 'split',
    to: ['action-disabled', 'surface-raised', 'text-subtle'],
    rule: 'A disabled label or icon drawn straight on a surface (text button, link, menu item, form label) is `action-disabled`, the same color as a disabled fill. On a disabled fill the label is a knockout: it takes the surface the control sits on, usually `surface-raised`. The value inside a disabled input is the one place `text-subtle` stays.',
  },

  // -------------------------------------------------------------- feedback
  {
    legacy: 'feedback-error',
    kind: 'rename',
    to: ['text-error'],
    rule: 'Error text and icons, including inline validation and the border of a field in error. Destructive buttons are `action-danger`, not this.',
  },
  {
    legacy: 'feedback-success',
    kind: 'rename',
    to: ['text-success'],
    rule: 'Success text and icons. Always with an icon.',
  },
  {
    legacy: 'feedback-warning',
    kind: 'rename',
    to: ['text-warning'],
    rule: 'Warning text and icons. Dark enough to be read as text, so it can carry a message on its own rather than only an icon.',
  },

  // ------------------------------------------------------------ background
  {
    legacy: 'background',
    kind: 'split',
    to: ['surface-raised', 'surface-default'],
    rule: 'Anything that sits on the page (card, input, menu, popover, dialog) takes `surface-raised`. Where `background` fills the page itself, it is `surface-default`.',
  },
  {
    legacy: 'background-primary',
    kind: 'rename',
    to: ['surface-default'],
    rule: 'The page background, the base every other surface is placed on.',
  },
  {
    legacy: 'background-current',
    kind: 'split',
    to: ['surface-default', 'surface-raised', 'surface-sunken'],
    rule: 'Whatever surface the element sits on. Name that surface directly.',
    open: 'Keep a `surface-current` alias that `Background` sets, or have components name their surface? Masks and sticky headers are the main consumers.',
  },
  {
    legacy: 'background-contrast',
    kind: 'retire',
    to: ['surface-raised'],
    rule: 'Use `surface-raised`. Maximum contrast against the page is what raised already provides in dark mode, and light mode has no surface lighter than it.',
    open: 'Confirm nothing depends on this resolving to black in dark mode.',
  },
  {
    legacy: 'background-selected',
    kind: 'rename',
    to: ['state-selected'],
    rule: 'A veil composited over the element’s own fill, not an opaque fill that replaces it. The element keeps its surface underneath.',
  },
  {
    legacy: 'background-hover',
    kind: 'split',
    to: ['state-hover', 'surface-sunken'],
    rule: 'As a hover, it is the `state-hover` veil. Used as a resting fill (the subtle Alert, a tinted panel), it is `surface-sunken`.',
  },
  {
    legacy: 'background-disabled',
    kind: 'rename',
    to: ['action-disabled'],
    rule: 'The disabled fill for every action variant. One token, whatever was disabled.',
  },
  {
    legacy: 'background-success',
    kind: 'rename',
    to: ['surface-success'],
    rule: 'The success tint behind an alert or inline confirmation.',
  },
  {
    legacy: 'background-warning',
    kind: 'rename',
    to: ['surface-warning'],
    rule: 'The warning tint behind an alert or inline caution.',
  },
  {
    legacy: 'background-error',
    kind: 'rename',
    to: ['surface-error'],
    rule: 'The error tint behind an alert or inline validation message.',
  },

  // ---------------------------------------------------------------- shadow
  {
    legacy: 'shadow-primary',
    kind: 'retire',
    to: [],
    rule: 'Elevation is the surface step plus a `border-subtle` hairline. There is no shadow color role.',
    open: 'Percipio’s elevation scale uses this for card and menu shadows. Keep shadows (and give them a role), or drop them?',
  },
  {
    legacy: 'shadow-secondary',
    kind: 'retire',
    to: [],
    rule: 'Same as `shadow-primary`.',
    open: 'Decided together with `shadow-primary`.',
  },

  // ---------------------------------------------------------------- action
  {
    legacy: 'primary',
    kind: 'rename',
    to: ['action-primary'],
    rule: 'Primary fills, strokes, links and focus rings. Pressed is new: `action-primary-pressed`.',
  },
  {
    legacy: 'primary-hover',
    kind: 'rename',
    to: ['action-primary-hover'],
    rule: 'Hover for the primary action.',
  },
  {
    legacy: 'primary-inverse',
    kind: 'retire',
    to: ['action-primary'],
    rule: 'A primary action on an inverted ground is `action-primary` inside a dark-mode scope. The mode does the inverting.',
  },
  {
    legacy: 'secondary',
    kind: 'rename',
    to: ['action-neutral'],
    rule: 'The secondary button and secondary icon/text buttons. Labels on it are `text-inverse`.',
  },
  {
    legacy: 'secondary-hover',
    kind: 'rename',
    to: ['action-neutral-hover'],
    rule: 'Hover for the secondary action.',
  },
  {
    legacy: 'danger',
    kind: 'rename',
    to: ['action-danger'],
    rule: 'Destructive actions: delete, remove, revoke. Error messaging is `text-error`.',
  },
  {
    legacy: 'danger-hover',
    kind: 'rename',
    to: ['action-danger-hover'],
    rule: 'Hover for the destructive action.',
  },
  {
    legacy: 'interface',
    kind: 'merge',
    to: ['action-primary'],
    rule: 'Checkboxes, radios, toggles, focus rings and inline links share the one interactive blue.',
  },
  {
    legacy: 'interface-hover',
    kind: 'merge',
    to: ['action-primary-hover'],
    rule: 'Hover for the same controls.',
  },

  // ---------------------------------------------------------------- border
  {
    legacy: 'border-primary',
    kind: 'split',
    to: ['border-default', 'border-subtle'],
    rule: 'A border that carries meaning (field outline, control stroke, a container that needs an edge to be seen) is `border-default`. A border that only decorates (card hairline, table rule, the edge of a dialog over `backdrop`) is `border-subtle`.',
  },
  {
    legacy: 'border-secondary',
    kind: 'merge',
    to: ['border-default'],
    rule: 'Same as `border-primary`. One meaningful border weight.',
  },
  {
    legacy: 'border-tertiary',
    kind: 'split',
    to: ['border-subtle', 'border-strong'],
    rule: 'A divider or card hairline is `border-subtle`. Where it marks an active field or a selected row, it is `border-strong`.',
    open: 'Core resolves this to a light navy and Percipio to a dark one, so usages need checking one by one to see which they meant.',
  },
  {
    legacy: 'border-disabled',
    kind: 'merge',
    to: ['border-default'],
    rule: 'A disabled control is marked by its `action-disabled` fill. Its outline stays `border-default`.',
  },
];

/* Roles no legacy alias maps onto — the capabilities the old set lacked. */
export const NEW_ROLES = ROLES.filter(
  (role) =>
    !TOKEN_MAP.some((m) => m.to.includes(role.token)) &&
    !role.token.startsWith('viz')
);

export const mappingFor = (legacy: string): TokenMapping | undefined =>
  TOKEN_MAP.find((m) => m.legacy === legacy);

// ---------------------------------------------------------------- surfaces

/*
 * The elevation rule, in the order a reader applies it: start from the page
 * and ask what the element is placed on.
 */
export const SURFACE_RULES: { role: string; when: string; examples: string }[] =
  [
    {
      role: 'surface-default',
      when: 'The page itself.',
      examples: 'App background, the area behind the main content.',
    },
    {
      role: 'surface-raised',
      when: 'Anything placed on the page.',
      examples:
        'Cards, panels, inputs, menus, popovers, dialogs, the header bar.',
    },
    {
      role: 'surface-sunken',
      when: 'Anything recessed into the surface it sits on.',
      examples:
        'Code blocks, wells, insets, a progress track, the subtle Alert.',
    },
  ];

/*
 * What to do when a container sits inside a container. Stated separately
 * because it is the case the three-level stack does not answer on its own.
 */
export const NESTING_RULE =
  'There is no level above `surface-raised`. A panel inside a card stays `surface-raised` and takes a `border-subtle` hairline; a recessed area inside a card is `surface-sunken`. Overlays (menus, popovers, dialogs) are `surface-raised` wherever they open, and a dialog adds `backdrop` behind it.';

// -------------------------------------------------------------- components

/*
 * One colored part of a component.
 *
 * `kind` is what lets the validator check the mapping rather than just store
 * it: text and icon slots are measured against the variant's fill.
 */
export interface ComponentSlot {
  slot: string;
  kind: 'fill' | 'text' | 'icon' | 'border' | 'veil';
  /* Today's value as it appears in Gamut's source: an alias, a palette key, or a note. */
  legacy: string;
  /* The role it maps to, or `inherit` for a slot that takes its parent's color. */
  role: string;
  note?: string;
  /*
   * The label is cut out of a disabled fill and shows the surface behind it.
   * `role` names the usual surface; on another surface it takes that one.
   */
  knockout?: boolean;
}

/* A slot target that is deliberately not a role. */
export const INHERIT = 'inherit';

export interface ComponentVariant {
  name: string;
  /* Today's variant name, when it differs from `name`. */
  legacyName?: string;
  slots: ComponentSlot[];
  /*
   * The surface a variant without a fill of its own is measured on: a text
   * button, a link, a field label. `surface-raised` is the binding case for
   * most marks, since it is where controls usually sit.
   */
  on?: string;
}

export type MappingStatus = 'mapped' | 'open';

export interface ComponentMapping {
  id: string;
  name: string;
  summary: string;
  variants: ComponentVariant[];
  /* Slots shared by every variant (borders, buttons inside the component). */
  shared?: ComponentSlot[];
  open?: string[];
}

/* A slot, positionally — the component tables below are long enough that
 * the object form buried the four values that matter. */
const s = (
  slot: string,
  kind: ComponentSlot['kind'],
  legacy: string,
  role: string,
  extra?: { note?: string; knockout?: boolean }
): ComponentSlot => ({ slot, kind, legacy, role, ...extra });

/* A knocked-out disabled label: the surface shows through the fill. */
const knockout = (legacy: string): ComponentSlot =>
  s('Disabled label', 'text', legacy, 'surface-raised', {
    knockout: true,
    note: 'Knockout: the surface the control sits on shows through.',
  });

const cap = (word: string): string => word[0].toUpperCase() + word.slice(1);

/*
 * The Alert pattern, shared by its status variants: the tint carries the
 * surface, the status ink carries the icon, and the message stays
 * `text-default`. The status inks clear text contrast on their own tint, but
 * body copy is easier to read in the default ink, and the icon is what
 * signals the status.
 */
const statusAlert = (
  name: string,
  status: 'success' | 'warning' | 'error',
  legacyBg: string,
  legacyName?: string
): ComponentVariant => ({
  name,
  legacyName,
  slots: [
    { slot: 'Fill', kind: 'fill', legacy: legacyBg, role: `surface-${status}` },
    {
      slot: 'Icon',
      kind: 'icon',
      legacy: 'auto (Background)',
      role: `text-${status}`,
    },
    {
      slot: 'Message',
      kind: 'text',
      legacy: 'auto (Background)',
      role: 'text-default',
    },
  ],
});

export const COMPONENTS: ComponentMapping[] = [
  {
    id: 'alert',
    name: 'Alert',
    summary:
      'Status variants move from saturated fills with auto-contrast text to the status tints: `surface-*` behind, `text-*` on the icon, `text-default` for the message. The buttons inside follow the secondary button.',
    variants: [
      statusAlert('Error', 'error', 'red-600'),
      statusAlert('Success', 'success', 'green'),
      statusAlert('Warning', 'warning', 'orange', 'notice'),
      {
        name: 'Info',
        legacyName: 'general',
        slots: [
          {
            slot: 'Fill',
            kind: 'fill',
            legacy: 'blue',
            role: 'surface-sunken',
          },
          {
            slot: 'Icon',
            kind: 'icon',
            legacy: 'auto (Background)',
            role: 'action-primary',
          },
          {
            slot: 'Message',
            kind: 'text',
            legacy: 'auto (Background)',
            role: 'text-default',
          },
        ],
      },
      {
        name: 'Feature',
        slots: [
          {
            slot: 'Fill',
            kind: 'fill',
            legacy: 'blue-300',
            role: 'surface-brand',
          },
          {
            slot: 'Icon',
            kind: 'icon',
            legacy: 'auto (Background)',
            role: 'action-primary',
          },
          {
            slot: 'Message',
            kind: 'text',
            legacy: 'auto (Background)',
            role: 'text-default',
          },
        ],
      },
      {
        name: 'Subtle',
        slots: [
          {
            slot: 'Fill',
            kind: 'fill',
            legacy: 'background-hover',
            role: 'surface-sunken',
          },
          {
            slot: 'Icon',
            kind: 'icon',
            legacy: 'auto (Background)',
            role: 'text-subtle',
          },
          {
            slot: 'Message',
            kind: 'text',
            legacy: 'auto (Background)',
            role: 'text-default',
          },
        ],
      },
    ],
    shared: [
      {
        slot: 'Floating border',
        kind: 'border',
        legacy: 'navy',
        role: 'border-default',
        note: 'Inline placement keeps no border.',
      },
      {
        slot: 'CTA button',
        kind: 'fill',
        legacy: 'FillButton secondary, auto mode',
        role: 'action-neutral',
        note: 'Label is `text-inverse`.',
      },
      {
        slot: 'Close / expand',
        kind: 'icon',
        legacy: 'IconButton / TextButton secondary',
        role: 'action-neutral',
        note: 'Hover and press are `state-hover` / `state-pressed`.',
      },
    ],
    open: [
      'Info has no status tint of its own. Proposed: `surface-sunken` with an `action-primary` icon, which makes it look like Subtle except for the icon. Alternatively, add a `surface-info` role.',
      'Feature on `surface-brand` puts the two-color gradient behind running text. It clears text contrast at the gradient’s worst point, but check it at banner width.',
    ],
  },

  // ---------------------------------------------------------------- buttons
  {
    id: 'fill-button',
    name: 'FillButton',
    summary:
      'Each variant maps onto its action family, which now has a pressed step of its own. Labels are `text-inverse` on every fill, so a label never depends on the color mode a parent forces. Danger keeps its focus ring in its own color; disabled labels are a knockout.',
    variants: (['primary', 'neutral', 'danger'] as const).map((family) => {
      const legacy = family === 'neutral' ? 'secondary' : family;
      return {
        name: family === 'neutral' ? 'Secondary' : cap(family),
        slots: [
          s('Fill', 'fill', legacy, `action-${family}`),
          s('Hover fill', 'fill', `${legacy}-hover`, `action-${family}-hover`),
          s(
            'Pressed fill',
            'fill',
            `${legacy} + border-primary`,
            `action-${family}-pressed`
          ),
          s('Label', 'text', 'background', 'text-inverse'),
          s(
            'Focus ring',
            'border',
            legacy,
            family === 'danger' ? 'action-danger' : 'action-primary'
          ),
        ],
      };
    }),
    shared: [
      s('Disabled fill', 'fill', 'background-disabled', 'action-disabled'),
      knockout('text-disabled'),
      s('Interface variant', 'fill', 'interface', 'action-primary', {
        note: 'Merges into primary.',
      }),
    ],
    open: [
      'Secondary’s focus ring is `action-primary`, while danger’s matches its fill. Today the ring follows the variant for both. Keep blue for secondary, or use `action-neutral`?',
    ],
  },
  {
    id: 'stroke-button',
    name: 'StrokeButton',
    summary:
      'Stroke and label take the action color; hover and press become veils over the surface instead of a gray fill and a full inversion.',
    variants: (['primary', 'neutral', 'danger'] as const).map((family) => {
      const legacy = family === 'neutral' ? 'secondary' : family;
      return {
        name: family === 'neutral' ? 'Secondary' : cap(family),
        on: 'surface-raised',
        slots: [
          s('Stroke', 'border', legacy, `action-${family}`),
          s('Label', 'text', legacy, `action-${family}`),
          s('Hover', 'veil', 'background-hover', 'state-hover'),
          s(
            'Pressed',
            'veil',
            `${legacy} fill, background label`,
            'state-pressed'
          ),
          s(
            'Focus ring',
            'border',
            legacy,
            family === 'danger' ? 'action-danger' : 'action-primary'
          ),
        ],
      };
    }),
    shared: [
      s('Disabled stroke', 'border', 'background-disabled', 'action-disabled'),
      s('Disabled label', 'text', 'text-disabled', 'action-disabled'),
    ],
    open: [
      'Pressed is an inversion today (the stroke color fills the button). Proposed: the `state-pressed` veil, the same as every other unfilled control.',
    ],
  },
  {
    id: 'text-button',
    name: 'TextButton / IconButton',
    summary:
      'Label or icon in the action color, `state-hover` / `state-pressed` behind it. IconButton keeps secondary as its default, which is now `action-neutral`.',
    variants: [
      {
        name: 'Primary',
        on: 'surface-raised',
        slots: [
          s('Label / icon', 'text', 'primary', 'action-primary'),
          s('Focus ring', 'border', 'primary', 'action-primary'),
        ],
      },
      {
        name: 'Secondary',
        on: 'surface-raised',
        slots: [
          s('Label / icon', 'text', 'secondary', 'action-neutral'),
          s('Focus ring', 'border', 'secondary', 'action-primary'),
        ],
      },
      {
        name: 'Danger',
        on: 'surface-raised',
        slots: [
          s('Label / icon', 'text', 'danger', 'action-danger'),
          s('Focus ring', 'border', 'danger', 'action-danger'),
        ],
      },
      {
        name: 'Interface',
        on: 'surface-raised',
        slots: [
          s('Label / icon', 'text', 'text', 'text-default'),
          s('Focus ring', 'border', 'primary', 'action-primary'),
        ],
      },
    ],
    shared: [
      s('Hover', 'veil', 'background-hover', 'state-hover'),
      s('Pressed', 'veil', 'text (label color)', 'state-pressed'),
      s('Disabled label', 'text', 'text-disabled', 'action-disabled'),
    ],
  },
  {
    id: 'cta-button',
    name: 'CTAButton',
    summary: 'Fills follow primary FillButton. The offset shadow has no role.',
    variants: [
      {
        name: 'Primary',
        slots: [
          s('Fill', 'fill', 'primary', 'action-primary'),
          s('Hover fill', 'fill', 'primary-hover', 'action-primary-hover'),
          s('Pressed fill', 'fill', 'secondary', 'action-primary-pressed'),
          s('Label', 'text', 'background', 'text-inverse'),
        ],
      },
    ],
    shared: [
      s('Focus ring', 'border', 'primary', 'action-primary'),
      s('Disabled fill', 'fill', 'background-disabled', 'action-disabled'),
      knockout('text-disabled'),
      s('Offset shadow', 'border', 'text (as box-shadow)', 'action-neutral', {
        note: 'Only if the shadow is kept.',
      }),
    ],
    open: [
      'The offset shadow is a Codecademy brand treatment. Keep it on `action-neutral`, or drop it for Skillsoft themes?',
    ],
  },
  {
    id: 'anchor',
    name: 'Anchor',
    summary:
      'Links are `action-primary` and keep their underline: color alone never separates a link from body text.',
    variants: [
      {
        name: 'Inline / standard',
        on: 'surface-default',
        slots: [
          s('Text', 'text', 'primary', 'action-primary'),
          s('Hover text', 'text', 'primary', 'action-primary-hover'),
        ],
      },
      {
        name: 'Interface',
        on: 'surface-raised',
        slots: [
          s('Text', 'text', 'text', 'text-default'),
          s('Hover text', 'text', 'primary', 'action-primary'),
        ],
      },
      {
        name: 'Standard secondary',
        on: 'surface-default',
        slots: [s('Text', 'text', 'text', 'text-default')],
      },
    ],
    shared: [
      s('Focus ring', 'border', 'primary / currentColor', 'action-primary'),
      s('Disabled', 'text', 'text-disabled', 'action-disabled'),
    ],
  },

  // --------------------------------------------------------- badges & tags
  {
    id: 'badge',
    name: 'Badge',
    summary:
      'Today’s filled badges use text colors as fills. Proposed: the dark badge takes the neutral action pair, the rest move to surfaces.',
    variants: [
      {
        name: 'Primary',
        slots: [
          s('Fill', 'fill', 'text', 'action-neutral'),
          s('Label', 'text', 'background', 'text-inverse'),
        ],
      },
      {
        name: 'Secondary',
        slots: [
          s('Fill', 'fill', 'text-secondary', 'surface-sunken'),
          s('Label', 'text', 'background', 'text-default'),
        ],
      },
      {
        name: 'Tertiary',
        on: 'surface-raised',
        slots: [
          s('Label', 'text', 'text-secondary', 'text-subtle'),
          s('Border', 'border', 'border-secondary', 'border-default'),
        ],
      },
      {
        name: 'Tertiary fill',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Label', 'text', 'text-secondary', 'text-subtle'),
          s('Border', 'border', 'border-secondary', 'border-default'),
        ],
      },
      {
        name: 'Accent',
        slots: [
          s('Fill', 'fill', 'yellow', 'action-primary'),
          s('Label', 'text', 'navy', 'text-inverse'),
        ],
      },
    ],
    open: [
      'Badges are not interactive, so `action-neutral` as a fill borrows an action role. The alternative is a `surface-inverse` role, which would also serve Tooltip if it ever goes dark.',
      'Accent has no role. Proposed: `action-primary` (a blue badge). The alternative, `surface-warning`, would read as a caution.',
      'Secondary moves from a dark gray fill to a light one, so it looks very different.',
    ],
  },
  {
    id: 'tag',
    name: 'Tag',
    summary:
      'Tags sit on surfaces and take veils for their states. A picked selection tag is `state-selected`, not a dark fill.',
    variants: [
      {
        name: 'Read only',
        slots: [
          s('Fill', 'fill', 'background-disabled', 'surface-sunken'),
          s('Label', 'text', 'text', 'text-default'),
        ],
      },
      {
        name: 'Selection',
        slots: [
          s('Fill', 'fill', 'text-secondary', 'surface-raised'),
          s('Selected', 'veil', 'text-secondary', 'state-selected'),
          s('Label', 'text', 'background', 'text-default'),
          s('Border', 'border', 'none', 'border-default'),
          s('Dismiss icon', 'icon', 'background', 'action-neutral'),
          s('Dismiss hover', 'veil', 'secondary-hover', 'state-hover'),
        ],
      },
      {
        name: 'Navigation',
        slots: [
          s('Fill', 'fill', 'background-current', 'surface-raised'),
          s('Label', 'text', 'text', 'text-default'),
          s('Border', 'border', 'border-secondary', 'border-default'),
          s('Hover', 'veil', 'background-hover', 'state-hover'),
          s(
            'Pressed',
            'veil',
            'secondary fill, background label',
            'state-pressed'
          ),
        ],
      },
      {
        name: 'Suggestion',
        slots: [
          s('Fill', 'fill', 'background-current', 'surface-raised'),
          s('Label', 'text', 'text', 'text-default'),
          s('Border', 'border', 'primary', 'action-primary'),
          s('Hover', 'veil', 'background-hover', 'state-hover'),
          s(
            'Pressed',
            'veil',
            'primary fill, background label',
            'state-pressed'
          ),
        ],
      },
    ],
    shared: [
      s('Focus ring', 'border', 'primary', 'action-primary'),
      s('Disabled fill', 'fill', 'background-disabled', 'action-disabled'),
      knockout('text-disabled'),
      s('Disabled border', 'border', 'border-disabled', 'border-default'),
    ],
    open: [
      'Selection tags change from a dark chip to a light one with a selected tint. Confirm that still reads as “picked” next to unpicked suggestion tags.',
    ],
  },

  // ------------------------------------------------------------------ forms
  {
    id: 'field',
    name: 'Input / TextArea / Select',
    summary:
      'Fields are `surface-raised` with a `border-default` outline. Hover strengthens the outline, focus turns it `action-primary`, and error is `text-error`.',
    variants: [
      {
        name: 'Rest',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Value', 'text', 'text', 'text-default'),
          s('Placeholder', 'text', 'browser default', 'text-subtle'),
          s('Border', 'border', 'border-primary', 'border-default'),
          s('Chevron', 'icon', 'text', 'text-subtle'),
        ],
      },
      {
        name: 'Hover',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Border', 'border', 'primary', 'border-strong'),
        ],
      },
      {
        name: 'Focus',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Border + ring', 'border', 'primary', 'action-primary'),
        ],
      },
      {
        name: 'Error',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Border + ring', 'border', 'feedback-error', 'text-error'),
          s('Status icon', 'icon', 'feedback-error', 'text-error'),
        ],
      },
      {
        name: 'Valid',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Status icon', 'icon', 'feedback-success', 'text-success'),
        ],
      },
      {
        name: 'Disabled',
        slots: [
          s('Fill', 'fill', 'background-disabled', 'action-disabled'),
          s('Value', 'text', 'text-disabled', 'text-subtle'),
          s(
            'Border',
            'border',
            'currentColor (text-disabled)',
            'border-default'
          ),
        ],
      },
    ],
    open: [
      'Hover today turns the border blue, which reads as focus. Proposed: `border-strong` on hover so blue only ever means focus.',
    ],
  },
  {
    id: 'select-dropdown',
    name: 'SelectDropdown',
    summary:
      'The control follows the field. The menu is a raised surface, and options take state veils instead of opaque fills.',
    variants: [
      {
        name: 'Menu',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Border', 'border', 'currentColor (text)', 'border-default'),
          s('Option', 'text', 'text', 'text-default'),
          s('Option subtitle', 'text', 'text-disabled', 'text-subtle'),
          s('Group heading', 'text', 'text-disabled', 'text-subtle'),
          s('Group divider', 'border', 'text-disabled', 'border-subtle'),
          s('No options', 'text', 'text-secondary', 'text-subtle'),
          s('Create option', 'text', 'primary', 'action-primary'),
        ],
      },
      {
        name: 'Option states',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Focused', 'veil', 'background-hover', 'state-hover'),
          s('Selected', 'veil', 'background-selected', 'state-selected'),
          s('Disabled', 'text', 'text-disabled', 'action-disabled'),
        ],
      },
    ],
    shared: [
      s('Error top border', 'border', 'feedback-error', 'text-error'),
      s('Multi-value chip', 'fill', 'text-secondary', 'surface-sunken', {
        note: 'Follows the selection Tag.',
      }),
    ],
  },
  {
    id: 'checkbox',
    name: 'Checkbox / Radio',
    summary:
      'Unchecked boxes and rings are `border-default`; checked takes `action-primary`. A checked radio renders in the text color today because of a style override, and becomes blue.',
    variants: [
      {
        name: 'Checkbox checked',
        slots: [
          s('Box fill', 'fill', 'primary', 'action-primary'),
          s('Check mark', 'icon', 'background', 'text-inverse'),
        ],
      },
      {
        name: 'Unchecked',
        on: 'surface-raised',
        slots: [
          s(
            'Box / ring',
            'border',
            'border-primary / currentColor',
            'border-default'
          ),
          s('Label', 'text', 'text', 'text-default'),
        ],
      },
      {
        name: 'Radio checked',
        on: 'surface-raised',
        slots: [
          s('Dot', 'icon', 'currentColor (text)', 'action-primary'),
          s('Ring', 'border', 'currentColor (text)', 'action-primary'),
        ],
      },
      {
        name: 'Error',
        on: 'surface-raised',
        slots: [s('Ring / dot', 'icon', 'feedback-error', 'text-error')],
      },
    ],
    shared: [
      s('Hover / focus ring', 'border', 'primary', 'action-primary'),
      s('Disabled fill', 'fill', 'text-disabled', 'action-disabled'),
      s('Disabled check', 'icon', 'background', 'surface-raised', {
        knockout: true,
        note: 'Knockout, like a disabled button label.',
      }),
      s('Disabled label', 'text', 'text-disabled', 'action-disabled'),
    ],
  },
  {
    id: 'toggle',
    name: 'Toggle',
    summary:
      'The checked track is `action-primary`. The unchecked track has to be visible at 3:1 against its surface, which no surface or disabled role is.',
    variants: [
      {
        name: 'On',
        slots: [
          s('Track', 'fill', 'primary', 'action-primary'),
          s('Knob', 'icon', 'white', 'surface-raised'),
        ],
      },
      {
        name: 'Off',
        slots: [
          s('Track', 'fill', 'text-disabled', 'border-default'),
          s('Knob', 'icon', 'white', 'surface-raised'),
        ],
      },
    ],
    shared: [
      s('Focus ring', 'border', 'primary', 'action-primary'),
      s('Disabled', 'fill', 'opacity 0.5', 'action-disabled'),
    ],
    open: [
      'The off track borrows `border-default` as a fill, since it is the role guaranteed at 3:1 on every surface. Accept the borrow, or add a `control-track` role?',
    ],
  },
  {
    id: 'form-group',
    name: 'FormGroup',
    summary:
      'Description text drops to `text-subtle`; the error message is `text-error` and keeps its icon.',
    variants: [
      {
        name: 'Labels and messages',
        on: 'surface-raised',
        slots: [
          s('Label', 'text', 'text', 'text-default'),
          s('Description', 'text', 'text', 'text-subtle'),
          s('Error', 'text', 'feedback-error', 'text-error'),
          s('Disabled label', 'text', 'text-disabled', 'action-disabled'),
        ],
      },
    ],
  },

  // ------------------------------------------------------------- containers
  {
    id: 'card',
    name: 'Card',
    summary:
      'The default card is `surface-raised` with a `border-subtle` hairline. The palette variants and their auto-contrast go away; a dark card is a dark-mode scope.',
    variants: [
      {
        name: 'Default',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Text', 'text', 'text', 'text-default'),
          s('Border', 'border', 'border-primary', 'border-subtle'),
        ],
      },
      {
        name: 'White',
        slots: [
          s('Fill', 'fill', 'white', 'surface-raised'),
          s('Text', 'text', 'auto (Background)', 'text-default'),
        ],
      },
      {
        name: 'Beige',
        slots: [
          s('Fill', 'fill', 'beige', 'surface-default'),
          s('Text', 'text', 'auto (Background)', 'text-default'),
        ],
      },
      {
        name: 'Navy',
        slots: [
          s('Fill', 'fill', 'navy', 'surface-raised', {
            note: 'Inside a dark-mode scope.',
          }),
          s('Text', 'text', 'auto (Background)', 'text-default'),
        ],
      },
      {
        name: 'Interactive',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Hover', 'veil', 'shadow-primary (offset shadow)', 'state-hover'),
          s('Hover border', 'border', 'border-primary', 'border-strong'),
        ],
      },
    ],
    open: [
      'Yellow and hyper cards have no role. Proposed: retire them, or use `surface-brand` / `surface-brand-subtle` where they marked a featured card.',
      'Interactive cards lift with an offset shadow today. Proposed: a `state-hover` veil plus `border-strong`. Depends on the shadow decision in the token map.',
    ],
  },
  {
    id: 'disclosure',
    name: 'Disclosure',
    summary:
      'Variants map onto the surface stack; the header gets state veils, and focus is a ring rather than a fill.',
    variants: [
      {
        name: 'Default',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Header text', 'text', 'text', 'text-default'),
          s('Overline', 'text', 'text-secondary', 'text-subtle'),
        ],
      },
      {
        name: 'Subtle',
        slots: [
          s('Fill', 'fill', 'background-selected', 'surface-sunken'),
          s('Header text', 'text', 'text', 'text-default'),
        ],
      },
      {
        name: 'Transparent',
        on: 'surface-default',
        slots: [
          s('Fill', 'fill', 'background-current', INHERIT),
          s('Header text', 'text', 'text', 'text-default'),
        ],
      },
    ],
    shared: [
      s('Border', 'border', 'border-primary', 'border-default'),
      s('Header hover', 'veil', 'background-hover', 'state-hover'),
      s(
        'Header focus',
        'border',
        'background-selected + primary ring',
        'action-primary'
      ),
      s('Panel fill', 'fill', 'background-selected', 'surface-sunken'),
      s('Disabled header', 'fill', 'background-disabled', 'action-disabled'),
      knockout('text-disabled'),
    ],
  },
  {
    id: 'list',
    name: 'List / DataTable / DataList',
    summary:
      'Rows sit on `surface-raised` with `border-subtle` rules. Hover and selection are veils, and selected rows get a tint they lack today.',
    variants: [
      {
        name: 'Row',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Text', 'text', 'text', 'text-default'),
          s('Row rule', 'border', 'border-primary', 'border-subtle'),
          s('Hover', 'veil', 'background-hover', 'state-hover'),
          s('Selected', 'veil', 'none (checkbox only)', 'state-selected'),
          s(
            'Focus',
            'border',
            'primary + background-selected',
            'action-primary'
          ),
        ],
      },
      {
        name: 'Header',
        slots: [
          s('Fill', 'fill', 'background-current', 'surface-raised'),
          s('Text', 'text', 'text', 'text-default'),
          s('Rule', 'border', 'border-primary (2px)', 'border-default'),
          s('Sort icon', 'icon', 'text-disabled', 'text-subtle'),
          s('Sort icon active', 'icon', 'text-accent', 'text-default'),
          s('Filter set', 'icon', 'primary', 'action-primary'),
        ],
      },
      {
        name: 'Table stripe',
        slots: [
          s('Fill', 'fill', 'background-selected', 'surface-sunken'),
          s('Text', 'text', 'text', 'text-default'),
        ],
      },
    ],
    shared: [
      s(
        'Scroll shadow',
        'border',
        'background-selected → border-tertiary',
        'border-subtle'
      ),
      s('Expand chevron', 'icon', 'secondary', 'action-neutral'),
    ],
    open: [
      'Striping uses the selection color today, so a striped row and a selected row look alike. Proposed: stripe with `surface-sunken` and keep `state-selected` for selection.',
    ],
  },

  // --------------------------------------------------------------- overlays
  {
    id: 'modal',
    name: 'Modal / Dialog',
    summary:
      'The scrim becomes `backdrop`; the panel is `surface-raised` with a hairline. Buttons follow their own mappings.',
    variants: [
      {
        name: 'Panel',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Title / body', 'text', 'text', 'text-default'),
          s('Border', 'border', 'border-primary', 'border-subtle'),
          s('Close icon', 'icon', 'secondary', 'action-neutral'),
        ],
      },
    ],
    shared: [
      s('Scrim', 'veil', 'navy-600', 'backdrop'),
      s('Focus ring', 'border', 'primary', 'action-primary'),
      s('Pattern', 'icon', 'currentColor (text)', 'border-subtle', {
        note: 'If the checker pattern is kept.',
      }),
    ],
  },
  {
    id: 'flyout',
    name: 'Flyout / Drawer',
    summary: 'Same as Modal: `backdrop` behind, `surface-raised` panel.',
    variants: [
      {
        name: 'Panel',
        slots: [
          s(
            'Fill',
            'fill',
            'background (auto) / background-current',
            'surface-raised'
          ),
          s('Text', 'text', 'auto (Background)', 'text-default'),
          s('Close icon', 'icon', 'secondary', 'action-neutral'),
        ],
      },
    ],
    shared: [
      s('Scrim', 'veil', 'navy-600', 'backdrop'),
      s('Focus ring', 'border', 'primary', 'action-primary'),
    ],
  },
  {
    id: 'toast',
    name: 'Toast',
    summary:
      'A raised panel with a meaningful border, since it floats over unknown content.',
    variants: [
      {
        name: 'Panel',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Text', 'text', 'text', 'text-default'),
          s('Border', 'border', 'border-primary', 'border-default'),
          s('Close icon', 'icon', 'secondary', 'action-neutral'),
        ],
      },
    ],
    shared: [
      s('Offset pattern', 'icon', 'currentColor (text)', 'border-subtle', {
        note: 'If the checker pattern is kept.',
      }),
    ],
  },
  {
    id: 'tooltip',
    name: 'ToolTip / InfoTip / Popover',
    summary:
      'Every floating surface is `surface-raised` with a `border-default` edge, beak included. `background-contrast` goes away.',
    variants: [
      {
        name: 'Tip body',
        legacyName: 'ToolTip, InfoTip, Popover secondary',
        slots: [
          s('Fill', 'fill', 'background-contrast', 'surface-raised'),
          s('Text', 'text', 'text', 'text-default'),
          s('Border + beak', 'border', 'border-primary', 'border-default'),
        ],
      },
      {
        name: 'Popover',
        legacyName: 'Popover primary, Coachmark',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Text', 'text', 'text', 'text-default'),
          s('Border + beak', 'border', 'border-primary', 'border-default'),
        ],
      },
      {
        name: 'InfoTip button',
        on: 'surface-raised',
        slots: [
          s('Icon', 'icon', 'secondary', 'action-neutral'),
          s('Hover', 'veil', 'background-hover', 'state-hover'),
          s('Open', 'veil', 'background-selected', 'state-selected'),
          s('Disabled', 'icon', 'text-disabled', 'action-disabled'),
        ],
      },
    ],
    shared: [s('Target focus ring', 'border', 'primary', 'action-primary')],
  },
  {
    id: 'menu',
    name: 'Menu',
    summary:
      'Items hover with a veil instead of turning blue; the active nav item is `state-selected` with an `action-primary` bar.',
    variants: [
      {
        name: 'List',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Item', 'text', 'text', 'text-default'),
          s('Border', 'border', 'border-primary', 'border-default'),
          s('Separator', 'border', 'text-disabled', 'border-subtle'),
          s('Disabled item', 'text', 'text-disabled', 'action-disabled'),
        ],
      },
      {
        name: 'Item states',
        slots: [
          s('Fill', 'fill', 'background', 'surface-raised'),
          s('Hover', 'veil', 'primary (text color)', 'state-hover'),
          s('Active (fixed)', 'veil', 'background-selected', 'state-selected'),
          s('Active bar', 'border', 'secondary', 'action-primary'),
          s('Focus ring', 'border', 'primary', 'action-primary'),
        ],
      },
    ],
    open: [
      'Hover changes from blue text to a tint. Blue text on hover reads like a link, but this is a visible change to every menu.',
    ],
  },
  {
    id: 'tabs',
    name: 'Tabs',
    summary:
      'Standard tabs: unselected labels `text-subtle`, selected `text-default` with an `action-primary` indicator, hover a veil.',
    variants: [
      {
        name: 'Standard',
        on: 'surface-default',
        slots: [
          s('Label', 'text', 'text', 'text-subtle'),
          s('Selected label', 'text', 'text (bold)', 'text-default'),
          s('Indicator', 'border', 'primary', 'action-primary'),
          s('Baseline', 'border', 'text / border-primary', 'border-subtle'),
          s('Hover', 'veil', 'background-selected', 'state-hover'),
        ],
      },
      {
        name: 'Block',
        slots: [
          s(
            'Container',
            'fill',
            'background-contrast in navy-800 (dark)',
            'surface-sunken'
          ),
          s('Selected tab', 'fill', 'background', 'surface-raised'),
          s('Label', 'text', 'auto (Background)', 'text-default'),
        ],
      },
    ],
    shared: [s('Focus ring', 'border', 'primary', 'action-primary')],
    open: [
      'Block tabs force dark mode today through a navy `Background`. Proposed: a sunken track with a raised selected tab, in the page’s own mode.',
    ],
  },
  {
    id: 'pagination',
    name: 'Pagination',
    summary:
      'Selected page is `state-selected` plus `border-strong`; hover is a veil.',
    variants: [
      {
        name: 'Page buttons',
        on: 'surface-default',
        slots: [
          s('Label', 'text', 'text', 'text-default'),
          s('Hover (stroke)', 'text', 'primary', 'action-primary'),
          s('Hover (text)', 'veil', 'background-selected', 'state-hover'),
          s('Selected', 'veil', 'background-selected', 'state-selected'),
          s(
            'Selected border',
            'border',
            'currentColor (text)',
            'border-strong'
          ),
          s('Focus ring', 'border', 'border-primary', 'action-primary'),
          s('Disabled', 'text', 'text-disabled', 'action-disabled'),
        ],
      },
    ],
  },
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    summary:
      'Links follow the interface Anchor; the separator is `text-subtle`.',
    variants: [
      {
        name: 'Trail',
        on: 'surface-default',
        slots: [
          s('Link', 'text', 'text', 'text-default'),
          s('Link hover', 'text', 'primary', 'action-primary'),
          s('Current', 'text', 'inherit', 'text-default'),
          s('Separator', 'text', 'inherit', 'text-subtle'),
        ],
      },
    ],
  },

  // --------------------------------------------------------------- progress
  {
    id: 'progress',
    name: 'ProgressBar / Loading',
    summary:
      'The default bar is `action-primary` on a sunken track. The palette variants and the navy edge go away.',
    variants: [
      {
        name: 'Bar',
        slots: [
          s('Bar', 'fill', 'text', 'action-primary'),
          s('Bar label', 'text', 'background', 'text-inverse'),
        ],
      },
      {
        name: 'Track',
        slots: [
          s('Track', 'fill', 'none (currentColor border)', 'surface-sunken'),
          s('Track border', 'border', 'currentColor', 'border-default'),
        ],
      },
      {
        name: 'Shimmer',
        slots: [
          s('Base', 'fill', 'background-disabled @ 0.5', 'surface-sunken'),
          s('Sweep', 'veil', 'rgba black/white @ 0.2', 'surface-raised'),
        ],
      },
    ],
    shared: [
      s('Bar edge', 'border', 'navy', INHERIT, { note: 'Dropped.' }),
      s('Spinner', 'icon', 'currentColor', INHERIT),
    ],
    open: [
      'The blue and yellow ProgressBar variants have no role. Retire them, or map blue onto the default?',
      'The bar label sits on both the bar and the track as the bar grows; `text-inverse` only clears on the bar side.',
    ],
  },
];

export const statusFor = (c: ComponentMapping): MappingStatus =>
  c.open && c.open.length > 0 ? 'open' : 'mapped';

// ----------------------------------------------------------- measurement

const PEAK_ALPHA = FALLOFF[0][1];

/*
 * The color a role puts on screen in a mode, for contrast purposes. Veils and
 * the backdrop have no color of their own and aren't measured. A gradient is
 * measured at the sandbox's conservative bound: every circle at peak alpha,
 * stacked bottom-to-top over the flat base (circles are authored top-first).
 */
export const roleColor = (
  system: ColorSystem,
  token: string,
  mode: Mode
): CuloriColor | undefined => {
  const role = roleFor(token);
  if (!role || role.group === 'state' || role.token === 'backdrop') {
    return undefined;
  }
  const flat = system.roles[mode][token];
  const base: CuloriColor = { mode: 'oklch', l: flat.l, c: flat.c, h: flat.h };
  if (!role.gradient) return base;
  return [...role.gradient[mode].circles]
    .reverse()
    .reduce<CuloriColor>(
      (acc, circle) =>
        composite(system.palette[paletteKey(circle.ref)], PEAK_ALPHA, acc),
      base
    );
};

export interface SlotCheck {
  component: string;
  variant: string;
  slot: string;
  fg: string;
  bg: string;
  mode: Mode;
  ratio: number;
  floor: number;
}

/*
 * Every text and icon slot measured against every fill in its variant (rest,
 * hover and pressed are all fills a label has to read on), or against the
 * variant's `on` surface when it has no fill, in both modes. Text is held to
 * 4.5:1 and icons to 3:1. Shared slots aren't measured: they sit on whichever
 * fill the variant has, and the role layer already pairs them.
 */
export const componentChecks = (
  system: ColorSystem,
  c: ComponentMapping
): SlotCheck[] => {
  const out: SlotCheck[] = [];
  for (const variant of c.variants) {
    const grounds = variant.slots
      .filter((s) => s.kind === 'fill' && s.role !== INHERIT)
      .map((s) => s.role);
    if (grounds.length === 0 && variant.on) grounds.push(variant.on);
    for (const slot of variant.slots) {
      if (slot.kind !== 'text' && slot.kind !== 'icon') continue;
      for (const ground of grounds) {
        for (const mode of MODES) {
          const fg = roleColor(system, slot.role, mode);
          const bg = roleColor(system, ground, mode);
          if (!fg || !bg) continue;
          out.push({
            component: c.id,
            variant: variant.name,
            slot: slot.slot,
            fg: slot.role,
            bg: ground,
            mode,
            ratio: wcagContrast(fg, bg),
            floor: slot.kind === 'text' ? 4.5 : 3,
          });
        }
      }
    }
  }
  return out;
};

/*
 * Exempt from a contrast floor: anything on a disabled fill, and a disabled
 * label drawn in the disabled color, which WCAG exempts as an inactive control.
 */
export const isExempt = (check: SlotCheck): boolean =>
  check.bg === 'action-disabled' || check.fg === 'action-disabled';

/* The sandbox's `validate:colors` migration checks, for any color system. */
export const validateMigration = (system: ColorSystem): Check[] => {
  const legacy: string[] = [...LEGACY_TOKENS];
  const mapped = TOKEN_MAP.map((m) => m.legacy as string);
  const missing = legacy.filter((t) => !mapped.includes(t));
  const twice = mapped.filter((t, i) => mapped.indexOf(t) !== i);

  const badTargets = TOKEN_MAP.flatMap((m) => [
    ...m.to.filter((t) => !roleFor(t)).map((t) => `${m.legacy} → ${t}`),
    ...(m.kind !== 'retire' && m.to.length === 0
      ? [`${m.legacy} has no target`]
      : []),
    ...(m.kind === 'split' && m.to.length < 2
      ? [`${m.legacy} is a split with one target`]
      : []),
  ]);

  const badSlots = COMPONENTS.flatMap((c) =>
    [...c.variants, { name: 'shared', slots: c.shared ?? [] }].flatMap((v) =>
      v.slots
        .filter((slot) => slot.role !== INHERIT && !roleFor(slot.role))
        .map((slot) => `${c.id}/${v.name}/${slot.slot} → ${slot.role}`)
    )
  );

  const measured = COMPONENTS.flatMap((c) => componentChecks(system, c)).filter(
    (check) => !isExempt(check)
  );
  const worst = measured.reduce<SlotCheck | undefined>(
    (w, check) =>
      !w || check.ratio - check.floor < w.ratio - w.floor ? check : w,
    undefined
  );
  const failing = measured.filter((check) => check.ratio < check.floor);

  /* Structural checks score the offenders as a negative count, so 0 is a pass. */
  const count = (bad: string[]) => -bad.length;
  return [
    {
      name: `every one of ${legacy.length} Gamut aliases is mapped exactly once`,
      pass: missing.length + twice.length === 0,
      worst: count([...missing, ...twice]),
      floor: 0,
      at:
        [
          ...missing.map((t) => `unmapped ${t}`),
          ...twice.map((t) => `twice ${t}`),
        ].join(', ') || '—',
    },
    {
      name: 'every token-map target is a real role, and every split has a choice',
      pass: badTargets.length === 0,
      worst: count(badTargets),
      floor: 0,
      at: badTargets.join(', ') || '—',
    },
    {
      name: `every slot in ${COMPONENTS.length} components maps to a real role`,
      pass: badSlots.length === 0,
      worst: count(badSlots),
      floor: 0,
      at: badSlots.join(', ') || '—',
    },
    {
      name: `every mapped text and icon slot clears its tier (${measured.length} pairings, margin over floor)`,
      pass: failing.length === 0,
      worst: worst ? worst.ratio - worst.floor : 0,
      floor: 0,
      at: failing.length
        ? failing
            .map(
              (f) =>
                `${f.component} ${f.variant} ${f.slot}: ${f.fg} on ${f.bg} (${
                  f.mode
                }) ${f.ratio.toFixed(2)} < ${f.floor}`
            )
            .join('; ')
        : worst
        ? `${worst.component} ${worst.variant} ${worst.slot}: ${worst.fg} on ${worst.bg} (${worst.mode})`
        : '—',
    },
  ];
};
