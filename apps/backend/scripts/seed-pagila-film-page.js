/**
 * Seed Pagila Film Catalog page — full-featured table grid demo on PagilaDb.
 *
 * Creates (via bundle import): PagilaDb datasource template (if you don't
 * already have one), 10 Pagila data queries, 1 bulk-update workflow,
 * 15 widgets and the "Pagila Film Catalog" app page.
 *
 * Behavior:
 *  - Idempotent: exits early if an app page titled "Pagila Film Catalog"
 *    already exists in the tenant.
 *  - Reuses YOUR existing "PagilaDb" datasource when present (imported
 *    queries are re-pointed to it and the placeholder is removed).
 *  - Otherwise keeps the imported datasource row — open it in the UI and
 *    paste your Postgres connection string (it imports with empty creds).
 *
 * Usage:
 *   cd apps/backend
 *   node scripts/seed-pagila-film-page.js [tenantID] [userID]
 *
 * After seeding:
 *   1. Datasources → PagilaDb → Test connection (reconnect if needed).
 *   2. Data Queries → run "Pagila — Film List (paged)" once to verify.
 *   3. App Pages → open "Pagila Film Catalog".
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/prisma.config');
const { bundleService } = require('../modules/bundle/bundle.service');
const { removePoliciesForResource } = require('../config/casbin.config');

const TENANT_ID = process.argv[2] || '97ca7876-7c73-4578-bccb-6d56b98a0113';
const USER_ID = process.argv[3] || '1a3ece78-45ae-4a19-8475-3e443e2b01e8';
const AUTH = { authType: 'USER', userID: USER_ID };
const PAGE_TITLE = 'Pagila Film Catalog';
const DATASOURCE_TITLE = 'PagilaDB';

(async () => {
  try {
    // ── 0. Idempotency: page already seeded? ──────────────────────────────
    const existingPage = await prisma.tblAppPages.findFirst({
      where: { tenantID: TENANT_ID, appPageTitle: PAGE_TITLE },
      select: { appPageID: true },
    });
    if (existingPage) {
      console.log('SKIP — app page already exists:', PAGE_TITLE, existingPage.appPageID);
      return;
    }

    // ── 1. Remember a pre-existing Pagila datasource (reuse, don't dup) ───
    // Title match is case-insensitive (PagilaDb / PagilaDB / pagila).
    const preExisting = await prisma.tblDatasources.findFirst({
      where: { tenantID: TENANT_ID, datasourceTitle: { equals: DATASOURCE_TITLE, mode: 'insensitive' } },
      select: { datasourceID: true, datasourceType: true, datasourceTitle: true },
    });
    if (preExisting) {
      console.log('FOUND existing datasource:', DATASOURCE_TITLE, preExisting.datasourceID);
    } else {
      console.log('No existing PagilaDb datasource — bundle placeholder will be kept (reconnect it after import).');
    }

    // ── 2. Import the bundle ──────────────────────────────────────────────
    const bundlePath = path.join(__dirname, '..', '..', '..', 'bundles', 'pagila-film-catalog-bundle.json');
    const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8'));
    const preview = await bundleService.previewImport({ tenantID: TENANT_ID, bundle });
    console.log('PREVIEW', JSON.stringify(preview.summary));
    const result = await bundleService.executeImport({
      tenantID: TENANT_ID,
      userID: USER_ID,
      authContext: AUTH,
      bundle,
    });
    console.log('IMPORTED created:', result.results.length, 'skipped:', result.skipped.length);
    if (result.warnings && result.warnings.length) {
      console.log('WARNINGS:', result.warnings);
    }

    const importedDatasource = result.results.find((r) => r.type === 'datasource');
    const importedQueries = result.results.filter((r) => r.type === 'dataQuery');

    // ── 3. Re-point to the pre-existing datasource when there is one ──────
    if (preExisting && importedDatasource) {
      if (preExisting.datasourceType !== 'postgresql') {
        console.log('KEEP imported datasource — existing PagilaDb is not postgresql:', preExisting.datasourceType);
      } else {
        await prisma.tblDataQueries.updateMany({
          where: { dataQueryID: { in: importedQueries.map((q) => q.newID) } },
          data: { datasourceID: preExisting.datasourceID },
        });
        console.log('RE-POINTED', importedQueries.length, 'queries to existing PagilaDb.');
        await prisma.tblDatasources.delete({ where: { datasourceID: importedDatasource.newID } });
        await removePoliciesForResource(TENANT_ID, `datasource:${importedDatasource.newID}`).catch(() => {});
        console.log('REMOVED imported placeholder datasource.');
      }
    }

    const page = result.results.find((r) => r.type === 'appPage');
    console.log('DONE — open App Pages →', PAGE_TITLE, page ? `(${page.newID})` : '');
    if (!preExisting) {
      console.log('NEXT: Datasources → PagilaDb → paste your Postgres connection string → Test connection.');
    }
  } catch (e) {
    console.error('SEED FAIL', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
