# Comprehensive Applications QA — run log and bug register

**Date:** 2026-11-24  
**Goal:** Run the full local stack and build one retained comprehensive Application through BrowserSkill only, exercising every Application asset type and supported functionality.

## Environment

| Service | Status | Notes |
| --- | --- | --- |
| Docker | Running | Docker Desktop started from the launcher/CLI. |
| Redis | Running | Host port 6379 exposed by a compose fix below. |
| Temporal | Running | Server and UI healthy after PostgreSQL recovery. |
| App PostgreSQL container | Running | Backend uses the configured Neon database, not this container. |
| Frontend | Vite on 5173 | Running. |
| Backend | Node on 8090 | Restarted with the publish transaction fix. |
| Listener proxy | 8095 | Running directly (the `node --watch` dev script was unstable on Windows). |
| Temporal worker | Local | Running against Temporal 7233. |

## QA Application

| Field | Value |
| --- | --- |
| Application | Comprehensive Platform Showcase |
| Application ID | `746573f0-6c87-4d04-8efc-e6eb3374377a` |
| Draft revision | 12 |
| Release | Release 2, hash `ab75c210460e`, 9 page versions, no release diagnostics |
| Linked pages | 9 referenced pages: order-desk, risk-desk, treasury-close, incident-room, supply-planner, event-lab, integration-observatory, sla-desk, subscription-retention |
| Routes | `/orders`, `/risk`, `/treasury`, `/incidents`, `/supply`, `/events`, `/integrations`, `/sla`, `/subscriptions`, nested `/orders/:orderID` |
| Home route | `order-desk` |
| Not-found route | `incidents` |
| Guard | `integrations` requires `state.application.variables.allowIntegrations === true`, redirects to `incidents` |
| Keep-alive | `risk` |
| URL sync | `sla` (`syncAllPageVariables`) |
| App state | `allowIntegrations: boolean = true` |

The application is retained; it must not be deleted after testing.

## Bug register

### BUG-001 — Redis unreachable from local dev processes

- **Severity:** High (blocks listener/workflow bus locally)
- **Symptom:** Backend and listener proxy logged continuous `redis:client:error`; local Redis port 6379 was not published by `docker-compose.yml`.
- **Fix:** Added `${REDIS_HOST_PORT:-6379}:6379` to the `redis` service and recreated the container.
- **Retest:** `docker exec jet-admin-redis redis-cli ping` → `PONG`; host TCP 6379 reachable; listener proxy logged `proxy:redis:connected` and `queue.config:redis bus ready`.

### BUG-002 — Large Application publish exceeds the interactive transaction timeout

- **Severity:** High (blocks publishing an application with many pages/dependencies)
- **Symptom:** Publishing the 9-page Application returned HTTP 500 after ~30.7s; backend logged Prisma `P2028` and the UI reported “Application operation failed.”
- **Cause:** `publish()` used a 30s interactive transaction while creating/recording versions for many pages and dependencies over a remote database.
- **Fix:** Increased the publish transaction timeout to 180s with a 20s max wait (`application.service.js`).
- **Retest:** Release 2 published successfully with nine page versions; no Prisma `P2028`.

### BUG-003 — Invalid HTML `pattern` regex on Application route fields

- **Severity:** Low (browser validation warning; pattern constraint ineffective)
- **Symptom:** Console reported `Pattern attribute value [a-zA-Z][a-zA-Z0-9_-]{0,63} is not a valid regular expression … Invalid character in character class`.
- **Fix:** Escaped the hyphen: `[a-zA-Z][a-zA-Z0-9_\-]{0,63}` in both route ID fields.
- **Retest:** Frontend HMR; verify console has no new pattern error and route creation still works.

### BUG-004 — Listener proxy `node --watch` restart loop on Windows

- **Severity:** Medium (local dev listener unstable)
- **Symptom:** `apps/listener-proxy` `npm run dev` repeatedly printed `Restarting 'index.js'` before/while the proxy booted.
- **Workaround during QA:** Run `node index.js` directly; proxy boots and listens on 8095.
- **Follow-up:** Confirm whether this is a Windows `--watch` interaction; if reproducible, change the dev script to a stable watch or document the supported command.

### BUG-005 — Route-settings dialog appears to remain open while closing

