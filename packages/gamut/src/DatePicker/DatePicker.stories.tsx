import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, fn, screen, waitFor, within } from 'storybook/test';

import { Box } from '../Box';
import { FillButton } from '../Button';
import { PopoverContainer } from '../PopoverContainer';
import {
  DatePicker,
  DatePickerCalendar,
  DatePickerInput,
  matchDisabledDates,
  useDatePicker,
} from '.';
import { getMonthGrid } from './DatePickerCalendar/Calendar/utils/dateGrid';
import { formatDateForAriaLabel } from './DatePickerCalendar/Calendar/utils/format';
import { formatDateISO8601DateOnly } from './DatePickerInput/utils';
import { getIsoFirstDayFromLocale } from './utils/locale';

const storybookLocaleOptions = [
  undefined,
  'en',
  'en-US',
  'en-GB',
  'de-DE',
  'es',
  'es-ES',
  'fr-FR',
  'ja-JP',
  'pt-BR',
  'zh-CN',
  'ko-KR',
  'it-IT',
  'nl-NL',
  'pl-PL',
  'ru-RU',
  'sv-SE',
  'tr-TR',
  'hi-IN',
  'ar',
  'ar-SA',
  'he-IL',
  'th-TH',
] as const;

const meta: Meta<typeof DatePicker> = {
  title: 'Inputs & forms/DatePicker',
  component: DatePicker,
  args: {
    mode: 'single',
    locale: 'en-US',
  },
  argTypes: {
    mode: {
      description: 'Pick a single date or a range of dates.',
      type: {
        name: 'enum',
        value: ['single', 'range'],
        required: true,
      },
      control: { type: 'radio' },
      table: { type: { summary: "'single' | 'range'" } },
    },
    locale: {
      description:
        'BCP 47 language tag for `Intl` segment order, month names, and quick-action relative dates. `undefined` uses runtime default.',
      control: { type: 'select' },
      options: [...storybookLocaleOptions],
    },
    selectedDate: {
      if: { arg: 'mode', eq: 'single' },
      control: false,
    },
    onSelected: {
      if: { arg: 'mode', eq: 'single' },
      control: false,
    },
    startDate: {
      if: { arg: 'mode', eq: 'range' },
      control: false,
    },
    endDate: {
      if: { arg: 'mode', eq: 'range' },
      control: false,
    },
    onStartSelected: {
      if: { arg: 'mode', eq: 'range' },
      control: false,
    },
    onEndSelected: {
      if: { arg: 'mode', eq: 'range' },
      control: false,
    },
  },
  render: function DatePickerStory(args) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(
      args.mode === 'single' ? args.selectedDate ?? null : null
    );
    const [startDate, setStartDate] = useState<Date | null>(
      args.mode === 'range' ? args.startDate ?? null : null
    );
    const [endDate, setEndDate] = useState<Date | null>(
      args.mode === 'range' ? args.endDate ?? null : null
    );

    if (args.mode === 'range') {
      return (
        <DatePicker
          {...args}
          endDate={endDate}
          startDate={startDate}
          onEndSelected={(date) => {
            setEndDate(date);
            onEndSelected(date);
          }}
          onStartSelected={(date) => {
            setStartDate(date);
            onStartSelected(date);
          }}
        />
      );
    }

    return (
      <DatePicker
        {...args}
        selectedDate={selectedDate}
        onSelected={(date) => {
          setSelectedDate(date);
          onSelected(date);
        }}
      />
    );
  },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

const onSelected = fn();
const onStartSelected = fn();
const onEndSelected = fn();
const onQuickActionClick = fn();
const onFormSubmit = fn();

const fixedMode = { mode: { control: false } } as const;

const tallCanvas: Decorator[] = [
  (Story) => (
    <Box height="500px">
      <Story />
    </Box>
  ),
];

type Queries = ReturnType<typeof within>;

const getHiddenValue = (root: HTMLElement, name: string) =>
  root.querySelector<HTMLInputElement>(`input[type="hidden"][name="${name}"]`)
    ?.value;

const getSegment = (
  root: Queries,
  field: 'month' | 'day' | 'year',
  index = 0
) => root.getAllByRole('spinbutton', { name: field })[index];

const clickOutside = async (
  canvasElement: HTMLElement,
  user: { click: (element: Element) => Promise<void> }
) =>
  waitFor(async () => {
    await user.click(canvasElement);
    await expect(screen.queryByRole('dialog')).toBeNull();
  });

const toStartOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

export const Default: Story = {
  decorators: tallCanvas,
};

