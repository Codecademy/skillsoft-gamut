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
export default defineConfig({
  site: 'https://codecademy.github.io',
  base: process.env.CI ? '/skillsoft-gamut' : '/',
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
