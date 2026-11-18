import { setupRtl } from '@skillsoft/gamut-tests';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Alert } from './Alert';

const renderView = setupRtl(Alert, {
  children: 'Hello',
  onClose: vi.fn(),
});

describe('Alert', () => {
  it('forwards closeButtonProps.ref to the close button', () => {
    const closeButtonRef = React.createRef<HTMLButtonElement>();
    const { view } = renderView({ closeButtonProps: { ref: closeButtonRef } });

    const closeButton = view.getByRole('button', { name: 'Close alert' });
    expect(closeButtonRef.current).toBe(closeButton);
  });
});
