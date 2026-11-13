import {
  MiniArrowLeftIcon,
  MiniArrowRightIcon,
  MiniDeleteIcon,
  MiniRibbonIcon,
  SearchIcon,
} from '@skillsoft/gamut-icons';
import { ColorMode } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';

import { Box, FlexBox, GridBox } from '../Box';
import { FillButton } from './FillButton';
import { IconButton } from './IconButton';
import { buttonVariants } from './shared';
import { StrokeButton } from './StrokeButton';
import { TextButton } from './TextButton';

const meta: Meta<typeof FillButton> = {
  title: 'Actions/Buttons/Button Examples',
  component: FillButton,
  args: {},
};

export default meta;
type Story = StoryObj<typeof FillButton>;

export const InlineIcons: Story = {
  render: () => (
    <FlexBox gap={16} row>
      <FillButton icon={MiniArrowLeftIcon} maxWidth="fit-content">
        FillButton
      </FillButton>
      <StrokeButton icon={MiniRibbonIcon} maxWidth="fit-content">
        Leading icon
      </StrokeButton>
      <TextButton
        icon={MiniArrowRightIcon}
        iconPosition="right"
        maxWidth="fit-content"
      >
        TextButton
      </TextButton>
    </FlexBox>
  ),
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: 'FillButton' });
    canvas.getByRole('button', { name: 'Leading icon' });
    canvas.getByRole('button', { name: 'TextButton' });
  },
};

const buttonScaleItems = [
  { name: 'FillButton', Component: FillButton },
  { name: 'IconButton', Component: IconButton },
  { name: 'StrokeButton', Component: StrokeButton },
  { name: 'TextButton', Component: TextButton },
] as const;

const sizes = ['normal', 'small', 'large'] as const;

const ButtonScale = ({ mode }: { mode: 'dark' | 'light' }) => {
  const grid: React.ReactNode[] = [
    <Box key="corner" />,
    ...buttonScaleItems.map(({ name }) => (
      <Box fontWeight="title" key={`${name}-header`}>
        {name}
      </Box>
    )),
  ];

  buttonVariants.forEach((variant) => {
    sizes.forEach((size) => {
      grid.push(
        <Box fontSize={14} key={`${mode}-${variant}-${size}-label`}>
          {variant} · {size}
        </Box>
      );

      buttonScaleItems.forEach(({ name, Component }) => {
        const key = `${name}-${mode}-${variant}-${size}`;

        if (name === 'IconButton') {
          grid.push(
            <IconButton
              icon={size === 'small' ? MiniDeleteIcon : SearchIcon}
              key={key}
              mode={mode}
              size={size}
              tip="Here's a tip!"
              variant={variant}
            />
          );
          return;
        }

        grid.push(
          <Component
            icon={MiniDeleteIcon}
            key={key}
            mode={mode}
            size={size}
            variant={variant}
          >
            {mode}
          </Component>
        );
      });
    });
  });

  return (
    <ColorMode mode={mode}>
      <GridBox
        alignItems="center"
        bg="surface-default"
        columnGap={32}
        gridAutoRows="3rem"
        gridTemplateColumns="max-content repeat(4, minmax(50px, max-content))"
        justifyItems="start"
        p={32}
        rowGap={16}
        textColor="text-default"
      >
        {grid}
      </GridBox>
    </ColorMode>
  );
};

export const ButtonsLightMode: Story = {
  render: () => <ButtonScale mode="light" />,
};

export const ButtonsDarkMode: Story = {
  render: () => <ButtonScale mode="dark" />,
};
