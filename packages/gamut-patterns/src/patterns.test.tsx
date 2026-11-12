import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import * as patterns from './patterns';
import type { CheckerDense as GenericPatternComponent } from './patterns/CheckerDense';

const patternComponents = patterns as Record<
  string,
  typeof GenericPatternComponent
>;
const patternTable = Object.keys(patterns)
  .filter((n) => !n.startsWith('_'))
  .map((n) => [n]);

describe('patterns', () => {
  it.each(patternTable)('%s renders', (name) => {
    const Pattern = patternComponents[name];
    render(<Pattern />);
  });
});
