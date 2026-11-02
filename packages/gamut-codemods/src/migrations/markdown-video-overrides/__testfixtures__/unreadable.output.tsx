import { Markdown } from '@codecademy/gamut';
import { MarkdownVideo } from '@codecademy/gamut/Video';

export const Dynamic = <Markdown text={t} skipDefaultOverrides={options} />;

export const Flagged = <Markdown
  text={t}
  skipDefaultOverrides={{ iframe: flag }}
  videoOverride={{
    component: MarkdownVideo
  }} />;