export const SingleDate: Story = {
  args: { mode: 'single', placement: 'inline' },
  argTypes: fixedMode,
  decorators: tallCanvas,
  play: async ({ canvas, canvasElement, userEvent }) => {
    canvas.getByText('Date');
    const group = canvas.getByRole('group');
    const labelledBy = group.getAttribute('aria-labelledby');
    await expect(canvasElement.querySelector(`#${labelledBy}`)).not.toBeNull();
    await expect(canvas.queryByRole('dialog')).toBeNull();

    await userEvent.click(group);
    await expect(canvas.getByRole('dialog')).toBeVisible();

    const month = getSegment(canvas, 'month');
    month.focus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).toBeNull();
    await expect(month).toHaveFocus();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open calendar' })
    );
    await expect(canvas.getByRole('dialog')).toBeVisible();

    canvas.getByRole('button', { name: 'Last month' }).focus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).toBeNull();

    await userEvent.click(group);
    await expect(canvas.getByRole('dialog')).toBeVisible();
    await clickOutside(canvasElement, userEvent);
  },
};

export const Range: Story = {
  args: { mode: 'range', placement: 'inline' },
  argTypes: fixedMode,
  decorators: tallCanvas,
  play: async ({ canvas, userEvent }) => {
    const groups = canvas.getAllByRole('group');
    await expect(groups).toHaveLength(2);
    canvas.getByText('Start date');
    canvas.getByText('End date');

    await userEvent.click(groups[1]);
    const dialog = canvas.getByRole('dialog');
    await expect(
      within(dialog).getByRole('button', { name: 'Clear' })
    ).toBeDisabled();
    within(dialog).getByRole('button', { name: 'Last 7 days' });
  },
};

export const WithInitialDateSingle: Story = {
  args: {
    mode: 'single',
    placement: 'floating',
    selectedDate: new Date(2026, 1, 15),
  },
  argTypes: fixedMode,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe(
      '2026-02-15'
    );
    await expect(getSegment(canvas, 'month')).toHaveAttribute(
      'aria-valuetext',
      '02'
    );

    await userEvent.click(canvas.getByRole('group'));
    const dialog = await screen.findByRole('dialog', { name: 'Choose date' });
    const feb15 = within(dialog).getByRole('gridcell', {
      name: /February 15, 2026/,
    });
    await expect(feb15).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(
      within(dialog).getByRole('gridcell', { name: /February 20, 2026/ })
    );
    await expect(onSelected).toHaveBeenLastCalledWith(new Date(2026, 1, 20));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe(
      '2026-02-20'
    );

    await userEvent.click(canvas.getByRole('group'));
    await userEvent.click(
      await screen.findByRole('gridcell', { name: /February 20, 2026/ })
    );
    await expect(onSelected).toHaveBeenLastCalledWith(null);
    await waitFor(() =>
      expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe('')
    );
  },
};

export const WithInitialDateRange: Story = {
  args: {
    mode: 'range',
    placement: 'floating',
    startDate: new Date(2026, 1, 15),
    endDate: new Date(2026, 1, 20),
  },
  argTypes: fixedMode,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const [startGroup, endGroup] = canvas.getAllByRole('group');
    await userEvent.click(startGroup);
    const dialog = await screen.findByRole('dialog');
    const cell = (day: number) =>
      within(dialog).getByRole('gridcell', {
        name: new RegExp(`February ${day}, 2026`),
      });

    await expect(cell(14)).toHaveAttribute('aria-selected', 'false');
    await expect(cell(15)).toHaveAttribute('aria-selected', 'true');
    await expect(cell(17)).toHaveAttribute('aria-selected', 'true');
    await expect(cell(20)).toHaveAttribute('aria-selected', 'true');
    await expect(cell(21)).toHaveAttribute('aria-selected', 'false');

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Clear' })
    );
    await expect(onStartSelected).toHaveBeenLastCalledWith(null);
    await expect(onEndSelected).toHaveBeenLastCalledWith(null);
    await expect(cell(17)).toHaveAttribute('aria-selected', 'false');
    await expect(
      within(dialog).getByRole('button', { name: 'Clear' })
    ).toBeDisabled();

    await userEvent.click(cell(10));
    await expect(onStartSelected).toHaveBeenLastCalledWith(
      new Date(2026, 1, 10)
    );
    await expect(onEndSelected).toHaveBeenLastCalledWith(null);
    screen.getByRole('dialog');

    await userEvent.click(cell(20));
    await expect(onStartSelected).toHaveBeenLastCalledWith(
      new Date(2026, 1, 10)
    );
    await expect(onEndSelected).toHaveBeenLastCalledWith(new Date(2026, 1, 20));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    await userEvent.click(endGroup);
    await userEvent.click(
      await screen.findByRole('gridcell', { name: /February 25, 2026/ })
    );
    await expect(onStartSelected).toHaveBeenLastCalledWith(
      new Date(2026, 1, 10)
    );
    await expect(onEndSelected).toHaveBeenLastCalledWith(new Date(2026, 1, 25));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(getHiddenValue(canvasElement, 'datePickerInputStart')).toBe(
      '2026-02-10'
    );
    await expect(getHiddenValue(canvasElement, 'datePickerInputEnd')).toBe(
      '2026-02-25'
    );
  },
};

