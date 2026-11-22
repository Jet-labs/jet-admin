# Marketplace App Templates

Install-ready, data-only application templates for Jet Admin. A template ships
its own database schema, deterministic seed data, datasources, queries,
widgets, pages, workflows, listeners, cron jobs, roles and assets. Installs
reuse the existing **Bundle v1** importer and add a tenant-scoped schema/seed
layer, role provisioning and an install ledger.

## Catalogue

| Template | Category | Tables | Seed rows | Queries | Pages | Workflows | Listeners | Cron | Roles |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `crm-sales-pipeline` | Sales & CRM | 14 | 1,684 | 53 | 19 | 5 | 3 | 2 | 5 |
| `customer-support-console` | Customer Support | 14 | 1,798 | 54 | 19 | 5 | 3 | 2 | 5 |
| `inventory-replenishment-planner` | Inventory & Operations | 16 | 1,972 | 54 | 19 | 5 | 3 | 2 | 5 |
| `invoice-matching-desk` | Finance & Accounting | 14 | 1,738 | 54 | 19 | 5 | 3 | 2 | 5 |

These are deliberately compact demo bundles: four core entities (plus any
referenced lookup entities), one dashboard, core list/detail/create pages, one
report, profile, notifications, settings, a portal and a role matrix. Each
bundle creates exactly **two datasources**: the primary PostgreSQL connection
and one inbound webhook. No second database connector is created.

Customer Support Console, Inventory Replenishment Planner and Invoice Matching
Desk are the second, third and fourth deliveries. The remaining original
template ideas stay deferred.

## What the CRM template includes

- Leads, accounts, contacts and deals with owner, stage and value context.
- Dashboard, core list/detail/create pages, one operations report, profile,
  notifications, settings and a client portal.
- Role matrix page with five Casbin roles and per-page/query/workflow grants.
- Five workflows: intake triage, approval chain, daily digest, data collection
  and expected-failure recovery.
- Three inactive webhook listeners, two disabled cron jobs and two datasources
  (PostgreSQL + inbound webhook).
- Audit triggers, soft delete/restore, comments, attachments, saved views and
  CSV-compatible exports.

## What the Customer Support Console includes

- Customers, subscriptions, payments and tickets with plan, MRR, payment and
  SLA context.
- Ticket queue, detail workspace, customer lookup, payment/subscription history,
  dashboard, one operations report, profile, notifications, settings and a
  client portal.
- Role matrix page with five Casbin roles and per-page/query/workflow grants.
- Five workflows: intake triage, approval chain, daily digest, data collection
  and expected-failure recovery.
- Three inactive webhook listeners, two disabled cron jobs and two datasources
  (PostgreSQL + inbound webhook).
- Audit triggers, soft delete/restore, comments, attachments, saved views and
  CSV-compatible exports.

## What the Inventory Replenishment Planner includes

- Stock items by SKU and warehouse, replenishment proposals, suppliers with
  lead times/reliability, and purchase orders.
- Low-stock queue, proposal workspace, supplier and purchase-order context,
  dashboard, one operations report, profile, notifications, settings and a
  client portal.
- Role matrix page with five Casbin roles and per-page/query/workflow grants.
- Five workflows: intake triage, approval chain, daily digest, data collection
  and expected-failure recovery.
- Three inactive webhook listeners, two disabled cron jobs and two datasources
  (PostgreSQL + inbound webhook).
- Audit triggers, soft delete/restore, comments, attachments, saved views and
  CSV-compatible exports.

## What the Invoice Matching Desk includes

- Invoices with supplier, PO and receipt links, match score, discrepancy count,
  currency, dates and owner.
- Purchase orders, receipts and suppliers for two-way and three-way matching
  context.
- Invoice queue, detail workspace, dashboard, one operations report, profile,
  notifications, settings and a client portal.
- Role matrix page with five Casbin roles and per-page/query/workflow grants.
- Five workflows: intake triage, approval chain, daily digest, data collection
  and expected-failure recovery.
- Three inactive webhook listeners, two disabled cron jobs and two datasources
  (PostgreSQL + inbound webhook).
- Audit triggers, soft delete/restore, comments, attachments, saved views and
  CSV-compatible exports.

## Install

### From the UI

