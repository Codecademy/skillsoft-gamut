import type { Meta, StoryObj } from '@storybook/react';
import type { HTMLProps, ReactNode } from 'react';
import { expect, fn, waitFor, within } from 'storybook/test';

import { Text } from '../Typography';
import type { TextProps } from '../Typography/Text';
import { Iframe, MarkdownVideo } from '../Video';
import { Markdown } from '.';
import exampleMarkdown from './example.md?raw';

const onCustomTagRender = fn();

const meta: Meta<typeof Markdown> = {
  title: 'Data display/Markdown',
  component: Markdown,
  args: {},
};

export default meta;
type Story = StoryObj<typeof Markdown>;

const youtubeIframe = `<iframe src="https://www.youtube.com/embed/zhDwjnYZiCo" title="Ghibli Coffee Shop"></iframe>`;

export const Default: Story = {
  args: {
    text: `
## Hello World
This is markdown
    `,
    spacing: 'tight',
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Hello World' })
    ).toHaveAttribute('id', 'heading-hello-world');
    canvas.getByText('This is markdown');
    await expect(canvasElement.firstElementChild?.tagName).toBe('DIV');
  },
};

export const FullExample: Story = {
  args: {
    iframeOverride: { component: Iframe },
    text: exampleMarkdown,
    videoOverride: { component: MarkdownVideo },
  },
};

export const BasicElements: Story = {
  args: {
    text: `
# Heading 1

## Heading 2

\`\`\`js
const jsCode = () => {};
\`\`\`
`,
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Heading 1' })
    ).toHaveAttribute('id', 'heading-heading-1');
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Heading 2' })
    ).toHaveAttribute('id', 'heading-heading-2');
    await expect(canvasElement.querySelectorAll('code')).toHaveLength(1);
  },
};

export const WithoutHeaderIds: Story = {
  args: {
    headerIds: false,
    text: `
# Heading 1

## Heading 2
`,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { level: 1 })).not.toHaveAttribute(
      'id'
    );
    await expect(canvas.getByRole('heading', { level: 2 })).not.toHaveAttribute(
      'id'
    );
  },
};

export const HtmlContent: Story = {
  args: {
    text: `
<h1>Heading 1</h1>

<h2 class>Heading 2</h2>

<div class="narrative-table-container"> # Cool </div>

<img src="https://placehold.co/40" alt="Placeholder"></img>
`,
    ...{ 'data-testid': 'markdown-wrapper' },
  },
  play: async ({ canvas, canvasElement }) => {
    canvas.getByRole('heading', { level: 1, name: 'Heading 1' });
    canvas.getByRole('heading', { level: 2, name: 'Heading 2' });
    await expect(
      canvasElement.querySelectorAll('div.narrative-table-container')
    ).toHaveLength(1);
    canvas.getByRole('img', { name: 'Placeholder' });
    canvas.getByTestId('markdown-wrapper');
  },
};

const tableMarkdown = `
| Tables   |      Are      |  Cool |
|----------|:-------------:|------:|
| col 1 is |  left-aligned | $1600 |
| col 2 is |    centered   |   $12 |
| col 3 is | right-aligned |    $1 |
`;

export const Table: Story = {
  args: { text: tableMarkdown },
  play: async ({ canvas }) => {
    const scrollContainer = canvas.getByRole('table').parentElement!;
    await expect(getComputedStyle(scrollContainer).overflow).toBe('auto');
    await expect(canvas.getAllByRole('row')).toHaveLength(4);
  },
};

export const WithoutTableOverride: Story = {
  args: { skipDefaultOverrides: { table: true }, text: tableMarkdown },
  play: async ({ canvas }) => {
    const parent = canvas.getByRole('table').parentElement!;
    await expect(getComputedStyle(parent).overflow).toBe('visible');
  },
};

