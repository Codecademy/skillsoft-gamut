import { Box, Markdown } from '@skillsoft/gamut';
import { Video, Iframe, MarkdownVideo } from '@skillsoft/gamut/Video';

export const Post = ({ text }: { text: string }) => <Box><Markdown
  text={text}
  iframeOverride={{
    component: Iframe
  }}
  videoOverride={{
    component: MarkdownVideo
  }} /><Video videoUrl="x" /></Box>;
