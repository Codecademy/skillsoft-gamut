import { Box, Markdown, Video } from '@codecademy/gamut';

export const Post = ({ text }: { text: string }) => <Box><Markdown text={text} /><Video videoUrl="x" /></Box>;