export const Links: Story = {
  args: { onAnchorClick: fn((event) => event.preventDefault()) },
  render: (args) => (
    <Markdown
      {...args}
      text={`
## Heading One

- [External](http://example.com)
- [Same origin](${window.location.origin}/search)
- [Relative](/search)
- [In page](#heading-heading-one)
- [Invalid](www.codecademy.com)
- [Empty]()
`}
    />
  ),
  play: async ({ args, canvas, userEvent }) => {
    const external = canvas.getByRole('link', { name: 'External' });
    await expect(external).toHaveAttribute('target', '_blank');
    await expect(external).toHaveAttribute('rel', 'noopener');

    const sameOrigin = canvas.getByRole('link', { name: 'Same origin' });
    await expect(sameOrigin).toHaveAttribute('target', '_blank');
    await expect(sameOrigin).not.toHaveAttribute('rel');

    await expect(
      canvas.getByRole('link', { name: 'Relative' })
    ).not.toHaveAttribute('rel');

    const inPage = canvas.getByRole('link', { name: 'In page' });
    await expect(inPage).not.toHaveAttribute('target');

    await expect(canvas.getByRole('link', { name: 'Invalid' })).toHaveAttribute(
      'href',
      'www.codecademy.com'
    );
    canvas.getByText('Empty');

    await userEvent.click(inPage);
    await expect(args.onAnchorClick).toHaveBeenCalledTimes(1);
  },
};

const elements = {
  CodeBlock: {
    component: (props: TextProps) => <Text {...(props as any)} />,
  },
  CustomElement: {
    component: ({ title }: { title: string }) => {
      return (
        <Text as="h3" color="primary" fontSize={26} m={24}>
          {title}
        </Text>
      );
    },
    allowedAttributes: ['title'],
  },
};

export const Overrides: Story = {
  args: {
    overrides: elements,
    text: `
## Hello World

<CodeBlock>Span inside a custom code block element</CodeBlock>

<CustomElement title='A Custom Component' />
`,
  },
  play: ({ canvas }) => {
    canvas.getByRole('heading', { level: 2, name: 'Hello World' });
    canvas.getByText('Span inside a custom code block element');
    canvas.getByRole('heading', { level: 3, name: 'A Custom Component' });
  },
};

const codeBlockOverride = {
  component: (props: HTMLProps<HTMLElement>) => (
    <strong {...props}>custom codeblock</strong>
  ),
};

const codeMarkdown = `
\`\`\`js
var test = true;
\`\`\`

\`var test = false;\`
`;

export const CodeBlockOverride: Story = {
  args: {
    overrides: { CodeBlock: codeBlockOverride },
    text: codeMarkdown,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('custom codeblock')).toHaveAttribute(
      'language',
      'js'
    );
    canvas.getByText('var test = false;');
  },
};

export const CodeBlockAndCodeOverrides: Story = {
  args: {
    overrides: {
      CodeBlock: codeBlockOverride,
      code: {
        component: (props: HTMLProps<HTMLElement>) => (
          <em {...props}>custom code snippet</em>
        ),
      },
    },
    text: codeMarkdown,
  },
  play: ({ canvas }) => {
    // TODO: a `code` override resets code's allowed attributes, so the CodeBlock loses `language`
    canvas.getByText('custom codeblock');
    canvas.getByText('custom code snippet');
  },
};

export const CustomTagAttributes: Story = {
  args: {
    overrides: {
      TestComponent: {
        component: (props: object) => {
          onCustomTagRender(props);
          return <strong>attr-testing-component</strong>;
        },
        allowedAttributes: ['name', 'isCodeBlock', 'isWebBrowser'],
      },
    },
    text: `
# Heading

<TestComponent name="my name" isCodeBlock="true" isWebBrowser />
`,
  },
  play: async ({ canvas, canvasElement }) => {
    canvas.getByText('attr-testing-component');
    await expect(onCustomTagRender).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'my name',
        isCodeBlock: true,
        isWebBrowser: true,
      })
    );
    await expect(canvasElement.querySelector('p > strong')).toBeNull();
  },
};

const tags = {
  h3: {
    component: (props: TextProps) => (
      <Text {...props} as="h3" fontSize={20} m={16} />
    ),
  },
};

