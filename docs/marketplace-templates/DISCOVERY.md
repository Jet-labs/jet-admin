# Marketplace App Templates — Platform Discovery

Status: Phase 0 complete (read-only discovery). Branch inspected: `release/v2.1.0-preview.1` (the requested `dev` branch was not checked out; see DECISIONS.md).

## 1. Existing marketplace / template / export / import code

The platform already has a **generalized Marketplace store** and a **Bundle v1** import/export pipeline.

### Marketplace

| Path | Purpose |
| --- | --- |
| `apps/backend/modules/marketplace/marketplace.service.js` | Lists/searches `tblMarketplaceItem`, fetches one item, records installs, verify/unpublish. |
| `apps/backend/modules/marketplace/marketplace.controller.js` | Tenant list/detail/preview/install; blocks legacy payloads without `payload.marketplace.root`. |
| `apps/backend/modules/marketplace/marketplace.tenant.v1.routes.js` | `GET /api/v1/tenants/:tenantID/marketplace`, `GET /:itemID`, `POST /:itemID/preview`, `POST /:itemID/install`. |
| `apps/backend/prisma/schema.prisma` → `tblMarketplaceItem` | `itemType` (`datasource`, `widget`, `workflow`, `appTemplate`), `payload` JSONB, `slug` unique, tags, publisher, version, verified, installCount. |
| `apps/backend/scripts/catalog/curatedMarketplace.js` | Deterministic curated Bundle v1 payload generator (widget/page/workflow/datasource/query). |
| `apps/backend/scripts/seed-marketplace.js` | Idempotent catalog seed (`upsert` on `slug`). |
| `apps/frontend/src/presentation/pages/marketplacePage` + `marketplaceComponents` | Existing gallery, filters, preview/install dialog. |
| `apps/backend/__tests__/unit/marketplace/curatedMarketplace.test.js` | Determinism / dependency closure tests for generated bundles. |

There is **no first-class Template package format, no `installTemplate()` service, no template ledger, no template schema/seed installer, and no template gallery** yet. Existing `appTemplate` items are simply Bundle v1 payloads containing pages/widgets/queries/etc.

### Bundle v1 (the install path)

`apps/backend/modules/bundle/bundle.service.js` defines:

```json
{
  "bundleVersion": 1,
  "generator": "jet-admin",
  "exportedAt": "ISO-8601",
  "sourceTenant": "uuid",
  "items": [
    {
      "type": "appPage | widget | workflow | dataQuery | datasource | listener",
      "id": "uuid (reference key only)",
      "payload": { "...type-specific..." },
      "dependencies": [{ "type": "datasource|dataQuery|workflow|widget|listener", "id": "uuid", "name": "optional", "bundled": true }]
    }
  ]
}
```

Key behavior:

* `previewImport` validates and produces per-item warnings (title collisions, missing dependencies, reconnect warnings, duplicate endpoint paths).
* `executeImport` creates fresh DB UUIDs, rewrites reference keys (`queryID`, `dataQueryID`, `workflowID`, `childWorkflowID`, `datasourceID`, `listenerID`) and `widget_<id>_<suffix>` instance keys, all inside one Prisma transaction.
* Secret-like keys are stripped with `SENSITIVE_KEY_PATTERNS` from `utils/sensitive.js` and `EXTRA_SENSITIVE_KEYS`; datasources are marked `requiresReconnect: true`.
* Listeners are hard-bound to a datasource through `dependencies[]`, not through an exported column.
* Workflow node IDs and edges are remapped internally.
* Creator Casbin access is granted after the transaction via `grantCreatorAccess`.
* The bundle does **not** import schemas, data rows, cron jobs, roles/permissions, folders, or template metadata.

## 2. Prisma schema (apps/backend/prisma/schema.prisma)

All installable entities are tenant-scoped by `tenantID`.

### Tenancy / identity

