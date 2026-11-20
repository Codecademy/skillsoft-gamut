import { FillButton } from '@skillsoft/gamut';

type Props = { size?: 'sm' | 'md' };

export const Thing = ({ size = 'md' }: Props) => (
  <FillButton size={size}>Go</FillButton>
);
