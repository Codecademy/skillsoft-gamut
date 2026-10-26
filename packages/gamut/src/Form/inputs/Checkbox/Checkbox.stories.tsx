import { MiniStarIcon } from '@skillsoft/gamut-icons';
import { Background } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { expect, fn, screen, waitFor } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { infotipNestedArgTypes } from '~storybook/argTypes';

import { Anchor } from '../../../Anchor';
import { Box, FlexBox } from '../../../Box';
import { Column, LayoutGrid } from '../../../Layout';
import { Text } from '../../../Typography';
import type { CheckboxProps } from './Checkbox';
import { Checkbox } from './Checkbox';

const meta: TypeWithDeepControls<Meta<typeof Checkbox>> = {
  title: 'Inputs & forms/Checkbox',
  component: Checkbox,
  args: {
    htmlFor: 'example-checkbox',
    label: 'A Checkbox Label',
    name: 'example-checkbox',
    checked: true,
    readOnly: true,
    onChange: () => {},
  },
  argTypes: {
    ...infotipNestedArgTypes,
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {},
};

export const Unchecked: Story = {
  args: {
    htmlFor: 'example-unchecked',
    label: 'unchecked',
    name: 'example-unchecked',
    checked: false,
    indeterminate: false,
  },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole('checkbox', { checked: false });
    await expect(checkbox).toHaveProperty('indeterminate', false);
  },
};

export const Checked: Story = {
  args: {
    htmlFor: 'example-checked',
    label: 'checked',
    name: 'example-checked',
    checked: true,
  },
  play: ({ canvas }) => {
    canvas.getByRole('checkbox', { checked: true });
  },
};

export const Indeterminate: Story = {
  args: {
    htmlFor: 'indeterminate',
    label: 'indeterminate',
    name: 'example-indeterminate',
    checked: false,
    indeterminate: true,
  },
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole('checkbox');
    await expect(checkbox).toHaveProperty('indeterminate', true);
  },
};

export const CheckedOverridesIndeterminate: Story = {
  render: () => (
    <Checkbox
      {...({
        checked: true,
        indeterminate: true,
        htmlFor: 'checked-overrides',
        label: 'checked wins over indeterminate',
        name: 'checked-overrides',
        readOnly: true,
      } as unknown as CheckboxProps)}
    />
  ),
  play: async ({ canvas }) => {
    const checkbox = canvas.getByRole('checkbox', { checked: true });
    await expect(checkbox).toHaveProperty('indeterminate', false);
  },
};

export const Disabled: Story = {
  args: {
    htmlFor: 'example-disabled',
    label: 'Disabled',
    name: 'example-disabled',
    disabled: true,
    checked: false,
  },
};

export const CheckedAndDisabled: Story = {
  args: {
    htmlFor: 'example-checked-disabled',
    label: 'Checked + Disabled',
    name: 'example-checked-disabled',
    disabled: true,
    checked: true,
  },
};

export const Multiline: Story = {
  args: {
    htmlFor: 'example-multiline',
    name: 'example-multiline',
    label:
      'I am a longer label and will displayed at a smaller size in order to conserve valuable space.  This can be used to display some disclaimer about terms or conditions that might be a bit too long for a normal label area',
    multiline: true,
    checked: false,
  },
};

export const SpacingTight: Story = {
  render: () => (
    <Box as="fieldset" m={0} p={0}>
      <legend>Tight Spacing</legend>
      <FlexBox as="ul" column listStyle="none" m={0} p={0}>
        {[
          { id: 'spacing-1', label: 'a small space', checked: true },
          { id: 'spacing-2', label: 'with three checkboxes', checked: false },
          { id: 'spacing-3', label: 'neat huh?', checked: true },
        ].map(({ id, label, checked }) => (
          <Box as="li" key={id} mt={4}>
            <Checkbox
              checked={checked}
              htmlFor={id}
              label={label}
              name={id}
              readOnly
              spacing="tight"
            />
          </Box>
        ))}
      </FlexBox>
    </Box>
  ),
};

export const LabelsAsReactNodes: Story = {
  args: {},
  play: ({ canvas }) => {
    canvas.getByText('a string');
    canvas.getByRole('checkbox', { name: 'a node' });
    canvas.getByRole('link', { name: 'click' });
  },
  render: () => (
    <Box as="fieldset" m={0} p={0}>
      <legend>Labels as React Nodes</legend>
      <FlexBox as="ul" column listStyle="none" m={0} p={0}>
        <Box as="li" mt={4}>
          <Checkbox
            checked
            htmlFor="accessible-1"
            label="a string"
            name="accessible-1"
            readOnly
          />
        </Box>
        <Box as="li" mt={4}>
          <Checkbox
            aria-label="a node"
            htmlFor="accessible-2"
            label={
              <FlexBox alignItems="center">
                <MiniStarIcon mr={4} />a node <MiniStarIcon ml={4} />
              </FlexBox>
            }
            name="accessible-2"
          />
        </Box>
        <Box as="li" mt={4}>
          <Checkbox
            aria-label="Here is a link to click"
            dontAriaHideLabel
            htmlFor="accessible-3"
            label={
              <Box>
                <Text aria-hidden>Here is a link to&nbsp;</Text>
                <Anchor href="/">click</Anchor>
                <Text aria-hidden>!</Text>
              </Box>
            }
            name="accessible-3"
          />
        </Box>
      </FlexBox>
    </Box>
  ),
};