| Model | Required fields | Notes |
| --- | --- | --- |
| `tblTenants` | `tenantID` PK, `tenantTitle` | optional logo, disabled flags, creator. |
| `tblUsers` | `userID` PK, `firebaseID`, `email` | platform identity; demo users cannot authenticate without Firebase. |
| `tblUsersTenantsRelationship` | `tenantID`, `userID`, `role` (`MEMBER` default) | composite PK. |
| `tblRoles` | `roleID` PK, `roleTitle` | `tenantID` null = global role. |
| `tblPermissions` | `permissionID` PK, `permissionTitle` | keys like `tenant:apppage:read`. |
| `tblRolePermissionMappings` | `roleID`, `permissionID` | composite PK. |
| `tblUserTenantRoleMappings` | `userID`, `tenantID`, `roleID` | composite PK. |

### Installable resources

| Model | Required | Optional / defaults | Relations |
| --- | --- | --- | --- |
| `tblAppPages` | `appPageID` PK, `tenantID`, `appPageTitle` | `appPageDescription`, `appPageConfig` JSON, folder, creator | tenant cascade; folder/incremental |
| `tblAppPageVersions` | `appPageVersionID`, `appPageID`, `tenantID`, `versionNumber` | title, description, config, changeNote | unique `(appPageID, versionNumber)` |
| `tblWidgets` | `widgetID` PK, `tenantID`, `widgetTitle`, `widgetType`, `widgetConfig` | description, refreshInterval, folder | tenant |
| `tblWorkflows` | `workflowID` PK, `tenantID`, `title` | `workflowOptions` JSON default `{}`, `isDisabled`, folder | tenant |
| `tblWorkflowNodes` | `nodeID` PK, `workflowID`, `nodeType` | `timeoutSeconds` default 300, `retryLimit` default 3, `nodeConfig` | workflow cascade |
| `tblWorkflowEdge` | `edgeID` PK, `workflowID`, `upstreamNodeID`, `downstreamNodeID` | sourceHandle, targetHandle, edgeType, edgeConfig | workflow + node cascade |
| `tblWorkflowInstances` | `instanceID` PK, `tenantID`, `status` | finalContext, workflowOutput, executionKey, projection, parent linkage | unique `(tenantID, executionKey)` |
| `tblWorkflowInstanceLogs` | `logID` PK, `instanceID`, `eventType`, `payload` default `{}` | nodeID, nodeStatus, outputVariable, errorMessage, nodeAttempt, eventSequence autoincrement, eventKey | cascade |
| `tblWorkflowDataCollectionRequests` | `collectionRequestID`, `instanceID`, `nodeID` | status, collectionType, collectionConfig, submittedData, expiry/delivery tokens | unique `(instanceID, waitID)` |
| `tblDataQueries` | `dataQueryID` PK, `tenantID`, `datasourceType` | title, description, `dataQueryOptions` JSON, runOnLoad, result schema, datasourceID, folder | datasource cascade |
| `tblDatasources` | `datasourceID` PK, `tenantID`, `datasourceType`, `datasourceOptions` JSON | tags, description, connectionStatus, webhook token/secret, folder | tenant |
| `tblListeners` | `listenerID` PK, `tenantID`, `datasourceID`, `listenerTitle`, `listenerType` | config, status (`inactive` default), endpointPath unique per tenant, counts | datasource cascade; actions/events cascade |
| `tblListenerActions` | `actionID`, `listenerID`, `actionType`, `actionConfig` | isEnabled, orderIndex | listener cascade |
| `tblListenerEvents` | `eventID`, `listenerID`, `tenantID`, `bufferName`, `eventData` | eventMeta, receivedAt, seqNo | listener cascade |
| `tblCronJobs` | `cronJobID` PK, `tenantID`, `cronJobTitle`, `cronJobSchedule` | workflowID, workflowConfig, timeout, retry, nextRunAt, disabled | workflow optional |
| `tblCronJobHistory` | `cronJobHistoryID`, `cronJobID`, `status` | scheduled/start/end, duration, result, triggerType | |
| `tblFolders` | `folderID`, `tenantID`, `folderTitle`, `entityType` | parentFolderID | typed folders per module |
| `tblAuditLogs` | `auditLogID`, `type`, `success` | userID, tenantID, subType, metadata/error | platform audit, not business-row audit |
| `tblVaultCredentials` | `vaultCredentialID`, `tenantID`, `name`, `provider`, `encryptedData` | | secrets |
| `tblMarketplaceItem` | `itemID`, `slug`, `itemType`, `title`, `payload` | category, tags, icon, version, verified, installs | |

