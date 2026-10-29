import type { BackgroundProps } from '@skillsoft/gamut-styles';
import { Background } from '@skillsoft/gamut-styles';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, fn, waitFor } from 'storybook/test';

import { FlexBox } from '../Box';
import { Text } from '../Typography';
import type { WithChildrenProp } from '../utils';
import { Disclosure } from '.';

const meta: Meta<typeof Disclosure> = {
  title: 'Containers/Disclosure',
  component: Disclosure,
  args: {},
};

export default meta;
type Story = StoryObj<typeof Disclosure>;

const BackgroundWithPadding = ({
  bg,
  children,
}: Pick<BackgroundProps, 'bg'> & WithChildrenProp) => {
  return (
    <Background bg={bg}>
      <FlexBox p={16}>{children}</FlexBox>
    </Background>
  );
};

const loremBody =
  'Lorem ipsum dolor sit amet consectetur. Ut consectetur adipiscing a donec sed volutpat. Tempor risus rhoncus quisque vel sit mattis. Accumsan vel posuere tortor sit mattis augue congue sit.';

export const Default: Story = {
  args: {
    heading: 'All the options',
    body: (
      <Text maxWidth="600px">
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis tempore
        voluptatum, hic ipsum cum commodi laudantium? Mollitia quod totam
        consequuntur facere, praesentium cumque nesciunt debitis officiis, ipsa
        sapiente recusandae iusto.
      </Text>
    ),
    overline: 'overline is text-secondary and fontFamily: accent',
    subheading: 'subheading is text-secondary',
    ctaText: 'Optional button - must include a callback!',
    ctaCallback: fn(),
    hasPanelBg: true,
    initiallyExpanded: true,
  },
  play: async ({ args, canvas, userEvent }) => {
    await expect(
      canvas.getByRole('button', { name: /All the options/ })
    ).toHaveAttribute('aria-expanded', 'true');
    canvas.getByText(/Quis tempore voluptatum/);

    await userEvent.click(
      canvas.getByRole('button', {
        name: 'Optional button - must include a callback!',
      })
    );
    await expect(args.ctaCallback).toHaveBeenCalledTimes(1);
  },
};

export const DefaultBackground: Story = {
  render: () => (
    <BackgroundWithPadding bg="background-primary">
      <Disclosure body="Uses `background`" heading="default" />
    </BackgroundWithPadding>
  ),
};

export const SubtleBgBordered: Story = {
  render: () => (
    <BackgroundWithPadding bg="background-primary">
      <Disclosure
        body='Uses `background-selected`. For this example there is a `<Background>` set to `"background-primary"`.'
        heading="subtle"
        variant="subtle"
      />
    </BackgroundWithPadding>
  ),
};

export const Transparent: Story = {
  render: () => (
    <BackgroundWithPadding bg="background-primary">
      <Disclosure
        body="Notice the border and it uses `background-current` to inherit the existing background color."
        heading="transparent"
        variant="transparent"
      />
    </BackgroundWithPadding>
  ),
};

export const HasBorder: Story = {
  render: () => (
    <BackgroundWithPadding bg="background-primary">
      <Disclosure
        body="This is a `default` variant without a border."
        hasBorder={false}
        heading="hasBorder (set to false)"
      />
    </BackgroundWithPadding>
  ),
};

export const Normal: Story = {
  args: {
    heading: 'Normal',
    body: loremBody,
  },
  play: async ({ canvas, userEvent }) => {
    const button = canvas.getByRole('button', { name: 'Normal' });
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await expect(canvas.queryByText(loremBody)).toBeNull();

    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    canvas.getByText(loremBody);

    await userEvent.click(button);
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await waitFor(() => expect(canvas.queryByText(loremBody)).toBeNull());
  },
};

export const Condensed: Story = {
  args: {
    heading: 'Condensed spacing',
    body: loremBody,
    spacing: 'condensed',
  },
};

export const Compact: Story = {
  args: {
    heading: 'Compact spacing',
    body: loremBody,
    spacing: 'compact',
  },
};
