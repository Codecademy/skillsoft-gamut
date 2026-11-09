import { setupRtl } from '@skillsoft/gamut-tests';
import * as React from 'react';

import { Modal } from './Modal';

const renderView = setupRtl(Modal, {
  title: 'Title',
  children: 'Hello world',
  isOpen: true,
  onRequestClose: jest.fn(),
});

describe('Modal', () => {
  it('forwards closeButtonProps.ref to the close button', () => {
    const closeButtonRef = React.createRef<HTMLButtonElement>();
    const { view } = renderView({ closeButtonProps: { ref: closeButtonRef } });

    const closeButton = view.getByRole('button', { name: 'Close modal' });
    expect(closeButtonRef.current).toBe(closeButton);
  });

  it('forwards containerFocusRef to the modal container', () => {
    const containerFocusRef = React.createRef<HTMLDivElement>();
    const { view } = renderView({ containerFocusRef });

    expect(containerFocusRef.current).toBe(view.getByRole('dialog'));
  });
});
