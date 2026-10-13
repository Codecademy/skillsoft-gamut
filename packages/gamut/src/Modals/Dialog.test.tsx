import { setupRtl } from '@skillsoft/gamut-tests';
import * as React from 'react';

import { Dialog } from './Dialog';

const defaultProps = {
  isOpen: true,
  title: 'Hello world',
  children: 'Close me please',
  onRequestClose: jest.fn(),
  confirmCta: { children: 'Confirm' },
  cancelCta: { children: 'Cancel' },
};

const renderView = setupRtl(Dialog, defaultProps);

describe('Dialog', () => {
  it('forwards closeButtonProps.ref to the close button', () => {
    const closeButtonRef = React.createRef<HTMLButtonElement>();
    const { view } = renderView({ closeButtonProps: { ref: closeButtonRef } });

    const closeButton = view.getByRole('button', { name: 'Close dialog' });
    expect(closeButtonRef.current).toBe(closeButton);
  });

  it('forwards containerFocusRef to the dialog container', () => {
    const containerFocusRef = React.createRef<HTMLDivElement>();
    const { view } = renderView({ containerFocusRef });

    expect(containerFocusRef.current).toBe(view.getByRole('dialog'));
  });
});
