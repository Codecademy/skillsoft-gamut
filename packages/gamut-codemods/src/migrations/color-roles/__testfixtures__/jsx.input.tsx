import { Box, Text } from '@skillsoft/gamut';

export const Card = ({ active }: { active: boolean }) => (
  <Box bg="background-primary" borderColor={active ? 'border-secondary' : 'primary'}>
    <Text color="text" variant="primary">
      Title
    </Text>
    <Text color="secondary">Not a variant: secondary is a color here.</Text>
    <Box bg={{ _: 'background-selected', md: 'background-success' }} />
    <Box textColor={active && 'feedback-error'} />
    <Box bg="navy" />
    <Box bg="white" color="currentColor" />
  </Box>
);
