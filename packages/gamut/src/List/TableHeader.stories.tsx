import type { Meta, StoryObj } from '@storybook/react';
import { expect, waitFor } from 'storybook/test';

import { List, ListCol, ListRow, TableHeader } from '.';

const meta: Meta<typeof TableHeader> = {
  title: 'Data display/List/TableHeader',
  component: TableHeader,
  subcomponents: { ListCol },
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

export const WithTableHeader: ListCompositionStory = {
  args: { spacing: 'condensed' },
  render: (args) => {
    return (
      <List {...args} as="table" variant="table">
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
    await expect(canvas.getAllByRole('row')).toHaveLength(rows.length + 1);
    for (const name of ['Name', 'Role', 'Ship']) {
      canvas.getByRole('columnheader', { name });
    }
    await expect(canvas.getByText('Name').closest('thead')).toHaveStyle({
      position: 'sticky',
    });
  },
};

export const WithHeaderProp: ListCompositionStory = {
  args: { spacing: 'condensed' },
  render: (args) => {
    return (
      <List
        {...args}
        as="table"
        header={
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
        }
        variant="table"
      >
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
    // TODO: body cells with type="header" are exposed as column headers, not row headers
    const table = canvas.getByRole('table');
    const [headerGroup, bodyGroup] = canvas.getAllByRole('rowgroup');
    await expect(headerGroup.tagName).toBe('THEAD');
    await expect(bodyGroup.tagName).toBe('TBODY');
    await expect(headerGroup.parentElement).toBe(table);
    await expect(bodyGroup.parentElement).toBe(table);
    for (const name of ['Name', 'Role', 'Ship']) {
      canvas.getByRole('columnheader', { name });
    }
  },
};

export const StickyOnVerticalScroll: ListCompositionStory = {
  args: {
    height: 160,
    id: 'sticky-header-list',
    scrollable: true,
    spacing: 'condensed',
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'scrollable-region-focusable', enabled: false }],
      },
    },
  },
  render: (args) => {
    return (
      <List
        {...args}
        as="table"
        header={
          <TableHeader>
            <ListCol columnHeader size="md" type="header">
              Name
            </ListCol>
            <ListCol columnHeader size="md">
              Role
            </ListCol>
            <ListCol columnHeader fill>
              Ship
            </ListCol>
          </TableHeader>
        }
        variant="table"
      >
        {[...rows, ...rows].map(({ name, role, ship }, i) => (
          <ListRow key={`${name}-${role}-${i < rows.length}`}>
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
    const wrapper = canvas.getByTestId('scrollable-sticky-header-list')
      .parentElement!;
    const headerGroup = canvas.getAllByRole('rowgroup')[0];
    await expect(wrapper.scrollHeight).toBeGreaterThan(wrapper.clientHeight);

    wrapper.scrollTop = 100;
    await waitFor(() => expect(wrapper.scrollTop).toBe(100));
    await expect(headerGroup.getBoundingClientRect().top).toBe(
      wrapper.getBoundingClientRect().top
    );
  },
};
