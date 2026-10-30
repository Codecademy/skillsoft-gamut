import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';
import { expect, waitFor } from 'storybook/test';

import { FlexBox } from '../Box';
import { StrokeButton } from '../Button';
import { Drawer } from '.';

const meta: Meta<typeof Drawer> = {
  title: 'Containers/Drawer',
  component: Drawer,
  args: {
    expanded: true,
    alignContentContainer: 'left',
  },
  render: function DrawerDemo(args) {
    const [expanded, setExpanded] = useState(args.expanded);
    useEffect(() => {
      setExpanded(args.expanded);
    }, [args.expanded]);

    return (
      <FlexBox bg="paleYellow" height="20rem">
        <Drawer
          alignContentContainer={args.alignContentContainer}
          expanded={expanded}
        >
          Drawer content in here!
        </Drawer>
        <StrokeButton
          aria-expanded={expanded}
          onClick={() => setExpanded((previousExpanded) => !previousExpanded)}
        >
          Toggle Drawer
        </StrokeButton>
      </FlexBox>
    );
  },
};

export default meta;

type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  play: async ({ canvas, userEvent }) => {
    canvas.getByText('Drawer content in here!');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Toggle Drawer' })
    );
    await waitFor(() =>
      expect(canvas.queryByText('Drawer content in here!')).toBeNull()
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Toggle Drawer' })
    );
    await waitFor(() => canvas.getByText('Drawer content in here!'));
  },
};
