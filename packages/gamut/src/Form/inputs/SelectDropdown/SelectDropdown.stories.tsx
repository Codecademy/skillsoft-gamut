import {
  CalendarIcon,
  DataTransferVerticalIcon,
  EarthIcon,
  RadarIcon,
  ResponsiveIcon,
  RocketIcon,
} from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import type { InputActionMeta } from 'react-select';
import { expect, fireEvent, fn, waitFor, within } from 'storybook/test';
import type { TypeWithDeepControls } from 'storybook-addon-deep-controls';

import { Box, FlexBox } from '../../../Box';
import { StrokeButton } from '../../../Button';
import { DataList } from '../../../DataList';
import { Text } from '../../../Typography';
import { FormGroup } from '../../elements/FormGroup';
import { SelectDropdown } from '.';
import type {
  MultiSelectDropdownProps,
  SelectDropdownProps,
  SingleSelectDropdownProps,
} from './types';

const fruitOptions = ['Apple', 'Banana', 'Cherry', 'Dragonfruit', 'Eggplant'];

const meta: TypeWithDeepControls<Meta<typeof SelectDropdown>> = {
  title: 'Inputs & forms/SelectDropdown',
  component: SelectDropdown,
  args: {
    id: 'example-select',
    name: 'example-select',
    options: fruitOptions,
    disabled: false,
    isSearchable: false,
    value: '',
    'aria-label': 'Select an option',
  },
  argTypes: {
    value: {
      control: 'select',
      options: fruitOptions,
      table: {
        type: { summary: 'string | string[]' },
      },
    },
    placeholder: { table: { disable: true } },
    formatCreateLabel: { table: { disable: true } },
    validationMessage: { table: { disable: true } },
    translations: { table: { disable: true } },
    'translations.placeholder': {
      control: 'text',
      description:
        "Placeholder text shown when no option is selected. Placeholder text is not recommended for accessibility. If you need to use placeholder text, please make sure the placeholder text doesn't add any new information to the input. I.e - if the placeholder text describes an action you'd like the user to take, please use a label instead.",
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Select an option' },
      },
    },
    'translations.validationMessage': {
      control: 'text',
      description:
        'Replaces the default "No options" text shown inside the dropdown menu whenever no option matches the current input - an empty `options` array, or every option filtered out by a search. Not tied to `isCreatable`; any searchable SelectDropdown can use it. Accepts a `ReactNode`, or a function receiving `{ inputValue }` for live, input-specific validation/error copy (e.g. "No results for \'{inputValue}\'").',
      table: {
        type: { summary: 'ReactNode | (({ inputValue }) => ReactNode)' },
        defaultValue: { summary: 'No options' },
      },
    },
    'translations.formatCreateLabel': {
      control: false,
      description: 'Customises the label shown in the "Add" row.',
      table: {
        type: { summary: '(inputValue: string) => ReactNode' },
        defaultValue: { summary: 'Add "{inputValue}"' },
      },
    },
    'translations.removeOptionLabel': {
      control: false,
      description: "aria-label for a multi-select value's remove button.",
      table: {
        type: { summary: '(label: string) => string' },
        defaultValue: { summary: 'Remove {label}' },
      },
    },
    'translations.removeAllLabel': {
      control: 'text',
      description: 'aria-label for the multi-select "remove all" button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Remove all selected' },
      },
    },
    'translations.focusedOptionAnnouncement': {
      control: false,
      description:
        "Screen-reader announcement made when an option is focused. Default describes the option's label, subtitle, right label, and disabled state.",
      table: {
        type: { summary: '(option: ExtendedOption) => string' },
        defaultValue: {
          summary: 'You are currently focused on option {label}',
        },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SelectDropdown>;
type PlayContext = Parameters<NonNullable<Story['play']>>[0];

const pickOption = async (
  { canvas, userEvent }: PlayContext,
  name: string | RegExp
) => {
  await userEvent.click(canvas.getByRole('combobox'));
  await userEvent.click(await canvas.findByRole('option', { name }));
};

const queryIcon = (root: HTMLElement, iconName: string) =>
  root.querySelector(`mask[id^="${iconName}-mask-"]`);

const queryHiddenInput = (root: HTMLElement, formField: string) =>
  root.querySelector(`input[type="hidden"][data-form-field="${formField}"]`);

const waitPastAnnouncementDebounce = () =>
  new Promise((resolve) => setTimeout(resolve, 500));

const expectAnnouncementCleared = (status: HTMLElement) =>
  waitFor(() => expect(status).toBeEmptyDOMElement(), { timeout: 200 });

const createKeepsSelections: NonNullable<Story['play']> = async (context) => {
  const { args, canvas, userEvent } = context;

  await pickOption(context, 'Apple');
  await pickOption(context, 'Banana');
  await userEvent.type(canvas.getByRole('combobox'), 'Kiwi');
  await userEvent.click(
    await canvas.findByRole('option', { name: 'Add "Kiwi"' })
  );

  await expect(args.onChange).toHaveBeenLastCalledWith(
    [
      { label: 'Apple', value: 'Apple' },
      { label: 'Banana', value: 'Banana' },
      { label: 'Kiwi', value: 'Kiwi', __isNew__: true },
    ],
    expect.objectContaining({
      action: 'create-option',
      option: expect.objectContaining({ value: 'Kiwi' }),
    })
  );

  await canvas.findByRole('button', { name: 'Remove Apple' });
  await canvas.findByRole('button', { name: 'Remove Banana' });
  await canvas.findByRole('button', { name: 'Remove Kiwi' });
};

export const Base: Story = {
  parameters: {
    a11y: {
      config: { rules: [{ id: 'aria-required-children', enabled: false }] },
    },
  },
  args: {
    name: 'base-dropdown',
    options: [],
    translations: { placeholder: 'all about that test' },
  },
  render: (args) => (
    <Box height="12rem">
      <SelectDropdown {...args} />
    </Box>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    /*
     * TODO: Re-enable aria-required-children once the empty menu is fixed. With
     * no options to show, react-select renders the "No options" message inside
     * the role="listbox" MenuList with no option children. Fix by rendering the
     * message outside the listbox (e.g. a custom MenuList that drops
     * role="listbox" when there are no options) — the message is already
     * announced via SelectDropdown's own live region.
     */
    await expect(canvas.getByRole('combobox')).toHaveAttribute(
      'id',
      'base-dropdown'
    );
    await expect(
      queryIcon(canvasElement, 'ArrowChevronDownIcon')
    ).not.toBeNull();
    await expect(queryIcon(canvasElement, 'MiniChevronDownIcon')).toBeNull();

    await canvas.findByText('all about that test');
    await userEvent.click(canvas.getByRole('combobox'));
    await within(await canvas.findByRole('listbox')).findByText('No options');
    await within(canvas.getByRole('status')).findByText('No options');
  },
};

export const ValueWithoutOptions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A `value` that matches no option falls back to the placeholder, whether `options` is empty or missing.',
      },
    },
  },
  args: {
    value: 'any',
  },
  render: (args) => (
    <FlexBox column gap={16}>
      <SelectDropdown
        {...args}
        aria-label="Empty options"
        id="empty-options"
        name="empty-options"
        options={[]}
      />
      <SelectDropdown
        {...args}
        aria-label="Missing options"
        id="missing-options"
        name="missing-options"
        options={undefined}
      />
    </FlexBox>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByText('Select an option')).toHaveLength(2);
  },
};

export const OpenAndSelect: Story = {
  args: {
    id: 'open-and-select',
    name: 'open-and-select',
    options: ['Apple', 'Banana', 'Cherry'],
    'aria-label': 'Select a fruit',
    onChange: fn(),
  },
  render: (args) => (
    <Box height="15rem">
      <SelectDropdown {...args} />
    </Box>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const combobox = canvas.getByRole('combobox');

    await userEvent.click(combobox);
    await expect(combobox).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(
      await canvas.findByRole('option', { name: 'Banana' })
    );

    await expect(combobox).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByRole('listbox')).toBeNull();
    await expect(args.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'Banana', value: 'Banana' }),
      expect.objectContaining({
        action: 'select-option',
        option: expect.objectContaining({ value: 'Banana' }),
      })
    );
    canvas.getByText('Banana');
  },
};

