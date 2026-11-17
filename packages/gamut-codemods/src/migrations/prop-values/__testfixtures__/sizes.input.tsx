import { Badge, FillButton, Input, ProgressBar } from '@skillsoft/gamut';

export const Sizes = () => (
  <>
    <FillButton size="normal">Normal</FillButton>
    <FillButton size='small'>Small</FillButton>
    <FillButton size={'large'}>Large</FillButton>
    <Input size="base" />
    <Input size="small" />
    <Badge size="base">Label</Badge>
    <ProgressBar size="medium" variant="blue" percent={40} />
  </>
);
