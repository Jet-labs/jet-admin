# Jet Admin Marketplace App Template — Reusable Implementation Prompt

## Edit only this name

```yaml
TEMPLATE_NAME: "CRM & Sales Pipeline"
```

Change `TEMPLATE_NAME` to the app you want, such as "Helpdesk & Customer Support", "HRMS", "EV & Mobility Fleet Operations", or "Security Operations & Vulnerability Management". No other edits are required for a standard domain template.

Optional: add a short `TEMPLATE_BRIEF` in the same block when the name alone does not express your requirements. For example, `TEMPLATE_BRIEF: "For a dental clinic: appointments, patient records, treatment plans, billing and recall reminders."` Omit it to let the agent infer a complete, domain-appropriate scope. The brief specifies product requirements, not permission to override repository safety, architecture, or verification rules.

### Resolve the template configuration once

- Build **exactly one template**, identified by `TEMPLATE_NAME`. Do not build the example names above, a fixed twelve-template catalogue, or unrelated existing templates.
- Derive a readable lowercase kebab-case `TEMPLATE_SLUG`, category, tags, description, icon concept, entities, workflows, pages, roles and sample data from the name and optional brief. These are agent-resolved values, not additional fields the user must fill in.
- Inspect existing database catalogue records and any authoring manifests/specs first. If the same app already has a stable slug, reuse it rather than creating a duplicate or renaming an installed package. If a derived slug belongs to an unrelated app, select a deterministic disambiguated slug and document the reason.
- Interpret later `<slug>` placeholders as the resolved `TEMPLATE_SLUG`. Store the published template definition in the database, not in `marketplace/templates/<slug>/`. Store its domain scope in `docs/marketplace-templates/<slug>/SCOPE.md` and test/render evidence under that template's documentation directory. Keep shared discovery, decisions, and progress documents intact.
- Infer a substantial, coherent product rather than merely relabeling an existing template. For a broad name, choose a conventional operational scope and document assumptions without asking routine questions. Infer real domain requirements, never unsupported platform capabilities, API contracts or legal/compliance guarantees.
- Before implementation, record the resolved name/slug, domain assumptions, core entities, critical end-to-end journeys and acceptance matrix in `SCOPE.md`. Reuse this identity consistently for generation, references, permissions, tests, docs, assets and commit messages.

Build and verify this complete, installable Marketplace app template for the Jet Admin monorepo. Extend the existing implementation; do not build a parallel marketplace or replace the application architecture.

This is an implementation task, not a request for a proposal. Follow the phases below, preserve existing work, and report completion only against executable evidence.

### Non-negotiable storage architecture — database only at runtime

- The **database is the sole source of truth for published marketplace content**. Reuse `tblMarketplaceItem` for catalogue metadata and its JSONB `payload` for the complete, versioned template definition. Extend the existing model generically where necessary; do not create a second filesystem-backed catalogue.
- All template-specific definitions belong in the database: pages/layouts, widgets, queries/SQL, workflow graphs and supported script bodies, datasource definitions without credentials, listeners, cron jobs, roles, schema/seed instructions, documentation/ERD, email templates and sample files. Binary assets such as icons, covers and screenshots must also be stored in the database, using a compatible asset table with binary content and metadata, not repository paths or externally hosted substitutes.
- This does **not** mean moving Jet Admin's shared React/backend code, widget renderers, connectors, compiler, validators or workflow engine into the database. Those remain ordinary reusable platform source code. Template-specific logic is persisted configuration interpreted by those supported runtimes, not template-specific platform modules or arbitrary executable install hooks.
- `marketplace/` is optional authoring/test scratch space or a source of fixtures for an explicit publish/import operation only. Its presence is not installation or publication. Production list/detail/preview/install/asset/export/uninstall paths must work when that entire directory is absent; no filesystem fallback, startup auto-seeding or runtime dependency on generators/specs is allowed.
- Publication explicitly validates and persists a complete package and its assets. Browsing or installing must never implicitly publish from disk. After publication, deleting or changing an authoring file must not change the published item.
- Existing discovery/decision/progress notes describing repo-served assets or filesystem packages are historical implementation evidence, not permission to keep that architecture. Audit and correct those claims as part of implementation; do not delete existing files or published/installed user work merely to enforce this rule.

## 0. Repository context and safety

### Verified architectural baseline

Recheck these facts before implementation because the working tree may have changed:

