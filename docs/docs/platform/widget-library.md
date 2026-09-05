---
title: Shared Widget Library
description: Deployment-wide widget registry — publish via operator API, install per tenant.
sidebar_position: 14
---

# Shared Widget Library

A pragmatic "marketplace": a **deployment-scoped registry** of published
widgets that any tenant can install. Implementation:
`apps/backend/modules/widgetLibrary/`, table `tblWidgetLibrary`.

There is deliberately no ratings or versioning yet — only publish /
unpublish / install.

## Data model

```
tblWidgetLibrary (no tenant FK — deployment-wide)
├── libraryEntryID    UUID PK
├── widgetTitle       VARCHAR
├── widgetType        VARCHAR
├── widgetDescription VARCHAR?
├── bundle            JSONB   — full export bundle (widget + dependency closure)
├── sourceTenantID    UUID?
└── publishedByUserID UUID?
```

The stored `bundle` is exactly the Phase-1 export bundle format, so install
reuses the entire import pipeline (`bundleService.executeImport`).

Migration: `prisma/migrations/manual/003-add-widget-library.sql`.

## Endpoints

Operator registry (`/api/v1/operator/widget-library`, `requireOperator` — no Casbin, no tenant scope):

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | operator session | list entries |
| POST | `/` body: `{bundle}` | operator session | publish; bundle must contain exactly one widget item |
| DELETE | `/:libraryEntryID` | operator session | unpublish |

:::warning
Earlier drafts listed this registry at `/api/v1/widget-library`. That mount does not exist in `apps/backend/index.js` — use `/api/v1/operator/widget-library`.
:::

Tenant install (`/api/v1/tenants/:tenantID/widget-library`, nested in the
tenant router):

| Method | Path | Permission |
|---|---|---|
| POST | `/:libraryEntryID/preview` | `widgetLibrary.install` |
| POST | `/:libraryEntryID/install` | `widgetLibrary.install` |

## Publish flow

1. The client calls the existing widget export endpoint to build the bundle
   (`GET .../widgets/:widgetID/export`).
2. The bundle is posted to `POST /api/v1/operator/widget-library`.
3. Server-side validation is identical to import validation
   (`assertImportableBundle`) and requires **exactly one widget item** in the
   bundle; its title/type/description become the registry metadata.

## Install flow

1. `preview` runs the standard dry-run against the target tenant: what will be
   created, warnings, missing dependencies.
2. `install` executes the bundle inside one transaction with fresh IDs,
   remapped references and post-commit creator access grants — identical
   semantics to bundle import.
3. Datasources arrive sanitized ("reconnect required"); listeners without a
   resolvable datasource are skipped with a reason.

## Frontend

- `PublishToLibraryButton` in the widget editor header (confirm dialog →
  export + publish).
- `WidgetLibraryBrowserDialog` behind the library icon in the widgets drawer:
  browse entries → Install → preview plan → confirm → invalidate queries.
