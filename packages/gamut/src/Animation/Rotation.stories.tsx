import { MiniChevronDownIcon } from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState } from 'react';

import { StrokeButton } from '../Button';
import { Rotation } from './Rotation';

const meta: Meta<typeof Rotation> = {
  title: 'Media & Assets/Animations/Rotation',
  component: Rotation,
  args: {
    rotated: false,
  },
  argTypes: {
    degrees: {
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '180' },
      },
    },
    height: {
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '16' },
      },
    },
    width: {
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '16' },
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof Rotation>;

export const Default: Story = {
  render: function RotationDemo(args) {
    const [isRotated, setRotated] = useState(args.rotated);

    useEffect(() => {
      setRotated(args.rotated);
    }, [args.rotated]);

    return (
      <StrokeButton
        aria-label="Toggle rotation demo"
        onClick={() => setRotated(!isRotated)}
      >
        <Rotation {...args} rotated={isRotated}>
          <MiniChevronDownIcon />
        </Rotation>
      </StrokeButton>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Toggle rotation demo' })
    );
    canvas.getByRole('img', { hidden: true });
  },
};
