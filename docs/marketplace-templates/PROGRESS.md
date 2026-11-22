# Marketplace Templates — Progress

**Scope note:** CRM was the initial delivery. A follow-up request adds three
templates: Customer Support Console, Inventory Replenishment Planner and
Invoice Matching Desk. The remaining original Phase 2 ideas stay deferred, not
failed.

Legend: `[x]` complete · `[~]` in progress · `[ ]` not started · `BLOCKED` unmet with evidence.

## Phase 0 — Discovery

- [x] Marketplace / bundle / export / import inventory
- [x] Prisma installable model inventory
- [x] Data source / query / listener / cron / workflow / widget / page / RBAC / assets inventory
- [x] Tests, scripts, dev DB procedure
- [x] `docs/marketplace-templates/DISCOVERY.md` with Gaps
- [x] `docs/marketplace-templates/DECISIONS.md`

## Phase 1 — Foundation

- [x] Template package schema (manifest + resource formats)
- [x] Deterministic compiler (`marketplace/scripts/generate-templates.js`)
- [x] `templates:validate` + referential/binding validator
- [x] `tblMarketplaceTemplateInstalls` manual migration + Prisma model
- [x] `installTemplate` / `uninstallTemplate` service (ledger, DDL/seed, bundle remap, cron, roles, demo users, compensation)
- [x] Marketplace template API + authenticated static assets endpoint
- [x] Marketplace gallery UI (App templates tab, filters, details, ERD, screenshots, install options, uninstall)
- [x] Opt-in parameterized PostgreSQL binding
- [x] Kanban widget
- [x] Calendar widget
- [x] Foundation unit tests

## Phase 2 — Templates

| # | Template | Package | Validate | Install smoke | Workflows | Roles | Commit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | crm-sales-pipeline | [x] | [x] | [x] | [x] | [x] | `ee548d46` |
| 2 | customer-support-console | [x] | [x] | [x] | [~] Temporal unavailable | [x] | this commit |
| 3 | inventory-replenishment-planner | [~] in progress | — | — | — | — | — |
| 4 | invoice-matching-desk | [ ] not started | — | — | — | — | — |
| 5 | ecommerce-operations | [ ] deferred | — | — | — | — | — |
| 6 | hrms-people | [ ] deferred | — | — | — | — | — |
| 7 | project-management | [ ] deferred | — | — | — | — | — |
| 8 | inventory-warehouse | [ ] deferred | — | — | — | — | — |
| 9 | vendor-procurement | [ ] deferred | — | — | — | — | — |
| 10 | client-portal | [ ] deferred | — | — | — | — | — |
| 11 | finance-invoicing | [ ] deferred | — | — | — | — | — |
| 12 | saas-backoffice | [ ] deferred | — | — | — | — | — |

### CRM evidence

- `npm run templates:validate` — 18 tables, 80 queries, 31 pages, 11 workflows, 8 listeners, 6 cron, 5 roles.
- SQL smoke — 18 tables, 2,390 seed rows, 45 read queries, 0 failures.
- Fresh-tenant install — 342 bundle resources + 16 cron/role resources, no warnings.
- Page read-query smoke — 69 queries, 0 failures; saved-view prefixes fixed; 0 orphan tables and 0 ledger rows after uninstall.
- Workflow smoke (local Temporal task queue) — notify-only, intake triage, threshold sweep, daily digest and expected-failure/recovery complete; approval chain suspends with a data-collection request; 6/6 pass.
- Role smoke — admin/manager/sales_rep/analyst/client expected page and query allow/deny results; demo users and roles removed on uninstall.
- Jest `marketplaceTemplates/templatePackage.test.js` — 5/5 pass.
- Frontend production build — passes.
- Existing suite subset — 166/169 pass; 3 failures are in pre-existing uncommitted curated-marketplace work (`marketplaceSelection.test.js`, `curatedMarketplace.layout.test.js`), not caused by this template.

### Customer Support Console evidence

- `templates:validate` — 18 tables, 78 queries, 31 pages, 11 workflows, 8 listeners, 6 cron, 5 roles, 102 files.
- SQL smoke — 18 tables, 2,640 seed rows, 45 read queries, 0 failures.
- DB registration — 78 queries, 31 pages, 11 workflows, 16 assets in `tblMarketplaceItem` / `tblMarketplaceTemplateAssets`.
- Fresh-tenant install — 357 bundle/install resources, 0 warnings, 18 tables, 31 pages, 78 queries, 5 roles, 6 cron jobs.
- Page read-query smoke — 69 queries, 0 failures; 0 orphan tables and 0 ledger rows after uninstall.
- Role smoke — admin, manager, agent, analyst and readonly all match their page/query/workflow allow-deny matrix; 0 leftover demo users or roles.
- Workflow smoke — **BLOCKED**: no Temporal server is reachable at `temporal:7233` in the current Docker environment. All 11 workflow graphs pass the package validator; re-run `node marketplace/scripts/test-workflows.js customer-support-console` once Temporal is available.

## Phase 3 — Validation

- [x] `templates:validate` CRM
- [x] Referential integrity CRM
- [x] Fresh-tenant install + page query smoke CRM
- [x] Workflow run/log assertions CRM
- [x] Uninstall orphan check CRM
- [x] Role allow/deny tests CRM
- [x] `templates:validate` Customer Support Console
- [x] Fresh-tenant install + page query smoke Customer Support Console
- [x] Uninstall orphan check Customer Support Console
- [x] Role allow/deny tests Customer Support Console
- [ ] Workflow run/log assertions Customer Support Console — blocked on Temporal
- [x] Frontend lint/build for changed files
- [x] `marketplace/README.md` catalogue + authoring guide
- [ ] Full 12-template validation — deferred by explicit user scope change

## Blockers / known limitations

- Widget-level RBAC is not supported; role-specific pages + query permissions are the enforced boundary.
- Modal/drawer widget not implemented; detail pages + tabs are used.
- DataCollection API/webhook delivery not first-class; forms/approval plus REST/webhook listeners are used.
- XLSX export is Excel-compatible CSV; no XLSX runtime exists.
- Existing curated-marketplace tests fail because of pre-existing uncommitted work in the tree; not modified here.
- Workflow execution smoke tests need Temporal at `temporal:7233`. Docker Desktop currently cannot create or remove containers, so the local Temporal stack is unavailable; package validation and all DB-backed tests still run.

### DB-backed runtime correction

- [x] Authoring folder is source/test-only; runtime reads `tblMarketplaceItem.payload` and `tblMarketplaceTemplateAssets`.
- [x] Added manual migration `marketplace_template_assets.sql` and Prisma model.
- [x] Added idempotent `marketplace/scripts/seed-templates.js` (`npm run templates:seed:db`).
- [x] Removed the marketplace folder from the production backend image; reverted Dockerfile/.dockerignore copying.
- [x] Verified DB list/detail/asset reads and a fresh install/uninstall (358 resources) from DB-only package data.
