# Marketplace App Templates

Install-ready, data-only application templates for Jet Admin. A template ships
its own database schema, deterministic seed data, datasources, queries,
widgets, pages, workflows, listeners, cron jobs, roles and assets. Installs
reuse the existing **Bundle v1** importer and add a tenant-scoped schema/seed
layer, role provisioning and an install ledger.

## Catalogue

| Template | Category | Tables | Seed rows | Queries | Pages | Workflows | Listeners | Cron | Roles |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `crm-sales-pipeline` | Sales & CRM | 18 | 2,390 | 80 | 31 | 11 | 8 | 6 | 5 |

Only the CRM template is in scope for this delivery. The remaining 11 planned
templates were explicitly deferred by the user.

## What the CRM template includes

- Leads, accounts, contacts, deals, activities, products, quotas and campaigns.
- Deal pipeline (kanban), record calendar, dashboards, three reports, global
  search, profile, notifications, settings and a client portal.
- Admin panel: tenant users, provisioned roles/matrix, audit log with old/new
  JSON, settings and feature flags, CSV import/export, integration health,
  workflow/cron monitors and data-quality checks.
- 11 workflows: intake triage, round-robin assignment, approval chain,
  threshold sweep, daily digest, escalation, integration sync, document
  generation, human data collection, expected-failure recovery and
  notification-only.
- 8 inactive webhook listeners, 6 disabled cron jobs and 5 Casbin roles.
- Audit trigger on every domain and support table, soft delete/restore, CSV
  import with an error summary, comments, attachments and saved views.

## Install

### From the UI

1. Open a tenant → **Marketplace**.
2. Select the **App templates** tab.
3. Open **CRM & Sales Pipeline**.
4. Choose install options:
   - **Include sample data** (default on) loads 2,390 deterministic rows.
   - **Create demo staff directory** creates demo platform users. These are
     not Firebase logins.
   - **Enable automation** enables the packaged cron jobs. Default off.
5. Install. The gallery shows the installed version and an uninstall action.

### From the API

```http
POST /api/v1/tenants/:tenantID/templates/crm-sales-pipeline/install
Authorization: Bearer <firebase-token>
Content-Type: application/json

{
  "options": {
    "includeSampleData": true,
    "createDemoUsers": false,
    "enableAutomation": false
  }
}
```

Other endpoints:

- `GET  /api/v1/tenants/:tenantID/templates`
- `GET  /api/v1/tenants/:tenantID/templates/:slug`
- `DELETE /api/v1/tenants/:tenantID/templates/:slug`
- `GET  /api/v1/tenants/:tenantID/templates/:slug/assets/:assetPath`

Install is idempotent per `(tenantID, slug)`. Re-running without
`reinstall: true` returns the existing ledger record. Uninstall deletes the
ledger, platform resources and the tenant-specific `tpl_*` tables.

### Registering packages in the database

The folder `marketplace/templates/` is **authoring source only**. Runtime reads
from the database:

- `tblMarketplaceItem.payload` — manifest, schema/seed SQL, queries, widgets,
  pages, workflows, listeners, cron jobs, roles, README and ERD.
- `tblMarketplaceTemplateAssets` — icon, cover, screenshots, email HTML and
  sample CSVs as BYTEA.

After applying the manual migrations, register or refresh packages:

```bash
node apps/backend/scripts/run-manual-migrations.js
npm run templates:seed:db
```

The seed script is idempotent. The production backend image does not copy the
authoring folder; it only needs the DB rows.

## Package layout

