import type { Meta, StoryObj } from '@storybook/react';

import { Form } from './Form';

const meta: Meta<typeof Form> = {
  title: 'Inputs & forms/Form/Form',
  component: Form,
  args: {},
};

export default meta;
type Story = StoryObj<typeof Form>;

export const Default: Story = {
  args: {
    children: 'This is an empty form',
  },
  play: ({ canvas }) => {
    canvas.getByText('This is an empty form');
  },
};
