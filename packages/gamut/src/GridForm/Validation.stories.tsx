import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor } from 'storybook/test';

import { GridForm } from '.';

const onSubmit = fn();

const meta: Meta<typeof GridForm> = {
  title: 'Inputs & forms/GridForm/Validation',
  component: GridForm,
  parameters: { docs: { propsTable: false } },
  args: {
    onSubmit,
    submit: { contents: 'Submit', size: 4 },
  },
};

export default meta;
type Story = StoryObj<typeof GridForm>;

type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

const submitButton = (canvas: Canvas) =>
  canvas.getByRole('button', { name: 'Submit' });

const requiredText = {
  label: 'Name',
  name: 'name',
  size: 6,
  type: 'text',
  validation: { required: 'Please enter your name' },
} as const;

export const OnSubmit: Story = {
  args: {
    fields: [
      {
        description: 'I agree',
        label: 'Terms',
        name: 'terms',
        size: 6,
        type: 'checkbox',
        validation: { required: 'Please check the box' },
      },
      {
        label: 'Team',
        name: 'team',
        options: ['', 'Blue', 'Red'],
        size: 6,
        type: 'select',
        validation: { required: 'Please pick a team' },
      },
      requiredText,
      {
        label: 'Bio',
        name: 'bio',
        size: 6,
        type: 'textarea',
        validation: { required: 'Please write a bio' },
      },
      {
        label: 'Color',
        name: 'color',
        options: [
          { label: 'Blue', value: 'blue' },
          { label: 'Red', value: 'red' },
        ],
        size: 6,
        type: 'radio-group',
        validation: { required: 'Please pick a color' },
      },
      {
        label: 'Avatar',
        name: 'avatar',
        size: 6,
        type: 'file',
        validation: { required: 'Please upload an avatar' },
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const fields = [
      canvas.getByRole('checkbox', { name: 'I agree' }),
      canvas.getByRole('combobox', { name: /Team/ }),
      canvas.getByRole('textbox', { name: /Name/ }),
      canvas.getByRole('textbox', { name: /Bio/ }),
      canvas.getByRole('radiogroup', { name: 'Color' }),
      canvas.getByLabelText(/Avatar/),
    ];

    await Promise.all(
      fields.map((field) => expect(field).toHaveAttribute('aria-required'))
    );
    await Promise.all(fields.map((field) => expect(field).not.toBeInvalid()));

    await userEvent.type(canvas.getByRole('textbox', { name: /Name/ }), 'A');
    await userEvent.clear(canvas.getByRole('textbox', { name: /Name/ }));
    await userEvent.tab();
    await expect(canvas.queryByText('Please enter your name')).toBeNull();
    await expect(submitButton(canvas)).toBeEnabled();

    await userEvent.click(submitButton(canvas));

    const alert = await canvas.findByRole('alert');
    await expect(alert).toHaveAttribute('aria-live', 'assertive');
    const statuses = canvas.getAllByRole('status');
    await expect(statuses).toHaveLength(5);
    await Promise.all(
      statuses.map((status) =>
        expect(status).toHaveAttribute('aria-live', 'off')
      )
    );
    await Promise.all(
      fields.slice(1).map((field) => expect(field).toBeInvalid())
    );
    await expect(onSubmit).not.toHaveBeenCalled();
  },
};

export const OnChange: Story = {
  args: {
    validation: 'onChange',
    fields: [
      {
        ...requiredText,
        validation: {
          required: 'Please enter your name',
          minLength: { value: 3, message: 'Name is too short' },
        },
      },
      { label: 'Nickname', name: 'nickname', size: 6, type: 'text' },
    ],
    submit: {
      contents: 'Submit',
      size: 4,
      disabled: ({ isValid }) => !isValid,
    },
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: /^Name/ });
    await expect(input).toHaveAttribute('aria-required');
    await waitFor(() => expect(submitButton(canvas)).toBeDisabled());

    await userEvent.type(input, 'Al');
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Name is too short'
    );
    await expect(submitButton(canvas)).toBeDisabled();

    await userEvent.type(input, 'an');
    await waitFor(() => expect(canvas.queryByRole('alert')).toBeNull());
    await waitFor(() => expect(submitButton(canvas)).toBeEnabled());
  },
};

