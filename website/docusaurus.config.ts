import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '東北IT物産展2025 - AWS画像処理ハンズオン',
  tagline: '2時間で学ぶ実践的なサーバーレス画像処理システム',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://heptagon-inc.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/touhoku-it-2025-hands-on/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'heptagon-inc', // Usually your GitHub org/user name.
  projectName: 'touhoku-it-2025-hands-on', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'jp',
    locales: ['jp'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: false, // ブログ機能を無効化
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },

  themeConfig: {
    // Replace with your project's social card
    image: 'img/ogp/20250913-tohoku-it.png',
    navbar: {
      title: '東北IT物産展2025',
      logo: {
        alt: '東北IT物産展 ロゴ',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'handsonSidebar',
          position: 'left',
          label: 'AWS画像処理ハンズオン',
        },
        {
          href: 'https://tohoku-it-bussanten.com/',
          label: '東北IT物産展',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'ハンズオン',
          items: [
            {
              label: 'AWS画像処理ハンズオン',
              to: '/docs/handson/',
            },
          ],
        },
        {
          title: 'イベント',
          items: [
            {
              label: '東北IT物産展2025',
              href: 'https://tohoku-it-bussanten.com/',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} 東北IT物産展2025. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
