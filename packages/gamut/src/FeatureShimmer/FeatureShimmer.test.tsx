import { setupRtl } from '@skillsoft/gamut-tests';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FeatureShimmer } from '.';

const mockIntersectionObserver = vi.fn();
const mockUseReducedMotion = vi.fn();
vi.mock('framer-motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('framer-motion')>()),
  get useReducedMotion() {
    return mockUseReducedMotion;
  },
}));

const renderView = setupRtl(FeatureShimmer, { children: 'Testing' });

describe('FeatureShimmer', () => {
  beforeEach(() => {
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('renders shimmer when reduced motion is false', () => {
    mockUseReducedMotion.mockReturnValue(false);

    const { view } = renderView();

    view.getByText('Testing');
    view.getByTestId('feature-shimmer');
  });

  it('does not render shimmer when reduced motion is true', () => {
    mockUseReducedMotion.mockReturnValue(true);

    const { view } = renderView();

    view.getByText('Testing');
    expect(view.queryByTestId('feature-shimmer')).toBeNull();
  });
});
