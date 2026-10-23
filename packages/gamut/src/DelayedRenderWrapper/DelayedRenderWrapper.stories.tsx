import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { Box, FlexBox } from '../Box';
import { FillButton } from '../Button';
import { Text } from '../Typography';
import { DelayedRenderWrapper } from '.';

const meta: Meta<typeof DelayedRenderWrapper> = {
  title: 'Utilities/DelayedRenderWrapper',
  component: DelayedRenderWrapper,
  args: {
    delay: 1000,
  },
  argTypes: {
    delay: {
      control: { type: 'number', min: 0, step: 500 },
      description: 'Delay in milliseconds before rendering children',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '1000' },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof DelayedRenderWrapper>;

export const Default: Story = {
  render: function DelayedRenderDemo({ delay }) {
    const [showChildren, setShowChildren] = useState(false);

    return (
      <FlexBox column gap={16}>
        <Box>
          <FillButton onClick={() => setShowChildren(!showChildren)}>
            Render!
          </FillButton>
        </Box>
        {showChildren && (
          <DelayedRenderWrapper delay={delay}>
            <Text>
              This text will be delayed by {delay} milliseconds before
              rendering.
            </Text>
          </DelayedRenderWrapper>
        )}
      </FlexBox>
    );
  },
};

export const Immediate: Story = {
  args: {
    delay: 0,
    children: 'Child Content',
  },
  play: ({ canvas }) => {
    canvas.getByText('Child Content');
  },
};

export const Delayed: Story = {
  args: {
    delay: 300,
    children: 'Child Content',
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Child Content')).toBeNull();
    await waitFor(() => {
      canvas.getByText('Child Content');
    });
  },
};
