/**
 * Seed Open-Data Assets — imports the open (no-key) bundle collection
 * into a tenant. Idempotent: skips bundles whose workflow already exists.
 *
 * Bundles seeded:
 *  - bundles/crypto-intelligence-bundle.json
 *  - bundles/global-knowledge-atlas-bundle.json
 *  - bundles/realtime-events-bundle.json
 *
 * Usage:
 *   cd apps/backend
 *   node scripts/seed-open-assets.js [tenantID] [userID]
 *
 * Defaults target the "First tenant" + primary user when args are omitted.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/prisma.config');
const { bundleService } = require('../modules/bundle/bundle.service');

const TENANT_ID = process.argv[2] || '97ca7876-7c73-4578-bccb-6d56b98a0113';
const USER_ID = process.argv[3] || '1a3ece78-45ae-4a19-8475-3e443e2b01e8';
const AUTH = { authType: 'USER', userID: USER_ID };

const FILES = [
  'crypto-intelligence-bundle.json',
  'global-knowledge-atlas-bundle.json',
  'realtime-events-bundle.json',
];

(async () => {
  try {
    for (const file of FILES) {
      const bundle = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', '..', 'bundles', file), 'utf8')
      );
      const wfTitles = bundle.items
        .filter((i) => i.type === 'workflow')
        .map((i) => i.payload.title);
      let skip = false;
      for (const t of wfTitles) {
        const existing = await prisma.tblWorkflows.findFirst({
          where: { tenantID: TENANT_ID, title: t },
          select: { workflowID: true },
        });
        if (existing) {
          console.log('SKIP', file, '- workflow already exists:', t);
          skip = true;
        }
      }
      if (skip) continue;
      const preview = await bundleService.previewImport({ tenantID: TENANT_ID, bundle });
      console.log('PREVIEW', file, JSON.stringify(preview.summary));
      const result = await bundleService.executeImport({
        tenantID: TENANT_ID,
        userID: USER_ID,
        authContext: AUTH,
        bundle,
      });
      console.log(
        'IMPORTED', file,
        'created:', result.results.length,
        'skipped:', result.skipped.length
      );
    }
  } catch (e) {
    console.error('SEED FAIL', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
