import {
  HouseEntranceIcon,
  MiniDeleteIcon,
  MiniKebabMenuIcon,
  StarIcon,
  StreakIcon,
  TrophyIcon,
} from '@skillsoft/gamut-icons';
import { Keyhole } from '@skillsoft/gamut-illustrations';
import { Background } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { Box, FlexBox } from '../Box';
import { FillButton, IconButton, TextButton } from '../Button';
import { Text } from '../Typography';
import { List, ListCol, ListRow, TableHeader } from '.';

const meta: Meta<typeof List> = {
  title: 'Data display/List/List',
  component: List,
  subcomponents: {
    ListRow,
    TableHeader,
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof List>;

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

const DisableContainerQueryExample = ({
  defaultComponent,
  disabledComponent,
}: {
  defaultComponent: ReactNode;
  disabledComponent: ReactNode;
}) => (
  <FlexBox flexDirection="column" gap={24}>
    <Box>
      <Text mb={8} variant="title-sm">
        Default (Container Queries Enabled)
      </Text>
      <Box border={1} borderColor="border-tertiary" maxWidth="400px" p={16}>
        {defaultComponent}
      </Box>
      <Text color="text-secondary" mt={8} variant="p-small">
        Container queries apply responsive behavior based on the List&apos;s
        container width
      </Text>
    </Box>
    <Box>
      <Text mb={8} variant="title-sm">
        With Container Queries Disabled
      </Text>
      <Box border={1} borderColor="border-tertiary" maxWidth="400px" p={16}>
        {disabledComponent}
      </Box>
      <Text color="text-secondary" mt={8} variant="p-small">
        Built in responsive behavior is disabled - custom responsive behavior is
        required
      </Text>
    </Box>
  </FlexBox>
);

const ScrollToTopExample = (args: Story['args']) => {
  const [crew, setCrew] = useState(rows);
  const repeatedCrew = [1, 2, 3].flatMap((copy) =>
    crew.map((member) => ({ ...member, key: `${copy}-${member.name}` }))
  );

  return (
    <>
      <FillButton mb={16} onClick={() => setCrew([...crew].reverse())}>
        Reverse crew
      </FillButton>
      <List {...args}>
        {repeatedCrew.map(({ key, name, ship }) => (
          <ListRow key={key}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    </>
  );
};

export const Default: Story = {
  args: {
    spacing: 'condensed',
  },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
  play: async ({ canvas }) => {
    const list = canvas.getByRole('list');
    await expect(list.tagName).toBe('UL');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(rows.length);

    const scrollContainer = list.parentElement!;
    await expect(scrollContainer.getBoundingClientRect().width).toBe(
      scrollContainer.parentElement!.getBoundingClientRect().width
    );
  },
};

export const NormalSpacing: Story = {
  args: { spacing: 'normal' },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
};

export const CondensedSpacing: Story = {
  args: { spacing: 'condensed' },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
};

export const CompactSpacing: Story = {
  args: { spacing: 'compact' },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
};

export const Table: Story = {
  args: { spacing: 'condensed', variant: 'table' },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
};

export const Plain: Story = {
  args: { spacing: 'condensed', variant: 'plain' },
  render: (args) => {
    return (
      <Box width={1}>
        <List {...args}>
          {rows.map(({ name, ship }) => (
            <ListRow key={name}>
              <ListCol size="md" type="header">
                {name}
              </ListCol>
              <ListCol fill>{ship}</ListCol>
            </ListRow>
          ))}
        </List>
      </Box>
    );
  },
};

export const Card: Story = {
  args: {
    variant: 'card',
  },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, ship, role }) => (
          <ListRow key={name}>
            <ListCol fill>
              <Text truncate="ellipsis" truncateLines={1} variant="title-lg">
                {name}
              </Text>
            </ListCol>
            <ListCol>
              <FlexBox flexDirection="column" p={4}>
                <Keyhole height="6rem" />
                {role}
              </FlexBox>
            </ListCol>
            <ListCol size="xl">
              <FlexBox
                alignItems="center"
                bg="palePink"
                flexDirection="column"
                height="8rem"
                justifyContent="center"
                p={8}
              >
                <HouseEntranceIcon size={40} />
                {ship}
              </FlexBox>
            </ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
};

export const Block: Story = {
  args: {
    variant: 'block',
    spacing: 'condensed',
  },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
};

export const OrderedList: Story = {
  args: {
    variant: 'table',
    as: 'ol',
    spacing: 'condensed',
  },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list').tagName).toBe('OL');

    const items = canvas.getAllByRole('listitem');
    await expect(items).toHaveLength(rows.length);
    for (const item of items) {
      await expect(item).not.toHaveTextContent('1.');
      await expect(getComputedStyle(item, '::before').content).toContain(
        'counters'
      );
    }
  },
};

export const NormalSpacingGuide: Story = {
  args: { spacing: 'normal' },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, role, ship }, i, _, key = `example-row-${i}`) => (
          <ListRow key={key}>
            <ListCol size="lg" type="header">
              <FlexBox column>
                <Text
                  color="text-disabled"
                  textTransform="uppercase"
                  variant="p-small"
                >
                  {ship}
                </Text>
                <Text variant="title-xs">{name}</Text>
              </FlexBox>
            </ListCol>
            <ListCol fill size="md">
              <FlexBox column>
                <Text
                  color="text-disabled"
                  textTransform="uppercase"
                  variant="p-small"
                >
                  Rank
                </Text>
                <Text variant="title-xs">{role}</Text>
              </FlexBox>
            </ListCol>
            <ListCol fill size="sm">
              <Text
                color="text-disabled"
                lineHeight="title"
                mt={4}
                variant="p-small"
              >
                <StreakIcon mb={4} mr={8} size={18} verticalAlign="middle" />
                87%
              </Text>
            </ListCol>
            <ListCol fill size="sm">
              <Text
                color="text-disabled"
                lineHeight="title"
                mt={4}
                variant="p-small"
              >
                <TrophyIcon mb={4} mr={8} size={18} verticalAlign="middle" />
                48%
              </Text>
            </ListCol>
            <ListCol fill size="sm">
              <Text
                color="text-disabled"
                lineHeight="title"
                mt={4}
                variant="p-small"
              >
                <StarIcon mb={4} mr={8} size={18} verticalAlign="middle" />
                66%
              </Text>
            </ListCol>
            <ListCol size="lg" type="control">
              <TextButton mr={16}>Hail</TextButton>
              <FillButton>Engage</FillButton>
            </ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
};

export const CondensedSpacingGuide: Story = {
  args: { spacing: 'condensed' },
  render: (args) => {
    return (
      <List {...args}>
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
      </List>
    );
  },
};

export const CondensedTableGuide: Story = {
  args: { spacing: 'condensed', variant: 'table' },
  render: (args) => {
    return (
      <List {...args}>
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
      </List>
    );
  },
};

export const SpaceSystemProps: Story = {
  args: {
    p: 16,
  },
  render: (args) => {
    return (
      <Background bg="beige">
        <List {...args}>
          {rows.map(({ name, ship }) => (
            <ListRow key={name}>
              <ListCol size="md" type="header">
                {name}
              </ListCol>
              <ListCol fill>{ship}</ListCol>
            </ListRow>
          ))}
        </List>
      </Background>
    );
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('list')).toHaveStyle({ padding: '16px' });
  },
};

export const WrapperWidth: Story = {
  args: {
    id: 'wrapper-width-list',
    spacing: 'condensed',
    wrapperWidth: '500px',
  },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByTestId('scrollable-wrapper-width-list')
    ).toHaveStyle({ maxWidth: '500px', width: '500px' });
  },
};

