---
sidebar_position: 4
title: Backend Local Development
description: Run the Express backend, Prisma migrations, and workflow runtime locally.
---

# Backend Local Development

This guide covers the current local setup for `apps/backend`.

The backend includes:

- the Express API,
- Prisma-backed persistence,
- Socket.IO,
- cron startup,
- the active in-memory workflow worker runtime.

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** and **npm**
- access to a PostgreSQL database for `DATABASE_URL`
- Firebase service-account credentials for backend token verification

## 1. Install dependencies

From the repository root:

```bash
git clone <repository_url>
cd jet-admin
npm install
```

## 2. Create the backend environment file

Create `apps/backend/.env`.

These are the main variables referenced by `apps/backend/environment.js`:

```dotenv
# Runtime
NODE_ENV=development
PORT=8090
NODE_ID="dev_node_1"

# Module enablement
ENABLED_MODULES=AUTH,TENANT,DATABASE,DATASOURCE,DATAQUERY,DASHBOARD,WIDGET,USERMANAGEMENT,ROLE,APIKEY,CRONJOB,NOTIFICATION,PERMISSION,WORKFLOW,AI

# Persistence
DATABASE_URL="postgresql://user:pass@localhost:5432/db?schema=public"

# Request handling
EXPRESS_REQUEST_SIZE_LIMIT="5mb"
CORS_WHITELIST="http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:3001,http://localhost:3001"

# Integrations
GEMINI_API_KEY=""

# Logging / syslog
SYSLOG_HOST=127.0.0.1
SYSLOG_PORT=514
SYSLOG_PROTOCOL=udp4
SYSLOG_LEVEL="warning"
LOG_LEVEL="info"
LOG_RETENTION=7
LOG_FILE_SIZE=1
```

:::tip
`ENABLED_MODULES` is optional. If you omit it, the backend falls back to a minimal default module list. For realistic local development, it is usually better to set the modules you actually want to exercise.
:::

## 3. Add Firebase service-account credentials

The backend verifies Firebase ID tokens, so you need a service-account key file.

Place `firebase-key.json` at the repository root:

```json
{
  "type": "service_account",
  "project_id": "...",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "...",
  "universe_domain": "..."
}
```

:::warning
Never commit real Firebase credentials to source control.
:::

## 4. Run Prisma migrations

From `apps/backend`:

```bash
cd apps/backend
npx prisma migrate dev
```

Optional Prisma helpers already exist in `apps/backend/package.json`, for example:

```bash
npm run prisma-studio-dev-w
```

## 5. Start the backend

From the repository root:

```bash
npm run start:b
```

This runs `apps/backend` in watch mode using `nodemon`.

The backend defaults to `http://localhost:8090`.

Useful routes after startup:

- `GET /health`
- `GET /monitor`
- `/api/v1/auth`
- `/api/v1/tenants`

## What starts with the backend

When the backend boots successfully it will attempt to:

- initialize Express + HTTP server,
- attach Socket.IO,
- schedule cron jobs,
- initialize the monitor socket,
- start workflow workers using the in-memory queue adapter.

## Local development tips

### Start the full stack

If you want the frontend and backend together:

```bash
npm run start:all
```

If you also need package watch mode:

```bash
npm run dev:all
```

### Seed data

If the project requires local seed data:

```bash
npm run seed
```

## Troubleshooting

If startup fails, check these first:

- `DATABASE_URL` points to a reachable PostgreSQL instance
- `apps/backend/.env` exists and is being read
- `firebase-key.json` is present and valid
- `ENABLED_MODULES` does not reference modules you intentionally removed
- the frontend origin is included in `CORS_WHITELIST`

### Common gotchas

- Workflow docs in older materials may refer to RabbitMQ, but the active local runtime uses the in-memory queue adapter.
- Some features depend on external services or tenant datasource configuration and will not be fully usable with only the base database configured.

## Additional Resources

- [Prisma documentation](https://www.prisma.io/docs/)
- [Backend architecture](../architecture/backend-architecture)
- [Workflow architecture](../concepts/workflow-architecture)