// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config
import tailwindPlugin from "./plugins/tailwind-config.cjs";
import { themes as prismThemes } from "prism-react-renderer";
const organizationName = "jet-labs";
const projectName = "jet-admin";
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Jet Admin",
  tagline:
    "Welcome to Jet Admin, a web-based PostgreSQL tables manager and admin dashboard for your operations! Edit data, build graphs, and create dashboards using queries.",
  favicon: "img/logo.png",

  // Set the production url of your site here
  // url: 'https://your-docusaurus-site.example.com',
  url: `https://${organizationName}.github.io`,
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  // baseUrl: '/docs/',
  baseUrl: `/${projectName}/`,

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName, // Usually your GitHub org/user name.
  projectName, // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  trailingSlash: false,

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  plugins: [tailwindPlugin],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   // Remove this to remove the "edit this page" links.
        //   editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
        // },
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
    // [
    //   "classic",
    //   /** @type {import('@docusaurus/preset-classic').Options} */
    //   ({
    //     // (...)
    //     docs: {
    //       // (...)
    //       sidebarPath: './sidebars.js',
    //       editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
    //     },
    //     blog: {
    //       showReadingTime: true,
    //       // (...)
    //       editUrl: `https://github.com/${organizationName}/${projectName}/tree/main/`,
    //     },
    //     theme: {
    //             customCss: './src/css/custom.css',
    //           },
    //   }),
    // ],
  ],
  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      colorMode: {
        defaultMode: "light",
        disableSwitch: true,
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: "Jet Labs",
        logo: {
          alt: "Jet Labs Logo",
          src: "img/logo.png",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Tutorial",
          },
          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: "https://github.com/Jet-labs/Jet-admin",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Tutorial",
                to: "/docs/intro",
              },
            ],
          },
          // {
          //   title: 'Community',
          //   items: [
          //     {
          //       label: 'Stack Overflow',
          //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
          //     },
          //     {
          //       label: 'Discord',
          //       href: 'https://discordapp.com/invite/docusaurus',
          //     },
          //     {
          //       label: 'Twitter',
          //       href: 'https://twitter.com/docusaurus',
          //     },
          //   ],
          // },
          {
            title: "More",
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: "GitHub",
                href: "https://github.com/Jet-labs/Jet-admin",
              },
            ],
          },
        ],
        // copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
