import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn } from 'storybook/test';

import { Text } from '../Typography';
import { Toggle } from '.';

const meta: Meta<typeof Toggle> = {
  title: 'Actions/Toggle',
  component: Toggle,
  args: {
    label: 'Toggle me',
  },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  args: {},
  play: ({ canvas }) => {
    canvas.getByRole('checkbox', { name: 'Toggle me' });
  },
};

export const Medium: Story = {
  args: {
    size: 'medium',
    label: undefined,
    ariaLabel: 'Accessible toggle',
  },
  play: ({ canvas }) => {
    canvas.getByLabelText('Accessible toggle');
  },
};

export const Small: Story = {
  args: {
    size: 'small',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    onChange: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole('checkbox');
    await expect(toggle).toBeDisabled();

    await userEvent.click(canvas.getByText('Toggle me'));
    await expect(args.onChange).not.toHaveBeenCalled();
  },
};

export const DisabledChecked: Story = {
  args: {
    disabled: true,
    checked: true,
  },
};

export const LabelLeft: Story = {
  args: {
    label: 'My label is to the left',
    labelSide: 'left',
  },
};

export const LabelRight: Story = {
  args: {
    label: 'My label is to the right',
    labelSide: 'right',
  },
};

export const ReactComponentLabel: Story = {
  args: {
    checked: false,
    label: <Text>I am a Text component</Text>,
    ariaLabel: 'Hello there',
  },
  play: ({ canvas }) => {
    canvas.getByText('I am a Text component');
    canvas.getByLabelText('Hello there');
  },
};

export const InputElement: Story = {
  args: {
    label: 'input toggle',
    onChange: () => null,
  },
  play: ({ canvas }) => {
    canvas.getByRole('checkbox', { name: 'input toggle' });
  },
};

export const ButtonElement: Story = {
  args: {
    as: 'button',
    checked: true,
    label: 'button toggle',
    onChange: undefined,
    onClick: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole('switch', { name: 'button toggle' });

    await userEvent.click(toggle);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const DisabledButton: Story = {
  args: {
    as: 'button',
    checked: false,
    disabled: true,
    label: 'disabled button toggle',
    onChange: undefined,
    onClick: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    const toggle = canvas.getByRole('switch');
    await expect(toggle).toBeDisabled();

    await userEvent.click(canvas.getByText('disabled button toggle'));
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const InteractiveInputToggle: Story = {
  render: function InteractiveInputToggleStory() {
    const [checked, setChecked] = useState(false);
    return (
      <Toggle
        checked={checked}
        label="interactive input toggle"
        onChange={() => setChecked((value) => !value)}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('checkbox');
    await expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();

    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
  },
};

export const InteractiveButtonToggle: Story = {
  render: function InteractiveButtonToggleStory() {
    const [checked, setChecked] = useState(false);
    return (
      <Toggle
        as="button"
        checked={checked}
        label="interactive button toggle"
        onClick={() => setChecked((value) => !value)}
      />
    );
  },
  play: async ({ canvas, userEvent }) => {
    const toggle = canvas.getByRole('switch');
    await expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();

    await userEvent.click(toggle);
    await expect(toggle).not.toBeChecked();
  },
};
