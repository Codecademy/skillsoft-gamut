import type { Meta, StoryObj } from '@storybook/react';

import { FormGroupDescription } from './FormGroupDescription';

const meta: Meta<typeof FormGroupDescription> = {
  title: 'Inputs & forms/Form/FormGroupDescription',
  component: FormGroupDescription,
  args: {},
};

export default meta;
type Story = StoryObj<typeof FormGroupDescription>;

export const Default: Story = {
  args: { children: 'I am a description' },
};