export const Searchable: Story = {
  parameters: {
    a11y: {
      config: { rules: [{ id: 'aria-required-children', enabled: false }] },
    },
  },
  args: {
    name: 'searchable-dropdown',
    isSearchable: true,
    options: ['wow', 'wowee', 'wooooooow'],
    translations: {
      placeholder: 'i am searchable, it is cool',
      validationMessage: ({ inputValue }) => `No results for "${inputValue}"`,
    },
    onInputChange: fn(),
  },
  render: (args) => (
    <Box height="12rem">
      <SelectDropdown {...args} />
    </Box>
  ),
  play: async ({ args, canvas, userEvent }) => {
    // TODO: Re-enable aria-required-children once the empty menu is fixed; see Base.
    const combobox = canvas.getByRole('combobox');
    const status = canvas.getByRole('status');

    await userEvent.type(combobox, 'wowe');
    await expect(args.onInputChange).toHaveBeenCalledWith(
      'wowe',
      expect.objectContaining({ action: 'input-change' })
    );
    const options = await canvas.findAllByRole('option');
    await expect(options.map((option) => option.textContent)).toEqual([
      'wowee',
    ]);
    await waitPastAnnouncementDebounce();
    await expect(status).toBeEmptyDOMElement();

    await userEvent.keyboard('{Enter}');
    await expect(combobox).toHaveAttribute('aria-expanded', 'false');
    await canvas.findByText('wowee');

    await userEvent.type(combobox, 'zzz');
    await within(await canvas.findByRole('listbox')).findByText(
      'No results for "zzz"'
    );
    await within(status).findByText('No results for "zzz"');

    await userEvent.type(combobox, '{Backspace}');
    await within(status).findByText('No results for "zz"');
    await expect(within(status).queryByText('No results for "zzz"')).toBeNull();

    await userEvent.tab();
    await expectAnnouncementCleared(status);

    await userEvent.type(combobox, 'zz');
    await within(status).findByText('No results for "zz"');
    await expect(canvas.getByRole('status')).toBe(status);
  },
};

export const NoOptionsAnnouncement: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When there are no options to show, the menu message (the default "No options" or a custom `validationMessage`) is also announced through a polite live region, and cleared as soon as the menu closes.',
      },
    },
  },
  args: {
    name: 'no-options-announcement',
    'aria-label': 'Select a fruit',
    options: [],
    translations: { validationMessage: 'No fruits available' },
    onMenuClose: fn(),
  },
  render: (args) => {
    const NoOptionsAnnouncementContent = () => {
      const [hasCustomMessage, setHasCustomMessage] = useState(true);

      return (
        <FlexBox column gap={16} height="15rem">
          <Box>
            <StrokeButton
              size="small"
              onClick={() => setHasCustomMessage(false)}
            >
              Use default message
            </StrokeButton>
          </Box>
          <SelectDropdown
            {...args}
            translations={hasCustomMessage ? args.translations : undefined}
          />
        </FlexBox>
      );
    };

    return <NoOptionsAnnouncementContent />;
  },
  play: async ({ args, canvas, userEvent }) => {
    const combobox = canvas.getByRole('combobox');
    const status = canvas.getByRole('status');

    await userEvent.click(combobox);
    await within(await canvas.findByRole('listbox')).findByText(
      'No fruits available'
    );
    await within(status).findByText('No fruits available');
    await expect(canvas.getAllByText('No fruits available')).toHaveLength(2);
    await expect(canvas.queryByText('No options')).toBeNull();

    await userEvent.keyboard('{Escape}');
    await expectAnnouncementCleared(status);
    await expect(args.onMenuClose).toHaveBeenCalledTimes(1);

    await userEvent.click(combobox);
    await within(status).findByText('No fruits available');

    await fireEvent.click(
      canvas.getByRole('button', { name: 'Use default message' })
    );
    await within(status).findByText('No options');
    await within(canvas.getByRole('listbox')).findByText('No options');
    await expect(combobox).toHaveAttribute('aria-expanded', 'true');
    await expect(canvas.queryByText('No fruits available')).toBeNull();

    await userEvent.keyboard('{Escape}');
    await expectAnnouncementCleared(status);
    await expect(args.onMenuClose).toHaveBeenCalledTimes(2);
  },
};

export const ObjectOptions: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`options` can also be an object map of `value: label` pairs instead of an array.',
      },
    },
  },
  args: {
    id: 'object-options',
    name: 'object-options',
    options: { red: 'Red', yellow: 'Yellow', green: 'Green' },
    onChange: fn(),
  },
  render: (args) => (
    <Box height="15rem">
      <SelectDropdown {...args} />
    </Box>
  ),
  play: async (context) => {
    const { args, canvas } = context;

    await pickOption(context, 'Green');
    await canvas.findByText('Green');
    await expect(args.onChange).toHaveBeenCalledWith(
      { key: 'object-options-green', label: 'Green', value: 'green' },
      expect.objectContaining({
        action: 'select-option',
        option: expect.objectContaining({ value: 'green' }),
      })
    );
  },
};

export const Disabled: Story = {
  args: {
    name: 'disabled-dropdown-standalone',
    options: ['Disabled'],
    disabled: true,
    translations: { placeholder: 'Disabled' },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('combobox')).toBeDisabled();
  },
};

export const ErrorState: Story = {
  name: 'Error',
  args: {
    name: 'error-dropdown-standalone',
    options: ['Small', 'Quite little'],
    value: 'Quite little',
    error: true,
  },
  render: (args) => (
    <Box height="10rem">
      <SelectDropdown {...args} />
    </Box>
  ),
};

export const Small: Story = {
  args: {
    options: ['i am smol', 'yes I am!', ':)', 'a', 'b', 'c'],
    name: 'size-no-search',
    size: 'small',
    translations: { placeholder: 'click here!' },
  },
  render: (args) => (
    <Box height="15rem">
      <SelectDropdown {...args} />
    </Box>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(
      queryIcon(canvasElement, 'MiniChevronDownIcon')
    ).not.toBeNull();
    await expect(queryIcon(canvasElement, 'ArrowChevronDownIcon')).toBeNull();

    await userEvent.click(canvas.getByRole('combobox'));
    await expect(await canvas.findByRole('listbox')).toHaveStyle({
      maxHeight: '192px',
    });
  },
};

export const SmallSearchable: Story = {
  args: {
    options: [
      'i am also smol',
      ':)',
      'a',
      'b',
      'g',
      'v',
      'g',
      'asdf',
      'fasdfas;',
      'sdfasdgwrewg',
      'asdfsadf',
    ],
    name: 'size-search',
    isSearchable: true,
    size: 'small',
    translations: { placeholder: 'no type here instead!' },
  },
  render: (args) => (
    <Box height="15rem">
      <SelectDropdown {...args} />
    </Box>
  ),
};

