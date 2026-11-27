---
title: Limitations
description: Honest constraints — connector and widget coverage, sandbox behavior, composite limits, browser-local state, event transience, release limits, and operational ceilings.
sidebar_position: 18
---

# Limitations

This page lists what Jet Admin does **not** do, what it does only under
conditions, and where an apparently supported feature has a sharp edge. It is
deliberately conservative: if the code path is unclear, the item is marked as a
gap rather than a guarantee.

## 1. Data sources and queries

### Coverage

- **45 connector types are registered**, not "35+" as older README text says.
  The registry is `packages/datasource-types/src/index.js`; implementations are
  in `packages/datasources-logic/src/data-sources`.
- **13 types expose listener/subscription forms**: PostgreSQL, Firestore,
  MongoDB, GraphQL, RabbitMQ, Kafka, Redis, Webhook, MQTT, WebSocket, SSE,
  Syslog, NATS. The rest are query-only in practice.
- Webhook is listener-only: its `execute()` throws. Do not model it as a query
  source.
- Connector depth varies. A type can have a form, a test connection, a query
  editor, and a listener form in any combination. Do not assume every connector
  supports schema browsing, transactions, streaming, or writes.
- Common systems that are **not registered**: Snowflake, Databricks, DynamoDB,
  Cassandra, Salesforce, HubSpot, Shopify, Google Ads, SAP, SQS/SNS, Pulsar,
  ActiveMQ. Use REST/GraphQL where possible or add a connector package.
- There is no connector marketplace install path for arbitrary npm plugins at
  runtime. Connectors are compiled into the deployment.

### Execution behavior

| Constraint | Reality |
|---|---|
| Query timeout | 60 s platform default (`QUERY_TIMEOUT_SECONDS`); per-query `dataQueryOptions.timeoutSeconds` and workflow node timeout can override |
| Row limit | No universal cap; a SQL query can return as many rows as the driver allows |
| Read-only enforcement | None; the datasource credential/database permissions are the boundary |
| Statement type | SQL connectors can run writes if the credential allows them; the cache only treats detected read-only statements as cacheable |
| Cancellation | Timeout aborts the connector via `AbortSignal`; there is no user-facing query-cancel endpoint |
| Result cache | 10 s in-process cache for detected read-only operations, bounded to 1,000 entries; not shared across replicas |
| Datasource cache | 30 s in-process cache for datasource instances, bounded to 100 entries |
| Result transforms | `queryTransformerVm.js` exists but no route/service call was found; treat it as unavailable |
| Retries | Direct query HTTP calls do not retry; Temporal retries workflow `dataQuery` activities by policy |
| Pagination | No query-level pagination; tables/pages implement it through inputs and refetch |

### Security implications

- SQL is raw. Parameterized `args` exist but are not mandatory; authors can
  concatenate inputs into SQL if they choose. Review query authoring as code.
- REST/GraphQL/Web URL/S3/SFTP/HTTP connectors can make outbound requests from
  the backend. There is no universal SSRF allowlist. Restrict container egress
  and metadata endpoints in production.
- Datasource credentials are decrypted server-side for execution. A user with
  query-execute permission can use the credential within the connector's
  capabilities, even if they cannot read the credential itself.
- Query result rows are returned as the connector produces them. There is no
  result-value redaction; a query that selects a secret column returns it to a
  caller with query-execute permission. Restrict query authoring and datasource
  credentials accordingly.

## 2. Widget coverage and application runtime

| Constraint | Reality |
|---|---|
| Normal renderers | 35 types in `WIDGETS_MAP`; `layout-snippet` is an internal saved-section type, not a normal page widget |
| Custom widgets | No runtime plugin loading; adding a widget requires code in `widget-types` + `widgets-ui` (+ logic/descriptors) and a rebuild |
| Application runtime allowlist | `application.compiler.js` allows a fixed set of top-level types and omits `html`, `iframe`, and `layout-snippet` |
| Top-level vs nested | The application runtime type check is applied to linked widget definitions, not recursively to inline children inside a composite |
| Widget methods | `CALL_WIDGET_METHOD` exists in the runtime, but not every widget type registers methods and the editor exposure varies |
| Widget-level datasources | Captured for authoring, but stripped from application runtime widgets; page data sources are the execution boundary |
| HTML/IFrame in applications | Top-level use is rejected at publish; composite inline HTML/IFrame is not explicitly re-checked (see below) |
| Server-side rendering | None; widgets render in the browser |
| PDF/image export of dashboards | Not a platform feature; individual widgets may offer CSV/JSON export |