There is no Prisma enum in the installable surface; statuses/roles/types are strings. No template install ledger exists (added by this work).

## 3. Data Sources

`packages/datasource-types/src/index.js` registers 40+ types. Relevant ones:

* `postgresql`, `mysql`, `mssql`, `sqlite`, `duckdb`, `clickhouse`, `cockroachdb`, `oracle` — SQL.
* `restapi`, `graphql`, `weburl`, `github`, `gitlab`, `jira`, `notion`, `airtable`, `googlesheets`, `supabase`, `bigquery` — HTTP/API.
* `webhook`, `mqtt`, `websocket`, `sse`, `syslog`, `nats`, `kafka`, `rabbitmq`, `redis` — listener-capable.
* `stripe`, `sendgrid`, `slack`, `twilio`, `smtp`, `ldap`, `s3`, `sftp`, `filesystem`, `excelcsv`, `prometheus`, `influxdb`, `firestore`, `mongodb`, `neo4j`, `elasticsearch`, `googleanalytics`.

`supportsListener: true` and a `listenerConfigForm` exist only for the listener-capable types. There is no PULL/PUSH/STREAM/BATCH mode enum in the stored model; behavior is implied by type plus query/listener operation.

PostgreSQL connection shape (`packages/datasource-types/src/postgresql/formConfig.json`):

```json
{
  "connectionOption": "connectionDetails | connectionString",
  "connectionDetails": {
    "connectionName": "...", "host": "...", "port": 5432,
    "database": "...", "user": "...", "password": "...",
    "sslMode": "prefer", "additionalOptions": { "connectTimeout": 10 }
  },
  "connectionString": "postgresql://..."
}
```

`datasourceOptions` is encrypted at rest by `datasource.service.js` (`encryptOptions` → `{ __encrypted, iv, data, authTag }`). Bundle exports decrypt then strip secret-like keys; imports re-strip and re-encrypt. There is no generic `{{secrets.X}}` interpolation for datasource credentials. Vault credentials are referenced by `vaultCredentialID` and resolved server-side by the datasource implementation where supported.

## 4. Data Queries

* Stored in `tblDataQueries.dataQueryOptions` as the datasource-type specific config (`queryType`, raw `query`, `inputDefinitions`, timeout, REST method/path, GraphQL body, etc.).
* Execution: `dataQuery.queryEngine/engine.js`.
  * Validates every string template with `validateTemplate(value, "safe-path", { allowedRoots: ["inputs"] })`.
  * Resolves `{{ inputs.x }}` through `@jet-admin/expression-engine` before datasource execution.
  * Read-only SQL results are cached for 10 s; datasource instances for 30 s. Cache key includes tenant, query ID, `updatedAt`, and runtime inputs.
  * `runDataQueryByID` goes through `authorizedExecuteDataQuery`, requiring an execution context and Casbin `dataquery:<id>` `execute` (or originating-resource delegation).
* SQL is executed as a raw string by `PostgreSQLDataSource.execute`; there is no `$1` parameter array in the current path. The platform's binding convention is `{{ inputs.<key> }}` interpolation plus typed input definitions.
* Inputs are resolved/coerced by `utils/input.util.js` (`resolveInputs`) before interpolation.
* `runOnLoad` exists but page data sources control execution more directly.

## 5. Listeners

* `tblListeners` bound to a datasource; listener types mirror datasource types.
* Webhook endpoints use `endpointPath` (unique per tenant) and `listenerConfig` (path suffix, status, body).
* Pipeline actions (`tblListenerActions`):
  * `transform` — sandboxed JS, 100 ms / 16 MB, must return the event; error aborts the pipeline.
  * `trigger_workflow` — `{ workflowID, inputValues }`; resolved against `{ event }`.
  * `trigger_query` — `{ dataQueryID, inputValues }`; system execution context.
  * `save_to_buffer` — persists to `tblListenerEvents` with optional count/age retention.
  * `push_to_app_page` — Socket.IO push to an app page channel.