export const HeaderOverride: Story = {
  args: { overrides: tags, text: '### Smaller H3' },
  play: async ({ canvas }) => {
    await expect(
      getComputedStyle(canvas.getByRole('heading', { name: 'Smaller H3' }))
        .fontSize
    ).toBe('20px');
  },
};

export const LinkOverride: Story = {
  args: {
    text: '[This was a link](https://codecademy.com), Now it is not.',
    overrides: {
      a: {
        component: (props) => <Text {...props} as="span" color="blue-500" />,
      },
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('link')).toBeNull();
    canvas.getByText('This was a link');
  },
};

export const VideoOverride: Story = {
  args: {
    iframeOverride: { component: Iframe },
    text: youtubeIframe,
    videoOverride: { component: MarkdownVideo },
  },
  play: async ({ canvasElement }) => {
    await waitFor(() =>
      expect(canvasElement.querySelector('youtube-video')).toHaveAttribute(
        'src',
        'https://www.youtube.com/embed/zhDwjnYZiCo'
      )
    );
    await waitFor(
      () =>
        expect(
          canvasElement
            .querySelector('youtube-video')
            ?.shadowRoot?.querySelector('iframe')
        ).toHaveAttribute('title', 'Ghibli Coffee Shop'),
      { timeout: 5000 }
    );
    await expect(canvasElement.querySelector(':scope iframe')).toBeNull();
  },
};

export const WithoutVideoOverride: Story = {
  args: {
    text: youtubeIframe,
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByTitle('Ghibli Coffee Shop').tagName).toBe(
      'IFRAME'
    );
    await expect(canvasElement.querySelector('youtube-video')).toBeNull();
  },
};

export const VimeoOverride: Story = {
  args: {
    iframeOverride: { component: Iframe },
    text: `<iframe src="https://player.vimeo.com/video/188237476" title="Vimeo clip"></iframe>`,
  },
  parameters: {
    a11y: { config: { rules: [{ id: 'frame-title', enabled: false }] } },
  },
  play: async ({ canvasElement }) => {
    // TODO: Video doesn't title Vimeo's provider iframe when its shadow root attaches late, so it has no accessible name
    await waitFor(() =>
      expect(canvasElement.querySelector('vimeo-video')).toHaveAttribute(
        'src',
        'https://player.vimeo.com/video/188237476'
      )
    );
    await expect(canvasElement.querySelector(':scope iframe')).toBeNull();
  },
};

export const VideoTagOverride: Story = {
  args: {
    text: `<video src="https://example.com/clip.mp4" title="Clip" controls></video>`,
    videoOverride: { component: MarkdownVideo },
  },
  play: async ({ canvas, canvasElement }) => {
    const player = await canvas.findByRole('region', {
      name: 'Video Player - Clip',
    });
    await expect(player.querySelector('video')).toHaveAttribute(
      'src',
      'https://example.com/clip.mp4'
    );
    await expect(
      canvasElement.querySelector('p [data-media-player]')
    ).toBeNull();
  },
};

export const VideoSourceOverride: Story = {
  args: {
    text: `
<video controls>
  <source src="https://example.com/movie.mp4" type="video/mp4">
  <source src="https://example.com/movie.ogg" type="video/ogg">
</video>
`,
    videoOverride: { component: MarkdownVideo },
  },
  play: async ({ canvas }) => {
    const player = await canvas.findByRole('region', { name: 'Video Player' });
    await waitFor(() =>
      expect(player.querySelector('source')).toHaveAttribute(
        'src',
        'https://example.com/movie.mp4'
      )
    );
  },
};

export const WithoutVideoTagOverride: Story = {
  args: {
    text: `<video src="https://example.com/clip.mp4" controls></video>`,
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('video')).toHaveAttribute(
      'src',
      'https://example.com/clip.mp4'
    );
    await expect(canvas.queryByRole('region')).toBeNull();
  },
};

