import type { FileMigration } from '../../lib/types';

/*
  Report-only. Before scope-swap, the gamut root re-exported Video, which
  pulled @vidstack/react's DOM types into every program that imported
  gamut. A tsconfig with an explicit `lib` and no "dom" got DOM globals
  anyway. Once Video moves to its subpath they're gone, and `document`,
  `HTMLInputElement`, `ResizeObserver` and friends stop type-checking.
  Adding "dom" is the owner's call, so this warns rather than rewriting.
*/

const LIB = /"lib"\s*:\s*\[([^\]]*)\]/;

export const tsconfigDom: FileMigration = {
  name: 'tsconfig-dom',
  kind: 'file',
  description:
    'Warn about tsconfig `lib` settings without "dom", which Video used to supply.',
  match: (file) => /(^|\/)tsconfig[\w.-]*\.json$/.test(file),
  run({ source, warn, note }) {
    const lib = LIB.exec(source);
    if (lib && !/["']dom["']/i.test(lib[1])) {
      warn(
        `"lib" has no "dom". Gamut's root import used to bring DOM types in through Video; add "dom" if type-checking now fails on document, HTMLElement, and so on.`
      );
      note('tsconfig-no-dom');
    }
    return null;
  },
};