export const FormGroupSelectDropdown: Story = {
  args: {
    options: ['hello', 'hi', 'howdy'],
    value: 'oh no',
    id: 'big-label',
    name: 'big-label',
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="big-label"
        isSoloField
        label="i am big label"
        labelSize="large"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
};

export const FormGroupError: Story = {
  args: {
    options: ['Error', 'oh no', ':('],
    id: 'error-example-unique',
    name: 'error-example-unique',
    translations: { placeholder: 'cry cry cry' },
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        error="error message!! no :'("
        htmlFor="error-example-unique"
        isSoloField
        label="i am ~styled... but something is wrong"
      >
        <SelectDropdown error {...args} />
      </FormGroup>
    </Box>
  ),
};

export const DisabledOptions: Story = {
  args: {
    id: 'disabled-dropdown',
    name: 'disabled-dropdown',
    options: [
      {
        label: 'I am disabled',
        value: 'xxx',
        disabled: true,
      },
      {
        label: 'I am not',
        value: 'yyy',
      },
      {
        label: `Nor am I`,
        value: 'zzz',
        disabled: false,
      },
    ],
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="disabled-dropdown"
        isSoloField
        label="I might have disabled options"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    const disabledOption = await canvas.findByRole('option', {
      name: 'I am disabled',
    });
    await expect(disabledOption).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(disabledOption);
    await canvas.findByRole('listbox');

    await userEvent.click(canvas.getByRole('option', { name: 'I am not' }));
    await expect(canvas.queryByRole('listbox')).toBeNull();
    await canvas.findByText('I am not');
  },
};

export const Subtitles: Story = {
  args: {
    id: 'subtitles-dropdown',
    name: 'subtitles-dropdown',
    options: [
      {
        label: 'king@chess.com',
        subtitle: 'The King of Chess',
        value: 'king',
      },
      {
        label: 'queen@chess.com',
        subtitle: 'The Queen of Chess',
        value: 'queen',
      },
      {
        label: 'bishop@chess.com',
        subtitle: 'Bishop Chess',
        value: 'bishop',
        disabled: true,
      },
    ],
  },
  render: (args) => (
    <Box height="18rem">
      <FormGroup
        htmlFor="subtitles-dropdown"
        isSoloField
        label="I have subtitle options"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
};

export const RightLabels: Story = {
  args: {
    id: 'right-labels-dropdown',
    name: 'right-labels-dropdown',
    options: [
      {
        label: 'king@chess.com',
        rightLabel: 'The King of Chess',
        value: 'king',
      },
      {
        label: 'queen@chess.com',
        rightLabel: 'The Queen of Chess',
        value: 'queen',
      },
      {
        label: 'bishop@chess.com',
        rightLabel: 'Bishop Chess',
        value: 'bishop',
        disabled: true,
      },
    ],
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="right-labels-dropdown"
        isSoloField
        label="I have right label options"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
};

export const Icons: Story = {
  args: {
    id: 'pizzaz-dropdown',
    name: 'pizzaz-dropdown',
    options: [
      {
        label: 'ohai',
        value: 'ohai',
        icon: RocketIcon,
      },
      {
        label: 'surprise pacman',
        value: 'pacman',
        icon: RadarIcon,
      },
      {
        label: `who's that pokemon?`,
        value: 'what',
        icon: ResponsiveIcon,
      },
    ],
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup htmlFor="pizzaz-dropdown" isSoloField label="i have pizzazz">
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    const listbox = await canvas.findByRole('listbox');
    await expect(queryIcon(listbox, 'RocketIcon')).not.toBeNull();
    await expect(queryIcon(listbox, 'RadarIcon')).not.toBeNull();
    await expect(queryIcon(listbox, 'ResponsiveIcon')).not.toBeNull();

    await userEvent.click(canvas.getByRole('option', { name: 'ohai' }));
    await expect(canvas.queryByRole('listbox')).toBeNull();
    await expect(queryIcon(canvasElement, 'RocketIcon')).not.toBeNull();
    await expect(queryIcon(canvasElement, 'RadarIcon')).toBeNull();
  },
};

export const AbbreviatedInput: Story = {
  args: {
    id: 'abbreviated-dropdown',
    name: 'abbreviated-dropdown',
    options: [
      {
        label: 'United States of America',
        abbreviation: 'USA',
        value: 'us',
      },
      {
        label: 'United Kingdom',
        abbreviation: 'UK',
        value: 'uk',
      },
      {
        label: 'Canada',
        abbreviation: 'CA',
        value: 'ca',
      },
      {
        label: 'Australia',
        abbreviation: 'AU',
        value: 'au',
      },
      {
        label: 'Germany',
        abbreviation: 'DE',
        value: 'de',
      },
    ],
  },
  render: (args) => (
    <Box height="18rem">
      <FormGroup
        htmlFor="abbreviated-dropdown"
        isSoloField
        label="Abbreviated Input Display"
      >
        <SelectDropdown {...args} />
      </FormGroup>
      <Box color="text-secondary" mt={4}>
        Input shows &quot;USA&quot; but dropdown shows &quot;United States of
        America&quot;
      </Box>
    </Box>
  ),
};

export const AbbreviatedMultiSelect: Story = {
  args: {
    id: 'abbreviated-multi',
    name: 'abbreviated-multi',
    multiple: true,
    options: [
      {
        label: 'United States of America',
        abbreviation: 'USA',
        value: 'us',
      },
      {
        label: 'United Kingdom',
        abbreviation: 'UK',
        value: 'uk',
      },
      {
        label: 'Canada',
        abbreviation: 'CA',
        value: 'ca',
      },
    ],
    onChange: fn(),
  },
  render: (args) => (
    <Box height="18rem">
      <FormGroup
        htmlFor="abbreviated-multi"
        isSoloField
        label="Abbreviated Multi-Select"
      >
        <SelectDropdown {...args} />
      </FormGroup>
      <Box color="text-secondary" mt={4}>
        Selected tags show abbreviations; the dropdown shows full labels
      </Box>
    </Box>
  ),
  play: async (context) => {
    // TODO: Fails the a11y scan until the "Remove all" aria-hidden bug is fixed; see createKeepsSelections.
    const { args, canvas } = context;

    await pickOption(context, 'United States of America');
    await pickOption(context, 'United Kingdom');

    await canvas.findByText('USA');
    await canvas.findByText('UK');
    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(args.onChange).toHaveBeenNthCalledWith(
      1,
      [
        {
          abbreviation: 'USA',
          key: 'abbreviated-multi-us',
          label: 'United States of America',
          value: 'us',
        },
      ],
      { action: 'select-option' }
    );
    await expect(args.onChange).toHaveBeenNthCalledWith(
      2,
      [
        {
          abbreviation: 'USA',
          key: 'abbreviated-multi-us',
          label: 'United States of America',
          value: 'us',
        },
        {
          abbreviation: 'UK',
          key: 'abbreviated-multi-uk',
          label: 'United Kingdom',
          value: 'uk',
        },
      ],
      { action: 'select-option' }
    );
  },
};

export const AbbreviatedSmallSize: Story = {
  args: {
    id: 'abbreviated-small',
    name: 'abbreviated-small',
    options: [
      {
        label: 'JavaScript',
        abbreviation: 'JS',
        value: 'javascript',
      },
      {
        label: 'TypeScript',
        abbreviation: 'TS',
        value: 'typescript',
      },
      {
        label: 'Python',
        abbreviation: 'PY',
        value: 'python',
      },
      {
        label: 'Java',
        abbreviation: 'Java',
        value: 'java',
      },
    ],
    size: 'small',
    inputWidth: '80px',
    dropdownWidth: '200px',
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="abbreviated-small"
        isSoloField
        label="Small Size with Abbreviations"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
};

export const AbbreviatedWithSubtitleAndRightLabel: Story = {
  args: {
    id: 'abbreviated-detailed',
    name: 'abbreviated-detailed',
    options: [
      {
        label: 'Senior Software Engineer',
        abbreviation: 'Sr SWE',
        value: 'senior-swe',
        subtitle: '5+ years experience',
        rightLabel: 'Senior',
      },
      {
        label: 'Principal Software Engineer',
        abbreviation: 'Principal SWE',
        value: 'principal-swe',
        subtitle: '10+ years experience',
        rightLabel: 'Principal',
      },
      {
        label: 'Staff Software Engineer',
        abbreviation: 'Staff SWE',
        value: 'staff-swe',
        subtitle: '8+ years experience',
        rightLabel: 'Staff',
      },
    ],
  },
  render: (args) => (
    <Box height="22rem">
      <FormGroup
        htmlFor="abbreviated-detailed"
        isSoloField
        label="Abbreviated with Additional Details"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
};

export const ComplexAbbreviatedOptions: Story = {
  args: {
    id: 'complex-abbreviated-dropdown',
    name: 'complex-abbreviated-dropdown',
    options: [
      {
        label: 'Senior Software Engineer',
        abbreviation: 'Sr SWE',
        value: 'senior-swe',
        subtitle: '5+ years experience',
        rightLabel: 'Senior',
      },
      {
        label: 'Principal Software Engineer',
        abbreviation: 'Principal SWE',
        value: 'principal-swe',
        subtitle: '10+ years experience',
        rightLabel: 'Principal',
      },
      {
        label: 'Staff Software Engineer',
        abbreviation: 'Staff SWE',
        value: 'staff-swe',
        subtitle: '8+ years experience',
        rightLabel: 'Staff',
      },
      {
        label: 'Distinguished Engineer',
        abbreviation: 'Distinguished Eng',
        value: 'distinguished-eng',
        subtitle: '15+ years experience',
        rightLabel: 'Distinguished',
      },
    ],
    inputWidth: '80px',
    dropdownWidth: '400px',
    translations: { placeholder: 'Select seniority level' },
  },
  render: (args) => (
    <Box height="22rem">
      <FormGroup
        htmlFor="complex-abbreviated-dropdown"
        isSoloField
        label="Complex Options with Abbreviations"
      >
        <SelectDropdown {...args} />
      </FormGroup>
      <Box color="text-secondary" mt={4}>
        Shows abbreviated text in input, full details in dropdown
      </Box>
    </Box>
  ),
};

export const GroupDividers: Story = {
  args: {
    id: 'dividers-dropdown',
    name: 'dividers-dropdown',
    options: [
      {
        options: [
          {
            label: 'king@chess.com',
            subtitle: 'The King of Chess',
            value: 'king',
            disabled: true,
          },
          {
            label: 'queen@chess.com',
            rightLabel: 'The Queen of Chess',
            value: 'queen',
          },
          {
            label: 'bishop@chess.com',
            subtitle: 'Bishop Chess',
            rightLabel: 'I can move diagonally',
            value: 'bishop',
            disabled: false,
          },
        ],
      },
      {
        divider: true,
        options: [
          {
            label: 'knight@chess.com',
            subtitle: 'Sir Chess',
            rightLabel: 'By leaps and bounds',
            value: 'chess',
            disabled: true,
          },
          {
            label: 'pawn@chess.com',
            value: 'pawn',
            disabled: false,
          },
        ],
      },
    ],
    onChange: fn(),
  },
  render: (args) => (
    <Box height="24rem">
      <FormGroup
        htmlFor="dividers-dropdown"
        isSoloField
        label="I have group dividers"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
  play: async (context) => {
    const { args, canvas, userEvent } = context;

    await userEvent.click(canvas.getByRole('combobox'));
    const listbox = await canvas.findByRole('listbox');
    await within(listbox).findByText('The King of Chess');
    await within(listbox).findByText('By leaps and bounds');
    await expect(
      within(listbox).getByRole('option', { name: /^king@chess\.com/ })
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      within(listbox).getByRole('option', { name: /^knight@chess\.com/ })
    ).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(
      within(listbox).getByRole('option', { name: /^pawn@chess\.com/ })
    );
    await expect(args.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ label: 'pawn@chess.com', value: 'pawn' }),
      expect.objectContaining({
        action: 'select-option',
        option: expect.objectContaining({ value: 'pawn' }),
      })
    );
    await canvas.findByText('pawn@chess.com');

    await pickOption(context, /^bishop@chess\.com/);
    await expect(args.onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ value: 'bishop', subtitle: 'Bishop Chess' }),
      expect.objectContaining({
        action: 'select-option',
        option: expect.objectContaining({
          value: 'bishop',
          subtitle: 'Bishop Chess',
        }),
      })
    );
    await canvas.findByText('bishop@chess.com');
  },
};

export const GroupLabels: Story = {
  args: {
    id: 'group-labels-dropdown',
    multiple: true,
    name: 'group-labels-dropdown',
    options: [
      {
        label: 'Group 1',
        options: [
          {
            label: 'king@chess.com',
            subtitle: 'The King of Chess',
            value: 'king',
            disabled: true,
          },
          {
            label: 'queen@chess.com',
            rightLabel: 'The Queen of Chess',
            value: 'queen',
          },
          {
            label: 'bishop@chess.com',
            subtitle: 'Bishop Chess',
            rightLabel: 'I can move diagonally',
            value: 'bishop',
            disabled: false,
          },
        ],
      },
      {
        label: 'Group 2',
        options: [
          {
            label: 'knight@chess.com',
            subtitle: 'Sir Chess',
            rightLabel: 'By leaps and bounds',
            value: 'chess',
            disabled: true,
          },
          {
            label: 'pawn@chess.com',
            value: 'pawn',
            disabled: false,
          },
        ],
      },
    ],
    onChange: fn(),
  },
  render: (args) => (
    <Box height="24rem">
      <FormGroup
        htmlFor="group-labels-dropdown"
        isSoloField
        label="I have group labels + multiple select"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
  play: async (context) => {
    const { args, canvas, userEvent } = context;

    await userEvent.click(canvas.getByRole('combobox'));
    const listbox = await canvas.findByRole('listbox');
    await within(listbox).findByText('Group 1');
    await within(listbox).findByText('Group 2');
    [
      /^king@chess\.com/,
      /^queen@chess\.com/,
      /^bishop@chess\.com/,
      /^knight@chess\.com/,
      /^pawn@chess\.com/,
    ].forEach((name) => within(listbox).getByRole('option', { name }));
    await userEvent.keyboard('{Escape}');

    await pickOption(context, /^queen@chess\.com/);
    await pickOption(context, /^pawn@chess\.com/);

    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(args.onChange).toHaveBeenNthCalledWith(
      1,
      [
        {
          label: 'queen@chess.com',
          rightLabel: 'The Queen of Chess',
          value: 'queen',
        },
      ],
      { action: 'select-option' }
    );
    await expect(args.onChange).toHaveBeenNthCalledWith(
      2,
      [
        {
          label: 'queen@chess.com',
          rightLabel: 'The Queen of Chess',
          value: 'queen',
        },
        { label: 'pawn@chess.com', value: 'pawn', disabled: false },
      ],
      { action: 'select-option' }
    );
    await canvas.findByRole('button', { name: 'Remove queen@chess.com' });
    await canvas.findByRole('button', { name: 'Remove pawn@chess.com' });
  },
};

export const GroupedIcons: Story = {
  args: {
    id: 'grouped-icons-dropdown',
    name: 'grouped-icons-dropdown',
    'aria-label': 'Select an icon',
    options: [
      {
        label: 'Data icons',
        options: [
          {
            label: 'Data transfer',
            value: 'data-transfer',
            icon: DataTransferVerticalIcon,
          },
          { label: 'Calendar', value: 'calendar', icon: CalendarIcon },
        ],
      },
      {
        label: 'Navigation icons',
        options: [{ label: 'Earth', value: 'earth', icon: EarthIcon }],
      },
    ],
    value: 'calendar',
    onChange: fn(),
  },
  render: (args) => {
    const GroupedIconsContent = () => {
      const [value, setValue] = useState(args.value as string | undefined);
      const onChange = args.onChange as SingleSelectDropdownProps['onChange'];

      return (
        <Box height="15rem">
          <SelectDropdown
            {...args}
            multiple={false}
            value={value}
            onChange={(option, meta) => {
              setValue(option?.value);
              onChange?.(option, meta);
            }}
          />
        </Box>
      );
    };

    return <GroupedIconsContent />;
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    await canvas.findByText('Calendar');
    await expect(queryIcon(canvasElement, 'CalendarIcon')).not.toBeNull();

    await userEvent.click(canvas.getByRole('combobox'));
    const listbox = await canvas.findByRole('listbox');
    await within(listbox).findByText('Data icons');
    await within(listbox).findByText('Navigation icons');
    await expect(queryIcon(listbox, 'DataTransferVerticalIcon')).not.toBeNull();
    await expect(queryIcon(listbox, 'CalendarIcon')).not.toBeNull();
    await expect(queryIcon(listbox, 'EarthIcon')).not.toBeNull();

    await userEvent.click(
      within(listbox).getByRole('option', { name: 'Data transfer' })
    );
    await expect(args.onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        label: 'Data transfer',
        value: 'data-transfer',
        icon: DataTransferVerticalIcon,
      }),
      expect.objectContaining({
        action: 'select-option',
        option: expect.objectContaining({
          value: 'data-transfer',
          icon: DataTransferVerticalIcon,
        }),
      })
    );
    await canvas.findByText('Data transfer');
    await expect(
      queryIcon(canvasElement, 'DataTransferVerticalIcon')
    ).not.toBeNull();
  },
};

export const ShownOptionsDefault: Story = {
  args: {
    id: 'shownOptionsLimit01',
    options: [
      'i am not small',
      ':)',
      'a',
      'b',
      'g',
      'v',
      'g',
      'asdf',
      'fasdfas;',
      'hi',
      'asdfsadf',
    ],
    name: 'shownOptionsLimit01',
    translations: { placeholder: 'six is the magic number' },
  },
  render: (args) => (
    <Box height="22rem">
      <FormGroup
        htmlFor="shownOptionsLimit01"
        isSoloField
        label="i have the default shownOptionsLimit"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
};

export const ShownOptionsThree: Story = {
  args: {
    id: 'shownOptionsLimit02',
    options: [
      'i am not small',
      ':)',
      'a',
      'b',
      'g',
      'v',
      'g',
      'asdf',
      'fasdfas;',
      'hi',
      'asdfsadf',
    ],
    name: 'shownOptionsLimit02',
    translations: { placeholder: 'three is the magic number' },
    shownOptionsLimit: 3,
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="shownOptionsLimit02"
        isSoloField
        label="i have three shownOptionsLimit"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    await expect(await canvas.findByRole('listbox')).toHaveStyle({
      maxHeight: '144px',
    });
  },
};

export const IndependentWidths: Story = {
  args: {
    id: 'width-dropdown',
    name: 'width-dropdown',
    options: [
      {
        label: 'Machine Learning Engineer',
        abbreviation: 'ML Eng',
        value: 'ml-engineer',
        subtitle: 'Build AI/ML systems',
      },
      {
        label: 'Frontend Developer',
        abbreviation: 'FE Dev',
        value: 'frontend-dev',
        subtitle: 'React, Vue, Angular',
      },
      {
        label: 'Backend Developer',
        abbreviation: 'BE Dev',
        value: 'backend-dev',
        subtitle: 'Node.js, Python, Java',
      },
      {
        label: 'Full Stack Developer',
        abbreviation: 'FS Dev',
        value: 'fullstack-dev',
        subtitle: 'End-to-end development',
      },
    ],
    inputWidth: '150px',
    dropdownWidth: '350px',
    translations: { placeholder: 'Select a role' },
  },
  render: (args) => (
    <Box height="20rem">
      <FormGroup
        htmlFor="width-dropdown"
        isSoloField
        label="Independent Width Control"
      >
        <SelectDropdown {...args} />
      </FormGroup>
      <Box color="text-secondary" mt={4}>
        Input is 150px wide, dropdown is 350px wide
      </Box>
    </Box>
  ),
};

export const SmallWithAbbreviations: Story = {
  args: {
    id: 'small-abbreviated-dropdown',
    name: 'small-abbreviated-dropdown',
    options: [
      {
        label: 'JavaScript',
        abbreviation: 'JS',
        value: 'javascript',
      },
      {
        label: 'TypeScript',
        abbreviation: 'TS',
        value: 'typescript',
      },
      {
        label: 'Python',
        abbreviation: 'PY',
        value: 'python',
      },
      {
        label: 'Java',
        abbreviation: 'Java',
        value: 'java',
      },
      {
        label: 'C++',
        abbreviation: 'C++',
        value: 'cpp',
      },
    ],
    size: 'small',
    inputWidth: '80px',
    dropdownWidth: '200px',
    translations: { placeholder: 'Select JScript' },
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="small-abbreviated-dropdown"
        isSoloField
        label="Small Size with Abbreviations"
      >
        <SelectDropdown {...args} />
      </FormGroup>
      <Box color="text-secondary" mt={4}>
        Small size, input shows &quot;JS&quot; but dropdown shows
        &quot;JavaScript&quot;
      </Box>
    </Box>
  ),
};

export const MenuAlignmentRight: Story = {
  args: {
    id: 'menu-alignment-right',
    name: 'menu-alignment-right',
    options: [
      {
        label: 'Frontend Developer',
        abbreviation: 'FE Dev',
        value: 'frontend-dev',
        subtitle: 'React, Vue, Angular',
      },
      {
        label: 'Backend Developer',
        abbreviation: 'BE Dev',
        value: 'backend-dev',
        subtitle: 'Node.js, Python, Java',
      },
      {
        label: 'Full Stack Developer',
        abbreviation: 'FS Dev',
        value: 'fullstack-dev',
        subtitle: 'End-to-end development',
      },
    ],
    inputWidth: '150px',
    dropdownWidth: '300px',
    menuAlignment: 'right',
    translations: { placeholder: 'Select a role' },
  },
  render: (args) => (
    <FlexBox
      alignItems="center"
      flexDirection="column"
      height="20rem"
      width={1}
    >
      <FormGroup
        htmlFor="menu-alignment-right"
        isSoloField
        label="Menu Alignment: Right"
        width="150px"
      >
        <SelectDropdown {...args} />
      </FormGroup>
      <Box color="text-secondary" mt={4}>
        Dropdown aligns to the right edge of the input
      </Box>
    </FlexBox>
  ),
};

export const zIndexOnMenu: Story = {
  render: (args) => (
    <FlexBox column height="500px">
      <Text mb={16}>Notice how the menu renders based on using zIndex</Text>
      <FlexBox gap={16}>
        <FormGroup
          htmlFor="usesDefaultZIndex"
          isSoloField
          label="This menu is rendered behind the header"
        >
          <SelectDropdown
            id="usesDefaultZIndex"
            name="usesDefaultZIndex"
            options={args.options}
            translations={{ placeholder: 'Uses the default zIndex of 2' }}
          />
        </FormGroup>
        <FormGroup
          htmlFor="hasSetZIndex"
          isSoloField
          label="This menu floats above the table's header"
        >
          <SelectDropdown
            id="hasSetZIndex"
            name="hasSetZIndex"
            options={args.options}
            translations={{ placeholder: 'Has a zIndex of 5' }}
            zIndex={5}
          />
        </FormGroup>
      </FlexBox>
      <DataList
        columns={[
          {
            header: 'Name',
            key: 'name',
            size: 'lg',
            type: 'header',
            sortable: true,
          },
          { header: 'Rank', key: 'role', size: 'lg', sortable: true },
          { header: 'Ship', key: 'ship', size: 'lg', sortable: true },
        ]}
        disableContainerQuery
        id="crew"
        idKey="name"
        rows={[
          {
            name: 'Jean Luc Picard',
            role: 'Captain',
            ship: 'USS Enterprise',
          },
          {
            name: 'Wesley Crusher',
            role: 'Deus Ex Machina',
            ship: 'USS Enterprise',
          },
        ]}
      />
    </FlexBox>
  ),
};

const multiOptions = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Rust', value: 'rust' },
  { label: 'Go', value: 'go' },
];

export const MultipleSelect: Story = {
  parameters: {
    docs: {
      description: {
        story: `**Uncontrolled multi-select** — omit \`value\` and SelectDropdown manages selection internally. Use this when you only need the value at form submission (e.g. via a hidden \`<input>\` or \`FormData\`) and no other part of the UI needs to react to selection changes.`,
      },
    },
  },
  args: {
    id: 'multi-dropdown',
    name: 'multi-dropdown',
    multiple: true,
    options: [
      {
        label: 'Select Me',
        value: 'xxx',
      },
      {
        label: 'Multi Select',
        value: 'yyy',
      },
      {
        label: `Select All?`,
        value: 'zzz',
      },
    ],
    onChange: fn(),
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="multi-dropdown"
        isSoloField
        label="I have multiple select options"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
  play: async (context) => {
    const { args, canvas, userEvent } = context;

    await pickOption(context, 'Select Me');
    await pickOption(context, 'Multi Select');

    await expect(args.onChange).toHaveBeenCalledTimes(2);
    await expect(args.onChange).toHaveBeenNthCalledWith(
      1,
      [{ key: 'multi-dropdown-xxx', label: 'Select Me', value: 'xxx' }],
      { action: 'select-option' }
    );
    await expect(args.onChange).toHaveBeenNthCalledWith(
      2,
      [
        { key: 'multi-dropdown-xxx', label: 'Select Me', value: 'xxx' },
        { key: 'multi-dropdown-yyy', label: 'Multi Select', value: 'yyy' },
      ],
      { action: 'select-option' }
    );

    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove Select Me' })
    );
    await expect(
      canvas.queryByRole('button', { name: 'Remove Select Me' })
    ).toBeNull();
    await canvas.findByRole('button', { name: 'Remove Multi Select' });

    await userEvent.click(canvas.getByLabelText('Remove all selected'));
    await canvas.findByText('Select an option');
  },
};

export const MultipleSelectControlled: Story = {
  parameters: {
    docs: {
      description: {
        story: `**Controlled multi-select** — pass \`value: string[]\` and update it in \`onChange\`. Use this when another part of the UI needs to react to the current selection in real time (e.g. a summary panel, an enabled/disabled submit button, or a filtered list). The live "Selected:" line below shows why you'd reach for controlled state.`,
      },
      source: {
        sourceState: 'shown',
        code: `const [selected, setSelected] = useState<string[]>([]);

<Box height="20rem">
  <FormGroup
    htmlFor="multi-controlled"
    isSoloField
    label="Pick your languages"
  >
    <SelectDropdown
      id="multi-controlled"
      multiple
      name="multi-controlled"
      options={multiOptions}
      translations={{ placeholder: 'Select languages…' }}
      value={selected}
      onChange={(opts) => setSelected(opts.map((o) => o.value))}
    />
  </FormGroup>
  <Box color="text-secondary" mt={8}>
    {selected.length === 0
      ? 'No languages selected yet.'
      : \`Selected: \${selected.join(', ')}\`}
  </Box>
</Box>`,
      },
    },
  },
  render: () => {
    const MultipleSelectControlledContent = () => {
      const [selected, setSelected] = useState<string[]>([]);

      return (
        <Box height="20rem">
          <FormGroup
            htmlFor="multi-controlled"
            isSoloField
            label="Pick your languages"
          >
            <SelectDropdown
              id="multi-controlled"
              multiple
              name="multi-controlled"
              options={multiOptions}
              translations={{ placeholder: 'Select languages…' }}
              value={selected}
              onChange={(opts) => setSelected(opts.map((o) => o.value))}
            />
          </FormGroup>
          <Box color="text-secondary" mt={8}>
            {selected.length === 0
              ? 'No languages selected yet.'
              : `Selected: ${selected.join(', ')}`}
          </Box>
        </Box>
      );
    };

    return <MultipleSelectControlledContent />;
  },
  play: async (context) => {
    // TODO: Fails the a11y scan until the "Remove all" aria-hidden bug is fixed; see createKeepsSelections.
    const { canvas, userEvent } = context;

    await canvas.findByText('No languages selected yet.');

    await pickOption(context, 'JavaScript');
    await pickOption(context, 'Python');
    await canvas.findByText('Selected: javascript, python');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove JavaScript' })
    );
    await canvas.findByText('Selected: python');
  },
};

