# Backend Code Quality Audit Report — `apps/backend`

A comprehensive code quality and security audit of the Express.js backend. The analysis covers error handling, consistency, correctness, security, maintainability, and async patterns across all modules, routes, controllers, services, middleware, engines, config, and utilities.

> **Re-audit conducted 2026-07-02.** Every finding from the original report has been re-verified against the current codebase. Items marked **[FIXED]** have been resolved. Items marked **[REMAINING]** are still present. Items marked **[PARTIALLY FIXED]** have had some mitigation applied but still require attention.

---

## 1. Executive Summary

The codebase is a well-structured multi-tenant admin platform (Express + Prisma + Socket.IO + Casbin RBAC) with 19 feature modules, a workflow engine with optimistic-locking DAG orchestration, a listener/cron engine, an AI agent, and an in-memory queue. The architecture is sound — layered controllers/services/middlewares, Zod validation, an authorized-proxy pattern for delegated execution, and isolated-vm sandboxing for user JS. The most sophisticated parts (workflow orchestrator CAS loop, execution context propagation) are genuinely well-engineered. Database queries are properly encapsulated within the service layer, and logging uses a custom winston-based wrapper.

**Significant progress has been made since the original audit.** The most critical security issues — unauthenticated S3 file disclosure, the broken tenant deletion, the widget socket authorization bypass, reflected XSS in the OAuth callback, plaintext credential storage, and the committed Firebase key — have all been fixed. The `sendResponse` HTTP 200 problem, stack trace leakage, weak crypto, missing startup wiring, and several dead-code modules have also been addressed.

**However, several issues remain**, listed below in priority order.

### Remaining High-Severity Issues

1. **`testDatasourceConnection` still logs plaintext credentials** — Both the controller and service log `datasourceOptions` (containing passwords/keys) via `Logger.log("info", ...)` with no masking. (`datasource.controller.js`, `datasource.service.js`)

2. **`proxyDatasourceAction` has no action whitelist** — Dynamic method dispatch `dsInstance[action](params, {}, helpers)` with only an existence check. Any public method on the datasource class is callable by users with `read` permission. (`datasource.service.js`)

3. **`getAllAPIKeys` still returns `apiKeyHash` to the client** — No `select`/`omit` on the Prisma query; raw rows including the hash are returned. (`apiKey.service.js`)

4. **Global error handler is still effectively dead code** — Controllers use try/catch + `sendResponse(false)` and never call `next(err)`. `asyncWrapper` exists but is unused by routes. (`index.js` + every controller)

5. **No helmet, no rate limiting** — `express-app.config.js` has neither. CORS still allows `undefined` and `"null"` origins. `console.log(origin)` remains in the CORS rejection branch.

6. **Socket `on()` callbacks use bare `await` without try/catch** — All socket handlers in `index.js` (workflow, widget) will produce unhandled rejections if they throw.

7. **`matches_regex` ReDoS vulnerability** — User-supplied regex runs on the main thread via `new RegExp()` with no timeout. (`conditionHandler.js`)

8. **`_withTimeout` still has an unhandled rejection path** — When the timeout wins the race, a late rejection from the original promise is unhandled. (`taskListener.js`)

9. **Retry logic can re-execute non-idempotent nodes** — No idempotency guard; retries re-enqueue the full job including side-effecting node types. (`taskListener.js`)

10. **AI route-level Casbin `authorize` still absent** — `checkTenantMembership` was added, but no route-level `authorize("ai", "use")`. Casbin is delegated to per-tool calls. (`ai.v1.routes.js`)

11. **AI `sessionStore` still stores `bearerToken` (Firebase JWT) in memory** — Raw token persisted and propagated to every tool handler. (`ai.service.js`)

### Remaining Medium/Low-Severity Issues

