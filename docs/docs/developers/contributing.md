---
title: Contributing
description: Development setup, repository conventions, test/lint/build commands, database migrations, and pull-request checklist.
sidebar_position: 21
---

# Contributing

Jet Admin is an npm-workspaces monorepo: `apps/*` are runnable applications, `packages/*` are shared libraries. Node **20.x** is required (root `engines`). This page describes the workflow the code actually supports.

Before changing code, read:

- `apps/backend/BACKEND_CODE_GUIDELINE.md` — mandatory backend conventions.
- `UI_GUIDELINES_V3.md` — frontend/UI conventions.
- [Platform Architecture](../platform/architecture.md) — module and entity layout.
- [Configuration Reference](../operations/configuration-reference.md) — environment variables and defaults.

## Repository map

```text
jet-admin/
├── apps/
│   ├── backend/            Express + Prisma API, Socket.IO, workflow/listener engines
│   ├── frontend/           React 18 + Vite SPA (primary UI)
│   ├── admin/              Legacy Vite app
│   ├── listener-proxy/     Webhook ingress + subscription sharding
│   ├── mcp-server/         Streamable HTTP MCP wrapper
│   └── ...
├── packages/
│   ├── ui/                 Shared React primitives
│   ├── widget-types/       Descriptors, schemas, normalization, validation
│   ├── widgets-ui/         Widget renderers, config editors, config kit
│   ├── widgets-logic/      Widget data builders
│   ├── datasources-logic/  Connector implementations
│   ├── datasource-types/   Connector schemas/metadata
│   ├── workflow-nodes/     Workflow node UI + schemas
│   ├── workflow-nodes-logic/ Execution handlers + sandbox
│   ├── expression-engine/  safe-path/js-template/condition-js parsing
│   ├── mcp-server/         MCP tools, resources, prompts
│   └── ...
├── docs/                   Docusaurus site
├── scripts/                Launcher, package build, storage init, seed helpers
├── docker-compose-sample.yml
└── Dockerfile.*
```

## First-time setup

```bash
git clone https://github.com/Jet-labs/jet-admin.git
cd jet-admin
npm install
npm run build:packages
```

`npm install` at the root installs and links every workspace. Do not add nested `package-lock.json` files under `packages/*`; the root lockfile is the workspace lockfile.

### Start the stack

```bash
# Docker mode: infrastructure + frontend + backend in containers
node scripts/start.js --preset core

# Hybrid mode: infrastructure in Docker, apps locally with hot reload
node scripts/start.js --preset core --mode dev

# Everything (all apps + storage + tools profiles)
node scripts/start.js --preset full

# List every app, preset, and combination
node scripts/start.js --list

# Stop containers and tracked local processes
node scripts/start.js --stop
```

Windows and POSIX wrappers are `start.ps1` and `start.sh`. The launcher checks Docker, starts it if needed, builds only the selected services, waits for health, and tracks local PIDs.

Manual alternative:

```bash
npm run temporal:up           # Temporal dev stack only (no app DB/Redis)
cd apps/backend && npm run dev     # POSIX backend (nodemon)
cd apps/backend && npm run dev-w   # Windows backend
cd apps/frontend && npm run dev    # frontend Vite dev server
```

The root `start:b` script uses the Windows `dev-w` variant; the cross-platform path is the launcher in `--mode dev`.

`npm run dev:all` starts Temporal plus the frontend, backend, and the main package watchers — but it does **not** start PostgreSQL or Redis. Start those first (Compose `postgres`/`redis`, or the launcher). It is also Windows-oriented because `start:b` calls the `dev-w` script; on Linux/macOS use the launcher or the per-app `dev` scripts.

### Environment files

There is no root `.env.example`. For local backend runs, create `apps/backend/.env` using the [Configuration Reference](../operations/configuration-reference.md). At minimum:

```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/jet_admin_db
REDIS_URL=redis://localhost:6379
VAULT_ENCRYPTION_KEY=<64 hex chars>
FIREBASE_CREDENTIALS=<service-account JSON>
```

Frontend local development uses `apps/frontend/.env` with `VITE_FIREBASE_*`; `VITE_SERVER_HOST`/`VITE_SOCKET_HOST` default to `http://localhost:8090` in dev. Never commit `.env` files or real credentials.

## Backend workflow

### Module pattern

Every feature lives in `apps/backend/modules/<name>/`:

| File | Responsibility |
|---|---|
| `<name>.v1.routes.js` | Express wiring and middleware order |
| `<name>.validator.js` | Zod schemas for body/params/query |
| `<name>.controller.js` | Thin handler: extract, call one service method, respond |
| `<name>.service.js` | Business logic and Prisma queries |
| `<name>.middleware.js` | Request enrichment/guards, only if needed |
| `<name>.socket.controller.js` | Socket handlers, only if realtime |

