import { Box, RadialProgress } from '@skillsoft/gamut';
import { Video } from '@skillsoft/gamut/Video';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof RadialProgress> = {
  component: RadialProgress,
  args: {
    strokeLinecap: 'round',
    strokeWidth: 10,
    value: 30,
    size: 120,
    children: '',
  },
};

export default meta;
type Story = StoryObj<typeof RadialProgress>;

export const Default: Story = {
  args: {},
};

export const Children: Story = {
  args: {
    children: '75%',
    size: 60,
    value: 75,
  },
};

export const Animating: Story = {
  args: {
    value: [0, 100],
    duration: 5000,
  },
};
