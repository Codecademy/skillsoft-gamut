import type { Meta, StoryObj } from '@storybook/react';

import { FormRequiredText } from './FormRequiredText';

const meta: Meta<typeof FormRequiredText> = {
  title: 'Inputs & forms/Form/FormRequiredText',
  component: FormRequiredText,
  args: {},
};

export default meta;
type Story = StoryObj<typeof FormRequiredText>;

export const Default: Story = {
  args: {},
};
