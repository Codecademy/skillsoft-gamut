import {
  BookFlipPageIcon,
  DataScienceIcon,
  TerminalIcon,
} from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import type { MouseEvent } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';

import { Box } from '../Box';
import type { BarProps, PartialBarChartTranslations } from '.';
import { BarChart } from '.';

const onBarClick = fn();

const meta: Meta<typeof BarChart> = {
  title: 'Data display/BarChart',
  component: BarChart,
  args: {
    description: 'Chart showing programming language experience levels',
    maxScaleValue: 2000,
    title: 'Skills experience chart',
    unit: 'XP',
  },
};

export default meta;
type Story = StoryObj<typeof BarChart>;

const simpleBarData: BarProps[] = [
  { categoryLabel: 'Python', seriesOneValue: 1500 },
  { categoryLabel: 'JavaScript', seriesOneValue: 2000 },
  { categoryLabel: 'HTML/CSS', seriesOneValue: 800 },
  { categoryLabel: 'SQL', seriesOneValue: 600 },
  { categoryLabel: 'React', seriesOneValue: 450 },
];

const stackedBarData: BarProps[] = [
  { categoryLabel: 'Python', seriesOneValue: 200, seriesTwoValue: 1500 },
  {
    categoryLabel: 'JavaScript',
    icon: TerminalIcon,
    seriesOneValue: 1800,
    seriesTwoValue: 2000,
  },
  { categoryLabel: 'HTML/CSS', seriesOneValue: 600, seriesTwoValue: 800 },
  { categoryLabel: 'SQL', seriesOneValue: 550, seriesTwoValue: 600 },
  { categoryLabel: 'React', seriesOneValue: 300, seriesTwoValue: 450 },
];

const accessibilityBarData: BarProps[] = [
  { categoryLabel: 'Python', seriesOneValue: 200, seriesTwoValue: 1500 },
  {
    categoryLabel: 'JavaScript',
    seriesOneValue: 1800,
    seriesTwoValue: 2000,
    href: '/javascript',
  },
  { categoryLabel: 'HTML/CSS', seriesOneValue: 600, seriesTwoValue: 800 },
  { categoryLabel: 'SQL', seriesOneValue: 550, href: '/sql' },
  { categoryLabel: 'Rust', seriesOneValue: 400 },
  { categoryLabel: 'React', seriesOneValue: 300, seriesTwoValue: 450 },
];

const accessibilityTranslations: PartialBarChartTranslations = {
  accessibility: {
    stackedBarSummary: (ctx) =>
      `${ctx.seriesOneValue} ${ctx.unit} gained — now at ${ctx.seriesTwoValue} ${ctx.unit} in ${ctx.categoryLabel}`,
    singleValueBarSummary: (ctx) =>
      `${ctx.value} ${ctx.unit} in ${ctx.categoryLabel}`,
  },
  locale: 'en',
};

const barDataWithIcons: BarProps[] = [
  {
    categoryLabel: 'Python',
    seriesOneValue: 200,
    seriesTwoValue: 1500,
    icon: TerminalIcon,
  },
  {
    categoryLabel: 'JavaScript',
    seriesOneValue: 150,
    seriesTwoValue: 2000,
    icon: TerminalIcon,
  },
  {
    categoryLabel: 'Data Science',
    seriesOneValue: 100,
    seriesTwoValue: 800,
    icon: DataScienceIcon,
  },
  {
    categoryLabel: 'Backend',
    seriesOneValue: 50,
    seriesTwoValue: 600,
    icon: TerminalIcon,
  },
  {
    categoryLabel: 'Reading',
    seriesOneValue: 75,
    seriesTwoValue: 450,
    icon: BookFlipPageIcon,
  },
];

