import {
  AiChatSparkIcon,
  BashShellIcon,
  FileIcon,
  InformationalIcon,
  MultipleUsersIcon,
  PeopleIcon,
  RatingStarCircleIcon,
} from '@skillsoft/gamut-icons';
import { Background } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { expect, screen } from 'storybook/test';

import { FlexBox } from '../Box';
import { PopoverContainer } from '../PopoverContainer';
import { Text } from '../Typography';
import { Menu } from './Menu';
import { MenuItem } from './MenuItem';
import { MenuSeparator } from './MenuSeparator';

const meta: Meta<typeof Menu> = {
  title: 'Actions/Menu/Menu',
  component: Menu,
  subcomponents: {
    MenuItem,
    MenuSeparator,
  },
  args: {
    spacing: 'normal',
  },
  argTypes: {
    spacing: {
      control: 'radio',
      options: ['normal', 'condensed'],
    },
    variant: {
      control: 'radio',
      options: ['popover', 'fixed'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Menu>;

export const Default: Story = {
  args: {
    children: (
      <>
        <MenuItem>Menu item</MenuItem>
        <MenuItem active>Active item</MenuItem>
        <MenuItem icon={MultipleUsersIcon}>Icon item</MenuItem>
        <MenuItem>Menu item</MenuItem>
      </>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('menu')).toBeNull();
    await expect(canvas.queryByRole('menuitem')).toBeNull();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(4);
  },
};

export const Popover: Story = {
  args: {
    variant: 'popover',
  },
  render: (args) => (
    <FlexBox column width="fit-content">
      <Menu {...args}>
        <MenuItem label="testing" onClick={() => null}>
          Menu item with Tooltip
        </MenuItem>
        <MenuItem active onClick={() => null}>
          Active item
        </MenuItem>
        <MenuItem
          icon={MultipleUsersIcon}
          label={{
            info: 'More info here...',
            alignment: 'right-center',
          }}
          onClick={() => null}
        >
          Icon item with ToolTip
        </MenuItem>
        <MenuItem disabled href="/">
          Disabled link no ToolTip
        </MenuItem>
        <MenuItem
          disabled
          label={{
            info: 'This is disabled because...',
            alignment: 'right-center',
          }}
          onClick={() => null}
        >
          Disabled button with ToolTip
        </MenuItem>
      </Menu>
    </FlexBox>
  ),
};

export const Fixed: Story = {
  args: {
    variant: 'fixed',
  },
  render: (args) => (
    <FlexBox column width="fit-content">
      <nav>
        <Menu {...args}>
          <MenuItem label="testing" onClick={() => null}>
            Menu item with Tooltip
          </MenuItem>
          <MenuItem active onClick={() => null}>
            Active item
          </MenuItem>
          <MenuItem
            icon={MultipleUsersIcon}
            label={{
              info: 'More info here...',
              alignment: 'right-center',
            }}
            onClick={() => null}
          >
            Icon item with ToolTip
          </MenuItem>
          <MenuItem disabled onClick={() => null}>
            Disabled item no ToolTip
          </MenuItem>
          <MenuItem
            disabled
            label={{
              info: 'This is disabled because...',
              alignment: 'right-center',
            }}
            onClick={() => null}
          >
            Disabled item with ToolTip
          </MenuItem>
        </Menu>
      </nav>
    </FlexBox>
  ),
};

export const MenuRole: Story = {
  args: {
    role: 'menu',
    children: (
      <>
        <MenuItem onClick={() => null}>Click action</MenuItem>
        <MenuItem active>Active click action</MenuItem>
        <MenuItem icon={MultipleUsersIcon} onClick={() => null}>
          Icon click action
        </MenuItem>
        <MenuItem onClick={() => null}>Menu click action</MenuItem>
      </>
    ),
  },
  play: async ({ canvas }) => {
    canvas.getByRole('menu');
    await expect(canvas.getAllByRole('menuitem')).toHaveLength(4);
    await expect(canvas.getAllByRole('none')).toHaveLength(3);
    await expect(
      canvas.getByRole('menuitem', { name: /Click action/ }).tagName
    ).toBe('BUTTON');
  },
};

export const NavMenu: Story = {
  args: {
    variant: 'fixed',
  },
  render: (args) => (
    <nav>
      <Menu {...args}>
        <MenuItem href="#link">Link item</MenuItem>
        <MenuItem active href="#link">
          Active link item
        </MenuItem>
        <MenuItem href="#link" icon={MultipleUsersIcon}>
          Icon link item
        </MenuItem>
        <MenuItem href="#link">Link item</MenuItem>
      </Menu>
    </nav>
  ),
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('link')).toHaveLength(4);
    await expect(canvas.queryByRole('menuitem')).toBeNull();
  },
};

export const NoRoleMenu: Story = {
  args: {
    variant: 'popover',
    children: (
      <>
        <MenuItem>Menu item</MenuItem>
        <MenuItem active>Active item</MenuItem>
        <MenuItem icon={MultipleUsersIcon}>Icon item</MenuItem>
        <MenuItem>Menu item</MenuItem>
      </>
    ),
  },
};

export const PopoverCondensed: Story = {
  args: {
    variant: 'popover',
    children: (
      <>
        <MenuItem>Menu item</MenuItem>
        <MenuItem active>Active item</MenuItem>
        <MenuItem icon={MultipleUsersIcon}>Icon item</MenuItem>
        <MenuItem>Menu item</MenuItem>
      </>
    ),
    spacing: 'condensed',
  },
};

export const FixedCondensed: Story = {
  args: {
    variant: 'fixed',
    children: (
      <>
        <MenuItem>Menu item</MenuItem>
        <MenuItem active>Active item</MenuItem>
        <MenuItem icon={MultipleUsersIcon}>Icon item</MenuItem>
        <MenuItem>Menu item</MenuItem>
      </>
    ),
    spacing: 'condensed',
  },
};

export const PopoverMenuSeparator: Story = {
  args: {
    variant: 'popover',
    children: (
      <>
        <MenuItem>Menu item</MenuItem>
        <MenuItem active>Active item</MenuItem>
        <MenuSeparator />
        <MenuItem icon={MultipleUsersIcon}>Icon item</MenuItem>
        <MenuItem>Menu item</MenuItem>
      </>
    ),
  },
  play: ({ canvas }) => {
    canvas.getByRole('separator');
  },
};

export const FixedMenuSeparator: Story = {
  args: {
    variant: 'fixed',
    children: (
      <>
        <MenuItem>Menu item</MenuItem>
        <MenuItem active>Active item</MenuItem>
        <MenuSeparator my={4} />
        <MenuItem icon={MultipleUsersIcon}>Icon item</MenuItem>
        <MenuItem>Menu item</MenuItem>
      </>
    ),
  },
  play: ({ canvas }) => {
    canvas.getByRole('separator');
  },
};

export const IconOnly: Story = {
  args: {
    border: 1,
    borderRadius: 'md',
    width: '88px',
    variant: 'fixed',
    children: (
      <>
        <MenuItem icon={AiChatSparkIcon} label="Chat" onClick={() => {}} />
        <MenuItem
          icon={BashShellIcon}
          label={{ alignment: 'right-center', info: 'Prompt' }}
          onClick={() => {}}
        />
        <MenuItem
          closeOnClick={false}
          icon={PeopleIcon}
          label={{
            alignment: 'right-center',
            info: "People (won't close tooltip on click)",
          }}
          onClick={() => {}}
        />
        <MenuItem
          active
          href="#whatsup-1"
          icon={FileIcon}
          label={{ alignment: 'right-center', info: 'Learn' }}
        />
        <MenuItem
          aria-label="I am bold and different"
          href="#whats-2"
          icon={RatingStarCircleIcon}
          label={{
            alignment: 'right-center',
            info: <Text color="hyper">I am bold and different</Text>,
            narrow: true,
          }}
        />
        <MenuItem
          href="#who-is-3"
          icon={InformationalIcon}
          label={{ alignment: 'right-center', info: 'Content' }}
        />
      </>
    ),
  },
  play: async ({ canvas, userEvent }) => {
    const chat = canvas.getByRole('button', { name: 'Chat' });
    await userEvent.hover(chat);
    await screen.findByText('Chat');

    canvas.getByRole('link', { name: 'I am bold and different' });
  },
};

export const FloatingMenu: Story = {
  render: function FloatingMenuExample() {
    const target = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [currentTarget, setCurrentTarget] = useState(0);
    const [alignment, setAlignment] = useState<'top-right' | 'bottom-right'>(
      'top-right'
    );
    const [activeIndex, setActiveIndex] = useState(4);

    const clickHandler = (targetNumber: number, currentIndex: number) => {
      setCurrentTarget(targetNumber);
      setAlignment(currentIndex === 3 ? 'bottom-right' : 'top-right');

      if (isOpen && currentIndex === activeIndex) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }

      if (currentIndex !== activeIndex) setActiveIndex(currentIndex);
    };

    return (
      <FlexBox m={48} minHeight="30px" position="relative">
        <FlexBox flex={1}>
          <Background bg="black" borderRadius="lg" height="100%" pl={48}>
            <FlexBox
              alignItems="center"
              bg="navy"
              dimensions="200px"
              height="100%"
              justifyContent="right"
              ref={target}
            >
              <Menu role="menu" variant="fixed">
                <MenuItem
                  active={activeIndex === 0}
                  onClick={() => clickHandler(-68, 0)}
                >
                  I have a side menu
                </MenuItem>
                <MenuItem
                  active={activeIndex === 1}
                  onClick={() => clickHandler(-115, 1)}
                >
                  Active item
                </MenuItem>
                <MenuItem
                  active={activeIndex === 2}
                  icon={MultipleUsersIcon}
                  onClick={() => clickHandler(-164, 2)}
                >
                  Icon item
                </MenuItem>
                <MenuItem active={activeIndex === 3} onClick={() => null}>
                  A complex action
                </MenuItem>
              </Menu>
            </FlexBox>
            <PopoverContainer
              alignment={alignment}
              inline
              isOpen={isOpen}
              targetRef={target}
              x={-21}
              y={currentTarget}
            >
              <Background bg="white" borderRadius="lg">
                <Menu role="menu" variant="popover">
                  {activeIndex % 2 === 0 ? (
                    <>
                      <MenuItem>I am a side menu!</MenuItem>
                      <MenuItem href="cool">Cool link</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem>I am a DIFFERENT menu!</MenuItem>
                      <MenuItem href="cool-too">Another cool link</MenuItem>
                      <MenuItem>An action</MenuItem>
                    </>
                  )}
                </Menu>
              </Background>
            </PopoverContainer>
          </Background>
        </FlexBox>
      </FlexBox>
    );
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('menuitem', { name: 'I have a side menu' })
    );
    canvas.getByRole('menuitem', { name: 'I am a side menu!' });

    await userEvent.click(
      canvas.getByRole('menuitem', { name: /Active item/ })
    );
    canvas.getByRole('menuitem', { name: 'I am a DIFFERENT menu!' });
  },
};