* There is no built-in "condition" operator in listener config; conditions are expressed inside the transform script (return `null` to stop) or in the triggered workflow's `condition`/`switch` nodes.
* No notification action; notifications are implemented through workflows/queries.

## 6. Cron Jobs

* `tblCronJobs.cronJobSchedule` is a `node-cron` expression (5-field `/` 6-field supported by `cron-parser`).
* `workflowID` + `workflowConfig.inputValues` is the only invocation target.
* `CronJobEngine`:
  * node-cron scheduling, `nextRunAt` computed by `cron-parser`;
  * Redis distributed lock (`cron:lock:<id>`) plus a DB occurrence claim (`lastScheduledAt`) so a given scheduled instant runs once;
  * retry attempts/delay on the cron row; timeout; history rows in `tblCronJobHistory`;
  * system execution context (`ORIGIN_TYPES.CRON`).
* There is no timezone column. Schedules are evaluated in the server's local timezone; production deployments run UTC. Idempotency is provided by the occurrence claim + `executionKey` unique per tenant for workflow instances.

## 7. Workflow engine

Node types implemented in `packages/workflow-nodes-logic/src/handlers`:

`start`, `end`, `javascript`, `dataQuery`, `condition`, `switch`, `approval`, `delay`, `loop`, `fanout`, `join`, `subWorkflow`, `dataCollection`.

Node config essentials:

* `start` — entry point; workflow inputs come from `workflowOptions.inputDefinitions` and runtime `inputValues`.
* `javascript` — `{ code, outputVariable, timeoutSeconds, errorHandling }`, runs in isolated-vm with `ctx` sandbox.
* `dataQuery` — `{ dataQueryID, outputVariable, inputValues }`; values support `{{ ctx... }}`.
* `condition` — `{ branches: [{ id, label, condition }], defaultBranch }`; expressions are JS against `ctx`.
* `switch` — `{ switchValue, cases: [{ id, label, operator, matchValue }] }`.
* `approval` — suspends, creates `tblWorkflowDataCollectionRequests` (`collectionType: approval`); routes `approved` / `rejected` / `expired`.
* `dataCollection` — suspends; `collectionType` is passed through (`form` is the documented/default; approval is specialized). `formSchema` + `formUischema` are JSON Forms.
* `delay` — fixed/durable delay.
* `loop` — bounded iteration with `sourceVariable`, `itemVariable`, `outputVariable`, `maxIterations`.
* `fanout` / `join` — parallel branches and barrier merge (`joinMode: all|any`).
* `subWorkflow` — `childWorkflowID`, `inputMapping`, `outputVariable`, `maxDepth`.
* `end` — `outputParameters: [{ name, sourceVariable }]`.

Edges are rows in `tblWorkflowEdge` (sourceHandle distinguishes `success`, `error`, branch IDs, `approved`, `rejected`, `expired`, `output`, loop handles). Node errors: `errorHandling` is `fail_workflow` or `continue`; retries use per-node `retryLimit` + workflow `defaultRetryDelaySeconds`. Execution logs are `tblWorkflowInstanceLogs` events with `payload` and `outputVariable` (XCom-style `ctx.<outputVariable>`). Instances expose `finalContext`, `workflowOutput`, `contextProjection`.

DataCollection currently only has first-class handlers for `form` and `approval`; arbitrary `collectionType` values are stored but no dedicated API/webhook delivery UI exists.

## 8. Frontend widget registry

`packages/widget-types/src/index.js` enumerates: `vega`, `vega-lite`, `button`, `table`, `text`, `stat`, `alert`, `form`, `image`, `iframe`, `date-picker`, `date-range-picker`, `html`, `text-input`, `select`, `multi-select`, `checkbox`, `radio-group`, `switch`, `slider`, `search-input`, `file-upload`, `divider`, `tabs`, `key-value`, `json-viewer`, `list`, `badge`, `progress`, `timeline`, `video`, `code-block`.

`packages/widgets-ui/src/widget.map.js` is the runtime registry (`WIDGETS_MAP`): label, icon, lazy component, config editor, sample config. Data widgets bind via `dataTemplate` / `dataArrayTemplate` strings using `{{ state... }}`.

