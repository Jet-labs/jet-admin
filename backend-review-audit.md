# Backend Review - Prioritized Fix Checklist and Audit Table

Generated: 2026-03-08
Scope: `apps/backend`

## Prioritized Fix Checklist by File

### P0 - Immediate security/correctness

#### `apps/backend/environment.js`
- Remove logging of full `environmentVariables`
- Remove env startup logs unless explicitly debug-gated
- Use `process.env.NODE_ID` instead of deriving from `NODE_ENV`
- Replace loose equality with strict equality
- Owner: Backend + Security

#### `apps/backend/config/firebase.config.js`
- Stop loading service account from `../firebase-key.json`
- Move credentials to secret-manager/env injection
- Verify credential file is not committed/distributed
- Rotate credential if exposure is possible
- Owner: Security + DevOps

#### `apps/backend/modules/audit/audit.middleware.js`
- Stop capturing raw auth headers/cookies
- Redact passwords, tokens, API keys, DB URLs, secrets
- Stop storing whole request/response bodies by default
- Replace body capture with allowlisted audit metadata
- Owner: Backend + Security

#### `apps/backend/modules/dataQuery/queryEngine/engine.js`
- Remove `eval(...)` from template resolution
- Replace with safe property-path resolver
- Stop logging raw runtime args, query objects, resolved templates
- Rework `JSON.stringify(runtimeArgs)` cache key strategy
- Add cache bounds/TTL if caching is retained
- Owner: Backend Platform

#### `apps/backend/modules/workflow/engine/nodeHandlers/javascript.handler.js`
- Treat native `vm` execution as unsafe for untrusted input
- Move JS execution to isolated worker/process/container
- Owner: Backend Platform + Security

#### `apps/backend/modules/workflow/engine/nodeHandlers/condition.handler.js`
- Add timeout immediately
- Remove/limit exposed globals
- Move to isolated execution if input is user-controlled
- Owner: Backend Platform + Security

#### `apps/backend/modules/workflow/workers/handlers/javascriptHandler.js`
- Review `vm2` usage against current advisories
- Add process/container isolation and resource limits
- Remove ambient secrets/network/filesystem access
- Owner: Backend Platform + Security + DevOps

#### `apps/backend/modules/auth/auth.middleware.js`
- Fail closed if Firebase user lookup fails
- Prevent partially authenticated requests from reaching handlers
- Reduce PII/token-adjacent logging
- Return correct HTTP statuses on auth failures
- Owner: Backend API

#### `apps/backend/modules/apiKey/apiKey.service.js`
- Fix transaction misuse (`tx` vs `prisma`)
- Fix boolean update bug so `false` persists
- Remove undefined `roleID` reference
- Replace plaintext API key storage/lookup with hashed verification
- Add regression tests
- Owner: Backend API

#### `apps/backend/utils/express.utils.js`
- Stop returning `200 OK` on error paths
- Standardize success/error envelopes and status codes
- Remove legacy `express-validator` coupling if Zod is standard
- Owner: Backend Platform

#### `apps/backend/index.js`
- Remove duplicate tenant router mount
- Protect or disable `/monitor` in production
- Remove startup/debug leftovers
- Split bootstrap responsibilities over time
- Owner: Backend Platform

### P1 - Near-term hardening/reliability
- `apps/backend/config/express-app.config.js`: unify preflight/request CORS, narrow origins, remove duplicate JSON parser. Owner: Backend Platform + Security
- `apps/backend/config/tenant-aware-pgpool-manager.config.js`: stop logging DB URLs, rethrow important failures, define cache invalidation. Owner: Backend Platform
- `apps/backend/utils/global.util.js`: stop logging tenant DB URL map. Owner: Backend Platform + Security
- `apps/backend/config/winston.config.js`, `apps/backend/utils/logger.js`: reduce sensitive payload logging, standardize structured logging. Owner: Backend Platform
- `apps/backend/modules/tenant/tenant.controller.js`: stop logging `tenantDBURL`, normalize error statuses. Owner: Backend API
- `apps/backend/modules/tenant/tenant.v1.routes.js`: reduce god-router sprawl and review broad middleware costs. Owner: Backend Platform

### P2 - Quality/scalability/tests
- `apps/backend/__tests__/unit/utils/validation.utils.test.js`: add real tests or remove empty suite. Owner: QA + Backend
- `apps/backend/__tests__/*`: add tests for auth failure modes, API key security, audit redaction, pool invalidation, workflow timeouts. Owner: QA + Backend
- `apps/backend/package.json`: audit suspicious/unused dependencies and trim backend attack surface. Owner: Backend + DevOps

## Formal Audit Table