export const Creatable: Story = {
  parameters: {
    docs: {
      source: {
        sourceState: 'shown',
        code: `const [options, setOptions] = useState(['Apple', 'Banana', 'Cherry']);

<Box height="15rem">
  <FormGroup
    htmlFor="creatable-dropdown"
    isSoloField
    label="Type a new fruit and press Enter"
  >
    <SelectDropdown
      isCreatable
      name="creatable-dropdown"
      options={options}
      translations={{ placeholder: 'Select or type to add…' }}
      onCreateOption={(inputValue) =>
        setOptions((prev) => [...prev, inputValue])
      }
    />
  </FormGroup>
</Box>`,
      },
    },
  },
  args: {
    name: 'creatable-dropdown',
    isCreatable: true,
    translations: { placeholder: 'Select or type to add…' },
    onCreateOption: fn(),
    onInputChange: fn(),
  },
  render: (args) => {
    const CreatableContent = () => {
      const [options, setOptions] = useState(['Apple', 'Banana', 'Cherry']);

      return (
        <Box height="15rem">
          <FormGroup
            htmlFor="creatable-dropdown"
            isSoloField
            label="Type a new fruit and press Enter"
          >
            <SelectDropdown
              {...args}
              id="creatable-dropdown"
              options={options}
              onCreateOption={(inputValue) => {
                args.onCreateOption?.(inputValue);
                setOptions((prev) => [...prev, inputValue]);
              }}
            />
          </FormGroup>
        </Box>
      );
    };

    return <CreatableContent />;
  },
  play: async ({ args, canvas, canvasElement, userEvent }) => {
    const combobox = canvas.getByRole('combobox');

    await userEvent.type(combobox, 'pur');
    await userEvent.click(canvasElement);
    await expect(combobox).toHaveValue('');
    await expect(args.onInputChange).toHaveBeenCalledWith('', {
      action: 'input-blur',
      prevInputValue: 'pur',
    });

    await userEvent.type(combobox, 'e');
    const options = await canvas.findAllByRole('option');
    await expect(options.map((option) => option.textContent)).toEqual([
      'Apple',
      'Cherry',
      'Add "e"',
    ]);

    await userEvent.clear(combobox);
    await userEvent.type(combobox, 'Apple');
    await canvas.findByRole('option', { name: 'Apple' });
    await expect(
      canvas.queryByRole('option', { name: 'Add "Apple"' })
    ).toBeNull();

    await userEvent.clear(combobox);
    await userEvent.type(combobox, 'Kiwi');
    await userEvent.click(
      await canvas.findByRole('option', { name: 'Add "Kiwi"' })
    );
    await expect(args.onCreateOption).toHaveBeenCalledTimes(1);
    await expect(args.onCreateOption).toHaveBeenCalledWith('Kiwi');
    await expect(combobox).toHaveValue('');
    await canvas.findByText('Kiwi');

    await userEvent.click(combobox);
    await canvas.findByRole('option', { name: 'Kiwi' });
  },
};