* `table` — columns (`key`, `label`, `type` incl. `text|number|boolean|date|link|badge|image`, `sortable`, `editable`, `width`, `format`), `pagination` (client/server, pageSize, totalTemplate), `search` (client/server), `export` (csv/json), `editing` (row inline edit), `bulkEdit`, `multiSelect` (actions, `onBulkDelete`, `onBulkExport`, `onBulkAction`), `dataArrayTemplate`, `isLoading`, empty text.
* `form` — `fields` (`key`, `label`, `type` text/email/password/number/textarea/checkbox/select, `required`, `options`, `validation.min/max`, help), layout (`vertical|horizontal|grid`), columns, submit/reset labels, `events.onSubmit` payload `{ formData, values }`.
* `stat` — `label`, `valueTemplate`, prefix/suffix, trend.
* `vega-lite` — full Vega-Lite spec; data values bound through `{{ ... }}` expressions.
* `tabs` — tab selector only (drives `state.widgets.<instance>.value`); content is shown by conditional layout nodes/rows.
* `key-value` — detail panel.
* `timeline` — activity feed (`dataTemplate`, title/time/description keys).
* `html` — sanitized rich content; `text` supports markdown.
* `list`, `badge`, `progress`, `json-viewer`, `code-block`, `file-upload`, date pickers, inputs.
* **Not present:** kanban board, calendar view, modal/drawer, dedicated funnel/heatmap widgets. Funnel/heatmap can be Vega-Lite marks. Kanban/calendar/modal need generic extensions (see Gaps).

## 9. Page/layout JSON and `{{binding}}`

`tblAppPages.appPageConfig` uses layout v2:

```json
{
  "layoutVersion": 2,
  "layout": { "id": "root", "type": "column", "children": [ { "type": "row", "children": [ ... ] } ] },
  "layouts": {},
  "widgets": [ { "id": "slot", "type": "widget", "widgetKey": "widget_<widgetID>_1", "span": 6, "sizing": "fill" } ],
  "variables": [ { "key": "selectedID", "type": "number", "defaultValue": 1 } ],
  "dataSources": [
    { "alias": "leads", "type": "query", "queryID": "...", "triggerMode": "auto|reactive|manual", "inputValues": {}, "refreshOn": ["variables.selectedID"] }
  ]
}
```

Layout node types: `column`, `row`, `widget`, `container`, `stack`, `z-stack`; nodes support `condition` and `repeat`.

Runtime state tree (`apps/frontend/src/logic/appPageRuntime`):

```
queries:   { alias: { data, isLoading, error, lastUpdated } }
workflows: { alias: { data, error, isLoading, instanceID, pendingRequests } }
listeners: { alias: { data, error, isLoading } }
widgets:   { instanceKey: { ...widgetState } }
variables: { key: value }
globals:   { tenantID, pageID }
widgetMethods
```

Expression resolution:
* safe-path mode for backend SQL templates (only `inputs` root);
* JS-template mode in the browser for `{{ }}`, sandboxed (no arbitrary globals);
* event payload is top-level `event` (e.g. `event.row`, `event.formData`, `event.value`, `event.searchTerm`);
* actions: `SET_VARIABLE`, `EXECUTE_QUERY`, `TRIGGER_QUERY`, `TRIGGER_WORKFLOW`, `CALL_WIDGET_METHOD`, toast actions.

## 10. RBAC

* Permissions are defined in `apps/backend/config/permissions.json` as `tenant:<resource>:<action>` keys, exposed as `P.<resource>.<action>` descriptors.
* Roles: `tblRoles` with `tenantID` (tenant role) or null (global role). Role ↔ permission mapping; user ↔ tenant ↔ role mapping.
* Casbin enforces at route level via `authMiddleware.authorize(P.x.y)`:
  * collection routes (no ID) check `resource:*`;
  * item routes check `resource:<id>` using `paramKey`/`reqKey`.
