import * as icons from '@skillsoft/gamut-icons';
import { Target } from '@skillsoft/gamut-illustrations';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

import { Anchor } from '../Anchor';
import { Toast } from './Toast';

const meta: Meta<typeof Toast> = {
  title: 'Feedback/Toast',
  component: Toast,
  args: {
    onClose: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: {
    icon: 'https://static-assets.codecademy.com/assets/achievements/weekly-streak-4.svg',
    title: 'I have a toast!',
    children: "Here's to us :)",
  },
  play: async ({ args, canvas, userEvent }) => {
    const toast = canvas.getByRole('status');
    await expect(toast.childNodes).toHaveLength(4);
    await expect(toast.childNodes[0].childNodes).toHaveLength(0);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss Toast' })
    );
    await expect(args.onClose).toHaveBeenCalledTimes(1);
  },
};

export const Icons: Story = {
  args: {
    icon: <Target width="100%" />,
    children: `Inline has hasn't been this cool since the disney channel original movie
    Brink!`,
  },
  play: async ({ canvas }) => {
    const toast = canvas.getByRole('status');
    await expect(toast.childNodes).toHaveLength(4);
    await expect(toast.childNodes[0].childNodes).toHaveLength(1);
  },
};

export const ContentIcon: Story = {
  args: {
    title: (
      <>
        <icons.TrophyIcon mr={4} verticalAlign="middle" /> Congrats you won!
      </>
    ),
    children:
      'Some message that informs you where to claim your physical trophy.',
  },
};

export const ContentLink: Story = {
  args: {
    children: (
      <>
        Feedback fruit loops. <Anchor>Go go go!</Anchor>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('status').childNodes).toHaveLength(3);
  },
};
