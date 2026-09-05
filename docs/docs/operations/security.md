---
title: Security
description: Auth realms, Casbin RBAC, secrets handling, network rules, and known gaps.
sidebar_position: 17
---

# Security

Implementation: `modules/auth/auth.middleware.js`, `modules/operatorAuth/*`, `config/{casbin_model.conf,casbin.config.js,permissions.json,express-app.config.js}`, `utils/{crypto.util.js,encryption.util.js,sensitive.js}`, `modules/vault/vault.service.js`.

## Identity realms (disjoint)

| Realm | Credential | Verification | Session |
|---|---|---|---|
| End user | `Authorization: Bearer <Firebase ID token>` | `firebase-admin` `verifyIdToken` (`FIREBASE_CREDENTIALS` JSON) → `tblUsers` via `firebaseID` | Per-request; Socket.IO via `handshake.auth.token`. `NODE_ENV=test` enables a test bypass — never in prod |
| API key | `Authorization: api_key <raw>` (`AUTH_PREFIXES`) | 8-char prefix lookup (`apiKeyPrefix`, `isDisabled:false`) → SHA-256 `timingSafeEqual` on stored hash | `req.authContext={authType:API_KEY, apiKey:{apiKeyID,tenantID}}`; `req.user`=creator. Only prefix+hash stored; raw shown once at creation |
| Operator | email + password → opaque bearer | PBKDF2-SHA512 600 k × 64 B (`crypto.util.js`; legacy 1 k fallback) vs `tblOperators.passwordHash/Salt` | SHA-256 `tokenHash` in `tblOperatorSessions` (12 h expiry, `revokedAt`, UA/IP). Enrolled only via `scripts/create-operator.js`; `resetPassword` revokes all sessions |

Google OAuth (`modules/oauth/`): state JWT (`OAUTH_STATE_SECRET`, 10 min) over `GOOGLE_CLIENT_ID/SECRET`; tokens stored via `vaultService.storeCredential({provider:'google'})`; callback `postMessage OAUTH_SUCCESS|FAILURE` uses `('*')` target — restrict to the app origin when embedding cross-origin.

## Authorization (Casbin + Prisma)

Model (`casbin_model.conf`): `r=sub,dom,obj,act; p=sub,dom,obj,act,eft; g=_,_,_; e=some(allow)&&!some(deny); m=g(r.sub,p.sub,r.dom)&&r.dom==p.dom&&keyMatch(r.obj,p.obj)&&(r.act==p.act||p.act==*)`. Policies in `casbin_rule` (`ptype,v0-v5`).

- Subject = `userID` or `apiKeyID`; domain = `:tenantID`; object = `<type>:<id>` or `*` (`keyMatch` allows prefix wildcards).
- Middleware `authorize(P.resource.action)` resolves objects from params/body (`paramKey/bodyKey/reqKey/skipIfMissing`); cross-resource rules are declarative (e.g. `workflow.create` requires `dataquery.execute+workflow.execute` on bound IDs; `cronJob.create` requires `workflow.execute`).
- Catalogue: `config/permissions.json` → `permissions.js` (16 resources: `ai,apikey,appPage,audit,bundle,cronjob,dataquery,datasource,folder,listener,permission,role,tenant,user,widget,widgetLibrary,workflow`).
- Creator gets `*` on the new object (`grantCreatorAccess`); deletes call `removePoliciesForResource`; role deletes call `removePoliciesForRole`; `POST /:tenantID/roles/sync-policies` repairs drift.
- Delegated execution: workflows/listeners/cron forward caller identity + origin (`CALLER_TYPES user/apiKey/system`, `ORIGIN_TYPES workflow/appPage/listener/cron/direct` in `executionContext.js`); `authorizedProxy.js` performs downstream calls as that identity.

Membership: `checkTenantMembership` (`tblUsersTenantsRelationship`) gates all tenant routes; legacy `role ADMIN|MEMBER` column coexists with `tblRoles` custom roles.

## Secrets at rest and in transit

- Vault (`tblVaultCredentials.encryptedData` JSON): AES-256-GCM (`VAULT_ENCRYPTION_KEY`, 32-byte hex). Datasource `connectionString`/`webhookSecret`, OAuth tokens, AI configs. **No rotation automation** — rotating the key requires re-encrypting all rows; plan downtime.
- API responses mask secrets (`●●●●●●●●`); logs `redact()` exact-match keys (`SENSITIVE_KEYS/PATTERNS` in `sensitive.js`). `GET /health` is intentionally unauthenticated (compose probes).
- TLS terminates at nginx/Render/hosting (`http-server.config.js` is plain HTTP). Legacy `nginx.conf` shows the cert paths + `limit_req` zones; active compose nginx has no rate limiting — enforce at edge.

## Network and input

- CORS strict whitelist (`CORS_WHITELIST` + chrome-extension, `credentials:true`, `trust proxy`) — except `/webhooks` (`origin:true`, open by design) and Socket.IO origins from the same list.
- Body limits: `EXPRESS_REQUEST_SIZE_LIMIT` (default `5mb`) for JSON/urlencoded (+`rawBody` retained); 10 MB `multer.memoryStorage` on tenant logo, datasource upload, widget upload. Every route validates `body|params|query` via Zod (`validation.utils.js`).
- File storage: Supabase S3-compatible (`SUPABASE_S3_*`, `forcePathStyle:true`) with SDK→axios fallback; bucket names in `constants.STORAGE.BUCKETS` (`tenant-assets`, `jet-admin-datasource-file-uploads`).

## Known gaps (do not present as mitigated)

1. **No `helmet`, no `express-rate-limit`** — explicitly flagged in `BACKEND_CODE_GUIDELINE.md`; neither is in `package.json`. Add before internet exposure.
2. OAuth `postMessage(..., '*')` — narrow to explicit origin.
3. `pg_isready`-exposed Postgres `:5432` in compose — close in production.
4. `JWT_*` / `SESSION_SECRET` / `RABBITMQ_*` envs are **unread no-ops** — sessions are Firebase/opaque-operator, not JWT; do not claim JWT rotation procedures.
