import type { Meta, StoryObj } from '@storybook/react';
import { expect } from 'storybook/test';

import { FormGroup } from '../elements/FormGroup';
import { Select } from './Select';

const fruitOptions = ['Apple', 'Banana', 'Cherry', 'Dragonfruit', 'Eggplant'];

const meta: Meta<typeof Select> = {
  title: 'Inputs & forms/Select',
  component: Select,
  args: {
    id: 'example-select',
    options: fruitOptions,
    'aria-label': 'Select an option',
  },
  argTypes: {
    value: {
      control: 'select',
      options: fruitOptions,
    },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {},
  play: async ({ canvas }) => {
    const select = canvas.getByRole('combobox');
    await expect(select).toHaveAttribute('id', 'example-select');
    await expect(canvas.getAllByRole('option')).toHaveLength(
      fruitOptions.length
    );
    canvas.getByTestId('example-select-Apple');
  },
};

export const ObjectOptions: Story = {
  args: {
    id: 'colors',
    options: { redKey: 'red', greenKey: 'green', yellowKey: 'yellow' },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('option')).toHaveLength(3);
    await expect(canvas.getByRole('option', { name: 'yellow' })).toHaveValue(
      'yellowKey'
    );
    canvas.getByTestId('colors-redKey');
  },
};

export const Base: Story = {
  args: {
    options: ['Base', 'Regular Size', 'Normal'],
    defaultValue: 'Regular Size',
  },
};

export const Small: Story = {
  args: {
    options: ['Small', 'Quite little'],
    defaultValue: 'Small',
    sizeVariant: 'small',
    id: 'small-variant',
  },
};

export const Disabled: Story = {
  args: {
    options: ['Disabled'],
    defaultValue: 'Disabled',
    disabled: true,
  },
};

export const Error: Story = {
  args: {
    options: ['Error'],
    defaultValue: 'Error',
    error: true,
  },
};

export const FormGroupBase: Story = {
  args: {
    options: ['Error', 'oh no', ':('],
    defaultValue: 'oh no',
    id: 'form-group-base',
  },
  render: (args) => (
    <FormGroup
      error="error!"
      htmlFor="form-group-base"
      isSoloField
      label="i am a large label"
      labelSize="large"
    >
      <Select error {...args} />
    </FormGroup>
  ),
};

export const FormGroupSmall: Story = {
  args: {
    options: ['Small', 'Quite little'],
    value: 'Small',
    sizeVariant: 'small',
    id: 'form-group-small',
  },
  render: (args) => (
    <FormGroup
      htmlFor="form-group-small"
      isSoloField
      label="i am small and have a label"
    >
      <Select {...args} />
    </FormGroup>
  ),
};
