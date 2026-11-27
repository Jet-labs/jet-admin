---
title: API Reference
description: Conventions, auth headers, route inventory, request/response examples, errors, webhooks, and Socket.IO events.
sidebar_position: 18
---

# API Reference

The backend is an Express JSON API. All resource routes are tenant-scoped under `/api/v1/tenants/:tenantID/...`; platform/operator routes are separate. This page documents conventions and representative endpoints, not an exhaustive OpenAPI file. For exact Zod shapes, read the module's `<module>.validator.js`.

## Base URL and versioning

| Environment | Base URL |
|---|---|
| Local backend | `http://localhost:8090` |
| Docker Compose | `http://localhost:8090` (host) → container nginx `:3000` → Node `:3001` |
| Same-origin frontend | `https://app.example.com` (frontend nginx proxies `/api`) |

Only `v1` exists. There is no content negotiation, no API version header, and no deprecation framework. Additive fields are considered compatible; removing fields is not.

## Request conventions

- Content type: `application/json` for API requests. Multipart upload endpoints use `multipart/form-data`.
- IDs: UUID strings. Invalid UUIDs are rejected by Zod before the service runs.
- Dates/timestamps: ISO 8601 strings in JSON; PostgreSQL `timestamptz` is serialized by Prisma.
- Pagination: `page` (1-based) and `pageSize`. Standard lists default to `20`, max `100`; explorer-style lists (widgets, workflows, queries, app pages, listeners, cron jobs) default to `1000`, max `1000`. Datasource lists use the standard pagination schema.
- Folder filtering: most entity lists accept `?folderID=<uuid>`; `search` is supported where the module implements it.
- Unknown keys: many schemas use `.passthrough()` for forward compatibility. Do not rely on the server stripping unknown fields.
- No idempotency keys. Clone/import operations create fresh IDs each call.

## Authentication

| Identity | Header | Notes |
|---|---|---|
| End user | `Authorization: Bearer <Firebase ID token>` | Verified per request with `FIREBASE_CREDENTIALS`; user resolved by `firebaseID`. |
| API key | `Authorization: api_key <raw-key>` | 8-char prefix lookup, SHA-256 hash + timing-safe compare; disabled keys fail immediately. |
| Operator | `Authorization: Bearer <opaque-session>` | Only `/api/v1/operator*`; 12-hour session, separate identity store. |

Most tenant resource routes additionally require a Casbin allow policy in the domain `:tenantID`; tenant creation and logo upload are auth-only exceptions. Some routes (AI, auth config) also require a membership row in `tblUsersTenantsRelationship`.

```bash
export API=https://app.example.com
export TENANT_ID=00000000-0000-0000-0000-000000000000

# User token
curl -s "$API/api/v1/tenants/$TENANT_ID/queries" \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN"

# API key
curl -s "$API/api/v1/tenants/$TENANT_ID/queries" \
  -H "Authorization: api_key $JET_ADMIN_API_KEY"
```

### Operator login

```bash
curl -s -X POST "$API/api/v1/operator/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"<password>"}'
```

```json
{
  "success": true,
  "operator": { "operatorID": "…", "email": "admin@example.com", "operatorTitle": "Platform Admin" },
  "token": "<opaque-session-token>",
  "expiresAt": "2026-11-27T18:00:00.000Z"
}
```

The raw session token is returned once; only its SHA-256 hash is stored. `POST /api/v1/operator/auth/logout` revokes it, and `GET /me` returns the current operator.

## Response envelope

Success responses use `expressUtils.sendResponse(res, true, data, null, status)`, which **spreads** `data` at the top level:

```json
{
  "success": true,
  "datasource": { "datasourceID": "…" },
  "message": "Datasource fetched successfully."
}
```

List endpoints vary in key names (`datasources`, `dataQueries`, `workflows`, `widgets`, `appPages`, `listeners`, `auditLogs`) but keep the `success` flag and usually include pagination counts. Read the endpoint example or controller for the exact key.

