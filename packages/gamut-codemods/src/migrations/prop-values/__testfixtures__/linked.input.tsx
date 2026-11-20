import { FillButton } from '@skillsoft/gamut';

type Props = { size?: 'small' | 'normal' };

export const Thing = ({ size = 'normal' }: Props) => (
  <FillButton size={size}>Go</FillButton>
);