const customSortingBarValues = [
  {
    categoryLabel: 'Python',
    seriesOneValue: 1500,
    dateAdded: new Date('2023-01-15'),
  },
  {
    categoryLabel: 'JavaScript',
    seriesOneValue: 2000,
    dateAdded: new Date('2023-03-20'),
  },
  {
    categoryLabel: 'React',
    seriesOneValue: 450,
    dateAdded: new Date('2023-06-10'),
  },
  {
    categoryLabel: 'TypeScript',
    seriesOneValue: 300,
    dateAdded: new Date('2023-08-05'),
  },
  {
    categoryLabel: 'SQL',
    seriesOneValue: 600,
    dateAdded: new Date('2023-02-28'),
  },
];

type DatedBar = (typeof customSortingBarValues)[number];

const expectRowOrder = async (canvasElement: HTMLElement, labels: string[]) => {
  const items = within(canvasElement).getAllByRole('listitem');
  await expect(items).toHaveLength(labels.length);
  for (const [index, label] of labels.entries()) {
    await expect(items[index]).toHaveTextContent(label);
  }
};

export const Default: Story = {
  args: {
    barValues: simpleBarData,
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    canvas.getByRole('figure');
    await expect(
      canvas.getByRole('heading', { name: 'Skills experience chart' }).tagName
    ).toBe('H2');
    canvas.getByRole('list', { name: 'Skills experience chart' });
    await expect(
      canvas.getByText('Chart showing programming language experience levels')
        .tagName
    ).toBe('FIGCAPTION');
    await expect(canvas.queryByLabelText('Order by:')).toBeNull();

    const items = canvas.getAllByRole('listitem');
    await expect(items).toHaveLength(5);
    await expect(items[0]).toHaveTextContent('1500 XP in Python');
    await expect(items[0]).toHaveTextContent('1,500 XP');
    await expect(items[2]).toHaveTextContent('800 XP in HTML/CSS');

    await expect(canvas.getAllByTestId('background-bar')).toHaveLength(5);
    await expect(canvas.queryAllByTestId('foreground-bar')).toHaveLength(0);

    const [, fullBar, htmlBar] = canvas.getAllByTestId('background-bar');
    const trackWidth = fullBar.parentElement!.getBoundingClientRect().width;
    await expect(
      fullBar.getBoundingClientRect().width / trackWidth
    ).toBeCloseTo(1, 1);
    await expect(
      htmlBar.getBoundingClientRect().width / trackWidth
    ).toBeCloseTo(0.4, 1);

    const barLefts = canvas
      .getAllByTestId('background-bar')
      .map((bar) => bar.getBoundingClientRect().left);
    await expect(new Set(barLefts).size).toBe(1);

    for (const tick of ['0', '400', '800', '1.2K', '1.6K', '2K']) {
      await expect(canvas.getByText(tick)).toBeVisible();
    }
    const [, pythonSideLabel] = within(items[0]).getAllByText('Python');
    await expect(pythonSideLabel).toBeVisible();

    await expectRowOrder(canvasElement, [
      'Python',
      'JavaScript',
      'HTML/CSS',
      'SQL',
      'React',
    ]);

    await userEvent.tab();
    await expect(canvasElement).not.toContainElement(
      document.activeElement as HTMLElement
    );
  },
};

export const NarrowContainer: Story = {
  args: {
    barValues: simpleBarData,
    title: 'Skills chart in a narrow container',
    description: 'Labels and values sit above each bar below 480px',
  },
  render: (args) => (
    <Box width={320}>
      <BarChart {...args} />
    </Box>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('2K')).not.toBeVisible();

    const [python] = canvas.getAllByRole('listitem');
    const [stackedLabel, sideLabel] = within(python).getAllByText('Python');
    await expect(stackedLabel).toBeVisible();
    await expect(sideLabel).not.toBeVisible();
    await expect(within(python).getAllByText('1,500 XP')[0]).toBeVisible();
  },
};

