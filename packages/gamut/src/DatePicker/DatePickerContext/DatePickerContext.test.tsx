import { MockGamutProvider } from '@skillsoft/gamut-tests';
import { render } from '@testing-library/react';

import { DatePickerCalendar } from '../DatePickerCalendar';
import { DatePickerInput } from '../DatePickerInput';
import { DEFAULT_DATE_PICKER_TRANSLATIONS } from '../utils/translations';
import { DatePickerProvider, useDatePicker } from '.';
import type {
  DatePickerRangeContextValue,
  DatePickerSingleContextValue,
} from './types';

const createMockSingleContext = (
  overrides: Partial<DatePickerSingleContextValue> = {}
): DatePickerSingleContextValue => ({
  mode: 'single',
  locale: new Intl.Locale('en-US'),
  isCalendarOpen: false,
  openCalendar: jest.fn(),
  focusCalendar: jest.fn(),
  focusGridSignal: false,
  gridFocusRequested: false,
  clearGridFocusRequest: jest.fn(),
  closeCalendar: jest.fn(),
  translations: { ...DEFAULT_DATE_PICKER_TRANSLATIONS },
  quickActions: [],
  hasError: false,
  setHasError: jest.fn(),
  selectedDate: new Date(2024, 2, 15),
  onSelection: jest.fn(),
  ...overrides,
});

const createMockRangeContext = (
  overrides: Partial<DatePickerRangeContextValue> = {}
): DatePickerRangeContextValue => ({
  mode: 'range',
  locale: new Intl.Locale('en-US'),
  isCalendarOpen: false,
  openCalendar: jest.fn(),
  focusCalendar: jest.fn(),
  focusGridSignal: false,
  gridFocusRequested: false,
  clearGridFocusRequest: jest.fn(),
  closeCalendar: jest.fn(),
  translations: { ...DEFAULT_DATE_PICKER_TRANSLATIONS },
  quickActions: [],
  hasError: false,
  setHasError: jest.fn(),
  startDate: null,
  endDate: null,
  onRangeSelection: jest.fn(),
  activeRangePart: null,
  setActiveRangePart: jest.fn(),
  ...overrides,
});

const Consumer = () => {
  const ctx = useDatePicker();
  return <span data-testid="mode">{ctx.mode}</span>;
};

const RangeDatesConsumer = () => {
  const ctx = useDatePicker();
  if (ctx.mode !== 'range') return null;
  return (
    <span data-testid="range-dates">
      {ctx.startDate?.toDateString() ?? 'no-start'}|
      {ctx.endDate?.toDateString() ?? 'no-end'}
    </span>
  );
};

describe('DatePickerContext', () => {
  it.each([
    ['useDatePicker', <Consumer key="consumer" />],
    ['DatePickerInput', <DatePickerInput key="input" />],
    [
      'DatePickerCalendar',
      <DatePickerCalendar dialogId="orphan" key="calendar" />,
    ],
  ])('throws when %s is used outside DatePickerProvider', (_, element) => {
    expect(() =>
      render(<MockGamutProvider>{element}</MockGamutProvider>)
    ).toThrow('useDatePickerContext must be used within a DatePicker.');
  });

  it('returns single-mode context from useDatePicker when wrapped in DatePickerProvider', () => {
    const { getByTestId } = render(
      <MockGamutProvider>
        <DatePickerProvider value={createMockSingleContext()}>
          <Consumer />
        </DatePickerProvider>
      </MockGamutProvider>
    );

    expect(getByTestId('mode')).toHaveTextContent('single');
  });

  it('exposes range fields when the provider value is range mode', () => {
    const { getByTestId } = render(
      <MockGamutProvider>
        <DatePickerProvider value={createMockRangeContext()}>
          <Consumer />
        </DatePickerProvider>
      </MockGamutProvider>
    );

    expect(getByTestId('mode')).toHaveTextContent('range');
  });

  it('passes startDate and endDate through to consumers in range mode', () => {
    const start = new Date(2026, 3, 10);
    const end = new Date(2026, 3, 20);
    const { getByTestId } = render(
      <MockGamutProvider>
        <DatePickerProvider
          value={createMockRangeContext({ startDate: start, endDate: end })}
        >
          <RangeDatesConsumer />
        </DatePickerProvider>
      </MockGamutProvider>
    );

    expect(getByTestId('range-dates')).toHaveTextContent(
      `${start.toDateString()}|${end.toDateString()}`
    );
  });
});
