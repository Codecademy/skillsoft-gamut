import type { Meta, StoryObj } from '@storybook/react';

import { ContentContainer } from '.';

const sizes = ['small', 'medium', 'wide'] as const;

const meta: Meta<typeof ContentContainer> = {
  title: 'Containers/ContentContainer',
  component: ContentContainer,
  args: { children: 'Some random content' },
  argTypes: {
    size: {
      control: 'radio',
      options: sizes,
      table: {
        type: { summary: sizes.join(' | ') },
        defaultValue: { summary: 'medium' },
      },
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
