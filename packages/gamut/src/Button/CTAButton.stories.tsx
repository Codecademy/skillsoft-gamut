import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { CTAButton } from './CTAButton';

const meta: Meta<typeof CTAButton> = {
  title: 'Actions/Buttons/CTAButton',
  component: CTAButton,
  args: {
    children: 'Click Me',
    disabled: false,
  },
  argTypes: {
    href: {
      description: 'If defined, component will use an anchor tag',
      type: 'string',
    },
    as: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof CTAButton>;

export const Default: Story = {
  args: {},
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: 'Click Me' });
  },
};

export const AsAnchor: Story = {
  args: {
    href: 'https://www.codecademy.com',
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Click Me' });
    await expect(link).toHaveAttribute('href', 'https://www.codecademy.com');
  },
};