- npm workspaces: `apps/*` and `packages/*`; Node.js 20.x in the root engine declaration.
- `apps/backend`: predominantly CommonJS JavaScript, Express 4, PostgreSQL, Prisma, Zod/express-validator, Casbin, Firebase Admin, Socket.IO, Redis integrations, Jest and Supertest. Follow the local module conventions: `<feature>.controller.js`, `<feature>.service.js`, `<feature>.validator.js`, and versioned routes. Do not invent a repository layer where the module does not use one.
- `apps/frontend`: React 18, Vite 5, JavaScript/JSX, React Router 6, TanStack Query, Zustand, Tailwind, shared Radix-based UI, with legacy MUI components also present. Preserve the `src/data`, `src/logic`, and `src/presentation` separation.
- Shared packages own connector contracts/execution, widget contracts/renderers, expression resolution, JSON Forms, workflow nodes/edges, and shared UI. Change the appropriate package rather than duplicating its logic inside an app.
- The active workflow integration uses **Temporal** under `apps/backend/modules/workflow/temporal/`, delegating node execution to `@jet-admin/workflow-nodes-logic`. Do not introduce a pg-boss workflow engine because `pg-boss` appears in dependencies or diagnostic scripts.
- Cron scheduling currently uses **node-cron**, Redis locking when configured, a database occurrence claim, and workflow execution/history. Derive actual timezone and retry behavior from the engine.
- Marketplace and dependency-aware **Bundle v1** import/export already exist. There is no separate top-level application model to assume: app templates are compositions of tenant-scoped pages, widgets, queries, workflows, datasources, listeners, and additional supported resources.
- `UI_GUIDELINES_V3.md` is authoritative for UI work. Use existing semantic tokens and shared components; do not create a second visual system.

### Branch and existing work

The requested target is `dev`. At prompt preparation, the checkout was `release/v2.1.0-preview.1`, with modified and untracked template-related work.

1. Inspect `git status --short --branch`, local branches, applicable `AGENTS.md`, and relevant diffs before editing.
2. Preserve all pre-existing changes. Do not reset, clean, stash, switch branches over a dirty tree, or commit unrelated work.
3. If already on `dev`, continue there. If a safe existing `dev` worktree is available, use it. Otherwise document the branch mismatch and use a safe worktree only if local refs and the required work can be preserved without guessing which uncommitted changes to copy. If that cannot be done, mark branch delivery BLOCKED and continue only independent, non-destructive work in the existing checkout. Never silently claim delivery to `dev`.
4. Existing `docs/marketplace-templates/{DISCOVERY,DECISIONS,PROGRESS}.md`, `marketplace/`, template installer/controller/package files, schema changes, PostgreSQL binding changes, and kanban/calendar additions are **unfinished work to audit**, not proof of completion. Keep them unless concrete evidence requires a targeted correction.
5. Do not print `.env` contents, credentials, tokens, connection strings, or private deployment details in logs or documentation.
6. Database tests must use an explicitly disposable local/test database. Do not infer that the configured `DATABASE_URL` is safe to migrate, seed, or clean. Never reset the configured development/remote database. Prefer repository Docker/bootstrap facilities; if a disposable database cannot be established, mark integration verification BLOCKED.

## 1. Phase 0 — Revalidate discovery before writing template/runtime code

Perform read-only discovery, then update `docs/marketplace-templates/DISCOVERY.md`. Documentation updates are allowed in this phase; no template generation, migrations, installs, or runtime changes yet.

Treat code and tests as authoritative. Existing discovery notes may be stale or describe intended behavior rather than implemented behavior. Include source paths and symbols for every contract; distinguish committed behavior, uncommitted additions, and missing capabilities.

### Required discovery

1. **Marketplace and import/export**
   - Inspect `apps/backend/modules/{marketplace,bundle}/`, `apps/backend/scripts/catalog/curatedMarketplace.js`, `apps/backend/scripts/seed-marketplace.js`, existing bundle files/tests, and frontend marketplace API/components.
   - Document Bundle v1, dependency closure, preview, root metadata (`payload.marketplace.root`), selection, remapping, credential stripping/reconnect, transaction boundaries, and creator permissions.
   - Bundle item types currently include `appPage`, `widget`, `workflow`, `dataQuery`, `datasource`, and `listener`. Do not assume cron jobs, roles, business DDL/seeds, assets, or folders are already imported.
   - Audit existing `template.package.js`, `template.installer.js`, controllers/routes, generators, validators, and the selected template's database record and optional authoring files before deciding what remains. Identify every runtime `fs`/path dependency, including list/detail/install/uninstall/assets, and plan its replacement with database reads. Other templates are reference material, not additional implementation targets.
2. **Database contracts**
   - Read `apps/backend/prisma/schema.prisma` and migration/bootstrap scripts. Inventory required/optional/default fields, unique/index constraints, foreign keys and deletion behavior.
   - Cover `tblTenants`, identity/membership tables, `tblAppPages`, page versions, `tblWidgets`, datasources/queries, listeners/actions/events, cron jobs/history, workflows/nodes/edges/instances/logs/data-collection requests, folders, roles/permission mappings, notifications, audit, vault, marketplace items, template assets and the in-progress template installation ledger. Audit any existing `marketplace_template_assets.sql` migration and Prisma additions rather than creating duplicate asset models; an unapplied migration is not evidence of database-backed runtime support.
   - Do not invent Prisma enums: verify whether statuses and types are string columns. There is no assumed `tblApps`, universal constants table, or universal attachments table.
   - Resolve root/backend Prisma version differences through the existing workspace tooling; do not perform an unrelated Prisma upgrade.
