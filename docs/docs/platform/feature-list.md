---
title: Feature Inventory
description: Exhaustive functionality inventory grouped by module, with maturity and current limits.
sidebar_position: 17
---

# Feature Inventory

This is the honest, code-derived inventory of what Jet Admin does today. It is
grouped by module and uses the following maturity labels:

| Label | Meaning |
|---|---|
| **Stable** | Primary code path, exposed in the UI/API, expected to work in normal operation |
| **Beta** | Shipped but still evolving; validate in your deployment before relying on it |
| **Experimental** | Code exists but is opt-in, narrowly scoped, or not recommended for critical flows |
| **Internal** | Service/config primitive with no first-class UI |
| **Not implemented** | No code path exists today; listed to prevent assumptions |

Maturity is not a security rating. See [Limitations](./limitations.md) for
operational and security caveats.

## 1. Tenancy, identity, and access

| Feature | Maturity | Notes |
|---|---|---|
| Multi-tenant data isolation | Stable | Every tenant asset carries `tenantID`; Casbin domain plus scoped queries |
| Firebase user sign-in | Stable | Frontend Firebase SDK; backend verifies ID tokens |
| Tenant API keys | Stable | Prefix + hash lookup, roles, disable, clone |
| Tenant membership | Stable | Users can belong to multiple tenants; membership role `ADMIN`/`MEMBER` plus custom roles |
| Custom tenant roles | Stable | Roles map to permission titles; Casbin policies synced from DB |
| Permission registry | Stable | `config/permissions.json` is the single source; route code uses `P.*` |
| Creator access grants | Stable | Creating a resource grants the creator read/update/delete/clone policy |
| Tenant creation/deletion | Stable | Delete is a service-level cascade across tenant assets |
| Tenant logo upload | Stable | 10 MB multer cap; S3-backed |
| Tenant AI configuration | Stable | Encrypted vault credential; per-tenant key wins over workspace key |
| Operator realm | Beta | Separate `tblOperators` table, PBKDF2 passwords, opaque sessions; no Casbin |
| Operator role/permission registry | Beta | Global roles and permissions managed through operator console API |
| Google OAuth for datasources | Stable | Auth URL + callback; state signed with `OAUTH_STATE_SECRET`; credentials in vault |
| User notifications | Beta | Tenant-addition notification and notification list; no generic notification API |
| API-key roles/permissions | Stable | Mapping tables and Casbin policy assignment |
| Audit log viewer + CSV export | Stable | Date/search/entity filters; CSV export not paginated |
| Tenant config `allowedModules` | Experimental | Model exists; no first-class enforcement path found in tenant resolution |

## 2. Datasources

45 connector types are registered in `@jet-admin/datasource-types` and
implemented in `@jet-admin/datasources-logic`:

| Category | Connectors |
|---|---|
| SQL / warehouses | PostgreSQL, MySQL, SQL Server, Oracle, SQLite, CockroachDB, ClickHouse, DuckDB, BigQuery, Supabase |
| NoSQL / search / metrics | Firestore, MongoDB, Neo4j, Redis, Elasticsearch, InfluxDB, Prometheus |
| Files / SaaS data | Google Sheets, Airtable, Excel & CSV, AWS S3, File System, SFTP |
| APIs / SaaS actions | REST API, GraphQL, Web URL, GitHub, GitLab, LDAP, SMTP, Slack, Stripe, Twilio, SendGrid, Notion, Jira, Google Analytics |
| Events / streams | Kafka, RabbitMQ, NATS, MQTT, Webhook, WebSocket, SSE, Syslog |