- **Severity:** Low (automation/state observation issue; save itself applied)
- **Symptom:** After Save settings, the accessibility snapshot kept reporting the dialog until a later sync; target clicks then failed with “no visible geometry.” Definition updates were applied and Save draft succeeded.
- **Status:** Observed; investigate stale VOM/portal behavior. Not yet confirmed as a user-facing failure.

### BUG-006 — Released widget workflow actions were silently removed

- **Severity:** High (blocks workflow execution from Application pages)
- **Symptom:** Clicking “Simulate fulfillment” on `/orders` produced no application workflow run and Run history remained empty. The compiler only admitted `SET_VARIABLE`, `SHOW_TOAST`, `CALL_WIDGET_METHOD`, and `EXECUTE_QUERY`, so direct `TRIGGER_WORKFLOW` and `TRIGGER_QUERY` actions were turned into diagnostics and omitted. `NAVIGATE` and `SET_APPLICATION_VARIABLE` were also dropped.
- **Fix:** `application.compiler.js` now rewrites direct query/workflow triggers to the page data-source alias that pins the same asset, and admits declared application-variable and route-navigation actions with validation. Added compiler unit tests for alias rewriting, undeclared variables, and invalid routes.
- **Retest:** Release 2 redeployed. “Simulate fulfillment” started run `9a419613-c41c-4634-8bb1-061f4bea073a`, which appears as `COMPLETED` in Application Run history with route/action `order-desk.fulfillment`. Compiler tests: 16/16 pass.

### BUG-007 — Direct-trigger pages lacked pinned workflow data sources

- **Severity:** Medium (data configuration gap exposed by the new release contract)
- **Symptom:** The seeded showcase pages used direct workflow IDs on button events but did not pin those workflows as page data sources. After the secure alias rewrite, the actions would be omitted.
- **Fix (through UI only):** Added manual trigger-mode workflow sources to the affected pages: `fulfillment` (order-desk), `batch_risk` + `approval` (risk-desk), `reconciliation` (treasury-close), `incident` + `recovery` (incident-room), `supplier` (supply-planner), `event_workflow` (event-lab). SLA and subscription pages already had workflow sources.
- **Retest:** Release 2 compiled without `ACTION_TARGET_NOT_PINNED` diagnostics and all tested buttons started real runs.

### BUG-008 — Widget catalogue exposed calendar/kanban without descriptors

- **Severity:** High (blocks creating or saving two advertised widget types)
- **Symptom:** Creating a Calendar or Kanban Board widget in the page editor returned HTTP 400 with “Unknown widgetType 'calendar'. Use the 32 registered types”. The canonical descriptor and JSON-schema registries covered 32 types while the catalogue advertised 34.
- **Fix:** Added `kanban` and `calendar` descriptors to `packages/widget-types/src/descriptors.js`, added their JSON schemas and schema-map entries, and updated the widget-types descriptor test to cover 34 types. Error messages no longer hardcode a type count.
- **Retest:** `@jet-admin/widget-types` tests: 45/45 pass; Calendar and Kanban widgets created through the page editor and both render in release 3.

## Workflow evidence

| Scenario | Page / action | Run ID | Result |
| --- | --- | --- | --- |
| Sub-workflow fulfillment | order-desk · fulfillment | `9a419613-c41c-4634-8bb1-061f4bea073a` | COMPLETED |
| Fulfillment rerun | order-desk · fulfillment | `7a6b3ecf-d4d…`, `ab8e1d16-c28…` | COMPLETED |
| Bounded batch / loop | risk-desk · batch_risk | `f0e24007-71af-4935-8e3a-b4ab7400ed78` | COMPLETED |
| Approval (suspended then accepted) | risk-desk · approval | `2acefe1a-4062-4417-a6e0-e3cd49646ec0` | Suspended at node `469d97f4`; submitted comment “QA acceptance…” and approved; COMPLETED |
| Data collection | supply-planner · supplier | `f49d95b9-411c-4b66-861c-a832f71bacef` | Suspended at node `dedb9d54`; submitted ETA 7 + reason; COMPLETED with `supplierReply` |
| Incident routing / delay | incident-room · incident | `6a021687-2ae7-4c33-80a0-ed500e95c1a9` | COMPLETED after severity switch and cooldown |
| Failure / compensation | incident-room · recovery | `002e8640-2c08-4b73-ab95-b7c038658d4d` | Node `33740ee8` FAILED “Synthetic upstream unavailable”; compensating nodes completed; run COMPLETED |
| Fan-out / barrier merge | treasury-close · reconciliation | `f54120b6-6829-4acb-affb-b80389871ed7` | COMPLETED |
| Event normalization / dedupe | event-lab · event_workflow | `dbe2e0a2-7ccf-49c9-be6f-16795824f1a1` | COMPLETED with route `standard`, dedupeKey `QA-FORM-2026` |
| SLA triage / priority dispatch | sla-desk · proposal | `af97847c-da01-4bee-867d-760942a0d656` | COMPLETED |
| Dunning approval | subscription-retention · proposal | `3e6f452b-1439-45cc-9581-b45db190c6bc` | Suspended at approval; accepted with comment; COMPLETED |
| Approval timeout | risk-desk · approval | `b33818e0-dbe…` | FAILED after approval timeout; failure status visible in Run history |
| Cancellation / reconnect | — | — | Not exercised: no cancel control on the application run-detail page; workflow editor stop affects only editor test runs |

