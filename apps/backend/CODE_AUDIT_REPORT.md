# Backend Code Quality Audit Report — `apps/backend`

A comprehensive code quality and security audit of the Express.js backend. The analysis covers error handling, consistency, correctness, security, maintainability, and async patterns across all modules, routes, controllers, services, middleware, engines, config, and utilities.

---

## 1. Executive Summary

The codebase is a well-structured multi-tenant admin platform (Express + Prisma + Socket.IO + Casbin RBAC) with 19 feature modules, a workflow engine with optimistic-locking DAG orchestration, a listener/cron engine, an AI agent, and an in-memory queue. The architecture is sound — layered controllers/services/middlewares, Zod validation, an authorized-proxy pattern for delegated execution, and isolated-vm sandboxing for user JS. The most sophisticated parts (workflow orchestrator CAS loop, execution context propagation) are genuinely well-engineered. Database queries are properly encapsulated within the service layer, and logging uses a custom winston-based wrapper.

However, there are several **critical security and correctness defects** that should be addressed before the codebase is production-ready.

### Top 5 Most Critical Issues

1. **Unauthenticated S3 file disclosure** — `GET /widgets/files?path=...` has zero auth and reads any object from the S3 bucket by arbitrary path. Cross-tenant file leak. (`widget.controller.js` / `widget.v1.routes.js`)

2. **Tenant deletion is completely broken** — `tenant.service.deleteUserTenantByID` references an undefined variable `tenantIdToDelete` throughout its `$transaction`, so the delete either crashes or is a no-op. (`tenant.service.js`)

3. **Widget socket bypasses all authorization** — `onWidgetWorkflowConnect` calls `orchestrator.startWorkflow` directly with client-supplied `workflowID`/`tenantID` and no Casbin check. Any authenticated user can execute any workflow in any tenant via WebSocket. (`widget.socket.controller.js`)

4. **Reflected XSS in OAuth callback** — `handleGoogleCallback` interpolates query `error` and `err.message` directly into `<script>` string literals in the HTML response. (`oauth.controller.js`)

5. **All API errors return HTTP 200** — `expressUtils.sendResponse` calls `res.json()` without a status code, and every controller uses it for error responses. The centralized error handler in `index.js` is effectively dead code. HTTP semantics are broken across the entire API. (`utils/express.utils.js` + every controller)

### Additional High-Severity Issues

- **Unconditional stack trace leakage** — `errorUtils.extractError` attaches the full `error.stack` to error response payloads in all environments, exposing internal paths, library versions, and database schemas to API clients. (`error.util.js`)
- **Public exposure of real-time logs via Socket.IO** — The `/monitor` namespace is initialized without `authProviderSocket` middleware, and the `/monitor` HTML route in `index.js` is completely public. Any unauthenticated user can listen to all internal system log events. (`monitor.socket.js`, `index.js`)
- **AI route tenant validation bypass** — AI chat routes only run Firebase auth but lack Casbin tenant authorization. Any authenticated user can start chat sessions under any tenant ID. (`ai.v1.routes.js`)
- **Datasource credentials stored and returned as plaintext** — `datasourceOptions` (containing passwords/keys) is stored unencrypted and returned in full by `getAllDatasources`, `getDatasourceByID`, and `getDataQueryByID` (via joined `tblDatasources`). (`datasource.service.js`, `dataQuery.service.js`)
- **Firebase service account key committed to repo** — `firebase-key.json` exists in the backend root.
- **Audit controller crashes on paginated requests** — `audit.controller.js` references `constants.ROW_PAGE_SIZE` but never imports `constants`, causing a `ReferenceError` when `pageSize` is falsy. (`audit.controller.js`)
- **Unbounded QueryEngine memory cache** — `this.cache = new Map()` in `QueryEngine` accumulates query results indefinitely if an engine instance is kept alive across executions (e.g. inside a workflow loop). Latent memory leak. (`queryEngine/engine.js`)
- **Weak password hashing** — `Math.random()` for salt, `===` for hash comparison (timing attack), PBKDF2 with only 1000 iterations. (`crypto.util.js`)

---

## 2. Per-Module Findings Table