export const FloatingPlacement: Story = {
  args: { mode: 'range', placement: 'floating' },
  argTypes: fixedMode,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getAllByRole('group')[0]);
    const dialog = await screen.findByRole('dialog');
    await expect(canvasElement.contains(dialog)).toBe(false);

    await clickOutside(canvasElement, userEvent);
  },
};

export const RangeSmall: Story = {
  args: { mode: 'range', inputSize: 'small', placement: 'floating' },
  argTypes: fixedMode,
};

export const SingleDefaultQuickActions: Story = {
  args: { mode: 'single', placement: 'floating' },
  argTypes: fixedMode,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const today = new Date();
    await userEvent.click(canvas.getByRole('group'));
    const dialog = await screen.findByRole('dialog');

    await expect(
      within(dialog).getByLabelText(
        formatDateForAriaLabel({
          date: today,
          locale: new Intl.Locale('en-US'),
        })
      )
    ).toHaveAttribute('aria-current', 'date');
    within(dialog).getByRole('button', { name: 'Yesterday' });
    within(dialog).getByRole('button', { name: 'Tomorrow' });
    await expect(
      within(dialog).queryByRole('button', { name: 'Clear' })
    ).toBeNull();

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Today' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(onSelected).toHaveBeenCalledTimes(1);
    await expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe(
      formatDateISO8601DateOnly(toStartOfDay(today))
    );
  },
};

export const RangeDefaultQuickActions: Story = {
  args: { mode: 'range', placement: 'floating' },
  argTypes: fixedMode,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getAllByRole('group')[0]);
    const dialog = await screen.findByRole('dialog');
    within(dialog).getByRole('button', { name: 'Last 30 days' });
    within(dialog).getByRole('button', { name: 'Last 90 days' });

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Last 7 days' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(onStartSelected).toHaveBeenCalledTimes(1);
    await expect(getHiddenValue(canvasElement, 'datePickerInputEnd')).toBe(
      formatDateISO8601DateOnly(new Date())
    );
    await expect(
      getHiddenValue(canvasElement, 'datePickerInputStart')
    ).not.toBe('');
  },
};

export const SingleNoQuickActions: Story = {
  args: { mode: 'single', quickActions: null, placement: 'floating' },
  argTypes: fixedMode,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('group'));
    const dialog = await screen.findByRole('dialog');
    const buttons = within(dialog).getAllByRole('button');
    await expect(buttons.map((button) => button.ariaLabel)).toEqual([
      'Last month',
      'Next month',
    ]);
  },
};

export const RangeNoQuickActions: Story = {
  args: { mode: 'range', quickActions: null, placement: 'floating' },
  argTypes: fixedMode,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getAllByRole('group')[0]);
    const dialog = await screen.findByRole('dialog');
    within(dialog).getByRole('button', { name: 'Clear' });
    await expect(
      within(dialog).queryByRole('button', { name: 'Last 7 days' })
    ).toBeNull();
  },
};

export const SingleCustomQuickActions: Story = {
  args: {
    mode: 'single',
    placement: 'floating',
    quickActions: [
      { num: -3, timePeriod: 'day', displayText: '3 days ago' },
      { num: 0, timePeriod: 'day', displayText: 'Today' },
      {
        num: 3,
        timePeriod: 'day',
        displayText: 'In 3 days',
        onClick: onQuickActionClick,
      },
    ],
  },
  argTypes: fixedMode,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('group'));
    const dialog = await screen.findByRole('dialog');
    within(dialog).getByRole('button', { name: '3 days ago' });
    await expect(
      within(dialog).queryByRole('button', { name: 'Yesterday' })
    ).toBeNull();

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'In 3 days' })
    );
    await expect(onQuickActionClick).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe(
      formatDateISO8601DateOnly(addDays(new Date(), 3))
    );
  },
};

export const RangeCustomQuickActions: Story = {
  args: {
    mode: 'range',
    placement: 'floating',
    quickActions: [
      { num: -7, timePeriod: 'day', displayText: 'Last 7 days' },
      { num: -14, timePeriod: 'day', displayText: 'Last 14 days' },
      { num: -30, timePeriod: 'day', displayText: 'Last 30 days' },
    ],
  },
  argTypes: fixedMode,
};

export const MatchDisabledDates: Story = {
  args: {
    mode: 'range',
    disableDate: matchDisabledDates([new Date(2026, 3, 22)]),
    placement: 'floating',
  },
  argTypes: fixedMode,
};

const calendarDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const Range30DayWindowFromStart: Story = {
  args: { mode: 'range', placement: 'floating' },
  argTypes: fixedMode,
  render: function DatePickerStory(args) {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);

    return (
      <DatePicker
        {...args}
        disableDate={(date) => {
          if (startDate === null) {
            return false;
          }
          const start = calendarDate(startDate);
          const min = new Date(start);
          min.setDate(min.getDate() - 30);
          const max = new Date(start);
          max.setDate(max.getDate() + 30);
          const day = calendarDate(date);
          return day < min || day > max;
        }}
        endDate={endDate}
        mode="range"
        startDate={startDate}
        onEndSelected={setEndDate}
        onStartSelected={setStartDate}
      />
    );
  },
};

export const RangeDisabledBeforeToday: Story = {
  args: {
    mode: 'range',
    disableDate: (date) => {
      const today = new Date();
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      return date < startOfToday;
    },
    placement: 'floating',
  },
  argTypes: fixedMode,
};

export const RangeDisabledMoreThan30DaysBeforeToday: Story = {
  args: {
    mode: 'range',
    disableDate: (date) => {
      const today = new Date();
      const thirtyDaysAgo = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - 30
      );
      return date < thirtyDaysAgo;
    },
    placement: 'floating',
  },
  argTypes: fixedMode,
};

export const RangeDisabledWeekends: Story = {
  args: {
    mode: 'range',
    disableDate: (date) => date.getDay() === 0 || date.getDay() === 6,
    placement: 'floating',
  },
  argTypes: fixedMode,
};

export const Locale: Story = {
  args: { mode: 'single', locale: 'de-DE', placement: 'floating' },
  argTypes: fixedMode,
  play: async ({ canvas }) => {
    await expect(
      canvas.getAllByRole('spinbutton').map((segment) => segment.ariaLabel)
    ).toEqual(['day', 'month', 'year']);
  },
};

export const Translations: Story = {
  args: {
    mode: 'range',
    locale: 'es',
    translations: {
      clearButtonText: 'Borrar',
      dateLabel: 'Fecha',
      startDateLabel: 'Fecha de inicio',
      endDateLabel: 'Fecha de fin',
      calendarDialogAriaLabel: 'Elegir fecha',
      openCalendarLabel: 'Abrir calendario',
      last7DaysDisplayText: 'Últimos 7 días',
      last30DaysDisplayText: 'Últimos 30 días',
      last90DaysDisplayText: 'Últimos 90 días',
      invalidDate: 'Fecha no válida',
      invalidDateIncomplete: 'Fecha incompleta',
      invalidDateInvalidMonth: 'El mes debe estar entre 1 y 12',
      invalidDateInvalidDay: '{{month}} no tiene {{day}} días',
      invalidDateRollover: '{{month}} no tiene {{day}} días',
      invalidDateNotAvailable: 'Esta fecha no está disponible',
      invalidDateRangeContainsDisabledDate:
        'Este rango de fechas contiene fechas no disponibles',
    },
    placement: 'floating',
  },
  argTypes: fixedMode,
  play: async ({ canvas, userEvent }) => {
    canvas.getByText('Fecha de inicio');
    canvas.getByText('Fecha de fin');
    await expect(
      canvas.getAllByRole('button', { name: 'Abrir calendario' })
    ).toHaveLength(2);

    await userEvent.click(canvas.getAllByRole('group')[0]);
    const dialog = await screen.findByRole('dialog', { name: 'Elegir fecha' });
    within(dialog).getByRole('button', { name: 'Borrar' });
    within(dialog).getByRole('button', { name: 'Últimos 7 días' });
  },
};

export const ComposedWithContext: Story = {
  args: { mode: 'single', placement: 'floating' },
  argTypes: fixedMode,
  render: function DatePickerStory(args) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    return (
      <DatePicker
        {...args}
        mode="single"
        selectedDate={selectedDate}
        onSelected={setSelectedDate}
      >
        <ComposedDatePickerLayout />
      </DatePicker>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByRole('group')).toHaveLength(1);
    await expect(screen.queryByRole('dialog')).toBeNull();

    await userEvent.click(canvas.getByRole('group'));
    const dialog = await screen.findByRole('dialog', { name: 'Choose date' });
    await expect(dialog).toHaveAttribute('id', 'calendar-dialog');
  },
};

const ComposedDatePickerLayout: React.FC = () => {
  const { isCalendarOpen, closeCalendar } = useDatePicker();
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <Box width="fit-content">
        <DatePickerInput ref={inputRef} />
      </Box>
      <PopoverContainer
        alignment="bottom-left"
        allowPageInteraction
        focusOnProps={{ autoFocus: false, focusLock: false }}
        invertAxis="x"
        isOpen={isCalendarOpen}
        targetRef={inputRef}
        x={-20}
        y={-16}
        onRequestClose={closeCalendar}
      >
        <div aria-label="Choose date" id="calendar-dialog" role="dialog">
          <DatePickerCalendar dialogId="calendar-dialog" />
        </div>
      </PopoverContainer>
    </>
  );
};