export const ValuesOutsideScale: Story = {
  args: {
    barValues: [
      { categoryLabel: 'Python', seriesOneValue: 2500 },
      { categoryLabel: 'SQL', seriesOneValue: 1000 },
      { categoryLabel: 'Rust', seriesOneValue: 0 },
    ],
    title: 'Skills chart with out-of-range values',
    description: 'Values above the scale fill the bar; zero still shows a bar',
  },
  play: async ({ canvas }) => {
    const bars = canvas.getAllByTestId('background-bar');
    const trackWidth = bars[0].parentElement!.getBoundingClientRect().width;
    const ratios = bars.map(
      (bar) => bar.getBoundingClientRect().width / trackWidth
    );

    await expect(ratios[0]).toBeCloseTo(1, 1);
    await expect(ratios[1]).toBeCloseTo(0.5, 1);
    await expect(ratios[2]).toBeCloseTo(0.08, 1);
    await expect(canvas.getAllByRole('listitem')[0]).toHaveTextContent(
      '2,500 XP'
    );
  },
};

export const WithoutUnit: Story = {
  args: {
    barValues: simpleBarData,
    unit: '',
    title: 'Skills chart without a unit',
    description: 'Values render as plain numbers',
  },
  play: async ({ canvas }) => {
    const [python] = canvas.getAllByRole('listitem');
    await expect(within(python).getByText('1500 in Python').textContent).toBe(
      '1500 in Python'
    );
    await expect(within(python).getAllByText('1,500')[0].textContent).toBe(
      '1,500'
    );
    await expect(python).not.toHaveTextContent('XP');
  },
};

export const Stacked: Story = {
  args: {
    barValues: stackedBarData,
    title: 'Skills progress chart',
    description: 'Progress toward total goals for each programming language',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByTestId('background-bar')).toHaveLength(5);
    await expect(canvas.getAllByTestId('foreground-bar')).toHaveLength(5);

    const [python, javascript] = canvas.getAllByRole('listitem');
    await expect(python).toHaveTextContent(
      'Starting value - 200 XP. 1300 XP gained - now at 1500 XP in Python'
    );
    await expect(python).toHaveTextContent('200 XP');
    await expect(python).toHaveTextContent('1,500 XP');

    for (const label of within(javascript).getAllByText('JavaScript')) {
      await expect(label.previousElementSibling?.tagName).toBe('svg');
    }
    for (const label of within(python).getAllByText('Python')) {
      await expect(label.previousElementSibling).toBeNull();
    }
  },
};

export const WithIcons: Story = {
  args: {
    barValues: barDataWithIcons,
    title: 'Skills progress with icons',
    description: 'Skills progress with visual icons for each category',
  },
};

export const Animated: Story = {
  args: {
    barValues: stackedBarData,
    animate: true,
    title: 'Animated skills chart',
    description: 'Animated chart showing progress with entrance animations',
  },
  play: async ({ canvas }) => {
    const [pythonTotal] = canvas.getAllByTestId('background-bar');
    const [pythonProgress] = canvas.getAllByTestId('foreground-bar');

    await waitFor(() => expect(pythonTotal.style.width).toBe('75%'));
    await waitFor(() => expect(pythonProgress.style.width).toBe('10%'));
  },
};

export const Interactive: Story = {
  args: {
    barValues: simpleBarData.map((bar) => ({ ...bar, onClick: onBarClick })),
    title: 'Interactive skills chart',
    description: 'Click on any row to view detailed course information',
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(5);

    const python = canvas.getByRole('button', { name: '1500 XP in Python' });
    await expect(canvas.getAllByRole('listitem')[0]).not.toHaveTextContent(
      '1500 XP in Python'
    );

    await userEvent.click(python);
    await expect(onBarClick).toHaveBeenCalledTimes(1);

    python.focus();
    await userEvent.keyboard('{Enter}');
    await expect(onBarClick).toHaveBeenCalledTimes(2);
  },
};

