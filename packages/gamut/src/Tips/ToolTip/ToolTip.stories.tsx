import {
  ArrowRightIcon,
  DeleteIcon,
  SmileyStarEyesIcon,
  SparkleIcon,
  StudyBookIcon,
} from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, screen, waitFor } from 'storybook/test';

import { FlexBox } from '../../Box';
import { FillButton, IconButton, StrokeButton } from '../../Button';
import { ToolTip } from '.';

const meta: Meta<typeof ToolTip> = {
  title: 'Feedback/Tips/ToolTip',
  component: ToolTip,
  args: { id: 'fill-id', info: 'Tooltip' },
};

export default meta;
type Story = StoryObj<typeof ToolTip>;

const alignments = [
  'top-center',
  'bottom-center',
  'left-center',
  'right-center',
] as const;

const onTipTargetClick = fn();

const focusWithKeyboard = async (
  userEvent: Parameters<NonNullable<Story['play']>>[0]['userEvent'],
  element: HTMLElement
) => {
  for (let i = 0; i < 20 && document.activeElement !== element; i += 1) {
    await userEvent.tab();
  }
  await expect(element).toHaveFocus();
};

const expectFloatingTipShown = (text: string) =>
  waitFor(() => expect(screen.queryAllByText(text)).toHaveLength(2));

const expectFloatingTipHidden = (text: string) =>
  waitFor(() => expect(screen.queryAllByText(text)).toHaveLength(1));

export const Default: Story = {
  render: (args) => (
    <FlexBox center m={24} py={64}>
      <ToolTip {...args}>
        <FillButton
          aria-describedby="fill-id"
          icon={SparkleIcon}
          onClick={onTipTargetClick}
        >
          Click me
        </FillButton>
      </ToolTip>
    </FlexBox>
  ),
  play: async ({ canvas, userEvent }) => {
    const tip = canvas.getByRole('tooltip', { hidden: true });
    await expect(tip).toHaveTextContent('Tooltip');
    await expect(tip).not.toBeVisible();

    await focusWithKeyboard(
      userEvent,
      canvas.getByRole('button', { name: 'Click me' })
    );
    await waitFor(() => expect(tip).toBeVisible());

    await userEvent.click(canvas.getByRole('button', { name: 'Click me' }));
    await expect(onTipTargetClick).toHaveBeenCalled();
  },
};

export const Alignments: Story = {
  render: () => (
    <FlexBox justifyContent="space-around" m={24} width="95%">
      {alignments.map((alignment) => {
        return (
          <IconButton
            icon={SparkleIcon}
            key={alignment}
            tip={alignment}
            tipProps={{ alignment }}
          />
        );
      })}
    </FlexBox>
  ),
};

export const WithIconButton: Story = {
  render: () => (
    <FlexBox justifyContent="space-around" m={24} width="95%">
      <IconButton
        icon={SparkleIcon}
        tip="Wonder at the majesty of the universe"
        tipProps={{ alignment: 'left-center' }}
      />
      <IconButton
        icon={ArrowRightIcon}
        tip="Next Prompt"
        tipProps={{ alignment: 'bottom-center' }}
        variant="secondary"
      />
    </FlexBox>
  ),
};

export const Floating: Story = {
  render: () => (
    <FlexBox center justifyContent="space-around">
      <IconButton
        icon={SmileyStarEyesIcon}
        tip="Wonder at the majesty of the universe"
        tipProps={{ alignment: 'bottom-center', placement: 'floating' }}
      />
      <ToolTip
        id="floating-ex"
        info="Tooltip for a FillButton"
        placement="floating"
      >
        <FillButton
          aria-describedby="floating-ex"
          icon={StudyBookIcon}
          onClick={onTipTargetClick}
        >
          Also floating
        </FillButton>
      </ToolTip>
      <IconButton
        icon={SmileyStarEyesIcon}
        tip="Wonder at the majesty of the universe"
        tipProps={{ alignment: 'right-center', placement: 'floating' }}
      />
      <IconButton
        icon={SmileyStarEyesIcon}
        tip="Wonder at the majesty of the universe"
        tipProps={{ alignment: 'left-center', placement: 'floating' }}
      />
    </FlexBox>
  ),
  play: async ({ canvas, userEvent }) => {
    const tipText = 'Tooltip for a FillButton';
    await expect(canvas.getByText(tipText)).toHaveAttribute('role', 'tooltip');
    await expect(screen.queryAllByText(tipText)).toHaveLength(1);

    const button = canvas.getByRole('button', { name: 'Also floating' });
    await userEvent.hover(button);
    await expectFloatingTipShown(tipText);
    await userEvent.unhover(button);
    await expectFloatingTipHidden(tipText);

    button.focus();
    await expectFloatingTipShown(tipText);
    button.blur();
    await expectFloatingTipHidden(tipText);

    await userEvent.click(button);
    await expect(onTipTargetClick).toHaveBeenCalled();
  },
};