export const CustomInputLabels: Story = {
  args: { mode: 'range' },
  argTypes: fixedMode,
  render: function DatePickerStory(args) {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    return (
      <DatePicker
        {...args}
        endDate={endDate}
        mode="range"
        startDate={startDate}
        onEndSelected={setEndDate}
        onStartSelected={setStartDate}
      >
        <Box display="flex" gap={8}>
          <DatePickerInput label="The Beginning" rangePart="start" />
          <DatePickerInput label="The End" rangePart="end" />
        </Box>
      </DatePicker>
    );
  },
  play: ({ canvas }) => {
    canvas.getByText('The Beginning');
    canvas.getByText('The End');
  },
};

export const DisabledInput: Story = {
  args: { mode: 'single' },
  argTypes: fixedMode,
  render: function DatePickerStory(args) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    return (
      <DatePicker
        {...args}
        mode="single"
        selectedDate={selectedDate}
        onSelected={setSelectedDate}
      >
        <DatePickerInput disabled label="Departure date" />
      </DatePicker>
    );
  },
  play: async ({ canvas, userEvent }) => {
    canvas.getByText('Departure date');
    const month = getSegment(canvas, 'month');
    await expect(month).toHaveAttribute('aria-disabled', 'true');
    await expect(month).toHaveAttribute('tabIndex', '-1');

    await userEvent.click(month);
    await userEvent.keyboard('5');
    await expect(month).toHaveAttribute('aria-valuetext', 'MM');
  },
};

export const KeyboardEntry: Story = {
  args: { mode: 'single', placement: 'inline' },
  argTypes: fixedMode,
  decorators: tallCanvas,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const month = getSegment(canvas, 'month');
    const day = getSegment(canvas, 'day');
    const year = getSegment(canvas, 'year');
    await expect(month).toHaveAttribute('aria-valuetext', 'MM');
    await expect(day).toHaveAttribute('aria-valuetext', 'DD');
    await expect(year).toHaveAttribute('aria-valuetext', 'YYYY');

    month.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(day).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(year).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(day).toHaveFocus();

    month.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(month).toHaveAttribute('aria-valuetext', '12');
    await userEvent.keyboard('{Backspace}');
    await expect(month).toHaveAttribute('aria-valuetext', '1');
    await userEvent.keyboard('{Backspace}');
    await expect(month).toHaveAttribute('aria-valuetext', 'MM');
    await userEvent.keyboard('{ArrowUp}');
    await expect(month).toHaveAttribute('aria-valuetext', '01');
    await userEvent.keyboard('{ArrowUp}');
    await expect(month).toHaveAttribute('aria-valuetext', '02');
    await userEvent.keyboard('{ArrowDown}');
    await expect(month).toHaveAttribute('aria-valuetext', '01');
    await userEvent.keyboard('{Backspace}{Backspace}');

    await userEvent.keyboard('03');
    await expect(month).toHaveAttribute('aria-valuetext', '03');
    await expect(day).toHaveFocus();
    day.blur();
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Incomplete date'
    );

    day.focus();
    await userEvent.keyboard('15');
    await expect(year).toHaveFocus();
    await userEvent.keyboard('2024');
    await expect(canvas.queryByRole('alert')).toBeNull();
    await expect(onSelected).toHaveBeenLastCalledWith(new Date(2024, 2, 15));
    await expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe(
      '2024-03-15'
    );

    year.blur();
    await expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe(
      '2024-03-15'
    );

    month.focus();
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await expect(canvas.getByRole('dialog')).toBeVisible();
    await waitFor(() =>
      expect(
        canvas.getByRole('gridcell', { name: /March 15, 2024/ })
      ).toHaveFocus()
    );

    day.focus();
    await userEvent.keyboard('16');
    await expect(year).toHaveFocus();
    await expect(
      canvas.getByRole('gridcell', { name: /March 16, 2024/ })
    ).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{Escape}');
    year.focus();
    await userEvent.keyboard('{Backspace>4/}');
    day.focus();
    await userEvent.keyboard('{Backspace>2/}');
    month.focus();
    await userEvent.keyboard('{Backspace>2/}');
    await expect(onSelected).toHaveBeenLastCalledWith(null);
    await expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe('');

    month.blur();
    await expect(canvas.queryByRole('alert')).toBeNull();
    await expect(month).toHaveAttribute('aria-valuetext', 'MM');
    await expect(day).toHaveAttribute('aria-valuetext', 'DD');
    await expect(year).toHaveAttribute('aria-valuetext', 'YYYY');
  },
};

