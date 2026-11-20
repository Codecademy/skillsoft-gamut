import * as patterns from '@skillsoft/gamut-patterns';
import type { Decorator, Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, screen, waitFor } from 'storybook/test';

import { Box, FlexBox } from '../Box';
import { FillButton } from '../Button';
import { Popover } from '.';

const meta: Meta<typeof Popover> = {
  title: 'Overlays/Popover',
  component: Popover,
  args: { children: undefined },
  argTypes: {
    pattern: {
      control: 'select',
      options: Object.keys(patterns),
      mapping: patterns,
    },
    outline: {
      control: false,
      table: { disable: true },
    },
  },
  render: function PopoverWithTrigger(args) {
    const [open, setOpen] = useState(false);
    const activeElRef = useRef<HTMLDivElement>(null);

    return (
      <>
        <Box ref={activeElRef} width="fit-content">
          <FillButton onClick={() => setOpen(!open)}>Open Popover</FillButton>
        </Box>
        <FlexBox>
          <Popover
            {...(args as any)}
            isOpen={open}
            targetRef={activeElRef}
            onRequestClose={() => setOpen(false)}
          >
            <FlexBox alignItems="flex-start" flexDirection="column" p={16}>
              <Box mb={8}>Hooray!</Box>
              <FillButton size="sm" onClick={() => setOpen(false)}>
                Close Popover
              </FillButton>
            </FlexBox>
          </Popover>
        </FlexBox>
      </>
    );
  },
};

export default meta;
type Story = StoryObj<typeof Popover>;

const openPopover: NonNullable<Story['play']> = async ({
  canvas,
  userEvent,
}) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Open Popover' }));
  await screen.findByTestId('popover-content-container');
};

const expectPopoverClosed = () =>
  waitFor(() =>
    expect(screen.queryByTestId('popover-content-container')).toBeNull()
  );

type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

const getTargetRect = (canvas: Canvas) =>
  canvas
    .getByRole('button', { name: 'Open Popover' })
    .parentElement!.getBoundingClientRect();

const getPopoverRect = () =>
  screen.getByTestId('popover-content-container').getBoundingClientRect();

const toBeWithin1px = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(1);

const centered: Decorator = (StoryComponent) => (
  <FlexBox center height="24rem">
    <StoryComponent />
  </FlexBox>
);

export const Default: Story = {
  play: async (context) => {
    const { canvasElement, userEvent } = context;
    await expect(screen.queryByText('Hooray!')).toBeNull();

    await openPopover(context);
    screen.getByText('Hooray!');
    await expect(screen.queryByTestId('popover-beak')).toBeNull();
    await expect(screen.queryByTestId('popover-pattern')).toBeNull();

    await userEvent.click(screen.getByText('Hooray!'));
    screen.getByText('Hooray!');

    await userEvent.keyboard('{Escape}');
    await expectPopoverClosed();

    await openPopover(context);
    await userEvent.click(canvasElement);
    await expectPopoverClosed();

    await openPopover(context);
    await userEvent.click(
      screen.getByRole('button', { name: 'Close Popover' })
    );
    await expectPopoverClosed();
  },
};

export const Beak: Story = {
  args: { beak: 'start', position: 'below' },
  play: async (context) => {
    await openPopover(context);
    screen.getByTestId('popover-beak');
  },
};

export const BeakCentered: Story = {
  args: { beak: 'center' },
};

export const Above: Story = {
  args: { beak: 'center', position: 'above' },
};

export const Below: Story = {
  args: { beak: 'center', position: 'below' },
};

export const CenterLeft: Story = {
  args: { align: 'start', beak: 'center', position: 'center' },
};

export const CenterRight: Story = {
  args: { align: 'end', beak: 'center', position: 'center' },
};

export const PopoverCheckerDense: Story = {
  args: { pattern: patterns.CheckerDense, position: 'below' },
  play: async (context) => {
    await openPopover(context);
    screen.getByTestId('popover-pattern');
  },
};

export const PopoverCheckerLoose: Story = {
  args: { pattern: patterns.CheckerLoose, position: 'below' },
};

export const PopoverCheckerRegular: Story = {
  args: { pattern: patterns.CheckerRegular, position: 'below' },
};

export const PopoverDiagonalADense: Story = {
  args: { pattern: patterns.DiagonalADense, position: 'below' },
};

export const PopoverDiagonalALoose: Story = {
  args: { pattern: patterns.DiagonalALoose, position: 'below' },
};

export const PopoverDiagonalARegular: Story = {
  args: { pattern: patterns.DiagonalARegular, position: 'below' },
};