export const WithLinks: Story = {
  args: {
    barValues: simpleBarData.map((bar) => ({
      ...bar,
      href: `#${bar.categoryLabel.toLowerCase().replace(/\s+/g, '-')}`,
    })),
    sortFns: ['none', 'alphabetically'],
    title: 'Skills chart with links',
    description: 'Each row links to its corresponding course page',
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(5);
    await expect(canvas.queryByRole('button')).toBeNull();
    await expect(
      canvas.getByRole('link', { name: '1500 XP in Python' })
    ).toHaveAttribute('href', '#python');
    await expect(canvas.getAllByRole('listitem')[0]).not.toHaveTextContent(
      '1500 XP in Python'
    );

    const select = canvas.getByLabelText('Order by:');
    await userEvent.selectOptions(select, 'Label (Z-A)');
    select.focus();
    for (const name of [
      '600 XP in SQL',
      '450 XP in React',
      '1500 XP in Python',
      '2000 XP in JavaScript',
      '800 XP in HTML/CSS',
    ]) {
      await userEvent.tab();
      await expect(canvas.getByRole('link', { name })).toHaveFocus();
    }
  },
};

export const WithLinksAndClickHandlers: Story = {
  args: {
    barValues: simpleBarData.map((bar) => ({
      ...bar,
      href: `#${bar.categoryLabel.toLowerCase()}`,
      onClick: (event: MouseEvent) => {
        event.preventDefault();
        onBarClick(bar.categoryLabel);
      },
    })),
    title: 'Skills chart with tracked links',
    description: 'Each row is a link that also runs a click handler',
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByRole('button')).toBeNull();

    await userEvent.click(canvas.getByRole('link', { name: '600 XP in SQL' }));
    await expect(onBarClick).toHaveBeenCalledWith('SQL');
  },
};

export const WithVisualTitleAndDescription: Story = {
  args: {
    barValues: simpleBarData,
    title: 'Programming Skills Overview',
    description:
      'Experience points earned across different programming languages',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Programming Skills Overview' })
    ).toBeVisible();
    await expect(
      canvas.getByText(
        'Experience points earned across different programming languages'
      )
    ).toBeVisible();
  },
};

export const WithHiddenTitleAndSorting: Story = {
  args: {
    barValues: simpleBarData,
    hideTitle: true,
    sortFns: ['numerically', 'none'],
    title: 'Programming Skills Overview',
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(
      canvas.getByText('Programming Skills Overview')
    ).toHaveAttribute('hidden');
    canvas.getByRole('list', { name: 'Programming Skills Overview' });

    const select = canvas.getByLabelText('Order by:');
    await expect(select).toBeVisible();
    await userEvent.selectOptions(select, 'Value (Low-High)');
    await expectRowOrder(canvasElement, [
      'React',
      'SQL',
      'HTML/CSS',
      'Python',
      'JavaScript',
    ]);
  },
};

export const WithHiddenTitleAndDescription: Story = {
  args: {
    barValues: simpleBarData,
    description:
      'Experience points earned across different programming languages',
    hideDescription: true,
    hideTitle: true,
    title: 'Programming Skills Overview',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('Programming Skills Overview')
    ).toHaveAttribute('hidden');
    await expect(
      canvas.getByText(
        'Experience points earned across different programming languages'
      )
    ).toHaveAttribute('hidden');
    canvas.getByRole('list', { name: 'Programming Skills Overview' });
  },
};

export const WithTitleHeadingLevel: Story = {
  args: {
    barValues: simpleBarData,
    title: { as: 'h3', title: 'Programming Skills Overview' },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('heading', { name: 'Programming Skills Overview' })
        .tagName
    ).toBe('H3');
    canvas.getByRole('list', { name: 'Programming Skills Overview' });
  },
};

export const WithExternalTitle: Story = {
  render: () => (
    <>
      <Box
        as="h2"
        bg="background-selected"
        border={1}
        borderRadius="lg"
        id="external-chart-title"
        p={16}
        textAlign="right"
      >
        Programming Skills Overview
      </Box>
      <BarChart
        aria-labelledby="external-chart-title"
        barValues={simpleBarData}
        description="Experience points earned across different programming languages"
        hideDescription={false}
        maxScaleValue={2000}
        unit="XP"
      />
    </>
  ),
  play: async ({ canvas }) => {
    canvas.getByRole('list', { name: 'Programming Skills Overview' });
    await expect(canvas.getAllByRole('heading')).toHaveLength(1);
  },
};

