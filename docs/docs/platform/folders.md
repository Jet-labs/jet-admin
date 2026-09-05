---
title: Folders
description: Per-entity folder trees, bulk move semantics, and list filtering.
sidebar_position: 12
---

# Folders

Folders organize items per entity type. Implementation:
`apps/backend/modules/folder/`, table `tblFolders`.

## Data model

```
tblFolders
├── folderID        UUID PK
├── folderTitle     VARCHAR(255)
├── tenantID        UUID  (FK → tblTenants, CASCADE)
├── entityType      VARCHAR(50)   — widget | workflow | dataQuery | cronJob | appPage | listener
├── parentFolderID  UUID? (self-FK, ON DELETE SET NULL)
└── creatorID       UUID?
```

Every organizable entity table carries a nullable `folderID` FK
(`ON DELETE SET NULL`), so deleting a folder simply un-files its items:

- `tblWidgets.folderID`
- `tblWorkflows.folderID`
- `tblDataQueries.folderID`
- `tblCronJobs.folderID`
- `tblAppPages.folderID`
- `tblListeners.folderID`

Folder trees are **scoped to `(tenantID, entityType)`** — a workflow folder is
never visible in the widget drawer.

Migration: `prisma/migrations/manual/002-add-folders.sql`.

## Endpoints

Mounted at `/api/v1/tenants/:tenantID/folders`:

| Method | Path | Permission | Notes |
|---|---|---|---|
| GET | `/?entityType=widget` | `folder.list` | flat list; tree built client-side |
| POST | `/` | `folder.create` | body `entityType, folderTitle, parentFolderID?` |
| PATCH | `/:folderID` | `folder.update` | rename and/or re-parent (cycle-checked) |
| DELETE | `/:folderID` | `folder.delete` | child folders promoted to the grandparent; items un-filed |
| POST | `/move` | `folder.update` + per-entity `.update` per item | body `entityType, entityIDs[], folderID|null` — bulk move; `folderID: null` un-files |

### Filtering entity lists

Each entity list endpoint accepts an optional `?folderID=<uuid>` query
parameter (validated as UUID) that filters by folder:

```
GET /api/v1/tenants/:tenantID/workflows?folderID=<uuid>
GET /api/v1/tenants/:tenantID/queries?folderID=<uuid>
GET /api/v1/tenants/:tenantID/widgets?folderID=<uuid>
GET /api/v1/tenants/:tenantID/listeners?folderID=<uuid>
GET /api/v1/tenants/:tenantID/cronjobs?folderID=<uuid>
GET /api/v1/tenants/:tenantID/app-pages?folderID=<uuid>
```

Omitting the parameter returns all items ("All items" root view).

## Frontend

One shared component serves every drawer list — no per-entity forks.
Drawers render an **explorer-style tree**: real folder structure with items
nested inside their folders and unfiled items at the root ("All items").

- `presentation/components/folderComponents/entityFolderTree.jsx`
  (`EntityFolderTree`) — renders the full hierarchy with inline folder
  create / rename / delete actions and native HTML5 drag & drop:
  - **Drag an item** onto a folder to move it; onto "All items" to un-file it.
  - **Drag a folder** onto another folder to re-parent (self/descendant drops
    are rejected client- and server-side); onto "All items" to promote it to
    root level.
  - Each drawer keeps its own row visuals via a `renderItemRow` callback.
- Items are fetched with `logic/hooks/useEntityItems.js`
  (`useEntityItems({tenantID, entityType, search})`) — one query returning all
  rows including their `folderID`. While searching, drawers fall back to a
  flat server-filtered result list.

Consumers: workflow, query, widget, listener, cron job and app page drawers.
