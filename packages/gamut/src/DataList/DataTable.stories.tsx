import { MiniKebabMenuIcon } from '@skillsoft/gamut-icons';
import { Background } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, fn, screen, waitFor, within } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { Box } from '../Box';
import { IconButton } from '../Button';
import { Menu, MenuItem } from '../Menu';
import { Dialog } from '../Modals';
import { PopoverContainer } from '../PopoverContainer';
import { Text } from '../Typography';
import { DataTable } from './DataTable';
import {
  createDemoTable,
  CustomEmptyState,
  DisableContainerQueryExample,
  shipFilters,
  simpleColumns,
  simpleRows,
} from './testUtils';
import type { ColumnConfig } from './types';

const crewRows = [
  {
    name: 'Jean Luc Picard',
    'a very important role': 'Captain',
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
    'a very important role': 'Deus Ex Machina',
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
    'a very important role': 'Chief Engineer / Rascal',
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
    'a very important role': 'Lt. Commander / Scamp',
    ship: 'He is a ship',
    age: '30',
    species: 'Soong-type Android',
    sector: 'Alpha Quadrant',
    status: 'Active',
    yearsOfService: '26',
    homeworld: 'Omicron Theta',
    specialization: 'Operations & Analysis',
  },
  {
    name: `Miles Edward O'Brien, 24th Century Man`,
    'a very important role': 'Command Master Chief',
    ship: 'Deep Space 9',
    age: '40',
    species: 'Human',
    sector: 'Bajoran System',
    status: 'Active',
    yearsOfService: '22',
    homeworld: 'Ireland, Earth',
    specialization: 'Engineering & Transporter Operations',
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
  {
    header: 'Rank',
    key: 'a very important role',
    size: 'lg',
    sortable: true,
  },
  { header: 'Ship', key: 'ship', size: 'lg', sortable: true },
  { header: 'Age', key: 'age', size: 'sm', sortable: true },
  { header: 'Species', key: 'species', size: 'md', sortable: true },
  { header: 'Sector', key: 'sector', size: 'md', sortable: true },
  { header: 'Status', key: 'status', size: 'sm', sortable: true },
  {
    header: 'Years of Service',
    key: 'yearsOfService',
    size: 'sm',
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

type CrewDataTable = typeof DataTable<CrewRow, 'name', ColumnConfig<CrewRow>[]>;

const meta: TypeWithDeepControls<Meta<CrewDataTable>> = {
  title: 'Data display/DataTable',
  component: DataTable,
  parameters: { deepControls: { enabled: true } },
  args: {
    id: 'crew',
    idKey: 'name',
    query: { sort: { name: 'desc', 'a very important role': 'asc' } },
    rows: crewRows,
    columns: crewColumns,
    spacing: 'condensed',
    onQueryChange: fn(),
  },
  argTypes: {
    spacing: { control: 'radio' },
  },
};

export default meta;
type Story = StoryObj<CrewDataTable>;

const DataTableTemplate = createDemoTable(DataTable, {
  onRowSelect: undefined,
  onRowExpand: undefined,
});

const RowMenu = ({ rowName }: { rowName: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);

  const handleClose = () => setIsOpen(false);

  const handleOpenModal = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  return (
    <Box display="inline-block" p={8} ref={menuButtonRef}>
      <IconButton
        icon={MiniKebabMenuIcon}
        tip="Show options"
        tipProps={{
          alignment: 'left-center',
          placement: 'floating',
        }}
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
      />
      <PopoverContainer
        alignment="bottom-left"
        allowPageInteraction
        closeOnViewportExit
        isOpen={isOpen}
        offset={0}
        targetRef={menuButtonRef}
        onRequestClose={handleClose}
      >
        <Menu borderRadius="md" spacing="normal" variant="popover">
          <MenuItem onClick={handleClose}>
            <Text truncate="ellipsis" truncateLines={1}>
              Edit {rowName}
            </Text>
          </MenuItem>
          <MenuItem onClick={handleClose}>
            <Text truncate="ellipsis" truncateLines={1}>
              Delete {rowName}
            </Text>
          </MenuItem>
          <MenuItem onClick={handleOpenModal}>
            <Text truncate="ellipsis" truncateLines={1}>
              Clone {rowName}
            </Text>
          </MenuItem>
        </Menu>
      </PopoverContainer>
      <Dialog
        cancelCta={{
          children: 'Cancel',
          onClick: () => setIsModalOpen(false),
        }}
        confirmCta={{
          children: 'Clone',
          onClick: () => setIsModalOpen(false),
        }}
        isOpen={isModalOpen}
        size="small"
        title={`Clone ${rowName}`}
        onRequestClose={() => setIsModalOpen(false)}
      >
        Are you sure you want to clone{' '}
        <Text as="span" fontWeight="bold">
          {rowName}{' '}
        </Text>
        ? This action cannot be undone.
      </Dialog>
    </Box>
  );
};

const moreCrewRows: CrewRow[] = [
  ...crewRows,
  {
    name: 'William Riker',
    'a very important role': 'Commander',
    ship: 'USS Enterprise',
    age: '32',
    species: 'Human',
    sector: 'Alpha Quadrant',
    status: 'Active',
    yearsOfService: '15',
    homeworld: 'Alaska, Earth',
    specialization: 'Command & Diplomacy',
  },
  {
    name: 'Deanna Troi',
    'a very important role': 'Counselor',
    ship: 'USS Enterprise',
    age: '28',
    species: 'Human / Betazoid',
    sector: 'Alpha Quadrant',
    status: 'Active',
    yearsOfService: '8',
    homeworld: 'Betazed',
    specialization: 'Psychology & Empathy',
  },
  {
    name: 'Worf',
    'a very important role': 'Security Officer',
    ship: 'USS Enterprise',
    age: '35',
    species: 'Klingon',
    sector: 'Alpha Quadrant',
    status: 'Active',
    yearsOfService: '12',
    homeworld: "Qo'noS",
    specialization: 'Security & Combat',
  },
  {
    name: 'Beverly Crusher',
    'a very important role': 'Chief Medical Officer',
    ship: 'USS Enterprise',
    age: '40',
    species: 'Human',
    sector: 'Alpha Quadrant',
    status: 'Active',
    yearsOfService: '18',
    homeworld: 'Earth',
    specialization: 'Medicine & Research',
  },
  {
    name: 'Tasha Yar',
    'a very important role': 'Security Chief',
    ship: 'USS Enterprise',
    age: '24',
    species: 'Human',
    sector: 'Alpha Quadrant',
    status: 'Deceased',
    yearsOfService: '3',
    homeworld: 'Turkana IV, Earth',
    specialization: 'Security & Tactics',
  },
];

const bodyRows = (canvasElement: HTMLElement) =>
  Array.from(canvasElement.querySelectorAll('tbody tr'));

const firstRowName = (canvasElement: HTMLElement) =>
  bodyRows(canvasElement)[0].querySelector('th, td')?.textContent;

export const Default: Story = {
  args: {},
  play: async ({ canvas, canvasElement }) => {
    // TODO: sort and filter buttons are named from the column key, not the header text
    await expect(bodyRows(canvasElement)).toHaveLength(crewRows.length);
    canvas.getByRole('columnheader', { name: /Rank/ });
    canvas.getByText('Command Master Chief');
    await expect(canvas.queryByRole('checkbox')).toBeNull();
    await expect(canvas.queryByRole('button', { name: /^Expand/ })).toBeNull();

    await expect(
      canvas.getByRole('columnheader', { name: /Name/ })
    ).toHaveAttribute('aria-sort', 'descending');
    await expect(
      canvas.getByRole('columnheader', { name: /Rank/ })
    ).toHaveAttribute('aria-sort', 'ascending');
  },
};

export const FullDataTable: Story = {
  render: () => <DataTableTemplate />,
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByRole('columnheader', { name: 'Controls' })
    ).not.toHaveAttribute('aria-sort');

    await userEvent.click(
      canvas.getByRole('button', { name: 'filter by ship' })
    );
    const menu = await screen.findByRole('list');
    await expect(
      within(menu).getByRole('checkbox', { name: 'Select All ship' })
    ).toBeChecked();
    for (const ship of shipFilters) {
      await expect(
        within(menu).getByRole('checkbox', { name: ship })
      ).toBeChecked();
    }

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('list')).toBeNull());
  },
};

