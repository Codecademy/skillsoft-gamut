import { Box, FlexBox, Markdown, Text } from '@skillsoft/gamut';
import { Background, ColorMode } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';

/*
 * Repro for GMT-1825. On a light core page, `<Background bg="primary">` paints
 * dark mode's primary (yellow) instead of the light mode's primary (hyper),
 * because Background flips the color mode on the same element it paints and
 * the alias resolves in the flipped mode. The fix is in gamut-styles
 * `Background.tsx` (PR #51). On a fixed build, both boxes below are hyper.
 */
const meta: Meta<typeof Background> = {
  title: 'Foundations/ColorMode/Alias Background Bug',
  component: Background,
};

export default meta;
type Story = StoryObj<typeof Background>;

const Swatch = ({
  bg,
  label,
}: {
  bg: ComponentProps<typeof Background>['bg'];
  label: string;
}) => (
  <Background bg={bg} p={24} width="280px">
    <Text mb={8} variant="title-md">
      bg=&quot;{bg}&quot;
    </Text>
    <Text>{label}</Text>
  </Background>
);

export const PrimaryAliasOnLightPage: Story = {
  render: () => (
    <ColorMode mode="light">
      <Box p={24}>
        <Text as="p" mb={16}>
          Both boxes should be <Markdown text="`hyper`" />. On a broken build,
          the alias box paints yellow.
        </Text>
        <FlexBox gap={16} row>
          <Swatch bg="hyper" label="Palette color (control). Always hyper." />
          <Swatch
            bg="primary"
            label="Alias. Should resolve to hyper in light mode. Bug: paints yellow."
          />
        </FlexBox>
      </Box>
    </ColorMode>
  ),
};