| Feature | Maturity | Notes |
|---|---|---|
| Datasource CRUD | Stable | Title/type/options; clone; folder support; export as bundle |
| Dynamic connection forms | Stable | Per-type JSON forms from `datasource-types` |
| Connection test | Stable | Unsaved `POST /test` and saved `POST /:id/test` / `GET /:id/health` |
| JSON endpoint validation | Beta | REST-specific `POST /test-json` checks parseable JSON vs SPA shell |
| Encrypted credentials at rest | Stable | AES-256-GCM via `VAULT_ENCRYPTION_KEY`; vault credentials for OAuth/AI |
| OAuth helper popup flow | Stable | Google; stores provider credentials in vault |
| Datasource proxy helpers | Beta | `POST /:id/proxy` for connector-specific editor actions |
| File upload for file-based sources | Stable | 10 MB limit; S3-compatible storage |
| Datasource clone/export | Stable | Clone with fresh ID; export is a structural template only (`requiresReconnect: true`) |
| Listener-capable connectors | Stable | PostgreSQL, Firestore, MongoDB, GraphQL, RabbitMQ, Kafka, Redis, Webhook, MQTT, WebSocket, SSE, Syslog, NATS |
| Connector-level query capabilities | Varies | Each connector implements its own execute/listener methods; not every type supports every operation |
| Read-only query enforcement | Not implemented | Credential/database permissions are the boundary |
| Universal row/statement limits | Not implemented | Connector/database controls only |
| Automatic retry/circuit breaker for queries | Not implemented | Temporal retries workflow nodes; direct query HTTP calls do not |

## 3. Data queries

| Feature | Maturity | Notes |
|---|---|---|
| Query CRUD | Stable | Title, options, `runOnLoad`, folder |
| Connector-specific query editors | Stable | SQL editors for several SQL types; JSON forms otherwise |
| Input arguments | Stable | `{{inputs.*}}` resolved server-side |
| Ad-hoc test without saving | Stable | `PATCH /queries/queryTest` |
| Saved query test/run | Stable | `POST /:id/queryTest`, `POST /:id/run` |
| Result transforms | Not implemented | `queryTransformerVm.js` exists (5 s / 64 MB limits) but no route or service call was found; treat result transforms as unavailable |
| Query schema discovery | Stable | `GET /queries/schemas` returns per-datasource forms |
| Clone / export | Stable | Fresh IDs on clone; bundle export with datasource dependency |
| Query version pinning | Beta | Optional `queryVersionID` used by workflow/app capture |
| Execution timeout | Stable | Default 60 s (`QUERY_TIMEOUT_SECONDS`), override per query or workflow node; abort signal passed to connectors |
| Read-only result cache | Stable | 10 s in-process TTL for read-only SQL/HTTP/GraphQL/etc.; bounded 1,000 entries; invalidated on query update/delete |
| Query-level pagination | Not implemented | Pagination is a page/table concern |
| Query cancellation API | Not implemented | Timeout aborts the connector call; there is no user-facing cancel route |
| Distributed result cache | Not implemented | Cache is per backend replica, not Redis-backed |

## 4. Workflows

| Feature | Maturity | Notes |
|---|---|---|
| Visual workflow editor | Stable | React Flow canvas, node configurators, JSON Forms |
| Graph persistence | Stable | Nodes/edges stored relationally; positions in `nodeConfig` |
| Graph validation | Stable | `workflow.references.js` + `validateExecutableGraph` |
| Temporal execution | Stable | Native engine removed; task queue `jet-admin-workflows` |
| Test run without saving | Stable | In-memory graph; marked `isTest`; separate stop/delete |
| Run history and logs | Stable | `tblWorkflowInstances` + append-only instance logs |
| Run cancellation | Stable | Temporal cancel; terminal runs return no-op |
| Workflow streaming to UI | Beta | Socket.IO progress + polling/status endpoints |
| Input/output definitions | Stable | Workflow inputs and node output variables |
| Per-node timeout/retry policy | Stable | Node > workflow `nodeOptions` > platform defaults |
| Sub-workflows | Stable | `subWorkflow` node; version pinning supported |
| Loops | Stable | `loop` node with max 100,000 iterations and per-item error policy |
| Condition/switch branching | Stable | Operators plus expression mode |
| JavaScript nodes | Stable | `isolated-vm` preferred; Node `vm` fallback exists |
| Fanout/join | Beta | Parallel branches with all/any join semantics |
| Human approval | Beta | Approve/reject/timeout; 24 h default human timeout |
| Data collection (form) | Beta | UI form mode; API mode labelled "coming soon" |
| Data collection submission delivery | Beta | `submissionDelivery` background service |
| Workflow run retention/cleanup | Not implemented | No automatic pruning of instances or logs |
| Cron-triggered workflows | Stable | See Cron jobs |
| Listener-triggered workflows | Stable | `trigger_workflow` listener action |
| Workflow clone/export | Stable | Clone with fresh IDs; export includes query/datasource closure |
| Node schema discovery | Stable | `GET /workflows/schemas` for editor/MCP |
| Test-instance cleanup | Stable | Stop/delete endpoint restricted to `isTest` runs |

