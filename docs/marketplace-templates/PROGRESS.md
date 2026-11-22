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
- [x] Marketplace gallery UI (App bundles section, shared search/category/nav, details, ERD, screenshots, install options, uninstall)
- [x] Opt-in parameterized PostgreSQL binding
- [x] Kanban widget
- [x] Calendar widget
- [x] Foundation unit tests

## Phase 2 — Templates

| # | Template | Package | Validate | Install smoke | Workflows | Roles | Commit |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | crm-sales-pipeline | [x] | [x] | [x] | [x] | [x] | `ee548d46` |
| 2 | customer-support-console | [x] | [x] | [x] | [~] flaky infra | [x] | `118b045c` |
| 3 | inventory-replenishment-planner | [x] | [x] | [x] | [~] runtime not separately re-run | [x] | `f7e9a347` |
| 4 | invoice-matching-desk | [x] | [x] | [x] | [~] runtime not separately re-run | [x] | `450ba4dc` |
| 5 | ecommerce-operations | [ ] deferred | — | — | — | — | — |
| 6 | hrms-people | [ ] deferred | — | — | — | — | — |
| 7 | project-management | [ ] deferred | — | — | — | — | — |
| 8 | inventory-warehouse | [ ] deferred | — | — | — | — | — |
| 9 | vendor-procurement | [ ] deferred | — | — | — | — | — |
| 10 | client-portal | [ ] deferred | — | — | — | — | — |
| 11 | finance-invoicing | [ ] deferred | — | — | — | — | — |
| 12 | saas-backoffice | [ ] deferred | — | — | — | — | — |

### CRM evidence (compact demo bundle)

- `npm run templates:validate` — 14 tables, 53 queries, 19 pages, 5 workflows, 3 listeners, 2 cron, 5 roles.
- SQL smoke — 14 tables, 1,684 seed rows, 26 read queries, 0 failures.
- Fresh-tenant install — 257 install resources, 0 warnings, 14 tables, 19 pages, 53 queries, 5 roles, 2 cron jobs, 2 datasources.
- Workflow and page/role runtime not separately re-run after the compact regeneration; package validation and install smoke pass.
- Jest `marketplaceTemplates/templatePackage.test.js` — 20/20 across all four templates.
- Frontend production build — passes.

### Customer Support Console evidence (compact demo bundle)

- `templates:validate` — 14 tables, 54 queries, 19 pages, 5 workflows, 3 listeners, 2 cron, 5 roles, 70 files.
- SQL smoke — 14 tables, 1,798 seed rows, 26 read queries, 0 failures.
- DB registration — 54 queries, 19 pages, 5 workflows, 14 assets in `tblMarketplaceItem` / `tblMarketplaceTemplateAssets`.
- Fresh-tenant install — 259 bundle/install resources, 0 warnings, 14 tables, 19 pages, 54 queries, 5 roles, 2 cron jobs, 2 datasources (PostgreSQL + inbound webhook).
- Page read-query smoke — 49 queries, 0 failures; 0 orphan tables and 0 ledger rows after uninstall.
- Role smoke — admin, manager, agent, analyst and readonly all match their page/query/workflow allow-deny matrix. Portal access is admin/manager only; analyst/readonly are denied write queries. 0 leftover demo users or roles.
- Workflow smoke — 4/4 runtime cases pass (intake triage, approval chain, daily digest, expected-failure recovery). The compact bundle also packages the data-collection workflow.
- Uninstall selection — partial uninstall deleted one page and one table while keeping 253 resources and 13 tables installed; a subsequent full uninstall removed the remainder with 0 orphan tables or ledger rows.

### Inventory Replenishment Planner evidence (compact demo bundle)

- `templates:validate` — 16 tables, 54 queries, 19 pages, 5 workflows, 3 listeners, 2 cron, 5 roles, 70 files.
- SQL smoke — 16 tables, 1,972 seed rows, 26 read queries, 0 failures.
- DB registration — 54 queries, 19 pages, 5 workflows, 14 assets.
- Fresh-tenant install — 261 bundle/install resources, 0 warnings, 16 tables, 19 pages, 54 queries, 5 roles, 2 cron jobs, 2 datasources.
- Workflow graphs pass validation; runtime uses the same engine as Customer Support. Page/role smoke was not separately re-run after the compact regeneration.

