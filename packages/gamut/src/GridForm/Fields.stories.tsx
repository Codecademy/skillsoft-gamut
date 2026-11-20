import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor, within } from 'storybook/test';

import { FormGroup, Input } from '../Form';
import { Text } from '../Typography';
import { GridForm } from '.';

const onSubmit = fn();

const meta: Meta<typeof GridForm> = {
  title: 'Inputs & forms/GridForm/Fields',
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

type Canvas = Parameters<NonNullable<Story['play']>>[0]['canvas'];

const submitButton = (canvas: Canvas) =>
  canvas.getByRole('button', { name: 'Submit' });

export const TextField: Story = {
  args: {
    fields: [
      {
        label: 'Simple text',
        name: 'simple-text',
        size: 9,
        type: 'text',
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Simple text' });
    await expect(input).toHaveAttribute('id', 'simple-text');

    await userEvent.type(input, 'hello');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { 'simple-text': 'hello' },
        expect.anything()
      )
    );
  },
};

export const DefaultTextField: Story = {
  args: {
    fields: [
      {
        defaultValue: 'yeet',
        label: 'Text with default value',
        name: 'text-with-default',
        size: 9,
        type: 'text',
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Text with default value' })
    ).toHaveValue('yeet');
  },
};

export const PlaceholderTextField: Story = {
  args: {
    fields: [
      {
        label: 'Text with placeholder',
        placeholder: 'Your email',
        name: 'placeholder',
        size: 9,
        type: 'email',
      },
    ],
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', {
      name: 'Text with placeholder',
    });
    await expect(input).toHaveAttribute('placeholder', 'Your email');
    await expect(input).toHaveAttribute('type', 'email');
  },
};

export const TextareaField: Story = {
  args: {
    fields: [
      {
        label: 'Write a paragraph about penguins',
        name: 'textarea-input',
        size: 9,
        type: 'textarea',
      },
    ],
  },
  play: async ({ canvas }) => {
    const textArea = canvas.getByRole('textbox', {
      name: 'Write a paragraph about penguins',
    });
    await expect(textArea.tagName).toBe('TEXTAREA');
    await expect(textArea).not.toHaveAttribute('rows');
  },
};