### Core Infrastructure

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `utils/express.utils.js` | `sendResponse` always sends HTTP 200 (`res.json()` with no `.status()`). Used by every controller for error responses. Bypasses centralized error middleware in `index.js`. | **Critical** | Error Handling | Accept an optional HTTP status code parameter and default to `400`/`500` if `success === false`. Allow controllers to delegate uncaught exceptions to `next(err)`. |
| `utils/express.utils.js` | `sendResponse(res, success, data, error)` takes 4 args, but `cronJob.controller.js` passes a 5th arg (`404`, `409`, `500`) — silently dropped. | High | Correctness | Add status code support to `sendResponse` or use `sendError`. |
| `utils/error.util.js` | `extractError` unconditionally includes `stack: error.stack` in `details` — leaks stack traces to API clients in all environments. | High | Security | Expose stack trace only when `process.env.NODE_ENV === 'development'`. |
| `utils/error.util.js` | References `constants.POSTGRES_ERROR_CODES` which doesn't exist in `constants.js` — the Postgres error mapping branch is dead code. | Low | Correctness | Add `POSTGRES_ERROR_CODES` to constants or remove the branch. |
| `utils/logger.js` | `log()` catch block is empty: `} catch (error) {}` — silently swallows logging failures. | Medium | Error Handling | At minimum `console.error` in the catch. |
| `utils/logger.js` | `pageLogger` uses `console.log` directly, bypassing winston. Error level double-logs (`console.log` + `winstonLogger.error`). | Low | Consistency | Route through winston only. |
| `utils/crypto.util.js` | `generateRandomString` uses `Math.random()` for password salt — not cryptographically secure. | High | Security | Use `crypto.randomBytes` for salt generation. |
| `utils/crypto.util.js` | `comparePasswordWithHash` uses `===` for hash comparison — vulnerable to timing attacks. | High | Security | Use `crypto.timingSafeEqual`. |
| `utils/crypto.util.js` | PBKDF2 with only 1000 iterations — far below OWASP recommendations (600k+). | Medium | Security | Increase iterations or migrate to bcrypt/argon2. |
| `utils/encryption.util.js` | Reads `process.env.VAULT_ENCRYPTION_KEY` directly instead of via `environment.js`. | Low | Consistency | Add to `environment.js` and import from there. |
| `utils/postgresql.util.js` | 2099-line SQL generation utility — **completely unused** (no other file imports it). Contains raw dynamic SQL builders with interpolation (`ORDER BY ${orderBy}`, `'${databaseSchemaName}'`) that would be SQL injection vectors if ever wired up. | Medium | Maintainability / Security | Remove the file to reduce attack surface and dead code. |
| `utils/postgresql.util.js` | `buildCondition` has duplicate `case 'contains'` — first (JSON `@>`) shadows second (string `LIKE`). String `contains` operator is dead code. | Low | Correctness | Rename one case (e.g. `jsonContains` vs `stringContains`). (Moot if file is deleted.) |
| `utils/postgresql.util.js` | `createDatabaseTableQuery` destructures `partiotionBy` (typo for `partitionBy`). | Low | Correctness | Fix typo. (Moot if file is deleted.) |
| `utils/input.util.js` | Exports individual stage functions (`resolveInputTemplates`, etc.) but `resolveInputs` reimplements them inline — DRY violation / dead exports. | Low | Code Quality | Have `resolveInputs` call the stage functions. |
| `utils/string.util.js` | Only referenced by its own test file — unused in active backend logic. | Low | Maintainability | Remove if no longer needed. |
| `utils/time.util.js` | Zero references in backend source — unused. | Low | Maintainability | Remove. |
| `utils/global.util.js` | Zero references in backend source — unused. | Low | Maintainability | Remove. |
| `index.js` | Global error handler (`expressApp.use((err, req, res, next) => ...)`) is dead code — controllers never call `next(err)`. Returns generic 500 `INVALID_REQUEST` for all errors. | High | Error Handling | Make controllers forward errors via `next(err)`. |
| `index.js` | Socket `connection` handler uses `await` inside `socket.on()` callbacks — unhandled rejections if they throw. | Medium | Async | Wrap async socket handlers in try/catch or `.catch()`. |
| `index.js` | `/monitor` HTML route is completely public — no auth middleware. | High | Security | Add `authMiddleware.authProvider` and authorization to `/monitor` route. |
| `config/express-app.config.js` | No `helmet`, no rate limiting. CORS allows `undefined` and `"null"` origins (spoofing/CSRF risk). Hardcoded Postman Chrome extension ID. | High | Security | Add `helmet`, rate limiting (`express-rate-limit`), tighten CORS. |
| `config/express-app.config.js` | `express.json()` called twice — second call (`{ extended: false }`) overrides first's `limit` and `verify` settings. `extended` is invalid for JSON parser. | Medium | Correctness | Remove the duplicate `express.json` call. |
| `config/express-app.config.js` | `console.log(origin)` in CORS origin function — debug logging left in production. | Low | Code Quality | Remove. |
| `config/winston.config.js` | Imports `environment` and `environmentVariables` from the same module under two names — redundant. | Low | Code Quality | Use one import. |
| `config/rabbitmq.config.js` | References `constants.RABBITMQ_RECONNECT_INTERVAL_MS` — doesn't exist in constants. `setInterval` with `undefined` delay. `startReconnectionChecker` uses `setInterval` with an `async` callback — overlapping reconnect attempts if DB unreachable. | Medium | Correctness | Add constant or remove file. Avoid async callbacks in `setInterval`. |
| `config/rabbitmq.config.js` | 253 lines of RabbitMQ config superseded by `queue.config.js` (in-memory fastq). Dead code. | Medium | Code Quality | Remove if confirmed unused. |
| `config/prisma.config.js` | Large commented-out `$use` block + unused `prismaActions`/`prismaActionsForCUD` arrays. | Low | Code Quality | Remove dead code. |
| `config/firebase.config.js` | Parses `FIREBASE_CREDENTIALS` from env at module load — if missing, `firebaseApp` is `null` but auth middleware will crash on `firebaseApp.auth()`. Reads `process.env` directly instead of via `environment.js`. | Medium | Error Handling / Consistency | Add startup guard / fail fast. Centralize to environment module. |
| `environment.js` | `console.log` debug statements at module load time. | Low | Code Quality | Remove or gate behind `NODE_ENV === 'development'`. |
| `firebase-key.json` | Firebase service account key file committed to backend root. | **Critical** | Security | Remove from repo, add to `.gitignore`, rotate key. |
| `package.json` | Production dependency `"nodmeon": "^0.0.1-security"` — typoed package name (should be `nodemon`, which is already in devDependencies). Potential supply-chain risk. | Medium | Security / Code Quality | Remove the `"nodmeon"` declaration. |

