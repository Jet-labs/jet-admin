---
sidebar_position: 1
title: Packages Overview
description: Understanding the Jet Admin monorepo package structure
---

# Packages Overview

Jet Admin is built as a **monorepo** using NPM Workspaces. Shared logic and reusable components are organized into packages under the `packages/` directory.

## Package Architecture

```
packages/
├── datasource-types/      # Datasource configuration schemas
├── datasources-logic/     # Database connection drivers
├── datasources-ui/        # Datasource connection forms
├── widget-types/          # Widget type definitions
├── widgets/               # Widget renderers (Chart.js, Tables)
├── widgets-logic/         # Data transformation processors
├── widgets-ui/            # Widget configuration panels
├── workflow-nodes/        # React Flow node components
├── workflow-edges/        # React Flow edge components
├── json-forms-renderers/  # Custom form field renderers
└── template-package/      # Shared utilities
```

## Package Categories

### Datasource Packages

Enable Jet Admin to connect to external data sources.

| Package | Purpose | Used By |
|:--------|:--------|:--------|
| `datasource-types` | Configuration schemas (host, port, auth) | Backend & Frontend |
| `datasources-logic` | Driver implementations (PostgreSQL, MySQL, REST) | Backend |
| `datasources-ui` | Connection form components | Frontend |

### Widget Packages

Power the dashboard visualization system.

| Package | Purpose | Used By |
|:--------|:--------|:--------|
| `widget-types` | Type definitions and constants | Backend & Frontend |
| `widgets` | Rendering components (Chart.js, Vega) | Frontend |
| `widgets-logic` | Data transformation processors | Backend |
| `widgets-ui` | Configuration sidebars | Frontend |

### Workflow Packages

Components for the visual workflow builder.

| Package | Purpose | Used By |
|:--------|:--------|:--------|
| `workflow-nodes` | Custom React Flow nodes | Frontend |
| `workflow-edges` | Custom React Flow edges | Frontend |

## Package Development

### Building a Package

Each package uses `rollup` for bundling:

```bash
cd packages/your-package
npm run build
```

### Watch Mode

For development, run packages in watch mode:

```bash
npm run dev:all-packages
```

This starts all packages in watch mode, rebuilding on file changes.

### Consuming Packages

Packages are linked automatically via NPM Workspaces:

```javascript
// In apps/backend
import { PostgreSQLDriver } from '@jet-admin/datasources-logic';

// In apps/frontend
import { LineChartWidget } from '@jet-admin/widgets';
```

## Creating a New Package

1. Copy `packages/template-package` as a starting point
2. Update `package.json` with new name (`@jet-admin/your-package`)
3. Implement your functionality in `src/index.js`
4. Add to workspace in root `package.json`

```bash
cp -r packages/template-package packages/your-new-package
cd packages/your-new-package
# Edit package.json and implement
```
