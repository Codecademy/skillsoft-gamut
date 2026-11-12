import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, fn, waitFor } from 'storybook/test';

import { FlexBox } from '../Box';
import { CTAButton, StrokeButton } from '../Button';
import { Text } from '../Typography';
import {
  ConnectedForm,
  ConnectedFormGroup,
  ConnectedInput,
  SubmitButton,
} from '.';

const meta: Meta<typeof SubmitButton> = {
  title: 'Inputs & forms/ConnectedForm/SubmitButton',
  component: SubmitButton,
  argTypes: {
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    as: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SubmitButton>;

const onSubmit = fn();

export const Default: Story = {
  render: (args) => (
    <ConnectedForm my={24} onSubmit={onSubmit}>
      <SubmitButton m={8} {...args}>
        submit the form, please
      </SubmitButton>
    </ConnectedForm>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'submit the form, please' })
    );
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  },
};

export const States: Story = {
  render: () => (
    <ConnectedForm display="flex" my={24} onSubmit={onSubmit}>
      <FlexBox alignItems="center" flexDirection="column" p={16}>
        <Text variant="title-xs">default</Text>
        <SubmitButton m={8}>submit the form, please</SubmitButton>
      </FlexBox>
      <FlexBox
        alignItems="center"
        borderLeft={1}
        borderRight={1}
        flexDirection="column"
        p={16}
      >
        <Text variant="title-xs">loading</Text>
        <SubmitButton loading m={8}>
          submit the form, please
        </SubmitButton>
      </FlexBox>
      <FlexBox alignItems="center" flexDirection="column" p={16}>
        <Text variant="title-xs">disabled</Text>
        <SubmitButton disabled m={8}>
          you cannot submit this form
        </SubmitButton>
      </FlexBox>
    </ConnectedForm>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'submit the form, please' })
    ).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: 'Loading' })
    ).toBeDisabled();
    canvas.getByTitle('Spinner');
    await expect(
      canvas.getByRole('button', { name: 'you cannot submit this form' })
    ).toBeDisabled();
  },
};

export const AsCTAButton: Story = {
  render: () => (
    <ConnectedForm my={24} onSubmit={onSubmit}>
      <SubmitButton as={CTAButton} m={8}>
        submit the form, please
      </SubmitButton>
    </ConnectedForm>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'submit the form, please' })
    ).toHaveAttribute('type', 'submit');
  },
};

export const FormStateCallbacks: Story = {
  render: function FormStateCallbacksStory() {
    const [finishSubmit, setFinishSubmit] = useState<() => void>();

    return (
      <ConnectedForm
        defaultValues={{ name: '' }}
        validationRules={{ name: { required: 'Name is required' } }}
        onSubmit={(values) =>
          new Promise<void>((resolve) => {
            onSubmit(values);
            setFinishSubmit(() => resolve);
          })
        }
      >
        <ConnectedFormGroup
          field={{ component: ConnectedInput }}
          label="Name"
          name="name"
        />
        <SubmitButton
          disabled={({ isValid }) => !isValid}
          loading={({ isSubmitting }) => isSubmitting}
          m={8}
        >
          Save
        </SubmitButton>
        <StrokeButton m={8} onClick={() => finishSubmit?.()}>
          Finish submitting
        </StrokeButton>
      </ConnectedForm>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Save' })).toBeDisabled()
    );

    await userEvent.type(canvas.getByRole('textbox', { name: /Name/ }), 'Ada');
    await waitFor(() =>
      expect(canvas.getByRole('button', { name: 'Save' })).toBeEnabled()
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(
      await canvas.findByRole('button', { name: 'Loading' })
    ).toBeDisabled();
    await expect(onSubmit).toHaveBeenCalledWith({ name: 'Ada' });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Finish submitting' })
    );
    await canvas.findByRole('button', { name: 'Save' });
    await expect(canvas.queryByRole('button', { name: 'Loading' })).toBeNull();
  },
};

export const ValidatingState: Story = {
  render: function ValidatingStateStory() {
    const finishValidation = useRef<(valid: boolean) => void>();

    return (
      <ConnectedForm
        defaultValues={{ username: '' }}
        validationRules={{
          username: {
            validate: () =>
              new Promise<boolean>((resolve) => {
                finishValidation.current = resolve;
              }),
          },
        }}
        onSubmit={onSubmit}
      >
        <ConnectedFormGroup
          field={{ component: ConnectedInput }}
          label="Username"
          name="username"
        />
        <SubmitButton loading={({ isValidating }) => isValidating} m={8}>
          Save
        </SubmitButton>
        <StrokeButton m={8} onClick={() => finishValidation.current?.(true)}>
          Finish validating
        </StrokeButton>
      </ConnectedForm>
    );
  },
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('button', { name: 'Save' });

    await userEvent.type(
      canvas.getByRole('textbox', { name: /Username/ }),
      'a'
    );
    await expect(
      await canvas.findByRole('button', { name: 'Loading' })
    ).toBeDisabled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Finish validating' })
    );
    await canvas.findByRole('button', { name: 'Save' });
    await expect(canvas.queryByRole('button', { name: 'Loading' })).toBeNull();
  },
};