## 4a. Cron jobs

| Feature | Maturity | Notes |
|---|---|---|
| Cron job CRUD | Stable | Title, schedule, workflow, inputs, disabled flag |
| Cron expression validation | Stable | `node-cron` parser validation |
| Scheduling | Stable | In-process `node-cron` timers; `nextRunAt`/`lastScheduledAt` persisted |
| Distributed lock | Beta | Redis lock per cron job; fail-closed when Redis is configured but unreachable |
| Occurrence dedupe | Stable | Per-second `(cronJobID, scheduledFor)` CAS update |
| Timeout/retry | Stable | `timeoutSeconds`, `retryAttempts`, `retryDelaySeconds` |
| Run history | Stable | `tblCronJobHistory` with status, duration, result, trigger type |
| Clone | Stable | Fresh ID, same workflow/schedule |
| Manual “run now” API | Not implemented | Only scheduled execution; workflows can be run directly |
| Timezone selection | Not implemented | Expressions evaluate in the backend process timezone |
| History retention | Not implemented | No automatic pruning |
| Pause/resume | Partial | `isDisabled` is the only switch; no pause-until |

## 5. Listeners

| Feature | Maturity | Notes |
|---|---|---|
| Listener CRUD | Stable | Bound to one datasource |
| Activate/deactivate | Stable | Proxy subscription lifecycle |
| Webhook ingress | Stable | `/webhooks/v1/inbound/:tenantID/:pathSuffix` and `/:listenerID` |
| Webhook auth | Stable | None, basic, bearer, custom header, query param |
| Provider HMAC verification | Not implemented | No Stripe/GitHub-style signature verification built in |
| Event transforms | Stable | 100 ms / 16 MB isolated-vm sandbox |
| Trigger workflow action | Stable | Runs Temporal workflow with event inputs |
| Trigger query action | Stable | Synchronous query dispatch |
| Save to buffer | Stable | `tblListenerEvents`; optional count/time retention |
| Push to app page | Stable | Socket.IO room emit; transient |
| Event history UI/API | Beta | Connection status and event counts; no generic event browser |
| Listener test streaming | Beta | Room-based test stream |
| Proxy sharding/failover | Stable | Redis registry, consistent hash, 30 s sweeper |
| DLQ | Stable | Failed envelopes go to `listener:events:dlq` |
| Exactly-once action execution | Not implemented | Stream pipeline is at-least-once; actions must be idempotent |
| Listener buffer default retention | Not implemented | Unconfigured `save_to_buffer` can grow unbounded |
| Listener clone/export | Stable | Fresh IDs on clone; export includes datasource/action dependencies |
| Subscription ingress in backend | Not implemented by design | Owned by `apps/listener-proxy` only |

## 6. Widgets

35 normal renderers (+ internal `layout-snippet`):

| Category | Widget types |
|---|---|
| Analytics | Vega-Lite, Vega, Stat, Progress |
| Data display | Table, Key Value, JSON Viewer, List, Timeline, Badge |
| Inputs | Button, Form, Text Input, Select, Multi Select, Checkbox, Radio Group, Switch, Slider, Search Input, File Upload, Date Picker, Date Range Picker |
| Content / media | Text/Markdown, Image, Video, IFrame, HTML, Code Block |
| Structure | Tabs, Divider, Composite |
| Planning | Kanban, Calendar |
| Feedback | Alert |

| Feature | Maturity | Notes |
|---|---|---|
| Widget CRUD | Stable | Type + config validated against descriptors |
| Config normalization | Stable | Legacy aliases migrated; unknown keys preserved |
| Event/action system | Stable | Click, load, refresh, table, form, picker, HTML message events |
| Widget methods | Beta | `refresh`, selection, resize, click; editor exposure varies |
| Widget-level data sources | Beta | Authoring convenience; not sent to application runtime |
| Widget file upload | Stable | 10 MB cap |
| Widget clone/export | Stable | Bundle includes query/workflow dependencies |
| Widget library publish/install | Beta | See Widget Library |
| Composite creation | Beta | Capture canvas section; inline child definitions |
| Nested composites | Not implemented | Explicitly rejected at capture |
| HTML widget | Stable | Sandboxed iframe; scripts/forms/popups opt-in; never same-origin |
| IFrame widget | Stable | URL scheme allowlist; sandbox flags configurable |
| Custom React/JS widget plugins | Not implemented | Widget types are compiled into the app |

