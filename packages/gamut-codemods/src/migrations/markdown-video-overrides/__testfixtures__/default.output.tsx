import { Markdown } from '@codecademy/gamut';
import { Iframe, MarkdownVideo } from '@codecademy/gamut/Video';

export const Post = ({ text }: { text: string }) => <Markdown
  text={text}
  iframeOverride={{
    component: Iframe
  }}
  videoOverride={{
    component: MarkdownVideo
  }} />;