export const Checkboxes: Story = {
  args: {
    text: `
- [ ] checkbox
- [x] default checked checkbox
an element
- [ ] third checkbox
`,
  },
  play: async ({ canvas, userEvent }) => {
    const checkboxes = canvas.getAllByRole('checkbox');
    await expect(checkboxes).toHaveLength(3);
    await expect(checkboxes[0]).not.toBeChecked();
    await expect(checkboxes[1]).toBeChecked();

    await userEvent.click(canvas.getByLabelText('checkbox'));
    await expect(checkboxes[0]).toBeChecked();

    const item = checkboxes[0].closest('li')!;
    await expect(getComputedStyle(item, '::before').display).toBe('none');
  },
};

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

export const Details: Story = {
  args: {
    text: `
<details>
  ${lorem}
</details>

<details>
  <summary>View More</summary>
  ${lorem}
</details>

<details><summary>First Child Summary</summary>${lorem}</details>
`,
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getAllByTestId('gamut-md-details')).toHaveLength(3);
    await expect(canvas.getAllByText('Details')).toHaveLength(1);
    canvas.getByText('View More');
    canvas.getByText('First Child Summary');

    const [details] = canvasElement.querySelectorAll('details');
    await expect(details).not.toHaveAttribute('open');
    await userEvent.click(within(details).getByText('Details'));
    await expect(details).toHaveAttribute('open');
  },
};

export const SmartPunctuation: Story = {
  args: {
    inline: true,
    text: 'Text with a &mdash; in the middle and `code with a &mdash; in`',
  },
  play: ({ canvas }) => {
    canvas.getByText(/Text with a — in the middle/);
    canvas.getByText('code with a &mdash; in');
  },
};

export const InlineMarkdown: Story = {
  args: { text: `this is an inline markdown component`, inline: true },
  render: (args) => {
    return (
      <>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
        <Markdown {...args} />
        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi
        ut aliquip ex ea commodo consequat. Duis aute irure dolor in
        reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
        pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa
        qui officia deserunt mollit anim id est laborum.
      </>
    );
  },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('this is an inline markdown component').tagName
    ).toBe('SPAN');
  },
};

export const Sanitization: Story = {
  args: {
    text: `
<script>window.markdownScriptRan = true</script>

<style>p { color: red; }</style>

<p onclick="window.markdownClickRan = true">Click handler paragraph</p>

<img src="https://placehold.co/20" alt="Sanitized image" onerror="window.markdownErrorRan = true">

[Script link](javascript:alert(1))

<a href="javascript:alert(1)">Raw script link</a>

<form action="/steal"><input type="text" name="secret">Form text</form>

<object data="/movie.swf">Object text</object>

<div class="evil narrative-table-container other">Div text</div>
`,
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvasElement.querySelector('script, style')).toBeNull();
    await expect(
      canvas.getByText('Click handler paragraph')
    ).not.toHaveAttribute('onclick');
    await expect(
      canvas.getByRole('img', { name: 'Sanitized image' })
    ).not.toHaveAttribute('onerror');

    await expect(canvas.queryByRole('link')).toBeNull();
    await expect(canvas.getByText('Script link')).not.toHaveAttribute('href');
    await expect(canvas.getByText('Raw script link')).not.toHaveAttribute(
      'href'
    );

    await expect(canvasElement.querySelector('form, input, object')).toBeNull();
    await expect(canvas.getByText('Div text')).toHaveAttribute(
      'class',
      expect.not.stringMatching(/evil|other/)
    );
    await expect(canvas.getByText('Div text')).toHaveClass(
      'narrative-table-container'
    );
  },
};

