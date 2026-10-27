import { contentModes } from './contentModes';
import type { Gradient, Mode, Ref, RoleValue } from './roles';
import { FALLOFF, MODES, ROLES } from './roles';
import type { Color, ColorSystem } from './system';
import { paletteKey, valueKey } from './system';

/*
 * Color system → DTCG 2025.10 token files and TS constants.
 *
 * Three DTCG files, because DTCG has no modes of its own (the 2025.10
 * Resolver module covers that, and Style Dictionary doesn't support it yet):
 * one palette, plus one role file per mode that references it.
 *
 * Every color is stored as OKLCH components with a 6-digit hex fallback.
 * OKLCH is the source of truth; hex is for consumers outside CSS.
 */

export const EXTENSION = 'com.skillsoft.gamut';

type DtcgColor = {
  colorSpace: 'oklch';
  components: [number, number, number];
  alpha: number;
  hex: string;
};

type DtcgToken = {
  $type: 'color';
  $value: DtcgColor | string;
  $description?: string;
  $extensions?: Record<string, unknown>;
};

type DtcgGroup = { [key: string]: DtcgToken | DtcgGroup | string };

const dtcgColor = (color: Color, alpha = 1): DtcgColor => ({
  colorSpace: 'oklch',
  components: [color.l, color.c, color.h],
  alpha,
  hex: color.hex,
});

export const oklchCss = ({ l, c, h }: Color, alpha?: number): string =>
  alpha === undefined || alpha === 1
    ? `oklch(${l} ${c} ${h})`
    : `oklch(${l} ${c} ${h} / ${alpha})`;

