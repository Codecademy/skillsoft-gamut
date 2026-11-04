import * as icons from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { FormGroup } from '../elements/FormGroup';
import { Input } from './Input';

const meta: Meta<typeof Input> = {
  title: 'Inputs & forms/Input',
  component: Input,
  args: {
    id: 'example-input',
    placeholder: 'Placeholder',
    type: 'text',
    size: 'base',
  },
  argTypes: {
    icon: {
      control: 'select',
      options: Object.keys(icons),
      mapping: icons,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('img', { hidden: true })).toBeNull();
  },
};

export const Text: Story = {
  args: {
    id: 'example-text',
    defaultValue: 'Text',
    type: 'text',
    required: true,
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox');
    await expect(input).toHaveValue('Text');
    await expect(canvas.queryByRole('img', { hidden: true })).toBeNull();
  },
};

export const Number: Story = {
  args: {
    id: 'example-number',
    type: 'number',
    defaultValue: 1,
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('spinbutton');
    await expect(input).toHaveAttribute('type', 'number');
    await expect(input).toHaveValue(1);
  },
};

export const File: Story = {
  args: {
    id: 'example-file',
    type: 'file',
    value: '',
    onChange: () => {},
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('#example-file')).toHaveAttribute(
      'type',
      'file'
    );
  },
};

export const Error: Story = {
  args: {
    id: 'example-error',
    defaultValue: 'Error',
    error: true,
  },
  play: async ({ canvas }) => {
    const icon = canvas.getByRole('img', { hidden: true });
    await expect(icon.querySelector('mask')).toHaveAttribute(
      'id',
      expect.stringMatching(/^AlertIcon-mask-/)
    );
  },
};

export const Validated: Story = {
  args: {
    id: 'example-valid',
    placeholder: 'Placeholder',
    defaultValue: 'Verified Text',
    valid: true,
  },
  play: async ({ canvas }) => {
    const icon = canvas.getByRole('img', { hidden: true });
    await expect(icon.querySelector('mask')).toHaveAttribute(
      'id',
      expect.stringMatching(/^CheckCircledIcon-mask-/)
    );
  },
};

export const Placeholder: Story = {
  args: {
    id: 'example-placeholder',
    placeholder: 'Placeholder',
    defaultValue: undefined,
  },
};

export const Disabled: Story = {
  args: {
    id: 'example-disabled',
    placeholder: 'Disabled',
    disabled: true,
    defaultValue: undefined,
  },
};

export const CustomIcon: Story = {
  args: {
    id: 'example-icon',
    defaultValue: 'Hello...',
    icon: icons.ViewIcon,
  },
  play: async ({ canvas }) => {
    const icon = canvas.getByRole('img', { hidden: true });
    await expect(icon.querySelector('mask')).toHaveAttribute(
      'id',
      expect.stringMatching(/^ViewIcon-mask-/)
    );
  },
};

export const FormGroupDefault: Story = {
  args: {
    defaultValue: '123',
    id: 'example-123',
  },
  render: (args) => (
    <FormGroup id="example-123" isSoloField label="i am a smol label">
      <Input {...args} />
    </FormGroup>
  ),
};

export const FormGroupError: Story = {
  args: {
    defaultValue: '123',
    id: 'example-123',
    error: true,
  },
  render: (args) => (
    <FormGroup
      error="this is not updog."
      htmlFor="example-123"
      isSoloField
      label="i am a smol label"
    >
      <Input {...args} />
    </FormGroup>
  ),
};

export const FormGroupLarge: Story = {
  args: {
    defaultValue: '123',
    id: 'example-123',
    placeholder: 'Placeholder',
  },
  render: (args) => (
    <FormGroup
      disabled
      htmlFor="example-123"
      isSoloField
      label="i am a large disabled label"
      labelSize="large"
    >
      <Input {...args} />
    </FormGroup>
  ),
};

export const FormGroupErrorLarge: Story = {
  args: {
    defaultValue: '123',
    id: 'example-123',
    error: true,
  },
  render: (args) => (
    <FormGroup
      error="this is still not updog..."
      htmlFor="example-123"
      isSoloField
      label="i am also large label, but something is wrong."
      labelSize="large"
    >
      <Input {...args} />
    </FormGroup>
  ),
};

export const TextSmall: Story = {
  args: {
    id: 'example-text',
    defaultValue: 'This input has less padding!',
    type: 'text',
    required: true,
    size: 'small',
  },
};

export const TextSmallError: Story = {
  args: {
    id: 'example-text',
    defaultValue: 'Still works like a charm!',
    type: 'text',
    required: true,
    size: 'small',
    error: true,
  },
};

export const NumberSmall: Story = {
  args: {
    id: 'example-number',
    type: 'number',
    defaultValue: 1,
    size: 'small',
    icon: icons.ViewIcon,
  },
};

export const FileSmall: Story = {
  args: {
    id: 'example-file',
    type: 'file',
    value: '',
    onChange: () => {},
    size: 'small',
    valid: true,
  },
};

export const DisabledSmall: Story = {
  args: {
    id: 'example-disabled',
    placeholder: 'Disabled',
    disabled: true,
    defaultValue: undefined,
    size: 'small',
  },
};
