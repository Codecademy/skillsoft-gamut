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
        bg={{ _: 'paleBlue', md: 'orange' }}
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
        bg={{ _: 'paleBlue', c_md: 'orange' }}
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
          _: 'beige',
          md: 'background-disabled',
          c_lg: 'primary-inverse',
        }}
        border={1}
        borderRadius="sm"
        p={16}
      >
        My background color will change at the medium media-query breakpoint and
        at the large container-query breakpoint.
      </Box>
    </Box>
  ),
};
