import { FillButton } from '@skillsoft/gamut';
import * as icons from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof FillButton> = {
  component: FillButton,
  args: {
    children: 'Click Me',
    disabled: false,
    size: 'normal',
  },
  argTypes: {
    href: {
      description: 'If defined, component will use an anchor tag',
      type: 'string',
    },
    size: {
      control: 'radio',
      options: ['normal', 'small', 'large'],
    },
    icon: {
      control: 'select',
      options: Object.keys(icons),
      mapping: icons,
    },
    as: {
      table: {
        disable: true,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FillButton>;

export const Default: Story = {
  args: {},
};