The composite gap deserves emphasis: `collectPageWidgetIDs` and the compiler's
`RUNTIME_WIDGET_TYPES` check cover linked widgets. Composite children are
normalized by `normalizeCompositeLayout`, but the code reviewed does not
re-validate each inline child type against the allowlist. If you allow
untrusted page authors, treat composite publishing as a security-sensitive
operation until this is hardened.

## 3. Sandbox and iframe restrictions

### HTML widget

- The iframe is always sandboxed and **never receives `allow-same-origin`**,
  regardless of config. This is deliberate: `allow-scripts` + same-origin would
  escape the sandbox.
- Scripts, forms, and popups are off by default and individually opt-in.
- `postMessage` inbound is accepted only from the exact iframe window and only
  for the documented `jet-html-message` envelope with the widget ID. Because
  `srcDoc` frames have an opaque origin, origin allowlisting is not possible.
- The sandbox does **not** block network requests. Embedded CSS/HTML can load
  remote images/fonts and scripts (if enabled), so data can leave the browser.
- Expressions inside HTML/CSS are resolved before rendering. Treat HTML widget
  content as trusted author code, not sanitized user content.
- No CSP is injected beyond the iframe sandbox; you cannot configure a
  per-widget `Content-Security-Policy`.

### IFrame widget

- URL schemes are allowlisted to HTTP(S), relative URLs, `mailto:`, and `tel:`.
  `javascript:`, `data:`, `vbscript:`, `file:`, and `blob:` are blocked.
- `allow-same-origin`, `allow-scripts`, and `allow-forms` are configurable.
  Enabling `allow-same-origin` **and** `allow-scripts` removes the main
  isolation guarantee. If the embedded URL is same-origin with Jet Admin, it
  can reach host storage/cookies; if cross-origin, it gets its own origin
  context.
- `allow` can grant fullscreen and camera/microphone. Those permissions are
  browser-mediated but should be reviewed.
- Cross-origin pages can refuse embedding via `X-Frame-Options`/CSP; Jet Admin
  cannot override that.
- Embedded pages bring their own tracking, cookies, and network behavior.

### Other script surfaces

- Frontend `{{ }}` expressions run through `new Function` with shadowed
  globals. The source explicitly calls this "defence-in-depth, NOT a hard
  security boundary." A malicious author can likely escape it.
- Workflow JavaScript and listener transforms prefer `isolated-vm`.
  `workflow-nodes-logic/src/utils/vm.js` falls back to Node `vm` when the native
  `isolated-vm` binding is missing. Node `vm` is not a security boundary.
- Query/listener transform VMs require `isolated-vm` directly (16–64 MB,
  100 ms–5 s limits) and do not use the Node fallback.
- Application `expressionMode` can be `safe-path` for stricter evaluation, but
  the default is `trusted-js`. Strict mode is opt-in per application.

## 4. Nested composites and composition

- A composite captures a selected layout subtree and **inlines** child widget
  definitions. Later edits to the original widget definitions do not propagate.
- Capture is capped at **500 layout nodes** (`MAX_CAPTURE_NODES`). Larger
  selections fail.
- Nested composites are rejected at capture:
  `Nested composite widgets are not supported yet. Expand the child composite
  first.`
- Composite inputs are resolved from `composite.values` + defaults and exposed
  as `state.composite.inputs`. Output declarations are metadata; there is no
  general composite output-binding runtime beyond declared values/events.
- Composite children render through the normal `WIDGETS_MAP`; unsupported child
  types show "Unsupported composite child".
- Application compilation normalizes composite layouts and actions, but does
  not recursively enforce the top-level widget allowlist (see above).
- A composite is versioned as a widget asset, not as a separate composition
  format. Changing a child definition after capture requires re-capturing.

## 5. App state is browser-local

### Page variables

- Page variables live in the page runtime reducer. They reset on reload,
  navigation away, or runtime remount.
- They are not shared between users, tabs, or devices.
- There is no server-side page-state store or API.
- Layout/config autosave is not state persistence; it saves the page definition.

### Application state

Application state is the only designed persistence mechanism, and it is still
browser-local:

```text
jet-admin:application-state:v1:<tenantID>:<applicationID>:<principal>:release:<releaseID>
```

or `...:shared` when `resetOnRelease` is false. `principal` is the Firebase UID
in the runtime.

| Mode | Storage | Lifetime |
|---|---|---|
| `none` | None | Memory only |
| `session` | `sessionStorage` | Tab session |
| `local` | `localStorage` | Until cleared / browser policy |

Consequences:

- State is per browser and per principal. It is not available to another user,
  another browser, or a server-side workflow.
- `localStorage` is shared by tabs of the same origin; this runtime does not
  subscribe to `storage` events, so tabs can diverge and last-write-wins.
- Values are filtered on read and write by the current declarations, safe-JSON
  rules, and type matching. A declaration type change can silently drop values.
- Storage quota failures are swallowed (`writePersistedApplicationState`
  returns false); state may stop persisting without a user-visible error.
- Clearing site data, private browsing, or browser eviction loses state.
- `resetOnRelease: true` changes the storage key per release; old values remain
  in storage until cleared. The Studio "clear saved state" control removes all
  snapshots for the application.
- State is not encrypted at rest in the browser and must not hold secrets.

### Events

- Widget events and action chains are transient. A reload does not replay them.
- Application events (`EMIT_APPLICATION_EVENT`) are an in-memory bus scoped to
  the mounted runtime. They do not cross tabs, users, or page reloads.
- Payloads are capped at 64 KiB at compile time.
- Socket.IO events (`push_to_app_page`, workflow progress) are transient. A
  disconnected client can miss them.
- Listener `save_to_buffer` is the durable path. Application listener
  observation is cursor-based and bounded: initial read returns the latest 100
  retained events, subsequent reads return up to 100, and the response is
  capped at 2 MiB.
- Listener observation fails with `410` when the cursor anchor has expired,
  `409` when the listener definition changed since release, and `409` when the
  listener is inactive. Reopen the subscription to resynchronize.
- Listener pipeline delivery is **at-least-once**. A crash after a side effect
  but before `XACK` can replay the event. Make actions idempotent.
- Listener `push_to_app_page` has no durable cursor; use `save_to_buffer` for
  application runtime.

## 6. Release and application constraints

| Constraint | Value | Source |
|---|---|---|
| Application definition size | 256 KiB | `APPLICATION_LIMITS.bytes` |
| Routes per application | 100 | `APPLICATION_LIMITS.routes` |
| Application state variables | 100 | `APPLICATION_LIMITS.variables` |
| Linked pages per application | 100 | `application.service.js` |
| Release manifest size | 4 MiB | publish check |
| Runtime query result | 2 MiB | `runtimeExecute` |
| Runtime workflow result | 2 MiB | `runtimeExecute` |
| Runtime input values | 32 KiB | `runtimeExecute` |
| Action event payload | 64 KiB | compiler |
| Consumer policy entries | 200 | validator |
| Environment bindings | 100 | `normalizeBindings` |
| Environment name | 40 chars, lowercase/hyphen | validator |
| Preview widgets | 500 per page / application | preview service |
| Preview payload | 2 MiB | preview service |
| Workflow family observation | max 100 runs, depth 20 | runtime run-family lookup |
| Listener observation | latest 100 initial / 100 per cursor; 2 MiB | listener runtime |

Behavioral constraints:

- A release is immutable and **thin**: it stores the application definition and
  exact page version IDs. It does not duplicate page/widget payloads.
- Publishing with a pinned page version emits warnings if the live page or its
  dependencies changed since capture; it does not auto-update the pin.
- Publishing with no pinned page version captures the latest page state.
- Direct `TRIGGER_QUERY` and `TRIGGER_WORKFLOW` actions are removed at compile
  time. The action must be represented as a page data source alias first.
- The deployed runtime only accepts the local action allowlist:
  `SET_VARIABLE`, `SET_APPLICATION_VARIABLE`, `RESET_APPLICATION_STATE`,
  `EMIT_APPLICATION_EVENT`, `NAVIGATE`, `SHOW_TOAST`, `CALL_WIDGET_METHOD`,
  `EXECUTE_QUERY`.
- Top-level HTML/IFrame widgets are not in the runtime allowlist; composite
  inline children are a gap, not a supported exception.
