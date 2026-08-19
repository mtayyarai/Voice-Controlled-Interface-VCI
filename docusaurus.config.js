// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).

import { themes as prismThemes } from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'VCI — Voice Controlled Interface',
  tagline:
    'The cleanest way to build an AI agent that is wired directly into your application.',
  favicon: 'img/favicon.svg',

  url: 'https://voice-controlled-interface.vercel.app',
  baseUrl: '/',

  organizationName: 'mtayyarai',
  projectName: 'Voice-Controlled-Interface-VCI',

  onBrokenLinks: 'throw',
  onBrokenAnchors: 'warn',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: 'docs',
          editUrl:
            'https://github.com/mtayyarai/Voice-Controlled-Interface-VCI/edit/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      image: 'img/social-card.png',
      metadata: [
        {
          name: 'description',
          content:
            'VCI is a spec for building apps where an AI voice agent is the interface — wired to your domain state through a fixed tool contract.',
        },
        {
          name: 'keywords',
          content:
            'voice interface, AI agent, OpenAI Realtime API, WebRTC, gpt-realtime, voice UI, agent-first UI',
        },
      ],
      navbar: {
        title: 'VCI',
        logo: {
          alt: 'VCI logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'specSidebar',
            position: 'left',
            label: 'Spec',
          },
          {
            to: '/docs/implementation-checklist',
            label: 'Build with an AI coder',
            position: 'left',
          },
          {
            href: 'https://github.com/mtayyarai/Voice-Controlled-Interface-VCI',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Spec',
            items: [
              { label: 'Introduction', to: '/docs/intro' },
              { label: 'Architecture', to: '/docs/architecture' },
              { label: 'Wire protocol', to: '/docs/realtime-protocol' },
              {
                label: 'Implementation checklist',
                to: '/docs/implementation-checklist',
              },
            ],
          },
          {
            title: 'Reference',
            items: [
              {
                label: 'OpenAI Realtime API',
                href: 'https://platform.openai.com/docs/guides/realtime',
              },
              {
                label: 'WebRTC on MDN',
                href: 'https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API',
              },
              {
                label: 'Legacy single-page spec',
                href: 'pathname:///legacy/vci.html',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/mtayyarai/Voice-Controlled-Interface-VCI',
              },
              {
                label: 'DEMO-01',
                href: 'https://youtu.be/2BkAJLVvpi4',
              },
              {
                label: 'DEMO-02',
                href: 'https://youtu.be/xeTy1f6ZuX4',
              },
            ],
          },
        ],
        copyright: `MIT-licensed. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.oneLight,
        darkTheme: prismThemes.oneDark,
        additionalLanguages: ['bash', 'json', 'javascript', 'http'],
      },
      algolia: undefined,
    }),
};

export default config;