All backend-implemented node types were exercised: `start`, `dataQuery`, `javascript`, `condition`, `loop`, `delay`, `end`, `dataCollection`, `subWorkflow`, `switch`, `approval`, `fanout`, `join`. `connectorPull` and `connectorPush` are catalog-declared as `implemented: false` in the MCP catalog and have no backend executor, so they were not available for execution.

## Widget laboratory evidence

- App Page: **Widget laboratory · interactive controls**, ID `f3eac99c-e81f-45be-8017-c37b58b44f5a`.
- Linked as application route key `widget-lab`, path `/lab`, in draft revision 14; release 3 contains 10 page versions.
- Widgets rendered in release 3: badge, calendar, checkbox, date-picker, date-range-picker, divider, file-upload, image, kanban, list, multi-select, progress, radio-group, search-input, switch, tabs, text-input, video, plus a button action chain and the earlier key-value/text/table/select/button/vega-lite/json-viewer/form/code-block/timeline/stat/slider/alert widgets on the nine referenced pages.
- Interactions verified: checkbox checked, switch toggled, search and text-input values updated, tabs switched from Tab 1 to Tab 2, date picker selected `Nov 24, 2026`.
- Event chain verified on `/lab`: **LAB Actions → Click Me** executes Set Page Variable (`labStatus=checked`), Set Application Variable (`allowIntegrations=true`), Show Toast (`LAB chain completed`), then Navigate to route `risk`; final path `/run/production/risk` and title `Risk console · Application`.
- Deliberately unsafe widget types (`html`, `iframe`) remain excluded from the runtime allowlist; they were not deployed.

## Listener evidence

- Listener: **Showcase orders**, ID `d8abf1be-01ef-4653-9284-b395592594c6`, tenant `855b7183-350c-45cc-b0e8-d408e0c2e3f1`.
- Five-step pipeline: Transform Event, Save to Buffer (`default`), Trigger Workflow (`Events · normalize…`), Push to App Page (`showcase:orders`), Trigger Data Query (`Reliability · live-style incident queue`, `59ddd683-e9b9-4b13-8599-9973bb8e69a4`).
- Ingress: POST to `http://localhost:8095/webhooks/v1/inbound/.../showcase-orders` with `x-showcase-secret` returned `202 {"accepted":true,"synthetic":true}`.
- Event `QA-R2-1795501995749` appeared in the Event lab live listener buffer with `synthetic:true` (transform + push-to-page).
- Backend log at 12:03:20–12:03:22 shows listener-originated workflow gate for workflow `001efddb-2fc1-4eb7-958d-6976e407dbf6` (instance `6b70d097-75ed-42fd-97ff-e30f3ade4917`, COMPLETED) and listener-originated data-query gate for `59ddd683-e9b9-4b13-8599-9973bb8e69a4` (DuckDB executed successfully).
- Cursor/replay gap behavior: buffered observation is visible; explicit retention-gap eviction was not induced.

## Lifecycle evidence