3. **Datasource and query contracts**
   - Inspect `packages/{datasource-types,datasources-logic,datasources-ui}`, connector form/query/listener JSON, backend datasource/query services and `utils/input.util.js`.
   - Derive connector identifiers such as `postgresql`, `restapi`, `webhook`, and `excelcsv`; do not invent SQL/REST/mode enums or `{{secrets.X}}` interpolation.
   - Document encrypted `datasourceOptions`, vault references where supported, secret redaction, reconnect requirements, query input definitions/defaults/coercion, output shape, caching, and invalidation.
   - Audit the uncommitted `parameterized` PostgreSQL path end to end: query engine → registry/wrapper → connector → `pg` argument array. A direct connector test alone does not establish that runtime inputs reach it.
4. **Listeners and cron**
   - Inspect listener ingress, listener-proxy integration where applicable, listener pipeline and action configuration.
   - Verify supported actions such as `transform`, `trigger_workflow`, `trigger_query`, `save_to_buffer`, and `push_to_app_page`; derive conditions/drop behavior from actual code.
   - Do not assume record creation emits a listener event. Trace the real event source, including PostgreSQL NOTIFY or webhook ingress, and its tenant/authentication boundary.
   - Inspect `cronJob/cronJobEngine/engine.js`: schedule validation, invocation target, locking, occurrence claim, retries, history, cancellation and timezone. Cron jobs currently target workflows; queries must be invoked through a workflow when required.
5. **Workflow execution**
   - Inspect Temporal services, DSL, policies, activities, data-collection routes, state projection and shared node handlers.
   - Current handler names include `start`, `end`, `javascript`, `dataQuery`, `condition`, `switch`, `approval`, `delay`, `loop`, `fanout`, `join`, `subWorkflow`, and `dataCollection`. Verify each contract and available edge handles.
   - Document workflow inputs, node configuration, graph format, `ctx` references, `tblWorkflowInstanceLogs` event/output semantics, final output, retries/backoff, timeouts, durable waits, cancellation, and failure paths.
   - Determine actual form/approval submission and API/webhook capabilities. A collection type string in JSON is not an implemented delivery channel.
6. **Widgets, layout and expressions**
   - Inspect `packages/widget-types/src/index.js`, `packages/widgets-ui/src/widget.map.js`, widget configuration editors/sample configs, shared widget logic, page builder and runtime.
   - Inventory every registered widget and its real schema/events/methods. Existing families include Vega/Vega-Lite, table, form, stat, text/HTML, inputs, filters, file upload, tabs, key-value, list, timeline, badge/progress, and media/code. Audit the in-progress kanban/calendar additions.
   - Separate persisted widget types from layout primitives and shared UI components. A Radix dialog component does not automatically make `modal` a persisted widget type.
   - Inspect `apps/frontend/src/logic/appPageRuntime/`, its expression engine, identity handling, action dispatch and URL synchronization, plus `packages/expression-engine/`.
   - Document real layout v1/v2 compatibility and v2 nodes, widget placement keys, variables, datasource aliases, trigger modes and reactive refresh.
   - Document supported page state roots (`state.queries`, `state.workflows`, `state.listeners`, `state.widgets`, `state.variables`, `state.globals`) and exactly which globals are actually populated. Do not assume `user`, `tenant`, `url`, or role globals exist.
   - Use canonical widget placement identity; reused widgets must not bind to ambiguous resource aliases.
   - Backend query safe-path bindings, frontend expressions, workflow `ctx`, listener event bindings, and install-time identifier placeholders are different namespaces. Do not mix them.
7. **Authorization and assets**
   - Inspect `config/permissions*`, `config/casbin.config.js`, auth middleware, tenant role service, `utils/{authorizedProxy,executionContext}.js`, and reference validation.
   - Document global versus tenant roles, exact permission/resource casing, list/read/execute checks, page-origin delegation and direct API behavior.
   - Query/workflow execution must use `authorizedExecuteDataQuery` / `authorizedExecuteWorkflow` with the correct execution context. Never manufacture a system context for a user-initiated request to bypass authorization.
   - Determine whether widget visibility, page navigation filtering, and per-client record access are enforced, not just represented in metadata.
   - Inspect `utils/fileStorage.util.js`, upload routes, local/object storage, asset URLs, ownership and download authorization. Distinguish generic tenant attachment facilities from published marketplace assets: the latter must persist their content in the database and be served from database-backed endpoints.
8. **Testing and bootstrap**
   - Inventory workspace scripts, Jest configuration, integration fixtures, package builds, frontend lint/build, manual migrations and disposable DB setup.
   - Root `npm test` is currently a failing placeholder. Do not present it as the existing suite. Use workspace commands and add intentional root aggregate scripts if useful.
   - Do not assume a TypeScript typecheck command exists in this JavaScript codebase. Run available checks and document genuine toolchain gaps.

