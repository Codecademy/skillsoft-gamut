import { ColorMode } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, screen } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { closeButtonPropsArgTypes } from '~styleguide/argTypes';

import { Box, FlexBox } from '../Box';
import { StrokeButton } from '../Button';
import { Text } from '../Typography';
import { Dialog } from './Dialog';

const meta: TypeWithDeepControls<Meta<typeof Dialog>> = {
  title: 'Molecules/Modals/Dialog',
  component: Dialog,
  args: {
    isOpen: true,
    title: 'Depeche Modal',
    children: 'All I ever wanted, all I ever needed is here in my',
    onRequestClose: fn(),
    confirmCta: { children: 'Arms!', onClick: fn() },
    cancelCta: { children: 'Heart?', onClick: fn() },
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['primary', 'danger'],
    },
    ...closeButtonPropsArgTypes({
      defaultTipText: 'Close dialog',
      defaultTipAlignment: 'top-center',
    }),
  },
};

export default meta;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {};

export const Closed: Story = {
  args: { isOpen: false },
  play: async () => {
    await expect(screen.queryByRole('dialog')).toBeNull();
  },
};

export const Danger: Story = {
  args: { variant: 'danger' },
};

export const DarkMode: Story = {
  decorators: [
    (StoryComponent) => (
      <ColorMode mode="dark">
        <StoryComponent />
      </ColorMode>
    ),
  ],
};

export const CustomClose: Story = {
  args: {
    title: 'Custom Close',
    closeButtonProps: { hidden: true },
  },
  render: (args) => (
    <Dialog {...args}>
      <FlexBox column gap={16} m={16}>
        <Box>
          <Text>Missing a close button?</Text>
        </Box>
        <Box>
          <StrokeButton>No problem, click me!</StrokeButton>
        </Box>
      </FlexBox>
    </Dialog>
  ),
};

export const CloseButtonCustomization: Story = {
  args: {
    size: 'medium',
    title: 'Close Button Customization',
    closeButtonProps: {
      tip: 'Close this very important Dialog',
      disabled: true,
    },
  },
  play: async () => {
    const closeButton = screen.getByRole('button', {
      name: 'Close this very important Dialog',
    });
    await expect(closeButton).toHaveAttribute(
      'aria-label',
      'Close this very important Dialog'
    );
    await expect(closeButton).toBeDisabled();
  },
};

export const ConfirmAndCancel: Story = {
  play: async ({ args, userEvent }) => {
    await userEvent.click(screen.getByRole('button', { name: 'Arms!' }));
    await expect(args.confirmCta.onClick).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('button', { name: 'Heart?' }));
    await expect(args.cancelCta?.onClick).toHaveBeenCalledTimes(1);

    await expect(args.onRequestClose).toHaveBeenCalledTimes(2);
  },
};

export const Dismissal: Story = {
  play: async ({ args, userEvent }) => {
    const dialog = screen.getByRole('dialog');

    await userEvent.click(dialog);
    await expect(args.onRequestClose).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    await expect(args.onRequestClose).toHaveBeenCalledTimes(1);

    await userEvent.keyboard('{Escape}');
    await expect(args.onRequestClose).toHaveBeenCalledTimes(2);
  },
};
