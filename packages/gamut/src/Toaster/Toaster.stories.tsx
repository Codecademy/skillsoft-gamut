import { AddIcon, TrashIcon } from '@skillsoft/gamut-icons';
import { Target } from '@skillsoft/gamut-illustrations';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, screen, waitFor } from 'storybook/test';

import { GridBox } from '../Box';
import { FillButton } from '../Button';
import { Toast } from '../Toast/Toast';
import { Toaster } from '.';

const meta: Meta<typeof Toaster> = {
  title: 'Feedback/Toaster',
  component: Toaster,
  subcomponents: { Toast },
  args: {
    toasts: [
      {
        id: 'toast-1',
        icon: 'https://static-assets.codecademy.com/assets/achievements/weekly-streak-4.svg',
        title: 'First toast',
        children: "Here's to us :)",
      },
      {
        id: 'toast-2',
        icon: <Target width="100%" />,
        children:
          'This message can be longer than most as we do not have to worry about a title taking all the space.',
      },
      { id: 'toast-3', title: 'Third toast', children: "Here's to us :)" },
      {
        id: 'toast-4',
        children:
          'This message can be longer than most as we do not have to worry about a title or icon taking all the space.',
      },
    ],
  },
  argTypes: {
    colorMode: {
      control: 'radio',
      options: ['light', 'dark'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: function DefaultStory(args) {
    const [toasts, setToasts] = useState(args.toasts || []);

    const removeToasts = () => {
      setToasts([]);
    };

    const addToasts = () => {
      if (!toasts.length) {
        setTimeout(() => setToasts(args.toasts || []), 1000);
      }
    };

    const removeOne = (id: string) => {
      const filteredToasts = toasts.filter((toast) => toast.id !== id);

      setToasts(filteredToasts);
    };

    return (
      <>
        <GridBox width={300}>
          <FillButton icon={TrashIcon} mb={24} onClick={removeToasts}>
            Click me to remove all the Toasts
          </FillButton>
          <FillButton icon={AddIcon} onClick={addToasts}>
            Click me to reveal all the Toasts
          </FillButton>
        </GridBox>
        <Toaster {...args} toasts={toasts} onClose={removeOne} />
      </>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const toasts = screen.getAllByRole('status');
    await expect(toasts).toHaveLength(4);
    await expect(toasts[0]).toHaveTextContent('First toast');
    await expect(toasts[2]).toHaveTextContent('Third toast');

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Dismiss Toast' })[0]
    );
    await waitFor(() => expect(screen.queryByText('First toast')).toBeNull());
    await expect(screen.getAllByRole('status')).toHaveLength(3);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Click me to remove all the Toasts' })
    );
    await waitFor(() =>
      expect(screen.queryAllByRole('status')).toHaveLength(0)
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Click me to reveal all the Toasts' })
    );
    await waitFor(() => expect(screen.getAllByRole('status')).toHaveLength(4), {
      timeout: 3000,
    });
  },
};