End discovery with a **Gaps** table: requirement, implemented support, source evidence, smallest generic extension, tests needed, and blocker if any. Update `DECISIONS.md` with justified decisions; correct earlier notes that weaken requirements without implementing them.

## 2. Phase 1 — Harden the existing template foundation

### 2.1 Database-backed data-only package format and publication

Persist one complete logical package in `tblMarketplaceItem.payload`, preserving Bundle v1 compatibility and root metadata. Define a validated, versioned envelope for any template extensions instead of inventing unsupported Bundle item types. The package contains:

- Manifest: stable ID/slug, name/version, category/tags, short/long descriptions, author/license, platform compatibility, features, asset references, integrations and install options.
- Ordered, idempotent business schema/seed SQL; deterministic install-relative sample data; complete datasource/query/listener/cron/workflow/widget/page/role definitions and dependency metadata.
- README/setup/customization instructions, Mermaid ERD, workflow documentation, email templates and references to database-stored sample files and images.
- `includeSampleData`, `createDemoUsers`, and a clearly explained automation/demo mode where supported.

Required persistence/publication behavior:

- Reuse/audit `marketplace/schema/template.schema.json`, `marketplace/scripts/generate-templates.js`, its libraries and `marketplace/specs/` as optional authoring/test tools only. Extract any runtime compiler/validator dependency into reusable platform code under the appropriate app/package. No runtime import may require files under `marketplace/`.
- Provide an explicit, authorized publish/import operation that validates the complete package and assets, then persists them atomically. A local generator may feed this operation, but generated folders/JSON are not the published store. Default tooling to validation/dry-run; require explicit apply and a verified database target.
- Reuse a compatible database asset model (including existing in-progress work if sound). Store binary bytes, MIME type, byte length, integrity hash and stable identity, with enforceable ownership/reference integrity to the published item/version. Logical asset keys are identifiers, never filesystem locations. Avoid storing large binary blobs as base64 in catalogue list payloads.
- Persist all template-specific content without secrets. Tenant installation resolves credentials through the existing secure connection/reconnect mechanisms, not public catalogue payloads.
- Define immutable published-version or equivalent snapshot semantics. Version and hash the complete definition plus assets; reject silent mutation of an installed version. An install must pin one consistent definition/asset version even during concurrent publication.
- Preserve stable slugs, IDs, existing publications and installed resources. Explicitly import existing selected-template authoring content into the database; do not silently reseed or overwrite user-published records. Keep other templates' behavior intact without retaining a runtime filesystem fallback; record any blocked compatibility work honestly.
- Generation, validation and publication must support selecting the resolved slug. Do not regenerate or overwrite unrelated packages; run catalogue-wide read-only regression checks where appropriate.
- Stable authoring slugs compile to deterministic UUID references when Bundle v1 requires UUIDs. Installed resource IDs are remapped per tenant. Stable authoring IDs must not become shared tenant IDs.
- Use readable, stable-ordered serialization, reproducible fixed-seed fixtures and install-relative dates. No external network, arbitrary module loading or executable package hooks at install time.
- Treat package SQL as privileged, reviewed content accepted only through authorized publication. Database storage does not make SQL trustworthy; do not expose arbitrary uploaded SQL execution as a tenant feature.

### 2.2 Validation and compilation

- Implement real JSON Schema validation using existing AJV support, or the repository's Zod conventions; do not call handwritten shape checks a complete JSON Schema validator.
- Provide `npm run templates:validate`, with a single-template option, and deterministic generation/check commands. Support validation of stored database packages as well as optional authoring fixtures; production validation must not load a local manifest.
- Validate manifests, resource schemas, widget/node/connector registries, graph structure/handles, SQL parameter definitions, permissions, database asset references/content hashes, counts and dependency closure. Reject required repo-relative asset URLs, local file references and missing asset bytes.
- Resolve slug references to Bundle v1 without bypassing existing bundle validation, root metadata or secret stripping.
- Check every binding in the appropriate resolver mode against declared inputs, outputs, aliases, variables, widget placements and supported runtime roots. Validate referenced output fields against declared schemas where possible; exercise dynamic paths at runtime.
- Errors must identify template/version, resource, property path and missing/invalid reference; include an authoring file location only when validating a local fixture.

### 2.3 Installer and uninstaller

Extend the existing marketplace template service and Bundle v1 machinery. Use the project's object-argument convention, for example `installTemplate({ tenantID, slug, options, userID, authContext })`, rather than forcing a conflicting positional API.

Required behavior:

