---
id: application-model
title: Application & Page Model
sidebar_label: Application Model
sidebar_position: 2
description: Understanding the Application lifecycle, Page routing, and Layout engine.
---

# Application & Page Model

At the highest level of Jet Admin's UI hierarchy are **Applications** and **Pages**. Understanding how these are modeled and rendered is key to understanding the frontend architecture.

## Application Lifecycle

An **Application** (or App) serves as a logical container for your tools.

1. **Creation:** An app is created within a specific Tenant. The creator is granted Owner permissions.
2. **Metadata Storage:** The app metadata (name, description, theme settings) is persisted in the PostgreSQL database.
3. **Configuration:** Developers add Pages, configure local queries, and bind datasources to the app.
4. **Publishing (Versioning):** *[VERIFY: Does Jet Admin support explicit app versioning/publishing flows, or are changes live immediately? Assuming live based on standard SPA behavior unless specified otherwise.]* Changes made in the builder are saved to the database and immediately reflect for users with "Viewer" access reloading the app.
5. **Deletion:** Deleting an app cascades to delete all its associated Pages.

## Page Model

A **Page** represents a single routable view within an Application.

### Schema and Routing
In the database (`tblAppPages`), a page stores:
- `appPageID`: Unique identifier.
- `appPageTitle`: Display name for the navigation sidebar.
- `appPageConfig`: JSON blob containing the widget layout and page-level settings.

Routing is handled client-side by React Router. The URL structure typically follows:
`/app/:appId/page/:pageId`

### State Scoping
Jet Admin differentiates between global state and page-level state:
- **Global State:** Information about the authenticated user, current tenant, and global UI theme. Managed in `useAuthStore` and `useUIStore`.
- **Page-Level State (Widget State):** The specific data, selections, and input values of the widgets currently mounted on the page. When a user navigates away from Page A to Page B, the widget state for Page A is unmounted and cleared. This ensures pages do not leak memory or cross-contaminate state.

### Page Load Lifecycle
When a user navigates to a page:
1. The frontend fetches the `appPageConfig` from the backend.
2. The layout engine mounts the widget components according to the config.
3. Any queries configured to "Run on Page Load" are triggered concurrently.
4. As queries resolve, TanStack Query updates the cache, triggering reactive re-renders of the mounted widgets.

## Layout Engine

The Jet Admin canvas uses a grid-based layout engine to render widgets.

### Grid System
The canvas is subdivided into a grid (typically 12 or 24 columns). When a widget is placed on the canvas, its configuration saves:
- `x`, `y` coordinates (grid cells, not pixels).
- `width`, `height` (span in grid cells).

### Rendering Pipeline
1. The `appPageConfig` contains an array or tree of widget definitions.
2. The layout engine iterates over these definitions.
3. For each definition, it looks up the React component in the **Widget Registry** (e.g., mapping `type: 'table'` to the `<TableWidget />` component).
4. The widget is rendered within a draggable/resizable bounding box (when in Edit mode) or statically positioned (when in View mode).

### Persistence and Restoration
When a user drags a widget or resizes it, the frontend calculates the new `x/y/w/h` values. These changes are debounced and patched to the backend `appPageConfig` JSON column. On subsequent loads, the engine reads these values to restore the exact layout.
