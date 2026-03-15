---
sidebar_position: 3
title: Local Frontend Setup
description: Run the React 18 SPA locally for UI development.
---

# Local Frontend Setup

If you are building new Frontend UI Pages, Dashboard widgets, or testing component interaction, you will need to run the `apps/frontend` Vite server locally.

## Prerequisites

- **Node.js 18+** installed.
- **Backend Running:** The frontend requires the backend API to function. Follow the [Backend Setup](./setup-backend) guide first.
- **Firebase Project:** You must have a client-side configuration block for Firebase Authentication.

## 1. Installation

From the Mono-Repository root:
```bash
npm install
```

## 2. Environment Variables

Navigate to `apps/frontend/` and create an `.env` file based on `.env.sample`.

```env
# Point these towards your local backend
VITE_SERVER_HOST=http://localhost:8090
VITE_SOCKET_HOST=http://localhost:8090

# Firebase Client Configuration (From Firebase Console)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-app-id"
VITE_FIREBASE_STORAGE_BUCKET="your-app.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="12345"
VITE_FIREBASE_APP_ID="1:123:web:abc"
```

### Note on Configuration Resolution
Jet Admin's frontend resolves its Backend/Socket hosts dynamically.
1. It first checks `window.JET_ADMIN_CONFIG.SERVER_HOST` (used for production Docker deployments).
2. If omitted, it falls back to the `VITE_SERVER_HOST` defined locally during Vite's `npm run dev`.

## 3. Starting the Development Server

From the repository root workspace, start the frontend Vite watcher:
```bash
npm run start:f
```

Vite will spin up the application quickly and heavily utilize Hot Module Replacement (HMR).

Navigate to `http://localhost:5173` in your browser.

## 4. Developing Shared Packages

If you modify files inside the `packages/` directory (for example, building a new Chart Widget inside `@jet-admin/widgets-ui`), the frontend will not immediately see these changes unless the package is rebuilt.

To solve this, open a new terminal at the repository root and run:
```bash
npm run dev:all-packages
```
This triggers a background Typescript watcher on all `packages/`, meaning any change saved will instantly propagate and trigger a Vite HMR reload on the frontend.