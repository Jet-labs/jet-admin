/**
 * Jet Admin Documentation Sidebar Configuration
 *
 * Categories follow the build order: introduce → build assets →
 * platform mechanics → operate → integrate.
 *
 * @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'introduction/introduction',
        'getting-started/local-setup',
      ],
    },
    {
      type: 'category',
      label: 'Build',
      collapsed: false,
      items: [
        'tenants/tenants',
        'data-source/data-source',
        'data-query/data-query',
        'listeners/listeners',
        'workflows/workflows',
        'app-pages-widgets/app-pages-widgets',
        'identity-access-management/identity-access-management',
      ],
    },
    {
      type: 'category',
      label: 'Platform',
      collapsed: false,
      items: [
        'platform/architecture',
        'platform/folders',
        'platform/export-import-bundles',
        'platform/widget-library',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      collapsed: false,
      items: [
        'operations/configuration-reference',
        'operations/deployment',
        'operations/observability',
        'operations/security',
      ],
    },
    {
      type: 'category',
      label: 'Developers',
      collapsed: false,
      items: [
        'developers/api-reference',
      ],
    },
  ],
};

export default sidebars;
