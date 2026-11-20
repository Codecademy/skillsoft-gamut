import { SparkleIcon } from '@skillsoft/gamut-icons';
import type { Meta, StoryObj } from '@storybook/react';
import { Fragment, useState } from 'react';
import type { Mock } from 'storybook/test';
import { expect, fn, screen, waitFor, within } from 'storybook/test';

import { Anchor } from '../../Anchor';
import { Box, FlexBox, GridBox } from '../../Box';
import { FillButton, IconButton } from '../../Button';
import { Modal } from '../../Modals';
import { Text } from '../../Typography';
import type { TipPlacements } from '../shared/types';
import { InfoTip } from '.';

const meta: Meta<typeof InfoTip> = {
  title: 'Feedback/Tips/InfoTip',
  component: InfoTip,
  args: {
    alignment: 'top-left',
    ariaLabel: 'More information',
    info: `I am additional information about a nearby element or content.`,
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof InfoTip>;
type PlayContext = Parameters<NonNullable<Story['play']>>[0];

const expectTipOpen = (info: string) =>
  waitFor(() => expect(screen.getByText(info)).toBeVisible());

const expectTipClosed = (info: string, placement: TipPlacements) =>
  waitFor(() =>
    placement === 'floating'
      ? expect(screen.queryByText(info)).toBeNull()
      : expect(screen.getByText(info)).not.toBeVisible()
  );

const withTemporaryElement = async (
  element: HTMLElement,
  callback: () => Promise<void>
) => {
  document.body.appendChild(element);
  try {
    await callback();
  } finally {
    element.remove();
  }
};

const createDialog = ({ modal }: { modal: boolean }) => {
  const dialog = document.createElement('div');
  dialog.setAttribute('role', 'dialog');
  if (modal) dialog.setAttribute('aria-modal', 'true');
  return dialog;
};

const exerciseInfoTip = async (
  { args, canvas, userEvent }: PlayContext,
  {
    buttonName,
    outsideText,
    placement,
  }: { buttonName: string; outsideText: string; placement: TipPlacements }
) => {
  const info = args.info as string;
  const button = canvas.getByRole('button', { name: buttonName });
  const openTip = async () => {
    await userEvent.click(button);
    await expectTipOpen(info);
  };

  await expect(args.onClick).not.toHaveBeenCalled();
  await expectTipClosed(info, placement);

  await openTip();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await waitFor(() =>
    expect(args.onClick).toHaveBeenLastCalledWith({ isTipHidden: false })
  );

  await userEvent.keyboard('{Escape}');
  await expectTipClosed(info, placement);
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(button).toHaveFocus();
  await waitFor(() =>
    expect(args.onClick).toHaveBeenLastCalledWith({ isTipHidden: true })
  );

  await openTip();
  const outsideButton = document.createElement('button');
  outsideButton.textContent = 'Outside button';
  await withTemporaryElement(outsideButton, async () => {
    outsideButton.focus();
    await userEvent.keyboard('{Escape}');
    await expectTipClosed(info, placement);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  await openTip();
  await withTemporaryElement(createDialog({ modal: true }), async () => {
    await userEvent.keyboard('{Escape}');
    await new Promise((resolve) => setTimeout(resolve, 100));
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expectTipOpen(info);
  });
  await withTemporaryElement(createDialog({ modal: false }), async () => {
    await userEvent.keyboard('{Escape}');
    await expectTipClosed(info, placement);
  });

  await openTip();
  await userEvent.click(canvas.getByText(outsideText));
  await expectTipClosed(info, placement);

  (args.onClick as Mock).mockClear();
  await userEvent.click(button);
  await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(1));
  await userEvent.click(button);
  await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(2));
  await userEvent.click(button);
  await waitFor(() => expect(args.onClick).toHaveBeenCalledTimes(3));
  await expect(args.onClick).toHaveBeenNthCalledWith(1, { isTipHidden: false });
  await expect(args.onClick).toHaveBeenNthCalledWith(2, { isTipHidden: true });
  await expect(args.onClick).toHaveBeenNthCalledWith(3, { isTipHidden: false });
};

const openInfoTipsWithKeyboard = async (
  { userEvent }: PlayContext,
  buttons: HTMLElement[]
) => {
  for (const button of buttons) {
    button.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(button).toHaveAttribute('aria-expanded', 'true')
    );
  }
};

const expectAllClosed = (buttons: HTMLElement[]) =>
  waitFor(async () => {
    for (const button of buttons) {
      await expect(button).toHaveAttribute('aria-expanded', 'false');
    }
  });

const insideModalInfo =
  'This is helpful information about the Modal. Try pressing Escape!';

export const Default: Story = {
  render: (args) => (
    <FlexBox center m={24} py={64}>
      <Text id="default-text" mr={4}>
        Some text that needs info
      </Text>
      <InfoTip {...args} ariaLabel={undefined} ariaLabelledby="default-text" />
    </FlexBox>
  ),
  play: async (context) => {
    const button = context.canvas.getByRole('button', {
      name: 'Some text that needs info',
    });
    await expect(button).toHaveAttribute(
      'aria-roledescription',
      'More information button'
    );

    await exerciseInfoTip(context, {
      buttonName: 'Some text that needs info',
      outsideText: 'Some text that needs info',
      placement: 'inline',
    });
  },
};

export const Emphasis: Story = {
  args: {
    emphasis: 'high',
  },
  render: (args) => (
    <FlexBox center m={24} py={64}>
      <Text id="emphasis-text" mr={4}>
        Some text that needs info
      </Text>
      <InfoTip {...args} ariaLabel={undefined} ariaLabelledby="emphasis-text" />
    </FlexBox>
  ),
};

export const Alignments: Story = {
  render: (args) => (
    <GridBox gap={24} gridTemplateColumns="1fr 1fr" ml={8} py={64}>
      {(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const).map(
        (alignment) => {
          const labelId = `alignment-${alignment}`;
          return (
            <Box key={alignment}>
              <Text id={labelId}>{alignment}</Text>
              <InfoTip
                {...args}
                alignment={alignment}
                ariaLabel={undefined}
                ariaLabelledby={labelId}
              />
            </Box>
          );
        }
      )}
    </GridBox>
  ),
  play: async (context) => {
    const { canvas, userEvent } = context;
    const buttons = canvas.getAllByRole('button');

    await openInfoTipsWithKeyboard(context, buttons);
    await userEvent.keyboard('{Escape}');
    await expectAllClosed(buttons);

    await openInfoTipsWithKeyboard(context, buttons);
    await userEvent.click(canvas.getByText('top-right'));
    await expectAllClosed(buttons);
  },
};

export const Placement: Story = {
  args: {
    placement: 'floating',
  },
  render: (args) => (
    <FlexBox center>
      <Text id="placement-text" mr={4}>
        This text is in a small space and needs floating placement
      </Text>{' '}
      <InfoTip
        {...args}
        ariaLabel={undefined}
        ariaLabelledby="placement-text"
      />
    </FlexBox>
  ),
  play: async (context) => {
    const buttonName =
      'This text is in a small space and needs floating placement';
    await exerciseInfoTip(context, {
      buttonName,
      outsideText: buttonName,
      placement: 'floating',
    });

    const button = context.canvas.getByRole('button', { name: buttonName });
    await waitFor(() =>
      expect(screen.getByTestId('popover-content-container')).toHaveFocus()
    );
    await context.userEvent.keyboard('{Tab}');
    await expect(button).toHaveFocus();
  },
};

export const AriaLabel: Story = {
  render: (args) => (
    <FlexBox center column gap={24} my={48} width={1}>
      <FlexBox alignItems="center" gap={8}>
        <Text fontSize={16} fontWeight="bold">
          Using ariaLabel (no visible label text):
        </Text>
      </FlexBox>
      <FlexBox alignItems="center" gap={8}>
        <IconButton
          icon={SparkleIcon}
          tip="This tool needs to be explained in the InfoTip"
          tipProps={{ placement: 'floating' }}
          onClick={() => null}
        />
        <InfoTip
          {...args}
          ariaLabel="Learn more about this tool"
          ariaLabelledby={undefined}
          info="This is some helpful info about the tool represented by the IconButton"
        />
      </FlexBox>

      <FlexBox alignItems="center" gap={8}>
        <Text fontSize={16} fontWeight="bold">
          Using ariaLabelledby (references visible text):
        </Text>
      </FlexBox>
      <FlexBox alignItems="center" gap={8}>
        <Text id="custom-info-id">
          I am some helpful yet concise text that needs more explanation
        </Text>
        <InfoTip
          alignment="bottom-left"
          ariaLabelledby="custom-info-id"
          info="I am clarifying information related to the concise text."
        />
      </FlexBox>
    </FlexBox>
  ),
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: 'Learn more about this tool' });
    canvas.getByRole('button', {
      name: 'I am some helpful yet concise text that needs more explanation',
    });
  },
};

