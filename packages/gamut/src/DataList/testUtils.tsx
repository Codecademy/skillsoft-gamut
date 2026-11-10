import {
  MiniKebabMenuIcon,
  RocketIcon,
  SparkleOutlineIcon,
} from '@skillsoft/gamut-icons';
import { BlueprintWhite } from '@skillsoft/gamut-illustrations';
import uniq from 'lodash/uniq';
import type { ComponentType, ReactNode } from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';

import { Box, FlexBox } from '../Box';
import { FillButton, IconButton } from '../Button';
import { Menu, MenuItem } from '../Menu';
import { Modal } from '../Modals';
import { PopoverContainer } from '../PopoverContainer';
import { Text } from '../Typography';
import { useLocalQuery } from './hooks/useLocalQuery';
import type { ColumnConfig } from './types';

export const crew = [
  {
    name: 'Jean Luc Picard',
    role: 'Captain',
    ship: 'USS Enterprise',
    species: 'Human',
    power: 'Monologues',
  },
  {
    name: 'Wesley Crusher',
    role: 'Deus Ex Machina',
    ship: 'USS Enterprise',
    species: 'Mary Sue',
    power: 'Being super preachy',
  },
  {
    name: 'Geordie LaForge',
    role: 'Rascal',
    ship: 'USS Enterprise',
    species: 'Human',
    power: 'Really bad a first dates',
  },
  {
    name: 'Data',
    role: 'Scamp',
    ship: 'USS Enterprise',
    species: 'Android',
    power: 'Annoying existentialism.  Real magnet for zany adventures',
  },
  {
    name: 'Tasha Yar',
    role: 'Fond Memory',
    ship: "Yesterday's Enterprise",
    species: 'Ectoplasm',
    power:
      'Coming back to the show after getting written off as their own clone',
  },
  {
    name: 'Beverly Crusher',
    role: 'Medical Officer',
    ship: "Jean Luc's Dreams",
    species: 'Human',
    power: 'Knowing glances',
  },
  {
    name: 'William Riker',
    role: 'Numba One',
    ship: 'Pleasure Cruiser',
    species: 'Hedonist',
    power: 'Seduction of alien dignataries',
  },
  {
    name: 'Barclay',
    role: 'Punching Bag',
    ship: 'Titanic (Holodeck)',
    species: 'Demigod',
    power: 'Immunity to addiction therapies',
  },
  {
    name: 'Worf',
    role: 'Security Officer',
    ship: 'Just another victim of the ambient honorability',
    species: 'Klingon',
    power: 'Combusts if they act dishonorably',
  },
  {
    name: 'Q',
    role: 'Costume Budget Line Item',
    ship: 'USS Moral Quandry',
    species: 'Q',
    power: 'World class showman',
  },
  {
    name: 'Deanna Troi',
    role: 'Hot Chocolate Enthusiast',
    ship: 'USS Enterprise',
    species: 'Human / Betazoid',
    power: 'Really good at asking the ship for hot chocolate',
  },
  {
    name: 'Guinan',
    role: "Picking up Deanna's slack",
    ship: 'Saucer Section every few seasons',
    species: "Q d'etat",
    power: 'Quantum sensitivity, talk therapy',
  },
];

type CrewMember = (typeof crew)[number];

interface MenuItemConfig {
  action: string;
  onClick: () => void;
}

const CrewMgmtDropdown = ({ row }: { row: CrewMember }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const { name } = row;

  const handleClose = () => setIsOpen(false);

  const handleArrestClick = () => {
    setIsOpen(false);
    setIsModalOpen(true);
  };

  const menuItems: MenuItemConfig[] = [
    { onClick: handleClose, action: 'Edit' },
    { onClick: handleClose, action: 'Fire' },
    { onClick: handleClose, action: 'Clone' },
    { onClick: handleClose, action: 'Discipline' },
    { onClick: handleArrestClick, action: 'Arrest' },
  ];

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
          {menuItems.map((item) => (
            <MenuItem key={item.action} onClick={item.onClick}>
              <Text truncate="ellipsis" truncateLines={1}>
                {`${item.action} ${name}`}
              </Text>
            </MenuItem>
          ))}
        </Menu>
      </PopoverContainer>
      <Modal
        isOpen={isModalOpen}
        size="small"
        views={[
          {
            title: 'Arrest Crew Member',
            children: (
              <Text>
                Are you sure you want to arrest this crew member? This action
                cannot be undone.
              </Text>
            ),
            primaryCta: {
              children: 'Arrest',
              actionType: 'next',
              onClick: () => {},
            },
            secondaryCta: {
              children: 'Cancel',
              actionType: 'cancel',
              onClick: () => setIsModalOpen(false),
            },
          },
          {
            title: 'Crew Member Arrested',
            children: <Text>{name} has been arrested successfully.</Text>,
            primaryCta: {
              children: 'Close',
              actionType: 'confirm',
              onClick: () => setIsModalOpen(false),
            },
          },
          {
            title: 'Error',
            children: (
              <Text color="danger">
                Something went wrong while arresting {name}.
              </Text>
            ),
            primaryCta: {
              children: 'Back',
              actionType: 'confirm',
              onClick: () => setIsModalOpen(false),
            },
          },
        ]}
        onRequestClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
};

