import { describe, expect, it } from 'vitest';

import { skillsoftTheme } from './skillsoft';

describe('themes', () => {
  it('skillsoft - theme shape', () => {
    expect(skillsoftTheme).toMatchSnapshot();
  });
});
