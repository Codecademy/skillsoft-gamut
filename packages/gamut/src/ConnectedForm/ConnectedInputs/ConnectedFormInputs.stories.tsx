import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor } from 'storybook/test';

import { StrokeButton } from '../../Button';
import { Checkbox, FormGroup, Input } from '../../Form';
import { Text } from '../../Typography';
import { ConnectedForm } from '../ConnectedForm';
import { ConnectedFormGroup } from '../ConnectedFormGroup';
import { SubmitButton } from '../SubmitButton';
import { useDebouncedField, useFormState } from '../utils';
import {
  ConnectedCheckbox,
  ConnectedInput,
  ConnectedRadioGroupInput,
  ConnectedSelect,
  ConnectedTextArea,
} from '.';

const meta: Meta = {
  title: 'Inputs & forms/ConnectedForm/ConnectedFormInputs',
};

export default meta;
type Story = StoryObj;

const onSubmit = fn();

const DebouncedTextInput: React.FC<{ shouldDirtyOnChange?: boolean }> = ({
  shouldDirtyOnChange,
}) => {
  const { onBlur, onChange, value } = useDebouncedField({
    name: 'episode',
    watchUpdateKeyName: 'updatedAt',
    type: 'text',
    shouldDirtyOnChange,
  });

  return (
    <FormGroup htmlFor="episode" label="Favorite episode">
      <Input
        htmlFor="episode"
        name="episode"
        type="text"
        value={value}
        onBlur={onBlur}
        onChange={onChange}
      />
    </FormGroup>
  );
};

const DebouncedCheckbox: React.FC = () => {
  const { onBlur, onChange, value } = useDebouncedField({
    name: 'watched',
    type: 'checkbox',
  });

  return (
    <Checkbox
      checked={value}
      htmlFor="watched"
      label="Watched it"
      onBlur={onBlur}
      onChange={onChange}
    />
  );
};

const FormStateReadout: React.FC = () => {
  const { isDirty, reset, watch } = useFormState();
  const [episode, watched] = watch(['episode', 'watched']);

  return (
    <>
      <Text as="p">Form episode: {episode}</Text>
      <Text as="p">Form watched: {String(watched)}</Text>
      <Text as="p">Form dirty: {String(isDirty)}</Text>
      <StrokeButton
        mt={8}
        onClick={() =>
          reset({ episode: 'Home', watched: false, updatedAt: 'later' })
        }
      >
        Load saved values
      </StrokeButton>
    </>
  );
};

const debouncedDefaults = {
  episode: 'Bad Blood',
  watched: false,
  updatedAt: 'now',
};

export const Default: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{
        input: '',
        select: 'one',
        checkbox: false,
        textArea: '',
        radioGroup: undefined,
      }}
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        field={{ component: ConnectedInput }}
        label="ConnectedInput"
        name="input"
      />
      <ConnectedFormGroup
        field={{ component: ConnectedSelect, options: ['one', 'two', 'three'] }}
        label="ConnectedSelect"
        name="select"
      />
      <ConnectedFormGroup
        field={{ component: ConnectedCheckbox, label: 'Check me' }}
        label="ConnectedCheckbox"
        name="checkbox"
      />
      <ConnectedFormGroup
        field={{ component: ConnectedTextArea }}
        label="ConnectedTextArea"
        name="textArea"
      />
      <ConnectedFormGroup
        field={{
          component: ConnectedRadioGroupInput,
          options: [
            { label: 'a', value: 'a' },
            { label: 'b', value: 'b' },
          ],
        }}
        label="ConnectedRadioGroupInput"
        name="radioGroup"
      />
      <SubmitButton>Submit</SubmitButton>
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByRole('textbox', { name: /ConnectedInput/ }),
      'typed'
    );
    await userEvent.selectOptions(
      canvas.getByRole('combobox', { name: /ConnectedSelect/ }),
      'three'
    );
    await userEvent.click(canvas.getByRole('checkbox', { name: 'Check me' }));
    await userEvent.type(
      canvas.getByRole('textbox', { name: /ConnectedTextArea/ }),
      'many words'
    );
    await userEvent.click(canvas.getByRole('radio', { name: 'b' }));
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          input: 'typed',
          select: 'three',
          checkbox: true,
          textArea: 'many words',
          radioGroup: 'b',
        },
        expect.anything()
      )
    );
  },
};

export const DebouncedField: Story = {
  render: () => (
    <ConnectedForm defaultValues={debouncedDefaults} onSubmit={onSubmit}>
      <DebouncedTextInput />
      <DebouncedCheckbox />
      <FormStateReadout />
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: /Favorite episode/ });
    await expect(input).toHaveValue('Bad Blood');

    await userEvent.clear(input);
    await userEvent.type(input, 'Tifa');
    await expect(input).toHaveValue('Tifa');
    canvas.getByText('Form episode: Bad Blood');
    canvas.getByText('Form dirty: false');

    await userEvent.tab();
    await canvas.findByText('Form episode: Tifa');
    canvas.getByText('Form dirty: true');

    const checkbox = canvas.getByRole('checkbox', { name: 'Watched it' });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    canvas.getByText('Form watched: false');

    await userEvent.tab();
    await canvas.findByText('Form watched: true');

    await userEvent.click(checkbox);
    await userEvent.tab();
    await canvas.findByText('Form watched: false');
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Load saved values' })
    );
    await waitFor(() => expect(input).toHaveValue('Home'));
    canvas.getByText('Form episode: Home');
  },
};

export const DebouncedFieldDirtyOnChange: Story = {
  render: () => (
    <ConnectedForm defaultValues={debouncedDefaults} onSubmit={onSubmit}>
      <DebouncedTextInput shouldDirtyOnChange />
      <FormStateReadout />
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: /Favorite episode/ });

    await userEvent.type(input, '!');
    await canvas.findByText('Form dirty: true');
    canvas.getByText('Form episode: Bad Blood');

    await userEvent.tab();
    await canvas.findByText('Form episode: Bad Blood!');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Load saved values' })
    );
    await waitFor(() => expect(input).toHaveValue('Home'));
    await canvas.findByText('Form dirty: false');

    await userEvent.type(input, '!');
    await canvas.findByText('Form dirty: true');
  },
};

const onCheckboxUpdate = fn();

export const CheckboxUpdates: Story = {
  render: () => (
    <ConnectedForm
      defaultValues={{ subscribe: false, terms: false }}
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        field={{
          component: ConnectedCheckbox,
          label: 'Subscribe',
          onUpdate: onCheckboxUpdate,
        }}
        label="Newsletter"
        name="subscribe"
      />
      <ConnectedFormGroup
        field={{
          component: ConnectedCheckbox,
          label: <strong>Accept terms</strong>,
        }}
        label="Terms"
        name="terms"
      />
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    const subscribe = canvas.getByRole('checkbox', { name: 'Subscribe' });

    await userEvent.click(subscribe);
    await expect(onCheckboxUpdate).toHaveBeenLastCalledWith(true);

    await userEvent.click(subscribe);
    await expect(onCheckboxUpdate).toHaveBeenLastCalledWith(false);
    await expect(onCheckboxUpdate).toHaveBeenCalledTimes(2);

    canvas.getByRole('checkbox', { name: 'checkbox' });
  },
};
