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
      options: ['default', 'white', 'yellow', 'beige', 'navy', 'hyper'],
      table: {
        type: {
          summary:
            "'default' | 'white' | 'yellow' | 'beige' | 'navy' | 'hyper'",
        },
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

export const StaticLight: Story = {
  render: () => (
    <ColorMode bg="surface-default" mode="light">
      <FlexBox border={1} gap={16} p={16} row>
        <Box flexGrow={1}>
          <Card variant="white">White variant</Card>
        </Box>
        <Box flexGrow={1}>
          <Card variant="yellow">Yellow variant</Card>
        </Box>
        <Box flexGrow={1}>
          <Card variant="beige">Beige variant</Card>
        </Box>
      </FlexBox>
    </ColorMode>
  ),
  play: ({ canvas }) => {
    canvas.getByText('White variant');
    canvas.getByText('Yellow variant');
    canvas.getByText('Beige variant');
  },
};

export const StaticDark: Story = {
  render: () => (
    <ColorMode bg="surface-default" mode="dark">
      <FlexBox border={1} gap={16} p={16} row>
        <Box flexGrow={1}>
          <Card variant="navy">Navy variant</Card>
        </Box>
        <Box flexGrow={1}>
          <Card variant="hyper">Hyper variant</Card>
        </Box>
      </FlexBox>
    </ColorMode>
  ),
};

export const ShadowNone: Story = {
  render: () => (
    <FlexBox column>
      <FlexBox border={1} p={16}>
        <Box flexGrow={1}>
          <Card>Default variant</Card>
        </Box>
      </FlexBox>
      <ColorMode bg="surface-default" mode="light">
        <FlexBox border={1} gap={16} p={16} row>
          <Box flexGrow={1}>
            <Card variant="white">White variant</Card>
          </Box>
          <Box flexGrow={1}>
            <Card variant="yellow">Yellow variant</Card>
          </Box>
          <Box flexGrow={1}>
            <Card variant="beige">Beige variant</Card>
          </Box>
        </FlexBox>
      </ColorMode>
      <ColorMode bg="surface-default" mode="dark">
        <FlexBox border={1} gap={16} p={16} row>
          <Box flexGrow={1}>
            <Card variant="navy">Navy variant</Card>
          </Box>
          <Box flexGrow={1}>
            <Card variant="hyper">Hyper variant</Card>
          </Box>
        </FlexBox>
      </ColorMode>
    </FlexBox>
  ),
};

export const ShadowOutline: Story = {
  render: () => (
    <FlexBox column>
      <FlexBox border={1} p={24}>
        <Box flexGrow={1}>
          <Card shadow="outline">Default with outline</Card>
        </Box>
      </FlexBox>
      <ColorMode bg="surface-default" mode="light">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="outline" variant="white">
              White with outline
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="outline" variant="yellow">
              Yellow with outline
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="outline" variant="beige">
              Beige with outline
            </Card>
          </Box>
        </FlexBox>
      </ColorMode>
      <ColorMode bg="surface-default" mode="dark">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="outline" variant="navy">
              Navy with outline
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="outline" variant="hyper">
              Hyper with outline
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
      <FlexBox border={1} p={24}>
        <Box flexGrow={1}>
          <Card shadow="patternLeft">Default with patternLeft</Card>
        </Box>
      </FlexBox>
      <ColorMode bg="surface-default" mode="light">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="patternLeft" variant="white">
              White with patternLeft
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="patternLeft" variant="yellow">
              Yellow with patternLeft
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="patternLeft" variant="beige">
              Beige with patternLeft
            </Card>
          </Box>
        </FlexBox>
      </ColorMode>
      <ColorMode bg="surface-default" mode="dark">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="patternLeft" variant="navy">
              Navy with patternLeft
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="patternLeft" variant="hyper">
              Hyper with patternLeft
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
      <FlexBox border={1} p={24}>
        <Box flexGrow={1}>
          <Card shadow="patternRight">Default with patternRight</Card>
        </Box>
      </FlexBox>
      <ColorMode bg="surface-default" mode="light">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="patternRight" variant="white">
              White with patternRight
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="patternRight" variant="yellow">
              Yellow with patternRight
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="patternRight" variant="beige">
              Beige with patternRight
            </Card>
          </Box>
        </FlexBox>
      </ColorMode>
      <ColorMode bg="surface-default" mode="dark">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Card shadow="patternRight" variant="navy">
              Navy with patternRight
            </Card>
          </Box>
          <Box flexGrow={1}>
            <Card shadow="patternRight" variant="hyper">
              Hyper with patternRight
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
      <FlexBox border={1} p={24}>
        <Box flexGrow={1}>
          <Anchor dimensions={1} href="" variant="interface">
            <Card isInteractive shadow="patternRight">
              Default, patternRight, and isInteractive
            </Card>
          </Anchor>
        </Box>
      </FlexBox>
      <ColorMode bg="surface-default" mode="light">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Anchor dimensions={1} href="" variant="interface">
              <Card isInteractive shadow="none" variant="white">
                White, no shadow, and isInteractive
              </Card>
            </Anchor>
          </Box>
          <Box flexGrow={1}>
            <Anchor dimensions={1} href="" variant="interface">
              <Card isInteractive shadow="patternLeft" variant="yellow">
                Yellow, patternLeft, and isInteractive
              </Card>
            </Anchor>
          </Box>
          <Box flexGrow={1}>
            <Anchor dimensions={1} href="" variant="interface">
              <Card isInteractive shadow="outline" variant="beige">
                Beige, outline, and isInteractive
              </Card>
            </Anchor>
          </Box>
        </FlexBox>
      </ColorMode>
      <ColorMode bg="surface-default" mode="dark">
        <FlexBox border={1} gap={16} p={24} row>
          <Box flexGrow={1}>
            <Anchor dimensions={1} href="" variant="interface">
              <Card isInteractive shadow="patternLeft" variant="navy">
                Navy, patternLeft, and isInteractive
              </Card>
            </Anchor>
          </Box>
          <Box flexGrow={1}>
            <Anchor dimensions={1} href="" variant="interface">
              <Card isInteractive shadow="patternRight" variant="hyper">
                Hyper, patternRight, and isInteractive
              </Card>
            </Anchor>
          </Box>
        </FlexBox>
      </ColorMode>
    </FlexBox>
  ),
  play: ({ canvas }) => {
    canvas.getByText('Default, patternRight, and isInteractive');
    canvas.getByText('Beige, outline, and isInteractive');
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
        <Card borderRadius="sm" isInteractive shadow="outline" variant="yellow">
          Yellow, isInteractive, outline, and borderRadius is &apos;sm&apos;
        </Card>
      </Box>
      <Box flexGrow={1}>
        <Card borderRadius="xl" shadow="patternLeft" variant="beige">
          Beige, patternLeft, and borderRadius is &apos;xl&apos;
        </Card>
      </Box>
    </FlexBox>
  ),
};
