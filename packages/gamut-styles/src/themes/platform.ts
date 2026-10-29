import mapValues from 'lodash/mapValues';

import * as values from '../tokens/generated/brands/platform.values';
import {
  coreElevation,
  corePalette,
  fontFamily,
  fontWeight,
  platformPalette,
} from '../variables';
import { createBrandTheme } from './createBrandTheme';

/*
 * Platform (the learning environment): old platform rebuilt as a brand of
 * the generated color system (colorSystem/brands/platform.ts). Fonts, weights
 * and elevation are old core's, which old platform used, unchanged. It
 * starts in dark mode, as old platform did.
 *
 * The code editor's syntax and chrome colors aren't part of the color
 * system: no role covers them, and they aren't generated or checked. They
 * keep old platform's names and exact values, resolved from the same
 * palettes as before, and only this theme's GamutProvider declares them,
 * as `--colors-editor-*` in tokens.css's layer and mode selectors.
 */
const OLD_PALETTE: Record<string, string> = {
  ...corePalette,
  ...platformPalette,
};

const editor = {
  light: {
    'editor-attribute': 'green-700',
    'editor-annotation': 'red-500',
    'editor-atom': 'pink-800',
    'editor-basic': 'navy-800',
    'editor-comment': 'comment-light',
    'editor-constant': 'orange-800',
    'editor-decoration': 'red-500',
    'editor-invalid': 'red-500',
    'editor-key': 'teal-500',
    'editor-keyword': 'blue-500',
    'editor-number': 'red-500',
    'editor-operator': 'red-500',
    'editor-predefined': 'navy-800',
    'editor-property': 'red-500',
    'editor-regexp': 'green-700',
    'editor-string': 'gold-800',
    'editor-tag': 'red-500',
    'editor-text': 'orange-800',
    'editor-value': 'gold-800',
    'editor-variable': 'green-700',
    'editor-ui-background': 'white',
    'editor-ui-text': 'navy-800',
    'editor-ui-indent-active': 'indent-active-light',
    'editor-ui-indent-inactive': 'indent-inactive-light',
    'editor-ui-line-number-active': 'line-number-active-light',
    'editor-ui-line-number-inactive': 'line-number-inactive-light',
  },
  dark: {
    'editor-attribute': 'green-400',
    'editor-annotation': 'red-300',
    'editor-atom': 'pink-400',
    'editor-basic': 'white',
    'editor-comment': 'comment-dark',
    'editor-constant': 'orange-500',
    'editor-decoration': 'red-300',
    'editor-invalid': 'red-300',
    'editor-key': 'blue-300',
    'editor-keyword': 'purple-300',
    'editor-number': 'red-300',
    'editor-operator': 'red-300',
    'editor-predefined': 'white',
    'editor-property': 'red-300',
    'editor-regexp': 'green-400',
    'editor-string': 'yellow-500',
    'editor-tag': 'red-300',
    'editor-text': 'orange-500',
    'editor-value': 'yellow-500',
    'editor-variable': 'green-400',
    'editor-ui-background': 'navy-900',
    'editor-ui-text': 'white',
    'editor-ui-indent-active': 'indent-active-dark',
    'editor-ui-indent-inactive': 'indent-inactive-dark',
    'editor-ui-line-number-active': 'line-number-active-dark',
    'editor-ui-line-number-inactive': 'line-number-inactive-dark',
  },
} as const;

const base = createBrandTheme(values, {
  name: 'platform',
  fontFamily,
  fontWeight,
  elevation: coreElevation,
  initialMode: 'dark',
});

type EditorAlias = keyof typeof editor.light;

const editorValues = (mode: 'light' | 'dark') =>
  mapValues(editor[mode], (key) => OLD_PALETTE[key]);

const editorBlock = (selector: string, mode: 'light' | 'dark') =>
  `${selector}{${Object.entries(editorValues(mode))
    .map(([alias, value]) => `--colors-${alias}:${value};`)
    .join('')}}`;

export const platformTheme = {
  ...base,
  colors: {
    ...base.colors,
    ...(mapValues(
      editor.light,
      (_, alias) => `var(--colors-${alias})`
    ) as Record<EditorAlias, string>),
  },
  tokensCss: `${base.tokensCss}\n@layer tokens{${editorBlock(
    ':root,[data-color-mode="light"]',
    'light'
  )}${editorBlock('[data-color-mode="dark"]', 'dark')}}`,
};

export type PlatformThemeShape = typeof platformTheme;

export interface PlatformTheme extends PlatformThemeShape {}