export const NestedMenuNoRole: Story = {
  /*
   * TODO: Re-enable once a nested Menu renders inside an <li>. It currently
   * renders its <ul> directly inside the parent <ul>.
   */
  parameters: {
    a11y: {
      config: { rules: [{ id: 'list', enabled: false }] },
    },
  },
  render: (args) => (
    <Menu
      {...args}
      aria-label="Account"
      border={1}
      borderRadius="md"
      width="200px"
    >
      <MenuItem href="#profile">Profile</MenuItem>
      <MenuItem href="#settings">Settings</MenuItem>
      <Menu>
        <MenuItem href="#help">Help center</MenuItem>
        <MenuSeparator />
        <MenuItem onClick={() => null}>Sign out</MenuItem>
      </Menu>
    </Menu>
  ),
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('list', { name: 'Account' })
    ).not.toHaveAttribute('role');
    await expect(canvas.queryByRole('menu')).toBeNull();
    await expect(canvas.queryByRole('group')).toBeNull();
    canvas.getByRole('separator');
  },
};

export const NestedMenuGroup: Story = {
  /*
   * TODO: Re-enable these rules once nested menus render valid markup. A nested
   * Menu renders its <ul> directly inside the parent <ul> instead of inside an
   * <li>, and items inside a role="group" get no menuitem role because
   * MenuItem only checks for role === 'menu'.
   */
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'list', enabled: false },
          { id: 'listitem', enabled: false },
          { id: 'aria-required-children', enabled: false },
        ],
      },
    },
  },
  render: (args) => (
    <Menu
      {...args}
      aria-label="Course actions"
      border={1}
      borderRadius="md"
      role="menu"
      width="200px"
    >
      <MenuItem href="#course">View course</MenuItem>
      <Menu aria-label="Manage course">
        <MenuItem onClick={() => null}>Duplicate</MenuItem>
        <MenuItem onClick={() => null}>Archive</MenuItem>
      </Menu>
    </Menu>
  ),
  play: async ({ canvas }) => {
    canvas.getByRole('menu', { name: 'Course actions' });
    await expect(canvas.getAllByRole('menu')).toHaveLength(1);
    canvas.getByRole('group', { name: 'Manage course' });

    const outerLink = canvas.getByRole('menuitem', { name: 'View course' });
    await expect(outerLink.tagName).toBe('A');
    await expect(outerLink.closest('li')).toHaveAttribute('role', 'none');
  },
};
