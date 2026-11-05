import { Box, Text } from '@skillsoft/gamut';

export const Card = ({ active }: { active: boolean }) => (
  <Box bg="surface-default" borderColor={active ? 'border-default' : 'action-primary'}>
    <Text color="text-default" variant="primary">
      Title
    </Text>
    <Text color="action-neutral">Not a variant: secondary is a color here.</Text>
    <Box bg={{ _: 'state-selected', md: 'surface-success' }} />
    <Box textColor={active && 'text-error'} />
    <Box bg="navy" />
    <Box bg="white" color="currentColor" />
  </Box>
);