## 7. App pages and page editor

| Feature | Maturity | Notes |
|---|---|---|
| App page CRUD | Stable | Title, description, JSON config |
| Craft.js visual editor | Stable | Drag/drop rows, columns, containers, stacks, z-stack |
| V2 layout tree | Stable | Root must be `column`; span 1–12 |
| Widget placement | Stable | Instance keys `widget_<id>_<suffix>` |
| Page data sources | Stable | Query/workflow/listener aliases, trigger modes, inputs, refetch |
| Page variables | Stable | string/number/boolean/object/array; memory only |
| Expression binding | Stable | `{{ }}` with JS expressions and autocomplete |
| Real-time listener subscriptions | Stable | Socket.IO channel per listener data source |
| Workflow streaming | Beta | Node-by-node progress into state tree |
| Page clone/export | Stable | Bundle with dependency closure |
| Editor history | Stable | 50 snapshots per page; restore snapshots current state first |
| Version history UI | Stable | List/view/restore editor snapshots |
| Unsaved-change undo | Stable | Session-local layout undo |
| Layout V1 → V2 migration | Stable | Automatic on load; `_legacyLayouts` backup |
| Page-level access control | Stable | Page permission plus execute checks on referenced assets |
| Server-side page state | Not implemented | Page variables live in the browser runtime |
| Page scheduling/embedding outside applications | Not implemented | Use an application runtime or the internal route |

## 8. Applications

Applications are a **Beta foundation preview** per the repository README.

| Feature | Maturity | Notes |
|---|---|---|
| Application CRUD/archive | Beta | Title, slug, description, status; archive without deleting assets |
| Draft + revision concurrency | Beta | `expectedRevision` optimistic locking |
| Shell configuration | Beta | sidebar/topbar/bottom-bar/hamburger; appearance/branding |
| Route declarations | Beta | Path, params, typed query, title, parent route, keep-alive |
| Route guards | Beta | Fail-closed expression; redirect route |
| Not-found and home routes | Beta | Route IDs in shell |
| Application state variables | Beta | Declared types/defaults; 100-variable limit |
| State persistence | Beta | `none`/`session`/`local`; per principal; optional release reset |
| Page asset linking | Beta | `referenced` or `managed` page copies; max 100 linked pages in this phase |
| Page-version pinning | Beta | Select exact page version or capture latest at publish |
| Draft validation/preview | Beta | Diagnostics; execution-disabled composition preview |
| Immutable release publish | Beta | Thin release with exact page version IDs |
| Release history/rollback | Beta | Deploy older retained release; pointer-only |
| Environment deployments | Beta | API supports arbitrary names; Studio focuses `production` |
| Datasource bindings | Beta | Up to 100 mappings; same-type validation; revision history |
| Consumer route/action policy | Beta | Up to 200 entries; user/role/API-key subjects |
| Runtime manifest | Beta | Client-safe definition; no live query/workflow IDs |
| Runtime page manifest cache | Beta | Keyed by release/page version/binding/policy revision/route |
| Runtime action allowlist | Beta | App state set/reset, application events, navigation, toast, widget method, pinned page query |
| Route query/parameter sync | Beta | Typed query params; optional page-variable synchronization |
| Pinned query execution | Beta | Alias-based execute endpoint resolves captured query version |
| Pinned workflow execution | Beta | Start/status/cancel via release-scoped routes |
| Durable listener observation | Beta | Requires an enabled `save_to_buffer` action; `push_to_app_page` adds transient socket delivery; cursor-based |
| Workflow run history | Beta | Filtered by application/environment provenance |
| Application export/import | Not implemented | Bundles do not cover applications |
| Canary/traffic splitting | Not implemented | One current release per environment |
| Release retention/pruning | Not implemented | Releases are retained indefinitely |
| Application-level effect classification | Not implemented | Query/workflow definitions determine behavior |
| Live Temporal/Redis/listener-proxy E2E verification | Not implemented | Called out as blocked in README |

## 9. Asset versioning