| ID | Area | File(s) | Severity | Impact | Evidence | Remediation | Owner |
|---|---|---|---|---|---|---|---|
| A-01 | Secret exposure | `apps/backend/environment.js` | Critical | Secrets leak to logs/CI/support output | Full env object is logged; test run printed DB URL and API key | Remove env dumps; redact sensitive config; rotate exposed secrets | Backend + Security |
| A-02 | Credential management | `apps/backend/config/firebase.config.js` | Critical | Service account compromise risk | Firebase initialized from `../firebase-key.json` | Use secret-manager/env injection; remove file-based secret | Security + DevOps |
| A-03 | Audit data leakage | `apps/backend/modules/audit/audit.middleware.js` | Critical | Tokens/PII/passwords may be stored in audit logs | Raw headers, request bodies, response bodies, response headers captured | Redact/drop sensitive fields; allowlist safe metadata only | Backend + Security |
| A-04 | Unsafe dynamic execution | `apps/backend/modules/dataQuery/queryEngine/engine.js` | Critical | Code injection / unsafe expression evaluation | Uses `eval(runtimeArgs...)` in template resolution | Replace with safe path resolver and strict validation | Backend Platform |
| A-05 | Unsafe sandbox model | `apps/backend/modules/workflow/engine/nodeHandlers/javascript.handler.js` | Critical | RCE/tenant escape risk | Uses native `vm` | Move execution to isolated worker/process/container | Backend Platform + Security |
| A-06 | Unsafe condition execution | `apps/backend/modules/workflow/engine/nodeHandlers/condition.handler.js` | Critical | DoS / unsafe execution | Uses native `vm` without timeout | Add timeout and isolate untrusted execution | Backend Platform + Security |
| A-07 | Sandbox dependency risk | `apps/backend/modules/workflow/workers/handlers/javascriptHandler.js` | High | Sandbox escape/containment failure risk | Uses `vm2` for user-authored JS | Add defense in depth and runtime isolation | Backend Platform + Security |
| A-08 | Partial auth fail-open | `apps/backend/modules/auth/auth.middleware.js` | High | Requests may proceed without valid `req.user` | User lookup failure is caught and `next()` still runs | Fail closed with `401/403` | Backend API |
| A-09 | API key storage model | `auth.middleware.js`, `apiKey.service.js`, `schema.prisma` | High | Plaintext API key compromise risk | API key appears stored and looked up directly by raw value | Store hashed secret only; compare securely | Backend API |
| A-10 | Broken transaction | `apps/backend/modules/apiKey/apiKey.service.js` | High | Partial writes / non-atomic create | Transaction started but non-transactional client used | Use `tx` consistently | Backend API |
| A-11 | Boolean update bug | `apps/backend/modules/apiKey/apiKey.service.js` | High | `false` updates silently fail | Truthy spread drops falsy boolean | Use explicit undefined checks | Backend API |
| A-12 | Bad error path | `apps/backend/modules/apiKey/apiKey.service.js` | Medium | Incorrect/failing tenant mismatch handling | Undefined `roleID` referenced | Fix variable and add regression test | Backend API |
| A-13 | Incorrect HTTP semantics | `apps/backend/utils/express.utils.js` and controllers | High | Clients/monitoring receive `200` on failures | `sendResponse` always uses `res.json(...)` | Standardize proper HTTP error statuses | Backend Platform |
| A-14 | Duplicate route registration | `apps/backend/index.js` | High | Duplicate middleware execution and noisy behavior | Tenant router mounted twice | Remove duplicate mount and add test | Backend Platform |
| A-15 | Exposed operational surface | `apps/backend/index.js` | Medium | Monitor UI may disclose internal state | `/monitor` served directly | Restrict with auth/network controls | Backend + DevOps |
| A-16 | CORS inconsistency | `apps/backend/config/express-app.config.js` | Medium | Preflight and request policy may differ | `options('*', cors())` bypasses custom options | Apply same CORS config to preflight and requests | Backend Platform |
| A-17 | Permissive origin handling | `apps/backend/config/express-app.config.js` | Medium | Weakens origin trust model | Allows `undefined` and `"null"` origins | Narrow allowed origins | Backend Platform + Security |
| A-18 | Sensitive connection logging | `tenant-aware-pgpool-manager.config.js`, `global.util.js`, `tenant.controller.js` | High | DB URLs may leak through logs | Raw DB URLs / tenant DB map are logged | Remove/redact connection details | Backend + Security |
| A-19 | Multi-node cache staleness | `apps/backend/config/tenant-aware-pgpool-manager.config.js` | Medium | Inconsistent tenant DB behavior across instances | Tenant DB URL state is node-local and cached in memory | Add invalidation/refresh strategy | Backend Platform |
| A-20 | Logging volume / data overlogging | `engine.js`, `auth.service.js`, controllers, logger config | Medium | Performance loss, log noise, data leakage | Full objects, runtime args, role mappings logged | Log IDs/counts only; debug-gate verbose logs | Backend Platform |
| A-21 | Monolithic router composition | `apps/backend/modules/tenant/tenant.v1.routes.js` | Medium | Harder scaling, ownership, and policy clarity | Central router mounts many features | Break into thinner composition layers | Backend Platform |
| A-22 | Test suite health issue | `apps/backend/__tests__/unit/utils/validation.utils.test.js` | Medium | CI/test command fails despite passing tests | Jest: "Your test suite must contain at least one test." | Add tests or remove empty suite | QA + Backend |
| A-23 | Coverage gaps in risky areas | `apps/backend/__tests__/*` | Medium | Regressions likely in high-risk code | Limited tests for auth failures, audit redaction, workflow isolation | Add targeted regression/security tests | QA + Backend |
| A-24 | Dependency hygiene | `apps/backend/package.json` | Low/Medium | Extra attack surface and maintenance burden | Suspicious/unused packages and mixed deps | Audit and trim dependencies | Backend + DevOps |

## Recommended Order
1. `environment.js`
2. `audit.middleware.js`
3. `firebase.config.js`
4. `auth.middleware.js`
5. `apiKey.service.js`
6. `engine.js`
7. `index.js`
8. `express-app.config.js`
9. `tenant-aware-pgpool-manager.config.js`
10. workflow execution handlers + focused tests