export const FloatingAriaLabel: Story = {
  args: {
    ariaLabel: 'Help text',
    placement: 'floating',
  },
  play: ({ canvas }) => {
    canvas.getByRole('button', { name: 'Help text' });
  },
};

export const CustomRoleDescription: Story = {
  args: {
    ariaRoleDescription: 'Botón de más información',
    alignment: 'top-right',
    placement: 'floating',
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: 'More information' })
    ).toHaveAttribute('aria-roledescription', 'Botón de más información');
  },
};

export const WithLinksOrButtons: Story = {
  args: {
    placement: 'floating',
  },
  render: function WithLinksOrButtons(args) {
    return (
      <FlexBox center py={64}>
        <Text id="links-text" mr={4}>
          This text is in a small space and needs info
        </Text>{' '}
        <InfoTip
          {...args}
          ariaLabel={undefined}
          ariaLabelledby="links-text"
          info={
            <Text tabIndex={-1}>
              Hey! Here is a{' '}
              <Anchor href="https://giphy.com/search/nichijou">
                cool link
              </Anchor>{' '}
              that is super important. This is a{' '}
              <Anchor href="https://giphy.com/search/nichijou">
                second cool link
              </Anchor>{' '}
              that is also super important.
            </Text>
          }
        />
      </FlexBox>
    );
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', {
      name: 'This text is in a small space and needs info',
    });
    const popoverFocused = () =>
      waitFor(() =>
        expect(screen.getByTestId('popover-content-container')).toHaveFocus()
      );

    await userEvent.click(button);
    await popoverFocused();
    await userEvent.keyboard('{Tab}');
    const firstLink = screen.getByRole('link', { name: 'cool link' });
    await expect(firstLink).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect(
      screen.getByRole('link', { name: 'second cool link' })
    ).toHaveFocus();
    await expect(firstLink).not.toHaveFocus();
    await expect(button).not.toHaveFocus();

    await userEvent.keyboard('{Tab}');
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await userEvent.click(button);
    await popoverFocused();
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
    await expect(button).toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await userEvent.click(button);
    await popoverFocused();
    await userEvent.keyboard('{Tab}');
    await expect(screen.getByRole('link', { name: 'cool link' })).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('link', { name: 'cool link' })).toBeNull()
    );
  },
};

