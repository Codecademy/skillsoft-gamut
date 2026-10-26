import type { Meta, StoryObj } from '@storybook/react';

import { Spinner } from './Spinner';

const meta: Meta<typeof Spinner> = {
  title: 'Status/Spinner',
  component: Spinner,
  args: {},
};

export default meta;
type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
  args: {
    size: 60,
  },
  play: ({ canvas }) => {
    canvas.getByTitle('Spinner');
  },
};
