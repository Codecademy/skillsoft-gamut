import {
  GamutProvider,
  originalCodecademyTheme,
  skillsoftTheme,
} from '@skillsoft/gamut-styles';
import { render } from '@testing-library/react';

import { PatternBackdrop } from '../PatternBackdrop';

const renderIn = (theme: typeof skillsoftTheme) =>
  render(
    <GamutProvider theme={theme} useCache={false} useGlobals={false}>
      <PatternBackdrop>Float on okay</PatternBackdrop>
    </GamutProvider>
  );

describe('PatternBackdrop', () => {
  it('draws the checker pattern in Original Codecademy', () => {
    const view = renderIn(originalCodecademyTheme);
    view.getByText('Float on okay');
    view.getByTitle('Checker Dense');
  });

  it('leaves the pattern out in Skillsoft', () => {
    const view = renderIn(skillsoftTheme);
    view.getByText('Float on okay');
    expect(view.queryByTitle('Checker Dense')).toBeNull();
  });
});
