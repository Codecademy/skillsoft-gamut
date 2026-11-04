import type { Meta, StoryObj } from '@storybook/react';

import { PercipioHome } from './PercipioHome';

const meta: Meta<typeof PercipioHome> = {
  title: 'Prototypes/Percipio Home',
  component: PercipioHome,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof PercipioHome>;

export const Home: Story = {};
