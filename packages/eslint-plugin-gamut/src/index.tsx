import gamutImportPaths from './gamut-import-paths';
import noCssStandalone from './no-css-standalone';
import noInlineStyle from './no-inline-style';
import noKbdElement from './no-kbd-element';
import preferThemed from './prefer-themed';
import recommended from './recommended';

const rules = {
  'import-paths': gamutImportPaths,
  'no-css-standalone': noCssStandalone,
  'no-inline-style': noInlineStyle,
  'no-kbd-element': noKbdElement,
  'prefer-themed': preferThemed,
};

// Nested under `configs` so ESLint can resolve `extends: ['plugin:@skillsoft/gamut/recommended']`.
const configs = { recommended };

export { configs, rules };
