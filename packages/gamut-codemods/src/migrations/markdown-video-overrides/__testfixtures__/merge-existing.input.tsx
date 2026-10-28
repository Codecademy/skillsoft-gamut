import { Markdown } from '@codecademy/gamut';
import { Video } from '@codecademy/gamut/Video';

export const Player = () => <Video videoUrl={url} />;
export const Post = ({ text }: { text: string }) => <Markdown text={text} />;