| Feature | Maturity | Notes |
|---|---|---|
| Seven asset types | Beta | datasource, query, workflow, listener, widget, appPage, cronjob |
| Immutable capture | Beta | No update/delete route for versions |
| Content-addressed dedupe | Beta | SHA-256 stable JSON; identical content reuses latest |
| Dependency capture | Beta | Queries, workflows, widgets, pages, listeners, datasources |
| Version pinning modes | Beta | `latest-at-capture` or `specific` |
| Version list/get | Beta | Paginated per asset |
| Diff vs draft/version | Beta | 500-change cap; dependency-change summary |
| Impact analysis | Beta | Parent versions up to depth 20 plus releases/environments |
| Restore to draft | Beta | Optimistic `expectedUpdatedAt`; snapshots before restore |
| Version retention/pruning | Not implemented | No automatic cleanup |
| Version signatures/attestations | Not implemented | Hashes are integrity checks, not signatures |
| Secret/connection versioning | Not implemented by design | Credentials excluded; environment bindings handle targets |

## 10. Bundles

| Feature | Maturity | Notes |
|---|---|---|
| Export roots | Stable | app page, widget, workflow, query, listener, datasource |
| Dependency closure | Stable | Deep-scanned refs plus explicit dependencies |
| Topological ordering | Stable | Dependencies first; importer re-orders |
| Secret stripping | Stable | Recursive sensitive-key removal; import strips again |
| Preview import | Stable | Create plan, title collisions, missing deps, endpoint collisions |
| Execute import | Stable | Single transaction, fresh UUIDs, reference remapping |
| Listener endpoint suffixing | Stable | `-2`, `-3`, … |
| Listener skip on missing datasource | Stable | Skipped with reason instead of failing bundle |
| Creator access after import | Stable | Granted post-commit |
| Selective install | Beta | `selectBundleItems` helper exists; not exposed as a bundle route |
| Update/merge import | Not implemented | Import always creates new records |
| Rollback/undo import | Not implemented | No import history or inverse operation |
| Bundle signing | Not implemented | Treat files as untrusted input |
| Application bundle | Not implemented | Not part of bundle v1 |

## 11. Folders

| Feature | Maturity | Notes |
|---|---|---|
| Per-entity folder trees | Stable | `(tenantID, entityType)` scope |
| Entity types | Stable | widget, workflow, dataQuery, cronJob, appPage, listener, datasource |
| Create/rename/reparent | Stable | Cycle prevention server-side |
| Delete | Stable | Children promoted; items un-filed |
| Bulk move | Stable | Per-entity update permission required |
| Folder list filter | Stable | Exact `folderID`; omitting returns all |
| Drag/drop explorer UI | Stable | Folder and item drag; search falls back flat |
| Duplicate folder names | Allowed | No uniqueness constraint |
| Depth/count limits | Not implemented | No max depth or folder count |
| Recursive subtree filtering | Not implemented | Server filter is exact folder only |
| Folder-level ACL | Not implemented | Folder permission plus item permissions |

## 12. Shared widget library

| Feature | Maturity | Notes |
|---|---|---|
| Deployment-wide registry | Beta | One `tblWidgetLibrary` table |
| Publish widget bundle | Beta | Exactly one root widget item |
| Tenant publish | Beta | Tenant route requires `widgetLibrary.publish` |
| Operator publish | Beta | Operator route bypasses tenant Casbin |
| Browse/search/paginate | Beta | Title/description/type search |
| Preview install | Beta | Standard bundle dry run |
| Install | Beta | Full bundle import, fresh IDs |
| Unpublish | Beta | Deletes registry entry only |
| Versioning/update channel | Not implemented | No semver or update flow |
| Ratings/reviews/verification | Not implemented | Marketplace has a verified flag; library does not |
| Selective dependency install | Not implemented | Installs the stored bundle |

## 13. Marketplace and app templates

| Feature | Maturity | Notes |
|---|---|---|
| Integration store | Beta | Datasource/widget/workflow/appTemplate items |
| Search/filter/pagination | Beta | Type, category, verification ordering |
| Item detail | Beta | Payload must be a valid bundle |
| Preview/install item | Beta | Reuses bundle import |
| Install counter | Beta | Incremented after install |
| Operator verify/unpublish | Beta | Global registry |
| Tenant publish item | Not implemented | No tenant route; catalog is seeded/operator-managed |
| App template gallery | Beta | Filesystem packages + DB assets |
| Template install | Beta | Can run schema/seed SQL, create roles/demo users/cron, import bundle |
| Template uninstall | Beta | Drops prefixed tables with `CASCADE`; removes ledger/resources |
| Template reinstall | Beta | Existing install is cleaned then reinstalled |
| Template asset serving | Beta | Tenant-authenticated `GET /templates/:slug/assets/*`; responses carry `Cache-Control: public, max-age=300` |
| Template sandboxing | Not implemented | Packages are trusted server-side code/SQL |
| Rollback of template install | Not implemented | Uninstall is destructive; no snapshot restore |

