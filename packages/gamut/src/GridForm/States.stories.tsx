import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';

import { GridForm } from '.';

const onSubmit = fn();
const onUpdate = {
  text: fn(),
  textarea: fn(),
  select: fn(),
  checkbox: fn(),
  radio: fn(),
  file: fn(),
};

const meta: Meta<typeof GridForm> = {
  title: 'Inputs & forms/GridForm/States',
  component: GridForm,
  parameters: { docs: { propsTable: false } },
  args: {
    onSubmit,
    submit: {
      contents: 'Submit',
      size: 4,
      position: 'left',
    },
    hideRequiredText: true,
  },
};

export default meta;
type Story = StoryObj<typeof GridForm>;

type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

const submitButton = (canvas: Canvas) =>
  canvas.getByRole('button', { name: 'Submit' });

export const DisabledInputs: Story = {
  args: {
    fields: [
      {
        disabled: true,
        label: 'Disabled text',
        name: 'disabled-text',
        type: 'text',
        size: 6,
      },
      {
        label: 'Enabled text',
        name: 'enabled-text',
        type: 'text',
        size: 6,
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: /Disabled text/ })
    ).toBeDisabled();
    await expect(
      canvas.getByRole('textbox', { name: /Enabled text/ })
    ).toBeEnabled();
  },
};

export const DisabledFieldTypes: Story = {
  args: {
    fields: [
      {
        disabled: true,
        label: 'Select',
        name: 'select',
        options: ['aaa', 'bbb'],
        size: 4,
        type: 'select',
      },
      {
        disabled: true,
        description: 'Check me!',
        label: 'Checkbox',
        name: 'checkbox',
        size: 4,
        type: 'checkbox',
      },
      {
        disabled: true,
        label: 'Radio group',
        name: 'radio',
        options: [
          { label: 'Blue Team', value: 'blue' },
          { label: 'Red Team', value: 'red' },
        ],
        size: 4,
        type: 'radio-group',
      },
      {
        disabled: true,
        label: 'Textarea',
        name: 'textarea',
        size: 4,
        type: 'textarea',
      },
      {
        disabled: true,
        label: 'File',
        name: 'file',
        size: 4,
        type: 'file',
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('combobox', { name: /Select/ })
    ).toBeDisabled();
    await expect(
      canvas.getByRole('checkbox', { name: 'Check me!' })
    ).toBeDisabled();
    await expect(
      canvas.getByRole('radio', { name: 'Blue Team' })
    ).toBeDisabled();
    await expect(
      canvas.getByRole('radio', { name: 'Red Team' })
    ).toBeDisabled();
    await expect(
      canvas.getByRole('textbox', { name: /Textarea/ })
    ).toBeDisabled();
    await expect(canvas.getByLabelText(/^File/)).toBeDisabled();
  },
};

export const OnFieldUpdate: Story = {
  render: function OnFieldUpdate(args) {
    const [text, setText] = useState('');
    return (
      <>
        <>The text value is: {text}</>
        <GridForm
          {...args}
          fields={[
            {
              label: 'Text with onUpdate',
              name: 'onUpdate-simple-text',
              size: 9,
              type: 'text',
              onUpdate: setText,
            },
          ]}
        />
      </>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Text with onUpdate' }),
      'hi'
    );
    canvas.getByText('The text value is: hi');
  },
};

export const OnUpdateByFieldType: Story = {
  args: {
    fields: [
      {
        label: 'Text',
        name: 'text',
        size: 6,
        type: 'text',
        onUpdate: onUpdate.text,
      },
      {
        label: 'Textarea',
        name: 'textarea',
        size: 6,
        type: 'textarea',
        onUpdate: onUpdate.textarea,
      },
      {
        label: 'Select',
        name: 'select',
        options: ['aaa', 'bbb'],
        size: 6,
        type: 'select',
        onUpdate: onUpdate.select,
      },
      {
        description: 'Check me!',
        label: 'Checkbox',
        name: 'checkbox',
        size: 6,
        type: 'checkbox',
        onUpdate: onUpdate.checkbox,
      },
      {
        label: 'Radio group',
        name: 'radio',
        options: [
          { label: 'Blue Team', value: 'blue' },
          { label: 'Red Team', value: 'red' },
        ],
        size: 6,
        type: 'radio-group',
        onUpdate: onUpdate.radio,
      },
      {
        label: 'File',
        name: 'file',
        size: 6,
        type: 'file',
        onUpdate: onUpdate.file,
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: /^Text\s/ }), 'a');
    await expect(onUpdate.text).toHaveBeenLastCalledWith('a');

    await userEvent.type(
      canvas.getByRole('textbox', { name: /Textarea/ }),
      'b'
    );
    await expect(onUpdate.textarea).toHaveBeenLastCalledWith('b');

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /Select/ }),
      'bbb'
    );
    await expect(onUpdate.select).toHaveBeenLastCalledWith('bbb');

    await userEvent.click(canvas.getByRole('checkbox', { name: 'Check me!' }));
    await expect(onUpdate.checkbox).toHaveBeenLastCalledWith(true);

    await userEvent.click(canvas.getByRole('radio', { name: 'Red Team' }));
    await expect(onUpdate.radio).toHaveBeenLastCalledWith('red');

    await userEvent.upload(
      canvas.getByLabelText(/^File/),
      new File(['hi'], 'notes.txt', { type: 'text/plain' })
    );
    await expect(onUpdate.file).toHaveBeenCalledTimes(1);
    await expect(onUpdate.file.mock.calls[0][0][0].name).toBe('notes.txt');
  },
};

