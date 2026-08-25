/**
 * Jet Admin Documentation Sidebar Configuration
 *
 * This file defines the navigation structure for the documentation site.
 */

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'introduction/introduction',
    'tenants/tenants',
    'data-source/data-source',
    'data-query/data-query',
    'listeners/listeners',
    'workflows/workflows',
    'app-pages-widgets/app-pages-widgets',
    'identity-access-management/identity-access-management',
    'platform/architecture',
    'platform/export-import-bundles',
    'platform/folders',
    'platform/widget-library',
  ],
};

export default sidebars;