## 14. AI agent and MCP

| Feature | Maturity | Notes |
|---|---|---|
| Jet Agent chat | Beta | Vercel AI SDK stream; client owns history |
| Tenant/workspace model config | Beta | Vault `ai_config` wins; OpenRouter-compatible |
| Model fallback chain | Beta | Retries on 429/5xx/overload |
| MCP tool execution | Beta | Backend → MCP HTTP → backend REST under caller token |
| MCP stdio server | Beta | One API key/tenant per process |
| MCP resources | Beta | Registered resource documents |
| User confirmation for mutations | Beta | `askUser` confirmation gate for high-impact tools |
| Chat history persistence | Not implemented | Stateless backend; `DELETE /session` is a compatibility no-op |
| Offline/local model | Not implemented | Requires OpenAI-compatible or Google model endpoint |
| AI action audit | Beta | Tool calls go through normal audited REST APIs |

## 15. Operations and developer experience

| Feature | Maturity | Notes |
|---|---|---|
| Health endpoint | Stable | `GET /health`; used by Docker/Render |
| Docker Compose stack | Stable | Frontend, backend, Postgres, Redis, listener-proxy, Temporal |
| Dedicated Temporal worker | Stable | Optional separate worker process; embedded worker shares the same task queue |
| Optional S3/RustFS storage | Stable | `--profile storage`; bucket init makes objects public |
| Optional MCP container | Beta | `--profile mcp`; requires Firebase credentials |
| Docs site | Stable | Docusaurus; GitHub Pages deploy on `main`/`dev` |
| App CI/CD | Not implemented | Workflows only build/deploy docs |
| Database migrations | Stable | Prisma migrate deploy + manual migration runner |
| Seed data | Beta | `SEED_DATABASE=true` in Docker entrypoint |
| Logging | Stable | Winston file/console, optional syslog, 7-day retention |
| Request tracing | Not implemented | No OpenTelemetry/Jaeger integration |
| Metrics endpoint | Not implemented | No Prometheus `/metrics` for the platform itself |
| Backup/restore scripts | Beta | `scripts/backup-db.sh`; retention env |
| Multi-replica cron safety | Beta | Redis lock + occurrence CAS; fail-closed on Redis outage |
| Multi-replica socket fan-out | Stable | Redis adapter when configured |
| Multi-replica listener consumption | Stable | Redis Streams consumer group |
| Read replicas / sharding | Not implemented | Single primary database |

## 16. Frontend experience

| Feature | Maturity | Notes |
|---|---|---|
| Responsive app shell | Stable | Protected layout, tenant sidebar, drawers |
| Entity drawers with folders | Stable | Shared explorer tree |
| Global search in drawers | Stable | Server-side search/text filters |
| TanStack Query cache | Stable | Query keys include principal + tenant |
| Notifications/toasts | Stable | Success/error display |
| Keyboard/command palette | Not implemented | No global command palette found |
| Offline mode | Not implemented | SPA requires API/socket connectivity |
| Theming | Stable | Tailwind tokens, dark mode in editors |
| Internationalization | Beta | Application definition supports locales; UI copy is English |
| Accessibility | Varies | Radix primitives help; not audited end-to-end |
| Mobile-native app | Not implemented | Web only |

## Explicitly absent or partial

These are commonly assumed but do not exist as first-class features:

- Application export/import and application bundles.
- Server-side application/page state shared across users.
- Release traffic splitting, staged rollout, or automatic rollback.
- Asset-version or release retention policies.
- HMAC signature verification for third-party webhooks.
- A generic notification rules engine.
- A query result cache or query cancellation route.
- Per-folder ACLs or recursive folder filtering.
- Widget plugin loading at runtime.
- Read-only SQL enforcement independent of credentials.
- Built-in platform metrics/tracing.
- Any tenant-level marketplace publishing UI.

For the operational consequences, read [Limitations](./limitations.md).