export const DisabledFieldsOnSubmit: Story = {
  args: {
    disableFieldsOnSubmit: true,
    fields: [
      {
        label: 'Email',
        placeholder: 'i will disable on correct submission!',
        name: 'disabled-fields-on-submit',
        type: 'email',
        validation: {
          required: 'pls fill this out',
          pattern: {
            value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
            message: 'that is not an email 😔',
          },
        },
        size: 9,
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });

    await userEvent.type(input, 'nope');
    await userEvent.click(submitButton(canvas));
    await canvas.findByText('that is not an email 😔');
    await expect(input).toBeEnabled();

    await userEvent.clear(input);
    await userEvent.type(input, 'ada@example.com');
    await userEvent.click(submitButton(canvas));
    await waitFor(() => expect(input).toBeDisabled());
  },
};

export const ResetOnSubmit: Story = {
  args: {
    fields: [
      {
        label: 'Email',
        placeholder: 'i will reset on correct submission!',
        name: 'reset-on-submit',
        type: 'email',
        validation: {
          required: 'pls fill this out',
          pattern: {
            value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
            message: 'that is not an email 😔',
          },
        },
        size: 9,
      },
    ],
    resetOnSubmit: true,
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });

    await userEvent.type(input, 'nope');
    await userEvent.click(submitButton(canvas));
    await canvas.findByText('that is not an email 😔');
    await expect(input).toHaveValue('nope');

    await userEvent.clear(input);
    await userEvent.type(input, 'ada@example.com');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { 'reset-on-submit': 'ada@example.com' },
        expect.anything()
      )
    );
  },
};

export const ResetsFieldsToDefaults: Story = {
  args: {
    resetOnSubmit: true,
    fields: [
      {
        description: 'Check me!',
        label: 'Checkbox',
        name: 'checkbox',
        size: 4,
        type: 'checkbox',
      },
      {
        label: 'Select',
        name: 'select',
        options: ['aaa', 'bbb'],
        size: 4,
        type: 'select',
      },
      {
        label: 'Text',
        name: 'text',
        size: 4,
        type: 'text',
        validation: { required: 'Please enter text' },
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox', { name: 'Check me!' });
    const select = canvas.getByRole('combobox', { name: /Select/ });
    const text = canvas.getByRole('textbox', { name: /Text/ });

    await userEvent.click(checkbox);
    await userEvent.selectOptions(select, 'bbb');
    await userEvent.click(submitButton(canvas));
    await canvas.findByText('Please enter text');
    await expect(checkbox).toBeChecked();
    await expect(select).toHaveValue('bbb');

    await userEvent.type(text, 'Hooray!');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { checkbox: true, select: 'bbb', text: 'Hooray!' },
        expect.anything()
      )
    );
    await waitFor(() => expect(text).toHaveValue(''));
    await expect(checkbox).not.toBeChecked();
    await expect(select).toHaveValue('aaa');
  },
};

export const FormLoading: Story = {
  args: {
    disableFieldsOnSubmit: true,
    fields: [
      {
        label: 'Email',
        placeholder:
          'i will disable form fields on loading and reset on correct submission!',
        name: 'im-new',
        type: 'email',
        validation: {
          required: 'pls fill this out',
          pattern: {
            value:
              /^(?:[a-zA-Z0-9_]+(?:[.-]?[a-zA-Z0-9_]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
            message: 'that is not an email 😔',
          },
        },
        size: 9,
      },
    ],
    resetOnSubmit: true,
  },
  render: function FormLoading(args) {
    const [loading, setLoading] = useState(false);

    const wait = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const onSubmit = async () => {
      setLoading(true);
      await wait(2000);
      setLoading(false);
    };

    return (
      <GridForm
        {...args}
        submit={{
          loading,
          ...args.submit,
        }}
        onSubmit={onSubmit}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });

    await userEvent.type(input, 'ada@example.com');
    await userEvent.click(submitButton(canvas));

    await expect(
      await canvas.findByRole('button', { name: 'Loading' })
    ).toBeDisabled();
    await expect(input).toBeDisabled();

    await waitFor(() => expect(submitButton(canvas)).toBeEnabled(), {
      timeout: 4000,
    });
  },
};

export const CustomError: Story = {
  args: {
    fields: [
      {
        label: 'Who is the best at bending?',
        name: 'custom-error',
        size: 9,
        type: 'text',
        customError: 'NOT Flexo.',
        validation: {
          required: true,
          pattern: {
            value: /Bender/,
            message: 'Just type Bender...',
          },
        },
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', {
      name: 'Who is the best at bending?',
    });
    canvas.getByText('NOT Flexo.');
    await expect(input).toBeInvalid();

    await userEvent.type(input, 'Bender');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { 'custom-error': 'Bender' },
        expect.anything()
      )
    );
    canvas.getByText('NOT Flexo.');
  },
};

export const MarkdownErrors: Story = {
  args: {
    fields: [
      {
        label: 'there is a markdown error here!',
        name: 'markdown-error',
        type: 'email',
        validation: {
          required:
            'This is [an example](https://www.youtube.com/watch?v=5IuRzJRrRpQ) error link.',
        },
        size: 9,
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(submitButton(canvas));

    const alert = await canvas.findByRole('alert');
    await expect(
      within(alert).getByRole('link', { name: 'an example' })
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=5IuRzJRrRpQ');
  },
};
