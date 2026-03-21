---
id: index
title: Dashboard Module
sidebar_label: Dashboard
description: Manages Dashboard creation, layout configuration, and cloning.
---

# Dashboard Module


The **Dashboard Module** (`apps/backend/modules/dashboard`) handles the lifecycle of Dashboards, which are containers for Widgets.

## Data Model

A Dashboard is primarily a layout configuration stored in Postgres.

| Field | Type | Description |
| :--- | :--- | :--- |
| `dashboardID` | Integer | Primary Key. |
| `tenantID` | Integer | Scoped to a specific tenant. |
| `dashboardConfig` | JSON | Stores the `react-grid-layout` configuration (positions, sizes). |
| `creatorID` | Integer | User who created the dashboard. |

## Service API

### `cloneDashboardByID`

Duplicates a dashboard and all its settings.

```javascript
await dashboardService.cloneDashboardByID({
  userID: 1,
  tenantID: 1,
  dashboardID: 10
});
```

**Logic:**
1. Fetches source dashboard.
2. Creates new record with `Title (Copy)`.
3. Copies `dashboardConfig` verbatim.
4. **Note:** Does NOT clone the widgets inside. Widgets are referenced by ID in the layout config? 
   *Correction:* In Jet Admin, dashboards contain a list of Widget IDs. If deep cloning is required, the logic would need to clone widgets too. Currently, it copies the config.

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/dashboards/:tenantID` | List all dashboards. |
| `POST` | `/api/dashboards/:tenantID` | Create new dashboard. |
| `GET` | `/api/dashboards/:tenantID/:dashboardID` | Get specific dashboard. |
| `PUT` | `/api/dashboards/:tenantID/:dashboardID` | Update layout/title. |
| `POST` | `/api/dashboards/:tenantID/:dashboardID/clone` | Clone dashboard. |
