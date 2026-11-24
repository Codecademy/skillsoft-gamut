import { Box } from '@skillsoft/gamut';
import { theme } from '@skillsoft/gamut-styles';

export const Thing = () => <Box color={theme.colors.text} />;
export const shared = { '@skillsoft/gamut': { singleton: true }, '@skillsoft/gamut-icons': { singleton: true }, '@skillsoft/gamut-illustrations': { singleton: true }, '@skillsoft/gamut-patterns': { singleton: true }, '@skillsoft/gamut-styles': { singleton: true }, '@skillsoft/variance': { singleton: true } };
