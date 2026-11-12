/*
 * @skillsoft/gamut-styles/tokens — the color system as plain data.
 *
 * No Emotion, React or variance: safe to import anywhere. The same tokens ship
 * as CSS (`@skillsoft/gamut-styles/tokens/<brand>.css`, and `tokens.css` for
 * the default brand) and DTCG JSON
 * (`@skillsoft/gamut-styles/tokens/<brand>/{palette,light,dark}.tokens.json`).
 * Each brand's are complete on their own.
 */
export * from './generated/skillsoft/values';
/* Every brand, by name: `brands.originalCodecademy.palette`, `brands.platform.tokensCss`, … */
export * as brands from './generated';
