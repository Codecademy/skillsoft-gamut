import styled from '@emotion/styled';
import {
  ArrowChevronDownIcon,
  StarIcon,
  StopSignIcon,
  StreakIcon,
  TrophyIcon,
} from '@skillsoft/gamut-icons';
import { Background, css } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';

import { Rotation } from '../Animation';
import { Box, FlexBox } from '../Box';
import { TextButton } from '../Button';
import { ExpandControl } from '../DataList';
import { Text } from '../Typography';
import { List, ListCol, ListRow } from '.';

const onDangerousRowClick = fn();
const onClickableRowClick = fn();

const meta: Meta<typeof ListRow> = {
  title: 'Data display/List/ListRow',
  component: ListRow,
  subcomponents: { ListCol },
  args: {},
};

export default meta;
type Story = StoryObj<typeof ListRow>;
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

const DangerousListRow = styled(ListRow)(
  css({
    bg: 'background-error',
    color: 'feedback-error',
    fontWeight: 'bold',
    borderRadius: 'sm',
  })
);

const BorderedListRow = styled(ListRow)(
  css({
    border: 1,
    borderColor: 'primary',
    borderRadius: 'md',
  })
);

interface ExpandableRowProps {
  name: string;
  role: string;
  ship: string;
  rowKey: string;
}

const ExpandedRow: React.FC<Omit<ExpandableRowProps, 'rowKey'>> = ({
  name,
  role,
  ship,
}) => (
  <FlexBox bg="background-selected" column m={16} p={16}>
    <Text fontStyle="italic" smooth>
      Oh, were you expecting to find out more about{' '}
      <Text as="span" color="text-accent" fontWeight="bold">
        {name}
      </Text>
      ,{' '}
      <Text as="span" color="text-accent" fontWeight="bold">
        {role}
      </Text>{' '}
      of the{' '}
      <Text as="span" color="text-accent" fontWeight="bold">
        {ship}
      </Text>
      ? I am very sorry but that is{' '}
      <Text
        as="span"
        color="danger"
        fontWeight="bold"
        textDecoration="underline"
      >
        highly classified
      </Text>{' '}
      information.
    </Text>
  </FlexBox>
);

const ExpandedColumns: React.FC<Omit<ExpandableRowProps, 'rowKey'>> = ({
  name,
  role,
  ship,
}) => (
  <>
    <ListCol size="lg" type="header">
      <FlexBox column>
        <Text color="text-disabled" textTransform="uppercase" variant="p-small">
          {ship}
        </Text>
        <Text variant="title-xs">{name}</Text>
      </FlexBox>
    </ListCol>
    <ListCol fill size="md">
      <FlexBox column>
        <Text color="text-disabled" textTransform="uppercase" variant="p-small">
          Rank
        </Text>
        <Text variant="title-xs">{role}</Text>
      </FlexBox>
    </ListCol>
    <ListCol fill size="sm">
      <Text color="text-disabled" lineHeight="title" mt={4} variant="p-small">
        <StreakIcon mb={4} mr={8} size={18} verticalAlign="middle" />
        87%
      </Text>
    </ListCol>
    <ListCol fill size="sm">
      <Text color="text-disabled" lineHeight="title" mt={4} variant="p-small">
        <TrophyIcon mb={4} mr={8} size={18} verticalAlign="middle" />
        48%
      </Text>
    </ListCol>
    <ListCol fill size="sm">
      <Text color="text-disabled" lineHeight="title" mt={4} variant="p-small">
        <StarIcon mb={4} mr={8} size={18} verticalAlign="middle" />
        66%
      </Text>
    </ListCol>
  </>
);

const ExpandableButtonClickRow: React.FC<ExpandableRowProps> = ({
  name,
  role,
  ship,
  rowKey,
}) => {
  const [isExpanded, setExpanded] = useState(false);

  return (
    <ListRow
      expanded={isExpanded}
      key={rowKey}
      renderExpanded={() => <ExpandedRow name={name} role={role} ship={ship} />}
    >
      <ExpandedColumns name={name} role={role} ship={ship} />
      <ListCol size="lg" type="control">
        <TextButton>Hail</TextButton>
        <ExpandControl
          disabled={false}
          expanded={isExpanded}
          id={name}
          onExpand={() => setExpanded(!isExpanded)}
        />
      </ListCol>
    </ListRow>
  );
};