export const CalendarNavigation: Story = {
  args: {
    mode: 'single',
    placement: 'inline',
    selectedDate: new Date(2024, 2, 20),
    disableDate: matchDisabledDates([new Date(2024, 2, 1)]),
  },
  argTypes: fixedMode,
  decorators: tallCanvas,
  play: async ({ canvas, userEvent }) => {
    const cell = (name: string) =>
      canvas.getByRole('gridcell', { name: new RegExp(name) });

    await userEvent.click(canvas.getByRole('group'));
    const grid = canvas.getByRole('grid', { name: 'March 2024' });
    const headers = within(grid).getAllByRole('columnheader');
    await expect(headers.map((header) => header.ariaLabel)).toEqual([
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ]);
    await expect(headers.map((header) => header.getAttribute('scope'))).toEqual(
      Array(7).fill('col')
    );
    await expect(within(grid).getAllByRole('gridcell')).toHaveLength(
      getMonthGrid({
        year: 2024,
        month: 2,
        firstWeekday: getIsoFirstDayFromLocale(new Intl.Locale('en-US')),
      }).flat().length
    );

    await expect(cell('March 20, 2024')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(cell('March 20, 2024')).toHaveAttribute('tabIndex', '0');
    await expect(cell('March 10, 2024')).toHaveAttribute('tabIndex', '-1');

    await expect(
      canvas.getAllByRole('button', { name: 'Last month' })
    ).toHaveLength(1);
    await expect(
      canvas.getAllByRole('button', { name: 'Next month' })
    ).toHaveLength(1);
    await userEvent.click(canvas.getByRole('button', { name: 'Next month' }));
    canvas.getByRole('grid', { name: 'April 2024' });
    await userEvent.click(canvas.getByRole('button', { name: 'Last month' }));
    canvas.getByRole('grid', { name: 'March 2024' });

    cell('March 31, 2024').focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(cell('April 1, 2024')).toHaveFocus();
    canvas.getByRole('grid', { name: 'March 2024' });
    await userEvent.keyboard('{ArrowLeft}');
    await expect(cell('March 31, 2024')).toHaveFocus();

    canvas.getByRole('button', { name: 'Next month' }).focus();
    await userEvent.keyboard('{Enter}');
    canvas.getByRole('grid', { name: 'May 2024' });
    await userEvent.tab();
    await waitFor(() => expect(cell('April 1, 2024')).toHaveFocus());
    await userEvent.click(canvas.getByRole('button', { name: 'Last month' }));
    canvas.getByRole('grid', { name: 'March 2024' });

    const march1 = cell('March 1, 2024');
    await expect(march1).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(march1);
    canvas.getByRole('dialog');
    march1.focus();
    await expect(march1).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    canvas.getByRole('dialog');
    await expect(onSelected).not.toHaveBeenCalled();

    cell('March 20, 2024').focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(cell('March 19, 2024')).toHaveFocus();
    await userEvent.keyboard('x');
    await expect(cell('March 19, 2024')).toHaveFocus();
    await userEvent.keyboard('{PageDown}');
    canvas.getByRole('grid', { name: 'April 2024' });
    await waitFor(() => expect(cell('April 19, 2024')).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    await expect(onSelected).toHaveBeenLastCalledWith(new Date(2024, 3, 19));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    await expect(getSegment(canvas, 'month')).toHaveFocus();

    await userEvent.click(canvas.getByRole('group'));
    cell('April 19, 2024').focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(cell('April 20, 2024')).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(onSelected).toHaveBeenLastCalledWith(new Date(2024, 3, 20));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());

    await userEvent.click(canvas.getByRole('group'));
    cell('April 20, 2024').focus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).toBeNull();
  },
};

export const SingleMonthLayout: Story = {
  args: {
    mode: 'single',
    placement: 'inline',
    selectedDate: new Date(2024, 2, 20),
  },
  argTypes: fixedMode,
  decorators: tallCanvas,
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('group'));
    canvas.getByRole('grid', { name: 'March 2024' });
    await expect(canvas.queryByRole('grid', { name: 'April 2024' })).toBeNull();
    await expect(
      canvas.getAllByRole('button', { name: 'Last month' })
    ).toHaveLength(1);
    await expect(
      canvas.getAllByRole('button', { name: 'Next month' })
    ).toHaveLength(1);

    canvas.getByRole('gridcell', { name: /March 31, 2024/ }).focus();
    await userEvent.keyboard('{ArrowRight}');
    canvas.getByRole('grid', { name: 'April 2024' });
    await expect(canvas.queryByRole('grid', { name: 'March 2024' })).toBeNull();
    await waitFor(() =>
      expect(
        canvas.getByRole('gridcell', { name: /April 1, 2024/ })
      ).toHaveFocus()
    );
  },
};

