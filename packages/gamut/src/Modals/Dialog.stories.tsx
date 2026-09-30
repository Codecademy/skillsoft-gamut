import { ColorMode } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, fn, screen } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { closeButtonPropsArgTypes } from '~styleguide/argTypes';

import { Box, FlexBox } from '../Box';
import { FillButton, StrokeButton } from '../Button';
import { Text } from '../Typography';
import { Dialog } from './Dialog';

type Story = StoryObj<typeof Dialog>;

const openDialog: NonNullable<Story['play']> = async ({
  canvas,
  userEvent,
}) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Open dialog' }));
};

const meta: TypeWithDeepControls<Meta<typeof Dialog>> = {
  title: 'Molecules/Modals/Dialog',
  component: Dialog,
  args: {
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
  render: function DialogWithTrigger(args) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <FillButton onClick={() => setIsOpen(true)}>Open dialog</FillButton>
        <Dialog
          {...args}
          isOpen={isOpen}
          onRequestClose={() => {
            setIsOpen(false);
            args.onRequestClose();
          }}
        />
      </>
    );
  },
  play: openDialog,
};

export default meta;

export const Default: Story = {};

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
  render: function CustomCloseDialog(args) {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <>
        <FillButton onClick={() => setIsOpen(true)}>Open dialog</FillButton>
        <Dialog
          {...args}
          isOpen={isOpen}
          onRequestClose={() => {
            setIsOpen(false);
            args.onRequestClose();
          }}
        >
          <FlexBox column gap={16} m={16}>
            <Box>
              <Text>Missing a close button?</Text>
            </Box>
            <Box>
              <StrokeButton onClick={() => setIsOpen(false)}>
                No problem, click me!
              </StrokeButton>
            </Box>
          </FlexBox>
        </Dialog>
      </>
    );
  },
  play: async (context) => {
    await openDialog(context);

    await context.userEvent.click(
      screen.getByRole('button', { name: 'No problem, click me!' })
    );
    await expect(screen.queryByRole('dialog')).toBeNull();
  },
};

export const CloseButtonCustomization: Story = {
  args: {
    size: 'medium',
    title: 'Close Button Customization Demo',
  },
  render: function CloseButtonCustomizationDialog(args) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    return (
      <>
        <FillButton onClick={() => setIsOpen(true)}>Open dialog</FillButton>
        <Dialog
          {...args}
          closeButtonProps={{
            ref: closeButtonRef,
            tip: 'Close this very important Dialog',
            disabled: isDisabled,
          }}
          isOpen={isOpen}
          onRequestClose={() => {
            setIsOpen(false);
            args.onRequestClose();
          }}
        >
          <FlexBox flexDirection="column" gap={16} p={16}>
            <Text>
              This dialog has a customized close button with a ref for
              programmatic focus management, a custom tooltip, and a disabled
              state.
            </Text>
            <FillButton
              disabled={isDisabled}
              onClick={() => closeButtonRef.current?.focus()}
            >
              Focus Close Button
            </FillButton>
            <FillButton onClick={() => setIsDisabled(!isDisabled)}>
              {isDisabled ? 'Enable' : 'Disable'} Focus Close Button
            </FillButton>
          </FlexBox>
        </Dialog>
      </>
    );
  },
  play: async (context) => {
    await openDialog(context);
    const { userEvent } = context;

    const closeButton = screen.getByRole('button', {
      name: 'Close this very important Dialog',
    });
    await expect(closeButton).not.toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Focus Close Button' })
    );
    await expect(closeButton).toHaveFocus();

    await userEvent.click(
      screen.getByRole('button', { name: 'Disable Focus Close Button' })
    );
    await expect(closeButton).toBeDisabled();
  },
};

export const FocusManagement: Story = {
  args: {
    size: 'medium',
    title: 'Focus Management Demo',
  },
  render: function FocusManagementDialog(args) {
    const [isOpen, setIsOpen] = useState(false);
    const containerFocusRef = useRef<HTMLDivElement>(null);

    return (
      <>
        <FillButton onClick={() => setIsOpen(true)}>Open dialog</FillButton>
        <Dialog
          {...args}
          containerFocusRef={containerFocusRef}
          isOpen={isOpen}
          onRequestClose={() => {
            setIsOpen(false);
            args.onRequestClose();
          }}
        >
          <FlexBox flexDirection="column" gap={16}>
            <Text>
              This dialog container has a ref that you can interact with
              programmatically.
            </Text>
            <FlexBox gap={8}>
              <FillButton onClick={() => containerFocusRef.current?.focus()}>
                Focus Dialog Container
              </FillButton>
            </FlexBox>
            <Text color="text-disabled" fontSize={14}>
              Try tabbing through the page - the dialog container will maintain
              focus when you click the &quot;Focus Dialog Container&quot;
              button.
            </Text>
          </FlexBox>
        </Dialog>
      </>
    );
  },
  play: async (context) => {
    await openDialog(context);

    await context.userEvent.click(
      screen.getByRole('button', { name: 'Focus Dialog Container' })
    );
    await expect(screen.getByRole('dialog')).toHaveFocus();
  },
};

export const Dismissal: Story = {
  play: async (context) => {
    const { args, userEvent } = context;

    await openDialog(context);
    await userEvent.click(screen.getByRole('button', { name: 'Arms!' }));
    await expect(args.confirmCta.onClick).toHaveBeenCalledTimes(1);
    await expect(args.onRequestClose).toHaveBeenCalledTimes(1);
    await expect(screen.queryByRole('dialog')).toBeNull();

    await openDialog(context);
    await userEvent.click(screen.getByRole('button', { name: 'Heart?' }));
    await expect(args.cancelCta?.onClick).toHaveBeenCalledTimes(1);
    await expect(args.onRequestClose).toHaveBeenCalledTimes(2);
    await expect(screen.queryByRole('dialog')).toBeNull();

    await openDialog(context);
    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }));
    await expect(args.onRequestClose).toHaveBeenCalledTimes(3);
    await expect(screen.queryByRole('dialog')).toBeNull();

    await openDialog(context);
    await userEvent.click(screen.getByRole('dialog'));
    await expect(args.onRequestClose).toHaveBeenCalledTimes(3);
    screen.getByRole('dialog');

    await userEvent.keyboard('{Escape}');
    await expect(args.onRequestClose).toHaveBeenCalledTimes(4);
    await expect(screen.queryByRole('dialog')).toBeNull();
  },
};