export const KeyboardNavigation: Story = {
  render: function KeyboardNavigation() {
    const examples = [
      {
        title: 'Floating Placement',
        placement: 'floating' as const,
        links: ['Link 1', 'Link 2', 'Link 3'],
      },
      {
        title: 'Inline Placement',
        placement: 'inline' as const,
        alignment: 'bottom-right' as const,
        links: ['Link A', 'Link B'],
      },
    ];

    return (
      <FlexBox center flexDirection="column" gap={24} py={64}>
        <GridBox gap={16} gridTemplateColumns="1fr 1fr">
          {examples.map(({ title, placement, alignment, links }) => {
            const labelId = `keyboard-nav-${placement}`;
            return (
              <FlexBox gap={8} key={placement}>
                <Text fontSize={16} fontWeight="bold" id={labelId}>
                  {title}
                </Text>
                <InfoTip
                  alignment={alignment}
                  ariaLabelledby={labelId}
                  info={
                    <Text>
                      {links.map((label, idx) => (
                        <Fragment key={label}>
                          {idx > 0 && ', '}
                          <Anchor href="https://example.com">{label}</Anchor>
                          {idx < links.length - 1 && ' '}
                        </Fragment>
                      ))}
                    </Text>
                  }
                  placement={placement}
                />
              </FlexBox>
            );
          })}
        </GridBox>

        <Box maxWidth={700}>
          <Text fontSize={14} fontWeight="bold" mb={8}>
            Keyboard Navigation:
          </Text>
          <Box as="ul" fontSize={14} pl={16}>
            <li>
              <strong>Opening:</strong> Focus automatically moves to the tip
              content when opened
            </li>
            <li>
              <strong>Floating - Tab:</strong> Navigates forward through links,
              then wraps to button (contained)
            </li>
            <li>
              <strong>Floating - Shift+Tab:</strong> Natural backward navigation
              (exits to page)
            </li>
            <li>
              <strong>Inline:</strong> Tab/Shift+Tab follows normal document
              flow
            </li>
            <li>
              <strong>Escape (both):</strong> Closes tip and returns focus to
              button
            </li>
            <li>
              Escape works even when focus is on links or outside elements
            </li>
          </Box>
        </Box>
      </FlexBox>
    );
  },
  play: async (context) => {
    const { canvas, userEvent } = context;
    const floatingButton = canvas.getByRole('button', {
      name: 'Floating Placement',
    });
    const inlineButton = canvas.getByRole('button', {
      name: 'Inline Placement',
    });

    await userEvent.click(inlineButton);
    await waitFor(() =>
      expect(inlineButton).toHaveAttribute('aria-expanded', 'true')
    );
    await userEvent.keyboard('{Tab}');
    const linkA = canvas.getByRole('link', { name: 'Link A' });
    await expect(linkA).toHaveFocus();
    await userEvent.keyboard('{Tab}');
    await expect(canvas.getByRole('link', { name: 'Link B' })).toHaveFocus();
    await expect(linkA).not.toHaveFocus();

    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(linkA).not.toBeVisible());

    await openInfoTipsWithKeyboard(context, [floatingButton, inlineButton]);
    await userEvent.keyboard('{Escape}');
    await expectAllClosed([floatingButton, inlineButton]);
  },
};

