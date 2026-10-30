import * as icons from '@skillsoft/gamut-icons';
import { StarIcon } from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

import { TextButton } from './TextButton';

const meta: Meta<typeof TextButton> = {
  title: 'Actions/Buttons/TextButton',
  component: TextButton,
  args: {
    children: 'Click Me',
    disabled: false,
    size: 'normal',
    variant: 'primary',
    onClick: fn(),
  },
  argTypes: {
    href: {
      description: 'If defined, component will use an anchor tag',
      type: 'string',
    },
    variant: {
      table: { defaultValue: { summary: 'primary' } },
    },
    size: {
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
  },
};

export default meta;

type Story = StoryObj<typeof TextButton>;

export const Default: Story = {
  args: {},
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Click Me' }));
    await expect(args.onClick).toHaveBeenCalled();
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Leading icon',
    icon: StarIcon,
  },
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: 'Leading icon' });
    canvas.getByRole('img', { hidden: true });
  },
};
