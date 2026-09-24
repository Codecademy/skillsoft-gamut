import { Box } from '@skillsoft/gamut';
import { Video } from '@skillsoft/gamut/Video';
import { PopoverContainerProps } from '@skillsoft/gamut';
import { theme } from '@skillsoft/gamut-styles';

// eslint-disable-next-line @skillsoft/gamut/no-inline-style
export const Thing = (p: PopoverContainerProps) => <Box style={{}}><Video videoUrl="x" /></Box>;
export const shared = { '@skillsoft/gamut': { singleton: true }, '@skillsoft/gamut-icons': { singleton: true }, '@skillsoft/gamut-illustrations': { singleton: true }, '@skillsoft/gamut-patterns': { singleton: true }, '@skillsoft/gamut-styles': { singleton: true }, '@skillsoft/variance': { singleton: true } };
