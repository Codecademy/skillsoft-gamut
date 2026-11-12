import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor } from 'storybook/test';

import { GridForm } from '../../GridForm';
import type { NestedGridFormCheckboxOption } from '../../types';

const options: NestedGridFormCheckboxOption[] = [
  {
    value: 'frontend',
    label: 'Frontend Technologies',
    options: [
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue.js' },
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
      { value: 'java', label: 'Java', disabled: true },
    ],
  },
  {
    value: 'databases',
    label: 'Databases',
  },
];

const onUpdate = fn();
const onSubmit = fn();

type NestedCheckboxStoryArgs = {
  defaultValue?: string[];
  disabled?: boolean;
  customError?: string;
  options: NestedGridFormCheckboxOption[];
};

const meta: Meta<NestedCheckboxStoryArgs> = {
  title: 'Inputs & forms/GridForm/NestedCheckboxes',
  parameters: { docs: { propsTable: false } },
  args: { options, defaultValue: [] },
  render: ({ defaultValue, disabled, customError, options }) => (
    <GridForm
      fields={[
        {
          type: 'nested-checkboxes',
          name: 'technologies',
          label: 'Technologies',
          size: 12,
          options,
          onUpdate,
          defaultValue,
          disabled,
          customError,
          validation: { required: 'Please check at least one option' },
        },
      ]}
      submit={{ contents: 'Submit Me!?', size: 4 }}
      validation="onSubmit"
      onSubmit={onSubmit}
    />
  ),
};

export default meta;
type Story = StoryObj<NestedCheckboxStoryArgs>;

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
  'Vue.js',
  'Angular',
  'Backend Technologies',
  'Node.js',
  'Express.js',
  'Fastify',
  'Python',
  'Java',
  'Databases',
];

const submit = (canvas: Canvas) =>
  canvas.getByRole('button', { name: 'Submit Me!?' });

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
    await expect(frontend).toHaveAttribute('aria-required', 'true');
    await expect(canvas.getByLabelText('React')).toHaveAttribute(
      'aria-required',
      'true'
    );
    await expect(frontend).toHaveAttribute('id', 'technologies-frontend');
    await expect(canvas.getByLabelText('React')).toHaveAttribute(
      'id',
      'technologies-react'
    );
    await expect(canvas.getByLabelText('Express.js')).toHaveAttribute(
      'id',
      'technologies-express'
    );

    await expect(canvas.getByLabelText('Java')).toBeDisabled();
    await expect(canvas.getByLabelText('Vue.js')).toBeEnabled();
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

    await userEvent.click(canvas.getByLabelText('Frontend Technologies'));
    await expectChecked(canvas, [
      'Frontend Technologies',
      'React',
      'Vue.js',
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
      'Vue.js',
      'Angular',
      'Node.js',
      'Express.js',
      'Fastify',
      'Java',
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
      'Vue.js',
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

export const Validation: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(submit(canvas));
    await canvas.findByText('Please check at least one option');
    await expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.click(canvas.getByLabelText('React'));
    await userEvent.click(submit(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { technologies: ['react'] },
        expect.anything()
      )
    );
  },
};

export const CustomError: Story = {
  args: { customError: 'Please select at least one option' },
  play: async ({ canvas }) => {
    canvas.getByText('Please select at least one option');
    await Promise.all(
      allLabels.map((label) =>
        expect(canvas.getByLabelText(label)).toHaveAttribute(
          'aria-invalid',
          'true'
        )
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
      } as unknown as NestedGridFormCheckboxOption,
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByLabelText('Parent Option')).toHaveAttribute(
      'id',
      'technologies-1'
    );
    await expect(canvas.getByLabelText('Child Option')).toHaveAttribute(
      'id',
      'technologies-2'
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