export const InteractiveElement: Story = {
  render: () => (
    <FlexBox center justifyContent="space-around">
      <ToolTip id="stroke-button-ex" info="And here's a tooltip">
        <StrokeButton aria-describedby="stroke-button-ex">
          I&apos;ve got my own text
        </StrokeButton>
      </ToolTip>
      <ToolTip
        alignment="left-center"
        id="floating-ex-lc"
        info="Tooltip for a FillButton"
        placement="floating"
      >
        <FillButton aria-describedby="floating-ex-lc" icon={StudyBookIcon}>
          Left center
        </FillButton>
      </ToolTip>
      <ToolTip
        alignment="right-center"
        id="floating-ex-rc"
        info="Tooltip for a FillButton"
        placement="floating"
      >
        <FillButton aria-describedby="floating-ex-rc" icon={StudyBookIcon}>
          Right center
        </FillButton>
      </ToolTip>
    </FlexBox>
  ),
};

export const Disabled: Story = {
  render: () => (
    <FlexBox center m={24}>
      <ToolTip id="disabled-ex" info="Tooltip still shows" placement="floating">
        <FillButton
          aria-describedby="disabled-ex"
          aria-disabled
          icon={DeleteIcon}
        >
          Using aria-disabled
        </FillButton>
      </ToolTip>
    </FlexBox>
  ),
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Using aria-disabled' });
    await expect(button).toHaveAttribute('aria-disabled', 'true');

    await userEvent.hover(button);
    await expectFloatingTipShown('Tooltip still shows');
  },
};

export const CloseOnClick: Story = {
  render: () => (
    <FlexBox center justifyContent="space-around" pt={48}>
      <ToolTip
        id="coc-floating"
        info="Closes on click (floating)"
        placement="floating"
      >
        <StrokeButton aria-describedby="coc-floating">Floating</StrokeButton>
      </ToolTip>
      <ToolTip
        id="coc-inline"
        info="Closes on click (inline)"
        placement="inline"
      >
        <StrokeButton aria-describedby="coc-inline">Inline</StrokeButton>
      </ToolTip>
      <ToolTip
        closeOnClick={false}
        id="stays-floating"
        info="Stays open on click (floating)"
        placement="floating"
      >
        <StrokeButton aria-describedby="stays-floating">
          Floating (stays open)
        </StrokeButton>
      </ToolTip>
      <ToolTip
        closeOnClick={false}
        id="stays-inline"
        info="Stays open on click (inline)"
        placement="inline"
      >
        <StrokeButton aria-describedby="stays-inline">
          Inline (stays open)
        </StrokeButton>
      </ToolTip>
    </FlexBox>
  ),
  play: async ({ canvas, userEvent }) => {
    const closes = canvas.getByRole('button', { name: 'Floating' });
    await userEvent.hover(closes);
    await expectFloatingTipShown('Closes on click (floating)');
    await userEvent.click(closes);
    await expectFloatingTipHidden('Closes on click (floating)');
    await userEvent.unhover(closes);

    const staysOpen = canvas.getByRole('button', {
      name: 'Floating (stays open)',
    });
    await userEvent.hover(staysOpen);
    await expectFloatingTipShown('Stays open on click (floating)');
    await userEvent.click(staysOpen);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(
      screen.queryAllByText('Stays open on click (floating)')
    ).toHaveLength(2);
    await userEvent.unhover(staysOpen);

    const inlineCloses = canvas.getByText('Closes on click (inline)');
    await focusWithKeyboard(
      userEvent,
      canvas.getByRole('button', { name: 'Inline' })
    );
    await waitFor(() => expect(inlineCloses).toBeVisible());
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(inlineCloses).not.toBeVisible());

    const inlineStays = canvas.getByText('Stays open on click (inline)');
    await focusWithKeyboard(
      userEvent,
      canvas.getByRole('button', { name: 'Inline (stays open)' })
    );
    await waitFor(() => expect(inlineStays).toBeVisible());
    await userEvent.keyboard('{Enter}');
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(inlineStays).toBeVisible();
  },
};

export const HorizontalAlignments: Story = {
  render: () => (
    <FlexBox justifyContent="space-around" width="95%">
      <IconButton
        icon={SparkleIcon}
        tip="Inline (Leading)"
        tipProps={{ alignment: 'left-center' }}
      />
      <IconButton
        icon={SparkleIcon}
        tip="Inline (Trailing)"
        tipProps={{ alignment: 'right-center' }}
      />
      <IconButton
        icon={SparkleIcon}
        tip="Floating (Leading)"
        tipProps={{ alignment: 'left-center', placement: 'floating' }}
      />
      <IconButton
        icon={DeleteIcon}
        tip="Floating (Trailing)"
        tipProps={{ alignment: 'right-center', placement: 'floating' }}
      />
    </FlexBox>
  ),
};

export const HorizontalAlignmentsRtl: Story = {
  ...HorizontalAlignments,
  tags: ['!autodocs'],
  globals: { direction: 'rtl' },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Floating (Leading)' });
    await userEvent.hover(button);

    await waitFor(async () => {
      const tip = screen.getByTestId('popover-content-container');
      await expect(tip.getBoundingClientRect().left).toBeGreaterThanOrEqual(
        button.getBoundingClientRect().right - 1
      );
    });
  },
};
