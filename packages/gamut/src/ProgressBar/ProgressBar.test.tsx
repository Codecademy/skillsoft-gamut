import { matchers } from '@emotion/jest';
import { MockGamutProvider } from '@skillsoft/gamut-tests';
import { render, screen } from '@testing-library/react';

import { ProgressBar } from '.';
import type { ProgressBarProps } from './types';

expect.extend(matchers);

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

describe('ProgressBar label', () => {
  const renderBar = (props: Partial<ProgressBarProps> = {}) =>
    render(
      <MockGamutProvider>
        <ProgressBar percent={10} variant="default" {...props} />
      </MockGamutProvider>
    );

  /* Design's two-tone label: text-inverse on the bar, text-default on the track. */
  it('draws the label on the bar and on the track at large sizes', () => {
    renderBar({ size: 'large' });

    const labels = screen.getAllByText('10%');
    expect(labels).toHaveLength(2);
    expect(screen.getByTestId('progress-bar-bar')).toContainElement(labels[1]);
    expect(labels[0].parentElement).toHaveStyleRule(
      'color',
      'var(--colors-text-default)'
    );
    expect(screen.getByTestId('progress-bar-bar')).toHaveStyleRule(
      'overflow',
      'hidden'
    );
  });

  it('draws no label at small sizes', () => {
    renderBar({ size: 'small' });

    expect(screen.queryByText('10%')).toBeNull();
  });
});
