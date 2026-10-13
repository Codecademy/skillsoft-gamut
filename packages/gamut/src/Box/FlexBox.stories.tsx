import type { Meta, StoryObj } from '@storybook/react';

import { Box, FlexBox } from '.';

const meta: Meta<typeof FlexBox> = {
  title: 'Layouts/Boxes/FlexBox',
  component: FlexBox,
  args: {},
};

export default meta;

type Story = StoryObj<typeof FlexBox>;

export const Default: Story = {
  render: (args) => {
    const elProps = {
      border: 1,
      p: 16,
    } as const;
    return (
      <FlexBox {...args}>
        <Box {...elProps}>Child Element 1</Box>
        <Box {...elProps}>Child Element 2</Box>
      </FlexBox>
    );
  },
};
