import { Background } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useState } from 'react';
import { expect, fn } from 'storybook/test';

import { Badge } from '../Badge';
import { FillButton } from '../Button';
import { FormGroup, Input } from '../Form';
import { Text } from '../Typography';
import { Tab, TabList, TabNav, TabNavLink, TabPanel, TabPanels, Tabs } from '.';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  subcomponents: {
    TabList,
    Tab,
    TabPanel,
    TabPanels,
    TabNav,
    TabNavLink,
  },
  args: {
    variant: 'standard',
    disabledKeys: [],
    selectedKey: undefined,
    onSelectionChange: fn(),
    isDisabled: false,
  },
  argTypes: {
    defaultSelectedKey: {
      description: 'The initial selected key in the collection (uncontrolled).',
    },
    disabledKeys: {
      description:
        'The item keys that are disabled. These items cannot be selected, focused, or otherwise interacted with.',
    },
    selectedKey: {
      description: 'The currently selected key in the collection (controlled).',
      type: 'string',
    },
    onSelectionChange: {
      description: 'Handler that is called when the selection changes.',
    },
    isDisabled: {
      description:
        'Whether the TabList is disabled. Shows that a selection exists, but is not available in that circumstance.',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

const panelText = (n: number) =>
  `Hi there! I'm the contents inside Tab ${n}. Yippee!`;

const ThreeTabs: Story['render'] = (args) => (
  <Tabs {...args}>
    <TabList>
      <Tab id="1">Tab 1</Tab>
      <Tab id="2">Tab 2</Tab>
      <Tab id="3">Tab 3</Tab>
    </TabList>
    <TabPanels my={24}>
      <TabPanel id="1">
        <Text as="h2">Welcome to Tab 1</Text>
        <Text>{panelText(1)}</Text>
      </TabPanel>
      <TabPanel id="2">
        <Text as="h2">Welcome to Tab 2</Text>
        <Text>{panelText(2)}</Text>
      </TabPanel>
      <TabPanel id="3">
        <Text as="h2">Welcome to Tab 3</Text>
        <Text>{panelText(3)}</Text>
      </TabPanel>
    </TabPanels>
  </Tabs>
);

export const Default: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabList>
        <Tab id="1">Tab 1</Tab>
        <Tab id="2">Tab 2</Tab>
        <Tab id="3">Tab 3</Tab>
      </TabList>
      <TabPanels>
        <TabPanel id="1">
          <Text as="h2">Welcome to Tab 1</Text>
          <Text>{panelText(1)}</Text>
        </TabPanel>
        <TabPanel id="2" shouldForceMount>
          <Text as="h2">Welcome to Tab 2</Text>
          <Text>{panelText(2)}</Text>
        </TabPanel>
        <TabPanel id="3">
          <Text as="h2">Welcome to Tab 3</Text>
          <Text>{panelText(3)}</Text>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const tab1 = canvas.getByRole('tab', { name: 'Tab 1' });
    await expect(tab1).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByText(panelText(1))).toBeVisible();
    await expect(canvas.getByText(panelText(2))).not.toBeVisible();
    await expect(canvas.queryByText(panelText(3))).toBeNull();

    await userEvent.click(canvas.getByRole('tab', { name: 'Tab 2' }));
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith('2');
    await expect(canvas.getByText(panelText(2))).toBeVisible();
    await expect(canvas.queryByText(panelText(1))).toBeNull();

    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith('3');
    await expect(canvas.getByText(panelText(3))).toBeVisible();
  },
};

