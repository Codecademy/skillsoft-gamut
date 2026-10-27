import { matchers } from '@emotion/jest';
import type { Theme } from '@emotion/react';
import { render } from '@testing-library/react';
import { parse } from 'culori';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { Background } from '../Background';
import {
  ColorMode,
  modeColorProps,
  useColorModes,
  useCurrentMode,
} from '../ColorMode';
import { GamutProvider } from '../GamutProvider';
import {
  adminTheme,
  coreTheme,
  lxStudioTheme,
  originalCodecademyTheme,
  percipioTheme,
  platformTheme,
  skillsoftTheme,
} from '../themes';
import { themed } from '../utilities';
import { css, states, system, variant } from '../variance';

expect.extend(matchers);

/*
 * The styling-function contract: every css-in-js function that takes a color
 * keeps its API and behavior on every theme, in both modes. Each theme is
 * tested with its own color names; what has to hold is that the CSS a
 * function writes resolves, through every var(), to a real color.
 *
 * Values come from where the browser gets them: the theme's injected root and
 * mode variables, or tokens.css for themes that ship static values.
 */

const THEMES = {
  core: coreTheme,
  admin: adminTheme,
  platform: platformTheme,
  percipio: percipioTheme,
  lxStudio: lxStudioTheme,
  skillsoft: skillsoftTheme,
  originalCodecademy: originalCodecademyTheme,
} as unknown as Record<string, Theme>;

type Mode = 'light' | 'dark';
const MODES: Mode[] = ['light', 'dark'];
type Vars = Record<string, string>;

const tokensCss = readFileSync(
  resolve(__dirname, '../tokens/generated/tokens.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

/*
 * Custom properties tokens.css declares for a brand and mode, in cascade
 * order: the default palette on :root, the brand's palette over it, then the
 * mode's roles. Innermost blocks only, so the @layer wrapper is skipped.
 */
const tokensCssVars = (mode: Mode, brand: string): Vars => {
  const vars: Vars = {};
  for (const [, selector, body] of tokensCss.matchAll(
    /([^{};]+)\{([^{}]*)\}/g
  )) {
    const applies = selector.includes('data-color-mode')
      ? selector.includes(`"${mode}"`)
      : selector.includes(':root') ||
        selector.includes(`[data-brand="${brand}"]`);
    if (!applies) continue;
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
      vars[name] = value.trim();
    }
  }
  return vars;
};

const hasStaticValues = (theme: Theme) =>
  !Object.keys(theme._variables.root).some((k) => k.startsWith('--colors-'));

/* The variables in scope inside a `mode` subtree of `theme`. */
const varsFor = (theme: Theme, mode: Mode): Vars =>
  hasStaticValues(theme)
    ? tokensCssVars(mode, theme.brand)
    : ({
        ...theme._variables.root,
        ...modeColorProps({
          theme: { ...theme, mode: undefined } as never,
          mode,
        }),
      } as Vars);

/* Follows var() references to a value; undefined if any link is missing. */
const resolveVars = (
  value: string,
  vars: Vars,
  depth = 0
): string | undefined => {
  if (depth > 20) return undefined;
  const match = /var\((--[\w-]+)\s*(?:,\s*([^)]*))?\)/.exec(value);
  if (!match) return value;
  const [whole, name, fallback] = match;
  const next = vars[name] ?? fallback?.trim();
  if (next === undefined) return undefined;
  return resolveVars(value.replace(whole, next), vars, depth + 1);
};

const isColor = (value: unknown, vars: Vars) => {
  if (typeof value !== 'string') return false;
  const resolved = resolveVars(value, vars);
  return resolved !== undefined && parse(resolved) !== undefined;
};

/* Every color name a theme's modes define, with a palette color for each. */
const namesOf = (theme: Theme) =>
  Object.keys(theme.modes.light).filter(
    (name) => name !== 'background-current'
  );

/* Runs `write` for every name and returns the ones whose CSS doesn't resolve. */
const failures = (
  theme: Theme,
  mode: Mode,
  write: (name: string) => unknown[]
) => {
  const vars = varsFor(theme, mode);
  return namesOf(theme).filter((name) =>
    write(name).some((value) => !isColor(value, vars))
  );
};

const CASES = Object.entries(THEMES).flatMap(([name, theme]) =>
  MODES.map((mode) => [name, mode, theme] as const)
);

