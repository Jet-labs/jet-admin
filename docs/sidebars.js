/**
 * Jet Admin Documentation Sidebar Configuration
 *
 * This file defines the navigation structure for the documentation site.
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    // Introduction
    {
      type: 'category',
      label: '📖 Introduction',
      collapsed: false,
      items: [
        'intro',
        'features/platform-overview',
      ],
    },

    // Getting Started Section
    {
      type: 'category',
      label: '🚀 Getting Started',
      collapsed: false,
      items: [
        'setup/docker-deployment',
        'setup/setup-backend',
        'setup/setup-frontend',
      ],
    },

    // Architecture Section
    {
      type: 'category',
      label: '🏛️ Architecture',
      collapsed: true,
      items: [
        'architecture/backend-architecture',
        'architecture/frontend-architecture',
        'architecture/database-schema',
        'architecture/socket-events',
        'architecture/api-reference',
      ],
    },

    // Features Section - Comprehensive
    {
      type: 'category',
      label: '✨ Features',
      collapsed: true,
      items: [
        'features/platform-overview',
        {
          type: 'category',
          label: 'Data Sources',
          items: [
            'features/datasource/index',
            'features/datasource/datasource-overview',
            'features/datasource/datasource-postgresql',
            'features/datasource/datasource-rest-api',
            'features/datasource/frontend',
          ],
        },
        {
          type: 'category',
          label: 'Data Queries',
          items: [
            'features/data-query/index',
            'features/data-query/data-query-overview',
          ],
        },
        {
          type: 'category',
          label: 'Workflows',
          items: [
            'features/workflow/overview',
            'features/workflow/workflow-nodes',
            'features/workflow/edges',
            'features/workflow/index',
          ],
        },
        {
          type: 'category',
          label: 'Widgets & Dashboards',
          items: [
            'features/widgets/index',
            'features/widgets/charts',
            'features/widgets/widget-workflow-bridge',
            'features/dashboard/overview',
          ],
        },
        {
          type: 'category',
          label: 'User Management',
          items: [
            'features/users/index',
            'features/roles/index',
          ],
        },
      ],
    },

    // Core Concepts Section
    {
      type: 'category',
      label: '💡 Core Concepts',
      collapsed: true,
      items: [
        'concepts/data-flow',
        'concepts/workflow-architecture',
        'concepts/multi-tenancy',
      ],
    },

    // API Reference Section
    {
      type: 'category',
      label: '📡 API Reference',
      collapsed: true,
      items: [
        'api-reference/index',
        'api-reference/authentication',
        'api-reference/websocket',
      ],
    },

    // Developer Guide Section
    {
      type: 'category',
      label: '🛠️ Developer Guide',
      collapsed: true,
      items: [
        'developer/packages-overview',
        'developer/creating-datasource',
        'developer/creating-widget',
        'developer/creating-workflow-node',
      ],
    },

    // Deployment & Operations Section
    {
      type: 'category',
      label: '🚀 Deployment & Operations',
      collapsed: true,
      items: [
        'deployment/production-checklist',
        'logging/index',
      ],
    },

    // Troubleshooting Section
    {
      type: 'category',
      label: '❓ Troubleshooting',
      collapsed: true,
      items: [
        'troubleshooting/troubleshooting',
        'troubleshooting/faq',
      ],
    },

    // Contributing Section
    {
      type: 'category',
      label: '🤝 Contributing',
      collapsed: true,
      items: [
        'contributing',
      ],
    },
  ],
};

export default sidebars;
