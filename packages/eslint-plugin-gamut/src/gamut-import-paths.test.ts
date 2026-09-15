import { TSESLint } from '@typescript-eslint/utils';

import rule from './gamut-import-paths';

const ruleTester = new TSESLint.RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
});

const inGamut = '/workspace/packages/gamut/src/Button/index.tsx';
const inStyleguide = '/workspace/packages/styleguide/src/Button.tsx';

ruleTester.run('gamut-import-paths', rule, {
  valid: [
    {
      code: `import { Box } from '@skillsoft/gamut';`,
      filename: inStyleguide,
    },
    {
      code: `import { theme } from '@skillsoft/gamut-styles';`,
      filename: inGamut,
    },
    {
      code: `import { Box } from '../Box';`,
      filename: inGamut,
    },
  ],
  invalid: [
    {
      code: `import { Box } from '@skillsoft/gamut';`,
      filename: inGamut,
      errors: [{ messageId: 'useRelativeImport' }],
    },
    {
      code: `import { theme } from '@skillsoft/gamut-styles/src';`,
      filename: inGamut,
      errors: [{ messageId: 'removeSrc' }],
      output: `import { theme } from '@skillsoft/gamut-styles';`,
    },
    {
      code: `import { Box } from '@skillsoft/gamut/src/Box';`,
      filename: inStyleguide,
      errors: [{ messageId: 'removeSrc' }],
    },
    {
      code: `import { theme } from '@skillsoft/gamut-styles/dist';`,
      filename: inGamut,
      errors: [{ messageId: 'removeDist' }],
      output: `import { theme } from '@skillsoft/gamut-styles';`,
    },
    {
      code: `import { Box } from '@skillsoft/gamut/dist/Box';`,
      filename: inStyleguide,
      errors: [{ messageId: 'removeDist' }],
    },
  ],
});
