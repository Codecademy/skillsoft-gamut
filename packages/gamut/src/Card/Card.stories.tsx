import { ColorMode } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';

import { Anchor } from '../Anchor';
import { Box, FlexBox } from '../Box';
import { Card } from '.';

const meta: Meta<typeof Card> = {
  title: 'Containers/Card',
  component: Card,
  args: {
    children: 'Hello world I am a Card',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'brand'],
      table: {
        type: { summary: "'default' | 'brand'" },
        defaultValue: { summary: 'default' },
      },
    },
    shadow: {
      control: 'radio',
      options: ['none', 'patternLeft', 'patternRight', 'outline'],
      table: {
        type: {
          summary: "'none' | 'patternLeft' | 'patternRight' | 'outline'",
        },
        defaultValue: { summary: 'none' },
      },
    },
    borderRadius: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', 'full'],
      table: {
        type: { summary: "'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full'" },
        defaultValue: { summary: "isInteractive ? 'md' : 'none'" },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    shadow: 'patternRight',
    variant: 'default',
    isInteractive: true,
    borderRadius: 'md',
  },
  play: ({ canvas }) => {
    canvas.getByText('Hello world I am a Card');
  },
};

export const Variants: Story = {
  render: () => (
    <FlexBox column>
      <ColorMode bg="surface-default" mode="light">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card variant="default">Default, light mode</Card>
          </Box>
          <Box flexGrow={1}>
            <Card variant="brand">Brand, light mode</Card>
          </Box>
        </FlexBox>
      </ColorMode>
      <ColorMode bg="surface-default" mode="dark">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card variant="default">Default, dark mode</Card>
          </Box>
          <Box flexGrow={1}>
            <Card variant="brand">Brand, dark mode</Card>
          </Box>
        </FlexBox>
      </ColorMode>
    </FlexBox>
  ),
  play: ({ canvas }) => {
    canvas.getByText('Default, light mode');
    canvas.getByText('Brand, dark mode');
  },
};

export const ShadowOutline: Story = {
  render: () => (
    <FlexBox column>
      <ColorMode bg="surface-default" mode="light">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="outline" variant="default">
              Default with outline, light mode
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="outline" variant="brand">
              Brand with outline, light mode
            </Card>
          </Box>
        </FlexBox>
      </ColorMode>
      <ColorMode bg="surface-default" mode="dark">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="outline" variant="default">
              Default with outline, dark mode
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="outline" variant="brand">
              Brand with outline, dark mode
            </Card>
          </Box>
        </FlexBox>
      </ColorMode>
    </FlexBox>
  ),
};

export const ShadowPatternLeft: Story = {
  render: () => (
    <FlexBox column>
      <ColorMode bg="surface-default" mode="light">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="patternLeft" variant="default">
              Default with patternLeft, light mode
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="patternLeft" variant="brand">
              Brand with patternLeft, light mode
            </Card>
          </Box>
        </FlexBox>
      </ColorMode>
      <ColorMode bg="surface-default" mode="dark">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="patternLeft" variant="default">
              Default with patternLeft, dark mode
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="patternLeft" variant="brand">
              Brand with patternLeft, dark mode
            </Card>
          </Box>
        </FlexBox>
      </ColorMode>
    </FlexBox>
  ),
};

export const ShadowPatternRight: Story = {
  render: () => (
    <FlexBox column>
      <ColorMode bg="surface-default" mode="light">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="patternRight" variant="default">
              Default with patternRight, light mode
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="patternRight" variant="brand">
              Brand with patternRight, light mode
            </Card>
          </Box>
        </FlexBox>
      </ColorMode>
      <ColorMode bg="surface-default" mode="dark">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="patternRight" variant="default">
              Default with patternRight, dark mode
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="patternRight" variant="brand">
              Brand with patternRight, dark mode
            </Card>
          </Box>
        </FlexBox>
      </ColorMode>
    </FlexBox>
  ),
};

export const IsInteractive: Story = {
  render: () => (
    <FlexBox column>
      <ColorMode bg="surface-default" mode="light">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Anchor dimensions={1} href="" variant="interface">
              <Card isInteractive shadow="patternRight" variant="default">
                Default, patternRight and isInteractive, light mode
              </Card>
            </Anchor>
          </Box>
          <Box flexGrow={1}>
            <Anchor dimensions={1} href="" variant="interface">
              <Card isInteractive shadow="patternRight" variant="brand">
                Brand, patternRight and isInteractive, light mode
              </Card>
            </Anchor>
          </Box>
        </FlexBox>
      </ColorMode>
      <ColorMode bg="surface-default" mode="dark">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Anchor dimensions={1} href="" variant="interface">
              <Card isInteractive shadow="patternRight" variant="default">
                Default, patternRight and isInteractive, dark mode
              </Card>
            </Anchor>
          </Box>
          <Box flexGrow={1}>
            <Anchor dimensions={1} href="" variant="interface">
              <Card isInteractive shadow="patternRight" variant="brand">
                Brand, patternRight and isInteractive, dark mode
              </Card>
            </Anchor>
          </Box>
        </FlexBox>
      </ColorMode>
    </FlexBox>
  ),
  play: ({ canvas }) => {
    canvas.getByText('Default, patternRight and isInteractive, light mode');
    canvas.getByText('Brand, patternRight and isInteractive, dark mode');
  },
};

export const Dynamic: Story = {
  render: () => (
    <FlexBox row>
      <ColorMode
        bg="surface-default"
        border={1}
        flexGrow={1}
        mode="light"
        p={32}
      >
        <Card>Lookie here, a default variant in light mode!</Card>
      </ColorMode>
      <ColorMode bg="surface-default" flexGrow={1} mode="dark" p={32}>
        <Card>Lookie here, a default variant in dark mode!</Card>
      </ColorMode>
    </FlexBox>
  ),
};

export const BorderRadius: Story = {
  render: () => (
    <FlexBox border={1} gap={16} p={24}>
      <Box flexGrow={1}>
        <Card borderRadius="sm" isInteractive shadow="outline" variant="brand">
          Brand, isInteractive, outline, and borderRadius is &apos;sm&apos;
        </Card>
      </Box>
      <Box flexGrow={1}>
        <Card borderRadius="xl" shadow="patternLeft">
          Default, patternLeft, and borderRadius is &apos;xl&apos;
        </Card>
      </Box>
    </FlexBox>
  ),
};