export const TextareaRows: Story = {
  args: {
    fields: [
      {
        label: 'Write a longer paragraph',
        name: 'textarea-rows',
        rows: 8,
        size: 9,
        type: 'textarea',
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Write a longer paragraph' })
    ).toHaveAttribute('rows', '8');
  },
};

export const SelectField: Story = {
  args: {
    fields: [
      {
        label: 'Simple select',
        name: 'simple-select',
        options: ['', 'One fish', 'Two fish', 'Red fish', 'Blue fish'],
        size: 9,
        type: 'select',
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Simple select' });
    await expect(within(select).getAllByRole('option')).toHaveLength(5);

    await userEvent.selectOptions(select, 'Two fish');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { 'simple-select': 'Two fish' },
        expect.anything()
      )
    );
  },
};

export const RadioGroupField: Story = {
  args: {
    fields: [
      {
        label: 'Preferred Modern Artist',
        name: 'artist',
        options: [
          {
            label: 'Cardi B',
            value: 'cardi',
          },
          {
            label: 'Nicki Minaj',
            value: 'nicki',
          },
        ],
        size: 9,
        type: 'radio-group',
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const group = canvas.getByRole('radiogroup', {
      name: 'Preferred Modern Artist',
    });
    const radios = within(group).getAllByRole('radio');
    await expect(radios).toHaveLength(2);
    await expect(radios[0]).toHaveAttribute('id', 'artist-0');
    await expect(radios[1]).toHaveAttribute('id', 'artist-1');

    await userEvent.click(canvas.getByRole('radio', { name: 'Nicki Minaj' }));
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { artist: 'nicki' },
        expect.anything()
      )
    );
  },
};

export const RadioGroupLabelling: Story = {
  args: {
    fields: [
      {
        label: 'Label text',
        ariaLabel: 'Overridden group label',
        name: 'overridden',
        options: [{ label: 'Plain option', value: 'plain' }],
        size: 6,
        type: 'radio-group',
      },
      {
        label: <strong>Rich label</strong>,
        ariaLabel: 'Rich label override',
        name: 'rich',
        options: [
          {
            label: <img alt="Team badge" src="data:," />,
            value: 'badge',
          },
        ],
        size: 6,
        type: 'radio-group',
      },
      {
        label: 'Option InfoTips',
        name: 'tips',
        options: [
          {
            label: 'Radio option',
            value: 'option1',
            infotip: { info: 'helpful information' },
          },
          {
            label: 'Labelled radio option',
            value: 'option2',
            infotip: {
              info: 'more information',
              ariaLabel: 'Custom InfoTip label',
            },
          },
        ],
        size: 6,
        type: 'radio-group',
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    canvas.getByRole('radiogroup', { name: 'Overridden group label' });
    canvas.getByRole('radiogroup', { name: 'Rich label override' });
    canvas.getByRole('radio', { name: 'Team badge' });
    canvas.getByRole('img', { name: 'Team badge' });

    canvas.getByRole('button', { name: 'Custom InfoTip label' });
    await expect(
      canvas.queryByRole('button', { name: 'Labelled radio option' })
    ).toBeNull();

    const tip = canvas.getByText('helpful information');
    await expect(tip).not.toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Radio option' }));
    await waitFor(() => expect(tip).toBeVisible());
  },
};

export const FileUploadField: Story = {
  args: {
    fields: [
      {
        label: 'Upload a cat image (we support pdf, jpeg, or png files)',
        name: 'file-input',
        size: 9,
        type: 'file',
        validation: {
          required: true,
          validate: (files) => {
            const { type } = files.item(0);
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
            if (!allowedTypes.includes(type))
              return 'Please upload a pdf, jpeg, or png file.';
            return true;
          },
        },
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByLabelText(/Upload a cat image/);
    await expect(input).toHaveAttribute('type', 'file');

    await userEvent.upload(
      input,
      new File(['meow'], 'cat.txt', { type: 'text/plain' })
    );
    await userEvent.click(submitButton(canvas));
    await canvas.findByText('Please upload a pdf, jpeg, or png file.');
    await expect(onSubmit).not.toHaveBeenCalled();

    await userEvent.upload(
      input,
      new File(['meow'], 'cat.png', { type: 'image/png' })
    );
    await userEvent.click(submitButton(canvas));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    await expect(onSubmit.mock.calls[0][0]['file-input'][0].name).toBe(
      'cat.png'
    );
  },
};

export const CheckboxField: Story = {
  args: {
    fields: [
      {
        description: 'I agree to the terms',
        label: 'Terms',
        name: 'terms',
        size: 6,
        type: 'checkbox',
        id: 'my-super-cool-id',
        validation: {
          required: true,
        },
      },
      {
        description: 'I agree to the conditions',
        label: 'Conditions',
        name: 'conditions',
        size: 6,
        type: 'checkbox',
        id: 'my-super-cool-id2',
        validation: {
          required: true,
        },
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const terms = canvas.getByRole('checkbox', {
      name: 'I agree to the terms',
    });
    const conditions = canvas.getByRole('checkbox', {
      name: 'I agree to the conditions',
    });
    await expect(terms).toHaveAttribute('id', 'my-super-cool-id');

    await userEvent.click(terms);
    await userEvent.click(submitButton(canvas));

    await userEvent.click(conditions);
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { terms: true, conditions: true },
        expect.anything()
      )
    );
    await expect(onSubmit).toHaveBeenCalledTimes(1);
  },
};

export const CheckboxSpacing: Story = {
  args: {
    fields: [
      {
        description: 'I agree to the terms',
        label: 'Terms',
        name: 'terms',
        size: 6,
        type: 'checkbox',
        id: 'terms-id',
        spacing: 'tight',
        validation: {
          required: true,
        },
      },
      {
        description: 'I agree to the conditions',
        label: 'Conditions',
        name: 'conditions',
        size: 6,
        type: 'checkbox',
        id: 'conditions-id',
        spacing: 'tight',
        validation: {
          required: true,
        },
      },
    ],
  },
};

export const NestedCheckboxesField: Story = {
  args: {
    fields: [
      {
        label: 'Nested checkboxes',
        name: 'nested-checkboxes',
        type: 'nested-checkboxes',
        defaultValue: ['backend', 'react', 'vue'],
        options: [
          {
            value: 'frontend',
            label: 'Frontend Technologies',
            options: [
              {
                value: 'react',
                label: 'React',
                options: [
                  { value: 'nextjs', label: 'Next.js' },
                  { value: 'typescript', label: 'TypeScript' },
                ],
              },
              {
                value: 'vue',
                label: 'Vue.js',
              },
              { value: 'angular', label: 'Angular' },
            ],
          },
          {
            value: 'backend',
            label: 'Backend Technologies',
            options: [
              { value: 'node', label: 'Node.js' },
              { value: 'python', label: 'Python' },
              { value: 'java', label: 'Java' },
            ],
          },
        ],
        size: 12,
      },
    ],
  },
  play: async ({ canvas }) => {
    await waitFor(() => expect(canvas.getByLabelText('Next.js')).toBeChecked());
    await expect(
      canvas.getByLabelText('Frontend Technologies')
    ).toHaveAttribute('aria-checked', 'mixed');
    await expect(canvas.getByLabelText('Backend Technologies')).toBeChecked();
    await expect(canvas.getByLabelText('Angular')).not.toBeChecked();
  },
};

export const CustomInputs: Story = {
  args: {
    fields: [
      {
        render: ({ error, setValue }) => (
          <>
            <Input
              error={!!error}
              id="custom-text-input"
              type="text"
              onChange={(event) => setValue(event.target.value)}
            />
            🕺
          </>
        ),
        label: 'Gimme two more swags',
        name: 'custom-text-input',
        size: 12,
        validation: {
          required: true,
          pattern: {
            value: /swag(.*)swag/,
            message: 'Still not enough swag, what are you doing... 💢',
          },
        },
        type: 'custom',
      },
      {
        render: ({ error, setValue }) => (
          <FormGroup
            htmlFor="custom-text-group-input"
            label="updog"
            width="100%"
          >
            <Input
              error={!!error}
              id="custom-text-group-input"
              type="text"
              onChange={(event) => setValue(event.target.value)}
            />
          </FormGroup>
        ),
        size: 12,
        name: 'custom-group-input',
        validation: {
          required: true,
          pattern: {
            value: /swag(.*)swag/,
            message: 'Still not enough swag, what are you doing... 💢',
          },
        },
        type: 'custom-group',
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const custom = canvas.getByRole('textbox', {
      name: /Gimme two more swags/,
    });
    const group = canvas.getByRole('textbox', { name: /updog/ });

    await userEvent.type(custom, 'swag swag');
    await userEvent.type(group, 'swagswag');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        {
          'custom-text-input': 'swag swag',
          'custom-group-input': 'swagswag',
        },
        expect.anything()
      )
    );
  },
};

export const HiddenInput: Story = {
  args: {
    fields: [
      {
        type: 'hidden',
        name: 'secret-stuff',
        defaultValue: "I'm invisible!",
      },
      {
        label: "There's more than one field here!",
        name: 'custom-hidden-input',
        type: 'email',
        size: 12,
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { 'secret-stuff': "I'm invisible!", 'custom-hidden-input': '' },
        expect.anything()
      )
    );
  },
};

export const SweetContainer: Story = {
  args: {
    fields: [
      {
        label: 'This is our sticky sweet label',
        name: 'sweet-container',
        type: 'sweet-container',
      },
      {
        label: "There's something sticky and sweet here!",
        name: 'custom-input',
        type: 'email',
        size: 12,
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    canvas.getByLabelText('This is our sticky sweet label');

    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { 'sweet-container': false, 'custom-input': '' },
        expect.anything()
      )
    );
  },
};

export const FieldIds: Story = {
  args: {
    fields: [
      {
        id: 'mycoolid',
        label: 'Text',
        name: 'text',
        size: 4,
        type: 'text',
      },
      {
        id: 'swaggy-id',
        label: 'Select',
        name: 'select',
        options: ['aaa', 'bbb'],
        size: 4,
        type: 'select',
      },
      {
        id: 'another-dank-id',
        description: 'Check me!',
        label: 'Checkbox',
        name: 'checkbox',
        size: 4,
        type: 'checkbox',
      },
      {
        id: 'id-2-the-ego',
        label: 'Textarea',
        name: 'textarea',
        size: 4,
        type: 'textarea',
      },
      {
        id: 'fire-file',
        label: 'File',
        name: 'file',
        size: 4,
        type: 'file',
      },
      {
        label: 'Plain text',
        name: 'plain-text',
        size: 4,
        type: 'text',
      },
    ],
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: /^Text\s/ })
    ).toHaveAttribute('id', 'mycoolid');
    await expect(
      canvas.getByRole('combobox', { name: /Select/ })
    ).toHaveAttribute('id', 'swaggy-id');
    await expect(
      canvas.getByRole('checkbox', { name: 'Check me!' })
    ).toHaveAttribute('id', 'another-dank-id');
    await expect(
      canvas.getByRole('textbox', { name: /Textarea/ })
    ).toHaveAttribute('id', 'id-2-the-ego');
    await expect(canvas.getByLabelText(/^File/)).toHaveAttribute(
      'id',
      'fire-file'
    );
    await expect(
      canvas.getByRole('textbox', { name: /Plain text/ })
    ).toHaveAttribute('id', 'plain-text');
  },
};

export const InfoTipAutoLabelling: Story = {
  args: {
    fields: [
      {
        label: 'Email address',
        name: 'email',
        size: 9,
        type: 'email',
        infotip: {
          info: 'We will never share your email with third parties.',
          placement: 'floating',
        },
      },
    ],
  },
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: 'Email address' });
  },
};

