/**
 * Register every authoring package under /marketplace/templates into the
 * database. This is the only bridge between the source folder and runtime:
 * the API/installer read tblMarketplaceItem.payload and
 * tblMarketplaceTemplateAssets, never the filesystem.
 *
 * Usage: node marketplace/scripts/seed-templates.js [slug]
 */
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const { Client } = require("pg");
const {
  listDiskSlugs,
  loadPackageFromDisk,
  listAssetFiles,
  assetMime,
  templateItemSlug,
} = require("../../apps/backend/modules/marketplace/template.package");

const ROOT = path.resolve(__dirname, "..", "..");

function erdFromReadme(readme) {
  const match = String(readme || "").match(/```mermaid\n([\s\S]*?)```/);
  return match ? match[1] : "";
}

async function upsertTemplate(client, pkg) {
  const { manifest } = pkg;
  const payload = {
    template: {
      manifest,
      schemaSql: pkg.schemaSql,
      seedSql: pkg.seedSql,
      datasources: pkg.datasources,
      queries: pkg.queries,
      widgets: pkg.widgets,
      pages: pkg.pages,
      workflows: pkg.workflows,
      listeners: pkg.listeners,
      cronJobs: pkg.cronJobs,
      roles: pkg.roles,
      readme: pkg.readme,
      erd: erdFromReadme(pkg.readme),
      tables: pkg.tables,
    },
  };
  await client.query(
    `INSERT INTO "tblMarketplaceItem"
      ("slug", "itemType", "title", "description", "category", "tags", "icon", "iconColor", "publisher", "version", "payload", "isVerified", "installCount", "sourceFamily", "createdAt", "updatedAt")
     VALUES ($1, 'appTemplate', $2, $3, $4, $5::jsonb, $6, $7, 'jet-admin', $8, $9::jsonb, true, 0, 'marketplace-templates', now(), now())
     ON CONFLICT ("slug") DO UPDATE SET
       "itemType" = EXCLUDED."itemType",
       "title" = EXCLUDED."title",
       "description" = EXCLUDED."description",
       "category" = EXCLUDED."category",
       "tags" = EXCLUDED."tags",
       "icon" = EXCLUDED."icon",
       "iconColor" = EXCLUDED."iconColor",
       "publisher" = EXCLUDED."publisher",
       "version" = EXCLUDED."version",
       "payload" = EXCLUDED."payload",
       "isVerified" = true,
       "sourceFamily" = EXCLUDED."sourceFamily",
       "updatedAt" = now()`,
    [
      templateItemSlug(manifest.slug),
      manifest.name,
      manifest.shortDescription,
      manifest.category,
      JSON.stringify(manifest.tags || []),
      "Boxes",
      manifest.accent || "#2563eb",
      manifest.version,
      JSON.stringify(payload),
    ]
  );
}

async function replaceAssets(client, pkg) {
  const { manifest } = pkg;
  await client.query('DELETE FROM "tblMarketplaceTemplateAssets" WHERE "templateSlug" = $1', [manifest.slug]);
  const assetRoot = path.join(pkg.dir, "assets");
  const files = listAssetFiles(pkg.dir);
  let count = 0;
  for (const file of files) {
    const relative = path.relative(assetRoot, file).replace(/\\/g, "/");
    const content = fs.readFileSync(file);
    await client.query(
      `INSERT INTO "tblMarketplaceTemplateAssets" ("templateSlug", "assetPath", "mimeType", "content", "createdAt")
       VALUES ($1, $2, $3, $4, now())
       ON CONFLICT ("templateSlug", "assetPath") DO UPDATE SET "mimeType" = EXCLUDED."mimeType", "content" = EXCLUDED."content"`,
      [manifest.slug, relative, assetMime(file), content]
    );
    count += 1;
  }
  const demo = path.join(pkg.dir, "seed", "demo-users.csv");
  if (fs.existsSync(demo)) {
    await client.query(
      `INSERT INTO "tblMarketplaceTemplateAssets" ("templateSlug", "assetPath", "mimeType", "content", "createdAt")
       VALUES ($1, 'samples/demo-users.csv', 'text/csv; charset=utf-8', $2, now())
       ON CONFLICT ("templateSlug", "assetPath") DO UPDATE SET "content" = EXCLUDED."content"`,
      [manifest.slug, fs.readFileSync(demo)]
    );
    count += 1;
  }
  return count;
}

async function main() {
  const requested = process.argv.slice(2).filter((value) => !value.startsWith("-"));
  const slugs = requested.length ? requested : listDiskSlugs();
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    for (const slug of slugs) {
      const pkg = loadPackageFromDisk(slug);
      await client.query("BEGIN");
      try {
        await upsertTemplate(client, pkg);
        const assets = await replaceAssets(client, pkg);
        await client.query("COMMIT");
        console.log(
          `+ ${slug}: registered ${pkg.queries.length} queries, ${pkg.pages.length} pages, ` +
            `${pkg.workflows.length} workflows, ${assets} assets`
        );
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