export const CreatableOptionFirst: Story = {
  args: {
    name: 'creatable-option-first',
    isCreatable: true,
    createOptionPosition: 'first',
    options: ['Apple', 'Banana', 'Cherry'],
    translations: { placeholder: 'Select or type to add…' },
  },
  render: (args) => (
    <Box height="15rem">
      <SelectDropdown {...args} />
    </Box>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByRole('combobox'), 'e');
    const options = await canvas.findAllByRole('option');
    await expect(options.map((option) => option.textContent)).toEqual([
      'Add "e"',
      'Apple',
      'Cherry',
    ]);
  },
};

export const CreatableMultiUncontrolled: Story = {
  parameters: {
    docs: {
      description: {
        story: `**Uncontrolled creatable multi-select** — omit \`value\` and use \`onCreateOption\` to append new options. Selection is managed internally, so existing tags stay selected when a new option is created.

Use this when you only need the final value on submit and no other part of the UI reacts to selection changes — for example, a "tags" field on a content creation form where you just want to collect the submitted array.`,
      },
      source: {
        sourceState: 'shown',
        code: `const [options, setOptions] = useState(['Apple', 'Banana', 'Cherry']);

<Box height="18rem">
  <FormGroup
    htmlFor="creatable-multi-uncontrolled"
    isSoloField
    label="Pick fruits or add your own"
  >
    <SelectDropdown
      isCreatable
      multiple
      name="creatable-multi-uncontrolled"
      options={options}
      translations={{ placeholder: 'Select or type to add…' }}
      onCreateOption={(inputValue) =>
        setOptions((prev) => [...prev, inputValue])
      }
    />
  </FormGroup>
</Box>`,
      },
    },
  },
  args: { onChange: fn() },
  render: (args) => {
    const CreatableMultiUncontrolledContent = () => {
      const [options, setOptions] = useState(['Apple', 'Banana', 'Cherry']);

      return (
        <Box height="18rem">
          <FormGroup
            htmlFor="creatable-multi-uncontrolled"
            isSoloField
            label="Pick fruits or add your own"
          >
            <SelectDropdown
              isCreatable
              multiple
              name="creatable-multi-uncontrolled"
              options={options}
              translations={{ placeholder: 'Select or type to add…' }}
              onChange={args.onChange as MultiSelectDropdownProps['onChange']}
              onCreateOption={(inputValue) =>
                setOptions((prev) => [...prev, inputValue])
              }
            />
          </FormGroup>
        </Box>
      );
    };

    return <CreatableMultiUncontrolledContent />;
  },
  play: createKeepsSelections,
};

