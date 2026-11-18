import { Box, Text } from '@skillsoft/gamut';

export const Card = ({ active }: { active: boolean }) => (
  <Box bg="surface-default" borderColor={active ? 'border-default' : 'action-primary'}>
    <Text color="text-default" variant="primary">
      Title
    </Text>
    <Text color="action-neutral">Not a variant: secondary is a color here.</Text>
    <Box bg={{ _: 'state-selected', md: 'surface-success' }} />
    <Box textColor={active && 'text-error'} />
    <Box /* color-roles: 'navy' is an old palette color with no role of its own, used as the `bg` prop. Pick the role from design's component map (@skillsoft/gamut-brand src/migration.ts, COMPONENTS). */ bg="navy" />
    <Box bg="white" color="currentColor" />
  </Box>
);