export const WithSorting: Story = {
  args: {
    barValues: simpleBarData,
    sortFns: ['alphabetically', 'numerically', 'none'],
    title: 'Skills experience chart',
    description: 'Use the dropdown to sort bars by different criteria',
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const select = canvas.getByLabelText('Order by:');
    await expect(select).toHaveValue('none');
    await expectRowOrder(canvasElement, [
      'Python',
      'JavaScript',
      'HTML/CSS',
      'SQL',
      'React',
    ]);

    await userEvent.selectOptions(select, 'Value (Low-High)');
    await expectRowOrder(canvasElement, [
      'React',
      'SQL',
      'HTML/CSS',
      'Python',
      'JavaScript',
    ]);

    await userEvent.selectOptions(select, 'Value (High-Low)');
    await expectRowOrder(canvasElement, [
      'JavaScript',
      'Python',
      'HTML/CSS',
      'SQL',
      'React',
    ]);

    await userEvent.selectOptions(select, 'Label (A-Z)');
    await expectRowOrder(canvasElement, [
      'HTML/CSS',
      'JavaScript',
      'Python',
      'React',
      'SQL',
    ]);

    await userEvent.selectOptions(select, 'Label (Z-A)');
    await expectRowOrder(canvasElement, [
      'SQL',
      'React',
      'Python',
      'JavaScript',
      'HTML/CSS',
    ]);

    await userEvent.selectOptions(select, 'None');
    await expectRowOrder(canvasElement, [
      'Python',
      'JavaScript',
      'HTML/CSS',
      'SQL',
      'React',
    ]);
  },
};

export const WithSortingWithoutNone: Story = {
  args: {
    barValues: simpleBarData,
    sortFns: ['alphabetically'],
    title: 'Skills experience chart',
    description: 'Sorted alphabetically from the first render',
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByLabelText('Order by:')).toHaveValue('label-asc');
    await expect(canvas.queryByRole('option', { name: 'None' })).toBeNull();
    await expectRowOrder(canvasElement, [
      'HTML/CSS',
      'JavaScript',
      'Python',
      'React',
      'SQL',
    ]);
  },
};

export const WithCustomSorting: Story = {
  args: {
    barValues: customSortingBarValues,
    sortFns: [
      'none',
      {
        label: 'Recently Added',
        value: 'recent',
        sortFn: (bars: DatedBar[]) =>
          [...bars].sort(
            (a, b) => b.dateAdded.getTime() - a.dateAdded.getTime()
          ),
      },
      {
        label: 'Oldest First',
        value: 'oldest',
        sortFn: (bars: DatedBar[]) =>
          [...bars].sort(
            (a, b) => a.dateAdded.getTime() - b.dateAdded.getTime()
          ),
      },
    ],
    title: 'Skills chart with date sorting',
    description:
      'Custom sort functions can access additional properties on BarProps, such as dates',
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const select = canvas.getByLabelText('Order by:');

    await userEvent.selectOptions(select, 'Recently Added');
    await expectRowOrder(canvasElement, [
      'TypeScript',
      'React',
      'JavaScript',
      'SQL',
      'Python',
    ]);

    await userEvent.selectOptions(select, 'Oldest First');
    await expectRowOrder(canvasElement, [
      'Python',
      'SQL',
      'JavaScript',
      'React',
      'TypeScript',
    ]);
  },
};

export const CustomStyles: Story = {
  args: {
    barValues: stackedBarData,
    styleConfig: {
      seriesTwoBarColor: 'text',
      seriesOneBarColor: 'primary',
      textColor: 'primary',
      seriesOneLabel: 'feedback-error',
      seriesTwoLabel: 'feedback-success',
    },
    title: 'Custom styled skills chart',
    description: 'Custom color scheme applied to chart elements',
  },
};

