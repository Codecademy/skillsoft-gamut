import { Background, Box } from '@skillsoft/gamut';

export const Panel = ({ muted }: { muted: boolean }) => (
  <Background bg="background">
    <Box borderColor="border-primary" color={muted ? 'text-disabled' : 'text'} />
    <Box bg="shadow-primary" />
    <Box bg="background-contrast" />
  </Background>
);