export const DefaultSelectedKey: Story = {
  args: {
    defaultSelectedKey: '2',
  },
  render: ThreeTabs,
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('tab', { name: 'Tab 2' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(canvas.getByText(panelText(2))).toBeVisible();
    await expect(canvas.queryByText(panelText(1))).toBeNull();
  },
};

export const Controlled: Story = {
  render: function ControlledTabs(args) {
    const [activeTab, setActiveTab] = useState(1);

    const maxTab = 3;
    const setTab = useCallback(
      (value: string | number) => {
        const val = Number(value);
        if (val > maxTab) return setActiveTab(1);
        if (val < 1) return setActiveTab(maxTab);
        setActiveTab(val);
      },
      [setActiveTab]
    );

    return (
      <>
        <Background bg="yellow" mb={24} p={12}>
          <FormGroup htmlFor="active-tab" label="Active Tab">
            <Input
              htmlFor="active-tab"
              min={1}
              type="number"
              value={activeTab}
              onChange={(e) => setTab(e.target.value)}
            />
          </FormGroup>
        </Background>
        <Tabs
          selectedKey={String(activeTab)}
          onSelectionChange={(key) => {
            args.onSelectionChange?.(key);
            setTab(key);
          }}
        >
          <TabList mx={24}>
            <Tab id="1">Tab 1</Tab>
            <Tab id="2">Tab 2</Tab>
            <Tab id="3">Tab 3</Tab>
          </TabList>
          <TabPanels my={24}>
            <TabPanel id="1">
              <Text as="h2">Welcome to Tab 1</Text>
              <Text>{panelText(1)}</Text>
            </TabPanel>
            <TabPanel id="2">
              <Text as="h2">Welcome to Tab 2</Text>
              <Text>{panelText(2)}</Text>
            </TabPanel>
            <TabPanel id="3">
              <Text as="h2">Welcome to Tab 3</Text>
              <Text>{panelText(3)}</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </>
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    const input = canvas.getByRole('spinbutton', { name: /Active Tab/ });
    await expect(canvas.getByRole('tab', { name: 'Tab 1' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(canvas.getByText(panelText(1))).toBeVisible();
    await expect(canvas.queryByText(panelText(2))).toBeNull();

    await userEvent.click(canvas.getByRole('tab', { name: 'Tab 2' }));
    await expect(args.onSelectionChange).toHaveBeenLastCalledWith('2');
    await expect(canvas.getByText(panelText(2))).toBeVisible();
    await expect(canvas.queryByText(panelText(1))).toBeNull();
    await expect(input).toHaveValue(2);

    await userEvent.clear(input);
    await expect(input).toHaveValue(3);
    await expect(canvas.getByRole('tab', { name: 'Tab 3' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(canvas.getByText(panelText(3))).toBeVisible();
  },
};

export const WithBadge: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabList>
        <Tab id="1">
          Tab 1 <Badge ml={8}>New!</Badge>
        </Tab>
        <Tab id="2">Tab 2</Tab>
        <Tab id="3">Tab 3</Tab>
      </TabList>
      <TabPanels my={24}>
        <TabPanel id="1">
          <Text as="h2">Welcome to Tab 1</Text>
          <Text>{panelText(1)}</Text>
        </TabPanel>
        <TabPanel id="2">
          <Text as="h2">Welcome to Tab 2</Text>
          <Text>{panelText(2)}</Text>
        </TabPanel>
        <TabPanel id="3">
          <Text as="h2">Welcome to Tab 3</Text>
          <Text>{panelText(3)}</Text>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
};

export const BlockVariant: Story = {
  args: {
    variant: 'block',
  },
  render: ThreeTabs,
};

export const TabsNav: Story = {
  render: () => (
    <TabNav aria-label="Secondary Navigation" fill>
      <TabNavLink href="/" selected>
        Tab Link 1
      </TabNavLink>
      <TabNavLink href="/">Tab Link 2</TabNavLink>
      <TabNavLink href="/">Tab Link 3</TabNavLink>
    </TabNav>
  ),
  play: async ({ canvas }) => {
    canvas.getByRole('navigation', { name: 'Secondary Navigation' });
    await expect(canvas.getAllByRole('button')).toHaveLength(3);
    canvas.getByRole('button', { name: 'Tab Link 1' });
  },
};

export const InteractiveContent: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabList mx={24}>
        <Tab id="1">Interactive Tab 1</Tab>
        <Tab id="2">Just Plain Tab 2</Tab>
        <Tab id="3">Also Interactive Tab 3</Tab>
      </TabList>
      <TabPanels my={24}>
        <TabPanel id="1">
          <Text as="h2">Welcome to Tab 1</Text>
          <FillButton>
            I should come into focus, rather than the panel.
          </FillButton>
        </TabPanel>
        <TabPanel id="2">
          <Text as="h2">Welcome to Tab 2</Text>
          <Text>I am normal. My panel should just focus.</Text>
        </TabPanel>
        <TabPanel id="3">
          <Text as="h2">Welcome to Tab 3</Text>
          <FillButton variant="secondary">
            I also should come into focus, rather than the panel.
          </FillButton>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('tab', { name: 'Interactive Tab 1' })
    );
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', {
        name: 'I should come into focus, rather than the panel.',
      })
    ).toHaveFocus();

    await userEvent.click(
      canvas.getByRole('tab', { name: 'Just Plain Tab 2' })
    );
    await userEvent.tab();
    await expect(canvas.getByRole('tabpanel')).toHaveFocus();
  },
};

export const Disabled: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabList>
        <Tab id="1">Tab 1</Tab>
        <Tab id="2" isDisabled>
          Tab 2
        </Tab>
        <Tab id="3">Tab 3</Tab>
      </TabList>
      <TabPanels my={24}>
        <TabPanel id="1">
          <Text as="h2">Welcome to Tab 1</Text>
          <Text>{panelText(1)}</Text>
        </TabPanel>
        <TabPanel id="2">
          <Text as="h2">Welcome to Tab 2</Text>
          <Text>{panelText(2)}</Text>
        </TabPanel>
        <TabPanel id="3">
          <Text as="h2">Welcome to Tab 3</Text>
          <Text>{panelText(3)}</Text>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
  play: async ({ args, canvas, userEvent }) => {
    const tab2 = canvas.getByRole('tab', { name: 'Tab 2' });
    await expect(tab2).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(tab2);
    await expect(args.onSelectionChange).not.toHaveBeenCalledWith('2');
    await expect(canvas.queryByText(panelText(2))).toBeNull();
  },
};