export const CustomScale: Story = {
  args: {
    barValues: simpleBarData,
    maxScaleValue: 2000,
    scaleInterval: 250,
    title: 'Skills chart with custom scale',
    description: 'Custom scale intervals for more granular value display',
  },
  play: async ({ canvas }) => {
    ['0', '250', '500', '750', '1K', '1.3K', '1.5K', '1.8K', '2K'].forEach(
      (tick) => canvas.getByText(tick)
    );
    await expect(canvas.queryByText('400')).toBeNull();
  },
};

export const WithStringTranslations: Story = {
  args: {
    barValues: stackedBarData,
    sortFns: ['alphabetically', 'numerically', 'none'],
    title: 'Gráfico de habilidades',
    description: 'Progreso hacia los objetivos totales por lenguaje',
    unit: 'XP',
    translations: {
      locale: 'es',
      sortLabel: 'Ordenar por:',
      sortOptions: {
        none: 'Ninguno',
        labelAsc: 'Etiqueta (A-Z)',
        labelDesc: 'Etiqueta (Z-A)',
        valueAsc: 'Valor (Bajo-Alto)',
        valueDesc: 'Valor (Alto-Bajo)',
      },
      accessibility: {
        stackedBarSummary: (ctx) =>
          `Valor inicial - ${ctx.seriesOneValue} ${ctx.unit}. ${ctx.gained} ${ctx.unit} ganado - ahora en ${ctx.seriesTwoValue} ${ctx.unit} en ${ctx.categoryLabel}`,
        singleValueBarSummary: (ctx) =>
          `${ctx.value} ${ctx.unit} en ${ctx.categoryLabel}`,
      },
    },
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    const select = canvas.getByLabelText('Ordenar por:');
    await expect(select).toHaveValue('none');
    canvas.getByRole('option', { name: 'Ninguno' });
    canvas.getByRole('option', { name: 'Valor (Alto-Bajo)' });

    await expect(canvas.getAllByRole('listitem')[0]).toHaveTextContent(
      'Valor inicial - 200 XP. 1300 XP ganado - ahora en 1500 XP en Python'
    );

    await userEvent.selectOptions(select, 'Etiqueta (Z-A)');
    await expect(canvas.getAllByRole('listitem')[0]).toHaveTextContent(
      'ahora en 600 XP en SQL'
    );

    await userEvent.selectOptions(select, 'Valor (Alto-Bajo)');
    await expectRowOrder(canvasElement, [
      'JavaScript',
      'Python',
      'HTML/CSS',
      'SQL',
      'React',
    ]);
  },
};

export const WithPartialTranslations: Story = {
  args: {
    barValues: simpleBarData,
    sortFns: ['alphabetically', 'none'],
    title: 'Skills experience chart',
    description: 'Only the sort label and number locale are overridden',
    translations: { locale: 'de-DE', sortLabel: 'Sort by:' },
  },
  play: async ({ canvas }) => {
    canvas.getByLabelText('Sort by:');
    await expect(canvas.queryByText('Order by:')).toBeNull();
    canvas.getByRole('option', { name: 'None' });
    canvas.getByRole('option', { name: 'Label (A-Z)' });

    const [python] = canvas.getAllByRole('listitem');
    await expect(python).toHaveTextContent('1.500 XP');
    await expect(python).toHaveTextContent('1500 XP in Python');
  },
};

export const WithFunctionTranslations: Story = {
  args: {
    barValues: accessibilityBarData,
    description:
      'Custom aria-label summaries via translation functions (stacked, link, and non-interactive bars)',
    title: 'Skills experience (accessibility functions)',
    translations: accessibilityTranslations,
    unit: 'XP',
  },
  play: async ({ canvas }) => {
    canvas.getByRole('link', {
      name: '1800 XP gained — now at 2000 XP in JavaScript',
    });
    canvas.getByRole('link', { name: '550 XP in SQL' });

    const items = canvas.getAllByRole('listitem');
    await expect(items[0]).toHaveTextContent(
      '200 XP gained — now at 1500 XP in Python'
    );
    await expect(items[4]).toHaveTextContent('400 XP in Rust');
  },
};