```
marketplace/
  schema/template.schema.json        JSON Schema for the package
  specs/crm-sales-pipeline.js        source spec (deterministic generator input)
  scripts/
    lib/                             generator, compiler, model helpers
    generate-templates.js            npm run templates:generate
    validate-templates.js            npm run templates:validate
    smoke-sql.js                     DDL + seed + read-query smoke (rolled back)
    test-install.js                  install/uninstall smoke
    test-pages.js                    page read-query smoke + orphan check
    test-workflows.js                Temporal workflow smoke
    test-roles.js                    Casbin allow/deny matrix
  templates/crm-sales-pipeline/
    manifest.json
    README.md
    schema/001-schema.sql
    seed/001-seed.sql
    datasources/datasources.json
    queries/*.json
    widgets/*.json
    pages/*.json
    workflows/*.json
    listeners/listeners.json
    cronjobs/cronjobs.json
    roles/roles.json
    assets/ (icon, cover, screenshots, emails, sample CSVs)
```

At runtime these files are **not** read. `templates:seed:db` copies the package
into `tblMarketplaceItem.payload` and `tblMarketplaceTemplateAssets`; the
installer, gallery and asset endpoint read only those rows.

## How to author a new template

1. Copy `marketplace/specs/crm-sales-pipeline.js` and change the metadata.
2. Define 6–10 domain entities. Each field must use one of the supported types
   (`text`, `longtext`, `email`, `phone`, `url`, `code`, `int`, `money`,
   `decimal`, `bool`, `date`, `timestamptz`, `enum`, `ref`, `json`, `uuid`).
3. Mark four entities `core: true` (they get list/detail/create pages); the
   rest are seeded and available for custom pages.
4. Add enum values, refs to earlier entities or `staff`, and optional `seed`
   functions. Dates are emitted relative to `now()`.
5. Define 4–7 roles with `pageTags`, `queryTags` and `workflowTags`.
6. Run `npm run templates:generate -- <slug>` (or no argument for all specs).
7. Run `npm run templates:validate`.
8. Optionally run `node marketplace/scripts/smoke-sql.js <slug>`, then install
   against a throwaway tenant with `node marketplace/scripts/test-install.js <slug>`.
9. Commit the generated package and the spec together.

### Template rules

- **No secrets in the repo.** The primary PostgreSQL connection is injected by
  the installer from `DATABASE_URL`. Secondary connectors are installed with
  `requiresReconnect` and empty credentials.
- **Parameterized SQL only.** Template queries set `parameterized: true` and use
  `$1…$n` with ordered `inputDefinitions`. Table names use
  `{{table:<logicalName>}}` and are resolved by the installer.
- **Tenant isolation.** Each install gets `tpl_<alias>_<tenantShort>_<table>`
  physical tables. Uninstall drops exactly those tables.
- **Deterministic output.** Stable UUIDs are derived from
  `jet-marketplace-v1:<slug>:<type>:<key>`. The fixed PRNG seed is derived from
  the template slug.
- **Automation is safe by default.** Listeners install inactive and cron jobs
  disabled.

## Validation status

- `npm run templates:validate` — passes.
- `npm run templates:seed:db` — registers the CRM package + 16 assets in the database.
- SQL DDL + 2,390 seed rows + 45 read queries — pass in a rolled-back transaction.
- Fresh-tenant install — 342 bundle resources + 16 cron/role resources.
- Page read-query smoke — 69 queries, 0 failures, 0 orphan tables/ledger rows.
- Workflows — 6/6 tested pass (5 complete, approval suspends as intended).
- Roles — 5/5 allow/deny matrix pass; demo users and roles removed on uninstall.
- Jest package tests — pass.
- Frontend production build — passes.

Known pre-existing repository test failures (not introduced by this work):
`marketplaceSelection.test.js` and `curatedMarketplace.layout.test.js` are
affected by the working tree's existing uncommitted curated-marketplace
changes. They are unrelated to the CRM template.

## Platform extensions

- `tblMarketplaceTemplateInstalls` ledger + manual migration.
- Opt-in PostgreSQL `$n` parameter binding (`dataQueryOptions.parameterized`).
- Bundle v1 now remaps `appPageID` references in listener actions.
- Generic display-only `kanban` and `calendar` widgets.
- Marketplace template API + authenticated gallery UI (templates tab).
