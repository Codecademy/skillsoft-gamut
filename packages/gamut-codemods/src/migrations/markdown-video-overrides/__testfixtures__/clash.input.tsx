import { Markdown } from '@codecademy/gamut';
import { Iframe } from './local/Iframe';

export const Post = ({ text }: { text: string }) => <Markdown text={text} />;