- Load the complete published package and assets from the database, pin its version/hash, then validate platform compatibility, authorization and all dependencies before side effects. Do not call a filesystem package loader, execute a generator, download required assets or fall back to a local directory.
- Tenant-scoped idempotency and concurrent-install locking; repeated same-version installs return the existing successful install without duplication.
- No silent destructive reinstall/version upgrade. Define explicit upgrade/reinstall semantics and preserve existing business data unless an explicit destructive operation is requested.
- Remap all resource IDs, workflow node/edge IDs, widget placement references and bindings that contain remapped identities; verify no authoring UUID remains as a dangling runtime resource.
- Extend Bundle v1 generically where needed for a shared transaction client/import mode. Business DDL/seed, resource creation, cron/roles/permission mappings and the ledger in the same PostgreSQL database must commit atomically. Separate `pg`/Prisma transactions plus best-effort catch cleanup are **not** a transactional installation.
- Keep in-memory Casbin reloads, scheduler/listener activation and other nontransactional effects after commit, with durable reconciliation/ownership for failures and retries. Do not enable outbound integrations during a partially completed install.
- Use the existing ledger/migration work after verifying its schema, ownership and FK behavior; track every created resource and owned database/storage object, installed definition/version/hash and asset ownership. Retain sufficient database-backed installation metadata to uninstall/recover after catalogue unpublication or a newer version is published; never reload an authoring folder for cleanup. Tenant uninstall must not delete shared published catalogue assets or another installation's asset references.
- Generate collision-resistant, PostgreSQL-length-safe tenant/template namespaces. Do not rely only on the first eight UUID characters for isolation. Compile identifier placeholders only from validated package metadata and server-side ownership; runtime values use bound SQL parameters.
- Do not give a tenant-editable datasource unrestricted backend `DATABASE_URL` credentials. Establish a generic least-privilege template-data boundary, scoped connection/role/schema or equivalent, and prove it cannot read/write other tenants or platform authorization tables.
- Uninstall must quiesce automation, cancel/wait for owned runs as appropriate, revoke owned policies/mappings, remove owned versions/history/logs/requests/resources/files and business objects in dependency order, and leave pre-existing/shared resources untouched. Avoid broad `DROP ... CASCADE` without verifying dependency ownership.
- Make uninstall retryable; failure injection and crash/restart recovery must not lose the ownership ledger.
- Seeded domain staff are not login users. `createDemoUsers` must use an existing safe Firebase emulator/invitation/provisioning path if implemented. Otherwise report the option BLOCKED/unavailable; never create fake Firebase IDs and claim working logins. Never enable production demo passwords.

### 2.4 Marketplace API and UI

- Extend `apps/backend/modules/marketplace/`, existing tenant route wiring and permission descriptors. Reuse response envelopes, validation and auth context utilities.
- Extend `apps/frontend/src/data/apis/marketplace.js`, logic hooks, and existing marketplace page/components; do not add a parallel storefront.
- Include category/search filters, template detail, features, page map, actual resource counts, ERD, screenshot previews, integration requirements, install options/progress/errors, installed status and explicit uninstall confirmation. List/detail/preview must query the database, not scan authoring folders. Database changes become visible without rebuilding or redeploying the frontend/backend.
- Distinguish catalog-wide metadata from tenant installation state. Generic app-template install must run the complete template installer, not only its Bundle payload.
- Serve asset bytes from the database through authorized item/version/asset endpoints with safe content types, size limits, integrity checks and appropriate cache/ETag behavior. Validate logical keys, prevent cross-item/version substitution, sanitize or reject active SVG/HTML content, and prevent unauthorized tenant attachment access. Ensure images load through the application's actual authentication mechanism; do not mount `marketplace/` as a static directory or use public caching for private content.
- Export complete definitions and required asset bytes from the database through the existing bundle/export machinery or a compatible generic extension. Export must not reconstruct content from authoring files; re-import into a disposable database must preserve the package and asset integrity without the original checkout.
- Follow `UI_GUIDELINES_V3.md`, keyboard access, responsive states, and shared UI conventions.

## 3. Phase 2 — Complete the selected template

Use the resolved name, brief and `SCOPE.md` to build one domain-specific app. Audit and finish its existing work if present; otherwise create and explicitly publish its database package using the verified foundation. Optional local fixtures are not the deliverable. Do not substitute a renamed generic CRUD scaffold or expand into other templates.

### Derive and implement the domain scope

Create an acceptance matrix mapping each inferred/brief-specified capability to its tables, queries, pages/widgets, automation, roles and tests. Include:

1. **Core records and relationships:** the entities the domain actually manages, their lifecycle/status transitions, lookup data, ownership and validation.
2. **Operational journeys:** complete intake/create → assign/review → process/approve → complete/close flows, plus exceptions, rejection, cancellation and recovery where relevant.
3. **Domain intelligence:** meaningful dashboard KPIs, at least three distinct reports, workload/capacity or financial/quality metrics as appropriate, and notifications/reminders grounded in real records.
4. **Domain-specific views:** pipeline/kanban for staged work, calendar/timeline for scheduled work, maps for geospatial operations, organization/hierarchy views where needed. Add the smallest generic capability when required; do not invent widget types.
5. **Access boundaries:** appropriate admin/manager/staff/viewer roles and external roles only when relevant. External users require real authentication and owner/client-level record isolation. Sensitive HR, financial, customer or security records require explicit least-privilege coverage.
6. **Real integration semantics:** choose relevant connectors, inbound events, file import/export and local demo mocks. Financial amounts, billing recurrence, inventory movements, SLA deadlines and other domain rules must be internally consistent when applicable.

