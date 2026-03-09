---
sidebar_position: 1
title: Packages Overview
description: Understanding the current Jet Admin workspace packages and how the apps consume them.
---

# Packages Overview

Jet Admin is built as a **workspace monorepo**. The shared packages under `packages/` are a major part of the architecture, not just a convenience layer.

They allow the frontend and backend to share feature-specific capabilities without copying code between apps.

## Package Architecture

```
packages/
├── datasource-types/      # Datasource metadata and form/query schemas
├── datasources-logic/     # Datasource execution logic and connector implementations
├── datasources-ui/        # Datasource editor UI components
├── json-forms-renderers/  # Shared JSON Forms renderers
├── template-package/      # General utilities/template helpers
├── ui/                    # Shared UI building blocks
├── widget-types/          # Widget metadata and type definitions
├── widgets-logic/         # Widget processing/transformation logic
├── widgets-ui/            # Widget configuration UI
├── workflow-edges/        # React Flow edge components
└── workflow-nodes/        # Workflow node definitions and editors
```

## Why the packages exist

The package layer helps Jet Admin keep feature systems modular:

- **datasources** are defined once and reused in backend execution + frontend editors,
- **widgets** separate rendering/configuration from application pages,
- **workflow nodes** centralize graph-node definitions instead of scattering them in the app,
- **shared UI/form packages** reduce repeated component code.

## Package categories

### Datasource Packages

These packages define, render, and execute datasource integrations.

| Package | Purpose | Used By |
|:--------|:--------|:--------|
| `datasource-types` | Canonical datasource definitions, config schemas, and query metadata | Frontend & backend-adjacent tooling |
| `datasources-logic` | Connector implementations for databases, APIs, SaaS tools, and messaging systems | Backend |
| `datasources-ui` | Connection form components | Frontend |

The current repository includes datasource definitions or implementations for many types such as PostgreSQL, MySQL, MSSQL, SQLite, REST API, Supabase, Slack, Stripe, SendGrid, BigQuery, MongoDB, and more.

### Widget Packages

These packages power dashboard/widget composition.

| Package | Purpose | Used By |
|:--------|:--------|:--------|
| `widget-types` | Widget metadata and type definitions | Backend & Frontend |
| `widgets-logic` | Widget processing and transformation logic | Backend |
| `widgets-ui` | Widget configuration UI | Frontend |

There is **no standalone `widgets` package** in the current workspace. The actively used widget packages are `widget-types`, `widgets-logic`, and `widgets-ui`.

### Workflow Packages

These packages support the visual workflow builder/editor.

| Package | Purpose | Used By |
|:--------|:--------|:--------|
| `workflow-nodes` | Node definitions, editors, and workflow-builder UI pieces | Frontend |
| `workflow-edges` | Custom React Flow edges and edge helpers | Frontend |

### Shared UI and form packages

| Package | Purpose | Used By |
|:--------|:--------|:--------|
| `json-forms-renderers` | Custom renderers layered on top of JSON Forms | Frontend |
| `ui` | Shared presentational components and UI primitives | Frontend |
| `template-package` | Shared utility/template helpers used in multiple places | Frontend & Backend |

## Package Development

### Building a Package

Most packages expose their own `build` and `dev` scripts.

From an individual package directory:

```bash
cd packages/your-package
npm run build
```

### Watch Mode

From the repository root, use the workspace watch orchestration script:

```bash
npm run dev:all-packages
```

This is useful when you are changing package code consumed by `apps/frontend` or `apps/backend`.

### Consuming Packages

Packages are linked through npm workspaces and imported using the `@jet-admin/*` scope.

```javascript
// Backend-side example
import { DataSource } from '@jet-admin/datasources-logic';

// Frontend-side example
import { JsonFormsRenderers } from '@jet-admin/json-forms-renderers';
```

Common frontend imports currently include packages such as:

- `@jet-admin/datasource-types`
- `@jet-admin/datasources-ui`
- `@jet-admin/json-forms-renderers`
- `@jet-admin/widget-types`
- `@jet-admin/widgets-ui`
- `@jet-admin/ui`
- `@jet-admin/workflow-nodes`
- `@jet-admin/workflow-edges`

The backend currently consumes packages such as:

- `@jet-admin/datasources-logic`
- `@jet-admin/widget-types`
- `@jet-admin/widgets-logic`
- `@jet-admin/template-package`

## Creating a New Package

1. Copy `packages/template-package` as a starting point
2. Update `package.json` with new name (`@jet-admin/your-package`)
3. Implement your functionality in `src/index.js`
4. Ensure it sits under `packages/` so it is included by the root workspace glob
5. Add or document `build` / `dev` scripts if needed

```bash
cp -r packages/template-package packages/your-new-package
cd packages/your-new-package
# edit package.json and implement
```

## Guidance for choosing package boundaries

Create or extend a package when the code is:

- reused across multiple features,
- part of a domain extension system (datasources, widgets, workflows),
- logically independent from the frontend shell,
- easier to version and test as a separate unit.

Keep code inside an app when it is tightly coupled to a single route, page, or backend module and is unlikely to be reused.