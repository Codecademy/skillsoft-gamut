import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor, within } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { infotipNestedArgTypes } from '~storybook/argTypes';

import { Text } from '../Typography';
import type { ConnectedFormGroupProps } from '.';
import {
  ConnectedCheckbox,
  ConnectedForm,
  ConnectedFormGroup,
  ConnectedInput,
  ConnectedRadioGroupInput,
  ConnectedSelect,
  ConnectedTextArea,
  SubmitButton,
  useConnectedForm,
} from '.';

const onSubmit = fn();

const radioOptions = [
  { label: 'one', value: 'one' },
  { label: 'two', value: 'two' },
  { label: 'zero', value: 'zero' },
];

const meta: TypeWithDeepControls<Meta<typeof ConnectedFormGroup>> = {
  title: 'Inputs & forms/ConnectedForm/ConnectedFormGroup',
  component: ConnectedFormGroup,
  parameters: { deepControls: { enabled: true } },
  args: {
    field: {
      component: ConnectedRadioGroupInput,
      options: radioOptions,
    } as ConnectedFormGroupProps<typeof ConnectedRadioGroupInput>['field'],
    label: 'i am a label',
    name: 'radioGroupExample',
  },
  argTypes: {
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    ...infotipNestedArgTypes,
  },
};

export default meta;
type Story = StoryObj<typeof ConnectedFormGroup>;

export const Default: Story = {
  render: (args) => (
    <ConnectedForm mt={12} resetOnSubmit onSubmit={onSubmit}>
      <ConnectedFormGroup {...args} />
    </ConnectedForm>
  ),
};

export const States: Story = {
  render: function StatesStory() {
    const { ConnectedFormGroup, ConnectedForm, connectedFormProps } =
      useConnectedForm({
        defaultValues: {
          radioGroup: undefined,
          radioGroupError: undefined,
          radioGroupDisabled: undefined,
        },
        validationRules: {
          radioGroup: {
            required: 'please fill this out.',
          },
        },
      });

    return (
      <ConnectedForm
        display="flex"
        mt={12}
        resetOnSubmit
        onSubmit={onSubmit}
        {...connectedFormProps}
      >
        <ConnectedFormGroup
          field={{ component: ConnectedRadioGroupInput, options: radioOptions }}
          label="default state"
          name="radioGroup"
        />
        <ConnectedFormGroup
          customError="custom error"
          field={{ component: ConnectedRadioGroupInput, options: radioOptions }}
          label="error state"
          name="radioGroupError"
        />
        <ConnectedFormGroup
          disabled
          field={{ component: ConnectedRadioGroupInput, options: radioOptions }}
          label="disabled state"
          name="radioGroupDisabled"
        />
      </ConnectedForm>
    );
  },
  play: async ({ canvas }) => {
    const [defaultGroup, errorGroup, disabledGroup] =
      canvas.getAllByRole('radiogroup');

    await expect(defaultGroup).toHaveAttribute('aria-required', 'true');
    await Promise.all(
      within(defaultGroup)
        .getAllByRole('radio')
        .map((radio) => expect(radio).toBeEnabled())
    );

    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'custom error'
    );
    await Promise.all(
      within(errorGroup)
        .getAllByRole('radio')
        .map((radio) => expect(radio).toBeEnabled())
    );

    await Promise.all(
      within(disabledGroup)
        .getAllByRole('radio')
        .map((radio) => expect(radio).toBeDisabled())
    );
  },
};

export const InfoTipAutoLabelling: Story = {
  render: () => (
    <ConnectedForm defaultValues={{ emailInput: '' }} onSubmit={onSubmit}>
      <ConnectedFormGroup
        field={{ component: ConnectedInput, type: 'email' }}
        infotip={{
          info: 'We will never share your email with third parties.',
          placement: 'floating',
        }}
        label="Email address"
        name="emailInput"
      />
    </ConnectedForm>
  ),
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: 'Email address (optional)' });
  },
};

export const InfoTipWithReactNodeLabel: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{ username: '', password: '', apiKey: '' }}
      onSubmit={onSubmit}
    >
      <Text as="h3" id="api-section-heading" mb={8}>
        API Configuration
      </Text>
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        infotip={{
          alignment: 'bottom-left',
          info: 'Choose a unique username between 3-20 characters.',
        }}
        label={
          <Text as="span" fontWeight="bold">
            Username (automatic label)
          </Text>
        }
        name="username"
      />
      <ConnectedFormGroup
        field={{ component: ConnectedInput, type: 'password' }}
        infotip={{
          info: 'Password must be at least 8 characters with one uppercase letter and one number.',
          ariaLabel: 'Password requirements',
        }}
        label={
          <Text as="span" fontWeight="bold">
            Password (ariaLabel)
          </Text>
        }
        name="password"
      />
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        infotip={{
          info: 'You can find your API key in the developer settings dashboard.',
          ariaLabelledby: 'api-section-heading',
        }}
        label={
          <Text as="span" fontWeight="bold">
            API Key (ariaLabelledby)
          </Text>
        }
        name="apiKey"
      />
    </ConnectedForm>
  ),
  play: async ({ canvas }) => {
    canvas.getByRole('button', {
      name: 'Username (automatic label) (optional)',
    });
    canvas.getByRole('button', { name: 'Password requirements' });
    await expect(
      canvas.queryByRole('button', { name: /Password \(ariaLabel\)/ })
    ).toBeNull();
    canvas.getByRole('button', { name: 'API Configuration' });
  },
};