export const CustomEmptyState = () => (
  <Box as="tbody" height="100%" width="100%">
    <Box
      as="tr"
      bg="paleBlue"
      height="inherit"
      position="absolute"
      width="inherit"
      zIndex={1}
    >
      <FlexBox
        as="th"
        center
        column
        left="calc(50% - 115px)"
        p={16}
        position="sticky"
        top="calc(50% - 100px)"
        width="fit-content"
      >
        <BlueprintWhite aria-hidden width="200px" />
        <Text fontFamily="monospace" mt={16}>
          Nothing to see here!
        </Text>
      </FlexBox>
    </Box>
  </Box>
);

export const shipFilters = uniq(crew.map(({ ship }) => ship));

export const cols: ColumnConfig<CrewMember>[] = [
  {
    header: 'Name',
    key: 'name',
    size: 'lg',
    sortable: true,
    type: 'header',
  },
  { header: 'Rank', key: 'role', size: 'lg', sortable: true },
  {
    header: 'Ship',
    key: 'ship',
    size: 'xl',
    sortable: true,
    filters: shipFilters,
  },
  {
    header: 'Power',
    key: 'power',
    size: 'xl',
    fill: true,
    sortable: true,
  },
  {
    header: 'Species',
    key: 'species',
    size: 'lg',
    justify: 'right',
    sortable: true,
    filters: ['Human'],
  },
  {
    header: 'Controls',
    key: 'name',
    size: 'md',
    justify: 'right',
    type: 'control',
    render: (row) => <CrewMgmtDropdown row={row} />,
  },
];

export const createDemoTable =
  (Component: ComponentType<any>, overrides: Record<string, unknown> = {}) =>
  () => {
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [expandedRows, setExpandedRows] = useState<string[]>([]);

    const { idKey, query, rows, onQueryChange } = useLocalQuery({
      idKey: 'name',
      rows: crew,
      columns: cols,
    });

    const allIds = useMemo(() => crew.map(({ [idKey]: id }) => id), [idKey]);

    const onRowSelect = useCallback(
      ({
        type,
        payload: { toggle, rowId },
      }: {
        type: string;
        payload: { toggle: boolean; rowId: string };
      }) => {
        if (type === 'select') {
          return setSelectedRows((prev) =>
            toggle ? prev.filter((id) => id !== rowId) : [...prev, rowId]
          );
        }
        if (type === 'select-all') {
          return setSelectedRows(toggle ? [] : allIds);
        }
      },
      [allIds]
    );

    const onRowExpand = useCallback(
      ({
        payload: { toggle, rowId },
      }: {
        payload: { toggle: boolean; rowId: string };
      }) =>
        setExpandedRows((prev) =>
          toggle ? prev.filter((id) => id !== rowId) : [...prev, rowId]
        ),
      []
    );

    const expandedContent = useCallback(
      ({ onCollapse }: { onCollapse: () => void }) => (
        <FlexBox column flex={1}>
          <FlexBox borderTop={1} opacity={0.5} />
          <FlexBox center column gap={16} p={32}>
            <Text variant="title-md">Nothing to see here</Text>
            <FillButton size="small" onClick={onCollapse}>
              Get me out of here!
            </FillButton>
          </FlexBox>
        </FlexBox>
      ),
      []
    );

    return (
      <Component
        columns={cols}
        expanded={expandedRows}
        expandedContent={expandedContent}
        height={500}
        id="example"
        idKey={idKey}
        query={query}
        rows={rows}
        selected={selectedRows}
        onQueryChange={onQueryChange}
        onRowExpand={onRowExpand}
        onRowSelect={onRowSelect}
        {...overrides}
      />
    );
  };

export const simpleRows = [
  { name: 'Jean Luc Picard', role: 'Captain', ship: 'USS Enterprise' },
  { name: 'Wesley Crusher', role: 'Deus Ex Machina', ship: 'USS Enterprise' },
];

export const simpleColumns: ColumnConfig<(typeof simpleRows)[number]>[] = [
  { key: 'name', header: 'Name', type: 'header', size: 'md' },
  { key: 'role', header: 'Role', fill: true, justify: 'right' },
  {
    header: 'Controls',
    key: 'name',
    size: 'sm',
    type: 'control',
    render: () => (
      <>
        <IconButton
          icon={SparkleOutlineIcon}
          tip="Warp back home"
          tipProps={{ alignment: 'left-center', placement: 'floating' }}
        />{' '}
        <IconButton
          icon={RocketIcon}
          tip="Send on a mission"
          tipProps={{ alignment: 'right-center', placement: 'floating' }}
        />
      </>
    ),
  },
];

export const DisableContainerQueryExample = ({
  componentName,
  defaultComponent,
  disabledComponent,
}: {
  componentName: string;
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
        Container queries apply responsive behavior based on the {componentName}
        &apos;s container width
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
