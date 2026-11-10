import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { expect, fn, screen, waitFor } from 'storybook/test';

import { Box, FlexBox } from '../Box';
import { StrokeButton } from '../Button';
import { Flyout } from '.';

const meta: Meta<typeof Flyout> = {
  title: 'Overlays/Flyout',
  component: Flyout,
  args: {
    expanded: false,
    closeLabel: 'close flyout',
    title: 'About Baharroth',
    onClose: fn(),
  },
  render: function FlyoutExample(args) {
    const [expanded, setExpanded] = useState(args.expanded);

    useEffect(() => {
      setExpanded(args.expanded);
    }, [args.expanded]);

    return (
      <Box height="20rem">
        <Flyout
          {...args}
          expanded={expanded}
          onClose={() => {
            setExpanded(false);
            args.onClose();
          }}
        >
          <Box m={16} textColor="text">
            Baharroth, &quot;the Cry of the Wind,&quot; is the Winged Phoenix,
            the oldest of the Swooping Hawks and the first Exarch of those
            winged Aspect Warriors. Baharroth is the founder of the Eldar
            Warrior Path that is represented today by the Swooping Hawks Aspect
            Shrines. Baharroth is also known for his speed and is said to be the
            fastest of all the Eldar who have ever lived, a formidable claim
            that would make him a deadly opponent indeed. Though he moves with
            the subtlety and grace of a zephyr, he attacks with the force of a
            hurricane...
          </Box>
        </Flyout>
        <StrokeButton
          aria-expanded={expanded}
          onClick={() => setExpanded(true)}
        >
          Tell me more?!
        </StrokeButton>
        <FlexBox>
          An Avatar of Khaine is the term normally applied to the physical form
          that the spirit of an Eldar God has managed to possess and animate.
          This term is most often applied to the physical body possessed by a
          fragment of the spirit of the Eldar God of War Kaela Mensha Khaine,
          though the term can actually apply to any divine entity of the Warp
          that has found some way to take on a corporeal form within realspace.
        </FlexBox>
      </Box>
    );
  },
};

export default meta;

type Story = StoryObj<typeof Flyout>;

const flyoutText = /Baharroth, "the Cry of the Wind,"/;

const openFlyout: NonNullable<Story['play']> = async ({
  canvas,
  userEvent,
}) => {
  await userEvent.click(canvas.getByRole('button', { name: 'Tell me more?!' }));
  await screen.findByText(flyoutText);
};

const expectFlyoutClosed = () =>
  waitFor(() => expect(screen.queryByText(flyoutText)).toBeNull());

export const Default: Story = {
  play: async (context) => {
    await expect(screen.queryByText(flyoutText)).toBeNull();

    await openFlyout(context);
    await context.userEvent.click(
      screen.getByRole('button', { name: 'close flyout' })
    );
    await expect(context.args.onClose).toHaveBeenCalledTimes(1);
    await expectFlyoutClosed();
  },
};

export const Dismissal: Story = {
  play: async (context) => {
    const { args, userEvent } = context;

    await openFlyout(context);
    await userEvent.click(screen.getByText(flyoutText));
    await expect(args.onClose).not.toHaveBeenCalled();
    screen.getByText(flyoutText);

    await userEvent.keyboard('{Escape}');
    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await expectFlyoutClosed();

    await openFlyout(context);
    await userEvent.click(screen.getByTestId('overlay-content-container'));
    await expect(args.onClose).toHaveBeenCalledTimes(2);
    await expectFlyoutClosed();
  },
};
