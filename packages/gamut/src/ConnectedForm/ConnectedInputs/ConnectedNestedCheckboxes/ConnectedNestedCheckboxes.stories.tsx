import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor } from 'storybook/test';

import { ConnectedForm } from '../../ConnectedForm';
import { ConnectedFormGroup } from '../../ConnectedFormGroup';
import { SubmitButton } from '../../SubmitButton';
import type { NestedConnectedCheckboxOption } from '../types';
import { ConnectedNestedCheckboxes } from '.';

const options: NestedConnectedCheckboxOption[] = [
  {
    value: 'frontend',
    label: 'Frontend Technologies',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
      { value: 'angular', label: 'Angular' },
    ],
  },
  {
    value: 'backend',
    label: 'Backend Technologies',
    options: [
      {
        value: 'node',
        label: 'Node.js',
        options: [
          { value: 'express', label: 'Express.js' },
          { value: 'fastify', label: 'Fastify' },
        ],
      },
      { value: 'python', label: 'Python' },
      { value: 'ruby', label: 'Ruby', disabled: true },
    ],
  },
  {
    value: 'databases',
    label: 'Databases',
  },
];

const onUpdate = fn();
const onSubmit = fn();

type NestedCheckboxesStoryArgs = React.ComponentProps<
  typeof ConnectedNestedCheckboxes
> & {
  defaultValue?: string[];
  required?: boolean;
};

const meta: Meta<NestedCheckboxesStoryArgs> = {
  title: 'Inputs & forms/ConnectedForm/ConnectedNestedCheckboxes',
  component: ConnectedNestedCheckboxes,
  args: { name: 'skills', options },
  argTypes: {
    name: { control: false },
    onUpdate: { control: false },
    defaultValue: { table: { disable: true } },
    required: { table: { disable: true } },
  },
  render: ({ defaultValue, required, name, disabled, options, spacing }) => (
    <ConnectedForm
      defaultValues={{ [name]: defaultValue }}
      validationRules={
        required
          ? { [name]: { required: 'At least one skill is required' } }
          : undefined
      }
      onSubmit={onSubmit}
    >
      <ConnectedFormGroup
        disabled={disabled}
        field={{
          component: ConnectedNestedCheckboxes,
          options,
          spacing,
          onUpdate,
        }}
        label="nested checkboxes field"
        name={name}
      />
      <SubmitButton>submit this form</SubmitButton>
    </ConnectedForm>
  ),
};

export default meta;
type Story = StoryObj<NestedCheckboxesStoryArgs>;

type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

const expectChecked = (canvas: Canvas, labels: string[]) =>
  Promise.all(
    labels.map((label) => expect(canvas.getByLabelText(label)).toBeChecked())
  );

const expectUnchecked = (canvas: Canvas, labels: string[]) =>
  Promise.all(
    labels.map((label) =>
      expect(canvas.getByLabelText(label)).not.toBeChecked()
    )
  );

const expectMixed = (canvas: Canvas, labels: string[]) =>
  Promise.all(
    labels.map((label) =>
      expect(canvas.getByLabelText(label)).toHaveAttribute(
        'aria-checked',
        'mixed'
      )
    )
  );

const allLabels = [
  'Frontend Technologies',
  'React',
  'Vue',
  'Angular',
  'Backend Technologies',
  'Node.js',
  'Express.js',
  'Fastify',
  'Python',
  'Ruby',
  'Databases',
];

export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(11);
    await expectUnchecked(canvas, allLabels);

    const frontend = canvas.getByLabelText('Frontend Technologies');
    await expect(frontend).toHaveAttribute(
      'aria-label',
      'Frontend Technologies'
    );
    await expect(frontend).toHaveAttribute('aria-checked', 'false');
    await expect(frontend).toHaveAttribute('id', 'skills-frontend');
    await expect(canvas.getByLabelText('React')).toHaveAttribute(
      'id',
      'skills-react'
    );
    await expect(canvas.getByLabelText('Express.js')).toHaveAttribute(
      'id',
      'skills-express'
    );

    await expect(canvas.getByLabelText('Ruby')).toBeDisabled();
    await expect(canvas.getByLabelText('Vue')).toBeEnabled();
  },
};