* Asset-level permissions use permission titles `tenant:asset:<resourceType>:<resourceID>:<action>` and are synced to Casbin as `<resourceType>:<resourceID>` + action.
* `bundleService.executeImport` grants the creator `"*"` on every created resource via `grantCreatorAccess`.
* Pages/query/workflow triggers are permission-gated at the API. **Widget-level visibility is not enforced**; the only current lever is page-level access or conditional layout using state, which has no role information. This is a gap.
* `appPageService.getAllAppPages` does not filter by Casbin, so unauthorized pages can appear in navigation but fail on open.

## 11. Assets

* Platform assets (datasource forms, widget icons) are code/JSON in packages.
* Tenant logos are `tblTenants.tenantLogoURL`; uploads use `fileStorage.util` (S3/RustFS or local fallback).
* App pages/widgets have no dedicated asset/file table; images/iframe/html reference URLs directly.
* Template package assets are therefore static files in `marketplace/templates/<slug>/assets/` and are served from the repo by the Marketplace UI/backend static route; install copies references (URLs) but never downloads at install time.
* Bundle assets are not exported; HTML email templates and sample CSVs are template-local files.

## 12. Tests, lint, scripts, dev DB

* Backend tests: Jest, roots `apps/backend/__tests__`, setup `__tests__/setup.js`, unit + integration folders, `npm test` / `test:unit` / `test:integration` in `apps/backend`.
* Frontend tests: Jest (`jest.config.cjs`); lint via ESLint.
* Existing test coverage includes bundle, marketplace, appPage, workflow, listener, cronJob, RBAC, and utils.
* Manual migrations: `apps/backend/prisma/migrations/manual/*.sql`, applied by `node scripts/run-manual-migrations.js` (tracked in `_manual_migrations`).
* Dev DB: `DATABASE_URL` in `.env`; the current dev database is PostgreSQL 18 on Neon (`neondb`). The platform uses Prisma Client 5.22 (root pins 7.2 but backend uses 5.22).
* Root scripts: `start:f`, `start:b`, `dev:all`, `seed`, `build:packages`; backend scripts include `seed`, `seed-marketplace`, `prisma-migrate-dev`, `prisma-db-pull`.
* UI guidelines: `UI_GUIDELINES_V3.md` at repo root (marketplace UI should follow it).

## Gaps

| Gap | Impact | Smallest viable extension |
| --- | --- | --- |
| No template package/ledger/installer | Cannot install schema, seed, cron, roles with a bundle | Add `marketplace/templates`, a template compiler/validator, `tblMarketplaceTemplateInstalls` ledger, `installTemplate`/`uninstallTemplate` layered on Bundle v1. |
| Bundle import does not create cron jobs/roles/folders/assets | Incomplete install | Installer creates these after bundle import using the returned ID map; ledger stores all created IDs; uninstall reverse-deletes. |
| No safe SQL parameter array | `{{ inputs.x }}` is raw text interpolation | Add an opt-in `parameterized: true` PostgreSQL query option that passes ordered input values to `pg` (`$1...$n`), leaving existing queries unchanged. |
| No kanban/calendar/modal widgets | Requirements cannot be met with existing widget registry | Add generic display-only `kanban` (group-by + card fields) and `calendar` (month grid + date field) widgets. Modal/drawer remains a documented limitation; use dedicated detail pages and conditional containers. |
| Widget-level RBAC missing | Cannot hide individual widgets by role | Enforce role visibility at page level (role-specific pages) and query execution level; document as limitation. |
| No tenant-specific physical table names | Shared template tables would leak across tenants | Installer rewrites `{{table:<name>}}` to `tpl_<alias>_<tenantShort>_<name>`; each tenant gets isolated tables and uninstall drops them. |
| No template asset service | Screenshots/icons cannot be uploaded via bundle | Serve repo assets from a read-only Marketplace static endpoint. |
| No app-level template audit | Platform `tblAuditLogs` is auth/action audit | Each template ships an `audit_log` table and write queries/triggers to populate it. |
| Demo users cannot authenticate | Firebase identity required | Seed template staff/contacts data; optional demo platform users are marked auth-disabled. |
| DataCollection only form/approval | API/webhook human tasks not first-class | Use `dataCollection` with `collectionType: "form"` and document API/webhook as deferred. |