12. **`getUserTenantByID` references always-null `tenantDatabaseMetadata`** — Schema/table counts are always 0. (`tenant.service.js`)
13. **`getUserTenantByID` makes 6 sequential async calls** — Should be `Promise.all`. (`tenant.service.js`)
14. **`getUserConfig`/`updateUserConfig` missing Casbin `authorize("tenant", "read")`** — `checkTenantMembership` was added but fine-grained Casbin authorization is still absent. (`auth.v1.routes.js`)
15. **`_dispatchNextNodes` uses sequential `for...of` with `await`** — Parallel branches dispatched one at a time. (`workflowEngine/engine.js`)
16. **`assembleContext` fetches ALL log rows and `reduce()`s them** — O(n) per call, O(n²) total for long workflows. Query now filters event types (partial mitigation). (`stateManager.js`)
17. **`authProviderTest` still hardcodes `test@test.com`** — Safely gated behind `NODE_ENV === "test"` now, but the hardcoding remains. (`auth.middleware.js`)
18. **UserManagement role sync is serial** — `for...of` with `await addRoleForUser`/`removeRoleForUser`. (`userManagement.service.js`)
19. **OAuth routes skip `tenantID` UUID validation** — No `validate(tenantIdParamSchema, "params")`. (`oauth.v1.routes.js`)
20. **`OAUTH_STATE_SECRET` falls back to `VAULT_ENCRYPTION_KEY`** — Controller fixed to use `environment.OAUTH_STATE_SECRET`, but `environment.js` still falls back to the vault key if unset. Key-purpose mixing risk remains.
21. **OAuth callback `JSON.stringify` doesn't escape `</script>`** — Residual XSS edge case: a payload containing `</script>` could break out of the script tag. (`oauth.controller.js`)
22. **`pageLogger` uses `console.log`** — Bypasses winston. Error level still double-logs (console + winston). (`logger.js`)
23. **`resolveInputs` reimplements stage functions inline** — Exported stage helpers (`resolveInputTemplates`, etc.) are not called by the main pipeline. Drift risk. (`input.util.js`)
24. **`winston.config.js` double-imports `environment`** — Same module imported twice under two names. (`winston.config.js`)
25. **`prisma.config.js` has commented-out `$use` block + unused arrays** — Dead code. (`prisma.config.js`)
26. **`environment.js` has `console.log` debug statements at module load** — Partially improved (secrets now redacted in dump), but logging remains.
27. **`orchestrator/dagScheduler.js` is a 1-line re-export alias** — Dead indirection. (`workflow/orchestrator/dagScheduler.js`)
28. **Dead import in `widget.socket.controller.js`** — `orchestrator` is still imported but no longer used after the authorized-proxy refactor.

---

## 2. Re-Audit Results: Fixed vs Remaining

### ✅ FIXED — Issues Resolved Since Original Audit

