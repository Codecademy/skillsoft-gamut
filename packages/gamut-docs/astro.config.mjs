import react from '@astrojs/react';
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightSidebarTopics from 'starlight-sidebar-topics';

// Top level maps to Diátaxis modes: Getting started (tutorials), Guides (how-to),
// Components + Patterns + Foundations (reference), Concepts (explanation).
// Patterns catalogs reusable multi-component compositions, one level up from
// Components' single-component reference — see its overview page for what
// qualifies as a pattern versus a one-off composition or a missing prop.
// Each top-level section is its own topic (starlight-sidebar-topics), so its
// sidebar replaces the others instead of all six being stacked in one long list.

// TODO: remove base once DNS for gamut.skillsoft.com is live

// GitHub Pages serves this repo from a subpath, so CI builds are mounted under
// a prefix while local builds stay root-served.
const BASE = process.env.CI ? '/skillsoft-gamut' : '/';

// Astro prefixes the asset URLs it emits and Starlight prefixes the links it
// generates (sidebar, nav, search), but neither touches hrefs authored by hand
// in page content — those stay root-relative and 404 under a subpath. This
// closes that gap. It only sees markdown/MDX content, never component output or
// Starlight's own UI, so it cannot double-prefix what those already handled.
function rehypeBaseUrls() {
  // Empty when BASE is '/', which makes every rewrite below a no-op.
  const prefix = BASE.replace(/\/$/, '');

  const withBase = (value) => {
    if (!prefix || typeof value !== 'string') return value;
    // Leave external, protocol-relative, anchor and already-prefixed URLs be.
    if (!value.startsWith('/') || value.startsWith('//')) return value;
    if (value === prefix || value.startsWith(`${prefix}/`)) return value;
    return prefix + value;
  };

  const srcTags = new Set(['img', 'iframe', 'source', 'video', 'audio']);

  const walk = (node) => {
    if (node.type === 'element' && node.properties) {
      const { properties: props, tagName } = node;
      if (tagName === 'a' && typeof props.href === 'string') {
        props.href = withBase(props.href);
      }
      if (srcTags.has(tagName) && typeof props.src === 'string') {
        props.src = withBase(props.src);
      }
    }
    node.children?.forEach(walk);
  };

  return (tree, file) => {
    walk(tree);
    // Splash hero actions live in frontmatter, which is not part of the content
    // tree, so they have to be reached through Astro's frontmatter handle.
    const actions = file?.data?.astro?.frontmatter?.hero?.actions;
    if (Array.isArray(actions)) {
      for (const action of actions) action.link = withBase(action.link);
    }
  };
}