export const CreatableMulti: Story = {
  parameters: {
    docs: {
      description: {
        story: `**Controlled creatable multi-select** — pass \`value: string[]\` and update it in \`onChange\` on every change, including \`create-option\`.

Use this when you need to read or reset the selection from outside the component — for example, a skill-tagging form that pre-populates from an API response, clears on cancel, or syncs to react-hook-form.

**Pitfall:** Updating \`options\` in \`onCreateOption\` without also syncing \`value\` in \`onChange\` will clear the selection when \`options\` re-renders. Always keep both in sync. \`onChange\` receives \`meta.action === 'create-option'\` when the user picks the **Add** row; the first argument is the full selected array including the new entry.`,
      },
      source: {
        sourceState: 'shown',
        code: `const [options, setOptions] = useState(['Apple', 'Banana', 'Cherry']);
const [value, setValue] = useState<string[]>([]);

<Box height="18rem">
  <FormGroup
    htmlFor="creatable-multi-dropdown"
    isSoloField
    label="Pick fruits or add your own"
  >
    <SelectDropdown
      isCreatable
      multiple
      name="creatable-multi-dropdown"
      options={options}
      translations={{ placeholder: 'Select or type to add…' }}
      value={value}
      onChange={(selected, meta) => {
        setValue(selected.map((option) => option.value));

        if (meta.action === 'create-option' && meta.option) {
          setOptions((prev) => [...prev, meta.option.value]);
        }
      }}
    />
  </FormGroup>
</Box>`,
      },
    },
  },
  args: { onChange: fn() },
  render: (args) => {
    const CreatableMultiContent = () => {
      const [options, setOptions] = useState(['Apple', 'Banana', 'Cherry']);
      const [value, setValue] = useState<string[]>([]);
      const onChange = args.onChange as MultiSelectDropdownProps['onChange'];

      return (
        <Box height="18rem">
          <FormGroup
            htmlFor="creatable-multi-dropdown"
            isSoloField
            label="Pick fruits or add your own"
          >
            <SelectDropdown
              isCreatable
              multiple
              name="creatable-multi-dropdown"
              options={options}
              translations={{ placeholder: 'Select or type to add…' }}
              value={value}
              onChange={(selected, meta) => {
                setValue(selected.map((option) => option.value));

                if (meta.action === 'create-option' && meta.option) {
                  setOptions((prev) => [...prev, meta.option.value]);
                }

                onChange?.(selected, meta);
              }}
            />
          </FormGroup>
        </Box>
      );
    };

    return <CreatableMultiContent />;
  },
  play: createKeepsSelections,
};

