import type { Preset } from '../lib/types';
import { scopeSwap } from './scope-swap';

/*
  Every preset the CLI can run. A preset is one upgrade: its own manifest,
  an ordered list of migrations, and the checklist to print afterwards.
  Later presets are named for the release they target and can reuse
  migrations from src/migrations with a different manifest.
*/
export const presets: Record<string, Preset> = {
  [scopeSwap.name]: scopeSwap,
};

/*
  AST migrations print through recast once, then splice migrations edit that
  output by offset. Interleaving them would need a print and re-parse per
  switch, so presets have to list every `ast` migration before any
  `splice` one.
*/
export const validatePreset = (preset: Preset) => {
  const source = preset.migrations.filter((m) => m.kind !== 'file');
  const firstSplice = source.findIndex((m) => m.kind === 'splice');
  const lateAst =
    firstSplice === -1
      ? undefined
      : source.slice(firstSplice).find((m) => m.kind === 'ast');
  if (lateAst) {
    throw new Error(
      `preset '${preset.name}': ast migration '${lateAst.name}' is listed after a splice migration. List every ast migration first.`
    );
  }
  return preset;
};

export const getPreset = (name: string) => {
  const preset = presets[name];
  if (!preset) {
    throw new Error(
      `unknown preset '${name}'. Available: ${Object.keys(presets).join(', ')}`
    );
  }
  return validatePreset(preset);
};