- The Studio exposes `production`; the API supports named environments, but
  there is no canary, traffic split, staged rollout, or automatic rollout gate.
- Rollback is a pointer move to a retained release. External side effects
  (sent emails, third-party writes, workflow side effects) are not reversed.
- There is no application export/import, no application bundle, and no release
  pruning/retention policy.
- `clientManifest` intentionally drops full `pages`/`widgets` maps; runtime
  page manifests rehydrate from pinned asset versions.
- Listener data sources in a release require an enabled `save_to_buffer`
  action; the compiler rejects a listener without the buffer.
  `push_to_app_page` is optional and only adds transient socket delivery.
- Application runtime workflow starts are provenance-checked. A run started
  under another application/environment/page/alias/caller cannot be observed
  through this application.

## 7. Asset versioning and bundles

### Asset versions

- Supported types: `datasource`, `query`, `workflow`, `listener`, `widget`,
  `appPage`, `cronjob`. There is no version type for applications, folders,
  roles, or marketplace entries.
- A datasource version captures only title, description, and tags. Connection
  options, credentials, status, and OAuth tokens are excluded by design.
- Disabled queries and workflows cannot be captured (`ASSET_DISABLED`).
- Capture walks dependencies recursively and rejects cycles. It requires read
  permission on every dependency, so a user can fail to version an asset they
  can edit if they cannot read a child.
- Version numbers are serialized per `(tenant, type, asset)` with a PostgreSQL
  advisory lock. Capture uses a 180 s transaction timeout, 20 s max wait, and
  three retries for `P2028`/`P2034`.
- Identical content (same stable SHA-256 payload) reuses the latest published
  version instead of creating a duplicate. There is no "force new version"
  flag.
- Diff is structural and capped at 500 changes. The preview can be truncated.
- Impact analysis walks parent references up to depth 20 and filters releases by
  application read permission. Deeper graphs are not fully represented.
- Restore writes the version payload back into the live asset. It does **not**
  restore child assets, datasource credentials, or environment bindings, and it
  does not delete newer versions. A restore is itself snapshotted where the
  editor supports it.
- There is no automatic pruning. `tblAssetVersions` grows without bound unless
  an operator deletes rows manually. The app-page editor history is separate
  and capped at 50 snapshots per page.
- Hashes are integrity identifiers, not signatures. There is no signing,
  attestation, or tamper-evident chain.

### Bundles

- Bundle v1 only covers `appPage`, `widget`, `workflow`, `dataQuery`,
  `datasource`, and `listener`. Cron jobs and applications are not bundle items.
- Export is dependency-closure based and sanitized. Secrets are stripped;
  datasource entries carry `requiresReconnect: true`.
- Import always **creates** records with fresh UUIDs. There is no merge, update,
  or upsert mode.
- References outside the bundle cannot be remapped. Preview warns; execute may
  leave a query without a datasource or skip a listener.
- A listener whose datasource is not in the bundle is skipped, not failed
  atomically.
- Listener endpoint paths are auto-suffixed (`-2`, `-3`) on collision.
- The whole import runs in one transaction (120 s timeout). The request body is
  limited by the API JSON limit (5 MB by default), so very large bundles fail
  before the transaction.
- Creator access grants happen after commit. A grant failure can leave created
  assets with incomplete policies even though the data transaction succeeded.
- There is no import history, rollback, or "undo import" operation.
- Selective install (`selectBundleItems`) exists as a helper but is not exposed
  as a bundle route; widget-library install imports the full stored bundle.
- Bundles are untrusted input. Import strips sensitive keys again, but you
  should still scan JSON for unexpected fields and review dependencies.

## 8. Folders, library, and marketplace

### Folders

- Supported entity types: `widget`, `workflow`, `dataQuery`, `cronJob`,
  `appPage`, `listener`, `datasource`.
- Folder titles are max 255 characters. Duplicate names are allowed.
- There is no maximum depth, folder count, or child count enforced by the API.
- Server filtering is by one exact `folderID`; it does not include descendants.
  The explorer UI builds the tree client-side from the full list.
- Deleting a folder promotes child folders to its parent and un-files items via
  `ON DELETE SET NULL`; there is no recursive delete.
- Folders do not grant access. A move requires `folder.update` plus update
  permission on every moved entity.
