import { MiniArrowRightIcon, TerminalIcon } from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';

import { StrokeButton } from '../Button';
import { FormRequiredText } from '../Form';
import { Text } from '../Typography';
import {
  ConnectedCheckbox,
  ConnectedForm,
  ConnectedFormGroup,
  ConnectedInput,
  ConnectedNestedCheckboxes,
  ConnectedRadioGroupInput,
  ConnectedSelect,
  ConnectedTextArea,
  SubmitButton,
  useConnectedForm,
} from '.';

const onSubmit = fn();

const meta: Meta<typeof ConnectedForm> = {
  title: 'Inputs & forms/ConnectedForm/ConnectedForm',
  component: ConnectedForm,
  args: { onSubmit },
};

export default meta;
type Story = StoryObj<typeof ConnectedForm>;
const onError = fn();

type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

const PlainConnectedFields: React.FC<{ onChangeValidation?: boolean }> = ({
  onChangeValidation,
}) => (
  <>
    <ConnectedFormGroup
      field={{ component: ConnectedCheckbox, label: 'cool-checkbox' }}
      label="cool-checkbox"
      name="checkbox"
    />
    <SubmitButton
      disabled={onChangeValidation ? ({ isValid }) => !isValid : undefined}
      m={32}
      variant="secondary"
    >
      submit this form.
    </SubmitButton>
    <ConnectedFormGroup
      field={{
        component: ConnectedSelect,
        options: ['', 'one', 'two', 'zero'],
      }}
      label="cool-select"
      name="select"
    />
    <ConnectedFormGroup
      field={{ component: ConnectedInput }}
      label="cool-input"
      name="input"
    />
    <ConnectedFormGroup
      field={{
        component: ConnectedRadioGroupInput,
        options: [
          { label: 'one', value: 'one' },
          { label: 'two', value: 'two' },
          { label: 'three', value: 'three' },
        ],
      }}
      label="cool-radiogroup"
      name="radiogroup"
    />
  </>
);

const plainValidationRules = {
  checkbox: { required: 'you must check it' },
  select: { required: 'you must select something' },
  input: { required: 'you must type something' },
  radiogroup: { required: 'you must radio something' },
};

const emptyValues = {
  checkbox: false,
  select: '',
  input: '',
  radiogroup: undefined,
};

const filledValues = {
  checkbox: true,
  select: 'two',
  input: 'Hooray!',
  radiogroup: 'two',
};

const getPlainFields = (canvas: Canvas) => ({
  checkbox: canvas.getByRole('checkbox', { name: 'cool-checkbox' }),
  select: canvas.getByRole('combobox', { name: /cool-select/ }),
  input: canvas.getByRole('textbox', { name: /cool-input/ }),
  radioGroup: canvas.getByRole('radiogroup'),
  radio: canvas.getByRole('radio', { name: 'two' }),
});

const fillPlainFields: NonNullable<Story['play']> = async ({
  canvas,
  userEvent,
}) => {
  const { checkbox, select, input, radio } = getPlainFields(canvas);
  await userEvent.click(checkbox);
  await userEvent.click(radio);
  await userEvent.selectOptions(select, 'two');
  await userEvent.type(input, 'Hooray!');
};

const submitButton = (canvas: Canvas) =>
  canvas.getByRole('button', { name: /submit/i });

