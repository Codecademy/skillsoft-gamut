import * as icons from '@skillsoft/gamut-icons';
import { SparkleIcon } from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, screen, waitFor } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { FlexBox } from '../Box';
import { IconButton } from './IconButton';

const meta: TypeWithDeepControls<Meta<typeof IconButton>> = {
  title: 'Actions/Buttons/IconButton',
  component: IconButton,
  parameters: { deepControls: { enabled: true } },
  args: {
    disabled: false,
    size: 'normal',
    icon: icons.SearchIcon,
    tip: 'ToolTip',
    tipProps: { placement: 'floating', alignment: 'top-center' },
    variant: 'secondary',
    onClick: fn(),
  },
  argTypes: {
    href: {
      description: 'If defined, component will use an anchor tag',
      type: 'string',
    },
    variant: {
      control: 'radio',
    },
    size: {
      control: 'radio',
      table: { defaultValue: { summary: 'normal' } },
    },
    icon: {
      control: 'select',
      options: Object.keys(icons),
      mapping: icons,
    },
    as: {
      table: {
        disable: true,
      },
    },
    'tipProps.placement': {
      control: 'radio',
      options: ['floating', 'inline'],
    },
    'tipProps.alignment': {
      control: 'radio',
      options: ['top-center', 'bottom-center', 'left-center', 'right-center'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof IconButton>;

export const Default: Story = {
  args: {},
  play: async ({ args, canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'ToolTip' });
    canvas.getByRole('img', { hidden: true });
    await expect(
      canvas.getByRole('tooltip', { hidden: true })
    ).toHaveTextContent('ToolTip');

    await expect(screen.queryAllByText('ToolTip')).toHaveLength(1);
    await userEvent.hover(button);
    await waitFor(() =>
      expect(screen.queryAllByText('ToolTip')).toHaveLength(2)
    );

    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const AriaLabel: Story = {
  args: {
    'aria-label': 'Search the catalog',
  },
  play: async ({ canvas }) => {
    canvas.getByRole('button', { name: 'Search the catalog' });
    await expect(
      canvas.getByRole('tooltip', { hidden: true })
    ).toHaveTextContent('ToolTip');
  },
};

export const CloseOnClick: Story = {
  render: (args) => (
    <FlexBox center justifyContent="space-around" pt={48}>
      <IconButton
        icon={SparkleIcon}
        tip="Closes on click (floating)"
        tipProps={{ placement: 'floating', alignment: 'top-center' }}
        onClick={args.onClick}
      />
      <IconButton
        icon={SparkleIcon}
        tip="Closes on click (inline)"
        tipProps={{ placement: 'inline', alignment: 'top-center' }}
        onClick={args.onClick}
      />
      <IconButton
        icon={SparkleIcon}
        tip="Stays open on click (floating)"
        tipProps={{
          placement: 'floating',
          alignment: 'top-center',
          closeOnClick: false,
        }}
        onClick={args.onClick}
      />
      <IconButton
        icon={SparkleIcon}
        tip="Stays open on click (inline)"
        tipProps={{
          placement: 'inline',
          alignment: 'top-center',
          closeOnClick: false,
        }}
        onClick={args.onClick}
      />
    </FlexBox>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const tips = [
      'Closes on click (floating)',
      'Closes on click (inline)',
      'Stays open on click (floating)',
      'Stays open on click (inline)',
    ];

    for (const tip of tips) {
      await userEvent.click(canvas.getByRole('button', { name: tip }));
    }

    await expect(args.onClick).toHaveBeenCalledTimes(tips.length);
  },
};