describe.each(CASES)('%s, %s', (_, mode, theme) => {
  const t = { ...theme, mode } as Theme;

  it('has a color for every name it defines', () => {
    expect(failures(t, mode, (name) => [t.colors[name as never]])).toEqual([]);
  });

  it('css()', () => {
    expect(
      failures(t, mode, (name) => {
        const out = css({ color: name, bg: name, borderColor: name } as never)({
          theme: t,
        }) as Record<string, unknown>;
        return [out.color, out.backgroundColor, out.borderColor];
      })
    ).toEqual([]);
  });

  it('variant()', () => {
    expect(
      failures(t, mode, (name) => {
        const out = variant({
          variants: { probe: { color: name, bg: name } },
        } as never)({ theme: t, variant: 'probe' } as never) as Record<
          string,
          unknown
        >;
        return [out.color, out.backgroundColor];
      })
    ).toEqual([]);
  });

  it('states()', () => {
    expect(
      failures(t, mode, (name) => {
        const out = states({ probe: { color: name } } as never)({
          theme: t,
          probe: true,
        } as never) as Record<string, unknown>;
        return [out.color];
      })
    ).toEqual([]);
  });

  it('system props', () => {
    expect(
      failures(t, mode, (name) => {
        const out = system.color({
          theme: t,
          color: name,
          bg: name,
        } as never) as Record<string, unknown>;
        return [out.color, out.backgroundColor];
      })
    ).toEqual([]);
  });

  it('themed()', () => {
    expect(
      failures(t, mode, (name) => [
        themed(`colors.${name}` as never)({ theme: t }),
      ])
    ).toEqual([]);
  });

  it('modeColorProps() sets every name for a mode switch', () => {
    const other: Mode = mode === 'light' ? 'dark' : 'light';
    const out = modeColorProps({ theme: t, mode: other }) as Vars;
    const vars = { ...varsFor(t, other), ...out };
    const missing = namesOf(t).filter(
      (name) =>
        !isColor(out[`--colors-${name}`] ?? vars[`--colors-${name}`], vars)
    );
    expect(missing).toEqual([]);
  });

  it('_getColorValue() gives sRGB for every palette color (polished reads it)', () => {
    const palettes = [...new Set(Object.values(t.modes[mode]))] as string[];
    const bad = palettes.filter((key) => {
      const value = t._getColorValue(key as never);
      return typeof value !== 'string' || !/^(#|rgba?\()/.test(value);
    });
    expect(bad).toEqual([]);
  });

  it('ColorMode, useCurrentMode() and useColorModes()', () => {
    const seen: unknown[] = [];
    const Probe = () => {
      const [active, colors, modes] = useColorModes();
      seen.push(
        useCurrentMode(),
        active,
        Object.keys(colors).length,
        Object.keys(modes)
      );
      return null;
    };
    const { container } = render(
      <GamutProvider theme={theme} useCache={false} useGlobals={false}>
        <ColorMode mode={mode}>
          <Probe />
        </ColorMode>
      </GamutProvider>
    );
    expect(seen).toEqual([
      mode,
      mode,
      namesOf(t).length + 1,
      ['light', 'dark'],
    ]);
    expect(container.firstChild).toHaveStyleRule(
      'color',
      resolvesToColor(varsFor(t, mode))
    );
  });

  /*
   * Given a name, Background paints the palette color that name has in the
   * outer mode. The palette color is the same in every mode, so flipping the
   * content mode can't change the background under it.
   */
  it('Background paints the outer mode’s color for every name', () => {
    const vars = varsFor(t, mode);
    const wrong = namesOf(t).filter((bg) => {
      const { container, unmount } = render(
        <GamutProvider theme={theme} useCache={false} useGlobals={false}>
          <ColorMode mode={mode}>
            <Background bg={bg as never} />
          </ColorMode>
        </GamutProvider>
      );
      const el = container.firstChild?.firstChild as HTMLElement;
      const expected = t.colors[t.modes[mode][bg as never]];
      let ok = true;
      try {
        expect(el).toHaveStyleRule('--colors-background-current', expected);
        expect(el).toHaveStyleRule('background-color', resolvesToColor(vars));
      } catch {
        ok = false;
      }
      unmount();
      return !ok;
    });
    expect(wrong).toEqual([]);
  });

  it('ColorMode switches by attribute on generated themes, by variables on the rest', () => {
    /* Away from the provider's active mode, the theme's initial one. */
    const other: Mode = theme.mode === 'light' ? 'dark' : 'light';
    const { container } = render(
      <GamutProvider theme={theme} useCache={false} useGlobals={false}>
        <ColorMode mode={other} />
      </GamutProvider>
    );
    const el = container.firstChild as HTMLElement;
    const someName = namesOf(t)[0];
    if (t.contentModes) {
      expect(el.getAttribute('data-color-mode')).toBe(other);
      expect(el.getAttribute('data-brand')).toBe(t.brand);
      expect(el).not.toHaveStyleRule(`--colors-${someName}`, expect.anything());
    } else {
      expect(el.getAttribute('data-color-mode')).toBeNull();
      expect(el).toHaveStyleRule(`--colors-${someName}`, expect.anything());
    }
  });
});

it('resolves each brand’s roles against its own palette', () => {
  const primary = (theme: Theme) =>
    resolveVars('var(--colors-action-primary)', varsFor(theme, 'light'));
  /* Same lightness and grade, hyper's hue (274.1°) in place of Sapphire's. */
  expect(primary(THEMES.originalCodecademy)).toBe(
    'oklch(0.4115 0.2344 274.10)'
  );
  expect(primary(THEMES.skillsoft)).toBe('oklch(0.4115 0.1767 262.40)');
});

/* An asymmetric matcher, so toHaveStyleRule can check a value resolves. */
function resolvesToColor(vars: Vars) {
  return {
    $$typeof: Symbol.for('jest.asymmetricMatcher'),
    asymmetricMatch: (value: unknown) => isColor(value, vars),
    toAsymmetricMatcher: () => 'a value that resolves to a color',
  };
}
