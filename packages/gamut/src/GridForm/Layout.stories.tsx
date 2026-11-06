import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn } from 'storybook/test';

import { Markdown } from '../Markdown';
import { GridForm } from '.';

const onSubmit = fn();

const meta: Meta<typeof GridForm> = {
  title: 'Inputs & forms/GridForm/Layout',
  component: GridForm,
  parameters: { docs: { propsTable: false } },
  args: {
    onSubmit,
    submit: {
      contents: 'Submit',
      size: 4,
      position: 'left',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GridForm>;

export const Formatted: Story = {
  args: {
    fields: [
      {
        label: 'Fave Gamut Component',
        name: 'rowspan-radiogroup',
        options: [
          {
            label: 'FlexBox',
            value: 'flex',
          },
          {
            label: 'GridForm',
            value: 'grid',
          },
          {
            label: 'Text',
            value: 'text',
          },
        ],
        size: 3,
        rowspan: 3,
        type: 'radio-group',
        validation: {
          required: 'You gotta pick one!',
        },
      },
      {
        label: 'Simple text',
        name: 'rowspan-simple-text',
        size: 3,
        type: 'text',
      },
      {
        defaultValue: 'yeet',
        label: 'Text with default value',
        name: 'text-with-default-formatting',
        size: 4,
        type: 'text',
      },
      {
        label: 'Simple select (required)',
        name: 'simple-select-formatting',
        options: ['', 'One fish', 'Two fish', 'Red fish', 'Blue fish'],
        size: 5,
        type: 'select',
        validation: {
          required: 'Please select an option',
        },
      },
    ],
    requiredTextProps: { color: 'danger', variant: 'title-xs' },
  },
  play: ({ canvas }) => {
    canvas.getByText('* Required');
    canvas.getByLabelText('Simple select (required)*');
    canvas.getByLabelText('Simple text (optional)');
  },
};

export const HideRequiredText: Story = {
  args: {
    fields: [
      {
        label: 'A field',
        placeholder: 'I am very optional',
        name: 'very-optional',
        type: 'text',
        size: 12,
      },
      {
        label: 'A field',
        placeholder: 'I am very optional',
        name: 'very-optional',
        type: 'text',
        size: 12,
      },
    ],
    hideRequiredText: true,
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('* Required')).toBeNull();
  },
};

export const SoloField: Story = {
  args: {
    fields: [
      {
        label: 'A field',
        placeholder: 'I am a required solo field',
        name: 'so-required',
        type: 'text',
        size: 12,
        validation: {
          required: 'I am required',
        },
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('* Required')).toBeNull();
    canvas.getByLabelText('A field');
  },
};

export const InfoTip: Story = {
  args: {
    fields: [
      {
        infotip: {
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          alignment: 'bottom-left',
        },
        label: 'Tool input',
        name: 'input-field',
        size: 6,
        type: 'text',
      },
      {
        infotip: {
          info: <Markdown text="My grandmother used to tell me stories..." />,
          alignment: 'bottom-right',
        },
        label: 'Select with infotip',
        options: ['', 'Water', 'Earth', 'Fire', 'Air', 'Boomerang'],
        size: 3,
        type: 'select',
        validation: {
          required: 'Please select an option',
        },
        name: 'select-field',
      },
      {
        infotip: {
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        },
        label: 'Write a paragraph about infotips',
        name: 'textarea-field',
        size: 6,
        type: 'textarea',
        rows: 6,
        placeholder: 'Check out my infotip',
        validation: {
          required: 'Please write something about infotips!',
        },
      },
      {
        infotip: {
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        },
        label: 'Preferred Modern Artist',
        name: 'modern-artist',
        options: [
          {
            label: 'Taylor Swift',
            value: 'taylor-swift',
          },
          {
            label: 'Beyonce',
            value: 'beyonce',
          },
        ],
        size: 3,
        type: 'radio-group',
        validation: {
          required: 'You gotta pick one!',
        },
      },
      {
        infotip: {
          info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          alignment: 'bottom-right',
        },
        label: 'End User License Agreement',
        description: 'I promise that I read it',
        name: 'eula-checkbox-required-agreement',
        size: 4,
        type: 'checkbox',
        validation: {
          required: 'Please check the box to agree to the terms.',
        },
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: /Write a paragraph about infotips/ })
    ).toHaveAttribute('rows', '6');
  },
};

export const Sections: Story = {
  args: {
    fields: [
      {
        title: 'first section',
        layout: 'left',
        variant: 'title-xs',
        titleWrapperProps: {
          color: 'danger',
        },
        fields: [
          {
            label: 'hi?',
            name: 'text01-left-section',
            size: 4,
            type: 'text',
            validation: {
              required: true,
            },
          },
          {
            label: 'hello?',
            name: 'text02-left-section',
            size: 4,
            type: 'text',
            validation: {
              required: true,
            },
          },
          {
            label: 'Write a paragraph.',
            name: 'paragraph01-left-section',
            size: 8,
            type: 'textarea',
            validation: {
              required: 'Please write something about penguins!',
            },
          },
          {
            label: 'howdy?',
            name: 'text03-left-section',
            size: 4,
            type: 'text',
            validation: {
              required: true,
            },
          },
          {
            label: 'whats up?',
            name: 'text04--left-section',
            size: 4,
            type: 'text',
            validation: {
              required: true,
            },
          },
          {
            label: 'Write another long paragraph',
            name: 'paragraph02-left-section',
            size: 8,
            type: 'textarea',
            validation: {
              required: 'Please write something about penguins!',
            },
          },
        ],
      },
      {
        title: 'hi there... again',
        as: 'h3',
        fields: [
          {
            label: 'hello....',
            name: 'text01-center-section',
            size: 5,
            type: 'text',
            validation: {
              required: true,
            },
          },
        ],
      },
    ],
    requiredTextProps: { color: 'primary', fontStyle: 'italic' },
  },
  play: async ({ canvas }) => {
    canvas.getByRole('heading', { level: 2, name: 'first section' });
    canvas.getByRole('heading', { level: 3, name: 'hi there... again' });
    await expect(canvas.getAllByTestId('form-section-break')).toHaveLength(1);
    await expect(canvas.getAllByText('* Required')).toHaveLength(1);
  },
};

export const SingleSection: Story = {
  args: {
    fields: [
      {
        title: 'only section',
        fields: [
          {
            label: 'First',
            name: 'first',
            size: 6,
            type: 'text',
          },
          {
            label: 'Second',
            name: 'second',
            size: 6,
            type: 'text',
          },
        ],
      },
    ],
  },
  play: async ({ canvas }) => {
    canvas.getByRole('heading', { level: 2, name: 'only section' });
    await expect(canvas.queryByTestId('form-section-break')).toBeNull();
  },
};

export const HasSoloField: Story = {
  args: {
    hasSoloField: true,
    fields: [
      {
        label: 'Email',
        name: 'email',
        size: 12,
        type: 'email',
        validation: { required: 'Please enter your email' },
      },
      {
        render: ({ register }) => (
          <input type="hidden" {...register('source')} value="footer" />
        ),
        name: 'source',
        size: 12,
        type: 'custom-group',
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('* Required')).toBeNull();
    canvas.getByLabelText('Email');
  },
};