- Release 2 (`ab75c210460e`, 9 pages) was deployed; release 3 (`d5daa5257a9c`, 10 pages) was published after adding `/lab`.
- Rollback: release history → Roll back to release 2 switched production to `ab75c210460e`; `/run/production/lab` rendered the not-found route (Incident room) while the URL stayed `/lab`.
- Roll-forward: Deploy on release 3 switched production back to `d5daa5257a9c`; `/lab` rendered Widget laboratory again.
- Environment bindings: revisions 2, 3 and 4 recorded; revision 4 has **1 active mapping** (`6c190e0f-…` → `6c190e0f-…`, commerce warehouse self-pin) with change note “QA mapping revision: commerce warehouse self-pin”.
- Consumer policy: enabled with revision 1 wildcard allow for user `1a3ece78-…`; `/risk` loaded. Adding a route-level deny for `risk` made `/risk` resolve to the not-found page (default-deny/deny-precedence). Restored to wildcard-allow revision before final verification.
- Managed adoption: not exercised; all 10 pages are referenced shared pages. Clone/managed-copy flow was opened but not completed because the draft route was already linked to the referenced page.

## Versioning-first refactor (2026-11-24)

Implemented after the comprehensive QA pass:

- **Terminology:** `tblAppPageVersions` is now `tblAppPageEditorHistory`; UI labels use “Editor history”. `pinPageVersion` became `selectPageVersion`; diagnostics use `ACTION_TARGET_NOT_VERSIONED` and `APPLICATION_DEPENDENCY_NOT_CAPTURED`; runtime copy uses “Versioned runtime” and “Captured query and workflow versions”.
- **Per-asset version selection:** page data sources support `versionMode: latest-at-capture | specific` with `queryVersionID`, `workflowVersionID`, or `listenerVersionID`. Pages also support per-widget selection via `appPageConfig.widgetVersionSelections[widgetID]` with `widgetVersionID`. Query and listener assets select their datasource version through `datasourceVersionMode` / `datasourceVersionID` in their config JSON. Workflow `dataQuery`/`subWorkflow` nodes, listener `trigger_workflow`/`trigger_query` actions, and scheduled-job workflow references use the same capture-time semantics. Selected versions must be published and belong to the same tenant-scoped asset.
- **Page-owned trigger binding:** a page version captures `triggerBindings` from direct widget `TRIGGER_QUERY`/`TRIGGER_WORKFLOW` actions to its own data-source aliases. Unresolved or ambiguous targets are removed with `ACTION_TARGET_NOT_ALIASED`. The Application compiler no longer rewrites raw query/workflow IDs and rejects any unbound direct trigger.
- **Page-scoped runtime:** the application manifest returns `pages: {}` and `widgets: {}`. `GET /runtime/:environment/pages/:pageAssetKey/manifest` resolves exactly one immutable page version and its direct sources/widgets. The server resolves the owning route from the deployed definition; a client-supplied route that belongs to another page is rejected with `APPLICATION_ROUTE_MISMATCH`. The client loads pages lazily and shows a spinner/error until the page manifest arrives.
- **Permissions:** added `appPage.execute` and `listener.observe`. Page runtime requires application execute plus the underlying page execute and query/workflow execute or listener observe permission (Option B).
- **Caching:** assembled page manifests are cached in-process by tenant, release, page version, environment binding revision, consumer-policy revision/enabled flag, and route ID. Immutable page versions make the manifest safe to reuse; policy and binding revisions prevent stale authorization context reuse.
- **Provenance and bindings:** runtime execution records `applicationID`, `releaseID`, `environment`, `pageAssetKey`, `alias`, `pageVersionID`, and the source version ID without assembling the whole application graph. Environment datasource bindings still apply to page queries.
- **Publish validation:** publishing recursively validates the full page graph and adds warnings for selected page versions whose live editor state or captured dependency versions are older than the live assets. Immutable page versions remain immutable.
- **Visibility:** version diff responses include `dependencyChanges` (for example, a workflow version changing because its captured query version changed). The version UI can compare a version with the current draft or another selected version, and renders captured dependency changes plus live-edit/dirty warnings.

### Asset selection audit

