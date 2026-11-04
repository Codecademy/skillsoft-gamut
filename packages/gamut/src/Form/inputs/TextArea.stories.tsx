import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { FormGroup } from '../elements/FormGroup';
import { TextArea } from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Inputs & forms/TextArea',
  component: TextArea,
  args: {
    id: 'example-input',
    defaultValue: 'Some text',
    rows: 4,
  },
  decorators: [
    (Story) => (
      <FormGroup htmlFor="example-input" isSoloField label="Enter text">
        <Story />
      </FormGroup>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {
  args: {},
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Enter text' });
    await expect(textarea).toHaveValue('Some text');
  },
};

export const Disabled: Story = {
  args: {
    defaultValue: 'Disabled',
    disabled: true,
  },
};

export const Error: Story = {
  args: {
    defaultValue: 'Error',
    error: true,
  },
};

export const Placeholder: Story = {
  args: {
    placeholder: 'Placeholder',
    defaultValue: undefined,
  },
};
