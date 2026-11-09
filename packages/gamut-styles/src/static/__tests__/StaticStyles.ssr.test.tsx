/**
 * @jest-environment node
 */
import { renderToString } from 'react-dom/server';

import { GamutProvider } from '../../GamutProvider';
import { skillsoftTheme } from '../../themes';
import { compileRecipe, defineRecipe, StaticStyles } from '..';

const box = defineRecipe({
  className: 'gamut-ssr-box',
  base: { bg: 'surface-default' },
});
const styles = compileRecipe(box);

const Box = () => (
  <>
    <StaticStyles id={box.className} styles={styles} />
    <div className={box.classNames()} />
  </>
);

describe('StaticStyles on the server', () => {
  it('renders the stylesheet inline once, with the nonce', () => {
    const html = renderToString(
      <GamutProvider nonce="abc" theme={skillsoftTheme} useGlobals={false}>
        <Box />
        <Box />
      </GamutProvider>
    );
    const tags = html.match(/<style[^>]*data-emotion="gamut gamut-ssr-box"/g);
    expect(tags).toHaveLength(1);
    expect(html).toContain('nonce="abc"');
    expect(html).toContain('@layer recipes{.gamut-ssr-box{');
  });
});
