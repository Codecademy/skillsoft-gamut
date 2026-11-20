import styled from '@emotion/styled';
import { variance } from '@skillsoft/variance';
import type { Meta, StoryObj } from '@storybook/react';

import { system } from '../variance';

const Box = styled.div(
  variance.compose(
    system.layout,
    system.flex,
    system.space,
    system.border,
    system.color
  )
);

const meta: Meta<typeof Box> = {
  title: 'Foundations/Responsive properties',
  component: Box,
  parameters: {
    controls: { disable: true },
    docs: { propsTable: false },
  },
  args: {
    alignItems: 'center',
    display: 'flex',
    height: '500px',
    justifyContent: 'center',
    width: 1,
  },
};

export default meta;
type Story = StoryObj<typeof Box>;

export const MediaQueries: Story = {
  render: (args) => (
    <Box {...args}>
      <Box
        bg={{ _: 'surface-brand-subtle', md: 'surface-warning' }}
        border={1}
        borderRadius="sm"
        p={16}
      >
        My background color will change at the medium media-query breakpoint.
      </Box>
    </Box>
  ),
};

export const ContainerQueries: Story = {
  render: (args) => (
    <Box containerType="inline-size" {...args}>
      <Box
        bg={{ _: 'surface-brand-subtle', c_md: 'surface-warning' }}
        border={1}
        borderRadius="sm"
        p={16}
      >
        My background color will change at the medium container-query
        breakpoint.
      </Box>
    </Box>
  ),
};

export const CombinedQueries: Story = {
  render: (args) => (
    <Box containerType="inline-size" {...args}>
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
    </Box>
  ),
};