Error responses use a normalized object:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "widgetType: Unknown widgetType 'chart'.",
    "details": {
      "issues": [
        { "path": ["widgetType"], "message": "Unknown widgetType 'chart'." }
      ]
    }
  }
}
```

`errorUtils.extractError()` normalizes arrays/validation errors, `Error` instances, PostgreSQL errors, nested `{error}`, and primitives. Stack traces are included only when `NODE_ENV=development`.

### Status mapping

| Code | HTTP | Typical cause |
|---|---|---|
| `PERMISSION_DENIED` | 403 | Casbin deny, missing tenant domain policy |
| `INVALID_API_KEY` | 401 | Unknown/disabled API key |
| `USER_AUTH_TOKEN_EXPIRED` / `USER_AUTH_TOKEN_NOT_FOUND` | 401 | Bad/expired/missing Firebase token |
| `INVALID_LOGIN` | 401 | Bad operator credentials |
| `VALIDATION_ERROR` | 400 | Zod rejection; `details.issues` |
| `INVALID_REQUEST` | 400/404 | Bad route shape or unknown path |
| `INVALID_TENANT_REFERENCE` | 400 | Referenced asset belongs to another tenant |
| `WIDGET_CONFIG_INVALID` | 400 | Widget descriptor validation |
| `AI_DISABLED` | 403 | No workspace or tenant AI key |
| `AI_TOOLS_UNAVAILABLE` | 503 | MCP server absent/unreachable |
| `AI_RATE_LIMITED` / `AI_MODEL_FAILED` | 429/502 | Upstream model errors |
| anything else | `err.statusCode` or 500 | Service/global error handler |

Many controllers catch service errors and explicitly return `400` even when a more specific code might apply. Do not infer business meaning from `400` alone; read `error.code`.

Unknown paths return `404`:

```json
{ "success": false, "error": { "code": "INVALID_REQUEST", "message": "Invalid request" } }
```

## Top-level routes

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | none | `{status:"ok", timestamp}`; liveness only |
| GET | `/api/v1/auth` | user/API key | Current user, creates `tblUsers` on first login |
| GET | `/api/v1/auth/config/:tenantID` | user/API key + membership | Per-user tenant config |
| POST | `/api/v1/auth/config/:tenantID` | user/API key + membership | Update per-user tenant config |
| GET | `/api/v1/tenants` | user/API key | Tenants visible to the caller |
| POST | `/api/v1/tenants` | user/API key | Create tenant (returns `200`, not `201`) |
| GET | `/api/v1/tenants/:tenantID` | `tenant.read` | Tenant details |
| PATCH | `/api/v1/tenants/:tenantID` | `tenant.update` | Update title/logo |
| DELETE | `/api/v1/tenants/:tenantID` | `tenant.delete` | Delete tenant |
| POST | `/api/v1/tenants/upload-logo` | user/API key | Multipart field `file`, 10 MB |
| GET | `/api/v1/tenants/:tenantID/ai-config` | `tenant.read` | Vault-backed AI config; currently returns the stored `apiKey` to the caller |
| POST | `/api/v1/tenants/:tenantID/ai-config` | `tenant.update` | Upsert AI config |
| POST | `/api/v1/tenants/:tenantID/ai/chat/stream` | `ai.chat` + membership | AI SDK UI stream |
| DELETE | `/api/v1/tenants/:tenantID/ai/session` | `ai.delete` | No-op stateless session reset |
| GET | `/api/v1/oauth/google/auth/:tenantID` | `datasource.update` | Google OAuth URL |
| GET | `/api/v1/oauth/:tenantID/google/url` | `datasource.update` | Alias for the OAuth URL |
| GET | `/api/v1/oauth/google/callback` | none | Public callback; 10-min JWT state |

### Operator routes

All require an operator bearer session. There is deliberately no Casbin enforcement on this surface.

| Method | Path | Notes |
|---|---|---|
| POST | `/api/v1/operator/auth/login` | Email + password → session |
| POST | `/api/v1/operator/auth/logout` | Revoke current session |
| GET | `/api/v1/operator/auth/me` | Current operator |
| GET / POST | `/api/v1/operator/roles` | Global role registry |
| PATCH / DELETE | `/api/v1/operator/roles/:roleID` | Update/delete any role |
| GET / POST | `/api/v1/operator/permissions` | Permission registry |
| GET / POST | `/api/v1/operator/widget-library` | List/publish shared widgets |
| DELETE | `/api/v1/operator/widget-library/:libraryEntryID` | Unpublish |
| GET | `/api/v1/operator/marketplace` | List marketplace items |
| PATCH / DELETE | `/api/v1/operator/marketplace/:itemID` | Verify/unpublish |

## Tenant routes

All paths below are relative to `/api/v1/tenants/:tenantID`.

### Members, roles, and API keys

| Prefix | Endpoints | Permission |
|---|---|---|
| `/users` | `GET /`, `POST /`, `GET /:tenantUserID`, `DELETE /:tenantUserID`, `PATCH /:tenantUserID/roles` | `user.*` |
| `/roles` | `GET /`, `POST /`, `GET /permissions`, `GET /:roleID`, `PATCH /:roleID`, `DELETE /:roleID`, `POST /sync-policies` | `role.*`, `permission.list` |
| `/apikeys` | `GET /`, `POST /`, `GET /:apiKeyID`, `PATCH /:apiKeyID`, `DELETE /:apiKeyID`, `POST /:apiKeyID/clone` | `apikey.*` |

Create API key request: `{ "apiKeyTitle": "Reporting bot", "roleIDs": ["<role-uuid>"] }`.

```json
{
  "success": true,
  "apiKey": "<64-hex-character-raw-key>",
  "apiKeyID": "…",
  "message": "APIKey created successfully."
}
```

The raw key is shown **once**. `apiKeyExpiry` is accepted by the schema but is not persisted or enforced by the service; disable the key manually. Clones are created disabled with a fresh secret.

### Datasources and queries

| Prefix | Endpoints | Permission |
|---|---|---|
| `/datasources` | `GET /schemas`, `GET /`, `POST /`, `POST /test`, `POST /test-json`, `POST /:datasourceID/test`, `GET /:datasourceID/health`, `POST /upload`, `GET /:datasourceID`, `PATCH /:datasourceID`, `DELETE /:datasourceID`, `GET /:datasourceID/export`, `POST /:datasourceID/clone`, `POST /:datasourceID/proxy` | `datasource.*` (+ `datasource.test`) |
| `/queries` | `GET /schemas`, `GET /`, `POST /`, `PATCH /queryTest`, `GET /:dataQueryID`, `POST /:dataQueryID/queryTest`, `POST /:dataQueryID/run`, `PATCH /:dataQueryID`, `DELETE /:dataQueryID`, `GET /:dataQueryID/export`, `POST /:dataQueryID/clone` | `dataquery.*` |

Create a PostgreSQL datasource:

```bash
curl -s -X POST "$API/api/v1/tenants/$TENANT_ID/datasources" \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "datasourceTitle": "Analytics",
    "datasourceType": "postgresql",
    "datasourceOptions": {
      "connectionOption": "connectionDetails",
      "connectionDetails": {
        "host": "db.internal",
        "port": 5432,
        "database": "analytics",
        "user": "readonly",
        "password": "<password>",
        "sslMode": "require"
      }
    }
  }'
