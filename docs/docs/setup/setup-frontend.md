---
sidebar_position: 5
title: Frontend Local Development
description: Run the React/Vite frontend with Firebase, Supabase, and backend connectivity.
---

# Frontend Local Development

This guide covers the current setup for `apps/frontend`.

## Prerequisites

Before you start, make sure you have:

- **Node.js 18+** and **npm**
- a running backend or reachable backend host
- Firebase project values for client authentication
- Supabase values if you are using the asset/storage integrations

## 1. Install dependencies

From the repository root:

```bash
git clone <repository_url>
cd jet-admin
npm install
```

## 2. Create the frontend environment file

Create `apps/frontend/.env`.

The frontend code currently expects the following variables:

```env
# Backend hosts
VITE_SERVER_HOST=http://localhost:8090
VITE_SOCKET_HOST=http://localhost:8090

# Firebase client SDK
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

:::caution
The current code uses `VITE_SUPABASE_ANON_KEY`, not `VITE_SUPABASE_KEY`.
:::

## 3. Understand runtime host resolution

The frontend can read API/socket hosts from either environment variables or `window.JET_ADMIN_CONFIG`.

Resolution order is:

1. `window.JET_ADMIN_CONFIG.SERVER_HOST` / `SOCKET_HOST`
2. `VITE_SERVER_HOST` / `VITE_SOCKET_HOST`
3. default `http://localhost:8090`

This is why the project can also be deployed with a generated `public/config.js` or container entrypoint override.

## 4. Start the frontend

From the repository root:

```bash
npm run start:f
```

Vite will start the app on `http://localhost:5173` by default.

## What the frontend initializes

At runtime, the frontend composes several providers before rendering feature routes:

- `QueryClientProvider`
- `AuthContextProvider`
- `GlobalUIProvider`
- `TenantContextProvider`
- `SocketContextProvider`
- `RootRouter`

This means the app expects auth, tenant, and socket context to be available across most protected screens.

## Authentication behavior in development

The frontend uses Firebase client authentication for:

- Google sign-in,
- email/password sign-in,
- email/password sign-up,
- password reset.

Once a user is authenticated, API modules typically call `currentUser.getIdToken()` and send the token to the backend as a bearer token.

## Socket behavior in development

The socket client connects to `VITE_SOCKET_HOST` (or `window.JET_ADMIN_CONFIG.SOCKET_HOST`) and authenticates with the current Firebase token.

This is required for live workflow execution updates and other realtime features.

## Building for Production

From `apps/frontend`:

```bash
npm run build
```

To preview the build locally:

```bash
npm run preview
```

## Working with shared packages

If your frontend changes depend on workspace packages, run the package watch process from the root:

```bash
npm run dev:all-packages
```

Or run the full combined development flow:

```bash
npm run dev:all
```

## Troubleshooting

Common setup issues:

- wrong backend URL in `VITE_SERVER_HOST`
- missing Firebase client values
- using `VITE_SUPABASE_KEY` instead of `VITE_SUPABASE_ANON_KEY`
- CORS mismatch because the backend does not allow `http://localhost:5173`
- socket auth failures when Firebase config and backend Firebase credentials do not belong to the same project

## Related docs

- [Frontend architecture](../architecture/frontend-architecture)
- [Data flow](../concepts/data-flow)
- [Backend local development](./setup-backend)