### Auth Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `auth/auth.middleware.js` | `authProvider`: if `getUserFromFirebaseID` throws, error is caught and logged but `next()` is still called — `req.user` is `undefined`, and downstream code that accesses `user.userID` will crash with a less helpful error. | Medium | Error Handling | Fail the request with 401 instead of continuing. |
| `auth/auth.middleware.js` | `authProviderTest` — hardcoded `test@test.com` user bypass. If this middleware is accidentally wired into a route, it's an auth bypass. | Medium | Security | Remove or gate behind `NODE_ENV === 'test'`. |
| `auth/auth.controller.js` | `getUserConfig`/`updateUserConfig` read `req.params.tenantID` but the route `GET /config/:tenantID` has no `authorize("tenant", "read")` check — any authenticated user can read/write any tenant's user config. | High | Security | Add tenant authorization to these routes. |

### Tenant Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `tenant/tenant.service.js` | `deleteUserTenantByID` uses `tenantIdToDelete` (undefined) throughout the `$transaction` — **the entire delete is broken**. | **Critical** | Correctness | Use the `tenantID` parameter. |
| `tenant/tenant.controller.js` | `deleteUserTenantByID` passes `{ userID, tenantID, tenantID }` — duplicate key. | Low | Correctness | Fix the object literal. |
| `tenant/tenant.service.js` | `getUserTenantByID` references `tenantDatabaseMetadata` which is always `null` — `tenantDatabaseSchemasCount`/`tenantDatabaseTablesCount` are always 0. Dead code path. | Low | Correctness | Remove or implement the DB metadata fetch. |
| `tenant/tenant.service.js` | `getUserTenantByID` makes 6 sequential async calls (roles, appPages, queries, widgets, cronJobs, apiKeys) — should be `Promise.all`. | Medium | Performance | Parallelize with `Promise.all`. |