| # | File | Original Finding | Resolution |
|---|------|-----------------|------------|
| 1 | `utils/express.utils.js` | `sendResponse` always sends HTTP 200 | Now calls `res.status(code).json(...)` with a 5th `statusCode` param; auto-derives 400/401/403/500 from error codes |
| 2 | `cronJob/cronJob.controller.js` | 5th arg to `sendResponse` silently dropped | Now honored — 404, 409, 500 status codes take effect |
| 3 | `utils/error.util.js` | `error.stack` included unconditionally | Now gated by `process.env.NODE_ENV === "development"` |
| 4 | `utils/error.util.js` | `POSTGRES_ERROR_CODES` missing from constants | Constant now defined in `constants.js` with 4 error code mappings; reference guarded |
| 5 | `utils/logger.js` | `log()` catch block empty | Now logs `console.error("Logger.log encountered an error:", error)` |
| 6 | `utils/crypto.util.js` | `Math.random()` for salt | Now uses `crypto.randomBytes()` |
| 7 | `utils/crypto.util.js` | `===` for hash comparison | Now uses `crypto.timingSafeEqual()` |
| 8 | `utils/crypto.util.js` | PBKDF2 1000 iterations | Now 600,000 iterations (1000 retained as legacy fallback for old hashes) |
| 9 | `utils/encryption.util.js` | Reads `process.env.VAULT_ENCRYPTION_KEY` directly | Now via `environment` module with validation (32-byte hex check) |
| 10 | `utils/postgresql.util.js` | 2099-line unused file with SQL injection vectors | **File removed entirely** |
| 11 | `utils/string.util.js` | Unused utility | **File removed** |
| 12 | `utils/time.util.js` | Unused utility | **File removed** |
| 13 | `utils/global.util.js` | Unused utility | **File removed** |
| 14 | `index.js` | `/monitor` HTML route public, no auth | **Route removed entirely**; monitor module deleted |
| 15 | `config/express-app.config.js` | `express.json()` called twice | Now called once with `limit` + `verify` |
| 16 | `config/rabbitmq.config.js` | Superseded dead code, missing constants | **File removed**; superseded by `queue.config.js` |
| 17 | `config/firebase.config.js` | Reads `process.env` directly, no startup guard | Now via `environment` module; `try/catch` + `if (serviceAccount)` graceful degradation |
| 18 | `firebase-key.json` | Service account key committed to repo | **File removed** |
| 19 | `package.json` | `"nodmeon"` typo dependency | **Removed**; `nodemon` correctly in devDependencies |
| 20 | `auth/auth.middleware.js` | `getUserFromFirebaseID` error → `next()` with undefined user | Now returns `INVALID_USER` error response; does not fall through |
| 21 | `auth/auth.middleware.js` | `authProviderTest` not gated by NODE_ENV | Now guarded: returns `PERMISSION_DENIED` unless `NODE_ENV === "test"` |
| 22 | `tenant/tenant.service.js` | `deleteUserTenantByID` uses undefined `tenantIdToDelete` | Now uses destructured `tenantID` throughout transaction |
| 23 | `tenant/tenant.controller.js` | Duplicate `{ userID, tenantID, tenantID }` key | Now clean `{ userID, tenantID }` object |
| 24 | `userManagement/userManagement.controller.js` | Field mismatch: validator `userEmail` vs controller `tenantUserEmail` | Both now use `tenantUserEmail` |
| 25 | `userManagement/userManagement.service.js` | References non-existent `INVALID_INPUT` / `USER_NOT_FOUND_IN_TENANT` | Now uses `INVALID_REQUEST` / `USER_NOT_MEMBER_OF_TENANT` (both exist in constants) |
| 26 | `apiKey/apiKey.validator.js` | Validates `apiKeyPermissions` but code reads `roleIDs` | Both now use `roleIDs` consistently |
| 27 | `apiKey/apiKey.middleware.js` | Empty stub | **File removed entirely** |
| 28 | `datasource/datasource.service.js` | Credentials stored as plaintext | Now encrypted at rest via `encryptOptions()` / vault |
| 29 | `datasource/datasource.controller.js` | API returns full `datasourceOptions` with credentials | Controller now applies `maskSensitiveOptions()` before client response |
| 30 | `datasource/datasource.v1.routes.js` | Create/test/proxy routes lack body validation | `createDatasourceSchema`, `testConnectionSchema`, `proxyActionSchema` all wired to routes |
| 31 | `datasource/datasource.middleware.js` | Empty file | **File removed entirely** |
| 32 | `dataQuery/dataQuery.service.js` | `getDataQueryByID` returns joined datasource credentials | Now sets `datasourceOptions = undefined` before returning |
| 33 | `dataQuery/dataQuery.service.js` | `runDataQueryByData` bypasses `resolveInputs` | Now passes `inputValues`/`inputDefinitions`; proxy runs full `resolveInputs` pipeline |
| 34 | `dataQuery/queryEngine/engine.js` | Unbounded `Map` caches, never hit | Now `BoundedCache(1000)` / `BoundedCache(100)` with FIFO eviction; caches are hit |
| 35 | `workflow/workflow.service.js` | `getWorkflowByID`/`updateWorkflow`/`deleteWorkflow` omit `tenantID` | All three now include `tenantID` in `where` clause |
| 36 | `workflow/workflowEngine/engine.js` | `recoverStuckWorkflows` never called on startup | Now wired into `startAllListeners()` in `config/startup.js` |
| 37 | `workflow/handlers/taskListener.js` | `_withTimeout` never clears `setTimeout` | Both `.then()` and `.catch()` now call `clearTimeout(timeoutId)` |
| 38 | `widget/widget.v1.routes.js` | `GET /files` has no auth middleware | Now has `authMiddleware.authorize("widget", "read")` |
| 39 | `widget/widget.controller.js` | `serveFile` fetches any S3 object, no tenant validation | Now validates `expectedPrefix` = `WIDGET_FILES/${tenantID}/`; rejects mismatched paths with 403 |
| 40 | `widget/widget.socket.controller.js` | `onWidgetWorkflowConnect` calls `orchestrator.startWorkflow` directly, no Casbin | Now routes through `authorizedExecuteWorkflow` with Casbin enforcement |
| 41 | `widget/widget.socket.controller.js` | `onWidgetSendInput` calls nonexistent `stateManager.updateContext` | Now calls `stateManager.logEvent` with `SYSTEM_SET` event type |
| 42 | `oauth/oauth.controller.js` | Reflected XSS — raw interpolation into `<script>` | Now uses `JSON.stringify()` for all dynamic values (residual `</script>` edge case — see remaining #21) |
| 43 | `oauth/oauth.controller.js` | `jwt.sign` uses `process.env.VAULT_ENCRYPTION_KEY` directly | Now uses `environment.OAUTH_STATE_SECRET` (residual fallback — see remaining #20) |
| 44 | `monitor/monitor.socket.js` | `/monitor` namespace unauthenticated | **Module removed entirely**; global `authProviderSocket` applied to all Socket.IO namespaces |
| 45 | `ai/ai.service.js` | `sessionStore` unbounded `Map` | Now `BoundedCache(500)` with FIFO eviction |
| 46 | `audit/audit.controller.js` | `constants.ROW_PAGE_SIZE` used without importing `constants` | Import `require("../../constants")` added |
| 47 | `audit/audit.service.js` | `startFlusher` never called | Now called in `config/startup.js` `startAllListeners()`; `stopFlusher()` in shutdown |
| 48 | `audit/audit.middleware.js` | Audit middleware applied twice on some routes | Now applied once at tenant router level only |
| 49 | `audit/audit.v1.routes.js` | Unused `express-validator` import, no query validation | Express-validator removed; Zod `validate(listAuditLogsQuerySchema, "query")` added |
| 50 | `listener/listener.validator.js` | Only query schema; body trusted raw | `createListenerSchema`, `updateListenerSchema`, `addListenerActionSchema`, `updateListenerActionSchema` added and wired to routes |
| 51 | `system/` module | 3 empty files (controller, service, route) | **Entire module removed** |

### ⚠️ REMAINING — Issues Still Present

| # | File | Finding | Severity | Category |
|---|------|---------|----------|----------|
| 1 | `datasource/datasource.controller.js` + `datasource.service.js` | `testDatasourceConnection` logs `datasourceOptions` (credentials) in plaintext via `Logger.log("info", ...)` in both controller and service | **High** | Security |
| 2 | `datasource/datasource.service.js` | `proxyDatasourceAction` does `dsInstance[action](params, {}, helpers)` — existence check only, no action whitelist | **High** | Security |
| 3 | `apiKey/apiKey.service.js` | `getAllAPIKeys` returns `apiKeyHash` to client — no `select`/`omit` on Prisma query | **High** | Security |
| 4 | `index.js` + all controllers | Global error handler is dead code — controllers use try/catch + `sendResponse(false)`, never call `next(err)`. `asyncWrapper` exists but unused | **High** | Error Handling |
| 5 | `config/express-app.config.js` | No `helmet`, no rate limiting | **High** | Security |
| 6 | `config/express-app.config.js` | CORS allows `undefined` and `"null"` origins; `console.log(origin)` in rejection branch | **High** | Security / Code Quality |
| 7 | `index.js` | Socket `on()` callbacks use bare `await` without try/catch — unhandled rejections if they throw | **Medium** | Async |
| 8 | `workflow/handlers/conditionHandler.js` | `matches_regex` uses `new RegExp(coerceStr(right))` with no timeout — ReDoS risk | **Medium** | Security |
| 9 | `workflow/handlers/taskListener.js` | `_withTimeout` — when timeout wins, late rejection from original promise is unhandled | **Medium** | Async |
| 10 | `workflow/handlers/taskListener.js` | Retry logic re-enqueues full job with no idempotency check — non-idempotent nodes re-execute | **Medium** | Correctness |
| 11 | `ai/ai.v1.routes.js` | No route-level `authorize("ai", "use")` — `checkTenantMembership` added but Casbin delegated to tool layer only | **High** | Security |
| 12 | `ai/ai.service.js` | `sessionStore` stores `bearerToken` (Firebase JWT) in memory — propagated to every tool handler | **Medium** | Security |
| 13 | `tenant/tenant.service.js` | `getUserTenantByID` — `tenantDatabaseMetadata` always `null`; schema/table counts always 0 | **Low** | Correctness |
| 14 | `tenant/tenant.service.js` | `getUserTenantByID` — 6 sequential async calls, no `Promise.all` | **Medium** | Performance |
| 15 | `auth/auth.v1.routes.js` | `getUserConfig`/`updateUserConfig` — `checkTenantMembership` added but no Casbin `authorize("tenant", "read")` | **Medium** | Security |
| 16 | `workflow/workflowEngine/engine.js` | `_dispatchNextNodes` — sequential `for...of` with `await` for independent node dispatch | **Medium** | Performance |
| 17 | `workflow/workflowEngine/stateManager.js` | `assembleContext` — fetches ALL matching log rows + `reduce()` merge; O(n) per call, O(n²) total (partially mitigated: query now filters event types + `select: { payload: true }`) | **Medium** | Performance |
| 18 | `auth/auth.middleware.js` | `authProviderTest` still hardcodes `test@test.com` (safely gated by `NODE_ENV === "test"` now) | **Low** | Security |
| 19 | `userManagement/userManagement.service.js` | Serial `for...of` with `await` for `addRoleForUser`/`removeRoleForUser` | **Low** | Performance |
| 20 | `oauth/oauth.v1.routes.js` | No UUID validation of `tenantID` on OAuth routes | **Low** | Consistency |
| 21 | `environment.js` | `OAUTH_STATE_SECRET` falls back to `VAULT_ENCRYPTION_KEY` if unset — key-purpose mixing | **Medium** | Security |
| 22 | `oauth/oauth.controller.js` | `JSON.stringify` doesn't escape `</script>` — residual XSS edge case | **Low** | Security |
| 23 | `utils/logger.js` | `pageLogger` uses `console.log`; error level double-logs (console + winston) | **Low** | Consistency |
| 24 | `utils/input.util.js` | `resolveInputs` reimplements stage functions inline — exported helpers unused by main pipeline | **Low** | Code Quality |
| 25 | `config/winston.config.js` | Double-imports `environment` under two names (`environment` + `environmentVariables`) | **Low** | Code Quality |
| 26 | `config/prisma.config.js` | Commented-out `$use` block + unused `prismaActions`/`prismaActionsForCUD` arrays | **Low** | Code Quality |
| 27 | `environment.js` | `console.log` debug statements at module load (secrets now redacted in dump, but logging remains) | **Low** | Code Quality |
| 28 | `workflow/orchestrator/dagScheduler.js` | 1-line re-export alias of `workflowEngine/dagScheduler.js` | **Low** | Code Quality |
| 29 | `widget/widget.socket.controller.js` | Dead `orchestrator` import left after authorized-proxy refactor | **Low** | Code Quality |

---

## 3. Cross-Cutting Consistency Issues (Updated)

**Error propagation & response formatting — PARTIALLY FIXED**
- `sendResponse` now accepts a status code and sets it correctly. However, the centralized error handler in `index.js` is still unreachable because controllers still use try/catch + `sendResponse(false)` instead of forwarding to `next(err)`. The `asyncWrapper` utility exists but is not used by any route. The architecture is improved but the error handler remains dead code.

**Scattered environment variables — MOSTLY FIXED**
- `encryption.util.js` and `firebase.config.js` now read via the `environment` module. `rabbitmq.config.js` (which read `process.env` directly) has been removed. The only remaining direct `process.env` reads are in `environment.js` itself (which is the correct place) and the `OAUTH_STATE_SECRET` fallback to `VAULT_ENCRYPTION_KEY`.

**Route file naming — STILL INCONSISTENT**
- `.v1.routes.js` (auth, tenant, dataQuery, apiKey, widget, audit, datasource, listener, cronJob, appPage, oauth, ai) vs `.v1.route.js` (singular: userManagement, tenantRole).

**Validation approach — MOSTLY FIXED**
- `audit.v1.routes.js` express-validator import removed; Zod query validation added. `listener` and `datasource` create/test/proxy routes now have body validation. `apiKey` field names aligned. Only `oauth` routes still skip `tenantID` UUID validation.

**Logging — PARTIALLY FIXED**
- `logger.js` empty catch now logs. But `pageLogger` still uses `console.log`, error level still double-logs. `express-app.config.js` still has `console.log(origin)`. `environment.js` still has `console.log` at startup. `postgresql.util.js` console logs removed (file deleted).

**Dead/empty modules & files — MOSTLY CLEANED UP**
- Removed: `system/` module (3 empty files), `datasource.middleware.js`, `apiKey.middleware.js`, `postgresql.util.js`, `string.util.js`, `time.util.js`, `global.util.js`, `rabbitmq.config.js`, `firebase-key.json`. Remaining: `prisma.config.js` dead `$use` block, `orchestrator/dagScheduler.js` alias, dead `orchestrator` import in widget socket controller, `global-variable.config.js` (exports `{}`).

**Service-layer try/catch boilerplate — STILL PRESENT**
- ~50+ service functions still wrap their entire body in identical `try { ... } catch (error) { Logger.log("error", ...); throw error; }`. The `asyncWrapper` utility that would eliminate this remains unused.

---

## 4. Quick Wins (Low Effort, High Impact) — Updated

Items marked ✅ are already done. Remaining items are listed by priority.

1. ✅ ~~Fix `tenant.service.deleteUserTenantByID`~~ — Done
2. ✅ ~~Add auth to `GET /widgets/files`~~ — Done
3. ✅ ~~Add auth to `/monitor` socket namespace~~ — Done (module removed)
4. ✅ ~~Fix OAuth callback XSS~~ — Done (residual `</script>` edge case remains)
5. ✅ ~~Fix `sendResponse` to accept a status code~~ — Done
6. ✅ ~~Strip stack traces from error responses~~ — Done
7. ✅ ~~Import constants in Audit Controller~~ — Done
8. ✅ ~~Call `auditService.startFlusher()` on startup~~ — Done
9. ✅ ~~Call `recoverStuckWorkflows()` on startup~~ — Done
10. ✅ ~~Remove `firebase-key.json` from repo~~ — Done
11. ✅ ~~Remove typoed `nodmeon` dependency~~ — Done
12. ✅ ~~Remove redundant JSON body parser~~ — Done
13. ✅ ~~Fix `widget.socket.controller.onWidgetSendInput`~~ — Done
14. ✅ ~~Fix field name mismatch in `userManagement`~~ — Done
15. ✅ ~~Enforce tenant scoping on AI chat routes~~ — Partially done (`checkTenantMembership` added; route-level Casbin still missing)

**Remaining quick wins:**
16. **Mask credentials in `testDatasourceConnection` logs** — Apply `maskSensitiveOptions` before logging `datasourceOptions` in both controller and service.
17. **Add `select`/`omit` to `getAllAPIKeys`** — Exclude `apiKeyHash` from the Prisma query.
18. **Add action whitelist to `proxyDatasourceAction`** — Validate `action` against an allowed-methods list per datasource type.
19. **Remove dead `orchestrator` import** in `widget.socket.controller.js`.
20. **Remove `orchestrator/dagScheduler.js` alias** — Import directly from `workflowEngine/dagScheduler.js`.
21. **Add `helmet`** — `npm install helmet` + `expressApp.use(helmet())`.
22. **Remove `console.log(origin)`** from CORS rejection branch in `express-app.config.js`.
23. **Provision `OAUTH_STATE_SECRET`** as a dedicated env var (remove the `VAULT_ENCRYPTION_KEY` fallback in `environment.js`).
24. **Add UUID validation** to OAuth routes (`validate(tenantIdParamSchema, "params")`).
25. **Remove dead code in `prisma.config.js`** — Delete the commented `$use` block and unused arrays.

---

## 5. Suggested Refactor Priorities (Ranked, Updated)

Items marked ✅ are already done.

1. ✅ ~~Standardize HTTP error status codes~~ — `sendResponse` now sets status codes. **Remaining sub-task:** introduce `asyncWrapper(fn)` usage across routes so controllers forward to `next(err)` and the centralized error handler becomes reachable. Eliminate per-controller try/catch + `sendResponse(false)` boilerplate.

2. ✅ ~~Secure datasource credential storage~~ — Encrypted at rest; controller masks in API responses. **Remaining sub-task:** mask credentials in `testDatasourceConnection` logs; strip decrypted options from service-layer returns where not needed.

3. ✅ ~~Authorize the widget socket path~~ — Now via `authorizedExecuteWorkflow` with Casbin. **Remaining sub-task:** remove the dead `orchestrator` import.

4. ✅ ~~Add tenant scoping to Prisma queries~~ — Workflow service now includes `tenantID` in all `where` clauses. **Remaining sub-task:** audit other services (appPage, dataQuery on some paths) for similar IDOR gaps.

5. ✅ ~~Secure the monitor dashboard & log stream~~ — Module removed; global socket auth applied.

6. ✅ ~~Add body validation to listener + datasource routes~~ — Both now have Zod schemas wired to routes.

7. ✅ ~~Harden crypto~~ — `crypto.randomBytes`, `crypto.timingSafeEqual`, 600k PBKDF2 iterations all done.

8. ✅ ~~Delete unused/dead code~~ — 11 files/modules removed (2099-line `postgresql.util.js`, 3 utils, `system/` module, empty middlewares, `rabbitmq.config.js`, `firebase-key.json`). **Remaining:** `prisma.config.js` dead block, `dagScheduler.js` alias, dead `orchestrator` import, `global-variable.config.js`.

9. ✅ ~~Mitigate memory leaks~~ — `QueryEngine` caches → `BoundedCache(1000/100)`; AI `sessionStore` → `BoundedCache(500)`. **Remaining:** `sessionStore` still stores raw JWT tokens in memory.

10. **Add request correlation IDs** — Still not implemented. Middleware that generates a UUID per request, attaches to `req.id`, includes in all log entries.

11. **Add `helmet` and rate limiting** — Still not implemented. `helmet` for security headers, `express-rate-limit` for brute-force protection.

12. **Tighten CORS** — Remove `undefined` and `"null"` from the allowed origins list.

13. **Add ReDoS mitigation for `matches_regex`** — Validate/sanitize regex patterns or run in the isolated-vm with a timeout.

14. **Fix `_withTimeout` unhandled rejection** — When timeout wins, attach a no-op `.catch()` to the original promise to suppress the late rejection.

15. **Add idempotency guards to workflow retry** — Track executed node IDs per instance; skip re-execution on retry for non-idempotent node types.

16. **Parallelize sequential async calls** — `getUserTenantByID` (6 calls), `_dispatchNextNodes` (node dispatch), UserManagement role sync — all should use `Promise.all`.

---

## 6. Audit Scorecard

| Category | Original | Current |
|----------|----------|---------|
| Critical security issues | 12 | **0** |
| High-severity remaining | 8 | **6** |
| Medium-severity remaining | ~15 | **9** |
| Low-severity remaining | ~15 | **14** |
| Files removed (dead code) | — | **11** |
| Total findings fixed | — | **51 of 80** |
| **Remaining findings** | **80** | **29** |
