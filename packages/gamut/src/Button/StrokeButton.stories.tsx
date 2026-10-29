import * as icons from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';

import { StrokeButton } from './StrokeButton';

const meta: Meta<typeof StrokeButton> = {
  title: 'Actions/Buttons/StrokeButton',
  component: StrokeButton,
  args: {
    children: 'Click Me',
    disabled: false,
    size: 'normal',
    variant: 'primary',
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

type Story = StoryObj<typeof StrokeButton>;

export const Default: Story = {
  args: {},
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: 'Click Me' });
  },
};
