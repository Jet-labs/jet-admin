# Backend Code Guidelines — `apps/backend`

> **Audience:** AI coding agents and human contributors working on the Jet Admin
> backend. These are **mandatory rules**, not suggestions. They are derived from
> the patterns established in the codebase and its audit history. Follow them on
> every change.
>
> Last updated: 2026-07-03 · Stack: Express.js + Prisma + Socket.IO + Casbin RBAC
> (multi-tenant) · CommonJS / Node.js

---

## 0. TL;DR — The Core Commandments

1. **Never read `process.env` directly** — import the environment module once at
   the top of the file (`const environmentVariables = require("../environment")`)
   and access `environmentVariables.X`. Never inline `require("../environment").X`.
   `environment.js` is the *only* module allowed to touch `process.env`.
2. **Never log or return secrets** — use `redact()` for logs, `mask()` for API
   responses. Never `console.log` credentials.
3. **Every tenant-scoped query must filter by `tenantID`** in its `where` clause.
   No exceptions. This is the IDOR defense.
4. **Every route needs auth + validation, in the right order** — `authProvider`
   (identity) → Zod `validate(...)` → `authorize("resource", "action")` (Casbin).
   Validation comes **before** auth/authorization middleware. No unvalidated
   body/params.
5. **Use Zod, not express-validator** — define schemas in `<module>.validator.js`
   and wire them with `validate(schema, "body"|"params"|"query")`.
6. **Encrypt credentials at rest** with `encryption.util` (AES-256-GCM). Mask
   them in every API response.
7. **Use the Logger, not `console.*`** — `Logger.log("info", { message, params })`.
   Log messages follow `module:function:stage` naming.
8. **No dead code** — no commented-out blocks, no re-export aliases, no unused
   imports, no empty stub files. Delete it.
9. **Parallelize independent async work** with `Promise.all` — never sequential
   `for...of` + `await` for unrelated calls.
10. **Don't hardcode secrets, keys, or test users** — and never fall back one
    secret to another (no key-purpose mixing).
11. **Always pass an explicit HTTP status code** (5th arg) to
    `expressUtils.sendResponse()` — from `constants.HTTP_STATUS`, for both
    success and failure. Never omit it or rely on the auto-derivation default.

The rest of this document elaborates on these and every other convention.

---

## 1. Architecture & Module Structure

### 1.1 Layered architecture

The backend is strictly layered. **Do not skip layers or let one layer reach
into another's responsibilities.**

```
HTTP request
  → routes        (Express Router: wiring + middleware order)
  → validator     (Zod schema validation)
  → middleware    (auth, tenant membership, Casbin, audit, business guards)
  → controller    (extracts req data, calls one service fn, shapes response)
  → service       (business logic + Prisma queries + cross-module calls)
  → prisma / config singletons  (data access & shared infrastructure)
```

**Rules:**
- Controllers **must not** contain Prisma queries or business logic. They only
  parse `req`, call a single service method, and return via `sendResponse`.
- Services **must not** import Express types or touch `req`/`res`. They receive
  plain object arguments and `throw` on failure.
- Routes **must not** contain logic — only middleware chains + handler binding.
- Database access is confined to the **service layer and `config/` singletons**
  (e.g. `prisma.config`, `casbin.config`). Controllers never call Prisma.

### 1.2 Module file layout

Every feature module lives under `modules/<moduleName>/` and contains exactly
the files it needs. **File names follow this convention** (the singular `.route`
vs plural `.routes` inconsistency is a known debt — **use the plural
`.v1.routes.js` form for all new modules**):

| File                          | Responsibility                                              |
|-------------------------------|-------------------------------------------------------------|
| `<module>.controller.js`      | Request handlers (thin).                                    |
| `<module>.service.js`         | Business logic + Prisma. Exported as `{ <module>Service }`. |
| `<module>.middleware.js`      | Module-specific middleware (guards, limits).                |
| `<module>.validator.js`       | Zod schemas for body/params/query.                          |
| `<module>.v1.routes.js`       | Express Router wiring.                                      |
| `<module>.socket.controller.js` | Socket.IO event handlers (only if realtime).              |