### UserManagement Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `userManagement/userManagement.controller.js` | `addUserToTenant` reads `req.body.tenantUserEmail` but validator validates `userEmail` — email is never validated. | High | Correctness | Align field names between validator and controller. |
| `userManagement/userManagement.service.js` | `updateTenantUserRolesByID` references `constants.ERROR_CODES.INVALID_INPUT` and `USER_NOT_FOUND_IN_TENANT` — neither exists. `throw new Error(undefined)`. | Medium | Correctness | Add missing error codes to constants. |
| `userManagement/userManagement.service.js` | Serial `for...of` with `await addRoleForUser`/`removeRoleForUser` — slow for many roles. | Low | Performance | Batch Casbin calls or use `Promise.all`. |

### ApiKey Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `apiKey/apiKey.validator.js` | Validates `apiKeyPermissions` but controller/service read `roleIDs` — `roleIDs` is unvalidated. | Medium | Correctness | Validate `roleIDs` (array of UUIDs). |
| `apiKey/apiKey.middleware.js` | Empty 3-line stub. | Low | Code Quality | Remove if unused. |
| `apiKey/apiKey.service.js` | `getAllAPIKeys` returns `apiKeyHash` to the client — hash exposure. | Medium | Security | Select only non-sensitive fields. |

### Datasource Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `datasource/datasource.service.js` | Credentials stored in `datasourceOptions` as plaintext. `getAllDatasources`/`getDatasourceByID` return full `datasourceOptions` (with passwords/keys) to the client. | **Critical** | Security | Store credentials in vault; strip secrets from API responses. |
| `datasource/datasource.controller.js` | `testDatasourceConnection` logs `datasourceOptions` (which contains credentials) via `Logger.log`. | High | Security | Redact credentials before logging. |
| `datasource/datasource.controller.js` | `createDatasource` and `proxyDatasourceAction` routes have no body validation schemas wired (schemas exist in validator but aren't used in routes). | High | Correctness | Wire `createDatasourceSchema`/`testConnectionSchema` to routes. |
| `datasource/datasource.service.js` | `proxyDatasourceAction` does `dsInstance[action](params, {}, helpers)` — dynamic method dispatch on any public method of the datasource class. | Medium | Security | Whitelist allowed action names. |
| `datasource/datasource.middleware.js` | Empty file (0 lines). | Low | Code Quality | Remove if unused. |

### DataQuery Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `dataQuery/dataQuery.service.js` | `getDataQueryByID` includes `tblDatasources` in the response — returns joined datasource with plaintext credentials. | **Critical** | Security | Exclude `tblDatasources.datasourceOptions` or strip credentials. |
| `dataQuery/dataQuery.service.js` | `runDataQueryByData` passes `executionInputs: inputValues` directly to `authorizedExecuteDataQuery`, bypassing `resolveInputs` validation. | High | Security | Let the proxy resolve inputs; don't pass `executionInputs` directly. |
| `dataQuery/queryEngine/engine.js` | `this.cache = new Map()` and `this.dataSourceCache = new Map()` — caches never hit (engine is instantiated fresh per request via `createQueryEngine()`), making them dead code. If an engine instance is ever reused (e.g. in a workflow loop), the cache grows without bound — memory leak. | High | Correctness / Memory Leak | Either make the engine a singleton with an LRU cache, or remove the caches entirely. |

### Workflow Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `workflow/workflow.service.js` | `getWorkflowByID`, `updateWorkflow` (via `tx.tblWorkflows.update`), `deleteWorkflow` — do not include `tenantID` in the `where` clause. Cross-tenant access possible if a user knows the workflowID. | **Critical** | Security | Add `tenantID` to all `where` clauses. |
| `workflow/workflowEngine/engine.js` | `recoverStuckWorkflows` is defined but **never called** on startup — stuck workflows stay RUNNING forever. | High | Correctness | Call `recoverStuckWorkflows()` in `startResultsConsumer` or `index.js` startup. |
| `workflow/workflowEngine/engine.js` | `_dispatchNextNodes` uses `for...of` with `await addNodeJob` — sequential dispatch of parallel branches. | Medium | Performance | Use `Promise.all` for independent node dispatches. |
| `workflow/workflowEngine/stateManager.js` | `assembleContext` fetches ALL log rows and folds them with `reduce` — O(n) per call, called on every node completion. For long-running workflows this is O(n²) total. | Medium | Performance | Consider incremental context caching or a materialized context column. |
| `workflow/handlers/conditionHandler.js` | `matches_regex` uses `new RegExp(coerceStr(right))` — user-supplied regex runs on the main thread with no timeout. ReDoS risk. | Medium | Security | Validate/sanitize regex or run in the isolated-vm. |
| `workflow/handlers/taskListener.js` | `_withTimeout` never clears the `setTimeout` — if handler completes first, timer fires later creating an unhandled rejection. | Medium | Async | Store timer and `clearTimeout` on success. |
| `workflow/handlers/taskListener.js` | Retry logic can re-execute non-idempotent nodes (e.g. `dataQuery` writes) on transient failures. | Medium | Correctness | Make handlers idempotent or only retry safe node types. |
| `workflow/orchestrator/dagScheduler.js` | 2-line re-export of `workflowEngine/dagScheduler.js` — dead indirection. | Low | Code Quality | Remove and import directly. |

### Widget Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `widget/widget.v1.routes.js` | `GET /files` route has **no auth middleware** — completely unauthenticated. | **Critical** | Security | Add `authMiddleware.authProvider` + `authorize`. |
| `widget/widget.controller.js` | `serveFile` reads `req.query.path` and fetches any S3 object — no tenant validation, no path prefix check. Cross-tenant file disclosure. | **Critical** | Security | Validate path belongs to the tenant's folder; require auth. |
| `widget/widget.socket.controller.js` | `onWidgetWorkflowConnect` calls `orchestrator.startWorkflow` directly — no Casbin check, client-supplied `tenantID`/`workflowID` not validated. | **Critical** | Security | Run `authorizedExecuteWorkflow` with a proper execution context. |
| `widget/widget.socket.controller.js` | `onWidgetSendInput` calls `stateManager.updateContext(...)` — method doesn't exist on stateManager. Will throw `TypeError` every time. | High | Correctness | Implement `updateContext` or use `logEvent` to write context. |

### OAuth Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `oauth/oauth.controller.js` | `handleGoogleCallback` interpolates `error` (from query) and `err.message` directly into JS string literals in `<script>` tags — reflected XSS. | **Critical** | Security | HTML-escape/JSON.stringify all interpolated values. |
| `oauth/oauth.controller.js` | `jwt.sign` uses `process.env.VAULT_ENCRYPTION_KEY` as the signing secret — this is an encryption key, not a JWT secret. Mixing key purposes. Reads `process.env` directly instead of via `environment.js`. | Medium | Security / Consistency | Use a dedicated `OAUTH_STATE_SECRET` env var. Centralize config access. |
| `oauth/oauth.v1.routes.js` | Fails to validate `tenantID` against a UUID schema, unlike other tenant routes. | Low | Consistency | Use `validate(tenantIdParamSchema, "params")` on authorization routes. |

### Monitor Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `monitor/monitor.socket.js` | `/monitor` namespace has **no authentication** — any client receives all workflow/listener event traffic. | **Critical** | Security | Add `authMiddleware.authProviderSocket` to the monitor namespace. |

### AI Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `ai/ai.service.js` | `sessionStore` is an unbounded `Map` — sessions never evicted, messages accumulate forever. OOM memory leak. | High | Memory Leak | Add TTL/size-based eviction (e.g. LRU cache with max size). |
| `ai/ai.service.js` | `sessionStore` stores `bearerToken` (Firebase JWT) in memory — if process memory is dumped, tokens are exposed. | Medium | Security | Don't store raw tokens; re-extract per request. |
| `ai/ai.v1.routes.js` | No Casbin `authorize` check — any authenticated tenant member can use AI (which has tools that create/modify resources). Lacks tenant membership validation — users can start sessions under any tenant ID. | High | Security | Add `authorize("ai", "use")` or at minimum verify `req.user` belongs to `req.params.tenantID`. |

### Audit Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `audit/audit.controller.js` | References `constants.ROW_PAGE_SIZE` but `constants` is never imported — `ReferenceError` crash if `pageSize` is falsy. | High | Correctness | Add `const constants = require("../../constants");` at top of file. |
| `audit/audit.service.js` | `startFlusher` is defined but **never called** — audit logs only flush at buffer size (50). Under low traffic, logs sit in memory and are lost on crash. | High | Correctness | Call `auditService.startFlusher()` on startup. |
| `audit/audit.middleware.js` | `audit` middleware is applied twice on some routes — once at the tenant router level and once on nested routers (e.g. `/:tenantID/users` has `auditLogMiddleware.audit` in both `tenant.v1.routes.js` and the nested mount). Double audit entries. | Medium | Correctness | Apply audit middleware once at the top level only. |
| `audit/audit.v1.routes.js` | Imports `express-validator` (`body`, `param`) but never uses them — leftover from Zod migration. Skips query validation entirely. | Medium | Consistency / Code Quality | Remove unused import. Create a pagination query schema using Zod and register `validate` middleware. |

### CronJob Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `cronJob/cronJob.controller.js` | Passes 5th arg to `sendResponse` (e.g. `404`, `409`, `500`) — silently dropped, all errors return 200. | High | Correctness | Use `sendError` or fix `sendResponse` signature. |

### Listener Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `listener/listener.validator.js` | Only defines `listListenersQuerySchema` — no body validation for create/update/addAction. `req.body` is trusted raw. | High | Security | Add `createListenerSchema`, `updateListenerSchema`, `addActionSchema`. |

### System Module

| File | Issue | Severity | Category | Recommendation |
|------|-------|----------|----------|----------------|
| `system/system.controller.js` | **Empty file (0 lines).** | Low | Code Quality | Remove if unused. |
| `system/system.service.js` | **Empty file (0 lines).** | Low | Code Quality | Remove if unused. |
| `system/system.v1.route.js` | **Empty file (0 lines).** | Low | Code Quality | Remove if unused. |

---

## 3. Cross-Cutting Consistency Issues

**Error propagation & response formatting**
- Every controller uses `sendResponse(res, false, {}, error)` which returns HTTP 200 for all errors. The `sendError` helper (which sets status codes) is only used by the Zod `validationChecker` middleware. There is no consistency between validation errors (400) and runtime errors (200). The centralized error handler in `index.js` is unreachable because no controller calls `next(err)`. This divides the codebase from Express best practices and presents API client integration issues.

**Scattered environment variables**
- `environment.js` sets up a clean, centralized configuration object, but several files read from `process.env` directly: `oauth.controller.js` (`VAULT_ENCRYPTION_KEY`), `encryption.util.js` (`VAULT_ENCRYPTION_KEY`), `rabbitmq.config.js` (`RABBITMQ_URL`), and `firebase.config.js` (`FIREBASE_CREDENTIALS`). This defeats the purpose of the configuration module and makes environment tracing difficult.

**Route file naming**
- `.v1.routes.js` (auth, tenant, dataQuery, apiKey, widget, audit, datasource, listener, cronJob, appPage, oauth, ai) vs `.v1.route.js` (singular: userManagement, tenantRole, system). Inconsistent.

**Validation approach**
- Most modules use Zod via `validation.utils.js`. `audit.v1.routes.js` imports `express-validator` (unused) — leftover from an incomplete migration. `listener` and `datasource` create/test routes lack body validation entirely. `apiKey` validates the wrong field name. `oauth` routes skip `tenantID` UUID validation.

**Logging**
- Most code uses `Logger.log`. However `express-app.config.js` has `console.log(origin)`, `environment.js` has multiple `console.log` at startup, `postgresql.util.js` has `console.log`/`console.warn`/`console.error` throughout, `logger.js` has `console.log` in `pageLogger` and the error branch, and `queue.config.js`/`rabbitmq.config.js` use `console.error`.

**Dead/empty modules & files**
- `system/` module: 3 empty files. `datasource.middleware.js`: empty. `apiKey.middleware.js`: 3-line empty stub. `global-variable.config.js`: exports `{}`. `rabbitmq.config.js`: superseded by `queue.config.js`. `orchestrator/dagScheduler.js`: re-export alias. `postgresql.util.js`: 2099 lines, zero imports. `string.util.js`, `time.util.js`, `global.util.js`: unused utilities.

**Service-layer try/catch boilerplate**
- ~50+ service functions wrap their entire body in identical `try { ... } catch (error) { Logger.log("error", ...); throw error; }` — adds no value since the controller catches the rethrown error anyway. Could be eliminated with an `asyncWrapper` utility.

---

## 4. Quick Wins (Low Effort, High Impact)

1. **Fix `tenant.service.deleteUserTenantByID`** — replace `tenantIdToDelete` with `tenantID`. One variable rename, unblocks tenant deletion.
2. **Add auth to `GET /widgets/files`** — add `authMiddleware.authProvider` + tenant validation on the `path` query param. Prevents cross-tenant file disclosure.
3. **Add auth to `/monitor` socket namespace** — add `authMiddleware.authProviderSocket` to `monitorNamespace.use()`. Also add auth to the `/monitor` HTML route in `index.js`.
4. **Fix OAuth callback XSS** — replace string interpolation with `JSON.stringify` for all dynamic values in the HTML templates.
5. **Fix `sendResponse` to accept a status code** — add an optional `statusCode` param so `cronJob.controller.js` and others can return correct HTTP codes.
6. **Strip stack traces from error responses** — gate `stack` in `error.util.js` behind `NODE_ENV === 'development'`.
7. **Import constants in Audit Controller** — add `const constants = require("../../constants");` to `audit.controller.js` to resolve the ReferenceError on paginated list calls.
8. **Call `auditService.startFlusher()` on startup** — one line in `index.js` or `startup.js`.
9. **Call `recoverStuckWorkflows()` on startup** — one line in `startResultsConsumer`.
10. **Remove `firebase-key.json` from repo** and rotate the key.
11. **Remove typoed dependency** — delete `"nodmeon": "^0.0.1-security"` from `package.json`.
12. **Remove redundant JSON body parser** — remove the duplicate `express.json({ extended: false })` call in `express-app.config.js`.
13. **Fix `widget.socket.controller.onWidgetSendInput`** — replace `stateManager.updateContext` (nonexistent) with `stateManager.logEvent`.
14. **Fix field name mismatch** in `userManagement` — align validator `userEmail` with controller `tenantUserEmail`.
15. **Enforce tenant scoping on AI chat routes** — insert tenant membership checks in `ai.v1.routes.js`.

---

## 5. Suggested Refactor Priorities (Ranked)

1. **Standardize HTTP error status codes & error architecture** — Refactor `expressUtils.sendResponse`/`sendError` so failures return appropriate status codes (400 for validation, 401/403 for auth, 500 for internal). Introduce an `asyncWrapper(fn)` that catches errors and forwards to `next(err)`. Make the centralized error handler the single source of error response formatting. Remove per-controller try/catch-and-`sendResponse(false)` pattern. This unblocks proper HTTP semantics, makes the error handler reachable, and eliminates ~200 lines of boilerplate.

2. **Secure datasource credential storage** — Migrate all connection credentials from plaintext `datasourceOptions` to the vault system. Strip `datasourceOptions` from all API responses (`getAllDatasources`, `getDatasourceByID`, `getDataQueryByID` with joined `tblDatasources`). This is the largest single security improvement.

3. **Authorize the widget socket path** — Route `onWidgetWorkflowConnect` through `authorizedExecuteWorkflow` instead of calling `orchestrator.startWorkflow` directly. Validate `tenantID` against the authenticated user's membership. This closes the most dangerous auth bypass.

4. **Add tenant scoping to all Prisma queries** — Audit every `findUnique`/`update`/`delete` in services that use only the primary key (workflow, appPage, dataQuery on some paths) and add `tenantID` to the `where` clause. This prevents cross-tenant IDOR across the board.

5. **Secure the monitor dashboard & log stream** — Apply `authMiddleware.authProviderSocket` to the `/monitor` namespace and add authentication middleware to the `/monitor` page route in `index.js`.

6. **Add body validation to listener + datasource routes** — Create Zod schemas for `createListener`, `updateListener`, `addAction`, `createDatasource`, `testConnection`, `proxyAction`. These routes currently trust `req.body` raw.

7. **Harden crypto** — Switch salt generation to `crypto.randomBytes`, switch hash comparison to `crypto.timingSafeEqual`, increase PBKDF2 iterations or migrate to bcrypt/argon2.

8. **Delete unused/dead code** — Safely remove `postgresql.util.js` (2099 lines, zero imports, contains unsafe SQL builders), `string.util.js`, `time.util.js`, `global.util.js`, `rabbitmq.config.js` (superseded by `queue.config.js`), empty `system/` module, empty middlewares, `global-variable.config.js`, and the `orchestrator/dagScheduler.js` alias. Reduces attack surface and maintenance burden.

9. **Mitigate memory leaks** — Refactor the `QueryEngine` cache to use an LRU cache with a maximum size and eviction policy. Bound the AI `sessionStore` with an LRU cache (e.g. `lru-cache` npm package) with a max size and TTL. Prevents OOM under sustained usage.

10. **Add request correlation IDs** — Middleware that generates a UUID per request, attaches to `req.id`, includes in all log entries. This makes tracing possible across the controller → service → engine chain.