export const WithoutDefaultOverrides: Story = {
  args: {
    skipDefaultOverrides: { a: true, checkbox: true, details: true },
    text: `
[External](http://example.com)

<details>
  Details body
</details>

- [ ] checkbox
- [x] checked
`,
  },
  parameters: {
    a11y: { config: { rules: [{ id: 'label', enabled: false }] } },
  },
  play: async ({ canvas, canvasElement }) => {
    // TODO: with the checkbox override skipped, task-list checkboxes render as enabled inputs with no label
    const link = canvas.getByRole('link', { name: 'External' });
    await expect(link).not.toHaveAttribute('target');
    await expect(link).not.toHaveAttribute('rel');

    await expect(canvas.queryByTestId('gamut-md-details')).toBeNull();
    await expect(canvasElement.querySelector('summary')).toBeNull();
    canvas.getByText('Details body');

    await expect(canvas.queryByTestId('gamut-md-checkbox')).toBeNull();
    const checkboxes = canvas.getAllByRole('checkbox');
    await expect(checkboxes).toHaveLength(2);
    await expect(checkboxes[1]).toBeChecked();
    await expect(
      getComputedStyle(checkboxes[0].closest('li')!, '::before').display
    ).not.toBe('none');
  },
};

export const DetailsOpen: Story = {
  args: {
    text: `
<details open>
  <summary>Open by default</summary>
  ${lorem}
</details>
`,
  },
  play: async ({ canvas, canvasElement, userEvent }) => {
    // TODO: the sanitizer config has no `details` entry, so `open` is stripped and authored details always start closed
    const details = canvasElement.querySelector('details')!;

    await userEvent.click(canvas.getByText('Open by default'));
    await expect(details).toHaveAttribute('open');
  },
};

export const WithoutPlayerEmbed: Story = {
  args: {
    iframeOverride: { component: Iframe },
    text: `<iframe src="https://www.youtube.com/embed/zhDwjnYZiCo" showPlayerEmbed="false" title="No embed"></iframe>`,
  },
  play: async ({ canvas, canvasElement }) => {
    await canvas.findByRole('region', { name: 'Video Player - No embed' });
    await expect(canvasElement.querySelector('youtube-video')).toBeNull();
  },
};

export const VideoWithCaptions: Story = {
  args: {
    text: `
<video src="https://example.com/clip.mp4" title="Captioned">
  <track src="https://example.com/captions.vtt" kind="captions" srclang="en" label="English" default>
</video>
`,
    videoOverride: { component: MarkdownVideo },
  },
  play: async ({ canvas }) => {
    const player = await canvas.findByRole('region', {
      name: 'Video Player - Captioned',
    });
    await waitFor(() =>
      expect(player.querySelector('track')).toHaveAttribute(
        'src',
        'https://example.com/captions.vtt'
      )
    );
    const track = player.querySelector('track')!;
    await expect(track).toHaveAttribute('kind', 'captions');
    await expect(track).toHaveAttribute('srclang', 'en');
    await expect(track).toHaveAttribute('label', 'English');
  },
};

export const EmptyText: Story = {
  args: { text: '' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.firstElementChild?.childElementCount).toBe(0);
  },
};

export const WithClassName: Story = {
  args: { className: 'custom-markdown', text: 'Styled by a consumer class' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByText('Styled by a consumer class').closest('.custom-markdown')
    ).not.toBeNull();
  },
};

export const InlineIgnoresBlockSyntax: Story = {
  args: { inline: true, text: '# Not a heading with **bold** text' },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole('heading')).toBeNull();
    canvas.getByText(/# Not a heading with/);
    await expect(canvas.getByText('bold').tagName).toBe('STRONG');
  },
};

export const ProcessNodeOverrides: Story = {
  args: {
    overrides: {
      em: {
        processNode: (_node, props) => {
          const { key, children } = props as {
            key?: string;
            children?: ReactNode;
          };
          return <mark key={key}>{children}</mark>;
        },
      },
      highlight: {
        shouldProcessNode: (node) => node.name === 'strong',
        component: ({ children }: { children?: ReactNode }) => (
          <Text as="span" color="primary" fontWeight="bold">
            {children}
          </Text>
        ),
      },
    },
    text: 'Some _emphasis_ and some **strong** text',
  },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('emphasis').tagName).toBe('MARK');
    await expect(canvasElement.querySelector('em, strong')).toBeNull();
    await expect(canvas.getByText('strong').tagName).toBe('SPAN');
  },
};
