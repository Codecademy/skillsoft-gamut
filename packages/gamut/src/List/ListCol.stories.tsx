import {
  MiniDeleteIcon,
  MiniKebabMenuIcon,
  StarIcon,
  StreakIcon,
  TrophyIcon,
} from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';

import { Box } from '../Box';
import { FillButton, IconButton } from '../Button';
import { Text } from '../Typography';
import { List, ListCol, ListRow, TableHeader } from '.';

const meta: Meta<typeof ListCol> = {
  title: 'Data display/List/ListCol',
  component: ListCol,
  args: {},
};

export default meta;
type ListCompositionStory = StoryObj<typeof List>;

const rows = [
  { name: 'Jean Luc Picard', role: 'Captain', ship: 'USS Enterprise' },
  { name: 'Wesley Crusher', role: 'Deus Ex Machina', ship: 'USS Enterprise' },
  {
    name: 'Geordie LaForge',
    role: 'Chief Engineer / Rascal',
    ship: 'Borg Cube',
  },
  {
    name: 'Data',
    role: 'Lt. Commander / Scamp',
    ship: 'He is a ship',
  },
];

const sizes = ['content', 'sm', 'md', 'lg', 'xl'] as const;

const columnWidth = (cellContent: HTMLElement) =>
  cellContent.parentElement!.getBoundingClientRect().width;

const ScrollingRows = () => (
  <>
    {rows.map(({ name, role, ship }, i, _, key = `example-row-${i}`) => (
      <ListRow key={key}>
        <ListCol size="lg" type="header">
          <Text fontWeight="title" truncate="ellipsis" truncateLines={1}>
            {name}
          </Text>
        </ListCol>
        <ListCol size="lg">
          <Text
            color="text-disabled"
            truncate="ellipsis"
            truncateLines={1}
            variant="p-small"
          >
            {role}
          </Text>
        </ListCol>
        <ListCol fill size="lg">
          <Text
            color="text-disabled"
            truncate="ellipsis"
            truncateLines={1}
            variant="p-small"
          >
            {ship}
          </Text>
        </ListCol>
        <ListCol size="sm">
          <Text color="text-disabled" lineHeight="title" variant="p-small">
            <StreakIcon mr={8} verticalAlign="bottom" />
            87%
          </Text>
        </ListCol>
        <ListCol size="sm">
          <Text color="text-disabled" lineHeight="title" variant="p-small">
            <TrophyIcon mr={8} verticalAlign="bottom" />
            48%
          </Text>
        </ListCol>
        <ListCol size="sm">
          <Text color="text-disabled" lineHeight="title" variant="p-small">
            <StarIcon mr={8} verticalAlign="bottom" />
            66%
          </Text>
        </ListCol>
        <ListCol>
          <FillButton size="small">Engage</FillButton>
        </ListCol>
        <ListCol type="control">
          <IconButton
            icon={MiniKebabMenuIcon}
            size="small"
            tip="Options"
            tipProps={{ alignment: 'bottom-center', placement: 'floating' }}
          />
          <IconButton
            icon={MiniDeleteIcon}
            size="small"
            tip="Delete"
            tipProps={{ alignment: 'bottom-center', placement: 'floating' }}
          />
        </ListCol>
      </ListRow>
    ))}
  </>
);

