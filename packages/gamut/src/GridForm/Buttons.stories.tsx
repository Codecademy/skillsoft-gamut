import type { Meta, StoryObj } from '@storybook/react';
import { useRef } from 'react';
import { expect, fn, waitFor } from 'storybook/test';

import { StrokeButton } from '../Button';
import { GridForm } from '.';

const onSubmit = fn();
const onCancel = fn();

const meta: Meta<typeof GridForm> = {
  title: 'Inputs & forms/GridForm/Buttons',
  component: GridForm,
  parameters: { docs: { propsTable: false } },
  args: {
    onSubmit,
    fields: [
      {
        label: 'Simple text',
        name: 'simple-text',
        type: 'text',
        size: 12,
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof GridForm>;

export const SubmitButtonRight: Story = {
  args: {
    submit: {
      contents: 'Right Submit!?',
      position: 'right',
      size: 12,
    },
  },
  play: async ({ canvas, userEvent }) => {
    const [button] = canvas.getAllByRole('button');
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
    await expect(button).toHaveTextContent('Right Submit!?');
    await expect(button).toHaveAttribute('type', 'submit');

    await userEvent.click(button);
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
  },
};

export const SubmitButtonLeft: Story = {
  args: {
    submit: {
      contents: 'Left Submit!?',
      position: 'left',
      size: 12,
    },
  },
};

export const SubmitButtonCenter: Story = {
  args: {
    submit: {
      contents: 'Center Submit!?',
      position: 'center',
      size: 12,
    },
  },
};

export const SubmitButtonStretch: Story = {
  args: {
    submit: {
      contents: 'Stretch Submit!?',
      position: 'stretch',
      size: 12,
    },
  },
};

export const SubmitButtonFill: Story = {
  args: {
    submit: {
      contents: 'Fill Submit!?',
      type: 'fill',
      size: 12,
    },
  },
};

export const SubmitButtonCTA: Story = {
  args: {
    submit: {
      contents: 'CTA Submit!?',
      type: 'cta',
      size: 12,
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'CTA Submit!?' })
    ).toHaveAttribute('type', 'submit');
  },
};

export const SubmitButtonInline: Story = {
  args: {
    fields: [
      {
        label: 'Simple text',
        name: 'simple-text',
        type: 'text',
        size: 6,
      },
    ],
    submit: {
      contents: 'Inline Submit!?',
      size: 4,
      position: 'right',
    },
  },
};

export const CancelButton: Story = {
  args: {
    cancel: {
      children: 'Cancel',
      onClick: onCancel,
    },
    submit: {
      contents: 'Submit!?',
      position: 'right',
      size: 12,
    },
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getAllByRole('button')).toHaveLength(2);

    await userEvent.click(canvas.getByRole('button', { name: 'Cancel' }));
    await expect(onCancel).toHaveBeenCalledTimes(1);
    await expect(onSubmit).not.toHaveBeenCalled();
  },
};

export const Loading: Story = {
  args: {
    submit: {
      contents: 'Loading Submit!?',
      loading: true,
      size: 12,
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'Loading' })
    ).toBeDisabled();
  },
};

export const Disabled: Story = {
  args: {
    validation: 'onChange',
    submit: {
      contents: 'Disabled Submit!?',
      disabled: true,
      size: 12,
    },
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Disabled Submit!?' });
    await expect(button).toBeDisabled();

    await userEvent.type(
      canvas.getByRole('textbox', { name: 'Simple text' }),
      'valid'
    );
    await expect(button).toBeDisabled();
  },
};

export const CancelLink: Story = {
  args: {
    cancel: {
      children: 'Back to settings',
      href: '/settings',
    },
    submit: {
      contents: 'Save',
      position: 'right',
      size: 12,
    },
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('link', { name: 'Back to settings' })
    ).toHaveAttribute('href', '/settings');
    await expect(canvas.getAllByRole('button')).toHaveLength(1);
  },
};

export const LoadingWhileSubmitting: Story = {
  render: function LoadingWhileSubmittingStory(args) {
    const finishSubmit = useRef<() => void>();

    return (
      <GridForm
        {...args}
        submit={{
          contents: 'Save',
          size: 12,
          loading: ({ isSubmitting }) => isSubmitting,
        }}
        onSubmit={(values) =>
          new Promise<void>((resolve) => {
            onSubmit(values);
            finishSubmit.current = resolve;
          })
        }
      >
        <StrokeButton onClick={() => finishSubmit.current?.()}>
          Finish submitting
        </StrokeButton>
      </GridForm>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(
      await canvas.findByRole('button', { name: 'Loading' })
    ).toBeDisabled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Finish submitting' })
    );
    await canvas.findByRole('button', { name: 'Save' });
    await expect(onSubmit).toHaveBeenCalledTimes(1);
  },
};
