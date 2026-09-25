// Added because SB and TS don't play nice with each other at the moment
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import {
  Box,
  Dialog,
  IconButton,
  Menu,
  MenuItem,
  PopoverContainer,
  Text,
} from '@skillsoft/gamut';
import { MiniKebabMenuIcon } from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';

// The pattern this demonstrates has no single "component under test" — it's
// three components composed together. IconButton is the trigger a reader
// interacts with first, so it stands in as the story's subject.
const meta: Meta<typeof IconButton> = {
  component: IconButton,
};

export default meta;
type Story = StoryObj<typeof IconButton>;

const ItemMenu: React.FC<{ itemName: string }> = ({ itemName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleClose = () => setIsOpen(false);
  const handleRequestDelete = () => {
    setIsOpen(false);
    setIsConfirmOpen(true);
  };

  return (
    <Box display="inline-block" ref={triggerRef}>
      <IconButton
        icon={MiniKebabMenuIcon}
        tip="Show options"
        variant="secondary"
        onClick={() => setIsOpen(!isOpen)}
      />

      <PopoverContainer
        alignment="bottom-left"
        allowPageInteraction
        closeOnViewportExit
        isOpen={isOpen}
        targetRef={triggerRef}
        onRequestClose={handleClose}
      >
        <Menu borderRadius="md" role="menu" variant="popover">
          <MenuItem onClick={handleClose}>Edit {itemName}</MenuItem>
          <MenuItem onClick={handleClose}>Duplicate {itemName}</MenuItem>
          <MenuItem onClick={handleRequestDelete}>Delete {itemName}</MenuItem>
        </Menu>
      </PopoverContainer>

      <Dialog
        cancelCta={{
          children: 'Cancel',
          onClick: () => setIsConfirmOpen(false),
        }}
        confirmCta={{
          children: 'Delete',
          onClick: () => setIsConfirmOpen(false),
        }}
        isOpen={isConfirmOpen}
        size="small"
        title={`Delete ${itemName}?`}
        onRequestClose={() => setIsConfirmOpen(false)}
      >
        This action cannot be undone.
      </Dialog>
    </Box>
  );
};

export const Default: Story = {
  render: () => (
    <Box alignItems="center" display="flex" gap={8} p={24}>
      <Text fontWeight="bold">Intro to JavaScript</Text>
      <ItemMenu itemName="Intro to JavaScript" />
    </Box>
  ),
};