export const ColumnSizing: ListCompositionStory = {
  render: (args) => {
    return (
      <List {...args}>
        {sizes.map((size: 'content' | 'sm' | 'md' | 'lg' | 'xl') => (
          <ListRow key={size}>
            <ListCol size={size}>
              <Box bg="background-selected" flex={1} height={1} p={8}>
                {size}
              </Box>
            </ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
  play: async ({ canvas }) => {
    await expect(columnWidth(canvas.getByText('sm'))).toBe(96);
    await expect(columnWidth(canvas.getByText('md'))).toBe(160);
    await expect(columnWidth(canvas.getByText('lg'))).toBe(192);
    await expect(columnWidth(canvas.getByText('xl'))).toBe(320);
    await expect(columnWidth(canvas.getByText('content'))).toBeLessThan(96);
  },
};

export const FillingEmptySpace: ListCompositionStory = {
  render: (args) => {
    return (
      <List {...args}>
        <ListRow>
          <ListCol size="md">
            <Box bg="background-selected" flex={1} height={1} p={8}>
              Medium
            </Box>
          </ListCol>
          <ListCol fill size="md">
            <Box bg="background-selected" flex={1} height={1} p={8}>
              Medium - Fill
            </Box>
          </ListCol>
          <ListCol size="md">
            <Box bg="background-selected" flex={1} height={1} p={8}>
              Medium
            </Box>
          </ListCol>
          <ListCol fill size="md">
            <Box bg="background-selected" flex={1} height={1} p={8}>
              Medium - Fill
            </Box>
          </ListCol>
          <ListCol size="md">
            <Box bg="background-selected" flex={1} height={1} p={8}>
              Medium
            </Box>
          </ListCol>
        </ListRow>
      </List>
    );
  },
  play: async ({ canvas }) => {
    const [fixed] = canvas.getAllByText('Medium');
    const fills = canvas.getAllByText('Medium - Fill');
    await expect(columnWidth(fills[0])).toBeGreaterThan(columnWidth(fixed));
    await expect(columnWidth(fills[0])).toBe(columnWidth(fills[1]));
  },
};

export const Justification: ListCompositionStory = {
  render: (args) => {
    return (
      <List {...args}>
        <ListRow>
          <ListCol fill size="md">
            Left
          </ListCol>
          <ListCol fill justify="right" size="md">
            Right
          </ListCol>
        </ListRow>
      </List>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Left')).toHaveStyle({
      justifyContent: 'flex-start',
    });
    await expect(canvas.getByText('Right')).toHaveStyle({
      justifyContent: 'flex-end',
    });
  },
};

export const HorizontalScrolling: ListCompositionStory = {
  args: { spacing: 'condensed', scrollable: true },
  render: (args) => {
    return (
      <List {...args}>
        <ScrollingRows />
      </List>
    );
  },
  play: async ({ canvas }) => {
    const headerCells = canvas.getAllByTestId('header-container');
    await expect(headerCells).toHaveLength(rows.length);
    for (const headerCell of headerCells) {
      await expect(headerCell).toHaveStyle({ position: 'sticky' });
    }
    await expect(headerCells[0]).toHaveTextContent('Jean Luc Picard');
    await expect(canvas.getByText('Captain').parentElement).not.toHaveStyle({
      position: 'sticky',
    });
  },
};

export const HorizontalScrollingInContainer: ListCompositionStory = {
  args: { id: 'scrolling-list', spacing: 'condensed', scrollable: true },
  render: (args) => {
    return (
      <Box width="800px">
        <List {...args}>
          <ScrollingRows />
        </List>
      </Box>
    );
  },
  play: async ({ canvas }) => {
    const wrapper = canvas.getByTestId('scrollable-scrolling-list');
    await expect(wrapper.scrollWidth).toBeGreaterThan(wrapper.clientWidth);

    const headerCell = canvas.getAllByTestId('header-container')[0];
    const contentCell = canvas.getByText('Captain');
    const headerLeft = headerCell.getBoundingClientRect().left;
    const contentLeft = contentCell.getBoundingClientRect().left;

    wrapper.scrollLeft = 200;
    await waitFor(() =>
      expect(contentCell.getBoundingClientRect().left).toBe(contentLeft - 200)
    );
    await expect(
      Math.abs(headerCell.getBoundingClientRect().left - headerLeft)
    ).toBeLessThanOrEqual(1);
  },
};

export const ResponsiveAnatomy: ListCompositionStory = {
  parameters: {
    docs: { inlineStories: false, iframeHeight: 180 },
  },
  render: (args) => {
    return (
      <List {...args}>
        <ListRow>
          <ListCol size="md" type="header">
            <Box bg="background-selected" flex={1} height={1} p={8}>
              Header
            </Box>
          </ListCol>
          <ListCol size="md">
            <Box bg="background-selected" flex={1} height={1} p={8}>
              Content
            </Box>
          </ListCol>
          <ListCol fill size="md">
            <Box bg="background-selected" flex={1} height={1} p={8}>
              Content
            </Box>
          </ListCol>
          <ListCol size="md" type="control">
            <Box bg="background-selected" flex={1} height={1} p={8}>
              Controls
            </Box>
          </ListCol>
        </ListRow>
      </List>
    );
  },
};

export const Responsive: ListCompositionStory = {
  args: { as: 'ol' },
  parameters: {
    docs: {
      inlineStories: false,
      iframeHeight: 180,
    },
  },
  render: (args) => {
    return (
      <List {...args}>
        <ListRow>
          <ListCol size="lg" type="header">
            <Text fontWeight="title" truncate="ellipsis" truncateLines={1}>
              Ordered List Header
            </Text>
          </ListCol>
          <ListCol size="lg">
            <Text
              color="text-disabled"
              truncate="ellipsis"
              truncateLines={1}
              variant="p-small"
            >
              Content
            </Text>
          </ListCol>
          <ListCol fill size="lg">
            <Text
              color="text-disabled"
              truncate="ellipsis"
              truncateLines={1}
              variant="p-small"
            >
              Content
            </Text>
          </ListCol>
          <ListCol type="control">
            <IconButton
              icon={MiniKebabMenuIcon}
              size="small"
              tip="Options"
              tipProps={{ placement: 'floating' }}
            />
            <IconButton
              icon={MiniDeleteIcon}
              size="small"
              tip="Delete"
              tipProps={{ placement: 'floating' }}
            />
          </ListCol>
        </ListRow>
      </List>
    );
  },
};

export const ResponsiveInNarrowContainer: ListCompositionStory = {
  render: (args) => {
    return (
      <Box width="400px">
        <List {...args}>
          <ListRow>
            <ListCol size="md" type="header">
              <Box bg="background-selected" flex={1} height={1} p={8}>
                Header
              </Box>
            </ListCol>
            <ListCol size="md">
              <Box bg="background-selected" flex={1} height={1} p={8}>
                Content
              </Box>
            </ListCol>
            <ListCol size="md" type="control">
              <Box bg="background-selected" flex={1} height={1} p={8}>
                Controls
              </Box>
            </ListCol>
          </ListRow>
        </List>
      </Box>
    );
  },
  play: async ({ canvas }) => {
    await expect(getComputedStyle(canvas.getByRole('listitem')).display).toBe(
      'grid'
    );

    const header = canvas.getByText('Header').getBoundingClientRect();
    const content = canvas.getByText('Content').getBoundingClientRect();
    const controls = canvas.getByText('Controls').getBoundingClientRect();
    await expect(controls.top).toBe(header.top);
    await expect(controls.left).toBeGreaterThan(header.left);
    await expect(content.top).toBeGreaterThanOrEqual(header.bottom);
  },
};

export const ResponsiveOrderedInNarrowContainer: ListCompositionStory = {
  args: { as: 'ol' },
  render: (args) => {
    return (
      <Box width="400px">
        <List {...args}>
          {rows.map(({ name, role }) => (
            <ListRow key={name}>
              <ListCol size="lg" type="header">
                {name}
              </ListCol>
              <ListCol fill>{role}</ListCol>
            </ListRow>
          ))}
        </List>
      </Box>
    );
  },
  play: async ({ canvas }) => {
    const [firstRow] = canvas.getAllByRole('listitem');
    await expect(getComputedStyle(firstRow, '::before').display).toBe('none');
    await expect(
      getComputedStyle(canvas.getByText('Jean Luc Picard'), '::before').display
    ).toBe('flex');
  },
};

export const SortableHeaders: ListCompositionStory = {
  render: () => {
    return (
      <List
        as="table"
        header={
          <TableHeader>
            <ListCol aria-sort="ascending" columnHeader size="md">
              Name
            </ListCol>
            <ListCol aria-sort="none" columnHeader size="md">
              Role
            </ListCol>
            <ListCol columnHeader fill>
              Ship
            </ListCol>
          </TableHeader>
        }
        spacing="condensed"
        variant="table"
      >
        {rows.map(({ name, role, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol size="md">{role}</ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('columnheader', { name: 'Name' })
    ).toHaveAttribute('aria-sort', 'ascending');
    await expect(
      canvas.getByRole('columnheader', { name: 'Role' })
    ).toHaveAttribute('aria-sort', 'none');
    await expect(
      canvas.getByRole('columnheader', { name: 'Ship' })
    ).not.toHaveAttribute('aria-sort');
  },
};

export const SortableScrollableHeaders: ListCompositionStory = {
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'scrollable-region-focusable', enabled: false }],
      },
    },
  },
  render: () => {
    return (
      <List
        as="table"
        header={
          <TableHeader>
            <ListCol aria-sort="ascending" columnHeader size="md" type="header">
              Name
            </ListCol>
            <ListCol aria-sort="none" columnHeader size="md">
              Role
            </ListCol>
            <ListCol columnHeader fill>
              Ship
            </ListCol>
          </TableHeader>
        }
        scrollable
        spacing="condensed"
        variant="table"
      >
        {rows.map(({ name, role, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol size="md">{role}</ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
  play: async ({ canvas }) => {
    // TODO: the scroll wrapper isn't focusable when rows have no focusable content
    const nameHeader = canvas.getByRole('columnheader', { name: 'Name' });
    await expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    await expect(nameHeader).toHaveAttribute('data-testid', 'header-container');
    await expect(canvas.getByText('Name')).not.toHaveAttribute('aria-sort');
    await expect(
      canvas.getByRole('columnheader', { name: 'Role' })
    ).toHaveAttribute('aria-sort', 'none');
  },
};

export const HeaderColumnCells: ListCompositionStory = {
  render: () => {
    return (
      <List as="table" spacing="condensed" variant="table">
        <TableHeader>
          <ListCol columnHeader size="md">
            Name
          </ListCol>
          <ListCol columnHeader size="md">
            Role
          </ListCol>
          <ListCol columnHeader size="md">
            Ship
          </ListCol>
        </TableHeader>
        {rows.map(({ name, role, ship }, i, _, key = `example-row-${i}`) => (
          <ListRow key={key}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol size="md">{role}</ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
  play: async ({ canvas }) => {
    // TODO: TableHeader as a List child renders its thead inside List's tbody
    canvas.getByRole('table');
    for (const name of ['Name', 'Role', 'Ship']) {
      canvas.getByRole('columnheader', { name });
    }
    await expect(canvas.getByText('Jean Luc Picard').tagName).toBe('TH');
    await expect(canvas.getByText('Captain').tagName).toBe('TD');
  },
};

export const Playground: ListCompositionStory = {
  args: {
    spacing: 'condensed',
    variant: 'table',
  },
  render: (args) => {
    return (
      <List {...args} as="table">
        <TableHeader>
          <ListCol columnHeader size="md">
            Name
          </ListCol>
          <ListCol columnHeader size="md">
            Role
          </ListCol>
          <ListCol columnHeader size="md">
            Ship
          </ListCol>
        </TableHeader>
        {rows.map(({ name, role, ship }, i, _, key = `example-row-${i}`) => (
          <ListRow key={key}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol size="md">{role}</ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
};
