import { Box } from '@codecademy/gamut';
import { theme } from '@codecademy/gamut-styles';

export const Thing = () => <Box color={theme.colors.text} />;
export const shared = { '@codecademy/gamut-kit': { singleton: true } };