export const WithoutFocus: Story = {
  render: function PopoverWithoutFocus(args) {
    const [open, setOpen] = useState(false);
    const activeElRef = useRef<HTMLDivElement>(null);

    return (
      <>
        <Box ref={activeElRef}>
          <FillButton onClick={() => setOpen(!open)}>Open Popover</FillButton>
        </Box>
        <FlexBox>
          <Popover
            {...(args as any)}
            isOpen={open}
            targetRef={activeElRef}
            onRequestClose={() => setOpen(false)}
          >
            <FlexBox alignItems="flex-start" flexDirection="column" p={16}>
              Nothing clickable here but the container has fallback focus
            </FlexBox>
          </Popover>
        </FlexBox>
      </>
    );
  },
  play: async (context) => {
    await openPopover(context);
    await waitFor(() =>
      expect(screen.getByTestId('popover-content-container')).toHaveFocus()
    );
  },
};

export const Animation: Story = {
  args: { animation: 'fade' },
  render: WithoutFocus.render,
};

export const Variant: Story = {
  args: {
    align: 'center',
    beak: 'start',
    position: 'above',
    variant: 'secondary',
  },
};

export const PositionBelowLeft: Story = {
  decorators: [centered],
  play: async (context) => {
    await openPopover(context);
    await waitFor(async () => {
      const target = getTargetRect(context.canvas);
      const popover = getPopoverRect();
      await toBeWithin1px(popover.top, target.bottom + 20);
      await toBeWithin1px(popover.left, target.left);
    });

    const { style } = screen.getByTestId('popover-content-container');
    await expect(style.top).toMatch(/^-?\d+px$/);
    await expect(style.left).toMatch(/^-?\d+px$/);
  },
};

export const PositionAboveRight: Story = {
  args: { position: 'above', align: 'end' },
  decorators: [centered],
  play: async (context) => {
    await openPopover(context);
    await waitFor(async () => {
      const target = getTargetRect(context.canvas);
      const popover = getPopoverRect();
      await toBeWithin1px(popover.bottom, target.top - 20);
      await toBeWithin1px(popover.right, target.right);
    });
  },
};

export const VerticalOffset: Story = {
  args: { verticalOffset: 29 },
  decorators: [centered],
  play: async (context) => {
    await openPopover(context);
    await waitFor(async () => {
      const target = getTargetRect(context.canvas);
      await toBeWithin1px(getPopoverRect().top, target.bottom + 29);
    });
  },
};

export const HorizontalOffset: Story = {
  args: { horizontalOffset: 30 },
  decorators: [centered],
  play: async (context) => {
    await openPopover(context);
    await waitFor(async () => {
      const target = getTargetRect(context.canvas);
      await toBeWithin1px(getPopoverRect().left, target.left - 30);
    });
  },
};

export const ScrolledOutOfView: Story = {
  decorators: [
    (StoryComponent) => (
      <Box data-testid="scroll-container" height="12rem" overflow="auto">
        <StoryComponent />
        <Box height="60rem" />
      </Box>
    ),
  ],
  play: async (context) => {
    await openPopover(context);
    screen.getByText('Hooray!');

    context.canvas.getByTestId('scroll-container').scrollTop = 400;
    await expectPopoverClosed();
  },
};

export const RtlAlignLeft: Story = {
  tags: ['!autodocs'],
  globals: { direction: 'rtl' },
  args: { align: 'start' },
  decorators: [centered],
  play: async (context) => {
    await expect(document.documentElement).toHaveAttribute('dir', 'rtl');
    await openPopover(context);
    await waitFor(async () => {
      const target = getTargetRect(context.canvas);
      await toBeWithin1px(getPopoverRect().right, target.right);
    });
  },
};

export const RtlAlignRight: Story = {
  tags: ['!autodocs'],
  globals: { direction: 'rtl' },
  args: { align: 'end' },
  decorators: [centered],
  play: async (context) => {
    await openPopover(context);
    await waitFor(async () => {
      const target = getTargetRect(context.canvas);
      await toBeWithin1px(getPopoverRect().left, target.left);
    });
  },
};

export const RtlCenterAlignLeft: Story = {
  tags: ['!autodocs'],
  globals: { direction: 'rtl' },
  args: {
    align: 'start',
    beak: 'center',
    position: 'center',
    variant: 'secondary',
  },
  decorators: [centered],
  play: async (context) => {
    await openPopover(context);
    await waitFor(async () => {
      const target = getTargetRect(context.canvas);
      await expect(getPopoverRect().left).toBeGreaterThanOrEqual(
        target.right - 1
      );
    });
  },
};

export const RtlCenterAlignRight: Story = {
  tags: ['!autodocs'],
  globals: { direction: 'rtl' },
  args: {
    align: 'end',
    beak: 'center',
    position: 'center',
    variant: 'secondary',
  },
  decorators: [centered],
  play: async (context) => {
    await openPopover(context);
    await waitFor(async () => {
      const target = getTargetRect(context.canvas);
      await expect(getPopoverRect().right).toBeLessThanOrEqual(target.left + 1);
    });
  },
};
