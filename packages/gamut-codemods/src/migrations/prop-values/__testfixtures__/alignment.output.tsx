import { Alert, InfoTip, Popover, PopoverContainer } from '@skillsoft/gamut';

export const Placement = () => (
  <>
    <Alert iconPosition="start">Heads up</Alert>
    <Popover align="end" beak="start" />
    <PopoverContainer alignment="top-start" />
    <InfoTip alignment="start-center" info="More" />
  </>
);
