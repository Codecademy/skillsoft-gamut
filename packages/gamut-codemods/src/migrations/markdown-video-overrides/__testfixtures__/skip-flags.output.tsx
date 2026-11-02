import { Markdown } from '@codecademy/gamut';
import { Iframe, MarkdownVideo } from '@codecademy/gamut/Video';

export const Off = <Markdown text={t} iframeOverride={undefined} videoOverride={undefined} />;

export const Partial = <Markdown
  text={t}
  skipDefaultOverrides={{
    a: true
  }}
  iframeOverride={{
    component: Iframe
  }}
  videoOverride={{
    component: MarkdownVideo
  }} />;
