import { coreTheme, system } from '@skillsoft/gamut-styles';
import type {
  ArgTypesEnhancer,
  StrictInputType,
} from 'storybook/internal/types';

interface SystemPropConfig {
  property?: unknown;
  properties?: unknown;
  scale?: unknown;
}

interface SystemPropGroup {
  propNames: readonly string[];
  config: Record<string, SystemPropConfig>;
}

// The groups overlap (`space` contains `margin`/`padding`; flex and grid item
// props are also in `layout`), so the first group listing a prop wins.
const categoryGroups: [string, SystemPropGroup[]][] = [
  ['Spacing', [system.space]],
  ['Flex & Grid', [system.flex, system.grid]],
  ['Layout', [system.layout]],
  ['Positioning', [system.positioning]],
  ['Typography', [system.typography]],
  ['Color', [system.color]],
  ['Background', [system.background]],
  ['Border', [system.border]],
  ['Shadow', [system.shadow]],
  ['List', [system.list]],
];

const systemProps = new Map<
  string,
  { category: string; config: SystemPropConfig }
>();
categoryGroups.forEach(([category, groups]) => {
  groups.forEach(({ propNames, config }) => {
    propNames.forEach((prop) => {
      if (!systemProps.has(prop)) {
        systemProps.set(prop, { category, config: config[prop] });
      }
    });
  });
});

const categoryOrder = categoryGroups.map(([category]) => category);
const categoryRank = (category: string | undefined) =>
  category === undefined ? -1 : categoryOrder.indexOf(category);

export const isSystemPropCategory = (category: string | undefined) =>
  categoryRank(category) >= 0;

const themeScales = coreTheme as unknown as Record<
  string,
  Record<string, unknown> | undefined
>;

// Token names come from the Core theme; other themes may define more or fewer.
const getScaleTokens = ({ scale }: SystemPropConfig) =>
  typeof scale === 'string' ? Object.keys(themeScales[scale] ?? {}) : [];

const toKebabCase = (name: string) =>
  name.replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`);

type PropertyMode = 'physical' | 'logical';

// Property names, lists, and list items can each be a `{ physical, logical }` pair.
const resolveMode = (value: unknown, mode: PropertyMode): unknown =>
  typeof value === 'object' && value !== null && 'physical' in value
    ? (value as Record<PropertyMode, unknown>)[mode]
    : value;

const getCssProperties = (
  { property, properties }: SystemPropConfig,
  mode: PropertyMode
) => {
  const resolved = resolveMode(properties ?? property, mode);
  return (Array.isArray(resolved) ? resolved : [resolved])
    .map((name) => resolveMode(name, mode))
    .filter((name): name is string => typeof name === 'string')
    .map(toKebabCase);
};

const describeCssProperties = (config: SystemPropConfig) => {
  const format = (names: string[]) =>
    names.map((name) => `\`${name}\``).join(', ');
  const physical = getCssProperties(config, 'physical');
  const logical = getCssProperties(config, 'logical');
  return physical.join() === logical.join()
    ? `CSS: ${format(physical)}`
    : `CSS: ${format(physical)} (logical: ${format(logical)})`;
};

const MAX_INLINE_TOKENS = 12;

const getTypeSummary = (config: SystemPropConfig, tokens: string[]) => {
  if (tokens.length === 0) return { summary: 'CSS value' };
  if (tokens.length <= MAX_INLINE_TOKENS)
    return { summary: tokens.join(' | ') };
  return { summary: `theme.${config.scale}`, detail: tokens.join(' | ') };
};

/*
 * Components can declare their own props with system prop names, like a numeric
 * `zIndex`. Docgen types real system props as `Scale<...>`, or, where two prop
 * groups both define a prop, as csstype's open-ended `(string & {})` union.
 */
const hasSystemPropType = ({ table }: StrictInputType) => {
  const docgenType = table?.type?.summary;
  return (
    docgenType !== undefined &&
    (docgenType.startsWith('Scale<') || docgenType.includes('(string & {})'))
  );
};

const enhanceSystemProp = (
  argType: StrictInputType,
  { category, config }: { category: string; config: SystemPropConfig }
): StrictInputType => {
  const tokens = getScaleTokens(config);
  return {
    ...argType,
    description: argType.description || describeCssProperties(config),
    control: argType.control ?? { type: tokens.length > 0 ? 'select' : 'text' },
    ...(tokens.length > 0 && !argType.options && { options: tokens }),
    table: {
      ...argType.table,
      category: argType.table?.category ?? category,
      type: getTypeSummary(config, tokens),
    },
  };
};

/**
 * Makes system props readable in the props table: groups them by prop family
 * below the component's own props, summarizes their types as the theme tokens
 * they accept, and gives them select or text controls. Anything set in a
 * story's `argTypes` takes precedence. The table renders categories in
 * first-seen order, so entries are sorted to keep the sections in the same
 * order on every component. Storybook moves props with story args to the front
 * after this runs, so a story that sets a system prop arg shows that section
 * first.
 */
export const enhanceSystemProps: ArgTypesEnhancer = ({ argTypes }) =>
  Object.fromEntries(
    Object.entries(argTypes)
      .map(([name, argType]): [string, typeof argType] => {
        const systemProp = systemProps.get(name);
        return [
          name,
          systemProp && hasSystemPropType(argType)
            ? enhanceSystemProp(argType, systemProp)
            : argType,
        ];
      })
      .sort(
        ([, a], [, b]) =>
          categoryRank(a.table?.category) - categoryRank(b.table?.category)
      )
  );
