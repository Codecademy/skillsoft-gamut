import { Markdown } from '@codecademy/gamut';

export const Off = <Markdown text={t} skipDefaultOverrides={{ iframe: true, video: true }} />;

export const Partial = <Markdown text={t} skipDefaultOverrides={{ a: true, iframe: false }} />;