/* Hex, or rgba() when translucent — what polished-based color math can parse. */
export const srgbCss = ({ hex }: Color, alpha?: number): string => {
  if (alpha === undefined || alpha === 1) return hex;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/* `{ slot: 'primary', grade: 800 }` → `['palette', 'primary', '800']`. */
const refPath = (ref: Ref, alpha?: number): string[] => {
  const suffix = alpha === undefined ? '' : `-a${Math.round(alpha * 100)}`;
  return typeof ref === 'string'
    ? [`${ref}${suffix}`]
    : ['palette', ref.slot, `${ref.grade}${suffix}`];
};

const refString = (value: RoleValue) =>
  `{${refPath(value.ref, value.alpha).join('.')}}`;

const setPath = (group: DtcgGroup, path: string[], token: DtcgToken) => {
  let node = group;
  for (const key of path.slice(0, -1)) {
    node[key] ??= {};
    node = node[key] as DtcgGroup;
  }
  node[path[path.length - 1]] = token;
};

/* Every translucent value a role uses gets its own palette entry. */
const translucentValues = (): RoleValue[] => {
  const seen = new Map<string, RoleValue>();
  for (const role of ROLES) {
    for (const mode of MODES) {
      if (role[mode].alpha !== undefined) {
        seen.set(valueKey(role[mode]), role[mode]);
      }
    }
  }
  return [...seen.values()];
};

export const gradientCss = (system: ColorSystem, gradient: Gradient) =>
  gradient.circles
    .map(({ ref, radius, at }) => {
      const color = system.palette[paletteKey(ref)];
      const stops = FALLOFF.map(
        ([pos, alpha]) => `${oklchCss(color, alpha)} ${pos}%`
      ).join(', ');
      return `radial-gradient(circle calc(${radius} * 100cqw) at ${at}, ${stops})`;
    })
    .join(', ');

/*
 * The same gradient against palette variables, for tokens.css. Each stop is
 * the palette color at the stop's alpha (`color-mix` with transparent in
 * oklab), so it follows whichever brand's palette is in scope and is emitted
 * once for every brand.
 */
export const gradientCssVars = (gradient: Gradient) =>
  gradient.circles
    .map(({ ref, radius, at }) => {
      const stops = FALLOFF.map(
        ([pos, alpha]) =>
          `color-mix(in oklab, var(--colors-${paletteKey(ref)}) ${Number(
            (alpha * 100).toFixed(2)
          )}%, transparent) ${pos}%`
      ).join(', ');
      return `radial-gradient(circle calc(${radius} * 100cqw) at ${at}, ${stops})`;
    })
    .join(', ');

export const toDtcgPalette = (system: ColorSystem): DtcgGroup => {
  const group: DtcgGroup = {
    $description: `Generated from the "${system.brand.name}" brand (tier ${system.brand.tier}). Do not edit.`,
  };
  const modes = contentModes(system);
  for (const [key, color] of Object.entries(system.palette)) {
    const path =
      key === 'white' || key === 'black'
        ? [key]
        : ['palette', ...key.replace(/^palette-/, '').split(/-(?=\d+$)/)];
    setPath(group, path, {
      $type: 'color',
      $value: dtcgColor(color),
      /* The mode content on this color uses. See contentModes.ts. */
      $extensions: { [EXTENSION]: { contentMode: modes[key] } },
    });
  }
  for (const value of translucentValues()) {
    const color = system.palette[paletteKey(value.ref)];
    setPath(group, refPath(value.ref, value.alpha), {
      $type: 'color',
      $value: dtcgColor(color, value.alpha),
    });
  }
  return group;
};

export const toDtcgMode = (system: ColorSystem, mode: Mode): DtcgGroup => {
  const group: DtcgGroup = {
    $description: `${mode} mode roles for "${system.brand.name}". Do not edit.`,
  };
  for (const role of ROLES) {
    const gradient = role.gradient?.[mode];
    group[role.token] = {
      $type: 'color',
      $value: refString(role[mode]),
      $description: role.usage,
      ...(gradient && {
        $extensions: {
          [EXTENSION]: {
            gradient: {
              circles: gradient.circles.map((c) => ({
                color: `{${refPath(c.ref).join('.')}}`,
                radius: c.radius,
                at: c.at,
              })),
              falloff: FALLOFF,
              css: gradientCss(system, gradient),
              cssVars: gradientCssVars(gradient),
            },
          },
        },
      }),
    };
  }
  return group;
};

/* The TS constants the Emotion theme (and anything else in JS) reads. */
export const toTsModule = (system: ColorSystem): string => {
  const entry = (color: Color, alpha?: number, ref?: string) => ({
    ...(ref && { ref }),
    oklch: oklchCss(color, alpha),
    srgb: srgbCss(color, alpha),
  });

  const palette: Record<string, ReturnType<typeof entry>> = {};
  for (const [key, color] of Object.entries(system.palette)) {
    palette[key] = entry(color);
  }
  for (const value of translucentValues()) {
    palette[valueKey(value)] = entry(
      system.palette[paletteKey(value.ref)],
      value.alpha
    );
  }

  const byMode = (source: ColorSystem['roles']) =>
    Object.fromEntries(
      MODES.map((mode) => [
        mode,
        Object.fromEntries(
          Object.entries(source[mode]).map(([token, v]) => [
            token,
            entry(v, v.alpha, v.key),
          ])
        ),
      ])
    );

  const gradients = Object.fromEntries(
    MODES.map((mode) => [
      mode,
      Object.fromEntries(
        ROLES.filter((r) => r.gradient).map((r) => [
          r.token,
          gradientCss(system, r.gradient![mode]),
        ])
      ),
    ])
  );

  const json = (value: unknown) => JSON.stringify(value, null, 2);
  return [
    `/* Generated by scripts/build-tokens.ts from the "${system.brand.name}" brand. Do not edit. */`,
    '',
    `export const brand = ${json(system.brand)} as const;`,
    '',
    `export const palette = ${json(palette)} as const;`,
    '',
    `export const roles = ${json(byMode(system.roles))} as const;`,
    '',
    `export const gradients = ${json(gradients)} as const;`,
    '',
    '/* Palette color → the mode its content uses. Background reads this instead of measuring. */',
    `export const contentModes = ${json(contentModes(system))} as const;`,
    '',
  ].join('\n');
};
