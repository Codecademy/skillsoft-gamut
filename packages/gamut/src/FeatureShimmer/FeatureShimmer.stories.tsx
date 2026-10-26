import type { Meta, StoryObj } from '@storybook/react';

import { Text } from '../Typography';
import { FeatureShimmer } from '.';

const meta: Meta<typeof FeatureShimmer> = {
  title: 'Status/FeatureShimmer',
  component: FeatureShimmer,
  args: {
    children: <Text p={12}>This is a test</Text>,
    height: '144px',
  },
};

export default meta;
type Story = StoryObj<typeof FeatureShimmer>;

export const Default: Story = {
  play: ({ canvas }) => {
    canvas.getByText('This is a test');
    canvas.getByTestId('feature-shimmer');
  },
};
