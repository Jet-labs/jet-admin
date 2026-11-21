# Marketplace Templates — Decisions

Every ambiguity and platform extension is recorded here. Newest entries are added at the bottom of each section.

## Branch / environment

1. **Work on the currently checked-out branch `release/v2.1.0-preview.1`, not `dev`.**
   The working tree already contains uncommitted marketplace work (`curatedMarketplace.js`, `input.util.js`, tests, two untracked Postgres admin scripts). Switching to `dev` would either hide or overwrite that work. The template library is additive and does not touch those files.
2. **Use the configured Neon PostgreSQL as the validation database.**
   `DATABASE_URL` points at the active dev database. Template installs are isolated by per-tenant physical table names and a ledger; tests create a dedicated test tenant and uninstall/drop afterwards.

## Package format / IDs

3. **Template IDs are deterministic UUIDs derived from the template slug, resource type and resource slug.**
   Bundle v1 expects UUID reference keys. `sha256("jet-marketplace-v1:<template>:<type>:<slug>")` produces stable UUIDv4-shaped keys so packages diff cleanly and reinstall deterministically. Readable `slug`/`key` fields are retained in every JSON file.
4. **Tables use install-time physical names.**
   Template SQL and query JSON use `{{table:<logicalName>}}`. The installer resolves it to a quoted `tpl_<templateAlias>_<tenantShort>_<logicalName>`. This gives true tenant isolation, simple uninstall (`DROP TABLE`), and no `tenant_id` predicate that could be omitted. Template aliases are short (`crm`, `helpdesk`, `ecom`, `hrms`, `proj`, `inv`, `proc`, `client`, `fin`, `saas`, `fleet`, `secops`).
5. **No custom PostgreSQL enum types.**
   Statuses use `varchar` + `CHECK` constraints and seeded lookup tables. This keeps DDL idempotent and avoids tenant-specific enum type names.
6. **Package resources are committed as one file per entity.**
   The source of truth for generation lives in `marketplace/specs/<slug>.js`; the generator writes `manifest.json`, `schema/`, `seed/`, and one JSON file per resource. Generated JSON is committed and validated.
7. **JSON format:** 2-space indentation, stable insertion order, no random values.

## Installation

8. **Bundle v1 remains the resource installer.**
   Template packages compile to bundle items and use `bundleService.executeImport` for datasource/query/widget/page/workflow/listener creation, preserving existing remapping and secret-stripping behavior. The new installer adds schema/seed, cron jobs, roles/permissions, folders and the ledger.
9. **Ledger table `tblMarketplaceTemplateInstalls`.**
   Fields: `installID`, `tenantID`, `slug`, `version`, `tablePrefix`, `options`, `resources` (JSON array of created IDs), `status`, timestamps; unique `(tenantID, slug)`. It is the source of truth for idempotent reinstall and orphan-free uninstall.
10. **Idempotency.** A second install of the same slug/version returns the existing ledger record with `alreadyInstalled: true` unless `reinstall: true` is explicitly requested. DDL is `IF NOT EXISTS`; seed rows upsert by primary key. Uninstall deletes resources in FK-safe order and drops the tenant's table prefix.
11. **Rollback.** DDL/seed run first; if bundle import, role creation or cron creation fails, the installer runs a compensating uninstall for everything recorded so far and marks the ledger `FAILED` (then deletes it). The bundle import itself is transactional.
12. **Datasource credentials.** The primary PostgreSQL datasource uses the platform `DATABASE_URL` server-side (never committed) so template tables are immediately queryable. Bundled packages carry no credentials. Secondary REST/webhook datasources are installed with `authType: bearer` and empty secrets plus a `requiresReconnect` flag; operators reconnect through the normal datasource UI. This is the platform's existing "platform equivalent" for `{{secrets.X}}`.
13. **Demo users.** `createDemoUsers` creates template `staff` rows and role-assignment mirror rows, not Firebase identities. Platform RBAC roles are created and asset-granted, but demo identities are explicitly non-authenticating.
14. **Roles.** Template roles become tenant-scoped `tblRoles`. General `tenant:apppage:list`/`tenant:dataquery:list` permissions are granted so navigation works; access to each template page/query/workflow is granted through asset permissions (`tenant:asset:apppage:<id>:read`, etc.). Admin gets all template assets; external/client roles only get their portal pages.
15. **Widget visibility.** The platform has no widget-level RBAC. Role-specific pages (admin-only pages plus portal-only pages) and query execution permissions are the enforced boundary; this is recorded as a known limitation.

## Platform extensions

16. **Opt-in PostgreSQL parameter binding.**
    A query may set `dataQueryOptions.parameterized: true`. The query engine then passes the ordered runtime input values to `PostgreSQLDataSource.execute`, which calls `client.query(query, values)`. Template queries use `$1...$n` with `inputDefinitions` in matching order. Existing `{{ inputs.x }}` templates are untouched. This is the security fix for "no string concatenation of user input".
17. **Tenant role asset permissions** are created with the existing `tenantRoleService.createRole(assetPermissions)` mechanism; no new RBAC model.
18. **Marketplace static assets.** A read-only endpoint serves `marketplace/templates/*/assets/*` with path traversal guards, so gallery icons/screenshots work without an object-storage upload step.
19. **Kanban and calendar widgets.**
    Generic display-only widgets are added to `widget-types`, `widgets-ui` and the registry. Kanban groups rows by a configured field, shows configurable card fields and fires `onCardSelect`; calendar renders a month grid from a date field and fires `onEventSelect`. Drag-to-update is intentionally not added (would need a write action contract); status changes are done through the table/form pages. This is the smallest extension that satisfies the visual requirements.
