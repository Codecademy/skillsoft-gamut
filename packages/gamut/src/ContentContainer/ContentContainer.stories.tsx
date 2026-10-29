import type { Meta, StoryObj } from '@storybook/react';

import { ContentContainer } from '.';

const meta: Meta<typeof ContentContainer> = {
  title: 'Containers/ContentContainer',
  component: ContentContainer,
  args: { children: 'Some random content' },
  argTypes: {
    size: {
      table: { defaultValue: { summary: 'medium' } },
    },
  },
};

export default meta;

type Story = StoryObj<typeof ContentContainer>;

export const Default: Story = {
  args: { size: 'medium' },
};

export const Wide: Story = {
  args: {
    size: 'wide',
  },
};