- There is no folder-level ACL, sharing, color, ordering, or archive.
- Cross-entity moves are rejected because `entityType` must match.

### Widget library

- Entries are deployment-global, not tenant-owned. Any tenant with install
  permission can install any published entry.
- Publishing requires exactly one root widget item in the bundle. Dependency
  items are allowed.
- There is no semantic version, update channel, dependency constraint, rating,
  review, or signature. An entry is a snapshot.
- Installing creates independent copies; later library updates do not propagate.
- Unpublishing deletes the entry and does not affect installed copies.
- Tenant publish/unpublish routes exist and are permission-gated; the operator
  routes also exist. Do not expose publish rights to untrusted tenants without a
  review process.
- Install has no selective dependency picker in the route; it installs the
  stored bundle.

### Marketplace and app templates

- The integration marketplace is seeded/operator-managed. There is no tenant
  publish route.
- Marketplace items are bundle payloads, so they inherit every bundle
  limitation (no merge, secrets stripped, fresh IDs).
- App templates are **trusted server-side packages**, not sandboxed plugins.
  Install can execute schema/seed SQL against the platform `DATABASE_URL`,
  create roles and demo users, create cron jobs, and run bundle import.
- Uninstall can `DROP TABLE ... CASCADE` for prefixed template tables. Review
  the package and take a backup before install/uninstall.
- There is no template rollback, version pinning at install time (beyond the
  package version), or resource-level upgrade path. Reinstall cleans and
  recreates.
- Template assets are tenant-authenticated, not public, despite `Cache-Control:
  public` on the response.

## 9. Operational limits

### HTTP and payloads

| Limit | Value |
|---|---|
| Express JSON/urlencoded body | 5 MB (`EXPRESS_REQUEST_SIZE_LIMIT`) |
| Backend nginx client body | 10 MB (`CLIENT_MAX_BODY_SIZE`; legacy configs may differ) |
| Multer uploads (datasource/widget) | 10 MB |
| Webhook ingress body | 10 MB |
| MCP HTTP body | 5 MB |
| Application runtime input | 32 KiB |
| Application runtime query/workflow result | 2 MiB |
| Listener observation response | 2 MiB |
| Bundle import request | 5 MB (API limit) |

### Execution and queues

| Limit | Value |
|---|---|
| Query timeout | 60 s default; override per query/node |
| Query cache | 10 s TTL, 1,000 entries, per replica |
| Datasource cache | 30 s TTL, 100 entries, per replica |
| Workflow run timeout | 7 days default |
| Workflow task timeout | 30 s default |
| Node timeout | 120 s default; 1–3,600 s allowed |
| Node retries | 0 default; max 10 retries |
| Human-in-loop timeout | 24 h default |
| Loop iterations | max 100,000 |
| Listener Stream retention | `MAXLEN ~10,000` by default |
| Listener prefetch | 20 |
| Listener pending reclaim | 60 s scan, 5 min idle threshold |
| Cron lock TTL | timeout + 60 s, minimum 120 s |
| Audit buffer | 50 entries / 5 s flush |

### Process behavior

- **Redis is required for listener ingestion.** `queue.config.js` throws when
  `REDIS_URL` is missing. Backend startup catches the listener failure and the
  API stays up, but no listener events are consumed.
- **Redis is optional for Socket.IO fan-out.** Without the adapter, emits reach
  only sockets connected to the same replica. With the adapter, cross-replica
  room emits work.
- **Temporal is required for workflow execution.** There is no native engine.
  The backend starts an embedded worker and retries in the background; workflow
  starts fail while Temporal is unreachable.
- **Cron timers are process-local.** Redis locks plus occurrence CAS prevent
  duplicates when Redis is available. If Redis is configured but unreachable,
  the engine fails closed unless `CRON_LOCK_FAIL_OPEN=true` is explicitly set.
- **Cron timezone is the process timezone.** There is no per-job timezone field
  in the schema or UI.
- **Audit writes are best-effort.** The buffer is in memory; a crash can lose up
  to 50 entries / 5 seconds. A failed `createMany` drops the already-spliced
  batch. Audit is not a transactional ledger.
- **No retention policies** exist for workflow instances/logs, asset versions,
  cron history, or audit logs. Listener buffers retain only when a
  `save_to_buffer` retention policy is configured.
- **Single database primary.** There is no read-replica routing or sharding.
  Prisma's pool is the concurrency boundary.
