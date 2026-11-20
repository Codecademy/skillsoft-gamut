import { setupRtl } from '@skillsoft/gamut-tests';
import { waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CalendarBody } from './CalendarBody';

const renderView = setupRtl(CalendarBody, {
  displayDate: new Date(2024, 2, 1),
  selectedDate: null,
  focusedDate: new Date(2024, 2, 15),
  labelledById: 'cal-heading',
  locale: 'en-US',
  onDateSelect: vi.fn(),
  onFocusedDateChange: vi.fn(),
  onDisplayDateChange: vi.fn(),
  onEscapeKeyPress: vi.fn(),
});

describe('CalendarBody', () => {
  it('moves DOM focus to the focus target when focusGridSync is omitted (standalone)', async () => {
    const { view } = renderView();

    const march15 = view.getByRole('gridcell', { name: /March 15, 2024/i });
    await waitFor(() => expect(march15).toHaveFocus());
  });
});