export const Default: Story = {
  parameters: { docs: { source: { type: 'code' } } },
  render: function ConnectedFormStory(args) {
    const { ConnectedFormGroup, ConnectedForm, connectedFormProps } =
      useConnectedForm({
        defaultValues: {
          checkboxField: false,
          selectField: 'zero',
          inputField: '',
          radioGroupField: undefined,
          textAreaField: '',
          nestedCheckboxesField: ['angular', 'typescript', 'backend'],
        },
        validationRules: {
          checkboxField: { required: 'you need to check this.' },
          selectField: {
            pattern: {
              value: /^(?:(?!zero).)*$/,
              message: 'literally anything but zero',
            },
          },
          inputField: { required: 'we need this info, bud' },
          radioGroupField: { required: 'we need this info too, bud' },
          textAreaField: {
            required: 'you just have to fill out the whole thing, okay?',
          },
        },
      });

    return (
      <ConnectedForm
        alignItems="center"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        minHeight="50rem"
        {...args}
        {...connectedFormProps}
      >
        <SubmitButton m={8}>submit this form</SubmitButton>
        <FormRequiredText />
        <ConnectedFormGroup
          field={{
            component: ConnectedCheckbox,
            label: <div>check it ouuut</div>,
            'aria-label': 'aria label',
          }}
          label="checkbox field"
          name="checkboxField"
        />
        <ConnectedFormGroup
          field={{
            component: ConnectedSelect,
            options: ['one', 'two', 'zero'],
          }}
          label="select field"
          name="selectField"
        />
        <ConnectedFormGroup
          field={{
            component: ConnectedInput,
            icon: TerminalIcon,
          }}
          label="input field"
          name="inputField"
        />
        <ConnectedFormGroup
          field={{
            component: ConnectedRadioGroupInput,
            options: ['a', 'b', 'c', 'zilch'].map((value) => ({
              label: (
                <>
                  <MiniArrowRightIcon mr={4} /> {value}
                </>
              ),
              value,
            })),
          }}
          label="radio group field"
          name="radioGroupField"
        />
        <ConnectedFormGroup
          field={{
            component: ConnectedTextArea,
          }}
          label="text area field"
          name="textAreaField"
        />
        <ConnectedFormGroup
          field={{
            component: ConnectedNestedCheckboxes,
            options: [
              {
                value: 'frontend',
                label: 'Frontend Technologies',
                options: [
                  {
                    value: 'react',
                    label: 'React',
                    options: [
                      { value: 'nextjs', label: 'Next.js' },
                      { value: 'typescript', label: 'TypeScript' },
                    ],
                  },
                  { value: 'vue', label: 'Vue.js' },
                  { value: 'angular', label: 'Angular' },
                ],
              },
              {
                value: 'backend',
                label: 'Backend Technologies',
                options: [
                  { value: 'node', label: 'Node.js' },
                  { value: 'python', label: 'Python' },
                  { value: 'java', label: 'Java' },
                ],
              },
            ],
          }}
          label="nested checkboxes field"
          name="nestedCheckboxesField"
        />
      </ConnectedForm>
    );
  },
};

