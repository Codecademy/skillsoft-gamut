import type { Meta, StoryObj } from '@storybook/react';

import { RadialProgress } from '.';

const meta: Meta<typeof RadialProgress> = {
  title: 'Status/RadialProgress',
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
  play: ({ canvas }) => {
    canvas.getByText('30% progress');
  },
};

export const Children: Story = {
  args: {
    children: '75%',
    size: 60,
    value: 75,
  },
  play: ({ canvas }) => {
    canvas.getByText('75%');
    canvas.getByText('75% progress');
  },
};

export const Animating: Story = {
  args: {
    value: [0, 100],
    duration: 5000,
  },
  play: ({ canvas }) => {
    canvas.getByText('100% progress');
  },
};
