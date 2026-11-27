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
        'getting-started/quickstart',
        'getting-started/visual-tour',
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
        {
          type: 'category',
          label: 'Applications',
          collapsed: false,
          items: [
            'applications/applications',
            'applications/navigation-and-shell',
            'applications/application-state',
            'applications/application-events',
            'applications/snippets-and-composites',
          ],
        },
        'identity-access-management/identity-access-management',
      ],
    },
    {
      type: 'category',
      label: 'Platform',
      collapsed: false,
      items: [
        'platform/concepts',
        'platform/architecture',
        'platform/modules',
        'platform/feature-list',
        'platform/asset-versioning',
        'platform/folders',
        'platform/export-import-bundles',
        'platform/widget-library',
        'platform/limitations',
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
        'developers/mcp-server',
        'developers/extending-widgets',
        'developers/contributing',
      ],
    },
    {
      type: 'category',
      label: 'Evaluate',
      collapsed: false,
      items: [
        'use-cases/use-cases',
        'comparisons/market-comparison',
      ],
    },
  ],
};

export default sidebars;
