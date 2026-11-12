import * as icons from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';

import { Box, FlexBox } from '../Box';
import { Badge } from '.';

const meta: Meta<typeof Badge> = {
  title: 'Status/Badge',
  component: Badge,
  args: { children: 'Badge' },
  argTypes: {
    icon: {
      control: 'select',
      options: Object.keys(icons),
      mapping: icons,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
  args: {},
  play: ({ canvas }) => {
    canvas.getByText('Badge');
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
  },
};

export const TertiaryFill: Story = {
  args: {
    icon: icons.MiniStarIcon,
    variant: 'tertiaryFill',
  },
  decorators: [
    (Story) => (
      <Box bg="surface-default" height="30px" pt={16}>
        <Box left={12} position="absolute" top={12}>
          <Story />
        </Box>
        <Box bg="text-default" height="100%" width="100%" />
      </Box>
    ),
  ],
};

export const Accent: Story = {
  args: {
    variant: 'accent',
  },
};

export const Custom: Story = {
  render: (args) => (
    <FlexBox gap={8}>
      <Badge
        background="linear-gradient(91deg, #FFE712 0.08%, #FF9641 100%)"
        variant="custom"
        {...args}
      />
      <Badge bg="palette-success-300" variant="custom" {...args} />
      <Badge bg="palette-warning-300" variant="custom" {...args} />
      <Badge
        bg="palette-primary-400"
        variant="custom"
        {...args}
        icon={icons.MiniStarIcon}
      />
    </FlexBox>
  ),
};

export const DefaultSize: Story = {
  args: {
    children: 'default size',
  },
};

export const SmallSize: Story = {
  args: {
    children: 'sm size',
    size: 'sm',
    variant: 'tertiary',
  },
};

export const DefaultSizeWithIcon: Story = {
  args: {
    children: 'sample icon',
    variant: 'tertiaryFill',
    icon: icons.MiniStarIcon,
  },
};

export const SmallSizeWithIcon: Story = {
  args: {
    children: 'sm icon',
    size: 'sm',
    variant: 'accent',
    icon: icons.MiniWarningTriangleIcon,
  },
};
