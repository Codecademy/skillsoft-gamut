import * as icons from '@skillsoft/gamut-icons';
import { Background } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import startCase from 'lodash/startCase';
import { expect } from 'storybook/test';

import { Box, FlexBox } from '../Box';
import { Column, LayoutGrid } from '../Layout';
import { Text } from '../Typography';
import { Anchor } from '.';

// TODO: see if we can not hardcode this
const variants = [
  'inline',
  'interface',
  'standard',
  'standard-secondary',
] as const;

const AnchorVariants = ({ useIcon }: { useIcon: boolean }) => (
  <LayoutGrid>
    {(['white', 'navy'] as const).map((bg) => (
      <Column key={bg} size={6}>
        <Background
          bg={bg}
          display="grid"
          gridTemplateColumns="repeat(4, 1fr)"
          p={32}
        >
          {variants.map((variant) => (
            <Box key={`${variant}-${bg}`}>
              <Text as="p" fontWeight="title">
                {startCase(variant)}
              </Text>
              <Anchor
                href={`#${variant}`}
                icon={useIcon ? icons.MiniStarIcon : undefined}
                mr={8}
                variant={variant}
              >
                Click Me
              </Anchor>
            </Box>
          ))}
        </Background>
      </Column>
    ))}
  </LayoutGrid>
);

const meta: Meta<typeof Anchor> = {
  title: 'Navigation/Anchor',
  component: Anchor,
  args: {
    children: 'Click me',
    href: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    icon: icons.MiniInfoOutlineIcon,
    iconPosition: 'left',
    target: '_blank',
    variant: 'inline',
  },
  argTypes: {
    icon: {
      control: 'select',
      options: Object.keys(icons),
      mapping: icons,
    },
    target: {
      table: { disable: true },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Anchor>;

export const Default: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Click me' });
    await expect(link).toHaveAttribute(
      'href',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    );
    canvas.getByRole('img', { hidden: true });
  },
};

export const IconAnchor: Story = {
  render: (args) => (
    <Text fontSize={14}>
      I started painting as a hobby when I was little. I didn&apos;t know I had
      any talent. I believe talent is just a pursued interest.{' '}
      <Anchor
        {...args}
        href="/"
        icon={icons.MiniInfoOutlineIcon}
        iconPosition="left"
        variant="inline"
      >
        Anybody can do what I do.
      </Anchor>{' '}
      Just go back and put one little more happy tree in there. Everybody&apos;s
      different.{' '}
      <Anchor
        {...args}
        href="/"
        icon={icons.MiniArrowRightIcon}
        iconPosition="right"
        variant="inline"
      >
        Learn more
      </Anchor>
    </Text>
  ),
};

export const Modes: Story = {
  render: () => <AnchorVariants useIcon={false} />,
};

export const IconModes: Story = {
  render: () => <AnchorVariants useIcon />,
};

export const PolymorphicAnchor: Story = {
  render: () => (
    <FlexBox justifyContent="space-around">
      <Anchor variant="standard" onClick={() => null}>
        I look like an Anchor, but I am a button.
      </Anchor>
      <Anchor href="/">I look like a link, and I am one!</Anchor>
    </FlexBox>
  ),
  play: ({ canvas }) => {
    canvas.getByRole('button', {
      name: 'I look like an Anchor, but I am a button.',
    });
    canvas.getByRole('link', { name: 'I look like a link, and I am one!' });
  },
};
