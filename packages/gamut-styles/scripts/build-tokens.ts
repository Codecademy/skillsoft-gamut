/* eslint-disable no-console -- CLI script; the console is its output. */
/*
 * Brand → DTCG token files → tokens.css (via Style Dictionary) + TS constants.
 *
 *   yarn workspace @skillsoft/gamut-styles build:tokens
 *
 * Output lands in src/tokens/generated/ and is checked in, so the theme and
 * the package build don't need the generator (or culori) at runtime.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import StyleDictionary from 'style-dictionary';
import { fileHeader, formattedVariables } from 'style-dictionary/utils';

import { BRANDS, DEFAULT_BRAND } from '../src/colorSystem/brands';
import {
  EXTENSION,
  toDtcgMode,
  toDtcgPalette,
  toTsModule,
} from '../src/colorSystem/emit';
import { validateMigration } from '../src/colorSystem/migration';
import type { Mode } from '../src/colorSystem/roles';
import { MODES } from '../src/colorSystem/roles';
import type { ColorSystem } from '../src/colorSystem/system';
import { createColorSystem } from '../src/colorSystem/system';
import { validate } from '../src/colorSystem/validate';

const OUT = join(__dirname, '../src/tokens/generated');

/* Cascade layer order: Panda's default, which is Chakra's plus `utilities`. */
const LAYERS = ['reset', 'base', 'tokens', 'recipes', 'utilities'];

const SELECTORS: Record<Mode, string> = {
  light: ':root, [data-color-mode="light"]',
  dark: '[data-color-mode="dark"]',
};

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
  name: 'css/gamut-variables',
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

const cssFor = async (
  sources: string[],
  selector: string,
  only?: string,
  mode?: Mode
): Promise<string> => {
  const sd = new StyleDictionary({
    source: sources,
    usesDtcg: true,
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: {
      css: {
        transforms: ['name/kebab', 'color/oklch'],
        prefix: 'colors',
        files: [
          {
            destination: 'unused.css',
            format: 'css/gamut-variables',
            filter: only ? (t) => t.filePath.endsWith(only) : undefined,
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

/*
 * A brand's role overrides: the roles whose palette reference differs from
 * the default brand's in this mode, on the element that carries both
 * attributes (ColorMode sets them together). Empty when nothing differs.
 */
const roleOverrideCss = (
  brand: ColorSystem,
  base: ColorSystem,
  mode: Mode
): string => {
  const lines = Object.entries(brand.roles[mode])
    .filter(([token, v]) => v.key !== base.roles[mode][token].key)
    .map(([token, v]) => `  --colors-${token}: var(--colors-${v.key});`);
  return lines.length
    ? `[data-brand="${
        brand.brand.name
      }"][data-color-mode="${mode}"] {\n${lines.join('\n')}\n}\n`
    : '';
};

const main = async () => {
  const systems = BRANDS.map(createColorSystem);

  /* Every brand has to pass, or nothing is emitted. */
  const failed = systems.flatMap((s) =>
    [...validate(s), ...validateMigration(s)]
      .filter((c) => !c.pass)
      .map((c) => `  ${s.brand.name}: ${c.name}: ${c.worst} at ${c.at}`)
  );
  if (failed.length) {
    throw new Error(`refusing to emit; failed checks:\n${failed.join('\n')}`);
  }

  const [system, ...others] = systems;
  if (system.brand.name !== DEFAULT_BRAND.name) {
    throw new Error('BRANDS must start with DEFAULT_BRAND');
  }

  /* Cleared first, so a renamed or removed brand leaves nothing behind. */
  await rm(join(OUT, 'brands'), { recursive: true, force: true });
  await mkdir(join(OUT, 'brands'), { recursive: true });
  const files = {
    palette: join(OUT, 'palette.tokens.json'),
    light: join(OUT, 'light.tokens.json'),
    dark: join(OUT, 'dark.tokens.json'),
  };
  const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
  await writeFile(files.palette, json(toDtcgPalette(system)));
  await writeFile(files.light, json(toDtcgMode(system, 'light')));
  await writeFile(files.dark, json(toDtcgMode(system, 'dark')));

  /*
   * Other brands: their palette, TS values and mode files (identical to the
   * default's unless the brand overrides a role).
   */
  const brandPalettes: [string, string][] = [];
  for (const other of others) {
    const { name } = other.brand;
    const file = join(OUT, 'brands', `${name}.palette.tokens.json`);
    await writeFile(file, json(toDtcgPalette(other)));
    for (const mode of MODES) {
      await writeFile(
        join(OUT, 'brands', `${name}.${mode}.tokens.json`),
        json(toDtcgMode(other, mode))
      );
    }
    await writeFile(
      join(OUT, 'brands', `${name}.values.ts`),
      toTsModule(other)
    );
    brandPalettes.push([name, file]);
  }
  await writeFile(
    join(OUT, 'brands', 'index.ts'),
    [
      '/* Generated by scripts/build-tokens.ts. Do not edit. */',
      '/* Every brand but the default, whose values are the top-level exports. */',
      ...others.map(
        ({ brand }) =>
          `export * as ${brand.name} from './${brand.name}.values';`
      ),
      '',
    ].join('\n')
  );

  /*
   * The default palette is on :root; each other brand's replaces it under
   * `[data-brand]`. Roles resolve their palette var() where they're declared,
   * so a `[data-brand]` element also needs `data-color-mode` to re-declare
   * them against its palette. ColorMode sets both.
   */
  const blocks = [
    await cssFor([files.palette], `:root, [data-brand="${system.brand.name}"]`),
    ...(await Promise.all(
      brandPalettes.map(([name, file]) =>
        cssFor([file], `[data-brand="${name}"]`)
      )
    )),
    await cssFor(
      [files.palette, files.light],
      SELECTORS.light,
      'light.tokens.json',
      'light'
    ),
    await cssFor(
      [files.palette, files.dark],
      SELECTORS.dark,
      'dark.tokens.json',
      'dark'
    ),
    ...others.flatMap((other) =>
      MODES.map((mode) => roleOverrideCss(other, system, mode))
    ),
  ].filter(Boolean);
  /*
   * Every block goes in the `tokens` layer, after the whole order is declared,
   * so a reset, base styles or recipes added later (by us or by Panda) slot in
   * around it. Unlayered styles, which is everything Emotion writes, still win.
   * The statement form declares the order without emitting empty layer blocks.
   */
  const css = [
    `/* Generated by scripts/build-tokens.ts from the ${systems
      .map((s) => `"${s.brand.name}"`)
      .join(', ')} brands ("${
      system.brand.name
    }" is the default). Do not edit. */`,
    `@layer ${LAYERS.join(', ')};`,
    '',
    `@layer tokens {\n${blocks
      .join('\n')
      .trimEnd()
      .replace(/^(?=.)/gm, '  ')}\n}`,
    '',
  ].join('\n');
  await writeFile(join(OUT, 'tokens.css'), css);
  /* The same CSS as a string, so GamutProvider can inject it through Emotion. */
  await writeFile(
    join(OUT, 'tokensCss.ts'),
    `/* Generated by scripts/build-tokens.ts: tokens.css as a string. Do not edit. */\nexport const tokensCss = ${JSON.stringify(
      css
    )};\n`
  );

  await writeFile(join(OUT, 'values.ts'), toTsModule(system));

  console.log(`wrote ${OUT}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
