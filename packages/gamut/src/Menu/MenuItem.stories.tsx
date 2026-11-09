import * as icons from '@skillsoft/gamut-icons';
import { MultipleUsersIcon, PeopleIcon } from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, screen } from 'storybook/test';

import { FlexBox } from '../Box';
import { Menu } from './Menu';
import { MenuItem } from './MenuItem';

const meta: Meta<typeof MenuItem> = {
  title: 'Actions/Menu/MenuItem',
  component: MenuItem,
  args: {
    children: 'Menu item',
    onClick: fn(),
  },
  argTypes: {
    icon: {
      control: 'select',
      options: Object.keys(icons),
      mapping: icons,
      table: {
        type: { summary: 'React.ComponentType<GamutIconProps>' },
        defaultValue: { summary: 'undefined' },
      },
    },
  },
  render: (args) => (
    <Menu>
      <MenuItem {...args} />
    </Menu>
  ),
};

export default meta;
type Story = StoryObj<typeof MenuItem>;

const onDisabledClick = fn();

export const Default: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Menu item' }));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const ItemTypes: Story = {
  render: (_args) => (
    <Menu>
      <MenuItem>Plain item</MenuItem>
      <MenuItem href="#link">Link item</MenuItem>
      <MenuItem onClick={() => null}>Button item</MenuItem>
    </Menu>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getByText('Plain item').tagName).toBe('LI');
    await expect(
      canvas.getByRole('link', { name: 'Link item' }).closest('li')
    ).not.toBeNull();
    await expect(
      canvas.getByRole('button', { name: 'Button item' }).closest('li')
    ).not.toBeNull();
    await expect(canvas.queryByRole('menuitem')).toBeNull();
  },
};

export const Active: Story = {
  render: () => (
    <Menu>
      <MenuItem active>Active item</MenuItem>
      <MenuItem active href="#link">
        Active link
      </MenuItem>
      <MenuItem active onClick={() => null}>
        Active button
      </MenuItem>
    </Menu>
  ),
  play: ({ canvas }) => {
    canvas.getByText('current item,');
    canvas.getByText('current page,');
    canvas.getByText('current action,');
  },
};

export const WithIcon: Story = {
  render: () => (
    <Menu>
      <MenuItem>No icon</MenuItem>
      <MenuItem icon={MultipleUsersIcon}>With icon</MenuItem>
    </Menu>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByTestId('menuitem-icon')).toHaveLength(1);
    await expect(
      canvas
        .getByText('With icon')
        .querySelector('[data-testid="menuitem-icon"]')
    ).not.toBeNull();
  },
};

export const ToolTipLabels: Story = {
  render: () => (
    <FlexBox column width="fit-content">
      <Menu>
        <MenuItem label="String label" onClick={() => null}>
          Button with string label
        </MenuItem>
        <MenuItem
          href="#link"
          label={{ info: 'Object label', alignment: 'right-center' }}
        >
          Link with object label
        </MenuItem>
        <MenuItem
          icon={MultipleUsersIcon}
          label="Icon-only button"
          onClick={() => null}
        />
        <MenuItem icon={PeopleIcon} label="Icon-only item" />
      </Menu>
    </FlexBox>
  ),
  play: async ({ canvas, userEvent }) => {
    const stringLabelButton = canvas.getByRole('button', {
      name: 'Button with string label',
    });
    await expect(stringLabelButton).toHaveAttribute('aria-describedby');
    await expect(stringLabelButton).not.toHaveAttribute('aria-label');
    await userEvent.hover(stringLabelButton);
    await screen.findByText('String label');
    await userEvent.unhover(stringLabelButton);

    const objectLabelLink = canvas.getByRole('link', {
      name: 'Link with object label',
    });
    await expect(objectLabelLink).toHaveAttribute('aria-describedby');
    await expect(objectLabelLink).not.toHaveAttribute('aria-label');
    await userEvent.hover(objectLabelLink);
    await screen.findByText('Object label');
    await userEvent.unhover(objectLabelLink);

    const iconOnlyButton = canvas.getByLabelText('Icon-only button');
    await userEvent.hover(iconOnlyButton);
    await screen.findByText('Icon-only button');
    await userEvent.unhover(iconOnlyButton);

    await expect(canvas.getByLabelText('Icon-only item').tagName).toBe('LI');
    await expect(screen.queryByText('Icon-only item')).toBeNull();
  },
};

export const DisabledItems: Story = {
  render: () => (
    <FlexBox column width="fit-content">
      <Menu>
        <MenuItem disabled href="#link">
          Disabled link
        </MenuItem>
        <MenuItem
          disabled
          href="#link"
          label={{ info: 'Disabled link tooltip', placement: 'floating' }}
        >
          Disabled link with label
        </MenuItem>
        <MenuItem
          disabled
          label="Disabled button tooltip"
          onClick={onDisabledClick}
        >
          Disabled button with label
        </MenuItem>
      </Menu>
    </FlexBox>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(
      canvas.getByRole('button', { name: 'Disabled link' })
    ).toHaveAttribute('aria-disabled', 'true');

    const disabledLink = canvas.getByRole('button', {
      name: 'Disabled link with label',
    });
    await expect(disabledLink).toHaveAttribute('aria-disabled', 'true');
    await expect(disabledLink).toHaveAttribute('aria-describedby');
    await userEvent.hover(disabledLink);
    await screen.findByText('Disabled link tooltip');
    await userEvent.unhover(disabledLink);

    const disabledButton = canvas.getByRole('button', {
      name: 'Disabled button with label',
    });
    await expect(disabledButton).toHaveAttribute('aria-disabled', 'true');
    await expect(disabledButton).toHaveAttribute('aria-describedby');
    await userEvent.hover(disabledButton);
    await screen.findByText('Disabled button tooltip');

    await userEvent.click(disabledButton);
    await expect(onDisabledClick).not.toHaveBeenCalled();
  },
};
