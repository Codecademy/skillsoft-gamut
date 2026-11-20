import { Badge, FillButton, Input, ProgressBar } from '@skillsoft/gamut';

export const Sizes = () => (
  <>
    <FillButton size="md">Normal</FillButton>
    <FillButton size='sm'>Small</FillButton>
    <FillButton size={'lg'}>Large</FillButton>
    <Input size="md" />
    <Input size="sm" />
    <Badge size="md">Label</Badge>
    <ProgressBar size="md" variant="blue" percent={40} />
  </>
);
