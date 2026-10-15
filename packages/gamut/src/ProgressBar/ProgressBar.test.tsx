import { MockGamutProvider } from '@skillsoft/gamut-tests';
import { render, screen } from '@testing-library/react';

import { ProgressBar, ProgressBarProps } from '.';

describe('ProgressBar', () => {
  describe.each([
    { useLogicalProperties: true, widthProp: 'inlineSize' },
    { useLogicalProperties: false, widthProp: 'width' },
  ])(
    'width styles (useLogicalProperties: $useLogicalProperties)',
    ({ useLogicalProperties, widthProp }) => {
      const renderWithLogicalProps = (props: Partial<ProgressBarProps> = {}) =>
        render(
          <MockGamutProvider useLogicalProperties={useLogicalProperties}>
            <ProgressBar percent={50} variant="blue" {...props} />
          </MockGamutProvider>
        );

      it('uses percentage as width when no minimumPercent is provided', () => {
        renderWithLogicalProps({ percent: 50 });

        const progressBar = screen.getByTestId('progress-bar-bar');
        expect(progressBar).toHaveStyle({ [widthProp]: '50%' });
      });

      it('uses percentage as width when it is greater than minimumPercent', () => {
        renderWithLogicalProps({ minimumPercent: 25, percent: 50 });

        const progressBar = screen.getByTestId('progress-bar-bar');
        expect(progressBar).toHaveStyle({ [widthProp]: '50%' });
      });

      it('uses minimumPercentage as width when it is greater than percent', () => {
        renderWithLogicalProps({ minimumPercent: 75, percent: 50 });

        const progressBar = screen.getByTestId('progress-bar-bar');
        expect(progressBar).toHaveStyle({ [widthProp]: '75%' });
      });
    }
  );
});