export const InfoTipInsideModal: Story = {
  args: {
    placement: 'inline',
    info: insideModalInfo,
  },
  render: function InfoTipInsideModal(args) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
      <FlexBox center flexDirection="column" gap={16} py={64}>
        <FillButton onClick={() => setIsModalOpen(true)}>
          Open Modal with InfoTip Inside
        </FillButton>

        <Box mt={16}>
          <Text fontSize={14}>
            <strong>Test InfoTip Inside Modal (Inline): </strong>
          </Text>
          <Box as="ol" fontSize={14}>
            <li>Click &quot;Open Modal with InfoTip Inside&quot;</li>
            <li>Click or press Enter on the InfoTip button (ⓘ icon)</li>
            <li>Press Escape - should close InfoTip (Modal stays open)</li>
            <li>Press Escape again - should close Modal</li>{' '}
          </Box>
        </Box>

        <Modal
          isOpen={isModalOpen}
          size="medium"
          title="Modal with InfoTip"
          onRequestClose={() => setIsModalOpen(false)}
        >
          <FlexBox flexDirection="column" gap={16} p={16}>
            <Text>This modal contains an InfoTip below:</Text>

            <FlexBox alignItems="center" gap={8}>
              <Text id="modal-infotip-text">
                Some text that needs explanation
              </Text>
              <InfoTip
                {...args}
                ariaLabel={undefined}
                ariaLabelledby="modal-infotip-text"
              />
            </FlexBox>

            <Text color="text-disabled" fontSize={14}>
              The InfoTip inside this modal can be closed with Escape without
              closing the modal itself. Inline placement works correctly.
            </Text>

            <FillButton onClick={() => setIsModalOpen(false)}>
              Close Modal
            </FillButton>
          </FlexBox>
        </Modal>
      </FlexBox>
    );
  },
  play: async ({ args, canvas, userEvent }) => {
    const info = args.info as string;
    await userEvent.click(
      canvas.getByRole('button', { name: 'Open Modal with InfoTip Inside' })
    );
    const dialog = within(await screen.findByRole('dialog'));

    await userEvent.click(
      dialog.getByRole('button', { name: 'Some text that needs explanation' })
    );
    await expectTipOpen(info);

    await userEvent.keyboard('{Escape}');
    await expectTipClosed(info, args.placement ?? 'inline');
    screen.getByRole('dialog');
  },
};

export const InfoTipInsideModalFloating: Story = {
  ...InfoTipInsideModal,
  args: {
    placement: 'floating',
    info: insideModalInfo,
  },
};

export const ZIndex: Story = {
  args: {
    info: 'I am inline, cool',
    zIndex: 5,
  },
  render: (args) => (
    <FlexBox center flexDirection="column" m={24} py={64}>
      <Box bg="background-primary" zIndex={3}>
        I will not be behind the infotip, sad + unreadable
      </Box>
      <InfoTip
        ariaLabel="z-index example without override"
        info="I am inline, cool"
      />
      <Box bg="background-primary" zIndex={3}>
        I will be behind the infotip, nice + great
      </Box>
      <InfoTip
        {...args}
        ariaLabel="z-index example with override"
        ariaLabelledby={undefined}
      />
    </FlexBox>
  ),
};
