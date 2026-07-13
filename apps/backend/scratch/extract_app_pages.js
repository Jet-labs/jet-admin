/**
 * Extract app page configs and associated widgets from DB for analysis.
 * Must be run from apps/backend dir with: node scratch/extract_app_pages.js
 */
require('dotenv').config();
const { prisma } = require('../config/prisma.config');

const APP_PAGE_IDS = [
  '7ed1be7d-cbe0-4962-a900-36824d9d42f8',
  '8f370e46-c961-4208-849e-b7fc57edb052',
  '57720bd1-e7b8-40f9-939e-a103de4e5274'
];

async function main() {
  for (const appPageID of APP_PAGE_IDS) {
    console.log('\n' + '='.repeat(80));
    console.log(`APP PAGE: ${appPageID}`);
    console.log('='.repeat(80));

    const appPage = await prisma.tblAppPages.findFirst({
      where: { appPageID }
    });

    if (!appPage) {
      console.log('  NOT FOUND');
      continue;
    }

    console.log(`Title: ${appPage.appPageTitle}`);
    console.log(`Description: ${appPage.appPageDescription || '(none)'}`);
    console.log(`\nappPageConfig:`);
    console.log(JSON.stringify(appPage.appPageConfig, null, 2));

    // Extract widget IDs from the config
    const widgetKeys = appPage.appPageConfig?.widgets || [];
    const widgetIDs = [...new Set(widgetKeys.map(k => {
      const parts = String(k).split('_');
      return parts[1] || '';
    }).filter(Boolean))];

    console.log(`\nWidget keys: ${JSON.stringify(widgetKeys)}`);
    console.log(`Extracted widget IDs: ${JSON.stringify(widgetIDs)}`);

    // Fetch each widget
    for (const widgetID of widgetIDs) {
      const widget = await prisma.tblWidgets.findFirst({
        where: { widgetID }
      });

      if (widget) {
        console.log(`\n--- Widget: ${widget.widgetTitle} (${widget.widgetType}) ---`);
        console.log(`widgetID: ${widget.widgetID}`);
        console.log(`widgetConfig:`);
        console.log(JSON.stringify(widget.widgetConfig, null, 2));
      } else {
        console.log(`\n--- Widget ${widgetID}: NOT FOUND ---`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