export const CalendarFollowsSelection: Story = {
  args: {
    mode: 'range',
    placement: 'inline',
    startDate: new Date(2024, 0, 10),
    endDate: new Date(2024, 5, 5),
  },
  argTypes: fixedMode,
  decorators: tallCanvas,
  play: async ({ canvas, userEvent }) => {
    const [startGroup, endGroup] = canvas.getAllByRole('group');

    await userEvent.click(endGroup);
    canvas.getByRole('grid', { name: 'June 2024' });
    await userEvent.keyboard('{Escape}');

    await userEvent.click(startGroup);
    canvas.getByRole('grid', { name: 'January 2024' });

    getSegment(within(startGroup), 'month').focus();
    await userEvent.keyboard('04');
    await expect(onStartSelected).toHaveBeenLastCalledWith(
      new Date(2024, 3, 10)
    );
    await waitFor(() => canvas.getByRole('grid', { name: 'April 2024' }));
    await expect(
      canvas.getByRole('gridcell', { name: /April 10, 2024/ })
    ).toHaveAttribute('aria-selected', 'true');
  },
};

export const ErrorState: Story = {
  args: {
    mode: 'single',
    placement: 'inline',
    disableDate: matchDisabledDates([new Date(2024, 2, 20)]),
  },
  argTypes: fixedMode,
  decorators: tallCanvas,
  play: async ({ canvas, userEvent }) => {
    const month = getSegment(canvas, 'month');
    const day = getSegment(canvas, 'day');

    month.focus();
    await userEvent.keyboard('13152024');
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Month must be between 1 and 12'
    );
    await expect(month).toHaveAttribute('aria-invalid', 'true');
    await expect(onSelected).not.toHaveBeenCalled();

    month.focus();
    await userEvent.keyboard('03');
    await expect(
      canvas.queryByText('Month must be between 1 and 12')
    ).toBeNull();
    await expect(onSelected).toHaveBeenLastCalledWith(new Date(2024, 2, 15));

    month.focus();
    await userEvent.keyboard('0230');
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'February does not have 30 days'
    );

    month.focus();
    await userEvent.keyboard('03');
    day.focus();
    await userEvent.keyboard('20');
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'This date is not available'
    );
    await expect(onSelected).not.toHaveBeenCalledWith(new Date(2024, 2, 20));
  },
};

export const RangeErrorState: Story = {
  args: {
    mode: 'range',
    placement: 'inline',
    startDate: new Date(2024, 2, 15),
    disableDate: matchDisabledDates([new Date(2024, 2, 20)]),
  },
  argTypes: fixedMode,
  decorators: tallCanvas,
  play: async ({ canvas, userEvent }) => {
    const endGroup = within(canvas.getAllByRole('group')[1]);

    getSegment(endGroup, 'month').focus();
    await userEvent.keyboard('03252024');
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'This date range contains unavailable dates'
    );
    await expect(onEndSelected).not.toHaveBeenCalled();

    getSegment(endGroup, 'year').focus();
    await userEvent.keyboard('{Backspace>4/}');
    getSegment(endGroup, 'day').focus();
    await userEvent.keyboard('18');
    getSegment(endGroup, 'year').focus();
    await userEvent.keyboard('2024');
    await expect(canvas.queryByRole('alert')).toBeNull();
    await expect(onStartSelected).toHaveBeenLastCalledWith(
      new Date(2024, 2, 15)
    );
    await expect(onEndSelected).toHaveBeenLastCalledWith(new Date(2024, 2, 18));
  },
};

export const RangeAcrossDisabledDates: Story = {
  args: {
    mode: 'range',
    placement: 'inline',
    startDate: new Date(2024, 2, 15),
    disableDate: (date) =>
      [new Date(2024, 2, 20), addDays(new Date(), -3)].some(
        (disabled) => disabled.getTime() === toStartOfDay(date).getTime()
      ),
  },
  argTypes: fixedMode,
  decorators: tallCanvas,
  play: async ({ canvas, userEvent }) => {
    const cell = (name: string) =>
      canvas.getByRole('gridcell', { name: new RegExp(name) });

    await userEvent.click(canvas.getAllByRole('group')[1]);
    await expect(cell('March 20, 2024')).toHaveAttribute(
      'aria-disabled',
      'true'
    );

    await userEvent.click(cell('March 25, 2024'));
    await expect(onStartSelected).toHaveBeenLastCalledWith(
      new Date(2024, 2, 25)
    );
    await expect(onEndSelected).toHaveBeenLastCalledWith(null);
    canvas.getByRole('dialog');
    await expect(cell('March 15, 2024')).toHaveAttribute(
      'aria-selected',
      'false'
    );
    await expect(cell('March 25, 2024')).toHaveAttribute(
      'aria-selected',
      'true'
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Last 7 days' }));
    await expect(onStartSelected).toHaveBeenLastCalledWith(
      toStartOfDay(new Date())
    );
    await expect(onEndSelected).toHaveBeenLastCalledWith(null);
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
  },
};

export const RangeTypedOutOfOrder: Story = {
  args: {
    mode: 'range',
    placement: 'inline',
    startDate: new Date(2024, 2, 10),
    endDate: new Date(2024, 2, 15),
  },
  argTypes: fixedMode,
  decorators: tallCanvas,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const [startGroup, endGroup] = canvas
      .getAllByRole('group')
      .map((group) => within(group));

    getSegment(startGroup, 'day').focus();
    await userEvent.keyboard('20');
    await expect(onStartSelected).toHaveBeenLastCalledWith(
      new Date(2024, 2, 20)
    );
    await expect(onEndSelected).toHaveBeenLastCalledWith(null);
    await expect(getSegment(endGroup, 'day')).toHaveAttribute(
      'aria-valuetext',
      'DD'
    );
    await expect(getHiddenValue(canvasElement, 'datePickerInputEnd')).toBe('');
  },
};