export const RadioInfoTips: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{ optionTip: '', optionTipAriaLabel: '', groupTip: '' }}
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        field={{
          component: ConnectedRadioGroupInput,
          options: [
            {
              label: 'Radio option',
              value: 'option1',
              infotip: { info: 'helpful information' },
            },
          ],
        }}
        label="Option InfoTip"
        name="optionTip"
      />
      <ConnectedFormGroup
        field={{
          component: ConnectedRadioGroupInput,
          options: [
            {
              label: 'Labelled radio option',
              value: 'option1',
              infotip: {
                info: 'helpful information',
                ariaLabel: 'Custom InfoTip label',
              },
            },
          ],
        }}
        label="Option InfoTip with ariaLabel"
        name="optionTipAriaLabel"
      />
      <ConnectedFormGroup
        field={{
          component: ConnectedRadioGroupInput,
          options: [{ label: 'Plain radio option', value: 'option1' }],
        }}
        infotip={{ info: 'helpful information' }}
        label="Group InfoTip"
        name="groupTip"
      />
    </ConnectedForm>
  ),
  play: async ({ canvas }) => {
    canvas.getByRole('button', { name: 'Radio option' });
    canvas.getByRole('button', { name: 'Custom InfoTip label' });
    await expect(
      canvas.queryByRole('button', { name: 'Labelled radio option' })
    ).toBeNull();
    canvas.getByRole('button', { name: 'Group InfoTip (optional)' });
  },
};

export const ErrorWiring: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{ email: '' }}
      validationRules={{ email: { required: 'Email is required' } }}
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        label="Email"
        name="email"
      />
      <SubmitButton>Submit</SubmitButton>
    </ConnectedForm>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: /Email/ });
    await expect(input).toHaveAttribute('aria-invalid', 'false');
    await expect(input).not.toHaveAttribute('aria-describedby');

    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));

    const alert = await canvas.findByRole('alert');
    await expect(alert).toHaveTextContent('Email is required');
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('aria-describedby', 'email_error');
    await expect(canvasElement.querySelector('#email_error')).toBe(alert);
    await expect(input).toHaveAccessibleDescription('Email is required');

    await userEvent.type(input, 'ada@example.com');
    await waitFor(() => expect(canvas.queryByRole('alert')).toBeNull());
    await expect(input).toHaveAttribute('aria-invalid', 'false');
    await expect(input).not.toHaveAttribute('aria-describedby');
  },
};

export const HiddenLabel: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{ search: '' }}
      validationRules={{ search: { required: 'Enter a search term' } }}
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        hideLabel
        label="Search"
        name="search"
      />
      <SubmitButton>Submit</SubmitButton>
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: /Search/ });

    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(input).toHaveFocus());
    await expect(onSubmit).not.toHaveBeenCalled();
    await expect(canvas.queryByText('Enter a search term')).toBeNull();
    await expect(canvas.queryByRole('alert')).toBeNull();
    await expect(input).toHaveAttribute('aria-invalid', 'false');
  },
};

export const ErrorMessageLinks: Story = {
  render: () => (
    <ConnectedForm defaultValues={{ username: '' }} onSubmit={onSubmit}>
      <ConnectedFormGroup
        customError="That username is taken. [Sign in instead](/login)"
        field={{ component: ConnectedInput }}
        label="Username"
        name="username"
      />
    </ConnectedForm>
  ),
  play: async ({ canvas }) => {
    const alert = await canvas.findByRole('alert');
    await expect(alert).toHaveTextContent(
      'That username is taken. Sign in instead'
    );
    await expect(
      within(alert).getByRole('link', { name: 'Sign in instead' })
    ).toHaveAttribute('href', '/login');
  },
};

export const LabelIndicators: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{ required: '', optional: '', solo: '' }}
      validationRules={{
        required: { required: 'Required' },
        solo: { required: 'Required' },
      }}
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        label="Required field"
        name="required"
      />
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        label="Optional field"
        name="optional"
      />
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        isSoloField
        label="Solo field"
        name="solo"
      />
    </ConnectedForm>
  ),
  play: ({ canvas }) => {
    canvas.getByLabelText('Required field*');
    canvas.getByLabelText('Optional field (optional)');
    canvas.getByLabelText('Solo field');
  },
};

export const DisabledFields: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{
        input: '',
        select: 'one',
        checkbox: false,
        textArea: '',
      }}
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        disabled
        field={{ component: ConnectedInput }}
        label="Input"
        name="input"
      />
      <ConnectedFormGroup
        disabled
        field={{ component: ConnectedSelect, options: ['one', 'two'] }}
        label="Select"
        name="select"
      />
      <ConnectedFormGroup
        disabled
        field={{ component: ConnectedCheckbox, label: 'Checkbox' }}
        label="Checkbox group"
        name="checkbox"
      />
      <ConnectedFormGroup
        disabled
        field={{ component: ConnectedTextArea }}
        label="Text area"
        name="textArea"
      />
    </ConnectedForm>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: /^Input/ })
    ).toBeDisabled();
    await expect(
      canvas.getByRole('combobox', { name: /Select/ })
    ).toBeDisabled();
    await expect(
      canvas.getByRole('checkbox', { name: 'Checkbox' })
    ).toBeDisabled();
    await expect(
      canvas.getByRole('textbox', { name: /Text area/ })
    ).toBeDisabled();
  },
};
