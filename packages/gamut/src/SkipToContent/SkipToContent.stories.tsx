import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { Anchor } from '../Anchor';
import { FillButton } from '../Button';
import { SkipToContent, SkipToContentTarget } from '.';

const meta: Meta<typeof SkipToContent> = {
  title: 'Navigation/SkipToContent',
  component: SkipToContent,
  args: {
    contentId: 'main-content',
  },
  render: (args) => (
    <>
      <SkipToContent {...args} />
      <Anchor href="/" px={8}>
        Link 1
      </Anchor>
      <Anchor href="/" px={8}>
        Link 2
      </Anchor>
      <Anchor href="/" px={8}>
        Link 3
      </Anchor>
      <SkipToContentTarget id={args.contentId} />
      <FillButton>I should have focus after skip to content</FillButton>
    </>
  ),
};

export default meta;

type Story = StoryObj<typeof SkipToContent>;

export const Default: Story = {
  play: async ({ args, canvas }) => {
    const link = canvas.getByRole('link', { name: 'Skip to Content' });
    await expect(link).toHaveAttribute('href', `#${args.contentId}`);

    await expect(canvas.getByTestId('skip-to-content-target')).toHaveAttribute(
      'tabindex',
      '-1'
    );
  },
};