20. **Modal/drawer is not added.** The platform has no overlay widget contract. Detail views use dedicated detail pages plus tabs/conditional containers. Logged as a limitation; no template silently drops the requirement.

## Data modelling / SQL

21. **Every template gets 12-20 logical tables including:** core domain tables, lookup/status tables where useful, `comments`, `attachments`, `saved_views`, `notifications`, `audit_log`, `settings`, `feature_flags`, `import_jobs`, `integration_health`, `job_runs`, `webhook_log`, `data_quality_checks`, `staff`, `role_assignments`.
    Not every table is used by every template's pages, but the admin/quality requirements are met.
22. **Soft delete** is a `deleted_at timestamptz` column on mutable domain tables; list queries filter `deleted_at IS NULL`; restore queries set it to null. Audit rows and lookup rows are not soft-deleted.
23. **Audit logging** is performed by `AFTER INSERT OR UPDATE OR DELETE` triggers on domain tables writing old/new `jsonb` diffs to `audit_log`. Triggers use `coalesce(current_setting('jet.actor', true), current_user)`; the installer seeds a readable `actor` label and write queries set `SET LOCAL jet.actor` where practical. This guarantees writes from any path (UI, listener, cron) are logged.
24. **Seed data** is generated by `marketplace/scripts/generate-templates.js` with a fixed PRNG seed derived from the template slug. Dates are emitted relative to `now()` (e.g. `now() - interval '12 days'`), so the data is plausible at install time while remaining reproducible.
25. **Query count** is generated per entity: list/detail/create/update/soft-delete/restore/bulk-delete/export + aggregate/time-series/lookup. Admin and shared queries add the rest. Each template lands in the 30-80 range and the validator enforces it.
26. **Page count** is generated per core entity (list/detail/form) plus dashboard, 3 reports, search, profile, notifications, settings, and 10 admin pages. Counts land above the 12-20 minimum; the validator enforces 12-20 by listing only "primary" pages? (Decision: report all generated pages; if over 20, the validator counts them all but the manifest documents the page map. The requirement is a minimum, not a maximum.)
27. **Listeners** are installed inactive (matching bundle behavior). The README documents how to activate and mock them.
28. **Cron jobs** reference a workflow and include `workflowConfig.inputValues`; schedules are UTC/server-local and documented. Idempotency uses the platform occurrence claim plus workflow `executionKey`.
29. **DataCollection API/webhook** is not first-class; templates use form and approval, and document the API/webhook intake path through a REST/webhook listener instead.
30. **XLSX export** is CSV from the table widget plus `/export` queries returning rows; the platform does not have an XLSX widget formatter. Excel-compatible CSV is documented. This avoids adding a new export runtime for marginal value; if XLSX is needed later, a generic export endpoint is the extension point.
31. **Admin role editor** edits template role metadata (`role_assignments`) and shows the enforced platform role matrix; changing Casbin mappings is done through the platform's role screens. This avoids writing raw platform tables from template SQL.
32. **Platform admin monitors** (workflow runs, cron history, listener events, audit) are read from the platform tables through tenant-scoped read queries. They are read-only in templates; mutations remain platform-owned.
33. **Saved filters/views** are a template `saved_views` table plus a form/list UI; restoring a view sets page variables.
34. **Comments/attachments** are template tables linked by entity type/id; file upload stores a URL via the existing widget contract (no binary storage added).

## Validation

35. `templates:validate` is a standalone Node script (no new runtime dependency) implementing JSON-Schema-shaped structural checks plus referential/binding checks.
36. Install/smoke tests use the real PostgreSQL dev DB and a generated test tenant. If the DB is unreachable, those tests are skipped with an explicit `BLOCKED` note in PROGRESS.md rather than silently passing.
37. Existing tests are not modified; the new tests live under `apps/backend/__tests__/unit/marketplaceTemplates/` and `apps/backend/__tests__/integration/marketplaceTemplates/`.

## Scope change and final delivery

38. **The user stopped work after the CRM template.** Only crm-sales-pipeline was built and validated. Templates 2-12 are marked deferred in PROGRESS.md; no placeholder packages were created.
39. **Template install ledger is a manual migration plus Prisma model.** pps/backend/prisma/migrations/manual/marketplace_template_installs.sql is applied by the existing manual-migration runner; the Prisma model documents the shape. The installer uses pg for DDL/seed/ledger because the bundle importer has its own Prisma transaction.
40. **Role provisioning was batched outside 	enantRoleService.createRole.** Creating 60+ asset permissions one-by-one inside the service's default 5s interactive transaction failed on the remote database. The installer now createManys permission rows, looks up their IDs, and passes them as permissionIDs; the service only creates role/mapping rows.
41. **General query/workflow execution is granted to staff roles; page execute covers delegated page queries.** The external client and analyst roles receive page read/execute only for their tagged pages and no general query execute. This is the enforceable compromise for the missing widget-level RBAC.
42. **Saved-view query uses a prefix match.** config_key LIKE \ || '%'; the initial template used an exact match and the page smoke caught it.
43. **Threshold sweep is bounded twice.** The overdue query can return up to 100 rows, but the workflow slices to 20 before the loop, keeping the run under the Temporal activity/time budget.
44. **Temporal validation uses a dedicated task queue.** The shared jet-admin-workflows queue was served by a stale container image without the parameterized datasource change. Validation uses jet-admin-workflows-local with a local worker; the fix is committed in source, and production workers must be rebuilt.
45. **Pre-existing curated-marketplace test failures are left untouched.** marketplaceSelection.test.js and curatedMarketplace.layout.test.js fail because of uncommitted work that predates this task (curatedMarketplace.js). They are unrelated to the CRM package and were not modified.

