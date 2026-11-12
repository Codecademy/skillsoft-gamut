import { MiniKebabMenuIcon } from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, screen, waitFor, within } from 'storybook/test';

import { Box } from '../../Box';
import { IconButton } from '../../Button';
import { Menu, MenuItem } from '../../Menu';
import { Dialog } from '../../Modals';
import { PopoverContainer } from '../../PopoverContainer';
import { Text } from '../../Typography';

const meta: Meta<typeof IconButton> = {
  title: 'Patterns/FloatingMenu',
  component: IconButton,
  parameters: {
    controls: { disable: true },
    docs: { propsTable: false },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  parameters: { docs: { source: { type: 'code' } } },
  render: function FloatingMenuExample() {
    const [isOpen, setIsOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);

    const handleClose = () => setIsOpen(false);
    const handleRequestDelete = () => {
      setIsOpen(false);
      setIsConfirmOpen(true);
    };

    return (
      <Box alignItems="center" display="flex" gap={8} p={24}>
        <Text fontWeight="bold">Intro to JavaScript</Text>
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
              <MenuItem onClick={handleClose}>
                Edit Intro to JavaScript
              </MenuItem>
              <MenuItem onClick={handleClose}>
                Duplicate Intro to JavaScript
              </MenuItem>
              <MenuItem onClick={handleRequestDelete}>
                Delete Intro to JavaScript
              </MenuItem>
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
            title="Delete Intro to JavaScript?"
            onRequestClose={() => setIsConfirmOpen(false)}
          >
            This action cannot be undone.
          </Dialog>
        </Box>
      </Box>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Show options' });
    await expect(screen.queryByRole('menu')).toBeNull();

    await userEvent.click(trigger);
    await screen.findByRole('menu');
    await userEvent.click(
      screen.getByRole('menuitem', { name: 'Edit Intro to JavaScript' })
    );
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());

    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole('menuitem', {
        name: 'Delete Intro to JavaScript',
      })
    );
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    const dialog = await screen.findByRole('dialog');
    within(dialog).getByText('Delete Intro to JavaScript?');

    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancel' })
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};
