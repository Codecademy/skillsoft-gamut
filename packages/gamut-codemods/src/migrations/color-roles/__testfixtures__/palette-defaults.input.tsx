import { Box, Text } from '@skillsoft/gamut';

export const Status = () => (
  <Box bg="red-500" borderColor="green-700">
    <Text color="red">Failed</Text>
    <Text textColor="green-400">Passed</Text>
    <Box bg="white" borderColor="white-300" />
    <Box bg="navy-100" />
    <Box bg="navy-800" />
    <Text color="navy-800">Heading</Text>
    <Box borderColor="navy-500" />
    <Text color="navy-300">Faint</Text>
  </Box>
);