| Selection point | Stored reference | Version control |
| --- | --- | --- |
| Application → page | `tblApplicationAssets.pageVersionID` | Selected page version or capture latest at publish |
| App Page → data source | `appPageConfig.dataSources[]` | `versionMode` + query/workflow/listener version ID |
| App Page → widget | `appPageConfig.widgets[]` | `widgetVersionSelections[widgetID]` via Widget versions tab |
| Widget → standalone data source | `widgetConfig.dataSources[]` | `versionMode` + query/workflow version ID; captured in the widget version |
| Workflow → data query node | `nodeConfig.dataQueryID` | `queryVersionID` |
| Workflow → sub-workflow node | `nodeConfig.childWorkflowID` | `childWorkflowVersionID` |
| Listener → workflow/query action | `actionConfig.workflowID` / `dataQueryID` | `workflowVersionID` / `queryVersionID` |
| Listener → datasource | `listenerConfig` | `datasourceVersionMode` / `datasourceVersionID` |
| Query → datasource | `dataQueryOptions` | `datasourceVersionMode` / `datasourceVersionID` |
| Cron job → workflow | `workflowConfig` | `versionMode` / `workflowVersionID` |

Not versioned by design:

- **Widget direct `TRIGGER_QUERY` / `TRIGGER_WORKFLOW` actions:** the page layer resolves these to a page data-source alias at page capture; the page data source’s version selection controls the captured version. Unbound targets are rejected/removed.
- **`CALL_WIDGET_METHOD` target:** a runtime widget-instance method target, not an immutable asset definition.
- **Listener `push_to_app_page` destination:** a delivery destination, not an execution dependency. Capturing a page version here would create a listener ↔ page version cycle.
- **Environment datasource bindings:** environment-specific connection selection, not a definition version. Datasource versions intentionally exclude credentials.
- **Application navigation routes:** application definition data, not an asset version.

### Refactor verification

| Check | Result |
| --- | --- |
| Migration `20261124_rename_app_page_editor_history.sql` | Applied; `tblAppPageEditorHistory` exists, Prisma client regenerated |
| Backend targeted suites (`application`, `assetVersion`, `appPage`) | 138/138 passed |
| Backend full unit suite | 851 passed, 6 failed — all deterministic pre-existing unrelated assertions (`marketplaceSelection` 2, `curatedMarketplace.layout` 1, `widgetSocketAuth` 3) |
| Frontend Jest | 31 suites / 198 tests passed |
| Frontend production build | Passed (`vite build`; chunk-size warnings only) |
| Workflow-nodes package build | Passed (`esbuild`; import/require condition warning only) |
| Browser runtime (order desk, risk) | Page manifests loaded per route; queries, tables, Vega charts, and widgets rendered |
| Browser widget version selector | App Page editor → Widget versions lists every placed widget with capture mode and specific-version selector |
| Browser datasource version selector | Query editor renders the datasource capture selector; query/listener datasource selections are covered by backend tests |
| Browser workflow execution | `risk` → `batch_risk` started run `2a7a0514-de96-44ca-b988-80f2743da2a1` from the captured page version; final status `COMPLETED` |
| Backend `/health`, Vite | 200 / 200 |

## Pending work

- Explicit cancellation and cursor retention-gap tests (no run-level cancel control surfaced in the application runtime).
- Managed adoption/isolation if a separate unlinked page is created.

## Verification — comprehensive QA pass (superseded by the refactor verification above)

The table below records the pre-refactor comprehensive QA run. Use the refactor verification table for the current contract.

| Check | Result |
| --- | --- |
| Application Studio production pointer | Release 3 `d5daa5257a9c`, 10 page versions |
| Retained applications | 2: Comprehensive Platform Showcase and Applications foundation QA |
| Frontend Jest | 31 suites / 198 tests passed |
| Widget-types Jest | 2 suites / 45 tests passed |
| Backend Jest (unit) | 837 passed, 6 failed in `curatedMarketplace.layout` and `widgetSocketAuth` (pre-existing areas unrelated to this QA change; compiler and widget-validator suites pass) |
| Frontend production build | Passed (`vite build`, 2m55s; chunk-size warnings only) |
| Frontend lint (changed file) | Clean for `applicationStudioPage.jsx` |
| Full frontend lint | 1517 pre-existing repository errors outside the changed file; not introduced by this QA |
| Widget-types lint (changed files) | Existing `COMMON_TEMPLATE` unused and JSON import-assertion parser errors; no new errors from calendar/kanban descriptors |
| Backend `/health`, listener `/health`, Vite | 200 / 200 / 200 |
| Docker services | Redis, Temporal PostgreSQL, Temporal server, Temporal UI, app PostgreSQL healthy |

**Final application URLs:** `/run/production/orders`, `/risk`, `/treasury`, `/incidents`, `/supply`, `/events`, `/integrations`, `/sla`, `/subscriptions`, `/orders/:orderID`, `/lab`.
