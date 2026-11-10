import { setupRtl } from '@skillsoft/gamut-tests';
import { matchers } from '@emotion/jest';
import * as React from 'react';

import { Alert } from './Alert';

expect.extend(matchers);

const onClick = jest.fn();

const renderView = setupRtl(Alert, {
  children: 'Hello',
  onClose: jest.fn(),
});

describe('Alert', () => {
  it('forwards closeButtonProps.ref to the close button', () => {
    const closeButtonRef = React.createRef<HTMLButtonElement>();
    const { view } = renderView({ closeButtonProps: { ref: closeButtonRef } });

    const closeButton = view.getByRole('button', { name: 'Close alert' });
    expect(closeButtonRef.current).toBe(closeButton);
  });
  describe('color', () => {
    it("leaves the CTA in the Alert's own mode instead of forcing dark", () => {
      const { view } = renderView({
        type: 'error',
        cta: { onClick, children: 'Retry' },
      });

      const cta = view.getByRole('button', { name: 'Retry' });

      /* A forced mode writes that mode's role variables into the button's class. */
      expect(cta).not.toHaveStyleRule(
        '--color-action-neutral',
        expect.any(String)
      );
    });

    it("puts a status variant's ink on the message", () => {
      const { view } = renderView({ type: 'error' });

      expect(view.getByRole('status')).toHaveStyleRule(
        'color',
        'var(--color-text-error)'
      );
    });

    it('keeps the message in text-default on general', () => {
      const { view } = renderView({ type: 'general' });

      expect(view.getByRole('status')).toHaveStyleRule(
        'color',
        'var(--color-text-default)'
      );
    });

    it("gives a floating Alert's edge the same ink", () => {
      const { view } = renderView({ type: 'success', placement: 'floating' });

      expect(view.getByRole('status')).toHaveStyleRule(
        'border-color',
        'var(--color-text-success)'
      );
    });

    it('keeps an inline Alert borderless', () => {
      const { view } = renderView({ type: 'success', placement: 'inline' });

      expect(view.getByRole('status')).not.toHaveStyleRule(
        'border-color',
        'var(--color-text-success)'
      );
    });
  });
});
