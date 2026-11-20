import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor, within } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { FlexBox } from '../Box';
import { DataList } from './DataList';
import { DataTable } from './DataTable';
import {
  cols,
  createDemoTable,
  CustomEmptyState,
  DisableContainerQueryExample,
  simpleColumns,
  simpleRows,
} from './testUtils';
import type { ColumnConfig } from './types';

const crewRows = [
  {
    name: 'Jean Luc Picard',
    role: 'Captain',
    ship: 'USS Enterprise',
    age: '59',
    species: 'Human',
    sector: 'Alpha Quadrant',
    status: 'Active',
    yearsOfService: '35',
    homeworld: 'La Barre, France, Earth',
    specialization: 'Command & Diplomacy',
  },
  {
    name: 'Wesley Crusher',
    role: 'Deus Ex Machina',
    ship: 'USS Enterprise',
    age: '18',
    species: 'Human/Traveler',
    sector: 'Multiple Dimensions',
    status: 'Transcended',
    yearsOfService: '2',
    homeworld: 'Earth',
    specialization: 'Space-Time Manipulation',
  },
  {
    name: 'Geordie LaForge',
    role: 'Chief Engineer / Rascal',
    ship: 'Borg Cube',
    age: '35',
    species: 'Human',
    sector: 'Alpha Quadrant',
    status: 'Active',
    yearsOfService: '15',
    homeworld: 'Mogadishu, Somalia, Earth',
    specialization: 'Engineering & Technology',
  },
  {
    name: 'Data',
    role: 'Lt. Commander / Scamp',
    ship: 'He is a ship',
    age: '30',
    species: 'Soong-type Android',
    sector: 'Alpha Quadrant',
    status: 'Active',
    yearsOfService: '26',
    homeworld: 'Omicron Theta',
    specialization: 'Operations & Analysis',
  },
];

type CrewRow = (typeof crewRows)[number];

const crewColumns: ColumnConfig<CrewRow>[] = [
  {
    header: 'Name',
    key: 'name',
    size: 'lg',
    type: 'header',
    sortable: true,
  },
  { header: 'Rank', key: 'role', size: 'lg', sortable: true },
  { header: 'Ship', key: 'ship', size: 'lg', sortable: true },
  { header: 'Age', key: 'age', size: 'sm', sortable: true },
  { header: 'Species', key: 'species', size: 'md', sortable: true },
  { header: 'Sector', key: 'sector', size: 'md', sortable: true },
  { header: 'Status', key: 'status', size: 'sm', sortable: true },
  {
    header: 'Years of service',
    key: 'yearsOfService',
    size: 'md',
    sortable: true,
  },
  { header: 'Homeworld', key: 'homeworld', size: 'lg', sortable: true },
  {
    header: 'Specialization',
    key: 'specialization',
    size: 'xl',
    sortable: true,
    fill: true,
  },
];

type CrewDataList = typeof DataList<CrewRow, 'name', ColumnConfig<CrewRow>[]>;
const onEmptyQueryChange = fn();

const meta: TypeWithDeepControls<Meta<CrewDataList>> = {
  title: 'Data display/DataList',
  component: DataList,
  parameters: { deepControls: { enabled: true } },
  args: {
    id: 'crew',
    idKey: 'name',
    query: { sort: { name: 'desc', role: 'asc' } },
    rows: crewRows,
    columns: crewColumns,
    header: false,
    spacing: 'condensed',
    onQueryChange: fn(),
    onRowSelect: fn(),
    onRowExpand: fn(),
    expandedContent: ({ row }) => (
      <FlexBox borderColor="background-hover" borderTop={1} p={16} pl={[0, 64]}>
        <DataTable
          columns={[
            { key: 'name', size: 'md' },
            { key: 'text', size: 'lg' },
          ]}
          id={String(row.name)}
          idKey="id"
          rows={[
            { id: 1, name: 'Sub Row 1', text: 'Ooo very cool' },
            { id: 2, name: 'Sub Row 2', text: 'Ooo very cool' },
            { id: 3, name: 'Sub Row 3', text: 'Ooo very cool' },
          ]}
        />
      </FlexBox>
    ),
  },
  argTypes: {
    spacing: { control: 'radio' },
    variant: { control: 'radio' },
  },
};