Apply domain-specific safety requirements where relevant: platform impersonation needs a genuine audited implementation, not a page variable; live maps need a local/offline demo path; financial and payroll summaries must distinguish demo computations from legally compliant accounting/payroll processing. Do not add these features to unrelated domains merely because they are mentioned here.

All requirements below apply to the selected template. Conditional domain features must have an explicit applicability decision in `SCOPE.md`; universal requirements must not be silently downgraded to optional.

### Required content

**Data model and seed**

- Target 8–20 normalized business tables, with PK/FK/indexes, real status constraints/lookups, timestamps, sensible soft-delete/restore, and business-row audit. Do not distort the domain to hit a table count; document a justified increase if complete features require it.
- Reuse platform notifications/roles/files/operational history through authorized generic capabilities where appropriate. Do not create fake mirror tables whose screens pretend to control real platform features.
- At least 30–300 realistic rows per core table; appropriate smaller lookup/settings tables; coherent relationships and boundary cases. No lorem ipsum, duplicated metrics, disconnected entities or meaningless random totals.
- README Mermaid ERD plus documented source-of-truth and derived-value rules.

**Datasources and queries**

- Primary PostgreSQL datasource safely scoped to owned business data; REST, inbound webhook/listener, and CSV/file connectors using actual supported types where relevant.
- Document each connection field and secret setup. Local deterministic mocks must support complete demo use without external credentials/network; disconnected production connectors are clearly marked and cannot break every page.
- 30–80 meaningful named queries, covering paginated/filterable/searchable/sortable lists, detail, create/update, soft-delete/restore, bulk actions, lookups, KPIs, time series and export. Increase only with a documented functional reason, not duplicate count padding.
- Values must reach `pg` as parameters, not interpolated SQL strings. Validate/allowlist sorting and limits; quote only server-controlled identifiers. Test nulls, dates, arrays, booleans, JSON and malicious inputs.
- Derive tenant/user/client scope from trusted execution context; callers cannot choose another tenant or owner via an input. Owned physical tables alone do not secure an unrestricted datasource.
- Audit all writes with trustworthy actor provenance, including workflows/imports/bulk actions; pooled connections must not leak actor/session context. Verify write-to-read UI freshness against the existing result cache.

**Pages and widgets**

- At least 12 substantive pages, normally 12–20 major navigation entries. More pages are allowed when entity coverage/admin flows require them; report actual counts, not a filtered count used to evade validation.
- Dashboard: real KPIs/charts, recent activity and current-user tasks.
- List/detail/create-edit flows for every core managed entity; at least three distinct date-filtered reports with CSV export; calendar/kanban where useful; search, profile/notifications and settings.
- Use the supported range intentionally: advanced tables, forms, stats, Vega-Lite charts, detail panels, tabs, filters, timeline/activity, file upload, sanitized rich content, notification UI and generic kanban/calendar/overlay capabilities as needed.
- Table interactions must execute real inline edit, row actions, selection/bulk actions, pagination/filter/sort and conditional formatting; form validation/dependent or multi-step flows must work.
- Reusable filter/status/audit presets; correct layout and action JSON, not invented config fields. All controls must have implemented handlers and visible results.
- Real empty/loading/error states and keyboard-friendly responsive layouts on every page. SVG design previews are allowed as labeled placeholders during development, but production completion requires real browser-rendered screenshots for major pages.

**Administration**

- Role-gated user management, actual role/permission editor, audit filter/diff viewer, settings, flags, validated import/export, integration health, workflow/cron run status/logs/retry where authorized, webhook/API logs and data-quality views.
- Reuse platform-owned admin screens/services by supported navigation or generic runtime actions; do not query/write platform identity or Casbin tables with tenant SQL, and do not substitute editable role metadata for actual permission enforcement.
- Administrative actions must affect their real system of record. A static chart or seeded `job_runs` table is not a working operations monitor.

**Listeners, cron and workflows**

- 5–15 real listeners with working event sources, conditions and existing query/workflow targets: intake, record/status changes, thresholds and SLA-related events as relevant. Document authentication and deduplication.
- 4–10 cron jobs for useful digests, sweeps, reminders, recurrence, cleanup, snapshots/sync. Validate schedules, explicit timezone behavior, occurrence/execution idempotency and DST behavior if local timezones are supported.
- 8–20 domain-specific workflows using implemented handlers: assignment/round-robin, scoring, notification, approval, escalation, synchronization, document generation, data collection, branching and recovery as applicable.
- Complete multi-level approvals with durable waits, authorized approvers, timeout/reject/escalation outcomes; form collection and API/webhook delivery through genuine supported paths. Do not invent `email`, `slack`, `pdf`, or capitalized `DataCollection` node types.
- Notifications/documents must produce real durable output or deterministic local demo delivery; a JavaScript node returning `{ sent: true }` is not notification delivery.
- Use actual Temporal policy semantics for retries/backoff and idempotent effects; error edges must be reachable. Every workflow gets Mermaid documentation, input/output schemas, failure behavior and executable fixtures for relevant success/failure/wait branches.