### Non-negotiables

1. **Environment:** read `process.env` only in `environment.js`; import `environmentVariables` elsewhere. Existing direct-read exceptions are documented in the configuration reference — do not add new ones without a reason.
2. **Validation before authorization:** `authProvider` → Zod `validate(...)`/`validateAll(...)` → `authorize(...)` → controller.
3. **Tenant scoping:** every tenant-scoped Prisma query includes `tenantID` in `where`. This is the isolation boundary; there is no RLS.
4. **Casbin:** add route-level `authorize(P.<resource>.<action>)`, including cross-resource checks. Add new permissions to `config/permissions.json`, not as string literals.
5. **Responses:** use `expressUtils.sendResponse(res, success, data, error, statusCode)` with an explicit status from `constants.HTTP_STATUS`. The helper spreads `data` at the top level.
6. **Logging:** use `Logger.log(level, { message, params })` with `module:function:stage` names. Never log credentials; `redact()` is a backstop, not permission to pass secrets.
7. **No dead code:** remove unused imports, commented blocks, and stub files.
8. **Creator access:** after creating a protected resource, call `grantCreatorAccess`; after deleting one, call `removePoliciesForResource`.

### Adding an endpoint

1. Add/extend the Zod schema in `<module>.validator.js`.
2. Add the route with validation, authorization, and the controller.
3. Keep the controller thin; put Prisma/business logic in the service.
4. Scope queries by `tenantID`; use `assertTenantReferences()` for JSON-stored cross-resource IDs.
5. Call `grantCreatorAccess`/policy cleanup as appropriate.
6. Add tests under `apps/backend/__tests__/unit/` (and integration if it touches the DB).
7. Update [API Reference](./api-reference.md) and, if it changes configuration, the configuration reference.
8. If it is a new module, add it to `constants.MODULES`, `moduleDependencies`, the tenant router mount, and `ENABLED_MODULES` documentation.

### Database changes

Prisma schema: `apps/backend/prisma/schema.prisma`. Runtime bootstrap uses:

```bash
cd apps/backend
npx prisma db push
node scripts/run-manual-migrations.js
```

There are **no standard Prisma migration directories**; `prisma migrate deploy` fails with P3015. Manual SQL lives in `prisma/migrations/manual/`, runs in filename order, and is tracked in `_manual_migrations`.

For a schema change:

1. Update `schema.prisma`.
2. Add a numbered/dated `*.sql` file to `prisma/migrations/manual/`.
3. Test on a fresh database and on a copy of an existing one.
4. Run `node scripts/run-manual-migrations.js --status` to verify pending/applied state.
5. Do not edit an already-applied manual migration; add a new one.
6. Document any destructive change and the backup/restore plan.

## Frontend workflow

- App code lives in `apps/frontend/src`; Vite serves `:5173` in dev.
- Shared primitives live in `packages/ui`; widget code in `packages/widgets-ui`.
- Use the existing Tailwind tokens/components and the `cn()` helper rather than ad-hoc styles.
- UI copy, empty states, and error states are part of the change; test them.
- `apps/frontend` has `npm run lint` and a pure-logic Jest suite (`npm test`). It has no jsdom component suite; browser behavior needs manual verification or the existing browser harnesses.

### Shared package changes

Packages are built to `dist/` with esbuild. `dist/` is gitignored and excluded from Docker build contexts; images rebuild packages themselves with `npm run build:packages`.

```bash
npm run build:packages        # all packages with a build script

# Watch one package while developing
npm run dev:widget-types
npm run dev:widgets-ui
npm run dev:expression-engine
```

Package tests consume `dist/`, so build before testing:

```bash
npm run build:packages
cd packages/widget-types && npm test
cd packages/widgets-ui && npm test
```

## Testing

| Scope | Command | Notes |
|---|---|---|
| Backend (all) | `cd apps/backend && npm test` | Jest; requires test config/setup, may need DB for integration |
| Backend unit | `cd apps/backend && npm run test:unit` | Pattern `unit` |
| Backend integration | `cd apps/backend && npm run test:integration` | May require `DATABASE_URL`; some suites are opt-in |
| Backend coverage | `cd apps/backend && npm run test:coverage` | Writes `coverage/` |
| Frontend logic | `cd apps/frontend && npm test` | Jest + esbuild-jest, Node environment |
| Widget types | `cd packages/widget-types && npm test` | Consumes `dist/`; build first |
| Widgets UI | `cd packages/widgets-ui && npm test` | Consumes `dist/`; build first |
| Datasource logic/UI/types | `cd packages/<pkg> && npm test` | Each has its own Jest config/script |
| Expression engine | `cd packages/expression-engine && npm test` | Parser/evaluator/template suites |
| Workflow node logic | `cd packages/workflow-nodes-logic && npm test` | Execution/sandbox tests |
| MCP package | `cd packages/mcp-server && npm test` | `node --test tests/*.test.mjs` |
| Launcher | `node --test scripts/start.test.js` | Node test runner |