export const InfoTipWithReactNodeLabel: Story = {
  render: (args) => (
    <>
      <Text as="h3" id="api-section-heading" mb={8}>
        API Configuration
      </Text>
      <GridForm {...args} />
    </>
  ),
  args: {
    fields: [
      {
        label: <strong>Username (automatic label)</strong>,
        name: 'username',
        size: 9,
        type: 'text',
        infotip: {
          info: 'Choose a unique username between 3-20 characters.',
        },
      },
      {
        label: <strong>Password (ariaLabel)</strong>,
        name: 'password',
        size: 9,
        type: 'password',
        infotip: {
          info: 'Password must be at least 8 characters with one uppercase letter and one number.',
          ariaLabel: 'Password requirements',
        },
      },
      {
        label: <strong>API Key (ariaLabelledby)</strong>,
        name: 'apiKey',
        size: 9,
        type: 'text',
        infotip: {
          info: 'You can find your API key in the developer settings dashboard.',
          ariaLabelledby: 'api-section-heading',
        },
      },
    ],
  },
  play: async ({ canvas }) => {
    canvas.getByRole('button', { name: /^Username \(automatic label\)/ });
    canvas.getByRole('button', { name: 'Password requirements' });
    await expect(
      canvas.queryByRole('button', { name: /Password \(ariaLabel\)/ })
    ).toBeNull();
    canvas.getByRole('button', { name: 'API Configuration' });
  },
};