**Rules:**
- Do **not** create empty stub files. If a module has no middleware, omit the
  file (see audit: empty `apiKey.middleware.js`, `datasource.middleware.js`,
  `system/` module were all removed).
- Group engine/sub-system files under `<module>/<subsystem>/` (e.g.
  `workflow/workflowEngine/`, `listener/listenerEngine/`).
- Shared cross-module infrastructure belongs in `config/` (singletons) or
  `utils/` (stateless helpers) — never inside a feature module.

### 1.3 Module gating

Use `isModuleEnabled(constants.MODULES.X)` from `config/module.config.js` to
conditionally wire routes/imports. Declare dependencies in
`moduleDependencies`. When a module is enabled, all its declared dependencies
must also be enabled.

```js
if (isModuleEnabled(constants.MODULES.WORKFLOW)) {
  expressApp.use("/api/v1/tenants/:tenantID/workflows", workflowRouter);
}
```

---

## 2. Configuration & Environment

### 2.1 Single source of environment variables

`environment.js` is the **only** place that reads `process.env`. Every other
module imports from it:

```js
// GOOD — import once at the top of the file, then access properties
const environmentVariables = require("../environment");
const port = environmentVariables.PORT;

// BAD — never inline require("../environment").X inline
const port = require("../environment").PORT;

// WORSE — never read process.env outside environment.js
const port = process.env.PORT;
```

**Rules:**
- Adding a new env var? Add it to `environment.js` with a safe default and
  document its purpose.
- Validate required secrets at load (see how `encryption.util` checks the
  32-byte hex key). Fail fast with a clear message if missing/malformed.
