import type { Meta, StoryObj } from '@storybook/react';

import { Shimmer } from './Shimmer';

const meta: Meta<typeof Shimmer> = {
  title: 'Status/Shimmer',
  component: Shimmer,
  args: {},
};

export default meta;
type Story = StoryObj<typeof Shimmer>;

export const Default: Story = {
  args: {
    height: 200,
  },
};
