import type { Meta, StoryObj } from '@storybook/react';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { expect } from 'storybook/test';

import { Box, FlexBox } from '../Box';
import { FillButton } from '../Button';
import { FadeInSlideOut } from './FadeInSlideOut';

const meta: Meta<typeof FadeInSlideOut> = {
  title: 'Media & Assets/Animations/FadeInSlideOut',
  component: FadeInSlideOut,
};

export default meta;

type Story = StoryObj<typeof FadeInSlideOut>;

export const Default: Story = {
  render: function FadeInSlideOutDemo() {
    const [isVisible, setIsVisible] = useState(false);

    return (
      <FlexBox column>
        <Box>
          <FillButton onClick={() => setIsVisible(!isVisible)}>
            {isVisible ? 'Thanks!' : 'Click me.'}
          </FillButton>
        </Box>
        <Box height="50px" mt={8}>
          <AnimatePresence>
            {isVisible && (
              <FadeInSlideOut>
                <Box border={1} p={8}>
                  Even in a stupid, stupid universe where we have hot dogs for
                  fingers, we get very good with our feet.
                </Box>
              </FadeInSlideOut>
            )}
          </AnimatePresence>
        </Box>
      </FlexBox>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByText(/hot dogs for/i)).toBeNull();

    await userEvent.click(canvas.getByRole('button', { name: 'Click me.' }));

    await canvas.findByText(/hot dogs for/i);
    canvas.getByRole('button', { name: 'Thanks!' });
  },
};