export const WatchedFields: Story = {
  render: function WatchedFieldsStory() {
    const [showRadio, setShowRadio] = useState(false);
    const [lastFormValues, setLastFormValues] = useState({
      checkbox: 'not submitted',
      radioGroup: 'not submitted',
    });

    const handleWatch = (values: string[]) => {
      const [checkbox] = values;
      return checkbox ? setShowRadio(true) : setShowRadio(false);
    };

    const { ConnectedFormGroup, ConnectedForm, connectedFormProps } =
      useConnectedForm({
        defaultValues: {
          checkbox: false,
          radioGroup: undefined,
        },
        validationRules: {
          radioGroup: {
            required: 'please fill this out.',
          },
        },
        watchedFields: {
          fields: ['checkbox', 'radioGroup'],
          watchHandler: handleWatch,
        },
      });

    return (
      <ConnectedForm
        resetOnSubmit
        onError={(errors) => errors}
        onSubmit={({ checkbox, radioGroup }) => {
          setLastFormValues({
            checkbox: `${checkbox}`,
            radioGroup: `${radioGroup}`,
          });
        }}
        {...connectedFormProps}
      >
        <Text as="code" lineHeight="base" mb={24}>
          your last answers were {lastFormValues.checkbox} and{' '}
          {lastFormValues.radioGroup}!
        </Text>
        <ConnectedFormGroup
          field={{
            component: ConnectedCheckbox,
            label: 'check me to view the radio',
            spacing: 'tight',
          }}
          label="a special checkbox"
          name="checkbox"
          spacing="tight"
        />
        {showRadio && (
          <ConnectedFormGroup
            field={{
              component: ConnectedRadioGroupInput,
              options: [
                { label: 'one', value: 'one' },
                { label: 'two', value: 'two' },
                { label: 'zero', value: 'zero' },
              ],
            }}
            label="cool radiogroup bruh"
            name="radioGroup"
          />
        )}
        <SubmitButton m={8}>submit the form, please</SubmitButton>
      </ConnectedForm>
    );
  },
  play: async ({ canvas, userEvent }) => {
    canvas.getByText('your last answers were not submitted and not submitted!');
    await expect(canvas.queryByRole('radiogroup')).toBeNull();

    const checkbox = canvas.getByRole('checkbox', {
      name: 'check me to view the radio',
    });
    await userEvent.click(checkbox);
    canvas.getByRole('radiogroup');

    await userEvent.click(submitButton(canvas));
    await canvas.findByText('please fill this out.');

    await userEvent.click(canvas.getByRole('radio', { name: 'two' }));
    await userEvent.click(submitButton(canvas));

    await canvas.findByText('your last answers were true and two!');
    await waitFor(() => expect(checkbox).not.toBeChecked());
    await expect(canvas.queryByRole('radiogroup')).toBeNull();
  },
};

const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export const CustomFieldValidations: Story = {
  render: function CustomFieldValidationsStory() {
    const [numberType, setNumberType] = useState('even');

    const { ConnectedFormGroup, ConnectedForm, connectedFormProps } =
      useConnectedForm({
        defaultValues: { numberType: 'even', number: '' },
        validationRules: {
          numberType: { required: 'Please select a number type' },
          number: { required: 'Please select a number' },
        },
        watchedFields: {
          fields: ['numberType'],
          watchHandler: ([type]: string[]) => setNumberType(type),
        },
      });

    return (
      <ConnectedForm
        display="flex"
        flexDirection="column"
        onSubmit={onSubmit}
        {...connectedFormProps}
      >
        <ConnectedFormGroup
          field={{
            component: ConnectedSelect,
            options: ['even', 'odd'],
          }}
          label="Number type"
          name="numberType"
        />
        <ConnectedFormGroup
          field={{
            component: ConnectedSelect,
            options: numbers,
            customValidations: {
              validate: (value: string) => {
                if (!value) return true;
                const num = parseInt(value, 10);
                if (numberType === 'even') {
                  return (
                    num % 2 === 0 || `${value} is odd — pick an even number`
                  );
                }
                return num % 2 !== 0 || `${value} is even — pick an odd number`;
              },
            },
          }}
          label={`Pick an ${numberType} number`}
          name="number"
        />
        <SubmitButton mt={8}>Submit</SubmitButton>
      </ConnectedForm>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /Pick an even number/ }),
      '3'
    );
    await userEvent.click(submitButton(canvas));
    await canvas.findByText('3 is odd — pick an even number');
    await expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /Number type/ }),
      'odd'
    );
    canvas.getByRole('combobox', { name: /Pick an odd number/ });

    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { numberType: 'odd', number: '3' },
        expect.anything()
      )
    );
  },
};

export const SubmitsFieldValues: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{
        checkbox: false,
        select: 'zero',
        input: '',
        radiogroup: 'three',
      }}
      onSubmit={onSubmit}
    >
      <PlainConnectedFields />
    </ConnectedForm>
  ),
  play: async (context) => {
    const { canvas, userEvent } = context;
    await fillPlainFields(context);
    await userEvent.click(submitButton(canvas));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(filledValues, expect.anything())
    );
  },
};

