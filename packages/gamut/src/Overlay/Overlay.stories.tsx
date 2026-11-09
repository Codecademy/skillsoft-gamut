import { Background } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn, screen, waitFor } from 'storybook/test';

import { Box, FlexBox } from '../Box';
import { FillButton } from '../Button';
import { Text } from '../Typography';
import { Overlay } from '.';

const meta: Meta<typeof Overlay> = {
  title: 'Overlays/Overlay',
  component: Overlay,
  args: { shroud: true, clickOutsideCloses: true, onRequestClose: fn() },
  render: function OverlayExample(args) {
    const [open, setOpen] = useState(false);

    return (
      <Box position="relative">
        <FillButton onClick={() => setOpen(true)}>Open Overlay</FillButton>
        <FlexBox>
          <Overlay
            {...args}
            isOpen={open}
            onRequestClose={() => {
              setOpen(false);
              args.onRequestClose();
            }}
          >
            <Background bg="background" borderRadius="md">
              <FlexBox
                alignItems="center"
                data-testid="overlay-content"
                gap={16}
                p={24}
              >
                <Text variant="title-lg">Hooray!</Text>
                <FillButton onClick={() => setOpen(false)}>
                  Close Overlay
                </FillButton>
              </FlexBox>
            </Background>
          </Overlay>
        </FlexBox>
      </Box>
    );
  },
};

export default meta;

type Story = StoryObj<typeof Overlay>;

const openOverlay: NonNullable<Story['play']> = async ({
  canvas,
  userEvent,
}) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Open Overlay' }));
  await screen.findByText('Hooray!');
};

const expectOverlayClosed = () =>
  waitFor(() => expect(screen.queryByText('Hooray!')).toBeNull());

export const Default: Story = {
  play: async (context) => {
    const { canvas, userEvent } = context;
    await expect(screen.queryByText('Hooray!')).toBeNull();

    await openOverlay(context);
    await expect(canvas.queryByText('Hooray!')).toBeNull();
    await expect(
      canvas.queryByRole('button', { name: 'Open Overlay' })
    ).toBeNull();

    await userEvent.click(
      screen.getByRole('button', { name: 'Close Overlay' })
    );
    await expectOverlayClosed();
  },
};

export const Dismissal: Story = {
  play: async (context) => {
    const { args, userEvent } = context;

    await openOverlay(context);
    await userEvent.click(screen.getByTestId('overlay-content'));
    await expect(args.onRequestClose).not.toHaveBeenCalled();
    screen.getByText('Hooray!');

    await userEvent.keyboard('{Escape}');
    await expect(args.onRequestClose).toHaveBeenCalledTimes(1);
    await expectOverlayClosed();

    await openOverlay(context);
    await userEvent.click(screen.getByTestId('overlay-content-container'));
    await expect(args.onRequestClose).toHaveBeenCalledTimes(2);
    await expectOverlayClosed();
  },
};

export const EscapeDisabled: Story = {
  args: { escapeCloses: false },
  play: async (context) => {
    await openOverlay(context);
    await context.userEvent.keyboard('{Escape}');
    await expect(context.args.onRequestClose).not.toHaveBeenCalled();
    screen.getByText('Hooray!');
  },
};

export const OutsideClickDisabled: Story = {
  args: { clickOutsideCloses: false },
  play: async (context) => {
    await openOverlay(context);
    await context.userEvent.click(
      screen.getByTestId('overlay-content-container')
    );
    await expect(context.args.onRequestClose).not.toHaveBeenCalled();
    screen.getByText('Hooray!');
  },
};

export const Inline: Story = {
  args: { inline: true },
  play: async (context) => {
    const { args, canvas, userEvent } = context;

    await openOverlay(context);
    canvas.getByText('Hooray!');
    canvas.getByRole('button', { name: 'Open Overlay' });

    await userEvent.click(canvas.getByTestId('overlay-content-container'));
    await userEvent.keyboard('{Escape}');
    await expect(args.onRequestClose).not.toHaveBeenCalled();
    canvas.getByText('Hooray!');
  },
};