export const EmptyState: Story = {
  args: {
    rows: [],
    shadow: true,
    scrollable: true,
    height: '45vh',
    minHeight: '300px',
  },
  play: async ({ args, canvas, userEvent }) => {
    canvas.getByText('No Results Found');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reset Filters' })
    );
    await expect(args.onQueryChange).toHaveBeenLastCalledWith({
      type: 'reset',
    });
  },
};

export const EmptyStateCustom: Story = {
  args: {
    rows: [],
    shadow: true,
    scrollable: true,
    height: '45vh',
    minHeight: '300px',
    emptyMessage: <CustomEmptyState />,
  },
  play: async ({ canvas }) => {
    canvas.getByText('Nothing to see here!');
    await expect(canvas.queryByText('No Results Found')).toBeNull();
  },
};

export const LoadingRows: Story = {
  args: { loading: true, shadow: true },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText('Loading data')).toHaveLength(
      crewRows.length
    );
    await expect(canvas.queryByText('Command & Diplomacy')).toBeNull();
  },
};

export const Scrollable: Story = {
  args: {
    shadow: true,
    scrollable: true,
    height: '400px',
    wrapperWidth: '800px',
  },
  play: async ({ canvas }) => {
    // TODO: wrapperWidth doesn't constrain DataTable, since a table treats width as a minimum
    await expect(canvas.getByTestId('scrollable-crew')).toHaveStyle({
      maxWidth: '800px',
    });
  },
};

