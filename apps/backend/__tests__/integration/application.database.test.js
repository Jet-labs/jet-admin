// Explicit opt-in. All fixtures are rolled back; no existing tenant is modified.
const { Client } = require('pg');
const { randomUUID } = require('crypto');
const { createApplicationDefinition } = require('@jet-admin/application-contracts');
const run = process.env.APPLICATION_DATABASE_TESTS === '1' ? describe : describe.skip;

run('Applications PostgreSQL constraints', () => {
  let client;
  beforeAll(async () => {
    require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
    client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
  }, 30000);
  afterAll(async () => { await client?.end(); });
  it('enforces tenant references, target types, uniqueness and deletion safety in the database', async () => {
    await client.query('BEGIN');
    try {
      const tenantA = randomUUID(), tenantB = randomUUID(), pageA = randomUUID(), pageB = randomUUID(), app = randomUUID();
      await client.query('INSERT INTO "tblTenants" ("tenantID", "tenantTitle") VALUES ($1, $2), ($3, $4)', [tenantA, 'Applications rollback fixture A', tenantB, 'Applications rollback fixture B']);
      await client.query('INSERT INTO "tblAppPages" ("tenantID", "appPageID", "appPageTitle") VALUES ($1, $2, $3), ($4, $5, $6)', [tenantA, pageA, 'Page A', tenantB, pageB, 'Page B']);
      await client.query('INSERT INTO "tblApplications" ("applicationID", "tenantID", title, slug) VALUES ($1, $2, $3, $4)', [app, tenantA, 'Fixture', 'fixture']);
      await client.query('INSERT INTO "tblApplicationDrafts" ("applicationID", "tenantID", definition) VALUES ($1, $2, $3)', [app, tenantA, JSON.stringify(createApplicationDefinition())]);
      const rejected = async (sql, values, code) => {
        await client.query('SAVEPOINT expected_failure');
        try { await expect(client.query(sql, values)).rejects.toMatchObject({ code }); }
        finally { await client.query('ROLLBACK TO SAVEPOINT expected_failure'); }
      };
      const insert = 'INSERT INTO "tblApplicationAssets" ("applicationID", "tenantID", "assetKey", "assetType", "appPageID") VALUES ($1, $2, $3, $4, $5)';
      await rejected(insert, [app, tenantA, 'foreign-page', 'appPage', pageB], '23503');
      await rejected(insert, [app, tenantB, 'foreign-app', 'appPage', pageB], '23503');
      await rejected(insert, [app, tenantA, 'bad-type', 'widget', pageA], '23514');
      await rejected(insert, [app, tenantA, 'no-target', 'appPage', null], '23514');
      await client.query(insert, [app, tenantA, 'page-a', 'appPage', pageA]);
      await rejected(insert, [app, tenantA, 'duplicate-page', 'appPage', pageA], '23505');
      await rejected('DELETE FROM "tblAppPages" WHERE "appPageID" = $1', [pageA], '23503');
      await rejected('UPDATE "tblApplicationAssets" SET "managementMode" = $1 WHERE "applicationID" = $2', ['managed', app], '23514');
      await rejected('UPDATE "tblApplicationDrafts" SET revision = 0 WHERE "applicationID" = $1', [app], '23514');
      const updated = await client.query('UPDATE "tblApplicationDrafts" SET revision = revision + 1 WHERE "applicationID" = $1 AND "tenantID" = $2 AND revision = 1 RETURNING revision', [app, tenantA]);
      expect(updated.rows[0].revision).toBe(2);
      const stale = await client.query('UPDATE "tblApplicationDrafts" SET revision = revision + 1 WHERE "applicationID" = $1 AND "tenantID" = $2 AND revision = 1', [app, tenantA]);
      expect(stale.rowCount).toBe(0);
    } finally { await client.query('ROLLBACK'); }
  }, 30000);
  it('enforces immutable asset version numbering, type, and status', async () => {
    await client.query('BEGIN');
    const rejected = async (sql, values, code) => {
      await client.query('SAVEPOINT expected_failure');
      try { await expect(client.query(sql, values)).rejects.toMatchObject({ code }); }
      finally { await client.query('ROLLBACK TO SAVEPOINT expected_failure'); }
    };
    try {
      const tenant = randomUUID(), asset = randomUUID();
      await client.query('INSERT INTO "tblTenants" ("tenantID", "tenantTitle") VALUES ($1, $2)', [tenant, 'Asset versions rollback fixture']);
      const insert = 'INSERT INTO "tblAssetVersions" ("tenantID", "assetType", "assetID", "versionNumber", "contentHash", payload) VALUES ($1, $2, $3, $4, $5, $6)';
      await client.query(insert, [tenant, 'query', asset, 1, 'a'.repeat(64), JSON.stringify({ sql: 'select 1' })]);
      await rejected(insert, [tenant, 'query', asset, 1, 'b'.repeat(64), JSON.stringify({})], '23505');
      await rejected(insert, [tenant, 'unknown', asset, 2, 'a'.repeat(64), JSON.stringify({})], '23514');
      await rejected('INSERT INTO "tblAssetVersions" ("tenantID", "assetType", "assetID", "versionNumber", "contentHash", payload, status) VALUES ($1, $2, $3, $4, $5, $6, $7)', [tenant, 'query', asset, 2, 'a'.repeat(64), JSON.stringify({}), 'unknown'], '23514');
    } finally { await client.query('ROLLBACK'); }
  }, 30000);
});