### Invoice Matching Desk evidence (compact demo bundle)

- `templates:validate` — 14 tables, 54 queries, 19 pages, 5 workflows, 3 listeners, 2 cron, 5 roles, 70 files.
- SQL smoke — 14 tables, 1,738 seed rows, 26 read queries, 0 failures.
- DB registration — 54 queries, 19 pages, 5 workflows, 14 assets.
- Fresh-tenant install — 261 bundle/install resources, 0 warnings, 14 tables, 19 pages, 54 queries, 5 roles, 2 cron jobs, 2 datasources.
- Workflow graphs pass validation; runtime uses the same engine as Customer Support. Page/role smoke was not separately re-run after the compact regeneration.
- Jest package suite — 20/20 pass across all four templates.
- Uninstall selection — supported for every bundle; see the Customer Support partial/full evidence above.

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
- [x] Partial/full uninstall asset selection Customer Support Console
- [x] Workflow run/log assertions Customer Support Console — compact bundle 4/4 runtime cases pass; data collection packaged as the fifth workflow
- [x] `templates:validate` Inventory Replenishment Planner
- [x] Fresh-tenant install + page query smoke Inventory Replenishment Planner
- [x] Uninstall orphan check Inventory Replenishment Planner
- [x] Role allow/deny tests Inventory Replenishment Planner
- [ ] Workflow run/log assertions Inventory Replenishment Planner — graph validation passes; runtime not separately re-run after the worker rebuild
- [x] `templates:validate` Invoice Matching Desk
- [x] Fresh-tenant install + page query smoke Invoice Matching Desk
- [x] Uninstall orphan check Invoice Matching Desk
- [x] Role allow/deny tests Invoice Matching Desk
- [ ] Workflow run/log assertions Invoice Matching Desk — graph validation passes; runtime not separately re-run after the worker rebuild
- [x] Frontend lint/build for changed files
- [x] `marketplace/README.md` catalogue + authoring guide
- [x] Four-template catalogue validation — CRM, Customer Support, Inventory Replenishment, Invoice Matching
- [ ] Full 12-template validation — deferred by explicit user scope change

## Blockers / known limitations

- Widget-level RBAC is not supported; role-specific pages + query permissions are the enforced boundary.
- Modal/drawer widget not implemented; detail pages + tabs are used.
- DataCollection API/webhook delivery not first-class; forms/approval plus REST/webhook listeners are used.
- XLSX export is Excel-compatible CSV; no XLSX runtime exists.
- Existing curated-marketplace tests fail because of pre-existing uncommitted work in the tree; not modified here.
- Workflow execution smoke tests run against Temporal at `temporal:7233`. The worker image was rebuilt and the compact Customer Support workflows pass 4/4. Docker Desktop can create/run containers again, but forced removal of a few phantom containers still hangs.
- Compact demo bundles intentionally omit the full admin suite, kanban/calendar/search pages and secondary showcase entities. The core workflow, role matrix, audit, portal and CRUD surfaces remain.

## Final delivery summary

All four compact catalogue packages validate against the real DB-backed loader, install on a fresh tenant with seeded data, enforce the five-role permission matrix and uninstall with zero orphan tables or ledger rows. Each bundle creates only two datasources (PostgreSQL + inbound webhook) and 14-16 tables. Uninstall supports asset-level selection: selected pages/queries/workflows/tables are deleted, unselected assets remain installed and the ledger is updated. Customer Support was tested end-to-end, including portal role access and write-query CRUD denial for analyst/readonly roles; its compact workflow smoke passes 4/4. Runtime packages are registered in `tblMarketplaceItem.payload` / `tblMarketplaceTemplateAssets`; the `marketplace/templates/` folders remain authoring source only.

### DB-backed runtime correction

- [x] Authoring folder is source/test-only; runtime reads `tblMarketplaceItem.payload` and `tblMarketplaceTemplateAssets`.
- [x] Added manual migration `marketplace_template_assets.sql` and Prisma model.
- [x] Added idempotent `marketplace/scripts/seed-templates.js` (`npm run templates:seed:db`).
- [x] Removed the marketplace folder from the production backend image; reverted Dockerfile/.dockerignore copying.
- [x] Verified DB list/detail/asset reads and a fresh install/uninstall (358 resources) from DB-only package data.
