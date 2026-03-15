---
sidebar_position: 2
title: Local Backend Setup
description: Run the Node.js Express backend and Prisma locally for development.
---

# Local Backend Setup

To develop features like new API routes, Workflow Engine logic, or Datasource drivers, you must run the `apps/backend` project locally.

## Prerequisites

- **Node.js 18+** installed.
- **PostgreSQL Database:** You must have a local instance or a cloud database URL available.
- **Firebase Admin SDK Key:** Required for decrypting and validating JWT tokens sent by the frontend.

## 1. Installation

From the Jet Admin Mono-Repository root:
```bash
npm install
```

## 2. Environment Variables

Navigate to `apps/backend/` and create an `.env` file based on `.env.sample`.

```dotenv
NODE_ENV=development
PORT=8090

# Crucial: Your local PostgreSQL database connection string
DATABASE_URL="postgresql://user:pass@localhost:5432/jetadmin?schema=public"

# Frontend Origin Whitelist
CORS_WHITELIST="http://localhost:5173"

# Features to Enable Local Testing
ENABLED_MODULES=AUTH,TENANT,DATABASE,DATASOURCE,DATAQUERY,DASHBOARD,WIDGET,WORKFLOW,AI
GEMINI_API_KEY="optional-for-ai-features"
```

## 3. Firebase Service Account

Jet Admin uses Firebase for Authentication. To allow your local backend to securely verify incoming requests, you must provide a Firebase Admin SDK private key.

1. Go to your Firebase Console > Project Settings > Service Accounts.
2. Click **Generate New Private Key**.
3. Save the downloaded JSON file to the root of the monolithic repository as `firebase-key.json`.

*Note: This file is ignored by `.gitignore`. Never commit it.*

## 4. Prisma Migrations

Jet Admin uses Prisma as its ORM to manage platform metadata (users, dashboards, workflows). You must migrate your database schema before starting the server.

```bash
cd apps/backend
npx prisma migrate dev --name init
```
*This command will read your `DATABASE_URL` and create the required `tblTenants`, `tblUsers`, etc.*

## 5. Starting the Backend

From the repository root workspace, start the backend in watch mode using Nodemon:
```bash
npm run start:b
```

You should see logs indicating:
- The Express API is listening on `http://localhost:8090`.
- Socket.IO has attached successfully.
- The In-Memory Workflow Queue (`fastq`) has initialized.

## Optional: Full Stack Execution

To run the backend, the React frontend, and the shared package watchers all simultaneously:
```bash
npm run dev:all
```