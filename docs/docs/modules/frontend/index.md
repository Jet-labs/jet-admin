---
id: frontend-modules-index
title: Frontend Modules
sidebar_label: Frontend Modules
sidebar_position: 1
description: Overview of the Jet Admin Frontend Architecture.
---

# Frontend Architecture

The frontend is a **Vite + React** Single Page Application. It uses a component-based architecture with separated logic (hooks) and presentation (components) layers.

## Directory Structure

| Path | Description |
| :--- | :--- |
| `src/presentation` | UI Components, Layouts, and Pages. |
| `src/logic` | Business logic, Contexts, Hooks, and Redux slices. |
| `src/data` | API clients and data fetching logic. |
| `src/config` | App configuration (Firebase, Themes, etc.). |
| `src/assets` | Static assets (Images, Icons). |

## Key Technologies

- **UI Framework:** Material UI (MUI) v6
- **Styling:** Tailwind CSS + Emotion
- **State Management:**
    - `React Context`: Global app state (Theme, Auth).
    - `React Query`: Server state management (caching, fetching).
    - `Formik`: Complex form state management.
- **Workflow Engine:** React Flow

## Module Breakdown

| Module | Description |
| :--- | :--- |
| **Workflow** | Visual editor for creating automation workflows. |
| **Dashboard** | Grid-based layout for visualizing data widgets. |
| **DataQuery** | SQL/JS query editor and runner. |
