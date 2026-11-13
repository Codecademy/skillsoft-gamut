import { describe, expect, it } from 'vitest';

import type { Migration } from '../lib/types';
import { validatePreset } from '.';
import { scopeSwap } from './scope-swap';

describe('validatePreset', () => {
  it('accepts scope-swap', () => {
    expect(() => validatePreset(scopeSwap)).not.toThrow();
  });

  it('rejects an ast migration listed after a splice one', () => {
    const migration = (name: string, kind: 'ast' | 'splice') =>
      ({ name, kind, description: name } as Migration);
    expect(() =>
      validatePreset({
        ...scopeSwap,
        migrations: [
          migration('first-ast', 'ast'),
          migration('a-splice', 'splice'),
          migration('late-ast', 'ast'),
        ],
      })
    ).toThrow(/late-ast/);
  });
});
