import styled from '@emotion/styled';
import { css } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';

import { Column, type ColumnProps, LayoutGrid } from '.';

const Example = styled.div(
  css({
    minHeight: '3rem',
    bg: 'navy',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })
);

const columns = [
  { size: 12 },
  ...new Array(2).fill({ size: 6 }),
  ...new Array(3).fill({ size: 4 }),
  ...new Array(4).fill({ size: 3 }),
  ...new Array(6).fill({ size: 2 }),
  ...new Array(12).fill({ size: 1 }),
];

const gapColumns = [
  { size: 12 },
  ...new Array(2).fill({ size: 6 }),
  ...new Array(3).fill({ size: 4 }),
];

const rowColumns = new Array(12).fill({ size: 3 });

const offsetColumns = [
  { offset: 2, size: 4 },
  { size: 2 },
  { size: 2 },
  { size: 4 },
  { size: 8 },
  { offset: { _: 6, md: 4, lg: 2 }, size: 6 },
  { offset: { _: 0, md: 4 }, size: 6 },
];

const rowspanColumns = [
  new Array(12).fill({ size: 3 }),
  {
    3: 3,
    2: 2,
    4: 3,
    0: 4,
  },
] as const;

const renderColumnChildren = (
  arr: { size: ColumnProps['size']; offset?: ColumnProps['offset'] }[],
  id: string,
  span?: Record<number, ColumnProps['rowspan']>
) =>
  arr.map((props, i) => (
    <Column
      key={`${id}-${i * 1}`}
      {...props}
      rowspan={span ? span[i] : undefined}
    >
      <Example>
        {props?.size !== undefined &&
        props.size !== null &&
        (typeof props.size === 'string' || typeof props.size === 'number')
          ? String(props.size)
          : ''}
      </Example>
    </Column>
  ));

const gapOptions = [8, 16, 24, 32, 48] as const;

const meta: Meta<typeof LayoutGrid> = {
  title: 'Containers/LayoutGrid',
  component: LayoutGrid,
  args: { gap: 24 },
  argTypes: {
    gap: {
      control: 'radio',
      options: gapOptions,
      table: { type: { summary: gapOptions.join(' | ') } },
    },
  },
};

export default meta;

type Story = StoryObj<typeof LayoutGrid>;

export const Default: Story = {
  render: ({ gap }) => (
    <LayoutGrid gap={gap}>
      {renderColumnChildren(columns, 'rowspan')}
    </LayoutGrid>
  ),
};

export const GridGap: Story = {
  render: ({ gap }) => (
    <LayoutGrid gap={gap}>
      {renderColumnChildren(gapColumns, 'grid-gap')}
    </LayoutGrid>
  ),
};

export const RowHeight: Story = {
  render: ({ gap }) => (
    <LayoutGrid gap={gap} rowHeight="75">
      {renderColumnChildren(rowColumns, 'row-height')}
    </LayoutGrid>
  ),
};

export const Offset: Story = {
  render: ({ gap }) => (
    <LayoutGrid gap={gap} rowHeight="75">
      {renderColumnChildren(offsetColumns as any, 'offset')}
    </LayoutGrid>
  ),
};

export const Rowspans: Story = {
  render: ({ gap }) => (
    <LayoutGrid gap={gap} rowHeight="75">
      {renderColumnChildren(rowspanColumns[0], 'rowspan', rowspanColumns[1])}
    </LayoutGrid>
  ),
};