export default meta;
type Story = StoryObj<CrewDataList>;

const DataListTemplate = createDemoTable(DataList, {
  scrollable: false,
  height: 'auto',
  showOverflow: true,
});

export const Default: Story = {
  args: {},
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.queryByRole('columnheader', { name: /Rank/ })
    ).toBeNull();
    for (const name of ['Jean Luc Picard', 'Wesley Crusher', 'Data']) {
      canvas.getByText(name);
    }
    canvas.getByText('Command & Diplomacy');

    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select Data' })
    );
    await expect(args.onRowSelect).toHaveBeenLastCalledWith({
      type: 'select',
      payload: { rowId: 'Data', toggle: false },
    });

    const expandButton = canvas.getByRole('button', {
      name: 'Expand Data Row',
    });
    await expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(expandButton);
    await expect(args.onRowExpand).toHaveBeenLastCalledWith({
      type: 'expand',
      payload: { rowId: 'Data', toggle: false },
    });
  },
};

export const FullDataList: Story = {
  render: () => <DataListTemplate />,
  play: async ({ canvas, userEvent }) => {
    const selectAll = canvas.getByRole('checkbox', { name: 'Select All' });
    const picard = canvas.getByRole('checkbox', {
      name: 'Select Jean Luc Picard',
    });

    await userEvent.click(picard);
    await expect(picard).toBeChecked();
    await expect(selectAll).not.toBeChecked();

    await userEvent.click(selectAll);
    for (const checkbox of canvas.getAllByRole('checkbox')) {
      await expect(checkbox).toBeChecked();
    }

    await userEvent.click(selectAll);
    for (const checkbox of canvas.getAllByRole('checkbox')) {
      await expect(checkbox).not.toBeChecked();
    }

    picard.focus();
    await userEvent.keyboard(' ');
    await expect(picard).toBeChecked();

    const expandButton = canvas.getByRole('button', {
      name: 'Expand Jean Luc Picard Row',
    });
    await userEvent.click(expandButton);
    await expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    within(canvas.getByRole('region')).getByText('Nothing to see here');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Get me out of here!' })
    );
    await expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.queryByRole('region')).toBeNull());
  },
};

export const Expanded: Story = {
  args: {
    expanded: ['Data'],
  },
  play: async ({ args, canvas, userEvent }) => {
    const region = canvas.getByRole('region');
    await expect(within(region).getAllByText('Ooo very cool')).toHaveLength(3);

    const expandButton = canvas.getByRole('button', { expanded: true });
    await expect(expandButton).toHaveAccessibleName('Expand Data Row');
    await userEvent.click(expandButton);
    await expect(args.onRowExpand).toHaveBeenLastCalledWith({
      type: 'expand',
      payload: { rowId: 'Data', toggle: true },
    });
  },
};

export const Selected: Story = {
  args: {
    selected: ['Data'],
  },
  play: async ({ args, canvas, userEvent }) => {
    const selectedCheckbox = canvas.getByRole('checkbox', {
      name: 'Select Data',
    });
    await expect(selectedCheckbox).toBeChecked();
    await expect(
      canvas.getByRole('checkbox', { name: 'Select Wesley Crusher' })
    ).not.toBeChecked();

    await userEvent.click(selectedCheckbox);
    await expect(args.onRowSelect).toHaveBeenLastCalledWith({
      type: 'select',
      payload: { rowId: 'Data', toggle: true },
    });

    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Select Wesley Crusher' })
    );
    await expect(args.onRowSelect).toHaveBeenLastCalledWith({
      type: 'select',
      payload: { rowId: 'Wesley Crusher', toggle: false },
    });
  },
};

export const EmptyState: Story = {
  render: () => (
    <DataList
      columns={cols}
      height="45vh"
      id="crew"
      idKey="name"
      minHeight="300px"
      rows={[]}
      spacing="condensed"
      onQueryChange={onEmptyQueryChange}
      onRowSelect={fn()}
    />
  ),
  play: async ({ canvas, userEvent }) => {
    onEmptyQueryChange.mockClear();
    canvas.getByText('No Results Found');
    canvas.getByText('Remove filters to view');
    await expect(
      canvas.getByRole('checkbox', { name: 'Select All' })
    ).toBeDisabled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Reset Filters' })
    );
    await expect(onEmptyQueryChange).toHaveBeenLastCalledWith({
      type: 'reset',
    });
  },
};

