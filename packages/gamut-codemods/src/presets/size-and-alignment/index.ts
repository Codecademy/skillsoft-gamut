import type { Preset } from '../../lib/types';
import { propValues } from '../../migrations/prop-values';
import { manifest } from './manifest';

export const sizeAndAlignment: Preset = {
  name: 'size-and-alignment',
  description:
    'Gamut size values move to sm / md / lg, Select sizeVariant becomes size, and left / right alignment values become start / end.',
  manifest,
  migrations: [propValues],
  checklist: [
    'Run your formatter and lint autofix. The rewritten values are the same length or close to it, so layouts usually keep their shape.',
    'Type-check. Props on components the codemod does not know about still take the old values, and the compiler is the fastest way to find them.',
    'Work through the warnings above. Each one is a prop value the codemod could not convert.',
  ],
  conditionalChecklist: {},
};
