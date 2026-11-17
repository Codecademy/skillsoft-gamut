import { Alert, InfoTip, Popover, PopoverContainer } from '@skillsoft/gamut';

export const Placement = () => (
  <>
    <Alert iconPosition="left">Heads up</Alert>
    <Popover align="right" beak="left" />
    <PopoverContainer alignment="top-left" />
    <InfoTip alignment="left-center" info="More" />
  </>
);