- **No platform metrics or tracing.** Logging is Winston file/console (+
  optional syslog); there is no Prometheus `/metrics` or OpenTelemetry.
- **S3 storage is optional.** Without S3 configured, uploads fail. The bundled
  storage-init makes buckets publicly readable so public URLs work; do not use
  that policy for sensitive uploads.
- **App CI/CD is docs-only.** `.github/workflows` deploys Docusaurus, not the
  application images.

## 10. Multi-tenancy and security caveats

- **No PostgreSQL RLS.** Tenant isolation depends on every query including
  `tenantID`. A missed predicate is a cross-tenant leak.
- **Operator routes bypass Casbin.** Operator status is the grant. Protect
  operator credentials and the operator console network path accordingly.
- **Global registries are shared.** Widget library and marketplace entries are
  visible to all tenants; they are not tenant-scoped.
- **Webhook auth is listener-defined.** Supported modes are none, basic,
  bearer, custom header, and query param. There is no built-in HMAC signature
  verification for Stripe/GitHub/Shopify-style signatures.
- **Webhook endpoint paths can be enumerated** if tenant IDs and suffixes are
  predictable. Use a high-entropy suffix and listener auth.
- **API keys are tenant-bound** and can carry roles. A leaked key is a tenant
  compromise until disabled.
- **MCP stdio mode uses one API key/tenant per process.** Do not reuse a
  privileged key for multiple tenants.
- **AI tool calls run under the caller's permissions**, and mutating tools use
  an `askUser` confirmation gate. The LLM itself is not a security boundary;
  prompts can be manipulated.
- **CORS is an allowlist**, but webhook ingress intentionally uses open CORS.
- **Datasource egress can reach internal networks.** Add network policies and
  block cloud metadata endpoints.
- **Frontend expressions are not a sandbox.** Restrict page/widget authoring to
  trusted users, or use application `expressionMode: safe-path` where possible.

## 11. Verification gaps and code drift

These are not design promises; they are areas where the repository text and the
implementation disagree or where E2E verification is incomplete:

| Gap | Detail |
|---|---|
| Legacy workflow driver | `WORKFLOW_ENGINE_DRIVER` still exists in `environment.js`, but workflow code is Temporal-only and the variable has no consumer. Set the Temporal address, namespace, and task queue instead. |
| Applications E2E | README states live Temporal/Redis/listener-proxy verification remains blocked. Treat the application runtime as beta. |
| `tenant.allowedModules` | The model exists, but no enforcement path was found in tenant resolution. |
| Query transforms | `queryTransformerVm.js` is present but unwired. |
| Notifications | Only tenant-addition and list flows exist; there is no generic notification rules engine. |
| `apps/admin` | Legacy Vite app, superseded by `apps/frontend`; do not extend it. |
| Composite runtime allowlist | No recursive type check for inline composite children. |
| Application Studio environments | API supports arbitrary names; Studio focuses `production`. |

## Quick "supported vs not" matrix

| Capability | Supported? |
|---|---|
| 45 datasource connectors | Yes, with varying depth |
| Listener subscriptions for 13 types | Yes, via listener-proxy + Redis |
| Raw SQL writes | Yes, if the credential allows |
| Read-only SQL guarantee | No |
| 35 widget renderers | Yes |
| HTML/IFrame widgets on app pages | Yes, sandboxed/configurable |
| HTML/IFrame widgets in application runtime (top level) | No |
| Nested composites | No |
| Page state persisted server-side | No |
| Application state across users/devices | No |
| Durable listener events | Yes, via `save_to_buffer` |
| Exactly-once listener actions | No |
| Immutable asset versions | Yes, 7 types |
| Application export/import | No |
| Release rollback | Yes, pointer to retained release |
| Canary/traffic split | No |
| Folder hierarchy | Yes, unlimited depth |
| Folder ACLs | No |
| Widget library versioning | No |
| Trusted app-template DDL | Yes; treat as code execution |
| Multi-replica cron without Redis | No |
| Workflow execution without Temporal | No |

If a limitation blocks your use case, prefer a deployment-level workaround
(network policy, trusted authors, external scheduler) over assuming the platform
enforces it. For the architecture context behind these constraints, see
[Platform Architecture](./architecture.md) and
[Asset Versioning](./asset-versioning.md).