**Roles, assets and cross-cutting features**

- 4–7 real tenant-scoped roles and an enforced resource matrix for pages, widgets, queries and workflow triggers. No template-admin tenant-wide `*/*` grant merely for convenience. No broad query execution grant as a shortcut for resource permissions.
- UI visibility is not an authorization boundary. Test direct APIs, page-origin delegation and nested workflow/query paths. External/client roles must be restricted at record level as well as tenant level.
- Database-stored icon, cover, page previews/screenshots, email templates and validated sample CSVs; safely provisioned demo identities or an explicit provisioning blocker. Local screenshots may be retained as QA evidence, but marketplace previews must load the published database asset bytes, not evidence paths.
- Audit, restore, CSV import with validation/error reports, **real CSV and XLSX export**, saved views, bulk actions, durable in-app notifications, per-record activity/comments and working attachment upload/download/delete with ownership checks.
- Reuse existing `exceljs`, `json2csv`, storage and sanitization facilities where appropriate. CSV renamed `.xlsx` or described as “Excel-compatible” does not satisfy XLSX export. URLs alone do not satisfy attachment upload.

## 4. Generic extensions only

The template remains data-only. Any missing capability belongs in a reusable platform/package extension with tests and a decision record, never a conditional that special-cases the selected template's slug in platform code.

Examples to evaluate rather than assume complete: end-to-end SQL parameter binding, atomic Bundle import composition, least-privilege template storage, kanban/calendar editing, modal/drawer contracts, widget visibility enforcement, authorized runtime admin actions, file handling, XLSX export, collection delivery, timezone support and offline map rendering.

Minimal means the smallest **working, secure, tested** capability, not a display-only substitute for a required interaction. If unsafe or impossible within the environment, mark the affected requirement BLOCKED; do not redefine “done” in `DECISIONS.md`.

## 5. Validation — evidence required for the selected template

Use existing backend Jest/Supertest and frontend test patterns. Add tests under appropriate `apps/backend/__tests__/{unit,integration}/marketplaceTemplates/` and frontend locations. Existing ad-hoc smoke scripts may help diagnosis but do not replace assertions in the test suite.

