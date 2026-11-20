import { FillButton, TextButton } from '@skillsoft/gamut';

export const Ternary = ({ mobile, size }: { mobile: boolean; size: string }) => (
  <>
    <TextButton size={mobile ? 'sm' : 'md'}>Go</TextButton>
    <FillButton size={mobile ? 'sm' : size}>Go</FillButton>
  </>
);