export const ValidationErrors: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={emptyValues}
      validationRules={plainValidationRules}
      onError={onError}
      onSubmit={onSubmit}
    >
      <PlainConnectedFields />
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    const { checkbox, select, input, radioGroup } = getPlainFields(canvas);
    await Promise.all(
      [checkbox, select, input, radioGroup].map((field) =>
        expect(field).toHaveAttribute('aria-required', 'true')
      )
    );
    await expect(submitButton(canvas)).toBeEnabled();

    await userEvent.click(submitButton(canvas));

    await waitFor(() => expect(canvas.getAllByRole('status')).toHaveLength(3));
    await expect(canvas.getAllByRole('alert')).toHaveLength(1);
    await expect(onError).toHaveBeenCalled();
    await expect(onSubmit).not.toHaveBeenCalled();
  },
};

export const OnChangeValidation: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={emptyValues}
      validation="onChange"
      validationRules={plainValidationRules}
      onSubmit={onSubmit}
    >
      <PlainConnectedFields onChangeValidation />
    </ConnectedForm>
  ),
  play: async (context) => {
    const { canvas, userEvent } = context;
    await waitFor(() => expect(submitButton(canvas)).toBeDisabled());

    await fillPlainFields(context);
    await waitFor(() => expect(submitButton(canvas)).toBeEnabled());

    await userEvent.clear(getPlainFields(canvas).input);
    await waitFor(() => expect(submitButton(canvas)).toBeDisabled());
  },
};

export const DisableFieldsOnSubmit: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={emptyValues}
      disableFieldsOnSubmit
      validationRules={{ input: plainValidationRules.input }}
      onSubmit={onSubmit}
    >
      <PlainConnectedFields />
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    const { checkbox, select, input, radio } = getPlainFields(canvas);

    await userEvent.click(submitButton(canvas));
    await canvas.findByText('you must type something');
    await Promise.all(
      [checkbox, select, input, radio].map((field) =>
        expect(field).toBeEnabled()
      )
    );

    await userEvent.type(input, 'Hooray!');
    await userEvent.click(submitButton(canvas));

    await waitFor(() => expect(input).toBeDisabled());
    await Promise.all(
      [checkbox, select, radio].map((field) => expect(field).toBeDisabled())
    );
  },
};

export const ResetOnSubmit: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={emptyValues}
      resetOnSubmit
      validationRules={{ input: plainValidationRules.input }}
      onSubmit={onSubmit}
    >
      <PlainConnectedFields />
    </ConnectedForm>
  ),
  play: async (context) => {
    const { canvas, userEvent } = context;
    const { checkbox, select, input, radio } = getPlainFields(canvas);

    await userEvent.click(checkbox);
    await userEvent.click(submitButton(canvas));
    await canvas.findByText('you must type something');
    await expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    await fillPlainFields(context);
    await userEvent.click(submitButton(canvas));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(filledValues, expect.anything())
    );
    await waitFor(() => expect(checkbox).not.toBeChecked());
    await expect(select).toHaveValue('');
    await expect(input).toHaveValue('');
    await expect(radio).not.toBeChecked();
  },
};

const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export const FieldLevelValidations: Story = {
  render: () => (
    <ConnectedForm defaultValues={{ email: '' }} onSubmit={onSubmit}>
      <ConnectedFormGroup
        field={{
          component: ConnectedInput,
          customValidations: {
            required: 'Email is required',
            pattern: {
              value: emailPattern,
              message: 'Please enter a valid email address',
            },
          },
        }}
        label="Email"
        name="email"
      />
      <SubmitButton>Submit</SubmitButton>
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: /Email/ });
    await expect(input).toHaveAttribute('aria-required', 'true');

    await userEvent.click(submitButton(canvas));
    await canvas.findByText('Email is required');

    await userEvent.type(input, 'invalid-email');
    await userEvent.click(submitButton(canvas));
    await canvas.findByText('Please enter a valid email address');
    await expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.clear(input);
    await userEvent.type(input, 'test@example.com');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        expect.anything()
      )
    );
  },
};