1. **Static:** schema validation; registry/schema compatibility; dependency closure; binding roots/paths; graph edges/handles; permission resources; database asset references/bytes/hashes; reproducible generation with no diff where authoring tools are used.
2. **Fresh install:** apply platform migrations/bootstrap to a disposable DB, create a fresh tenant using valid fixtures, install through the real authorized API/service, verify ownership/rows, install again, and race concurrent installs. No duplicates or cross-tenant collisions.
3. **Pages:** run every page's real data sources with seeded inputs, assert expected data shape/non-empty core results, then render every page in the browser and verify no console/network/render errors. SQL-only smoke tests do not prove rendering.
4. **Interactions:** create/edit/soft-delete/restore, pagination/search/sort/filter, saved view restore, bulk actions, CSV validation/error report, CSV/XLSX download parsing, attachments and all main domain flows. Verify loading/error/empty states and keyboard use.
5. **Workflows/listeners/cron:** execute every workflow on the actual Temporal path; submit required human input via supported endpoints; assert terminal state, output, durable side effects and `tblWorkflowInstanceLogs`. Cover rejection, timeout, retry/failure and duplicate delivery. Trigger real listener ingress and cron invocation, not only hand-created workflow calls.
6. **Authorization/isolation:** allowed and forbidden actions for every role, direct API and delegated execution, widget visibility/no payload exposure, two tenants and two external clients. Attempt guessed IDs, forged owner/tenant inputs, SQL injection and cross-tenant datasource access.
7. **Failure/uninstall:** inject failures at schema/seed/import/roles/cron/ledger/activation boundaries; prove rollback/reconciliation. Uninstall and retry it; assert zero owned orphan rows, policies, mappings, versions, histories, logs/requests, triggers/functions, files, active schedules/listeners and running workflow effects. Preserve pre-existing resources and another tenant's install.
8. **Regression:** run applicable workspace suites and builds, frontend lint, and package builds affected by changes. Capture baseline failures separately; do not hide regressions by weakening tests. Run a typecheck only where the workspace actually defines one.
9. **Database-only runtime:** explicitly publish into a disposable database, then launch an isolated runtime artifact/container that omits the entire `marketplace/` directory (do not delete the user's working folder). Prove real API/UI list, search, detail, preview, asset rendering, fresh install, installed-page interactions, export and uninstall work without it. Assert those runtime paths perform no authoring-file reads or fallback. A build that still requires generated packages copied into its image fails this check.
10. **Publication/version/assets:** reject unauthorized publication, invalid/missing assets and broken dependencies without partial rows; verify atomic publication rollback, repeat-publish idempotency, stable-version conflict handling, concurrent publish/install consistency and unchanged bytes after optional authoring files change. Verify asset authorization, content types, size limits, hash/ETag behavior and references. Export/re-import into a second disposable database without source folders; prove catalogue content survives process restart and uninstall/recovery remains possible after unpublication. Shared published assets must survive individual tenant uninstall.

Useful existing commands, to verify before use:

```text
npm run build:packages
npm run seed-marketplace --workspace=backend
npm test --workspace=backend -- --runInBand
npm test --workspace=frontend -- --runInBand
npm run lint --workspace=frontend
npm run build --workspace=frontend
npm run temporal:up
npm run temporal:worker --workspace=backend
```

Do not run catalog seeding or migrations against an unverified configured database. Inspect `apps/backend/scripts/run-manual-migrations.js`, bootstrap scripts, and Compose configuration to establish the disposable test setup first. Runtime prerequisites may include Temporal server/worker, Redis, listener-proxy, Firebase emulator/auth, and storage depending on the exercised path.

Use the environment's supported browser automation. Where repository QA instructions require BrowserSkill, follow that protocol and retain evidence. Do not introduce a second browser stack unnecessarily.

Skipped, unavailable or mocked integration infrastructure is **BLOCKED verification**, not a pass. Local deterministic external-service mocks are legitimate demo fixtures, but do not replace real platform query, authorization, Temporal or rendering paths.

## 6. Execution protocol and deliverables

- Maintain the selected template's section in `docs/marketplace-templates/PROGRESS.md` with a feature-category checklist: database publication/versioning, data/seed, connectors, queries, widgets/pages, admin, listeners, cron, workflows, roles/isolation, database assets, import/export/files, install/uninstall, filesystem-free runtime and regression evidence. Preserve other templates' entries; do not mark them blocked or incomplete just because they are outside this request.
- Record exact commands/results, evidence paths and blocker dependencies. Existing checkmarks must be revalidated if their underlying claims are unproven or contradicted by code.
- Maintain `DECISIONS.md`: context, code evidence, decision, generic extension, security implications and tests. Do not include private deployment configuration.
- Complete the selected template's requirements and validation only. If blocked, record the concrete cause and affected checks, continue independent work within its scope, and mark dependent requirements BLOCKED rather than pretending their foundation is complete. Do not start another template automatically.
- Do not ask routine design questions; choose the code-consistent option and document it. Lack of authorization for destructive actions is not permission to guess: avoid the action and record the blocker.
- Commit only newly implemented, verified, task-owned work. After genuinely completing the selected template, use `feat(marketplace): add <slug> template` (or an accurate update message for an existing template). Keep generic foundation changes in focused commits where possible. Never sweep pre-existing user changes into a commit or commit a template as complete while required checks are blocked.
- Continue until the selected template passes all requirements or every remaining requirement has a concrete unresolved blocker. Large scope or tool budget alone is not evidence that a platform capability is impossible; preserve an honest resumable checkpoint if execution is interrupted.

Final deliverables:

1. One complete, versioned data-only package for `TEMPLATE_NAME` persisted in `tblMarketplaceItem.payload`, with catalogue metadata, README, ERD, workflows and setup/customization instructions, plus all required asset bytes/metadata persisted in the database. An authoring folder alone does not satisfy delivery. If authorized database publication is unavailable, mark that deliverable BLOCKED rather than publishing to an unverified configured database.
2. Existing compiler/validator and explicit publication tooling reused and hardened, plus a database-backed transactional installer/uninstaller with audited ownership/recovery. Platform runtime code must not depend on `marketplace/`.
3. Selected template discoverable/installable through the existing Marketplace UI/API with complete lifecycle management.
4. Required generic platform extensions and automated tests, preserving other templates and their behavior.
5. Updated shared `DISCOVERY.md`, `PROGRESS.md`, and `DECISIONS.md`, plus `docs/marketplace-templates/<slug>/SCOPE.md` and template-specific evidence.
6. Database-backed selected-template catalogue/detail content: actual category/table/page/query/listener/cron/workflow/role counts, install/demo/production setup, compatibility and verification status. Keep implementation/authoring guidance in `docs/marketplace-templates/`; any `marketplace/README.md` is optional authoring documentation, never the catalogue or runtime source of truth.
7. Evidence-backed final summary: resolved name/slug and published version/hash, completed versus blocked requirements, extensions added, executed checks including filesystem-free runtime and export/re-import, known limitations and branch/commit status. Never include secrets or private database connection details.

Do not describe the selected template as production-ready, fully installed, or complete unless its required runtime, security, rendering and uninstall evidence exists. Editing `TEMPLATE_NAME` requests a different app on a future run; it is not authorization to rename, replace or uninstall previously created templates.
