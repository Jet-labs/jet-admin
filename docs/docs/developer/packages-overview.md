---
sidebar_position: 1
title: Monorepo & Packages
description: Understanding the Yarn Workspace architecture powering Jet Admin.
---

# Monorepo & Packages

Jet Admin is structured as a **workspace monorepo** (using Yarn Workspaces). This architecture allows the frontend and backend applications to share types, schemas, and UI components without duplicating code or publishing to an external npm registry.

## Architecture

The repository is divided into two main domains:

```text
jet-admin/
├── apps/
│   ├── backend/             # Node.js Express API
│   └── frontend/            # React 18 SPA (Vite)
└── packages/
    ├── datasource-types/    # Shared schemas for DB connections
    ├── datasources-logic/   # Backend drivers (Postgres, Stripe, etc.)
    ├── datasources-ui/      # Frontend connection forms
    ├── ui/                  # Shared React components
    ├── widget-types/        # Shared widget metadata
    ├── widgets-logic/       # Backend chart data transformers
    ├── widgets-ui/          # Frontend widget configuration forms
    ├── workflow-edges/      # Custom React Flow edges
    └── workflow-nodes/      # Frontend Workflow Nodes
```

## Why Packages?

By moving feature logic into the `packages/` folder, the codebase remains decoupled:
1. **The Backend** imports `@jet-admin/datasources-logic` to execute queries, without needing to know how the connection form looks.
2. **The Frontend** imports `@jet-admin/datasources-ui` to render the configuration form, without needing to bundle the actual `pg` (PostgreSQL) runtime driver.
3. Both share `@jet-admin/datasource-types` to ensure the shape of the data remains strictly typed across the wire.

## Working with Packages

### Consuming Packages
Packages are symlinked locally via Yarn workspaces. You import them using the `@jet-admin/*` scope.

```javascript
// In apps/frontend/src/...
import { WidgetConfigForm } from '@jet-admin/widgets-ui';
```

### Developing Packages
If you make a change to a package (e.g., adding a new React component to `@jet-admin/ui`), you must ensure the consuming application (Frontend) is aware of it.

Run the workspace watch script from the **repository root**:
```bash
npm run dev:all-packages
```
This triggers `vite build --watch` or `tsc --watch` inside the relevant packages, seamlessly updating the frontend dev server.

## Creating a New Package

If you are building a new, highly decoupled feature system:
1. Copy `packages/template-package` as a starting point.
2. Update `package.json` with the new name (e.g., `@jet-admin/comments-ui`).
3. Implement your functionality in `src/index.js`.
4. Ensure the package is included by the root `package.json` workspace glob.