- **No key-purpose mixing.** Each secret needs its own dedicated env var. Never
  fall back one secret to another (audit found `OAUTH_STATE_SECRET` falling back
  to `VAULT_ENCRYPTION_KEY` — don't repeat this). If a secret is required, make
  it required; if optional, give it a safe non-secret default.
- Do **not** add `console.log` statements at module load (audit flagged
  `environment.js` and `winston.config.js` double-imports). Use `Logger` after
  it's available, and redact secrets in any diagnostic dump.

### 2.2 Config singletons

`config/` files export shared singletons: `prisma`, `expressApp`, `httpServer`,
`socketIO`, the Casbin enforcer, the in-memory queue, Firebase app, winston
logger. **Rules:**
- Import these, don't re-instantiate.
- `prisma.config.js` exports `{ prisma, dbModel }`. Use the shared `prisma`
  client everywhere — never `new PrismaClient()` elsewhere.
- Keep `config/` free of dead code (audit flagged a commented `$use` block and
  unused arrays — removed/deleted going forward).

### 2.3 Startup & shutdown

All long-running listeners are wired through `config/startup.js`:
`startAllListeners()` (called from `index.js` on boot) and
`stopAllListeners()` (called on `SIGINT`). **Rules:**
- New background workers (queue consumers, flushers, cron schedulers,
  subscription engines) must be started in `startAllListeners()` and stopped in
  `stopAllListeners()`.
- Wrap recovery/cleanup calls that may fail with `.catch()` so one failure
  doesn't abort the rest of startup/shutdown (see `recoverStuckWorkflows`).

---

## 3. Constants

All app-wide constants live in `constants.js` and are namespaced:

```js
constants.ERROR_CODES.PERMISSION_DENIED     // { code, message }
constants.HTTP_STATUS.FORBIDDEN            // 403
constants.MODULES.WORKFLOW                 // "workflow"
constants.WORKFLOW_STATUS.RUNNING
constants.POSTGRES_ERROR_CODES["23505"]
```

**Rules:**
- **Never inline magic strings/numbers** for error codes, HTTP statuses, module
  names, event names, or statuses. Reference `constants`.
- Adding a new error? Add it to `constants.ERROR_CODES` as
  `{ code: "UNIQUE_CODE", message: "..." }` — both fields required.
- Adding a new Socket event? Add to `SOCKET_EMIT_EVENTS` / `SOCKET_RECEIVE_EVENTS`.
- Always `require("../constants")` where you use it (audit caught a missing
  import in the audit controller).

---

## 4. Request Validation (Zod)

**Zod is the validation library.** express-validator is legacy and being phased
out — do not introduce it in new code.

### 4.1 Where schemas live

Every module defines its schemas in `<module>.validator.js`:

```js
const { z, schemas } = require("../../utils/validation.utils");

const createWidgetSchema = z.object({
  widgetTitle: z.string().min(1).max(255),
  widgetType:  z.enum(["table", "chart", "form"]),
}).passthrough();

const tenantIdParamSchema = z.object({
  tenantID: schemas.uuidSchema,
}).passthrough();

module.exports = { createWidgetSchema, tenantIdParamSchema };
```

Reuse the shared schemas in `validation.utils.js` (`uuidSchema`, `emailSchema`,
`paginationSchema`, `cronScheduleSchema`, `tenantIdParamSchema`, etc.) instead
of redefining them.

### 4.2 Wiring validation to routes

```js
const { validate, validateAll } = require("../../utils/validation.utils");

// Single source
router.post("/", validate(createWidgetSchema, "body"), controller.create);
router.get("/:tenantID", validate(tenantIdParamSchema, "params"), controller.get);

// Multiple sources at once
router.patch("/:tenantID",
  validateAll({ params: tenantIdParamSchema, body: updateWidgetSchema }),
  controller.update
);
```

**Rules:**
- **Every route that accepts a body, params, or query MUST validate it.**
  Audit found OAuth routes skipping `tenantID` UUID validation — never repeat.
- Validate `tenantID` params on every tenant-scoped route (use
  `tenantIdParamSchema`).
- `validate()` replaces `req.body`/`req.params`/`req.query` with the parsed
  (coerced, stripped) result and stores it in `req.validated[source]`. Read from
  `req.body` etc. in controllers — the validated values are already there.
- Use `.passthrough()` on object schemas only when you intentionally allow
  extra keys; prefer strict objects that strip unknown fields.

---

## 5. Controllers

Controllers are thin. The pattern:

```js
const constants = require("../../constants");
const { expressUtils } = require("../../utils/express.utils");
const Logger = require("../../utils/logger");
const { widgetService } = require("./widget.service");
const { getServiceAuthContext } = require("../../utils/auth.context.utils");

const widgetController = {};

widgetController.createWidget = async (req, res) => {
  try {
    const { user } = req;
    const { tenantID } = req.params;
    const { widgetTitle, widgetType } = req.body;
    const authContext = getServiceAuthContext(req);

    const widget = await widgetService.createWidget({
      userID: user.userID,
      tenantID,
      widgetTitle,
      widgetType,
      authContext,
    });

    return expressUtils.sendResponse(res, true, { widget }, null, constants.HTTP_STATUS.CREATED);
  } catch (error) {
    Logger.log("error", {
      message: "widgetController:createWidget:catch-1",
      params: { error },
    });
    return expressUtils.sendResponse(res, false, {}, error, constants.HTTP_STATUS.BAD_REQUEST);
  }
};

module.exports = { widgetController };
```

**Rules:**
- **Extract inputs at the top** (`req.user`, `req.params`, `req.body`,
  `req.authContext`), then call **one** service method, then respond.
- Always respond via `expressUtils.sendResponse(res, success, data, error, statusCode)`.
  Never call `res.json` / `res.status().send` directly.
- **Always pass an explicit HTTP status code** (5th argument) from
  `constants.HTTP_STATUS` — for both success and failure. Do not rely on the
  auto-derivation default. Examples: `CREATED` (201) on create, `OK` (200) on
  read, `BAD_REQUEST` (400) / `UNAUTHORIZED` (401) / `FORBIDDEN` (403) /
  `NOT_FOUND` (404) / `INTERNAL_SERVER_ERROR` (500) on error.
- Always wrap the handler body in `try/catch`. On error, log + return
  `sendResponse(res, false, {}, error, constants.HTTP_STATUS.<CODE>)`. (See §10
  for the `asyncWrapper`/`next(err)` transition — until controllers migrate,
  keep the try/catch.)
- Pass `authContext` (from `getServiceAuthContext(req)`) into services that
  create resources or need to know the actor.
- **Never** put Prisma calls, Casbin checks, or business rules in a controller.

### 5.1 `sendResponse` semantics

`sendResponse(res, success, data = {}, error = null, statusCode = 200)`:
- **Always pass an explicit status code.** The 5th argument is honored and sets
  `res.status(code)`. Never omit it — pick the correct code from
  `constants.HTTP_STATUS` for every call.
- On `success: false` with no explicit status, it auto-derives 400/401/403/500
  from the error code via `errorUtils.extractError` — but this is a fallback
  only; **always specify the status explicitly** rather than relying on it.
- The error is always run through `errorUtils.extractError` so the client gets a
  normalized `{ code, message, details }` shape.

---

## 6. Services

Services hold business logic and all Prisma access.

```js
const { prisma } = require("../../config/prisma.config");
const Logger = require("../../utils/logger");
const { getCreationContextFromAuthContext } = require("../../utils/auth.context.utils");

const widgetService = {};

widgetService.createWidget = async ({ userID, tenantID, widgetTitle, authContext }) => {
  try {
    const { creatorID, createdByApiKeyID } = getCreationContextFromAuthContext(authContext);
    const widget = await prisma.tblWidgets.create({
      data: { tenantID, widgetTitle, creatorID, createdByApiKeyID },
    });
    return widget;
  } catch (error) {
    Logger.log("error", { message: "widgetService:createWidget:catch-1", params: { error } });
    throw error;
  }
};

module.exports = { widgetService };
```

**Rules:**
- Services receive a **destructured object** argument, not positional args.
- Services **throw** on failure; they never return `{ success }` booleans or
  touch `res`.
- **Tenant-scoped queries MUST include `tenantID` in the `where` clause.**
  (Audit fixed workflow service IDORs — keep this invariant.) This applies to
  `findUnique`/`findFirst`/`findMany`/`update`/`delete`/`count` alike.
- **Use `Promise.all` for independent async calls.** Audit flagged
  `getUserTenantByID` (6 sequential calls), `_dispatchNextNodes`, and role sync
  using sequential `for...of` + `await`. Don't repeat.
- Multi-step mutations use `prisma.$transaction([...])` (batch array form) or
  `prisma.$transaction(async (tx) => { ... })` (interactive form) — use the
  interactive form when later steps depend on earlier results.
- Set `creatorID` / `createdByApiKeyID` from `getCreationContextFromAuthContext`
  (mutually exclusive: user auth sets `creatorID`; API-key auth sets
  `createdByApiKeyID`). Never set both, never hardcode a creator.
- After creating a Casbin-protected resource, grant the creator access via
  `grantCreatorAccess(tenantID, resourceType, resourceID, authContext)`.
- **Strip sensitive fields before returning.** If a service returns a row that
  joins credentials (e.g. `dataQuery` joining `datasourceOptions`), set those
  fields to `undefined` or use `select`/`omit` before returning. Audit found
  `getAllAPIKeys` returning `apiKeyHash` — always exclude hashes.

### 6.1 Service try/catch

The established pattern wraps each service fn in
`try { ... } catch (error) { Logger.log("error", {...}); throw error; }`.
This is the current convention — preserve it for consistency. (The long-term
goal is to eliminate this boilerplate via `asyncWrapper` + `next(err)` — see
§10. Do **not** half-migrate: either keep the try/catch or fully move to
`asyncWrapper` across a module.)

---

## 7. Authentication & Authorization

### 7.1 Auth middleware chain

Every protected route chain is:

```
authMiddleware.authProvider          // identity: decodes Firebase token OR API key → req.user, req.authContext
  → validate(schema, "params"/"body") // Zod validation — BEFORE authorization middleware
  → authMiddleware.authorize(res, act) // Casbin RBAC authorization
  → (optional) module middleware      // e.g. checkTenantCreationLimit
  → controller
```

`authProvider` runs first (router-level) to establish identity. **Zod
validation must come before auth/authorization middleware** (`authorize`,
`checkTenantMembership`, module guards) so that authorization checks operate on
validated, coerced input and invalid requests are rejected before any
authorization work runs.

### 7.2 Casbin authorization — mandatory

Use `authMiddleware.authorize(resourceType, action)` for **route-level**
authorization. The resource ID is resolved from `req.params` by convention
(`"dataquery"` → `req.params.dataQueryID`), or via `paramKey`/`bodyKey`/
`reqKey`/`skipIfMissing` options.

```js
router.get("/:tenantID/queries/:dataQueryID",
  validate(tenantIdParamSchema, "params"),
  authMiddleware.authorize("dataquery", "read"),
  controller.getDataQuery
);

// Multiple checks / body-key binding
authMiddleware.authorize([
  { resource: "appPage", action: "read", paramKey: "appPageID" },
  { resource: "datasource", action: "run", bodyKey: "datasourceID", skipIfMissing: true },
]);
```

**Rules:**
- **Do not delegate all Casbin checks to a deeper layer and skip route-level
  `authorize`.** Audit flagged the AI routes doing exactly this. Put
  `authorize(...)` on the route. Per-tool checks can supplement, not replace,
  route-level enforcement.
- `checkTenantMembership` is a coarse membership check — it is **not** a
  substitute for `authorize(...)`. Use both: membership for "is in tenant",
  `authorize` for "can do action on resource".
- `authorize` also attaches `req.executionCtx = fromRequest(req)` for
  downstream services — use it where available.
- For list endpoints with no specific resource ID, the selector becomes
  `<resourceType>:*` which requires a wildcard policy.

### 7.3 Auth context & creation context

- `getServiceAuthContext(req)` → `{ authType, userID, apiKeyID, actorID, actorType, ... }` for services.
- `getCreationContextFromAuthContext(authContext)` → `{ creatorID, createdByApiKeyID }` (mutually exclusive).
- `isAPIKeyAuth(req)` / `isUserAuth(req)` / `getLoggingParams(req, extra)` for branching/logging.

### 7.4 Socket authentication

All Socket.IO namespaces use `authMiddleware.authProviderSocket` (applied
globally in `config/socket.io.js`). **Rules:**
- Never create an unauthenticated namespace (the `/monitor` namespace was removed
  for exactly this).
- Socket `on()` handlers run async callbacks. **Wrap them in try/catch** so a
  throw becomes a logged error, not an unhandled rejection (audit flagged bare
  `await` in all `index.js` socket handlers). Pattern:

```js
socket.on(EVENT, async (data) => {
  try {
    await someSocketController.handle({ socket, ...data });
  } catch (error) {
    Logger.log("error", { message: "socket:event:error", params: { error: error.message } });
  }
});
```

---

## 8. Security (Strict)

### 8.1 Secrets, credentials, and sensitive data

- **Never log plaintext secrets.** `Logger.log` already runs `redact()` on
  `params`, but **don't rely on that alone** — don't pass raw credential
  objects (`datasourceOptions` with passwords/keys) into log params at all.
  Audit found `testDatasourceConnection` logging credentials in both controller
  and service. Apply `mask()` / `redact()` before logging, or log only
  non-sensitive identifiers.
- **Never return secrets in API responses.** Use `mask()` (from `sensitive.js`)
  on credential-bearing payloads before `sendResponse`. The canonical sensitive
  key lists live in `utils/sensitive.js` — import `redact`/`mask`/`MASK_PLACEHOLDER`
  from there; do **not** redefine sensitive-field lists elsewhere.
- **Encrypt credentials at rest** with `encryption.util` (`encrypt`/`decrypt`,
  AES-256-GCM). Treat the `MASK_PLACEHOLDER` (`"●●●●●●●●"`) in an update payload
  as "unchanged — restore from DB", not as a real value.
- **Never store raw tokens (JWTs, bearer tokens) in memory longer than needed.**
  Audit flagged the AI `sessionStore` keeping `bearerToken` in a `BoundedCache`.
  If you must cache session state, store a derived/session ID, not the raw token.
- **Never hardcode secrets, keys, or test users.** `authProviderTest` hardcodes
  `test@test.com` — it's gated behind `NODE_ENV === "test"`, but new test-only
  paths should read from `constants.DEFAULTS` and stay env-gated.

### 8.2 Crypto

Use `utils/crypto.util.js`. **Rules:**
- Passwords: `generateSaltAndPasswordHash` / `comparePasswordWithHash`
  (PBKDF2-SHA512, 600,000 iterations; legacy 1,000-iteration fallback retained
  only for old hashes).
- Random tokens/salts: `generateRandomString` / `generateAPIKey` — both use
  `crypto.randomBytes`. **Never use `Math.random()` for security.**
- Comparisons: `crypto.timingSafeEqual` (see `verifyAPIKeyHash`,
  `comparePasswordWithHash`). **Never use `===`/`==` to compare secrets.**

### 8.3 Dynamic dispatch — always whitelist

When invoking a method by name (`obj[action](...)`), **validate `action`
against an explicit allowlist** per type. Audit found
`proxyDatasourceAction` doing `dsInstance[action](...)` with only an existence
check — any public method was callable. Pattern:

```js
const ALLOWED_ACTIONS = { postgres: ["runQuery", "getSchema"], mysql: [...] };
if (!ALLOWED_ACTIONS[dsType]?.includes(action)) {
  throw constants.ERROR_CODES.INVALID_REQUEST;
}
```

### 8.4 HTTP hardening

- `express.json` is configured once with a `limit` and `verify` (raw body).
  Don't add a second body parser.
- **Add `helmet`** for security headers and **rate limiting**
  (`express-rate-limit`) for brute-force protection — these are currently
  missing (audit). When adding routes, don't disable them.
- **Tighten CORS.** Don't allow `undefined` or `"null"` origins in
  `CORS_WHITELIST`. Don't leave `console.log(origin)` in the rejection branch.

### 8.5 ReDoS & user-supplied code

- User-supplied regex (`new RegExp(userInput)`) is a ReDoS vector. Either
  validate/sanitize the pattern or run it in the `isolated-vm` sandbox with a
  timeout. Don't run untrusted regex on the main thread without a timeout
  (audit flagged `matches_regex`).
- User-supplied JavaScript runs in `isolated-vm` with a timeout — keep that
  sandboxing for any eval-like feature.

### 8.6 XSS in templated HTML

When interpolating dynamic values into HTML/`<script>` (e.g. OAuth callback),
use `JSON.stringify` **and** escape `<` (at minimum `</script>` → `<\/script>`)
to prevent breaking out of the script context. Audit found a residual
`</script>` edge case — escape it.

---

## 9. Logging

Use `Logger` (winston wrapper), never `console.*` in app code.

```js
const Logger = require("../../utils/logger");

Logger.log("info",    { message: "widgetService:createWidget:params",  params: { tenantID, widgetTitle } });
Logger.log("success", { message: "widgetService:createWidget:created", params: { widgetID: widget.widgetID } });
Logger.log("error",   { message: "widgetService:createWidget:catch-1", params: { error } });
Logger.log("warning", { message: "..." });
```

**Rules:**
- Levels: `"info" | "success" | "warning" | "error"`.
- **Message naming: `module:function:stage`** (e.g.
  `tenantService:createTenant:newTenantCreated`). Keep it consistent and
  greppable.
- `params` is an object; it's auto-redacted by `redact()` before hitting
  winston. Still, don't put whole credential objects in `params`.
- Log params should carry **identifiers, not full rows** — log `widgetID`,
  not the entire widget including nested joins.
- **No `console.log` / `console.error`** in modules, configs, or routes
  (audit flagged `pageLogger`, `express-app.config.js`, `environment.js`).
  The only sanctioned `console` use is inside `Logger` itself as a fallback.
- Don't double-log. `Logger.log("error", ...)` already writes to winston; don't
  also `console.log` the same error alongside it.

---

## 10. Error Handling

### 10.1 `errorUtils.extractError`

All errors flow through `errorUtils.extractError(error)` which normalizes them
into `{ code, message, details }` and handles: arrays (validation), `Error`
instances, PostgreSQL errors (via `POSTGRES_ERROR_CODES`), nested
`{ error: ... }`, generic objects, and primitives. Stack traces are included
**only** when `NODE_ENV === "development"`.

**Rules:**
- Throw structured errors: either `throw constants.ERROR_CODES.X` (an
  `{ code, message }` object) or `throw new Error("...")`. `extractError`
  handles both.
- For validation errors, throw/pass an array of `{ path, message }` issues.
- **Don't leak stack traces** to clients in production — `extractError` already
  gates this; don't bypass it with raw `error.stack` in responses.

### 10.2 Global error handler & `asyncWrapper`

`index.js` has a centralized error handler that maps error codes → HTTP status.
It is currently **unreachable** because controllers use try/catch +
`sendResponse(false)` instead of `next(err)`. The `asyncWrapper` utility exists
but is unused.

**Guidance:** When refactoring a controller to the centralized model, use
`expressUtils.asyncWrapper(fn)` on the route handler and let errors propagate
to `next(err)` (remove the per-controller try/catch). **Do this per-module and
completely** — don't leave a controller half-migrated. Until a module is
migrated, keep the established try/catch + `sendResponse(false)` pattern for
consistency within that module.

### 10.3 Promises & unhandled rejections

- **Always attach a `.catch()` to fire-and-forget promises** (queue pushes,
  delayed jobs, setTimeout-wrapped async). Audit's `queue.config` does this;
  replicate it.
- For "race a promise against a timeout" helpers, when the timeout wins,
  attach a no-op `.catch()` to the original promise to suppress its late
  rejection (audit flagged `_withTimeout`'s unhandled rejection path).
- Socket handlers: see §7.4 (wrap in try/catch).

### 10.4 Idempotency & retries

- Retry logic that re-enqueues jobs must guard against re-executing
  **non-idempotent** nodes. Track executed node IDs per instance and skip
  re-execution on retry for side-effecting types (audit flagged the workflow
  retry path). Don't add blind retry without an idempotency key/guard.

---

## 11. Performance

- **Parallelize independent async calls with `Promise.all`** (see §6). Sequential
  `for...of` + `await` is only acceptable when each iteration depends on the
  prior.
- **Bound all in-memory caches.** Use `BoundedCache` (FIFO eviction) — never a
  bare unbounded `Map` that grows forever (audit converted QueryEngine caches
  and AI `sessionStore` to `BoundedCache`). State the capacity when creating.
- **Filter at the database, not in memory.** Don't `findMany` then `.reduce()`
  over all rows in a hot path (audit flagged `assembleContext` fetching all log
  rows). Push `where`/`select`/`take`/`orderBy` into Prisma; fetch only the
  event types/columns you need.
- Avoid O(n²) patterns in long-running workflows — prefer incremental state
  updates over full re-reads.

---

## 12. Naming & Code Quality

- **File naming:** `<module>.<layer>.js` (e.g. `tenant.service.js`). Route files
  use the plural `.v1.routes.js`. Controllers/services export a singleton object:
  `module.exports = { tenantController }` / `{ tenantService }`.
- **No dead code.** Delete: commented-out blocks, unused imports, 1-line
  re-export aliases, empty files, unused utility functions. (Audit removed 11+
  files; remaining dead code is being cleared.) If you remove a feature, remove
  its imports everywhere — don't leave dangling references.
- **No duplicate imports.** Don't import the same module under two names
  (audit flagged `winston.config.js` importing `environment` twice).
- **Single quotes** for strings (matches existing style). **2-space indent.**
  Trailing commas in multi-line objects/arrays.
- Prefer `const`; use `let` only when reassigning. Use `Object.freeze` for
  constant maps (see `constants`, `logLevels`).
- Destructure function args: `async ({ userID, tenantID }) => { ... }`.
- **Don't add comments unless the logic is non-obvious.** Let the code and the
  `module:function:stage` log messages document the flow. When you do comment,
  explain *why*, not *what*.

---

## 13. Route File Checklist

When adding or modifying a route, verify:

- [ ] `authMiddleware.authProvider` is applied (at the tenant-router level or per-route).
- [ ] `validate(...)` / `validateAll(...)` covers every `body`/`params`/`query` input.
- [ ] **Validation is placed before auth/authorization middleware** (`authorize`, `checkTenantMembership`, module guards).
- [ ] `tenantID` param is validated with `tenantIdParamSchema` on tenant-scoped routes.
- [ ] `authMiddleware.authorize("resource", "action")` is present (route-level, not just delegated).
- [ ] Audit middleware is applied once (at the tenant router level) — not duplicated per-route.
- [ ] Nested routers mount under `/:tenantID/<resource>` with `mergeParams: true`.
- [ ] No business logic in the route file — only middleware + handler binding.
- [ ] Module-gated with `isModuleEnabled(...)` where appropriate.

---

## 14. New-Module Checklist

When creating a new feature module:

1. Create `modules/<module>/` with `controller`, `service`, `validator`,
   `.v1.routes.js`. Add `middleware` only if needed.
2. Add the module name to `constants.MODULES` and any new error codes to
   `constants.ERROR_CODES`.
3. Define Zod schemas in `<module>.validator.js`, reusing `schemas.*`.
4. Service: all Prisma queries filter by `tenantID`; set
   `creatorID`/`createdByApiKeyID` from auth context; strip secrets before
   returning.
5. Routes: full middleware chain (§13). Mount via the tenant router or
   `index.js`, gated by `isModuleEnabled`.
6. Register module dependencies in `config/module.config.js` `moduleDependencies`.
7. Wire any background workers into `config/startup.js` start/stop.
8. For Casbin-protected resources, call `grantCreatorAccess` on create and
   `removePoliciesForResource` on delete.
9. No `console.*`, no `process.env`, no hardcoded secrets, no dead files.

---

## 15. Forbidden Patterns (Quick Reference)

| Anti-pattern | Do this instead |
|---|---|
| `process.env.X` outside `environment.js` | `const environmentVariables = require("../environment")` then `environmentVariables.X` |
| `console.log(...)` in app code | `Logger.log(level, { message, params })` |
| `res.json(...)` / `res.status().send(...)` in controllers | `expressUtils.sendResponse(res, success, data, error, statusCode)` with an explicit status code |
| Express-validator in new code | Zod via `validation.utils.js` |
| Prisma query missing `tenantID` in `where` | Always scope by `tenantID` |
| `Math.random()` for security | `crypto.randomBytes` |
| `===` to compare secrets | `crypto.timingSafeEqual` |
| Plaintext credential storage | `encryption.util` `encrypt`/`decrypt` |
| Logging/returning `apiKeyHash` / credentials | `select`/`omit` excludes; `mask()` responses |
| `obj[action](...)` without an allowlist | Whitelist `action` per type |
| Sequential `await` for independent calls | `Promise.all([...])` |
| Unbounded `Map` cache | `BoundedCache(n)` |
| Bare `await` in socket `on()` handler | Wrap in `try/catch` |
| Fire-and-forget promise with no `.catch()` | Attach `.catch()` |
| Route with no `authorize(...)` | Add route-level Casbin `authorize` |
| Falling back one secret to another | Dedicated env var per secret |
| Commented-out code / dead imports / re-export aliases | Delete them |
| Hardcoded secrets, test users, magic strings | `constants` + `environment` |

---

*These guidelines evolve with the codebase. When a pattern here conflicts with a
deliberate, reviewed change, update this document in the same PR. When in doubt,
match the cleanest existing module (e.g. `tenant`) and re-read the backend's
audit history to avoid reintroducing a previously fixed issue.*