export const OnTouched: Story = {
  args: {
    validation: 'onTouched',
    fields: [
      {
        ...requiredText,
        validation: {
          required: 'Please enter your name',
          minLength: { value: 3, message: 'Name is too short' },
        },
      },
      { label: 'Nickname', name: 'nickname', size: 6, type: 'text' },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('textbox', { name: /^Name/ }), 'Al');
    await expect(canvas.queryByText('Name is too short')).toBeNull();

    await userEvent.tab();
    await canvas.findByText('Name is too short');
  },
};

export const Rules: Story = {
  args: {
    fields: [
      {
        label: 'Email',
        name: 'email',
        size: 6,
        type: 'email',
        validation: {
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address',
          },
        },
      },
      {
        label: 'Message',
        name: 'message',
        size: 6,
        type: 'text',
        validation: {
          required: 'Message is required',
          minLength: {
            value: 10,
            message: 'Message must be at least 10 characters',
          },
          maxLength: {
            value: 20,
            message: 'Message cannot exceed 20 characters',
          },
        },
      },
      {
        label: 'Age',
        name: 'age',
        size: 6,
        type: 'number',
        validation: {
          required: 'Age is required',
          min: { value: 18, message: 'Must be at least 18 years old' },
          max: { value: 99, message: 'Age cannot exceed 99' },
        },
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const email = canvas.getByRole('textbox', { name: /Email/ });
    const message = canvas.getByRole('textbox', { name: /Message/ });
    const age = canvas.getByRole('spinbutton', { name: /Age/ });

    await userEvent.click(submitButton(canvas));
    await canvas.findByText('Email is required');
    canvas.getByText('Message is required');
    canvas.getByText('Age is required');

    await userEvent.type(email, 'not-an-email');
    await userEvent.type(message, 'short');
    await userEvent.type(age, '12');
    await userEvent.click(submitButton(canvas));
    await canvas.findByText('Please enter a valid email address');
    canvas.getByText('Message must be at least 10 characters');
    canvas.getByText('Must be at least 18 years old');

    await userEvent.type(message, ' and then far too long');
    await userEvent.clear(age);
    await userEvent.type(age, '120');
    await userEvent.click(submitButton(canvas));
    await canvas.findByText('Message cannot exceed 20 characters');
    canvas.getByText('Age cannot exceed 99');
    await expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.clear(email);
    await userEvent.type(email, 'ada@example.com');
    await userEvent.clear(message);
    await userEvent.type(message, 'Hello there!');
    await userEvent.clear(age);
    await userEvent.type(age, '36');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'ada@example.com', message: 'Hello there!', age: '36' },
        expect.anything()
      )
    );
  },
};

export const ErrorWiring: Story = {
  args: {
    fields: [
      requiredText,
      { label: 'Nickname', name: 'nickname', size: 6, type: 'text' },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    /*
     * TODO: Assert the input's accessible description is the error message once
     * GridForm links errors to fields. GridFormInputGroup's FormError has no id
     * and no GridForm input sets aria-describedby.
     */
    const input = canvas.getByRole('textbox', { name: /^Name/ });

    await userEvent.click(submitButton(canvas));

    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Please enter your name'
    );
    await expect(input).toBeInvalid();
  },
};

export const ErrorsClearWhenFixed: Story = {
  args: {
    fields: [
      requiredText,
      {
        label: 'Color',
        name: 'color',
        options: [
          { label: 'Blue', value: 'blue' },
          { label: 'Red', value: 'red' },
        ],
        size: 6,
        type: 'radio-group',
        validation: { required: 'Please pick a color' },
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    /*
     * TODO: After picking a radio, assert its error clears and the group is no
     * longer invalid. RadioGroup replaces each Radio's register onChange with
     * its own, which calls setValue without revalidating.
     */
    const input = canvas.getByRole('textbox', { name: /^Name/ });

    await userEvent.click(submitButton(canvas));
    await canvas.findByText('Please enter your name');
    canvas.getByText('Please pick a color');

    await userEvent.type(input, 'Ada');
    await waitFor(() =>
      expect(canvas.queryByText('Please enter your name')).toBeNull()
    );
    await expect(input).not.toBeInvalid();
  },
};

export const FocusesFirstInvalidField: Story = {
  args: {
    fields: [
      { ...requiredText, defaultValue: 'Ada' },
      {
        label: 'Email',
        name: 'email',
        size: 6,
        type: 'email',
        validation: { required: 'Please enter your email' },
      },
      {
        label: 'Bio',
        name: 'bio',
        size: 6,
        type: 'textarea',
        validation: { required: 'Please write a bio' },
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(submitButton(canvas));

    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: /Email/ })).toHaveFocus()
    );
  },
};
