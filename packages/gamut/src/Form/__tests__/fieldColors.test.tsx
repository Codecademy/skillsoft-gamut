import { matchers } from '@emotion/jest';
import { GamutProvider, skillsoftTheme } from '@skillsoft/gamut-styles';
import { render } from '@testing-library/react';
import type * as React from 'react';

import { FormGroupDescription } from '../elements/FormGroupDescription';
import { Checkbox } from '../inputs/Checkbox';
import { Input } from '../inputs/Input';
import { Select } from '../inputs/Select';
import { TextArea } from '../inputs/TextArea';

expect.extend(matchers);

const renderIn = (ui: React.ReactElement) =>
  render(
    <GamutProvider theme={skillsoftTheme} useCache={false} useGlobals={false}>
      {ui}
    </GamutProvider>
  ).container;

const role = (name: string) => `var(--color-${name})`;

/* Design's field map, and design's "inputs use surface-raised". */
describe('field colors', () => {
  it.each([
    ['Input', <Input htmlFor="a" key="a" name="a" />, 'input'],
    ['TextArea', <TextArea htmlFor="b" key="b" name="b" />, 'textarea'],
    [
      'Select',
      <Select htmlFor="c" key="c" name="c" options={['x']} />,
      'select',
    ],
  ])('%s fills with surface-raised', (_, ui, tag) => {
    const el = renderIn(ui).querySelector(tag)!;
    expect(el).toHaveStyleRule('background-color', role('surface-raised'));
  });

  it('gives the placeholder text-subtle', () => {
    const el = renderIn(<Input htmlFor="d" name="d" />).querySelector('input')!;
    expect(el).toHaveStyleRule('color', role('text-subtle'), {
      target: '::placeholder',
    });
  });

  it('draws an error as a 2px text-error outline at rest', () => {
    const el = renderIn(<Input error htmlFor="e" name="e" />).querySelector(
      'input'
    )!;
    expect(el).toHaveStyleRule('border-color', role('text-error'));
    expect(el).toHaveStyleRule(
      'box-shadow',
      `inset 0 0 0 1px ${role('text-error')}`
    );
  });

  it('fills an unchecked checkbox with surface-raised', () => {
    const container = renderIn(
      <Checkbox htmlFor="f" label="Agree" name="f" onChange={() => {}} />
    );
    const box = container.querySelector('label > div')!;
    expect(box).toHaveStyleRule('background-color', role('surface-raised'));
  });

  it('sets a FormGroup description in text-subtle', () => {
    const el = renderIn(<FormGroupDescription>Help</FormGroupDescription>)
      .firstElementChild!;
    expect(el).toHaveStyleRule('color', role('text-subtle'));
  });
});