export const DefaultValues: Story = {
  args: {
    fields: [
      {
        label: 'Fish',
        name: 'fish',
        options: ['One fish', 'Two fish'],
        size: 4,
        type: 'select',
      },
      {
        defaultValue: true,
        description: 'Subscribe me',
        label: 'Newsletter',
        name: 'newsletter',
        size: 4,
        type: 'checkbox',
      },
      {
        defaultValue: 'nicki',
        label: 'Artist',
        name: 'artist',
        options: [
          { label: 'Cardi B', value: 'cardi' },
          { label: 'Nicki Minaj', value: 'nicki' },
        ],
        size: 4,
        type: 'radio-group',
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByRole('combobox', { name: /Fish/ })).toHaveValue(
      'One fish'
    );
    await expect(
      canvas.getByRole('checkbox', { name: 'Subscribe me' })
    ).toBeChecked();
    await expect(
      canvas.getByRole('radio', { name: 'Nicki Minaj' })
    ).toBeChecked();

    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { fish: 'One fish', newsletter: true, artist: 'nicki' },
        expect.anything()
      )
    );
  },
};

export const SelectObjectOptions: Story = {
  args: {
    fields: [
      {
        label: 'Country',
        name: 'country',
        options: { us: 'United States', ca: 'Canada', mx: 'Mexico' },
        size: 9,
        type: 'select',
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const select = canvas.getByRole('combobox', { name: 'Country' });
    await expect(select).toHaveValue('us');
    canvas.getByRole('option', { name: 'United States' });

    await userEvent.selectOptions(select, 'Canada');
    await expect(select).toHaveValue('ca');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { country: 'ca' },
        expect.anything()
      )
    );
  },
};

export const HiddenLabel: Story = {
  args: {
    fields: [
      {
        hideLabel: true,
        label: 'Search',
        name: 'search',
        size: 9,
        type: 'text',
      },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole('textbox', { name: 'Search' });
    const label = canvas.getByText('Search');
    await expect(label.closest('label')).not.toBeNull();
    const ancestors: HTMLElement[] = [];
    for (let el = label.parentElement; el; el = el.parentElement) {
      ancestors.push(el);
    }
    await expect(
      ancestors.some((el) => el.getBoundingClientRect().width <= 1)
    ).toBe(true);

    await userEvent.type(input, 'penguins');
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { search: 'penguins' },
        expect.anything()
      )
    );
  },
};

export const SweetContainerTripped: Story = {
  args: SweetContainer.args,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByLabelText('This is our sticky sweet label')
    );
    await userEvent.click(submitButton(canvas));
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        { 'sweet-container': true, 'custom-input': '' },
        expect.anything()
      )
    );
  },
};