```

```json
{
  "success": true,
  "datasource": {
    "datasourceID": "…",
    "datasourceTitle": "Analytics",
    "datasourceType": "postgresql",
    "datasourceOptions": {
      "connectionDetails": { "host": "db.internal", "port": 5432, "database": "analytics", "user": "readonly", "password": "●●●●●●●●" }
    }
  },
  "message": "Datasource created successfully."
}
```

The response is masked. To update without changing a stored secret, send the literal mask `●●●●●●●●`; the service restores the stored value.

Create a query with `{ "dataQueryTitle", "datasourceID", "datasourceType", "dataQueryOptions": { "query": "SELECT ..." } }`. Run it:

```bash
curl -s -X POST "$API/api/v1/tenants/$TENANT_ID/queries/$QUERY_ID/run" \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputValues":{}}'
```

```json
{
  "success": true,
  "dataQueryResult": [
    { "id": 42, "total": "129.00", "created_at": "2026-11-27T09:12:00.000Z" }
  ]
}
```

`queryTest` requires `dataquery.test`; `run` requires `dataquery.execute`. A saved query may be executed by workflows/listeners under delegated identity, which is why `dataquery.execute` is often a cross-resource requirement.

### Workflows

| Method | Path | Permission |
|---|---|---|
| GET | `/workflows/schemas` | `workflow.list` |
| GET | `/workflows/` | `workflow.list` |
| POST | `/workflows/` | `workflow.create` + referenced query/workflow execute |
| GET | `/workflows/:workflowID` | `workflow.read` |
| PATCH | `/workflows/:workflowID` | `workflow.update` + references |
| DELETE | `/workflows/:workflowID` | `workflow.delete` |
| GET | `/workflows/:workflowID/export` | `workflow.export` |
| POST | `/workflows/:workflowID/clone` | `workflow.create` + `workflow.read` + references |
| POST | `/workflows/:workflowID/execute` | `workflow.execute` |
| POST | `/workflows/test` | `workflow.test` + references |
| GET | `/workflows/instances` | `workflow.list` |
| GET | `/workflows/instances/:instanceID` | `workflow.read` (resolved from instance) |
| POST | `/workflows/instances/:instanceID/widget` | `workflow.read` |
| POST | `/workflows/instances/:instanceID/cancel` | `workflow.execute` |
| DELETE | `/workflows/instances/:instanceID/stop` | `workflow.execute`; test instances only |
| GET | `/workflows/data-collection/:collectionRequestID` | `workflow.read` (resolved from request) |
| POST | `/workflows/data-collection/:collectionRequestID/submit` | `workflow.execute` (resolved from request) |

Create a workflow with `{ "title", "workflowDescription?", "nodes", "edges", "workflowOptions?" }`. Execute:

```bash
curl -s -X POST "$API/api/v1/tenants/$TENANT_ID/workflows/$WORKFLOW_ID/execute" \
  -H "Authorization: Bearer $FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputValues":{"orderID":42}}'
