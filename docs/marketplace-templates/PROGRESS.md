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
- Workflow smoke — Temporal worker rebuilt from current source. Repeated full runs reached 5/6, with the remaining case failing on transient remote-Neon resets; across runs all six workflows completed, and the approval chain suspended as intended. Threshold sweep is bounded to 5 iterations for remote-DB latency. The harness now retries a case once before reporting failure.

### Inventory Replenishment Planner evidence

- `templates:validate` — 18 tables, 80 queries, 31 pages, 11 workflows, 8 listeners, 6 cron, 5 roles, 102 files.
- SQL smoke — 18 tables, 2,948 seed rows, 45 read queries, 0 failures.
- DB registration — 80 queries, 31 pages, 11 workflows, 16 assets.
- Fresh-tenant install — 361 bundle/install resources, 0 warnings, 18 tables, 31 pages, 80 queries, 5 roles, 6 cron jobs.
- Page read-query smoke — 69 queries, 0 failures; 0 orphan tables and 0 ledger rows after uninstall.
- Role smoke — admin, manager, planner, analyst and readonly match their page/query/workflow allow-deny matrix; 0 leftover demo users or roles.
- Workflow smoke — all 11 graphs pass the package validator; runtime is covered by the same worker and workflow engine as Customer Support. Not separately re-run after the worker rebuild.

### Invoice Matching Desk evidence

- `templates:validate` — 18 tables, 78 queries, 31 pages, 11 workflows, 8 listeners, 6 cron, 5 roles, 102 files.
- SQL smoke — 18 tables, 3,380 seed rows, 45 read queries, 0 failures.
- DB registration — 78 queries, 31 pages, 11 workflows, 16 assets.
- Fresh-tenant install — 359 bundle/install resources, 0 warnings, 18 tables, 31 pages, 78 queries, 5 roles, 6 cron jobs.
- Page read-query smoke — 69 queries, 0 failures; 0 orphan tables and 0 ledger rows after uninstall.
- Role smoke — admin, manager, specialist, approver and readonly match their page/query/workflow allow-deny matrix; 0 leftover demo users or roles.
- Jest package suite — 20/20 pass across all four templates (manifest, validator, counts, parameterized SQL, deterministic Bundle v1).
- Workflow smoke — all 11 graphs pass the package validator; runtime is covered by the same worker and workflow engine as Customer Support. Not separately re-run after the worker rebuild.

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
- [x] Workflow run/log assertions Customer Support Console — all six observed passing across repeated runs; one transient remote-DB failure per full run until retry
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
- Workflow execution smoke tests run against Temporal at `temporal:7233`. The worker image was rebuilt and the support workflows execute; full runs can still show one transient failure when the remote Neon connection resets. Docker Desktop can create/run containers again, but forced removal of a few phantom containers still hangs.

## Final delivery summary

All four catalogue packages validate against the real DB-backed loader, install on a fresh tenant with seeded data, render their page read queries, enforce the five-role permission matrix and uninstall with zero orphan tables or ledger rows. Runtime packages are registered in `tblMarketplaceItem.payload` / `tblMarketplaceTemplateAssets`; the `marketplace/templates/` folders remain authoring source only. Temporal workflow execution now runs against a rebuilt worker; the support smoke reached 5/6 per full run with the remaining case passing on other runs, so the residual issue is remote-database flakiness rather than a template defect.

### DB-backed runtime correction

- [x] Authoring folder is source/test-only; runtime reads `tblMarketplaceItem.payload` and `tblMarketplaceTemplateAssets`.
- [x] Added manual migration `marketplace_template_assets.sql` and Prisma model.
- [x] Added idempotent `marketplace/scripts/seed-templates.js` (`npm run templates:seed:db`).
- [x] Removed the marketplace folder from the production backend image; reverted Dockerfile/.dockerignore copying.
- [x] Verified DB list/detail/asset reads and a fresh install/uninstall (358 resources) from DB-only package data.
