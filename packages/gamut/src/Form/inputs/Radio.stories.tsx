import type { Meta, StoryObj } from '@storybook/react';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { expect, fn, screen, waitFor } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { infotipNestedArgTypes } from '~storybook/argTypes';

import { FlexBox } from '../../Box';
import { Text } from '../../Typography';
import { FormGroup } from '../elements/FormGroup';
import { Radio } from './Radio';
import { RadioGroup } from './RadioGroup';

const meta: TypeWithDeepControls<Meta<typeof Radio>> = {
  title: 'Inputs & forms/Radio',
  component: Radio,
  args: {
    htmlFor: 'example-radio',
    label: 'Option 1',
    name: 'example-radio',
  },
  argTypes: {
    ...infotipNestedArgTypes,
  },
};

export default meta;
type Story = StoryObj<typeof Radio>;

export const Default: Story = {
  args: {},
};

export const RadioGroupComponent: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => {
    const RadioGroupExample = () => {
      const [selected, setSelected] = useState('option-1');

      const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
        setSelected(event.target.value);
        args.onChange?.(event);
      };

      return (
        <RadioGroup
          data-testid="radio-group"
          htmlForPrefix="example-radio"
          name="example-radio"
          onChange={changeHandler}
        >
          <Radio
            checked={selected === 'option-1'}
            label="Option 1"
            value="option-1"
          />
          <Radio
            checked={selected === 'option-2'}
            label="Option 2"
            value="option-2"
          />
        </RadioGroup>
      );
    };

    return <RadioGroupExample />;
  },
  play: async ({ args, canvas, userEvent }) => {
    canvas.getByTestId('radio-group');

    const option1 = canvas.getByRole('radio', { name: 'Option 1' });
    await expect(option1).toHaveAttribute('id', 'example-radio-0');
    await expect(option1).toHaveAttribute('name', 'example-radio');
    await expect(option1).toBeChecked();

    await userEvent.click(canvas.getByRole('radio', { name: 'Option 2' }));
    await expect(args.onChange).toHaveBeenCalled();
    await expect(canvas.getByRole('radio', { name: 'Option 2' })).toBeChecked();
  },
};

export const RadioGroupWithInfoTips: Story = {
  render: () => (
    <FormGroup
      htmlFor="example-radio-infotip"
      infotip={{
        info: 'This InfoTip is linked to the RadioGroup label. Individual options can also have their own InfoTips.',
        placement: 'floating',
      }}
      label="Select an option"
      width="fit-content"
    >
      <RadioGroup
        htmlForPrefix="example-radio-infotip"
        name="example-radio-infotip"
      >
        <Radio
          infotip={{
            info: 'This option includes additional information about the choice.',
            placement: 'floating',
          }}
          label="Option with InfoTip"
        />
        <Radio
          infotip={{
            info: 'Each radio option can have its own InfoTip for context.',
          }}
          label="Another option"
        />
        <Radio label="Option without InfoTip" />
      </RadioGroup>
    </FormGroup>
  ),
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: /Select an option/ });
    canvas.getByRole('button', { name: 'Option with InfoTip' });
  },
};

export const Checked: Story = {
  args: {
    htmlFor: 'example-checked',
    name: 'example-checked',
    label: 'Checked',
    checked: true,
  },
  play: ({ canvas }) => {
    canvas.getByRole('radio', { checked: true });
  },
};

export const Disabled: Story = {
  args: {
    htmlFor: 'example-disabled',
    name: 'example-disabled',
    label: 'Disabled',
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    htmlFor: 'example-disabled-checked',
    name: 'example-disabled-checked',
    label: 'Disabled and Checked',
    disabled: true,
    checked: true,
  },
};

export const Error: Story = {
  args: {
    htmlFor: 'example-error',
    label: 'Error',
    name: 'example-error',
    error: true,
  },
};

export const CustomLabel: Story = {
  args: {
    infotip: {
      emphasis: 'high',
      info: 'This is an infotip',
      placement: 'floating',
    },
    htmlFor: 'example-custom',
    name: 'example-custom',
    label: 'Option with infotip',
  },
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('button', { name: 'Option with infotip' });

    await userEvent.click(trigger);
    await waitFor(() =>
      expect(screen.getByText('This is an infotip')).toBeVisible()
    );
  },
};

export const JsxLabel: Story = {
  render: () => (
    <Radio
      data-testid="radio-passthrough"
      htmlFor="example-jsx"
      label={<img alt="my cat" src="cat.jpg" />}
      name="example-jsx"
      value="jsx"
    />
  ),
  play: async ({ canvas }) => {
    canvas.getByAltText('my cat');
    await expect(canvas.getByRole('radio')).toHaveAttribute(
      'data-testid',
      'radio-passthrough'
    );
  },
};

export const InfoTipLabelling: Story = {
  render: () => (
    <FlexBox column gap={32}>
      <Radio
        htmlFor="radio-auto"
        infotip={{ info: 'Shared info', placement: 'floating' }}
        label={<span>Auto Radio Label</span>}
        name="radio-auto"
        value="auto"
      />
      <Radio
        htmlFor="radio-aria"
        infotip={{
          info: 'Shared info',
          ariaLabel: 'Custom radio aria label',
          placement: 'floating',
        }}
        label="With ariaLabel"
        name="radio-aria"
        value="aria"
      />
      <div>
        <Text id="radio-ext-label" pt={8}>
          External Radio Label
        </Text>
        <Radio
          htmlFor="radio-labelledby"
          infotip={{
            info: 'Shared info',
            ariaLabelledby: 'radio-ext-label',
            placement: 'floating',
          }}
          label="With ariaLabelledBy"
          name="radio-labelledby"
          value="labelledby"
        />
      </div>
    </FlexBox>
  ),
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: 'Auto Radio Label' });
    canvas.getByRole('button', { name: 'Custom radio aria label' });
    canvas.getByRole('button', { name: 'External Radio Label' });
  },
};
