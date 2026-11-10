import { matchers } from '@emotion/jest';
import styled from '@emotion/styled';
import { render } from '@testing-library/react';

import { createEmotionCache } from '../../cache';
import { GamutProvider } from '../../GamutProvider';
import { skillsoftTheme } from '../../themes';
import { checkRecipe, compileRecipe, defineRecipe, StaticStyles } from '..';

expect.extend(matchers);

const chip = defineRecipe({
  className: 'gamut-chip',
  base: { display: 'inline-flex', borderRadius: 'md', bg: 'surface-default' },
  variants: {
    intent: {
      primary: { bg: 'action-primary', color: 'text-inverse' },
      danger: { bg: 'action-danger', color: 'text-inverse' },
    },
    size: {
      sm: { height: '1.5rem', fontSize: 14 },
      md: { height: '2rem', fontSize: 16 },
    },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
  compoundVariants: [
    { intent: 'danger', size: 'sm', css: { textDecoration: 'underline' } },
  ],
});

describe('defineRecipe', () => {
  it('names a class per selected variant, with defaults filled in', () => {
    expect(chip.classNames()).toBe(
      'gamut-chip gamut-chip--intent_primary gamut-chip--size_md'
    );
    expect(chip.classNames({ intent: 'danger', size: false })).toBe(
      'gamut-chip gamut-chip--intent_danger'
    );
  });

  it('type-checks selections', () => {
    // @ts-expect-error not one of the intents
    expect(chip.classNames({ intent: 'nope' })).toContain('gamut-chip');
  });

  it('splits variant props from the rest', () => {
    const [variants, rest] = chip.splitProps({
      intent: 'danger' as const,
      id: 'x',
    });
    expect(variants).toEqual({ intent: 'danger' });
    expect(rest).toEqual({ id: 'x' });
  });

  it('styles through Emotion the same way variant() does', () => {
    const Chip = styled.div(chip.styles);
    const { container } = render(
      <GamutProvider theme={skillsoftTheme}>
        <Chip intent="danger" size="sm" />
      </GamutProvider>
    );
    const el = container.firstChild;
    expect(el).toHaveStyleRule(
      'background-color',
      'var(--color-action-danger)'
    );
    expect(el).toHaveStyleRule('height', '1.5rem');
    expect(el).toHaveStyleRule('text-decoration', 'underline');
  });
});

describe('compileRecipe', () => {
  const output = compileRecipe(chip);

  it('writes every rule into @layer recipes', () => {
    expect(output.startsWith('@layer recipes{')).toBe(true);
    expect(output).toContain(
      '.gamut-chip{display:inline-flex;border-radius:4px;background-color:var(--color-surface-default);}'
    );
    expect(output).not.toContain('label');
  });

  it('always writes logical properties', () => {
    expect(output).toContain('block-size:1.5rem;');
    expect(compileRecipe(chip, { useLogicalProperties: false })).toContain(
      'height:1.5rem;'
    );
  });

  it('keeps spaces inside values', () => {
    const bordered = defineRecipe({
      className: 'gamut-bordered',
      base: { gridTemplateColumns: '1fr 2fr' },
    });
    expect(compileRecipe(bordered)).toContain('grid-template-columns:1fr 2fr;');
  });

  it('points colors at the role variables, not values', () => {
    expect(output).toContain(
      '.gamut-chip--intent_danger{color:var(--color-text-inverse);background-color:var(--color-action-danger);}'
    );
  });

  it('gives compound variants both classes, so they win on specificity', () => {
    expect(output).toContain(
      '.gamut-chip--intent_danger.gamut-chip--size_sm{text-decoration:underline;}'
    );
  });
});

describe('checkRecipe', () => {
  it('passes a recipe that only uses roles and shared scales', () => {
    expect(checkRecipe(chip)).toEqual({ pass: true, differs: [] });
  });

  it('fails a value that changes with the brand', () => {
    const titled = defineRecipe({
      className: 'gamut-titled',
      base: { fontFamily: 'accent' },
    });
    expect(checkRecipe(titled).pass).toBe(false);
  });

  it('names the brands that differ', () => {
    const titled = defineRecipe({
      className: 'gamut-titled',
      base: { fontFamily: 'accent' },
    });
    expect(checkRecipe(titled).differs).toEqual(['originalCodecademy']);
  });
});

describe('StaticStyles', () => {
  const styles = compileRecipe(chip);
  const Chip = () => (
    <>
      <StaticStyles id={chip.className} styles={styles} />
      <span className={chip.classNames()} />
    </>
  );

  it('inserts the stylesheet once, however many times it renders', () => {
    const cache = createEmotionCache({ speedy: false });
    render(
      <GamutProvider cache={cache} theme={skillsoftTheme} useGlobals={false}>
        <Chip />
        <Chip />
        <Chip />
      </GamutProvider>
    );
    const sheets = Array.from(document.querySelectorAll('style')).filter((s) =>
      s.textContent?.includes('.gamut-chip{')
    );
    expect(sheets).toHaveLength(1);
    expect(cache.inserted[chip.className]).toBe(true);
  });
});
