import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

import { Breadcrumbs } from '.';

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  args: {},
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    crumbs: [
      {
        title: 'Catalog',
        href: '/',
      },
      {
        title: 'Web Development',
        href: '/',
      },
      {
        title: 'TypeScript',
        href: '/',
      },
      {
        title: 'Current Page',
      },
    ],
  },
  play: async ({ canvas }) => {
    canvas.getByRole('navigation', { name: 'breadcrumbs' });
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
    canvas.getByRole('link', { name: 'Web Development' });
    await expect(canvas.getByText('Current Page')).toHaveAttribute(
      'aria-current',
      'location'
    );
  },
};

export const TextOnly: Story = {
  args: {
    crumbs: [{ title: 'One' }, { title: 'Two' }, { title: 'Three' }],
  },
  play: async ({ canvas }) => {
    canvas.getByText('One');
    canvas.getByText('Two');
    canvas.getByText('Three');
    await expect(canvas.queryByRole('link')).toBeNull();
  },
};

export const Payload: Story = {
  args: {
    crumbs: [
      {
        title: 'Home',
        href: '/',
        payload: 'I can be anything!',
      },
      {
        title: 'Here',
      },
    ],
    onClick: fn((event: React.MouseEvent) => event.preventDefault()),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('link', { name: 'Home' }));
    await expect(args.onClick).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ payload: 'I can be anything!' })
    );
  },
};
