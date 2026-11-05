import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import StyleDictionary from 'style-dictionary';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';

import type { BrandInput } from './brand';
import type { DtcgGroup } from './emit';
import { EXTENSION, toDtcgMode, toDtcgPalette, toTsModule } from './emit';
import { validateMigration } from './migration';
import type { Mode } from './roles';
import { ROLES } from './roles';
import { parseTokensCss, roundTripMisses } from './roundTrip';
import type { ColorSystem } from './system';
import { createColorSystem } from './system';
import type { Check } from './validate';
import { validate } from './validate';

/*
 * A brand in, its files out: tokens.css (through Style Dictionary), DTCG
 * JSON and a typed `values.ts` that `createBrandTheme` in
 * `@skillsoft/gamut-styles` takes. Each brand is complete on its own, so a
 * page carries one brand's colors, not every brand's.
 */

/* Cascade layer order: Panda's default, which is Chakra's plus `utilities`. */
export const LAYERS = ['reset', 'base', 'tokens', 'recipes', 'utilities'];

/* Letters, digits and `_`: safe in a CSS attribute value, a file name and a JS identifier. */
const BRAND_NAME = /^[A-Za-z][A-Za-z0-9_]*$/;

const ROLE_TOKENS = new Set<string>(ROLES.map((r) => r.token));

const FORMAT = 'css/gamut-variables';

/*
 * css/variables, plus a `--gradient-<role>` line for any role carrying a
 * gradient in its $extensions. DTCG's gradient type can't describe the
 * brand's stacked circles, so the CSS is precomputed by the emitter.
 *
 * Mode blocks also get:
 * - `color-scheme`, so native controls and scrollbars follow the mode;
 * - `color: var(--colors-text-default)`, because `color` inherits as a computed
 *   value — without it, text under a nested `[data-color-mode]` keeps the
 *   parent mode's color (ColorMode sets it on its wrapper for the same reason);
 * - a default `--colors-background-current`, which ColorMode sets at runtime
 *   and a CSS-only subtree needs from somewhere.
 */
StyleDictionary.registerFormat({
  name: FORMAT,
  format: async ({ dictionary, options, file }) => {
    const header = await fileHeader({ file });
    const vars = formattedVariables({
      format: 'css',
      dictionary,
      outputReferences: options.outputReferences,
      usesDtcg: true,
    });
    const gradients = dictionary.allTokens
      .filter((t) => t.$extensions?.[EXTENSION]?.gradient)
      .map(
        (t) =>
          `  --gradient-${t.path.join('-')}: ${
            t.$extensions[EXTENSION].gradient.cssVars
          };`
      );
    const { mode } = options as { mode?: Mode };
    const modeLines = mode
      ? [
          `  color-scheme: ${mode};`,
          '  color: var(--colors-text-default);',
          '  --colors-background-current: var(--colors-surface-default);',
        ]
      : [];
    return `${header}${options.selector} {\n${[
      ...modeLines,
      vars,
      ...gradients,
    ].join('\n')}\n}\n`;
  },
});

/*
 * One CSS block. A mode block gets the palette too, so its references
 * resolve, but prints only the roles.
 */
const cssBlock = async (
  tokens: DtcgGroup,
  selector: string,
  mode?: Mode
): Promise<string> => {
  const sd = new StyleDictionary({
    tokens: structuredClone(tokens),
    usesDtcg: true,
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: {
      css: {
        transforms: ['name/kebab', 'color/oklch'],
        prefix: 'colors',
        files: [
          {
            destination: 'unused.css',
            format: FORMAT,
            filter: mode
              ? (t) => t.path.length === 1 && ROLE_TOKENS.has(t.path[0])
              : undefined,
            options: {
              selector,
              mode,
              outputReferences: true,
              showFileHeader: false,
            },
          },
        ],
      },
    },
  });
  const [{ output }] = await sd.formatPlatform('css');
  return output as string;
};

/* Thrown when a brand fails a check; nothing is generated for it. */
export class BrandCheckError extends Error {
  constructor(readonly brand: string, readonly failed: Check[]) {
    super(
      `refusing to generate "${brand}"; failed checks:\n${failed
        .map((c) => `  ${c.name}: ${c.worst.toFixed(2)} at ${c.at}`)
        .join('\n')}`
    );
    this.name = 'BrandCheckError';
  }
}

export interface GeneratedBrand {
  system: ColorSystem;
  /* File name → contents, all of them text. */
  files: Record<string, string>;
}

