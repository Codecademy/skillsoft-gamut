import { Markdown } from '@codecademy/gamut';
import { Video, Iframe, MarkdownVideo } from '@codecademy/gamut/Video';

export const Player = () => <Video videoUrl={url} />;
export const Post = ({ text }: { text: string }) => <Markdown
  text={text}
  iframeOverride={{
    component: Iframe
  }}
  videoOverride={{
    component: MarkdownVideo
  }} />;