export const BackgroundColors: Story = {
  args: {},
  render: (args) => (
    <Background bg="paleBlue" p={8}>
      <DataTable {...args} />
    </Background>
  ),
};

export const DisableContainerQuery: Story = {
  args: {},
  render: () => (
    <DisableContainerQueryExample
      componentName="DataTable"
      defaultComponent={
        <DataTable
          columns={simpleColumns}
          id="default-table-query"
          idKey="name"
          rows={simpleRows}
          spacing="condensed"
        />
      }
      disabledComponent={
        <DataTable
          columns={simpleColumns}
          disableContainerQuery
          id="disabled-table-query"
          idKey="name"
          rows={simpleRows}
          spacing="condensed"
        />
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(
      getComputedStyle(canvasElement.querySelector('#default-table-query')!)
        .containerType
    ).toBe('inline-size');
    await expect(
      getComputedStyle(canvasElement.querySelector('#disabled-table-query')!)
        .containerType
    ).toBe('normal');
  },
};

export const WithFloatingMenu: Story = {
  args: {
    id: 'crew-with-menu',
    rows: moreCrewRows,
    columns: [
      ...crewColumns,
      {
        header: 'Actions',
        key: 'name',
        size: 'sm',
        justify: 'right',
        type: 'control',
        render: (row) => <RowMenu rowName={String(row.name)} />,
      },
    ],
    shadow: true,
    scrollable: true,
    height: '400px',
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getAllByRole('button', { name: 'Show options' })[0]
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Clone Jean Luc Picard' })
    );
    const dialog = await screen.findByRole('dialog');
    within(dialog).getByText('Clone Jean Luc Picard');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    const wrapper = canvas.getByTestId('scrollable-crew-with-menu')
      .parentElement!;
    await waitFor(() =>
      expect(getComputedStyle(wrapper).backgroundSize).toBe('124px 100%')
    );

    const headerGroup = canvas.getAllByRole('rowgroup')[0];
    await expect(wrapper.scrollHeight).toBeGreaterThan(wrapper.clientHeight);
    wrapper.scrollTop = 100;
    await waitFor(() => expect(wrapper.scrollTop).toBe(100));
    await expect(headerGroup.getBoundingClientRect().top).toBe(
      wrapper.getBoundingClientRect().top
    );

    const nameCell = canvas.getByText('Data').closest('th')!;
    const nameLeft = nameCell.getBoundingClientRect().left;
    wrapper.scrollLeft = 300;
    await waitFor(() => expect(wrapper.scrollLeft).toBe(300));
    await expect(
      Math.abs(nameCell.getBoundingClientRect().left - nameLeft)
    ).toBeLessThanOrEqual(1);

    wrapper.scrollLeft = wrapper.scrollWidth;
    await waitFor(() =>
      expect(getComputedStyle(wrapper).backgroundSize).toBe('0px 100%')
    );
  },
};