export const EmptyStateCustom: Story = {
  render: () => (
    <DataList
      columns={cols}
      emptyMessage={<CustomEmptyState />}
      height="45vh"
      id="crew"
      idKey="name"
      minHeight="300px"
      rows={[]}
      spacing="condensed"
      onRowSelect={fn()}
    />
  ),
  play: async ({ canvas }) => {
    canvas.getByText('Nothing to see here!');
    await expect(canvas.queryByText('No Results Found')).toBeNull();
  },
};

export const NonSelectable: Story = {
  args: {
    onRowSelect: undefined,
    onRowExpand: undefined,
    expandedContent: undefined,
    header: true,
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(canvas.queryByRole('checkbox')).toBeNull();
    await expect(canvas.queryByRole('button', { name: /^Expand/ })).toBeNull();

    await expect(
      canvas.getByRole('columnheader', { name: /Name/ })
    ).toHaveAttribute('aria-sort', 'descending');
    await expect(
      canvas.getByRole('columnheader', { name: /Rank/ })
    ).toHaveAttribute('aria-sort', 'ascending');
    await expect(
      canvas.getByRole('columnheader', { name: /Ship/ })
    ).toHaveAttribute('aria-sort', 'none');

    await userEvent.click(canvas.getByRole('button', { name: 'sort by name' }));
    await expect(args.onQueryChange).toHaveBeenLastCalledWith({
      type: 'sort',
      payload: { dimension: 'name', value: 'none' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'sort by role' }));
    await expect(args.onQueryChange).toHaveBeenLastCalledWith({
      type: 'sort',
      payload: { dimension: 'role', value: 'desc' },
    });
    await userEvent.click(canvas.getByRole('button', { name: 'sort by ship' }));
    await expect(args.onQueryChange).toHaveBeenLastCalledWith({
      type: 'sort',
      payload: { dimension: 'ship', value: 'asc' },
    });
  },
};

export const DisableContainerQuery: Story = {
  args: {},
  render: () => (
    <DisableContainerQueryExample
      componentName="DataList"
      defaultComponent={
        <DataList
          columns={simpleColumns}
          header
          id="default-container-query"
          idKey="name"
          rows={simpleRows}
          spacing="condensed"
        />
      }
      disabledComponent={
        <DataList
          columns={simpleColumns}
          disableContainerQuery
          id="disabled-container-query"
          idKey="name"
          rows={simpleRows}
          spacing="condensed"
        />
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      getComputedStyle(canvasElement.querySelector('#default-container-query')!)
        .containerType
    ).toBe('inline-size');
    await expect(
      getComputedStyle(
        canvasElement.querySelector('#disabled-container-query')!
      ).containerType
    ).toBe('normal');
  },
};

export const HideSelectAll: Story = {
  args: { header: true, hideSelectAll: true },
  play: async ({ canvas }) => {
    await expect(
      canvas.queryByRole('checkbox', { name: 'Select All' })
    ).toBeNull();
    await expect(canvas.getAllByRole('checkbox')).toHaveLength(crewRows.length);
  },
};

export const MultipleExpanded: Story = {
  args: { expanded: ['Data', 'Wesley Crusher'] },
  parameters: {
    a11y: {
      config: { rules: [{ id: 'landmark-unique', enabled: false }] },
    },
  },
  play: async ({ canvas }) => {
    // TODO: expanded rows render unnamed region landmarks, so several open rows aren't distinguishable
    await expect(canvas.getAllByRole('region')).toHaveLength(2);
    await expect(
      canvas.getAllByRole('button', { expanded: true })
    ).toHaveLength(2);
  },
};

export const CardVariant: Story = {
  args: { header: true, variant: 'card' },
  play: async ({ canvas }) => {
    canvas.getByRole('table');
    canvas.getByRole('columnheader', { name: /Rank/ });
    await expect(canvas.getAllByRole('checkbox')).toHaveLength(
      crewRows.length + 1
    );
  },
};