1. Open a tenant → **Marketplace**.
2. Select the **App bundles** section.
3. Open **CRM & Sales Pipeline**.
4. Choose install options:
   - **Include sample data** (default on) loads 1,684-1,972 deterministic rows
     depending on the bundle.
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
`reinstall: true` returns the existing ledger record.

### Uninstall with asset selection

The template detail response includes `install.uninstallPlan`, listing every
installed platform resource and database table. The UI defaults to all assets
selected and lets the operator unselect any page, query, workflow, widget,
listener, role, datasource or table before deleting.

```http
DELETE /api/v1/tenants/:tenantID/templates/crm-sales-pipeline
Content-Type: application/json

{ "assetKeys": ["appPage:<id>", "dataQuery:<id>", "table:tpl_crm_abc123_deals"] }
```

Omitting `assetKeys` performs a full uninstall. A partial uninstall deletes only
the selected assets, drops only the selected tables and keeps the remaining
ledger entries installed. Asset permissions and Casbin policies for deleted
resources are removed; kept assets retain their grants.

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
  specs/<slug>.js                    source spec (deterministic generator input)
  scripts/
    lib/                             generator, compiler, model helpers
    generate-templates.js            npm run templates:generate
    validate-templates.js            npm run templates:validate
    smoke-sql.js                     DDL + seed + read-query smoke (rolled back)
    test-install.js                  install/uninstall smoke
    test-uninstall.js                partial/full uninstall selection smoke
    test-pages.js                    page read-query smoke + orphan check
    test-workflows.js                Temporal workflow smoke
    test-roles.js                    Casbin allow/deny matrix
  templates/<slug>/
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

1. Copy `marketplace/specs/crm-sales-pipeline.js` (or
   `customer-support-console.js`) and change the metadata.
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

- `npm run templates:validate` — passes for CRM, Customer Support, Inventory
  Replenishment and Invoice Matching.
- `npm run templates:seed:db` - registers all four packages and 14 assets each
  in the database.
- CRM: SQL DDL + 1,684 seed rows + 26 read queries - pass in a rolled-back
  transaction; 257 install resources; 14 tables, 19 pages, 53 queries, 5 roles
  and 2 cron jobs.
- Customer Support: SQL DDL + 1,798 seed rows + 26 read queries - pass in a
  rolled-back transaction; 259 install resources; 14 tables, 19 pages,
  54 queries, 5 roles and 2 cron jobs; 49 page queries, 0 failures; 0 orphan
  tables/ledger rows.
- Inventory Replenishment: SQL DDL + 1,972 seed rows + 26 read queries - pass
  in a rolled-back transaction; 261 install resources; 16 tables, 19 pages,
  54 queries, 5 roles and 2 cron jobs.
- Invoice Matching: SQL DDL + 1,738 seed rows + 26 read queries - pass in a
  rolled-back transaction; 261 install resources; 14 tables, 19 pages,
  54 queries, 5 roles and 2 cron jobs.
- Workflows - Customer Support compact bundle: 4/4 runtime cases pass (intake
  triage, approval chain, daily digest, expected-failure recovery). Data
  collection is packaged as the fifth workflow.
- Roles - 5/5 allow/deny matrix pass for all four templates, including portal
  page access and write-query CRUD denial for analyst/readonly roles.
- Uninstall selection - partial uninstall removed one page + one table while
  keeping 253 resources and 13 tables; full uninstall removed the remainder with
  0 orphan tables or ledger rows.
- Jest package tests - 20/20 pass across all four templates.
- Frontend production build - passes.

Known pre-existing repository test failures (not introduced by this work):
`marketplaceSelection.test.js` and `curatedMarketplace.layout.test.js` are
affected by the working tree's existing uncommitted curated-marketplace
changes. They are unrelated to the template packages.

## Platform extensions

- `tblMarketplaceTemplateInstalls` ledger + manual migration.
- `tblMarketplaceTemplateAssets` BYTEA asset store + DB-backed package loader.
- Opt-in PostgreSQL `$n` parameter binding (`dataQueryOptions.parameterized`).
- Bundle v1 now remaps `appPageID` references in listener actions.
- Per-asset query/workflow execution permissions for template roles.
- Generic display-only `kanban` and `calendar` widgets.
- Marketplace template API + authenticated gallery UI (templates tab).
