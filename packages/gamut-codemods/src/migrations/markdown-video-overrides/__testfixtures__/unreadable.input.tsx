import { Markdown } from '@codecademy/gamut';

export const Dynamic = <Markdown text={t} skipDefaultOverrides={options} />;

export const Flagged = <Markdown text={t} skipDefaultOverrides={{ iframe: flag }} />;
