import { Box, FlexBox } from '@skillsoft/gamut';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FlexBox> = {
  title: 'Foundations/System/Responsive properties',
  component: FlexBox,
  args: {
    center: true,
    height: '500px',
    width: 1,
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const MediaQueries: Story = {
  render: (args) => (
    <FlexBox {...args}>
      <Box
        bg={{ _: 'surface-brand-subtle', md: 'surface-warning' }}
        border={1}
        borderRadius="sm"
        p={16}
      >
        My background color will change at the medium media-query breakpoint.
      </Box>
    </FlexBox>
  ),
};

export const ContainerQueries: Story = {
  render: (args) => (
    <FlexBox containerType="inline-size" {...args}>
      <Box
        bg={{ _: 'surface-brand-subtle', c_md: 'surface-warning' }}
        border={1}
        borderRadius="sm"
        p={16}
      >
        My background color will change at the medium container-query
        breakpoint.
      </Box>
    </FlexBox>
  ),
};

export const CombinedQueries: Story = {
  render: (args) => (
    <FlexBox containerType="inline-size" {...args}>
      <Box
        bg={{
          _: 'surface-default',
          md: 'action-disabled',
          c_lg: 'action-primary',
        }}
        border={1}
        borderRadius="sm"
        color={{ _: 'text-default', c_lg: 'text-inverse' }}
        p={16}
      >
        My background color will change at the medium media-query breakpoint and
        at the large container-query breakpoint.
      </Box>
    </FlexBox>
  ),
};