export const Empty: Story = {
  args: {
    emptyMessage: <Text>No crew members found</Text>,
  },
  render: (args) => <List {...args} />,
  play: async ({ canvas }) => {
    canvas.getByText('No crew members found');
    await expect(canvas.queryByRole('list')).toBeNull();
    await expect(canvas.queryByRole('listitem')).toBeNull();
  },
};

export const Loading: Story = {
  args: { loading: true, spacing: 'condensed' },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
  play: async ({ canvas }) => {
    canvas.getByRole('list');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(rows.length);
  },
};

export const ScrollShadow: Story = {
  args: {
    as: 'table',
    id: 'scroll-shadow-list',
    scrollable: true,
    shadow: true,
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
      <Box width="800px">
        <List {...args}>
          {rows.map(({ name, role, ship }) => (
            <ListRow key={name}>
              <ListCol size="xl" type="header">
                {name}
              </ListCol>
              <ListCol size="xl">{role}</ListCol>
              <ListCol size="xl">{ship}</ListCol>
            </ListRow>
          ))}
        </List>
      </Box>
    );
  },
  play: async ({ canvas }) => {
    /*
     * TODO: the scroll wrapper isn't focusable when rows have no focusable content.
     * The shadow also never shows for ul/ol lists, which scroll an inner box instead of the wrapper.
     */
    const wrapper = canvas.getByTestId('scrollable-scroll-shadow-list')
      .parentElement!;
    await waitFor(() =>
      expect(getComputedStyle(wrapper).backgroundSize).toBe('124px 100%')
    );

    wrapper.scrollLeft = wrapper.scrollWidth;
    await waitFor(() =>
      expect(getComputedStyle(wrapper).backgroundSize).toBe('0px 100%')
    );
  },
};

