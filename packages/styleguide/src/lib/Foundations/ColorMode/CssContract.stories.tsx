/* eslint-disable @skillsoft/gamut/no-inline-style -- these stories show plain CSS with no Emotion, so inline styles are the point. */
import { Anchor, FillButton, StrokeButton, Text } from '@skillsoft/gamut';
import { contentModes, roles } from '@skillsoft/gamut-styles/tokens';
import type { Meta, StoryObj } from '@storybook/react';
import type * as React from 'react';

/*
 * The color system's CSS contract (color-system spike, branch
 * cass-color-css-contract): tokens.css alone themes a subtree. Pick the
 * "Skillsoft (color spike)" theme in the toolbar; other themes don't load
 * these values.
 */

const meta: Meta = {
  title: 'Foundations/Color system/CSS contract',
};

export default meta;
type Story = StoryObj;
type Mode = keyof typeof roles;

const panel: React.CSSProperties = {
  padding: 16,
  border: '1px solid var(--color-border-default)',
  borderRadius: 4,
};

/* A mode switch is an attribute. The values come from tokens.css. */
const Panel: React.FC<{ mode: Mode; children?: React.ReactNode }> = ({
  mode,
  children,
}) => (
  <div
    data-color-mode={mode}
    style={{ ...panel, background: 'var(--color-surface-default)' }}
  >
    <p style={{ margin: '0 0 8px' }}>
      {mode} — text-default,{' '}
      <span style={{ color: 'var(--color-text-subtle)' }}>text-subtle</span>,{' '}
      <span style={{ color: 'var(--color-action-primary)' }}>
        action-primary
      </span>
    </p>
    {children}
  </div>
);

export const PlainCss: Story = {
  render: () => (
    <Panel mode="light">
      <Panel mode="dark">
        <Panel mode="light" />
      </Panel>
    </Panel>
  ),
};

type RoleName = keyof (typeof roles)['light'];
type PaletteKey = keyof typeof contentModes;

/*
 * Background without Emotion or contrast math: resolve the role to its
 * palette color in the outer mode, paint that, and flip to the mode the
 * content-mode table lists. The palette color is the same in every mode, so
 * the flip can't change the background under it.
 */
const CssSurface: React.FC<{
  outer: Mode;
  color: RoleName | PaletteKey;
}> = ({ outer, color }) => {
  const key = (
    color in roles[outer] ? roles[outer][color as RoleName].ref : color
  ) as PaletteKey;
  const bg = `var(--color-${key})`;
  return (
    <div
      data-color-mode={contentModes[key]}
      style={
        {
          ...panel,
          background: bg,
          '--color-background-current': bg,
        } as React.CSSProperties
      }
    >
      {color}
      <span style={{ color: 'var(--color-text-subtle)' }}>
        {' '}
        → {contentModes[key]} content
      </span>
    </div>
  );
};

const SURFACES: (RoleName | PaletteKey)[] = [
  'surface-default',
  'surface-raised',
  'surface-sunken',
  'surface-success',
  'surface-warning',
  'surface-error',
  'palette-primary-800',
  'palette-accent-700',
  'palette-neutral-dark-1000',
  /* Mid-ramp: neither mode's text reaches 4.5:1 here (validate:tokens reports it). */
  'palette-primary-600',
];

export const Surfaces: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 8 }}>
      {SURFACES.map((color) => (
        <CssSurface color={color} key={color} outer="light" />
      ))}
    </div>
  ),
};

/*
 * gamut components inside a subtree themed only by CSS. Their colors are
 * `var(--color-*)` names, so they follow the attribute. What doesn't follow:
 * anything that reads the mode from Emotion's theme in JS.
 */
export const EmotionInsideCss: Story = {
  render: () => (
    <div
      data-color-mode="dark"
      style={{ ...panel, background: 'var(--color-surface-default)' }}
    >
      <Text as="p" mb={16}>
        Text, <Anchor href="#">an Anchor</Anchor>, and buttons, under a plain{' '}
        <code>data-color-mode=&quot;dark&quot;</code> div.
      </Text>
      <div style={{ display: 'flex', gap: 8 }}>
        <FillButton>FillButton</FillButton>
        <StrokeButton>StrokeButton</StrokeButton>
      </div>
    </div>
  ),
};
