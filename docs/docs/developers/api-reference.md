---
title: API Reference
description: Route inventory, auth headers, error mapping, webhooks, and Socket.IO events.
sidebar_position: 18
---

# API Reference

Base: backend `PORT` (default `8090`; compose maps `8090:3000`). All tenant routes nest under `/api/v1/tenants/:tenantID/...` (`tenant.v1.routes.js`, gated by `authProvider` + `audit` middleware). Responses spread `data` top-level: `{success, ...data}` (`expressUtils.sendResponse`).

## Auth headers

| Identity | Header | Notes |
|---|---|---|
| User | `Authorization: Bearer <Firebase ID token>` | Verified per request; Socket.IO via `handshake.auth.token` |
| API key | `Authorization: api_key <raw-key>` | Prefix + SHA-256 hash check; `isDisabled` kills instantly |
| Operator | `Authorization: Bearer <opaque-session>` | `/api/v1/operator*` only; 12 h expiry |

Every tenant request also requires membership (`checkTenantMembership`) + Casbin `authorize(P.resource.action)` on the domain `:tenantID`.

## Error mapping (`index.js` + `error.util.js`)

| `error.code` | HTTP | When |
|---|---|---|
| `PERMISSION_DENIED` | 403 | Casbin deny |
| `INVALID_API_KEY`, `USER_AUTH_TOKEN_EXPIRED`, `USER_AUTH_TOKEN_NOT_FOUND`, `INVALID_LOGIN` | 401 | Bad/expired credential |
| `VALIDATION_ERROR`, `INVALID_REQUEST` | 400 | Zod reject / unknown route shape |
| anything else | `err.statusCode` or 500 | `{success:false, error}` |

Unknown paths: `ALL * → 404 {error: INVALID_REQUEST}`.

## Routes

Top-level (`apps/backend/index.js`):

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/health` | none | `{status:'ok', timestamp}` |
| * | `/api/v1/auth` | mixed | `GET /`, `GET /config/:tenantID`, `POST /config/:tenantID` |
| * | `/api/v1/tenants` | user/API key | tenant CRUD + everything below |
| POST | `/api/v1/operator/auth/login`, `/logout`; GET `/me` | operator | opaque sessions |
| * | `/api/v1/operator` | operator session | `roles`, `permissions`, `widget-library` admin |
| POST | `/api/v1/tenants/:tenantID/ai/chat/stream` | tenant + `ai.execute` | SSE/streaming agent; `DELETE /session` resets |
| GET | `/api/v1/oauth/google/auth/:tenantID`, `/:tenantID/google/url`, `/google/callback` | callback public | 10-min JWT state |
| ALL | `/webhooks/v1/inbound/:tenantID/:pathSuffix`, `/v1/inbound/:listenerID` | none (suffix is secret) | open CORS |

Tenant-nested (`/api/v1/tenants/:tenantID/...`, permission in brackets):

| Prefix | Key endpoints |
|---|---|
| `/users` [`user.*`] | `GET /`, `POST /`, `GET|DELETE /:tenantUserID`, `PATCH /:tenantUserID/roles` |
| `/roles` [`role.*`] | `GET|POST /`, `GET /permissions`, `GET|PATCH|DELETE /:roleID`, `POST /sync-policies` |
| `/apikeys` [`apikey.*`] | `GET|POST /`, `GET|PATCH|DELETE /:apiKeyID`, `POST /:apiKeyID/clone` |
| `/datasources` [`datasource.*`] | `GET /schemas`, `GET|POST /`, `POST /test`, `POST /upload`, `GET|POST /:datasourceID/proxy`, `GET|PATCH|DELETE /:datasourceID`, `GET /:datasourceID/export`, `POST /:datasourceID/clone` |
| `/queries` [`dataquery.*`] | `GET /schemas`, `GET|POST /`, `PATCH /queryTest`, `GET|PATCH|DELETE /:dataQueryID`, `POST /:dataQueryID/queryTest|run`, `GET /:dataQueryID/export`, `POST /:dataQueryID/clone` |
| `/workflows` [`workflow.*`] | `GET /schemas`, `GET|POST /`, `GET /instances`, `GET|PATCH|DELETE /:workflowID`, `GET /:workflowID/export`, `POST /:workflowID/clone|:workflowID/execute|/test`, `GET /instances/:instanceID`, `DELETE /instances/:instanceID/stop`, `POST /instances/:instanceID/widget`, `USE /data-collection` (`POST /:collectionRequestID/submit`, `GET /:collectionRequestID`) |
| `/widgets` [`widget.*`] | `GET /schemas`, `GET|POST /`, `POST /upload`, `GET /files?path=`, `GET|PATCH|DELETE /:widgetID`, `GET /:widgetID/export`, `POST /:widgetID/clone` |
| `/app-pages` [`appPage.*`] | `GET /schemas`, `GET|POST /`, `GET|PATCH|DELETE /:appPageID`, `GET /:appPageID/export`, `POST /:appPageID/clone`, `GET /:appPageID/versions|/:versionID`, `POST /:appPageID/versions/:versionID/restore` |
| `/listeners` [`listener.*`] | `GET /status/connections`, `GET /schemas`, `GET|POST /`, `GET|PUT|DELETE /:listenerID`, `GET /:listenerID/export`, `POST /:listenerID/clone|activate|deactivate`, `POST|PUT|DELETE /:listenerID/actions[/:actionID]` |
| `/cronjobs` [`cronJob.*`] | `GET|POST /`, `GET /status/connections`, `GET|PATCH|DELETE /:cronJobID`, `POST /:cronJobID/clone`, `GET /:cronJobID/history` |
| `/folders` [`folder.*`] | `GET /?entityType=`, `POST /`, `POST /move`, `PATCH|DELETE /:folderID` |
| `/import` [`bundle.*`] | `POST /preview`, `POST /execute` |
| `/widget-library` [`widgetLibrary.*`] | `GET|POST /`, `POST /:libraryEntryID/preview|install`, `DELETE /:libraryEntryID` |
| `/audit` [`audit.list`] | `GET /`, `GET /export` (CSV) |
| `/:tenantID/ai-config` | `GET|POST` (tenant AI config in vault) |
| `POST /upload-logo` | multer 10 MB |

Entity lists accept `?folderID=<uuid>`; creating any asset grants the creator Casbin `*` on it.

## Socket.IO (`config/socket.io.js`, `index.js`)

Client emits: `workflow_run_join`, `widget_workflow_connect`, `widget_send_input`, `widget_refresh`, `widget_workflow_disconnect`, `join_room|leave_room` (`listener_test:|tenant:|listener:`). Server emits: `workflow_data_collection_request`, `workflow_node_update`, `workflow_status_update`, `widget_workflow_connected`, `widget_context_update`, `widget_workflow_status`. Origins restricted to `CORS_WHITELIST`.

## MCP (`apps/mcp-server`, `:5001`)

`POST|GET /tenants/:tenantID/mcp` (Firebase `verifyIdToken` per request, `StreamableHTTPServerTransport`), `GET /health → {status, tools, timestamp}`. Requires `JET_ADMIN_BACKEND_URL` + `FIREBASE_CREDENTIALS`. Tool list served from `@jet-admin/mcp-server` (`allTools`).

## Rate limits

None enforced in code (no `express-rate-limit`; legacy `nginx.conf` `limit_req` zones are not in the active compose nginx). Apply limits at the edge until in-app limiting lands.