export const ScrollToTopOnUpdate: Story = {
  args: {
    height: 200,
    id: 'scroll-to-top-list',
    scrollToTopOnUpdate: true,
    spacing: 'condensed',
  },
  parameters: {
    a11y: {
      config: {
        rules: [{ id: 'scrollable-region-focusable', enabled: false }],
      },
    },
  },
  render: (args) => <ScrollToTopExample {...args} />,
  play: async ({ canvas, userEvent }) => {
    /*
     * TODO: scrollToTopOnUpdate scrolls the inner box, not the wrapper that actually scrolls.
     * The scroll wrapper also isn't focusable when rows have no focusable content.
     */
    const wrapper = canvas.getByTestId('scrollable-scroll-to-top-list')
      .parentElement!;
    wrapper.scrollTop = 150;
    await waitFor(() => expect(wrapper.scrollTop).toBe(150));

    await userEvent.click(canvas.getByRole('button', { name: 'Reverse crew' }));
    await expect(canvas.getAllByRole('listitem')[0]).toHaveTextContent('Data');
  },
};

export const RowBreakpoint: Story = {
  args: { rowBreakpoint: 'sm', spacing: 'condensed' },
  render: (args) => {
    return (
      <FlexBox column gap={24} width="900px">
        <List spacing="condensed">
          <ListRow>
            <ListCol size="md" type="header">
              Default breakpoint
            </ListCol>
            <ListCol fill>Row layout at 900px</ListCol>
          </ListRow>
        </List>
        <List {...args}>
          <ListRow>
            <ListCol size="md" type="header">
              Small breakpoint
            </ListCol>
            <ListCol fill>Stacked layout at 900px</ListCol>
          </ListRow>
        </List>
      </FlexBox>
    );
  },
  play: async ({ canvas }) => {
    // TODO: rowBreakpoint sm/md also flip on viewport width, so a 900px container on a wide screen doesn't stack
    const [defaultRow] = canvas.getAllByRole('listitem');
    await expect(getComputedStyle(defaultRow).display).toBe('flex');
  },
};

export const DisableContainerQuery: Story = {
  args: {},
  render: () => {
    const defaultComponent = (
      <List spacing="condensed" variant="table">
        {rows.slice(0, 2).map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
            <ListCol justify="right" type="control">
              {ship}
            </ListCol>
          </ListRow>
        ))}
      </List>
    );

    const disabledComponent = (
      <List disableContainerQuery spacing="condensed" variant="table">
        {rows.slice(0, 2).map(({ name, ship }) => (
          <ListRow key={name}>
            <ListCol size="md" type="header">
              {name}
            </ListCol>
            <ListCol fill>{ship}</ListCol>
            <ListCol justify="right" type="control">
              {ship}
            </ListCol>
          </ListRow>
        ))}
      </List>
    );

    return (
      <DisableContainerQueryExample
        defaultComponent={defaultComponent}
        disabledComponent={disabledComponent}
      />
    );
  },
  play: async ({ canvas }) => {
    const [defaultList, disabledList] = canvas.getAllByRole('list');
    await expect(
      getComputedStyle(defaultList.parentElement!.parentElement!).containerType
    ).toBe('inline-size');
    await expect(
      getComputedStyle(disabledList.parentElement!.parentElement!).containerType
    ).toBe('normal');
  },
};
