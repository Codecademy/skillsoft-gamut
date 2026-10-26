import type { Meta, StoryObj } from '@storybook/react';
import { AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { Box, FlexBox } from '../Box';
import { FillButton } from '../Button';
import { ExpandInCollapseOut } from './ExpandInCollapseOut';

const meta: Meta<typeof ExpandInCollapseOut> = {
  title: 'Media & Assets/Animations/ExpandInCollapseOut',
  component: ExpandInCollapseOut,
  args: {
    children:
      "I got bored one day - and I put everything on a bagel. Everything. All my hopes and dreams, my old report cards, every breed of dog, every last personal ad on craigslist. Sesame. Poppy seed. Salt. And it collapsed in on itself. 'Cause, you see, when you really put everything on a bagel, it becomes this.",
  },
};

export default meta;

type Story = StoryObj<typeof ExpandInCollapseOut>;

export const Default: Story = {
  render: function ExpandInCollapseOutDemo({ children }) {
    const [isExpanded, setExpanded] = useState(true);

    return (
      <FlexBox column>
        <Box>
          <FillButton onClick={() => setExpanded(!isExpanded)}>
            Look, the text expands in and collapses out!
          </FillButton>
        </Box>
        <Box mt={8}>
          <AnimatePresence>
            {isExpanded && (
              <ExpandInCollapseOut>{children}</ExpandInCollapseOut>
            )}
          </AnimatePresence>
        </Box>
      </FlexBox>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('button', {
      name: 'Look, the text expands in and collapses out!',
    });

    canvas.getByText(/put everything on a bagel/i);

    await userEvent.click(toggle);
    await waitFor(() =>
      expect(canvas.queryByText(/put everything on a bagel/i)).toBeNull()
    );

    await userEvent.click(toggle);
    await canvas.findByText(/put everything on a bagel/i);
  },
};
