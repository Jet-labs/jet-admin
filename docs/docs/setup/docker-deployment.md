---
id: docker-deployment
title: Self-Hosting & Deployment
sidebar_label: Docker Deployment
sidebar_position: 1
description: Guide to self-hosting Jet Admin via Docker Compose.
---

# Self-Hosting & Deployment

Jet Admin is open-source and designed to be easily self-hosted on your own infrastructure. This ensures your data never leaves your VPC.

## Prerequisites

To run Jet Admin via Docker, you need:
- A host machine (Linux/macOS/Windows WSL2) with **Docker** and **Docker Compose** installed.
- Minimum 2GB RAM.
- A running PostgreSQL instance (or you can run it within the same Docker network).

## Installation via Docker Compose

The easiest way to get started is using the provided `docker-compose.yml` file.

### Step 1: Clone the Repository
```bash
git clone https://github.com/Jet-labs/jet-admin.git
cd jet-admin
```

### Step 2: Configure Environment Variables
Jet Admin requires certain environment variables to be set for the backend to communicate with the database and sign JWTs.

Create a `.env` file in the root directory (you can copy `.env.docker` if available):

```env
# Required
DATABASE_URL="postgresql://user:password@db:5432/jetadmin"
JWT_SECRET="generate-a-secure-random-string-here"
ENCRYPTION_KEY="32-byte-base64-string-for-datasource-credentials"

# Optional
PORT=3000
NODE_ENV=production
```

### Step 3: Start the Platform
Run Docker Compose in detached mode:

```bash
docker-compose up -d
```

This command will:
1. Build the `frontend` container (Vite/React build served via Nginx).
2. Build the `backend` container (Node.js Express API).
3. Automatically run Prisma schema migrations against the configured `DATABASE_URL` during the backend boot sequence.

### Step 4: Access the UI
Once the containers are healthy, open your browser and navigate to:
`http://localhost` (or whatever port Nginx is bound to).

You will be greeted by the initial setup screen to create the primary Tenant Admin account.

## Configuration Reference

Key environment variables to tune your deployment:

- `DATABASE_URL`: Connection string to the operational PostgreSQL DB.
- `JWT_SECRET`: Secret used to sign user session tokens.
- `ENCRYPTION_KEY`: A 32-byte (256-bit) base64-encoded string used by `crypto.util.js` to encrypt external datasource passwords. **Do not lose this key, or you will lose access to your datasources.**
- `LOG_LEVEL`: Set to `debug`, `info` (default), `warn`, or `error`.
- `WORKER_CONCURRENCY`: (Optional) Tunes how many workflow jobs the pg-boss executor claims at once.

## Upgrading

When a new version of Jet Admin is released, follow these steps to upgrade safely:

1. **Backup your Database:** Always take a `pg_dump` of your operational PostgreSQL database before upgrading.
2. **Pull Changes:** `git pull origin main` (or checkout the specific release tag).
3. **Rebuild Images:** `docker-compose build --no-cache`
4. **Restart Containers:** `docker-compose up -d`

The `docker-entrypoint.backend.sh` script automatically runs `npx prisma migrate deploy` on boot, ensuring your database schema is updated to match the new codebase before the Node.js server accepts requests.

## Reverse Proxy Setup

If you are exposing Jet Admin to the internet, it is strongly recommended to place it behind a reverse proxy (like Nginx or Caddy) to handle SSL/TLS termination.

**Note on WebSockets:** Ensure your reverse proxy is configured to support WebSocket upgrades (HTTP `Upgrade` and `Connection` headers), as Socket.IO requires this for real-time features.