export const InfoTip: Story = {
  args: {
    htmlFor: 'example-infotip',
    label: 'Checkbox with InfoTip',
    name: 'example-infotip',
    infotip: {
      emphasis: 'high',
      info: 'This is an infotip that provides additional information about the checkbox.',
      placement: 'floating',
    },
    checked: false,
  },
  play: async ({ canvas, userEvent }) => {
    const info =
      'This is an infotip that provides additional information about the checkbox.';
    const trigger = canvas.getByRole('button', {
      name: 'Checkbox with InfoTip',
    });

    await expect(screen.queryByText(info)).toBeNull();
    await userEvent.click(trigger);
    await waitFor(() => expect(screen.getByText(info)).toBeVisible());
  },
};

export const InfoTipLabelling: Story = {
  render: () => (
    <FlexBox as="ul" column gap={32} listStyle="none" m={0} p={0}>
      <Box as="li">
        <Checkbox
          aria-label="Auto Checkbox Label"
          htmlFor="checkbox-auto"
          infotip={{ info: 'Shared info', placement: 'floating' }}
          label={<span>Auto Checkbox Label</span>}
          name="checkbox-auto"
        />
      </Box>
      <Box as="li">
        <Checkbox
          htmlFor="checkbox-aria"
          infotip={{
            info: 'Shared info',
            ariaLabel: 'Custom checkbox aria label',
            placement: 'floating',
          }}
          label="With ariaLabel"
          name="checkbox-aria"
        />
      </Box>
      <Box as="li">
        <Text id="checkbox-ext-label" pt={8}>
          External Checkbox Label
        </Text>
        <Checkbox
          htmlFor="checkbox-labelledby"
          infotip={{
            info: 'Shared info',
            ariaLabelledby: 'checkbox-ext-label',
            placement: 'floating',
          }}
          label="With ariaLabelledBy"
          name="checkbox-labelledby"
        />
      </Box>
    </FlexBox>
  ),
  play: async ({ canvas }) => {
    canvas.getByRole('button', { name: 'Auto Checkbox Label' });
    canvas.getByRole('button', { name: 'Custom checkbox aria label' });
    await expect(
      canvas.queryByRole('button', { name: 'With ariaLabel' })
    ).toBeNull();
    canvas.getByRole('button', { name: 'External Checkbox Label' });
    await expect(
      canvas.queryByRole('button', { name: 'With ariaLabelledBy' })
    ).toBeNull();
  },
};

type CustomCheckboxProps = Omit<
  CheckboxProps,
  'checked' | 'indeterminate' | 'label'
> & {
  defaultChecked?: boolean;
  label: string;
};

const ControllableCheckbox: React.FC<CustomCheckboxProps> = ({
  htmlFor,
  label,
  defaultChecked = false,
  disabled,
  onChange,
  ...rest
}) => {
  const [currentChecked, setCurrentChecked] = useState(defaultChecked);

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentChecked(!currentChecked);
    onChange?.(event);
  };

  return (
    <Checkbox
      checked={currentChecked}
      disabled={disabled}
      htmlFor={htmlFor}
      label={label}
      onChange={changeHandler}
      {...rest}
    />
  );
};

export const CustomCheckbox: Story = {
  args: {
    onChange: fn(),
  },
  render: (args) => (
    <ControllableCheckbox
      htmlFor="a-custom-checkbox"
      label="a custom controlled checkbox"
      name="a-custom-checkbox"
      onChange={args.onChange}
    />
  ),
  play: async ({ args, canvas, userEvent }) => {
    const checkbox = canvas.getByRole('checkbox');
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const ControlledCheckbox: Story = {
  render: () => (
    <Box border={1} p={16}>
      <LayoutGrid>
        <Column size={4}>
          <ControllableCheckbox
            htmlFor="a-custom-checkbox"
            label="a fancy custom checkbox made with the example below, isn't it so so nice?"
            multiline
          />
        </Column>
        <Column size={4}>
          <ControllableCheckbox
            defaultChecked
            disabled
            htmlFor="a-custom-checkbox-again"
            label="disabled custom checkbox"
          />
        </Column>
        <Column size={4}>
          <Background bg="black" pl={8}>
            <ControllableCheckbox
              htmlFor="a-custom-checkbox-the-third"
              label="a dark mode fancy checkbox"
            />
          </Background>
        </Column>
      </LayoutGrid>
    </Box>
  ),
};

export const NestedCheckboxes: Story = {
  render: () => {
    const NestedCheckboxesComponent = () => {
      const [childrenChecked, setChildrenChecked] = useState<boolean[]>([
        false,
        false,
        false,
      ]);

      const allChecked = childrenChecked.every(Boolean);
      const someChecked = childrenChecked.some(Boolean);

      const isIndeterminate = !allChecked && someChecked;

      const toggleAll = () => {
        const next = !allChecked;
        setChildrenChecked(childrenChecked.map(() => next));
      };

      const toggleChild = (index: number) => () => {
        setChildrenChecked((prev) => {
          const next = [...prev];
          next[index] = !prev[index];
          return next;
        });
      };

      return (
        <Box as="fieldset" border={1} borderRadius="sm" maxWidth="340px" p={16}>
          <legend>My fave Gamut components</legend>
          <Box ml={8}>
            <Checkbox
              htmlFor="nested-parent"
              label="Select all components"
              name="nested-parent"
              onChange={toggleAll}
              {...(isIndeterminate
                ? { indeterminate: true as const, checked: false as const }
                : { checked: allChecked })}
            />
          </Box>
          <Box as="ul" listStyle="none" ml={32} p={0}>
            {['Boxes', 'ToolTips', 'Pagination'].map((component, i) => (
              <Box as="li" key={component}>
                <Checkbox
                  checked={childrenChecked[i]}
                  htmlFor={`nested-child-${i}`}
                  label={component}
                  name={`nested-child-${i}`}
                  onChange={toggleChild(i)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      );
    };

    return <NestedCheckboxesComponent />;
  },
};
