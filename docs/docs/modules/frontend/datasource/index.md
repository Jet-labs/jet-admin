---
id: index
title: Datasource UI
sidebar_label: Datasource UI
description: Components for managing Datasource connections.
---

# Datasource UI

The Datasource UI (`apps/frontend/src/presentation/components/datasourceComponents`) provides interfaces for adding, editing, and listing data sources.

## Data Models

The UI handles diverse datasource types (PostgreSQL, REST API, etc.) using a polymorphic form structure.

```mermaid
graph TD
    Page[Datasource Page] -->|Renders| List[Datasource List]
    List -->|OnClick| Editor[DatasourceEditor]
    
    Editor -->|State| Formik
    Editor -->|Tabs| Tabs["Connection | SSH Tunnel | Advanced"]
    
    Editor -->|Action| Test["Test Connection"]
    Test -->|API| TestAPI["POST /test"]
    
    Editor -->|Action| Save["Save Datasource"]
    Save -->|API| SaveAPI["POST /create"]
```

## Key Components

### `DatasourceEditor`
A shared wrapper that renders the specific form fields based on `datasourceType`.
- Uses `useDatasource` hook for data fetching.
- Manage `isLoading` states for Test/Save actions.

### `DatasourceTestingForm`
A sub-component specifically for the "Test Connection" button logic. It displays success/error toasts based on the backend response.