const ExpandableRowClick: React.FC<ExpandableRowProps> = ({
  name,
  role,
  ship,
  rowKey,
}) => {
  const [isExpanded, setExpanded] = useState(false);

  return (
    <ListRow
      expanded={isExpanded}
      key={rowKey}
      renderExpanded={() => <ExpandedRow name={name} role={role} ship={ship} />}
      onClick={() => setExpanded(!isExpanded)}
    >
      <ExpandedColumns name={name} role={role} ship={ship} />
      <ListCol size="xl" type="control">
        <FlexBox center mt={{ _: 8, xs: 0 }} pl={{ _: 0, xs: 16 }} width={1}>
          <Rotation rotated={isExpanded}>
            <ArrowChevronDownIcon color="secondary" />
          </Rotation>
        </FlexBox>
      </ListCol>
    </ListRow>
  );
};

const ExpandableTableRow: React.FC<ExpandableRowProps> = ({
  name,
  role,
  ship,
  rowKey,
}) => {
  const [isExpanded, setExpanded] = useState(false);

  return (
    <ListRow
      expanded={isExpanded}
      key={rowKey}
      renderExpanded={() => (
        <Text p={16}>
          {name} serves on the {ship}.
        </Text>
      )}
    >
      <ListCol size="lg" type="header">
        {name}
      </ListCol>
      <ListCol fill size="md">
        {role}
      </ListCol>
      <ListCol type="control">
        <ExpandControl
          expanded={isExpanded}
          id={name}
          onExpand={() => setExpanded(!isExpanded)}
        />
      </ListCol>
    </ListRow>
  );
};

export const PlainStyled: Story = {
  render: (args) => {
    return (
      <List variant="plain">
        <ListRow {...args}>
          <ListCol size="xl">A List item</ListCol>
          <ListCol size="md">Some normal content</ListCol>
        </ListRow>
        <DangerousListRow onClick={onDangerousRowClick}>
          <ListCol size="xl">A dangerous styled item</ListCol>
          <ListCol size="md">More styled content</ListCol>
          <ListCol fill justify="right" size="sm">
            <StopSignIcon size={24} />
          </ListCol>
        </DangerousListRow>
        <ListRow>
          <ListCol size="xl">Another List item</ListCol>
          <ListCol size="md">Standard content</ListCol>
        </ListRow>
        <BorderedListRow>
          <ListCol size="xl">A Custom Bordered Item</ListCol>
          <ListCol size="md">With custom border</ListCol>
        </BorderedListRow>
      </List>
    );
  },
  play: async ({ canvas, userEvent }) => {
    onDangerousRowClick.mockClear();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);

    const dangerousRow = canvas.getByRole('button', {
      name: /A dangerous styled item/,
    });
    await expect(dangerousRow).not.toHaveAttribute('aria-expanded');
    await userEvent.click(dangerousRow);
    await expect(onDangerousRowClick).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Enter}');
    await expect(onDangerousRowClick).toHaveBeenCalledTimes(2);
  },
};

export const ExpandableButton: ListCompositionStory = {
  render: (args) => {
    return (
      <Background bg="black">
        <Box p={8}>
          <List {...args}>
            {rows.map(
              ({ name, role, ship }, i, _, key = `example-row-${i}`) => (
                <ExpandableButtonClickRow
                  key={key}
                  name={name}
                  role={role}
                  rowKey={key}
                  ship={ship}
                />
              )
            )}
          </List>
        </Box>
      </Background>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByRole('region')).toBeNull();

    const expandButton = canvas.getByRole('button', {
      name: 'Expand Jean Luc Picard Row',
    });
    await expect(expandButton).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(expandButton);
    await expect(expandButton).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region')).toHaveTextContent(
      'Jean Luc Picard'
    );
    await expect(canvas.getAllByRole('region')).toHaveLength(1);

    const secondExpandButton = canvas.getByRole('button', {
      name: 'Expand Wesley Crusher Row',
    });
    await userEvent.click(secondExpandButton);
    await expect(canvas.getAllByRole('region')).toHaveLength(2);

    await userEvent.click(expandButton);
    await expect(expandButton).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.getAllByRole('region')).toHaveLength(1));
    await expect(canvas.getByRole('region')).toHaveTextContent(
      'Wesley Crusher'
    );
    await expect(secondExpandButton).toHaveAttribute('aria-expanded', 'true');
  },
};