export const CreatableWithValidation: Story = {
  parameters: {
    docs: {
      source: {
        sourceState: 'shown',
        code: `const [options, setOptions] = useState(['Apple', 'Banana', 'Cherry']);
const [error, setError] = useState<string | undefined>();
const lastInputRef = useRef('');

// Three distinct validation reasons, each with its own message - only one
// can apply to a given inputValue, so validationMessage always shows the
// single most relevant reason instead of stacking them.
const validate = (inputValue: string) => {
  const trimmed = inputValue.trim();
  if (trimmed.length < 3) return 'Enter at least 3 characters.';
  if (!/^[a-zA-Z\\s]+$/.test(trimmed)) return 'Only letters are allowed.';
  return undefined;
};

const handleInputChange = (
  inputValue: string,
  { action }: InputActionMeta
) => {
  if (action === 'input-change') {
    lastInputRef.current = inputValue;
    setError(validate(inputValue));
    return;
  }

  if (action === 'input-blur' && lastInputRef.current) {
    setError(validate(lastInputRef.current));
  }
};

<Box height="15rem">
  <FormGroup
    error={error}
    htmlFor="creatable-validated-dropdown"
    isSoloField
    label="Pick a fruit name that is at least 3 letters long"
  >
    <SelectDropdown
      error={Boolean(error)}
      isCreatable
      isValidNewOption={(inputValue: string) =>
        !validate(inputValue) && inputValue.trim().length > 0
      }
      name="creatable-validated-dropdown"
      options={options}
      translations={{
        placeholder: 'Type at least 3 letters to add…',
        validationMessage: ({ inputValue }) =>
          // Falls back to "No matching fruit" once the input clears both
          // validation reasons above but still doesn't match an option.
          validate(inputValue) ?? 'No matching fruit',
      }}
      onChange={() => {
        lastInputRef.current = '';
        setError(undefined);
      }}
      onCreateOption={(inputValue) => {
        setOptions((prev) => [...prev, inputValue.trim()]);
        lastInputRef.current = '';
        setError(undefined);
      }}
      onInputChange={handleInputChange}
    />
  </FormGroup>
</Box>`,
      },
    },
  },
  render: () => {
    const CreatableWithValidationContent = () => {
      const [options, setOptions] = useState(['Apple', 'Banana', 'Cherry']);
      const [error, setError] = useState<string | undefined>();
      const lastInputRef = useRef('');

      const validate = (inputValue: string) => {
        const trimmed = inputValue.trim();
        if (trimmed.length < 3) return 'Enter at least 3 characters.';
        if (!/^[a-zA-Z\s]+$/.test(trimmed)) return 'Only letters are allowed.';
        return undefined;
      };

      const handleInputChange = (
        inputValue: string,
        { action }: InputActionMeta
      ) => {
        if (action === 'input-change') {
          lastInputRef.current = inputValue;
          setError(validate(inputValue));
          return;
        }

        if (action === 'input-blur' && lastInputRef.current) {
          setError(validate(lastInputRef.current));
        }
      };

      return (
        <Box height="15rem">
          <FormGroup
            error={error}
            htmlFor="creatable-validated-dropdown"
            isSoloField
            label="Pick a fruit name that is at least 3 letters long"
          >
            <SelectDropdown
              error={Boolean(error)}
              isCreatable
              isValidNewOption={(inputValue: string) =>
                !validate(inputValue) && inputValue.trim().length > 0
              }
              name="creatable-validated-dropdown"
              options={options}
              translations={{
                placeholder: 'Type at least 3 letters to add…',
                validationMessage: ({ inputValue }) =>
                  validate(inputValue) ?? 'No matching fruit',
              }}
              onChange={() => {
                lastInputRef.current = '';
                setError(undefined);
              }}
              onCreateOption={(inputValue) => {
                setOptions((prev) => [...prev, inputValue.trim()]);
                lastInputRef.current = '';
                setError(undefined);
              }}
              onInputChange={handleInputChange}
            />
          </FormGroup>
        </Box>
      );
    };

    return <CreatableWithValidationContent />;
  },
  play: async ({ canvas, userEvent }) => {
    const combobox = canvas.getByRole('combobox');

    await userEvent.type(combobox, 'ki');
    await expect(await canvas.findByRole('alert')).toHaveTextContent(
      'Enter at least 3 characters.'
    );
    await within(await canvas.findByRole('listbox')).findByText(
      'Enter at least 3 characters.'
    );

    await userEvent.type(combobox, '1');
    await expect(canvas.getByRole('alert')).toHaveTextContent(
      'Only letters are allowed.'
    );
    await within(canvas.getByRole('listbox')).findByText(
      'Only letters are allowed.'
    );
    await expect(canvas.queryByRole('option', { name: /^Add/ })).toBeNull();

    await userEvent.clear(combobox);
    await userEvent.type(combobox, 'Kiwi');
    await expect(canvas.queryByRole('alert')).toBeNull();

    await userEvent.click(
      await canvas.findByRole('option', { name: 'Add "Kiwi"' })
    );
    await canvas.findByText('Kiwi');
  },
};

export const CustomInputProps: Story = {
  args: {
    options: ['inspect me to see my inputProps', 'yes I am!', ':)'],
    inputProps: {
      hidden: { 'data-form-field': 'what', 'data-validation': 'required' },
      combobox: {
        'data-testid': 'custom-select',
        'data-cy': 'custom-dropdown',
        'data-analytics': 'user-interaction',
        'aria-describedby': 'custom-input-props-help',
      },
    },
    id: 'custom-input-props',
    name: 'what',
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup htmlFor="what" isSoloField label="i am ~styled">
        <SelectDropdown {...args} />
      </FormGroup>
      <Text id="custom-input-props-help">
        I describe the combobox via inputProps
      </Text>
    </Box>
  ),
  play: async ({ canvas, canvasElement }) => {
    const combobox = canvas.getByRole('combobox');
    await expect(combobox).toHaveAttribute('data-testid', 'custom-select');
    await expect(combobox).toHaveAttribute('data-cy', 'custom-dropdown');
    await expect(combobox).toHaveAttribute(
      'data-analytics',
      'user-interaction'
    );
    await expect(combobox).toHaveAccessibleDescription(
      'I describe the combobox via inputProps'
    );
    await expect(combobox).not.toHaveAttribute('data-form-field');
    await expect(combobox).not.toHaveAttribute('data-validation');

    const hiddenInput = queryHiddenInput(canvasElement, 'what');
    await expect(hiddenInput).toHaveAttribute('data-validation', 'required');
    await expect(hiddenInput).not.toHaveAttribute('data-cy');
  },
};

