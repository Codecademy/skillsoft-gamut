import gamutImportPaths from './gamut-import-paths';
import noCssStandalone from './no-css-standalone';
import noInlineStyle from './no-inline-style';
import noKbdElement from './no-kbd-element';
import noRawZIndex from './no-raw-z-index';
import preferThemed from './prefer-themed';
import recommended from './recommended';
import requireStyledTargetForSelector from './require-styled-target-for-selector';

const rules = {
  'import-paths': gamutImportPaths,
  'no-css-standalone': noCssStandalone,
  'no-inline-style': noInlineStyle,
  'no-kbd-element': noKbdElement,
  'no-raw-z-index': noRawZIndex,
  'prefer-themed': preferThemed,
  'require-styled-target-for-selector': requireStyledTargetForSelector,
};

// Nested under `configs` so ESLint can resolve `extends: ['plugin:@skillsoft/gamut/recommended']`.
const configs = { recommended };

export { configs, rules };