export const ExpandableClickableRow: ListCompositionStory = {
  render: (args) => {
    return (
      <Background bg="black">
        <Box p={8}>
          <List {...args}>
            {rows.map(
              ({ name, role, ship }, i, _, key = `example-row-${i}`) => (
                <ExpandableRowClick
                  key={key}
                  name={name}
                  role={role}
                  rowKey={key}
                  ship={ship}
                />
              )
            )}
          </List>
        </Box>
      </Background>
    );
  },
  play: async ({ canvas, userEvent }) => {
    // TODO: clickable rows don't activate with Space, only Enter
    const rowButtons = canvas.getAllByRole('button');
    await expect(rowButtons).toHaveLength(rows.length);
    const [firstRow, secondRow] = rowButtons;
    await expect(firstRow).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(firstRow);
    await expect(firstRow).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region')).toHaveTextContent(
      'Jean Luc Picard'
    );

    await userEvent.click(firstRow);
    await expect(firstRow).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.queryByRole('region')).toBeNull());

    await userEvent.tab();
    await expect(secondRow).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(secondRow).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.getByRole('region')).toHaveTextContent(
      'Wesley Crusher'
    );
  },
};

export const ExpandableTableRows: ListCompositionStory = {
  args: { as: 'table', spacing: 'condensed', variant: 'table' },
  render: (args) => {
    return (
      <List {...args}>
        {rows.map(({ name, role, ship }, i, _, key = `example-row-${i}`) => (
          <ExpandableTableRow
            key={key}
            name={name}
            role={role}
            rowKey={key}
            ship={ship}
          />
        ))}
      </List>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Expand Jean Luc Picard Row' })
    );

    const region = canvas.getByRole('region');
    await expect(region).toHaveTextContent('Jean Luc Picard');
    await expect(region.closest('td')).not.toBeNull();
    await expect(region.closest('tr')).toHaveTextContent('Captain');
    await expect(canvas.getAllByRole('row')).toHaveLength(rows.length);
  },
};

export const ExpandedRowOptions: ListCompositionStory = {
  args: { spacing: 'condensed' },
  render: (args) => {
    return (
      <List {...args}>
        {rows.slice(0, 2).map(({ name, role, ship }, i) => (
          <ListRow
            expanded
            expandedRowAriaLabel={`${name} details`}
            keepSpacingWhileExpanded={i === 0}
            key={name}
            renderExpanded={() => (
              <Text p={16}>
                {name} serves on the {ship}.
              </Text>
            )}
          >
            <ListCol size="lg" type="header">
              {name}
            </ListCol>
            <ListCol fill>{role}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
  play: async ({ canvas }) => {
    canvas.getByRole('region', { name: 'Jean Luc Picard details' });
    canvas.getByRole('region', { name: 'Wesley Crusher details' });

    const [keptSpacingRow, defaultRow] = canvas.getAllByRole('listitem');
    await expect(getComputedStyle(keptSpacingRow).columnGap).not.toBe('normal');
    await expect(getComputedStyle(defaultRow).columnGap).toBe('normal');
  },
};

export const ClickableRowsInOrderedList: ListCompositionStory = {
  args: { as: 'ol', spacing: 'condensed' },
  render: (args) => {
    return (
      <List {...args}>
        {rows.slice(0, 3).map(({ name, role }, i) => (
          <ListRow
            key={name}
            onClick={i === 1 ? onClickableRowClick : undefined}
          >
            <ListCol size="lg" type="header">
              {name}
            </ListCol>
            <ListCol fill>{role}</ListCol>
          </ListRow>
        ))}
      </List>
    );
  },
  play: async ({ canvas }) => {
    const [numberedRow, clickableRow] = canvas.getAllByRole('listitem');
    await expect(getComputedStyle(numberedRow, '::before').content).toContain(
      'counters'
    );
    await expect(getComputedStyle(clickableRow, '::before').content).toBe(
      'none'
    );
    canvas.getByRole('button', { name: /Wesley Crusher/ });
  },
};