export const FieldValidationsOverrideFormRules: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{ email: '' }}
      validationRules={{
        email: { required: 'This field is required from form level' },
      }}
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        field={{
          component: ConnectedInput,
          customValidations: { required: 'Email is required' },
        }}
        label="Email"
        name="email"
      />
      <SubmitButton>Submit</SubmitButton>
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(submitButton(canvas));

    await canvas.findByText('Email is required');
    await expect(
      canvas.queryByText('This field is required from form level')
    ).toBeNull();
  },
};

export const FieldValidationsMergeWithFormRules: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{ email: '' }}
      validationRules={{
        email: { required: 'This field is required from form level' },
      }}
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        field={{
          component: ConnectedInput,
          customValidations: {
            minLength: {
              value: 5,
              message: 'Email must be at least 5 characters',
            },
          },
        }}
        label="Email"
        name="email"
      />
      <SubmitButton>Submit</SubmitButton>
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: /Email/ });

    await userEvent.click(submitButton(canvas));
    await canvas.findByText('This field is required from form level');

    await userEvent.type(input, 'abc');
    await userEvent.click(submitButton(canvas));
    await canvas.findByText('Email must be at least 5 characters');

    await userEvent.type(input, 'def');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { email: 'abcdef' },
        expect.anything()
      )
    );
  },
};

const DynamicValidationsFields: React.FC = () => {
  const [strict, setStrict] = useState(false);

  return (
    <>
      <ConnectedFormGroup
        field={{
          component: ConnectedInput,
          customValidations: strict
            ? {
                minLength: {
                  value: 10,
                  message: 'Must be at least 10 characters',
                },
              }
            : undefined,
        }}
        label="Username"
        name="username"
      />
      <SubmitButton>Submit</SubmitButton>
      <StrokeButton ml={8} onClick={() => setStrict(true)}>
        Enable strict
      </StrokeButton>
    </>
  );
};

export const DynamicFieldValidations: Story = {
  render: () => (
    <ConnectedForm defaultValues={{ username: '' }} onSubmit={onSubmit}>
      <DynamicValidationsFields />
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole('textbox', { name: /Username/ }),
      'short'
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await expect(
      canvas.queryByText('Must be at least 10 characters')
    ).toBeNull();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Enable strict' })
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));

    await canvas.findByText('Must be at least 10 characters');
    await expect(onSubmit).toHaveBeenCalledTimes(1);
  },
};

export const WasSubmitSuccessfulOverride: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={emptyValues}
      disableFieldsOnSubmit
      resetOnSubmit
      wasSubmitSuccessful={false}
      onSubmit={onSubmit}
    >
      <PlainConnectedFields />
    </ConnectedForm>
  ),
  play: async (context) => {
    const { canvas, userEvent } = context;
    const { checkbox, select, input, radio } = getPlainFields(canvas);

    await fillPlainFields(context);
    await userEvent.click(submitButton(canvas));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(filledValues, expect.anything())
    );
    await Promise.all(
      [checkbox, select, input, radio].map((field) =>
        expect(field).toBeEnabled()
      )
    );
    await expect(checkbox).toBeChecked();
    await expect(select).toHaveValue('two');
    await expect(input).toHaveValue('Hooray!');
    await expect(radio).toBeChecked();
  },
};

export const FocusesFirstInvalidField: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{ firstName: 'Ada', lastName: '', email: '' }}
      validationRules={{
        firstName: { required: 'First name is required' },
        lastName: { required: 'Last name is required' },
        email: { required: 'Email is required' },
      }}
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        label="First name"
        name="firstName"
      />
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        label="Last name"
        name="lastName"
      />
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        label="Email"
        name="email"
      />
      <SubmitButton>Submit</SubmitButton>
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(canvas.getByRole('textbox', { name: /Last name/ })).toHaveFocus()
    );
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Last name is required'
    );
  },
};
