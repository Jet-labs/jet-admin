# Generalized Marketplace Store — Design (2026-11-21)

Goal: replace the widget-only Shared Widget Library concept with a generalized,
multi-type marketplace store holding 400–500 popular/usable integration items,
seeded deterministically and browsable from tenant + operator UIs. Each item is
individually validated by a DeepSeek V4.1 Flash subagent.

## Decisions

- New table `tblMarketplaceItem` (not an extension of `tblWidgetLibrary`, which
  remains for backward compatibility).
- Item types: `datasource`, `widget`, `workflow`, `appTemplate`.
- Every item carries a full Bundle v1 `payload` so install can reuse the existing
  `bundleService.previewImport` / `executeImport` pipeline.
- Deterministic catalog + idempotent seed (stable UUIDs, `upsert` on `slug`).

## Data model — `tblMarketplaceItem`

| Column | Type | Notes |
| --- | --- | --- |
| `itemID` | UUID PK | default `gen_random_uuid()` |
| `slug` | VARCHAR UNIQUE | stable key, e.g. `stripe-payments-datasource` |
| `itemType` | VARCHAR | `datasource` \| `widget` \| `workflow` \| `appTemplate` |
| `title` | VARCHAR | human title |
| `description` | VARCHAR? | one-line purpose |
| `category` | VARCHAR? | e.g. `Payments`, `Data & Analytics` |
| `tags` | JSONB | string array |
| `icon` | VARCHAR? | icon key |
| `iconColor` | VARCHAR? | hex color |
| `publisher` | VARCHAR? | `jet-admin` for built-ins |
| `version` | VARCHAR | default `1.0.0` |
| `payload` | JSONB | Bundle v1 document |
| `isVerified` | BOOLEAN | default `false` |
| `installCount` | INT | default `0` |
| `sourceFamily` | VARCHAR? | integration family key from the catalog |
| `publishedByUserID` | UUID? | operator/user publisher |
| `createdAt`, `updatedAt` | TIMESTAMPTZ(6) | |

Indexes: `itemType`, `category`, `sourceFamily`, `slug` (unique).

## Catalog / taxonomy

- `MARKETPLACE_ITEM_TYPES` = the four types above.
- A curated `INTEGRATION_FAMILIES` list (~120 popular/usable tools) with
  `key`, `name`, `category`, `tags`, `icon`, `iconColor`, and optional
  `datasourceType` mapping into `DATASOURCE_TYPES`.
- For each family the generator emits one item per supported type, producing
  400–500 items total (target ~480). Core built-in widget descriptors and the
  shipped bundles are also surfaced as items.
- Stable IDs via SHA-256 of `VERSION:slug` (same pattern as showcase manifest).

## API (tenant-scoped routes for Casbin domain context)

Mounted at `/api/v1/tenants/:tenantID/marketplace`:

- `GET /` — list with `search`, `itemType`, `category`, `page`, `pageSize`
- `GET /:itemID` — fetch one
- `POST /:itemID/preview` — dry-run install into the tenant
- `POST /:itemID/install` — clone via `bundleService.executeImport`

Operator routes at `/api/v1/operator/marketplace`:

- `GET /` — list/filter
- `PATCH /:itemID` — set `isVerified` / metadata
- `DELETE /:itemID` — unpublish

Permissions added under the `marketplace` resource: `list`, `preview`,
`install`, `verify`, `unpublish`, mirroring `P.widgetLibrary.*`.

## UI

- Tenant `MarketplaceGrid`: switch data source to marketplace API, add
  type/category filter chips, render mixed item cards with icon + type badge;
  keep preview/install dialog flow.
- Operator admin: new `marketplace/marketplaceTable.jsx` mirroring
  `widgetLibraryTable.jsx` with verify/unpublish actions.

## Testing

- Unit tests: catalog count range (400–500), determinism, schema validity,
  type coverage; marketplace service/validator behavior.
- Per-item validation: batched subagents pinned to
  `opencode-go/deepseek-v4.1-flash`, results written to
  `reports/marketplace-validation.json`, failures remediated and re-validated.