export const FILES = [
  'values.ts',
  'tokens.css',
  'palette.tokens.json',
  'light.tokens.json',
  'dark.tokens.json',
] as const;

const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;

/*
 * The brand's palette goes on `:root` and `[data-brand]`, and its initial
 * mode's roles on `:root` and that mode's attribute, so a page starts in the
 * right brand and mode with no attributes on `<html>`. The other mode comes
 * after, so `data-color-mode` on `<html>` still wins over `:root`. A brand's
 * role overrides are already in its mode blocks: a bare `data-color-mode`
 * keeps them.
 */
const tokensCss = async (system: ColorSystem): Promise<string> => {
  const { name, initialMode } = system.brand;
  const palette = toDtcgPalette(system);
  const other: Mode = initialMode === 'light' ? 'dark' : 'light';
  const blocks = [
    await cssBlock(palette, `:root, [data-brand="${name}"]`),
    await cssBlock(
      { ...palette, ...toDtcgMode(system, initialMode) },
      `:root, [data-color-mode="${initialMode}"]`,
      initialMode
    ),
    await cssBlock(
      { ...palette, ...toDtcgMode(system, other) },
      `[data-color-mode="${other}"]`,
      other
    ),
  ];
  /*
   * Every block goes in the `tokens` layer, after the whole order is declared,
   * so a reset, base styles or recipes added later (by us or by Panda) slot in
   * around it. Unlayered styles, which is everything Emotion writes, still win.
   * The statement form declares the order without emitting empty layer blocks.
   */
  return [
    `/* Generated by @skillsoft/gamut-brand from the "${name}" brand. Do not edit. */`,
    `@layer ${LAYERS.join(', ')};`,
    '',
    `@layer tokens {\n${blocks
      .join('\n')
      .trimEnd()
      .replace(/^(?=.)/gm, '  ')}\n}`,
    '',
  ].join('\n');
};

/*
 * Every check has to pass, on the system and again on its tokens.css read
 * back, or nothing is generated.
 */
export const generateBrand = async (
  input: BrandInput
): Promise<GeneratedBrand> => {
  if (!BRAND_NAME.test(input.name)) {
    throw new Error(
      `brand name "${input.name}" has to be letters, digits and _, starting with a letter`
    );
  }
  const system = createColorSystem(input);
  const failing = (s: ColorSystem) =>
    [...validate(s), ...validateMigration(s)].filter((c) => !c.pass);

  const failed = failing(system);
  if (failed.length) throw new BrandCheckError(input.name, failed);

  const css = await tokensCss(system);
  const parsed = parseTokensCss(css, system);
  const misses = roundTripMisses(parsed, system);
  if (misses.length) {
    throw new Error(
      `${input.name}: tokens.css doesn't round-trip ${misses.join(', ')}`
    );
  }
  const failedOnCss = failing(parsed);
  if (failedOnCss.length) throw new BrandCheckError(input.name, failedOnCss);

  return {
    system,
    files: {
      'values.ts': toTsModule(system, css),
      'tokens.css': css,
      'palette.tokens.json': json(toDtcgPalette(system)),
      'light.tokens.json': json(toDtcgMode(system, 'light')),
      'dark.tokens.json': json(toDtcgMode(system, 'dark')),
    },
  };
};

/*
 * Generates the brand and writes its files into `dir`. A file whose contents
 * haven't changed isn't touched, so a dev server doesn't reload for nothing.
 * Returns the paths written.
 */
export const writeBrand = async (
  input: BrandInput,
  dir: string
): Promise<string[]> => {
  const { files } = await generateBrand(input);
  await mkdir(dir, { recursive: true });
  const written: string[] = [];
  for (const [file, contents] of Object.entries(files)) {
    const path = join(dir, file);
    const current = await readFile(path, 'utf8').catch(() => undefined);
    if (current === contents) continue;
    await writeFile(path, contents);
    written.push(path);
  }
  return written;
};

/* The files in `dir` that are missing or differ from what the brand generates. */
export const staleFiles = async (
  input: BrandInput,
  dir: string
): Promise<string[]> => {
  const { files } = await generateBrand(input);
  const stale: string[] = [];
  for (const [file, contents] of Object.entries(files)) {
    const path = join(dir, file);
    const current = await readFile(path, 'utf8').catch(() => undefined);
    if (current !== contents) stale.push(path);
  }
  return stale;
};
