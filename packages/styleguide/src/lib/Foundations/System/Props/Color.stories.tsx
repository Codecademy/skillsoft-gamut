import { Box, FlexBox, Markdown } from '@skillsoft/gamut';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Box> = {
  title: 'Foundations/System/Props/Color',
  component: Box,
};

export default meta;
type Story = StoryObj<typeof Box>;

export const BorderColorExample: Story = {
  render: () => (
    <FlexBox gap={16} row>
      <Box
        bg="surface-sunken"
        border={1}
        borderColorX="text-success"
        borderColorY="text-error"
        borderWidth="4px"
        p={16}
        textAlign="center"
      >
        This box has{' '}
        <Markdown text="`borderColorX='text-success'` and `borderColorY='text-error'`." />{' '}
        Inspect the example to see what CSS properties are rendered based on the
        logical properties mode.
      </Box>
      <Box
        bg="surface-sunken"
        border={1}
        borderColorBottom="text-warning"
        borderColorLeft="text-success"
        borderColorRight="text-error"
        borderColorTop="action-primary"
        borderWidth="4px"
        p={16}
        textAlign="center"
      >
        This box has{' '}
        <Markdown text="`borderColorBottom='text-warning'`, `borderColorLeft='text-success'`, `borderColorRight='text-error'`, and `borderColorTop='action-primary'`." />{' '}
        Inspect the example to see what CSS properties are rendered based on the
        logical properties mode.
      </Box>
    </FlexBox>
  ),
};