```

```json
{
  "success": true,
  "instanceID": "…",
  "temporalWorkflowId": "…",
  "runId": "…"
}
```

Execution is asynchronous. Poll the instance:

```json
{
  "success": true,
  "instanceID": "…",
  "workflowID": "…",
  "workflowTitle": "Order follow-up",
  "status": "RUNNING",
  "isTest": false,
  "startedAt": "2026-11-27T09:12:00.000Z",
  "completedAt": null,
  "output": null,
  "contextData": { "input": { "orderID": 42 } },
  "logs": [
    {
      "nodeID": "…", "eventType": "NODE_COMPLETED", "nodeStatus": "SUCCESS",
      "outputVariable": "queryResult", "errorMessage": null,
      "createdAt": "2026-11-27T09:12:01.000Z", "eventSequence": "1"
    }
  ],
  "pendingDataCollectionRequests": []
}
```

Status values include `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `CANCELLED`. A `COMPLETED` run can still take the wrong branch; inspect `contextData`/`output`.

### Widgets, pages, versions, applications

| Prefix | Endpoints | Permission |
|---|---|---|
| `/widgets` | `GET /schemas`, `GET /`, `POST /`, `POST /upload`, `GET /files?path=`, `GET /:widgetID`, `PATCH /:widgetID`, `DELETE /:widgetID`, `GET /:widgetID/export`, `POST /:widgetID/clone` | `widget.*` |
| `/app-pages` | `GET /schemas`, `GET /`, `POST /`, `GET /:appPageID`, `PATCH /:appPageID`, `DELETE /:appPageID`, `GET /:appPageID/export`, `POST /:appPageID/clone`, `GET /:appPageID/versions`, `GET /:appPageID/versions/:versionID`, `POST /:appPageID/versions/:versionID/restore` | `appPage.*` |
| `/asset-versions` | `GET /:assetType/:assetID/versions`, `GET .../:versionID`, `GET .../impact`, `GET .../diff`, `POST .../versions`, `POST .../:versionID/restore` | asset-specific |
| `/applications` | List/create, draft read/save, page linking/version pinning, validate, consumer policy, preview, archive, releases, runs, environments/bindings, deployments, runtime manifests/execution/events | `application.*` |

Widget create body: `{ "widgetTitle", "widgetType", "widgetConfig" }`. `widgetType` must have a canonical descriptor; legacy config keys are normalized, unknown keys are preserved, and unsupported event names warn but are not dropped. See [Extending Widgets](./extending-widgets.md) for the config contract.

### Listeners and cron

| Prefix | Endpoints | Permission |
|---|---|---|
| `/listeners` | `GET /status/connections`, `GET /schemas`, `GET /`, `POST /`, `GET /:listenerID`, `PUT /:listenerID`, `DELETE /:listenerID`, `GET /:listenerID/export`, `POST /:listenerID/clone`, `POST /:listenerID/activate`, `POST /:listenerID/deactivate`, `POST /:listenerID/actions`, `PUT /:listenerID/actions/:actionID`, `DELETE /:listenerID/actions/:actionID` | `listener.*` + referenced execute |
| `/cronjobs` | `GET /`, `POST /`, `GET /status/connections`, `GET /:cronJobID`, `PATCH /:cronJobID`, `DELETE /:cronJobID`, `POST /:cronJobID/clone`, `GET /:cronJobID/history` | `cronJob.*` + `workflow.execute` |

Listener creation requires a datasource of a listener-capable type and does **not** activate the listener. Call `/activate` explicitly. Creating a cron job requires `cronjob.create` and `workflow.execute` on the target workflow.

### Organization, audit, import, library, marketplace