export const DisabledKeys: Story = {
  args: {
    disabledKeys: ['3'],
  },
  render: ThreeTabs,
  play: async ({ args, canvas, userEvent }) => {
    const tab3 = canvas.getByRole('tab', { name: 'Tab 3' });
    await expect(tab3).toHaveAttribute('aria-disabled', 'true');

    await userEvent.click(tab3);
    await expect(args.onSelectionChange).not.toHaveBeenCalledWith('3');
    await expect(canvas.queryByText(panelText(3))).toBeNull();
  },
};

export const ForceMount: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabList>
        <Tab id="1">Tab 1</Tab>
        <Tab id="2">Tab 2</Tab>
        <Tab id="3">Tab 3</Tab>
      </TabList>
      <TabPanels my={24}>
        <TabPanel id="1" shouldForceMount>
          <Text as="h2">Welcome to Tab 1</Text>
          <Text>{panelText(1)}</Text>
        </TabPanel>
        <TabPanel id="2" shouldForceMount>
          <Text as="h2">Welcome to Tab 2</Text>
          <Text>{panelText(2)}</Text>
        </TabPanel>
        <TabPanel id="3" shouldForceMount>
          <Text as="h2">Welcome to Tab 3</Text>
          <Text>{panelText(3)}</Text>
        </TabPanel>
      </TabPanels>
    </Tabs>
  ),
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText(panelText(1))).toBeVisible();
    await expect(canvas.getByText(panelText(2))).not.toBeVisible();
    await expect(canvas.getByText(panelText(3))).not.toBeVisible();

    await userEvent.click(canvas.getByRole('tab', { name: 'Tab 3' }));
    await expect(canvas.getByText(panelText(3))).toBeVisible();
    await expect(canvas.getByText(panelText(1))).not.toBeVisible();
  },
};