export const CustomInputPropsDistinctIds: Story = {
  args: {
    id: 'custom-input-props-distinct',
    name: 'custom-input-props-distinct-name',
    options: ['inspect me to see my inputProps', 'yes I am!', ':)'],
    inputProps: {
      hidden: {
        'data-form-field': 'test-field',
        'data-hidden-attr': 'hidden-value',
      },
      combobox: {
        'data-testid': 'non-searchable-combobox',
        'data-custom-attr': 'custom-value',
      },
    },
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="custom-input-props-distinct-name"
        isSoloField
        label="my id and name differ"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
  play: async ({ canvas, canvasElement }) => {
    const combobox = canvas.getByRole('combobox');
    await expect(combobox).toHaveAttribute(
      'data-testid',
      'non-searchable-combobox'
    );
    await expect(combobox).toHaveAttribute('data-custom-attr', 'custom-value');
    await expect(combobox).not.toHaveAttribute('data-form-field');
    await expect(combobox).not.toHaveAttribute('data-hidden-attr');

    const hiddenInput = queryHiddenInput(canvasElement, 'test-field');
    await expect(hiddenInput).toHaveAttribute(
      'data-hidden-attr',
      'hidden-value'
    );
    await expect(hiddenInput).toHaveAttribute(
      'name',
      'custom-input-props-distinct-name'
    );
    await expect(hiddenInput).not.toHaveAttribute('data-testid');
    await expect(hiddenInput).not.toHaveAttribute('data-custom-attr');
  },
};

type ComboboxInputProps = NonNullable<
  SelectDropdownProps['inputProps']
>['combobox'];

const nonStringComboboxProps = {
  'data-boolean-true': true,
  'data-boolean-false': false,
  'data-number': 42,
  'data-zero': 0,
} as unknown as ComboboxInputProps;

const expectNonStringComboboxProps = async (combobox: HTMLElement) => {
  await expect(combobox).toHaveAttribute('data-boolean-true', 'true');
  await expect(combobox).toHaveAttribute('data-boolean-false', 'false');
  await expect(combobox).toHaveAttribute('data-number', '42');
  await expect(combobox).toHaveAttribute('data-zero', '0');
};

export const CustomInputPropsComboboxOnly: Story = {
  args: {
    id: 'custom-input-props-combobox-only',
    name: 'custom-input-props-combobox-only-name',
    options: ['inspect me to see my inputProps', 'yes I am!', ':)'],
    inputProps: {
      combobox: {
        'data-testid': 'combobox-only',
        'data-aria-label': 'Custom combobox label',
        'data-cy': 'combobox-element',
        'data-analytics': 'user-interaction',
        'data-tracking': 'form-field',
        'aria-describedby': 'combobox-only-help',
        ...nonStringComboboxProps,
      },
    },
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="custom-input-props-combobox-only-name"
        isSoloField
        label="i only have combobox inputProps"
      >
        <SelectDropdown {...args} />
      </FormGroup>
      <Text id="combobox-only-help">
        I describe the combobox via inputProps
      </Text>
    </Box>
  ),
  play: async ({ canvas, canvasElement }) => {
    const combobox = canvas.getByRole('combobox');
    await expect(combobox).toHaveAttribute('data-testid', 'combobox-only');
    await expect(combobox).toHaveAttribute(
      'data-aria-label',
      'Custom combobox label'
    );
    await expect(combobox).toHaveAttribute('data-cy', 'combobox-element');
    await expect(combobox).toHaveAttribute(
      'data-analytics',
      'user-interaction'
    );
    await expect(combobox).toHaveAttribute('data-tracking', 'form-field');
    await expect(combobox).toHaveAccessibleDescription(
      'I describe the combobox via inputProps'
    );
    await expectNonStringComboboxProps(combobox);
    await expect(
      canvasElement.querySelector('input[type="hidden"][data-testid]')
    ).toBeNull();
  },
};

export const CustomInputPropsSearchable: Story = {
  args: {
    id: 'custom-input-props-searchable',
    name: 'custom-input-props-searchable',
    isSearchable: true,
    options: ['inspect me to see my inputProps', 'yes I am!', ':)'],
    inputProps: {
      hidden: {
        'data-form-field': 'searchable-field',
        'data-hidden-attr': 'searchable-hidden-value',
      },
      combobox: {
        'data-testid': 'searchable-select',
        'data-cy': 'searchable-dropdown',
        ...nonStringComboboxProps,
      },
    },
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="custom-input-props-searchable"
        isSoloField
        label="i am searchable with inputProps"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
  play: async ({ canvas, canvasElement }) => {
    const combobox = canvas.getByRole('combobox');
    await expect(combobox).toHaveAttribute('data-testid', 'searchable-select');
    await expect(combobox).toHaveAttribute('data-cy', 'searchable-dropdown');
    await expectNonStringComboboxProps(combobox);
    await expect(combobox).not.toHaveAttribute('data-form-field');
    await expect(combobox).not.toHaveAttribute('data-hidden-attr');

    const hiddenInput = queryHiddenInput(canvasElement, 'searchable-field');
    await expect(hiddenInput).toHaveAttribute(
      'data-hidden-attr',
      'searchable-hidden-value'
    );
    await expect(hiddenInput).not.toHaveAttribute('data-testid');
    await expect(hiddenInput).not.toHaveAttribute('data-cy');
  },
};

export const CustomInputPropsHiddenOnly: Story = {
  args: {
    id: 'custom-input-props-hidden-only',
    name: 'custom-input-props-hidden-only',
    isSearchable: true,
    options: ['inspect me to see my inputProps', 'yes I am!', ':)'],
    inputProps: {
      hidden: {
        'data-form-field': 'hidden-only',
        'data-validation': 'required',
      },
    },
  },
  render: (args) => (
    <Box height="15rem">
      <FormGroup
        htmlFor="custom-input-props-hidden-only"
        isSoloField
        label="i only have hidden inputProps"
      >
        <SelectDropdown {...args} />
      </FormGroup>
    </Box>
  ),
  play: async ({ canvas, canvasElement }) => {
    const combobox = canvas.getByRole('combobox');
    await expect(combobox).not.toHaveAttribute('data-form-field');
    await expect(combobox).not.toHaveAttribute('data-validation');

    const hiddenInput = queryHiddenInput(canvasElement, 'hidden-only');
    await expect(hiddenInput).toHaveAttribute('data-validation', 'required');
  },
};

export const Translations: Story = {
  args: {
    name: 'translations-dropdown',
    multiple: true,
    isCreatable: true,
    options: ['Manzana', 'Plátano', 'Cereza'],
    translations: {
      placeholder: 'Elige una opción',
      validationMessage: 'Sin opciones',
      formatCreateLabel: (inputValue) => `Añadir "${inputValue}"`,
      removeOptionLabel: (label) => `Quitar ${label}`,
      removeAllLabel: 'Quitar todo',
    },
  },
  render: (args) => (
    <Box height="18rem">
      <SelectDropdown {...args} />
    </Box>
  ),
  play: async (context) => {
    // TODO: Fails the a11y scan until the "Remove all" aria-hidden bug is fixed; see createKeepsSelections.
    const { canvas, userEvent } = context;

    await canvas.findByText('Elige una opción');

    await pickOption(context, 'Manzana');
    await canvas.findByRole('button', { name: 'Quitar Manzana' });
    await canvas.findByLabelText('Quitar todo');

    await pickOption(context, 'Plátano');
    await pickOption(context, 'Cereza');
    await userEvent.click(canvas.getByRole('combobox'));
    await within(await canvas.findByRole('listbox')).findByText('Sin opciones');

    await userEvent.type(canvas.getByRole('combobox'), 'Kiwi');
    await canvas.findByRole('option', { name: 'Añadir "Kiwi"' });
  },
};

export const DeprecatedPropsPrecedence: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The deprecated top-level `placeholder` and `formatCreateLabel` props still work, and take precedence over their `translations` equivalents.',
      },
    },
  },
  args: {
    name: 'deprecated-props-dropdown',
    isCreatable: true,
    options: ['Apple', 'Banana', 'Cherry'],
    placeholder: 'Explicit placeholder',
    formatCreateLabel: (inputValue) => `Create tag: "${inputValue}"`,
    translations: {
      placeholder: 'Translated placeholder',
      formatCreateLabel: (inputValue) => `Translated "${inputValue}"`,
    },
  },
  render: (args) => (
    <Box height="15rem">
      <SelectDropdown {...args} />
    </Box>
  ),
  play: async ({ canvas, userEvent }) => {
    await canvas.findByText('Explicit placeholder');
    await expect(canvas.queryByText('Translated placeholder')).toBeNull();

    await userEvent.type(canvas.getByRole('combobox'), 'Kiwi');
    await canvas.findByRole('option', { name: 'Create tag: "Kiwi"' });
    await expect(
      canvas.queryByRole('option', { name: 'Translated "Kiwi"' })
    ).toBeNull();
  },
};

export const DeprecatedValidationMessagePrecedence: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The deprecated top-level `validationMessage` prop still works as a string or a function, and takes precedence over `translations.validationMessage`.',
      },
    },
  },
  render: () => (
    <FlexBox column gap={16} height="18rem">
      <SelectDropdown
        aria-label="String validation message"
        id="deprecated-validation-message-string"
        name="deprecated-validation-message-string"
        options={[]}
        translations={{ validationMessage: 'Translated no options' }}
        validationMessage="Explicit no options"
      />
      <SelectDropdown
        aria-label="Function validation message"
        id="deprecated-validation-message-function"
        isSearchable
        name="deprecated-validation-message-function"
        options={['Apple', 'Banana', 'Cherry']}
        translations={{
          validationMessage: ({ inputValue }) =>
            `Translated no match for "${inputValue}"`,
        }}
        validationMessage={({ inputValue }) =>
          `Explicit no match for "${inputValue}"`
        }
      />
    </FlexBox>
  ),
  play: async ({ canvas, userEvent }) => {
    const stringCombobox = canvas.getByRole('combobox', {
      name: 'String validation message',
    });
    await userEvent.click(stringCombobox);
    await within(await canvas.findByRole('listbox')).findByText(
      'Explicit no options'
    );
    await expect(canvas.queryByText('Translated no options')).toBeNull();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).toBeNull();

    const functionCombobox = canvas.getByRole('combobox', {
      name: 'Function validation message',
    });
    await userEvent.type(functionCombobox, 'zzz');
    await within(await canvas.findByRole('listbox')).findByText(
      'Explicit no match for "zzz"'
    );
    await expect(
      canvas.queryByText('Translated no match for "zzz"')
    ).toBeNull();
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByRole('listbox')).toBeNull();
  },
};

export const Default: Story = {
  args: {},
  render: (args) => (
    <Box height="18rem">
      <SelectDropdown {...args} />
    </Box>
  ),
};