export const LocalSorting: Story = {
  render: () => <DataTableTemplate />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    /*
     * TODO: clearing a sort leaves rows in ascending order instead of the original order.
     * Sorting a second column also clears the first column's sort.
     */
    const nameHeader = canvas.getByRole('columnheader', { name: /Name/ });
    const sortByName = canvas.getByRole('button', { name: 'sort by name' });
    await expect(firstRowName(canvasElement)).toBe('Jean Luc Picard');

    await userEvent.click(sortByName);
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    await expect(firstRowName(canvasElement)).toBe('Barclay');

    await userEvent.click(sortByName);
    await expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    await expect(firstRowName(canvasElement)).toBe('Worf');

    await userEvent.click(sortByName);
    await expect(nameHeader).toHaveAttribute('aria-sort', 'none');

    sortByName.focus();
    await userEvent.keyboard('{Enter}');
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');

    await userEvent.click(canvas.getByRole('button', { name: 'sort by role' }));
    await expect(
      canvas.getByRole('columnheader', { name: /Rank/ })
    ).toHaveAttribute('aria-sort', 'ascending');
  },
};

export const LocalFiltering: Story = {
  render: () => <DataTableTemplate />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // TODO: filtering a second column clears the first column's filter
    const filterByShip = canvas.getByRole('button', { name: 'filter by ship' });
    await userEvent.click(filterByShip);
    const shipMenu = await screen.findByRole('list');
    await expect(shipMenu).toContainElement(
      shipMenu.ownerDocument.activeElement as HTMLElement
    );

    await userEvent.click(
      within(shipMenu).getByRole('checkbox', { name: 'USS Enterprise' })
    );
    await expect(
      within(shipMenu).getByRole('checkbox', { name: 'Select All ship' })
    ).not.toBeChecked();
    await expect(bodyRows(canvasElement)).toHaveLength(7);
    await expect(canvas.queryByText('Jean Luc Picard')).toBeNull();

    await userEvent.click(
      within(shipMenu).getByRole('checkbox', { name: 'Select All ship' })
    );
    await expect(bodyRows(canvasElement)).toHaveLength(12);
    await expect(
      within(shipMenu).getByRole('checkbox', { name: 'USS Enterprise' })
    ).toBeChecked();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('list')).toBeNull());
    await expect(filterByShip).toHaveFocus();

    await userEvent.click(
      canvas.getByRole('button', { name: 'filter by species' })
    );
    await userEvent.click(
      within(await screen.findByRole('list')).getByRole('checkbox', {
        name: 'Human',
      })
    );
    await expect(canvas.queryByText('Beverly Crusher')).toBeNull();
    await userEvent.keyboard('{Escape}');
  },
};

export const ResetFilters: Story = {
  render: () => <DataTableTemplate />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'filter by ship' })
    );
    const shipMenu = await screen.findByRole('list');
    for (const ship of shipFilters) {
      await userEvent.click(
        within(shipMenu).getByRole('checkbox', { name: ship })
      );
    }
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('list')).toBeNull());

    canvas.getByText('No Results Found');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reset Filters' })
    );
    await expect(bodyRows(canvasElement)).toHaveLength(12);
    await expect(canvas.queryByText('No Results Found')).toBeNull();
  },
};

export const RowActions: Story = {
  render: () => <DataTableTemplate />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getAllByRole('button', { name: 'Show options' })[0]
    );
    await userEvent.click(
      await screen.findByRole('button', { name: 'Arrest Jean Luc Picard' })
    );

    const dialog = await screen.findByRole('dialog');
    within(dialog).getByText('Arrest Crew Member');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Arrest' })
    );
    within(dialog).getByText('Jean Luc Picard has been arrested successfully.');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Close' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};

export const LoadingWithoutRows: Story = {
  args: { loading: true, rows: [] },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getAllByText('Loading data')).toHaveLength(5);
    await expect(bodyRows(canvasElement)).toHaveLength(5);
    await expect(canvas.queryByText('No Results Found')).toBeNull();
  },
};

const ScrollToTopTemplate = createDemoTable(DataTable, {
  height: 200,
  onRowExpand: undefined,
  onRowSelect: undefined,
  scrollToTopOnUpdate: true,
});

export const ScrollToTopOnUpdate: Story = {
  render: () => <ScrollToTopTemplate />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    // TODO: scrollToTopOnUpdate scrolls the table element, not the wrapper that actually scrolls
    const wrapper = canvas.getByTestId('scrollable-example').parentElement!;
    wrapper.scrollTop = 150;
    await waitFor(() => expect(wrapper.scrollTop).toBe(150));

    await userEvent.click(canvas.getByRole('button', { name: 'sort by name' }));
    await expect(firstRowName(canvasElement)).toBe('Barclay');
  },
};