:::warning Root `npm test` is a placeholder
The root `package.json` `test` script intentionally exits with an error. Run tests in the workspace you changed. There is no repository-wide test runner.
:::

For integration tests that need a database, use a disposable PostgreSQL database and set `DATABASE_URL` for that process. Do not point tests at production. Some application DB tests are gated behind `APPLICATION_DATABASE_TESTS=1`; read the suite before assuming it ran.

## Lint and build

| Target | Command |
|---|---|
| Frontend lint | `cd apps/frontend && npm run lint` |
| Package lint | `cd packages/<pkg> && npm run lint` for packages that define it |
| Package build | `npm run build:packages` |
| Frontend production build | `cd apps/frontend && npm run build` |
| Docs dev/build | `cd docs && npm ci && npm start` / `npm run build` |

Packages with a `lint` script currently include `datasource-types`, `datasources-logic`, `datasources-ui`, `widget-types`, `widgets-logic`, `widgets-ui`, and `workflow-nodes-logic`. **The backend has no ESLint config or `lint` script** — do not claim `npm run lint` there. Follow `BACKEND_CODE_GUIDELINE.md` and rely on review/tests.

A clean build is part of review:

```bash
npm run build:packages
cd apps/frontend && npm run build
cd ../../docs && npm run build
```

## Documentation changes

The docs site is a Docusaurus app in `docs/`. It is deployed by GitHub Actions on pushes to `main` and `dev`; no application CI runs tests.

```bash
cd docs
npm ci
npm start          # local preview
npm run build      # production build; catches broken links/MDX
```

Guidelines:

- Use relative `.md` cross-links between docs pages.
- Prefer tables and Mermaid for topology/flow; the site has `@docusaurus/theme-mermaid`.
- Use admonitions for warnings and operational hazards.
- Do not include real secrets, tokens, connection strings, or customer data.
- Screenshots must use existing files under `docs/static/img/` (or add one deliberately); do not reference imaginary paths.
- If you add a page, add it to `docs/sidebars.js`; do not rely on auto-generation.
- The docs build is strict about broken links (warns by default, but fix them anyway).

## Pull-request checklist

- [ ] The change is scoped and matches the module/package conventions.
- [ ] No `process.env` reads outside `environment.js` (or a documented exception).
- [ ] Tenant-scoped queries filter by `tenantID`.
- [ ] Routes validate input before authorization and call `authorize(...)`.
- [ ] New permissions are in `permissions.json`; role sync considered.
- [ ] Secrets are never logged, returned, or committed.
- [ ] Relevant unit/integration tests pass; package tests were run after `build:packages`.
- [ ] Frontend lint/build pass for UI changes.
- [ ] Docs build passes for docs changes.
- [ ] New env vars are in `environment.js`, `.env.docker`, Compose where appropriate, and the configuration reference.
- [ ] New manual migrations are forward-only and documented.
- [ ] New widgets/types update descriptors, schemas, registry, tests, and MCP catalogs.
- [ ] `dist/`, `.env`, `backups/`, and generated build output are not committed.

## Common failures

| Symptom | Fix |
|---|---|
| `Cannot find module '@jet-admin/...'` | Run `npm install` at the repo root, then `npm run build:packages` |
| Widget changes not visible | Rebuild packages and restart/redeploy frontend/backend; `dist` is not hot-reloaded across containers |
| Backend boots but routes 404 | Check `ENABLED_MODULES`; auth/tenant are the default, most modules are disabled unless listed |
| Database tables missing | Run `npx prisma db push` and `node scripts/run-manual-migrations.js`; do not use `migrate deploy` |
| Frontend blank screen | Missing `VITE_FIREBASE_*`; `initializeApp` throws and the app does not render |
| `REDIS_URL is required` | Start Redis and set `REDIS_URL`; listener pipeline and cron locks need it |
| Temporal workflows stay `RUNNING` | Start Temporal, verify `TEMPORAL_ADDRESS/TASK_QUEUE`, and check worker logs |
| Docs page not in navigation | Add it to `docs/sidebars.js`; only listed IDs appear |
| Port already in use | Change host mappings (`8090`, `80`, `5432`, `6379`, `8088`, `8095`) or stop the conflicting service |

## Related pages

- [API Reference](./api-reference.md) — request/response conventions.
- [MCP Server](./mcp-server.md) — adding or testing MCP tools.
- [Extending Widgets](./extending-widgets.md) — descriptor/renderer/registration contract.
- [Deployment](../operations/deployment.md) — upgrade and rollback procedure.