export default defineConfig({
  site: 'https://codecademy.github.io',
  base: BASE,
  markdown: {
    rehypePlugins: [rehypeBaseUrls],
  },
  server: {
    port: 3333,
  },
  vite: {
    ssr: {
      // CommonJS modules imported with named imports inside @skillsoft/gamut.
      // Vite must bundle (rather than externalize) them during dev SSR to
      // generate the named-export interop; without this the dev server fails
      // with "[vite] Named export '…' not found".
      noExternal: ['react-use'],
    },
  },
  integrations: [
    react(),
    starlight({
      title: 'Gamut',
      description: "Codecademy's design system for the web",
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/Codecademy/skillsoft-gamut',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/Codecademy/skillsoft-gamut/edit/main/packages/gamut-docs/',
      },
      customCss: ['./src/styles/gamut-core-theme.css'],
      plugins: [
        starlightSidebarTopics(
          [
            {
              label: 'Getting started',
              icon: 'rocket',
              link: '/getting-started/installation/',
              items: [{ autogenerate: { directory: 'getting-started' } }],
            },
            {
              label: 'Guides',
              icon: 'open-book',
              link: '/guides/',
              items: [
                { slug: 'guides' },
                { slug: 'guides/building-forms' },
                { slug: 'guides/contributing-to-gamut' },
                { slug: 'guides/creating-a-custom-theme' },
                { slug: 'guides/migrating-to-logical-properties' },
                { slug: 'guides/supporting-dark-mode' },
                { slug: 'guides/theming-your-app' },
                {
                  // `autogenerate` labels nested groups from the raw directory
                  // name, so hyphenated directories (kept short for tooling
                  // and URLs) need their sidebar labels set explicitly here.
                  label: 'Writing UX copy',
                  items: [
                    { slug: 'guides/writing-ux-copy' },
                    { slug: 'guides/writing-ux-copy/accessibility-guidelines' },
                    {
                      label: 'Component guidelines',
                      items: [
                        {
                          autogenerate: {
                            directory:
                              'guides/writing-ux-copy/component-guidelines',
                          },
                        },
                      ],
                    },
                    {
                      slug: 'guides/writing-ux-copy/diy-ux-writing-in-8-steps',
                    },
                  ],
                },
              ],
            },
            {
              label: 'Foundations',
              icon: 'information',
              link: '/foundations/',
              items: [
                { slug: 'foundations' },
                { slug: 'foundations/design-tokens' },
                { slug: 'foundations/eslint-rules' },
                { slug: 'foundations/icon-and-asset-catalog' },
                { slug: 'foundations/layout' },
                { slug: 'foundations/style-helpers' },
                {
                  // See the note above `Writing UX copy` for why this
                  // needs an explicit label instead of a bare autogenerate.
                  label: 'System props',
                  items: [
                    { autogenerate: { directory: 'foundations/system-props' } },
                  ],
                },
                { slug: 'foundations/themes' },
                {
                  label: 'Tooling',
                  items: [
                    { slug: 'foundations/tooling' },
                    {
                      autogenerate: { directory: 'foundations/Tooling/Figma' },
                    },
                    {
                      label: 'Gamut plugin',
                      items: [
                        {
                          autogenerate: {
                            directory: 'foundations/Tooling/gamut-plugin',
                          },
                        },
                      ],
                    },
                  ],
                },
                { slug: 'foundations/typography' },
              ],
            },
            {
              label: 'Components',
              icon: 'puzzle',
              link: '/components/',
              items: [
                {
                  label: 'Overview',
                  slug: 'components',
                },
                {
                  label: 'Actions',
                  items: [
                    { autogenerate: { directory: 'components/actions' } },
                  ],
                },
                {
                  label: 'Containers',
                  items: [
                    { autogenerate: { directory: 'components/containers' } },
                  ],
                },
                {
                  label: 'Inputs & forms',
                  items: [
                    {
                      autogenerate: {
                        directory: 'components/inputs-and-forms',
                      },
                    },
                  ],
                },
                {
                  label: 'Navigation',
                  items: [
                    { autogenerate: { directory: 'components/navigation' } },
                  ],
                },
                {
                  label: 'Feedback',
                  items: [
                    { autogenerate: { directory: 'components/feedback' } },
                  ],
                },
                {
                  label: 'Status',
                  items: [{ autogenerate: { directory: 'components/status' } }],
                },
                {
                  label: 'Overlays',
                  items: [
                    { autogenerate: { directory: 'components/overlays' } },
                  ],
                },
                {
                  label: 'Data display',
                  items: [
                    { slug: 'components/data-display' },
                    { slug: 'components/data-display/bar-chart' },
                    {
                      // See the note above `Writing UX copy` for why this
                      // needs an explicit label instead of a bare autogenerate.
                      label: 'List & Tables',
                      items: [
                        {
                          autogenerate: {
                            directory:
                              'components/data-display/list-and-tables',
                          },
                        },
                      ],
                    },
                    { slug: 'components/data-display/markdown' },
                  ],
                },
                {
                  label: 'Typography',
                  items: [
                    { autogenerate: { directory: 'components/typography' } },
                  ],
                },
                {
                  label: 'Media & assets',
                  items: [
                    {
                      autogenerate: {
                        directory: 'components/media-and-assets',
                      },
                    },
                  ],
                },
                {
                  label: 'Utilities',
                  items: [
                    { autogenerate: { directory: 'components/utilities' } },
                  ],
                },
              ],
            },
            {
              label: 'Patterns',
              icon: 'bars',
              link: '/patterns/',
              items: [{ autogenerate: { directory: 'patterns' } }],
            },
            {
              label: 'Concepts',
              icon: 'document',
              link: '/concepts/',
              items: [{ autogenerate: { directory: 'concepts' } }],
            },
          ],
          {
            // The splash-template homepage has no topic of its own.
            exclude: ['/'],
          }
        ),
      ],
    }),
  ],
});
