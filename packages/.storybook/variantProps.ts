import type {
  ArgTypesEnhancer,
  StrictInputType,
} from 'storybook/internal/types';

const isVariantUnion = (values: unknown[]) =>
  values.includes(false) && values.some((value) => typeof value === 'string');

const withoutFalse = (values: readonly unknown[]) =>
  values.filter((value) => value !== false);

const removeFalse = (argType: StrictInputType): StrictInputType => {
  const { type, options, table } = argType;
  if (type?.name !== 'enum' || !isVariantUnion(type.value)) return argType;

  const summary = table?.type?.summary;
  return {
    ...argType,
    type: { ...type, value: withoutFalse(type.value) as typeof type.value },
    ...(options && { options: withoutFalse(options) }),
    table: {
      ...table,
      ...(summary && {
        type: {
          ...table?.type,
          summary: summary
            .split(' | ')
            .filter((member) => member !== 'false')
            .join(' | '),
        },
      }),
    },
  };
};

/**
 * Drops `false` from `variant()` prop unions in the props table and controls.
 * Variance types every `variant()` prop as `Keys | false`, and passing `false`
 * turns off that variant's styles, base styles included. It's an escape hatch,
 * not an option to advertise next to the real variants. Storybook infers
 * controls after this runs, so the radio and select options lose `false` too.
 */
export const enhanceVariantProps: ArgTypesEnhancer = ({ argTypes }) =>
  Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => [
      name,
      removeFalse(argType),
    ])
  );