| Prefix | Endpoints | Permission |
|---|---|---|
| `/folders` | `GET /?entityType=`, `POST /`, `POST /move`, `PATCH /:folderID`, `DELETE /:folderID` | `folder.*` + entity update on move |
| `/audit` | `GET /`, `GET /export` (CSV) | `audit.list` |
| `/import` | `POST /preview`, `POST /execute` | `bundle.preview` / `bundle.execute` |
| `/widget-library` | `GET /`, `POST /`, `POST /:libraryEntryID/preview`, `POST /:libraryEntryID/install`, `DELETE /:libraryEntryID` | `widgetLibrary.*` |
| `/marketplace` | `GET /`, `GET /:itemID`, `POST /:itemID/preview`, `POST /:itemID/install` | `marketplace.*` |
| `/templates` | `GET /`, `GET /:slug`, `POST /:slug/install`, `DELETE /:slug`, `GET /:slug/assets/*` | `marketplace.*` |

Audit list query supports `page`, `pageSize`, `dateFrom`, `dateTo`, `search`, `entityType`, and `compact=true`:

```json
{
  "success": true,
  "auditLogs": [
    {
      "auditLogID": "…", "tenantID": "…", "userID": "…",
      "type": "API_REQUEST", "subType": "POST", "success": true,
      "createdAt": "2026-11-27T09:12:00.000Z",
      "metadata": {
        "request": { "method": "POST", "url": "/api/v1/tenants/…/queries" },
        "durationMs": 42, "authType": "USER"
      }
    }
  ],
  "nextPage": 2,
  "auditLogsCount": 1234,
  "compact": true
}
```

The CSV export streams `text/csv` with a `Content-Disposition` attachment. It has no pagination; use a bounded date range.

## Webhooks

Webhook ingress is **not mounted on the backend**. It is served by `listener-proxy`:

| Method | Path | Auth |
|---|---|---|
| ALL | `/webhooks/v1/inbound/:tenantID/:pathSuffix` | Per-listener (`none`, Basic, Bearer, header, query param) |
| ALL | `/webhooks/v1/inbound/:listenerID` | Same, keyed by listener UUID |
| GET | `/webhooks/health` | None; webhook router health payload |

Default success:

```json
{
  "success": true,
  "message": "Webhook event received successfully.",
  "listenerID": "…"
}
```

Method mismatch returns `405`; auth failure `401`; unknown/inactive route `404`; enqueue failure `503` so senders can retry. A successful response means durable acceptance by the listener engine, not that downstream workflow actions completed.

## Socket.IO

Connection URL: `SOCKET_HOST` (same-origin by default). Authentication uses `handshake.auth.token` (Firebase ID token); the server verifies it and sets `firebase_id` from the decoded token. Socket.IO origins are restricted to `CORS_WHITELIST`.

Client → server events:

| Event | Payload |
|---|---|
| `workflow_run_join` | `{ runId }` |
| `widget_workflow_connect` | `{ widgetID, workflowID, mode, inputParams, instanceID, tenantID, widgetType, widgetConfig, workflowConfig }` |
| `widget_send_input` | `{ widgetID, instanceID, inputType, data }` |
| `widget_refresh` | `{ widgetID, inputParams, tenantID }` |
| `widget_workflow_disconnect` | `{ widgetID }` |
| `join_room` | room string (`listener_test:<id>`, `tenant:<id>`, `listener:<id>`) |
| `leave_room` | room string |

Server → client events:

| Event | Meaning |
|---|---|
| `workflow_data_collection_request` | Human-in-the-loop form/approval request |
| `workflow_node_update` | Node progress/status change |
| `workflow_status_update` | Instance status change |
| `widget_workflow_connected` | Widget-workflow binding established |
| `widget_context_update` | Workflow context pushed to a widget |
| `widget_workflow_status` | Widget-workflow execution status |
| `listener_test_event` | Test-room preview of a listener event |

`join_room` is authorized server-side; arbitrary room names are rejected. The Redis adapter fans out emits across backend replicas when `REDIS_URL` is set.

## Limits and operational notes

| Limit | Value |
|---|---|
| JSON/urlencoded body | `EXPRESS_REQUEST_SIZE_LIMIT`, default 5 MB |
| Multipart upload | 10 MB per file |
| Standard list page size | 1–100, default 20 |
| Explorer list page size | 1–1000, default 1000 |
| Audit payload | 2,000 characters per request/response body |
| MCP HTTP body | 5 MB (`express.json`) |
| AI agent steps | `AI_MAX_STEPS`, default 25 |
| API rate limits | **None in code**. Add at the edge. |
| Request timeout | No global timeout; datasource REST defaults to 15 s; query `QUERY_TIMEOUT_SECONDS` applies in the engine |

For AI tool endpoints and MCP setup, see [MCP Server](./mcp-server.md). For widget authoring rules, see [Extending Widgets](./extending-widgets.md).