export const ControlledFromParent: Story = {
  args: { mode: 'single', placement: 'inline' },
  argTypes: fixedMode,
  decorators: tallCanvas,
  render: function DatePickerControlledStory(args) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    return (
      <>
        <DatePicker
          {...args}
          mode="single"
          selectedDate={selectedDate}
          onSelected={setSelectedDate}
        />
        <Box display="flex" gap={8} mt={16}>
          <FillButton onClick={() => setSelectedDate(new Date(2024, 5, 1))}>
            Set June 1, 2024
          </FillButton>
          <FillButton onClick={() => setSelectedDate(null)}>
            Clear date
          </FillButton>
        </Box>
      </>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Set June 1, 2024' })
    );
    await expect(getSegment(canvas, 'month')).toHaveAttribute(
      'aria-valuetext',
      '06'
    );
    await expect(getSegment(canvas, 'day')).toHaveAttribute(
      'aria-valuetext',
      '01'
    );
    await expect(getSegment(canvas, 'year')).toHaveAttribute(
      'aria-valuetext',
      '2024'
    );
    await expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe(
      '2024-06-01'
    );

    await userEvent.click(canvas.getByRole('group'));
    canvas.getByRole('grid', { name: 'June 2024' });
    await userEvent.keyboard('{Escape}');

    await userEvent.click(canvas.getByRole('button', { name: 'Clear date' }));
    await expect(getSegment(canvas, 'month')).toHaveAttribute(
      'aria-valuetext',
      'MM'
    );
    await expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe('');
  },
};

export const InForm: Story = {
  args: {
    mode: 'single',
    selectedDate: new Date(2024, 2, 1),
    translations: { dateLabel: 'Ship date' },
  },
  argTypes: fixedMode,
  decorators: tallCanvas,
  render: function DatePickerInFormStory(args) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(
      args.mode === 'single' ? args.selectedDate : null
    );
    return (
      <form
        aria-label="Shipping"
        onSubmit={(e) => {
          e.preventDefault();
          onFormSubmit(Object.fromEntries(new FormData(e.currentTarget)));
        }}
      >
        <DatePicker
          {...args}
          mode="single"
          selectedDate={selectedDate}
          onSelected={setSelectedDate}
        />
        <FillButton mt={16} type="submit">
          Save
        </FillButton>
      </form>
    );
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const form = canvas.getByRole('form', { name: 'Shipping' });
    within(form).getByRole('group');
    canvas.getByText('Ship date');
    await expect(getHiddenValue(canvasElement, 'datePickerInput')).toBe(
      '2024-03-01'
    );

    await userEvent.click(canvas.getByRole('group'));
    getSegment(canvas, 'month').focus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).toBeNull();

    await userEvent.click(canvas.getByRole('group'));
    canvas.getByRole('button', { name: 'Last month' }).focus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).toBeNull();

    await userEvent.click(canvas.getByRole('group'));
    await userEvent.click(
      canvas.getByRole('gridcell', { name: /March 20, 2024/ })
    );
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull());
    await expect(onFormSubmit).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(onFormSubmit).toHaveBeenCalledTimes(1);
    await expect(onFormSubmit).toHaveBeenCalledWith({
      datePickerInput: '2024-03-20',
    });
  },
};

export const RangeInForm: Story = {
  args: { mode: 'range' },
  argTypes: fixedMode,
  decorators: tallCanvas,
  render: function DatePickerRangeInFormStory(args) {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    return (
      <form
        aria-label="Booking"
        onSubmit={(e) => {
          e.preventDefault();
          onFormSubmit(Object.fromEntries(new FormData(e.currentTarget)));
        }}
      >
        <DatePicker
          {...args}
          endDate={endDate}
          mode="range"
          startDate={startDate}
          onEndSelected={setEndDate}
          onStartSelected={setStartDate}
        />
        <FillButton mt={16} type="submit">
          Save
        </FillButton>
      </form>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getAllByRole('group')[0]);
    await expect(canvas.getByRole('dialog')).toBeVisible();
    canvas.getByRole('button', { name: 'Next month' }).focus();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('dialog')).toBeNull();
    await expect(onFormSubmit).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(onFormSubmit).toHaveBeenCalledWith({
      datePickerInputStart: '',
      datePickerInputEnd: '',
    });
  },
};
