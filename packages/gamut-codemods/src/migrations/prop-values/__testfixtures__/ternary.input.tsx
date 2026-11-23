import { FillButton, TextButton } from '@skillsoft/gamut';

export const Ternary = ({ mobile, size }: { mobile: boolean; size: string }) => (
  <>
    <TextButton size={mobile ? 'small' : 'normal'}>Go</TextButton>
    <FillButton size={mobile ? 'small' : size}>Go</FillButton>
  </>
);