export const SelectingOptions: Story = {
  play: async ({ canvas, userEvent }) => {
    const react = canvas.getByLabelText('React');
    await userEvent.click(react);
    await expect(react).toBeChecked();
    await expectMixed(canvas, ['Frontend Technologies']);
    await expect(onUpdate).toHaveBeenLastCalledWith(['react']);

    await userEvent.click(react);
    await expect(onUpdate).toHaveBeenLastCalledWith([]);
    await expect(
      canvas.getByLabelText('Frontend Technologies')
    ).toHaveAttribute('aria-checked', 'false');

    await userEvent.click(canvas.getByLabelText('Frontend Technologies'));
    await expectChecked(canvas, [
      'Frontend Technologies',
      'React',
      'Vue',
      'Angular',
    ]);
    await expect(onUpdate).toHaveBeenLastCalledWith([
      'react',
      'vue',
      'angular',
      'frontend',
    ]);

    await userEvent.click(canvas.getByLabelText('Node.js'));
    await expectChecked(canvas, ['Node.js', 'Express.js', 'Fastify']);
    await expectMixed(canvas, ['Backend Technologies']);
    await expect(onUpdate).toHaveBeenLastCalledWith([
      'react',
      'vue',
      'angular',
      'frontend',
      'express',
      'fastify',
      'node',
    ]);
  },
};

export const WithDefaultValues: Story = {
  args: { defaultValue: ['react', 'python'] },
  play: async ({ canvas }) => {
    await expectChecked(canvas, ['React', 'Python']);
    await expectMixed(canvas, [
      'Frontend Technologies',
      'Backend Technologies',
    ]);
    await expectUnchecked(canvas, [
      'Vue',
      'Angular',
      'Node.js',
      'Express.js',
      'Fastify',
      'Ruby',
      'Databases',
    ]);
  },
};

export const DeeplyNestedDefaultValues: Story = {
  args: { defaultValue: ['express', 'fastify'] },
  play: async ({ canvas }) => {
    const node = canvas.getByLabelText('Node.js');
    await expect(node).toBeChecked();
    await expect(node).toHaveProperty('indeterminate', false);
    await expect(
      canvas.getByLabelText('Backend Technologies')
    ).not.toBeChecked();
    await expectMixed(canvas, ['Backend Technologies']);
  },
};

export const ParentDefaultValues: Story = {
  args: { defaultValue: ['frontend', 'backend'] },
  play: async ({ canvas, userEvent }) => {
    await waitFor(() =>
      expectChecked(
        canvas,
        allLabels.filter((label) => label !== 'Databases')
      )
    );

    await userEvent.click(canvas.getByLabelText('Python'));
    await expect(canvas.getByLabelText('Python')).not.toBeChecked();
    await expectMixed(canvas, ['Backend Technologies']);
    await expectChecked(canvas, ['Node.js', 'Express.js', 'Fastify']);
  },
};

export const AllChildrenSelected: Story = {
  args: { defaultValue: ['react', 'vue', 'angular'] },
  play: async ({ canvas, userEvent }) => {
    const frontend = canvas.getByLabelText('Frontend Technologies');
    await expect(frontend).toBeChecked();

    await userEvent.click(canvas.getByLabelText('React'));
    await expect(frontend).not.toBeChecked();
    await expectMixed(canvas, ['Frontend Technologies']);

    await userEvent.click(canvas.getByLabelText('React'));
    await expect(frontend).toBeChecked();

    await userEvent.click(frontend);
    await expectUnchecked(canvas, [
      'Frontend Technologies',
      'React',
      'Vue',
      'Angular',
    ]);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, userEvent }) => {
    await Promise.all(
      allLabels.map((label) =>
        expect(canvas.getByLabelText(label)).toBeDisabled()
      )
    );

    const react = canvas.getByLabelText('React');
    await userEvent.click(react);
    await expect(react).not.toBeChecked();
    await expect(onUpdate).not.toHaveBeenCalled();
  },
};

export const Required: Story = {
  args: { required: true },
  play: async ({ canvas, userEvent }) => {
    await expect(
      canvas.getByLabelText('Frontend Technologies')
    ).toHaveAttribute('aria-required', 'true');

    await userEvent.click(
      canvas.getByRole('button', { name: 'submit this form' })
    );
    await canvas.findByText('At least one skill is required');
    await expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByLabelText('React'));
    await userEvent.click(
      canvas.getByRole('button', { name: 'submit this form' })
    );
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { skills: ['react'] },
        expect.anything()
      )
    );
  },
};

export const FlatOptions: Story = {
  args: {
    options: [
      { value: 'option1', label: 'Option 1' },
      { value: 'option2', label: 'Option 2' },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    canvas.getByLabelText('Option 1');
    canvas.getByLabelText('Option 2');
  },
};

export const NumericValues: Story = {
  args: {
    options: [
      {
        value: 1,
        label: 'Parent Option',
        options: [{ value: 2, label: 'Child Option' }],
      } as unknown as NestedConnectedCheckboxOption,
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Parent Option')).toHaveAttribute(
      'id',
      'skills-1'
    );
    await expect(canvas.getByLabelText('Child Option')).toHaveAttribute(
      'id',
      'skills-2'
    );
  },
};

export const EmptyOptions: Story = {
  args: { options: [] },
  play: async ({ canvas }) => {
    canvas.getByRole('list');
    await expect(canvas.queryAllByRole('listitem')).toHaveLength(0);
  },
};
