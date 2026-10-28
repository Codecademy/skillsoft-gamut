import * as patterns from '@skillsoft/gamut-patterns';
import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, screen, waitFor } from 'storybook/test';

import type { FlexBoxProps } from '../Box';
import { Box, FlexBox } from '../Box';
import { FillButton } from '../Button';
import type { PopoverProps } from '.';
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
};

export default meta;
type Story = StoryObj<typeof Popover>;

type PopoverExampleProps = PopoverProps & Pick<FlexBoxProps, 'p'>;

const PopoverExample = ({ p = 16, ...rest }: PopoverExampleProps) => {
  const [open, setOpen] = useState(false);
  const activeElRef = useRef<HTMLDivElement>(null);
  const toggleOpen = () => setOpen(!open);
  return (
    <>
      <Box ref={activeElRef} width="fit-content">
        <FillButton onClick={toggleOpen}>Open Popover</FillButton>
      </Box>
      <FlexBox>
        <Popover
          {...(rest as any)}
          isOpen={open}
          targetRef={activeElRef}
          onRequestClose={() => setOpen(false)}
        >
          <FlexBox alignItems="flex-start" flexDirection="column" p={p}>
            <Box mb={8}>Hooray!</Box>
            <FillButton size="small" onClick={() => setOpen(false)}>
              Close Popover
            </FillButton>
          </FlexBox>
        </Popover>
      </FlexBox>
    </>
  );
};

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

const renderCentered: Story['render'] = (args) => (
  <FlexBox center height="24rem">
    <PopoverExample {...args} />
  </FlexBox>
);

export const Default: Story = {
  render: (args) => <PopoverExample {...args} />,
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
  render: (args) => <PopoverExample {...args} beak="left" position="below" />,
  play: async (context) => {
    await openPopover(context);
    screen.getByTestId('popover-beak');
  },
};

export const BeakCentered: Story = {
  render: (args) => <PopoverExample {...args} beak="center" p={0} />,
};

export const Above: Story = {
  render: (args) => <PopoverExample {...args} beak="center" position="above" />,
};

export const Below: Story = {
  render: (args) => <PopoverExample {...args} beak="center" position="below" />,
};

export const CenterLeft: Story = {
  render: (args) => (
    <PopoverExample
      {...args}
      align="left"
      beak="center"
      pattern={undefined}
      position="center"
    />
  ),
};

export const CenterRight: Story = {
  render: (args) => (
    <PopoverExample
      {...args}
      align="right"
      beak="center"
      pattern={undefined}
      position="center"
    />
  ),
};

export const PopoverCheckerDense: Story = {
  render: (args) => (
    <PopoverExample
      {...args}
      pattern={patterns.CheckerDense}
      position="below"
    />
  ),
  play: async (context) => {
    await openPopover(context);
    screen.getByTestId('popover-pattern');
  },
};

export const PopoverCheckerLoose: Story = {
  render: (args) => (
    <PopoverExample
      {...args}
      pattern={patterns.CheckerLoose}
      position="below"
    />
  ),
};

export const PopoverCheckerRegular: Story = {
  render: (args) => (
    <PopoverExample
      {...args}
      pattern={patterns.CheckerRegular}
      position="below"
    />
  ),
};

export const PopoverDiagonalADense: Story = {
  render: (args) => (
    <PopoverExample
      {...args}
      pattern={patterns.DiagonalADense}
      position="below"
    />
  ),
};

export const PopoverDiagonalALoose: Story = {
  render: (args) => (
    <PopoverExample
      {...args}
      pattern={patterns.DiagonalALoose}
      position="below"
    />
  ),
};

export const PopoverDiagonalARegular: Story = {
  render: (args) => (
    <PopoverExample
      {...args}
      pattern={patterns.DiagonalARegular}
      position="below"
    />
  ),
};

const PopoverWithoutFocus = (args: PopoverProps) => {
  const [open, setOpen] = useState(false);
  const activeElRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => setOpen(!open);

  return (
    <>
      <Box ref={activeElRef}>
        <FillButton onClick={toggleOpen}>Open Popover</FillButton>
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
};

export const WithoutFocus: Story = {
  render: (args) => <PopoverWithoutFocus {...args} />,
  play: async (context) => {
    await openPopover(context);
    await waitFor(() =>
      expect(screen.getByTestId('popover-content-container')).toHaveFocus()
    );
  },
};

export const Animation: Story = {
  render: (args) => <PopoverWithoutFocus animation="fade" {...args} />,
};

export const Variant: Story = {
  render: (args) => (
    <PopoverExample
      {...args}
      align="center"
      beak="left"
      position="above"
      variant="secondary"
    />
  ),
};

export const PositionBelowLeft: Story = {
  render: renderCentered,
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
  args: { position: 'above', align: 'right' },
  render: renderCentered,
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
  render: renderCentered,
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
  render: renderCentered,
  play: async (context) => {
    await openPopover(context);
    await waitFor(async () => {
      const target = getTargetRect(context.canvas);
      await toBeWithin1px(getPopoverRect().left, target.left - 30);
    });
  },
};

export const ScrolledOutOfView: Story = {
  render: (args) => (
    <Box data-testid="scroll-container" height="12rem" overflow="auto">
      <PopoverExample {...args} />
      <Box height="60rem" />
    </Box>
  ),
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
  args: { align: 'left' },
  render: renderCentered,
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
  args: { align: 'right' },
  render: renderCentered,
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
    align: 'left',
    beak: 'center',
    position: 'center',
    variant: 'secondary',
  },
  render: renderCentered,
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
    align: 'right',
    beak: 'center',
    position: 'center',
    variant: 'secondary',
  },
  render: renderCentered,
  play: async (context) => {
    await openPopover(context);
    await waitFor(async () => {
      const target = getTargetRect(context.canvas);
      await expect(getPopoverRect().right).toBeLessThanOrEqual(target.left + 1);
    });
  },
};
