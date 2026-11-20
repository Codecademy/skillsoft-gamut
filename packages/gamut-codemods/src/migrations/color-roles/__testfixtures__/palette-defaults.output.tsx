import { Box, Text } from '@skillsoft/gamut';

export const Status = () => (
  <Box bg="surface-error" borderColor="text-success">
    <Text color="text-error">Failed</Text>
    <Text textColor="text-success">Passed</Text>
    <Box bg="surface-raised" borderColor="border-subtle" />
    <Box bg="surface-default" />
    <Box /* color-roles: 'navy-800' is an old palette color with no role of its own, used as the `bg` prop. Pick the role from design's component map (@skillsoft/gamut-brand src/migration.ts, COMPONENTS). */ bg="navy-800" />
    <Text color="text-default">Heading</Text>
    <Box borderColor="border-default" />
    <Text /* color-roles: 'navy-300' is an old palette color with no role of its own, used as the `color` prop. Pick the role from design's component map (@skillsoft/gamut-brand src/migration.ts, COMPONENTS). */ color="navy-300">Faint</Text>
  </Box>
);
