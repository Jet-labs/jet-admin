# Application Page Runtime & State — Design Spec

> Sub-Project #1 of 4: AppPage Runtime → Enhanced Event System → Interactive Widgets → Visual Binding UX

## Overview

Replace the current isolated-widget dashboard architecture with a unified **Application Page (AppPage) Runtime**. An AppPage is not merely a grid of widgets — it is a full-scale application builder capable of creating complete, interactive web pages with layout control, state management, data binding, event handling, and inter-widget communication.

The AppPage Runtime provides:

- **Shared state tree** scoped per user session (no cross-user bleed)
- **Reactive expression binding** (`{{ queries.users.data }}`, `{{ widgets.table.selectedRow }}`)
- **Event → Action dispatch** (onRowSelect → SET_VARIABLE, EXECUTE_QUERY, CALL_WIDGET_METHOD)
- **Widget command bus** (Table.onRowSelect → Modal.open(), Form.reset())
- **Page-level data orchestration** (deduplicated query execution, reactive refetch)

## Terminology

| Term | Meaning |
|------|---------|
| **Application Page (AppPage)** | Replaces "Dashboard". A full-capability application page that can contain any combination of widgets, layouts, data bindings, and interactions — equivalent to building a complete web page |
| **Page Runtime** | The client-side state machine for a single AppPage session |
| **Widget State** | UI state a widget exposes (selectedRow, value, isOpen) |
| **Page Variable** | User-defined scratch state scoped to the page |
| **Data Source** | A query or workflow bound to the page, executed by the runtime |
| **Widget Command** | A callable method exposed by a widget (open, close, refresh) |

## 1. State Model

### Hierarchy

```
App (future — multi-page container)
  └─ Application Page (full web page builder)
       ├─ Page Data Sources (queries/workflows)
       ├─ Page Variables (scratch state)
       └─ Widgets[]
            ├─ Widget State (selectedRow, value, etc.)
            ├─ Widget Commands (open, close, refresh)
            └─ Widget Events (onClick → actions[])
```

### State Tree Shape (per user session, client-side only)

```js
appPageStateTree = {
  // Data from queries/workflows — page-level, shared
  queries: {
    users:      { data: [...], isLoading: false, error: null, lastUpdated: 1716400000 },
    userDetail: { data: {...}, isLoading: false, error: null, lastUpdated: 1716400001 },
  },

  // Widget UI state — widget-owned, page-visible
  widgets: {
    userTable:   { selectedRow: {...}, selectedIndex: 0, currentPage: 1 },
    searchInput: { value: "john", isDirty: true },
    detailModal: { isOpen: false },
  },

  // User-defined page-level scratch variables
  variables: {
    currentStep: 1,
    selectedUserID: null,
  },

  // Real-time listener data
  listeners: {
    syslog_stream: { data: [...], lastUpdated: 1716400000 },
  },

  // Immutable context (set once on page load)
  globals: {
    tenantID: "t_123",
    currentUser: { userID: "u_456", email: "user@example.com" },
    pageID: "page_789",
    urlParams: { id: "42" },
  },
}
```

### Two-Layer Model

| Layer | Scope | Contents |
|-------|-------|----------|
| **Page level** | Shared across all widgets | Data sources, variables |
| **Widget level** | Per widget, exposed to page | UI state, events, commands |

There are no widget-local data sources. All data is page-level. Widget state is strictly for UI state that the widget produces.

## 2. Session Isolation

All runtime state is client-side (React context, in-memory). The server stores only **definitions** (widget config, page layout, variable schemas). The **runtime values** live entirely in the user's browser.

| Layer | Shared across users? |
|-------|---------------------|
| Widget definitions (DB) | Yes |
| Page layout (DB) | Yes |
| Variable definitions (DB) | Yes |
| Query/workflow results (runtime) | No — each user fetches independently |
| Widget states (runtime) | No — React context per session |
| Page variables (runtime) | No — in-memory per session |
| Listener data (WebSocket) | Data broadcast is shared; UI reactions are per-session |

## 3. Inter-Widget Communication

Three channels, used together:

### 3a. Expression Binding (pull — read other widget's state)

Widgets reference each other's state via `{{ }}` expressions in their config:

```
Widget: Detail Panel
Config: { title: "{{ widgets.userTable.selectedRow.name }}" }
```

When `widgets.userTable.selectedRow` changes, the Detail Panel's config is re-evaluated and it re-renders.

### 3b. Event → Action Dispatch (push — react to events)

Each widget event maps to an array of sequentially-executed actions:

```json
{
  "events": {
    "onRowSelect": [
      { "actionType": "APP_PAGE_SET_VARIABLE", "config": { "key": "selectedUserID", "value": "{{ event.args.row.id }}" } },
      { "actionType": "APP_PAGE_EXECUTE_QUERY", "config": { "alias": "userDetail" } },
      { "actionType": "APP_PAGE_CALL_WIDGET_METHOD", "config": { "targetWidgetID": "detailModal", "method": "open", "args": {} } }
    ]
  }
}
```

Actions support `{{ }}` expressions in their config, resolved at execution time against the current state tree plus event args.

### 3c. Widget Commands (direct method invocation)

Widgets register callable methods. Other widgets invoke them via `APP_PAGE_CALL_WIDGET_METHOD`.

Standard methods by widget type:

| Widget Type | Exposed Methods |
|-------------|----------------|
| Modal | `open()`, `close()` |
| Table | `refresh()`, `clearSelection()`, `scrollToRow(index)` |
| Form | `reset()`, `submit()`, `setValue(field, value)` |
| Tabs | `setActiveTab(tabKey)` |

Method args support `{{ }}` expressions. Multiple `CALL_WIDGET_METHOD` actions can be chained in a single event handler.

## 4. Action Types

```js
APP_PAGE_SET_VARIABLE          // Set a page variable value
APP_PAGE_SET_WIDGET_STATE      // Update a widget's exposed UI state
APP_PAGE_EXECUTE_QUERY         // Run a data source query by alias
APP_PAGE_EXECUTE_WORKFLOW      // Run a data source workflow by alias
APP_PAGE_CALL_WIDGET_METHOD    // Invoke a registered method on a target widget
APP_PAGE_EMIT_EVENT            // Broadcast a custom event on the page bus
APP_PAGE_SHOW_TOAST            // Display a notification message
APP_PAGE_NAVIGATE              // Navigate to another page (future multi-page)
```

## 5. Data Source Execution Pipeline

### Data Source Definition

All data sources are page-level. Each has:

```js
{
  alias: "users",               // unique key for referencing in expressions
  type: "query" | "workflow",   // execution backend
  queryID: "q_123",             // or workflowID for workflow type
  inputValues: {                  // supports {{ }} expressions
    search: "{{ widgets.searchInput.value }}",
    limit: 50
  },
  triggerMode: "auto" | "reactive" | "manual",
  refreshOn: ["variables.selectedUserID"],  // for reactive mode
  refetchInterval: null,                     // optional polling in ms
}
```

### Trigger Modes

| Mode | When it executes |
|------|-----------------|
| `auto` | On page load, once |
| `reactive` | On page load plus whenever any path in `refreshOn` changes |
| `manual` | Only when explicitly triggered via `APP_PAGE_EXECUTE_QUERY` action |

### Execution Guarantees

- **Deduplication:** If the same alias is triggered while already in-flight, the pending request is tracked and the new trigger waits or cancels the stale one.
- **Request ID tracking:** Each execution gets a monotonic ID. When results arrive, stale responses (from superseded requests) are discarded.
- **Error isolation:** A failed data source does not block others. Errors are stored per-alias in `queries[alias].error`.

### Refetch Interval

Data sources with `refetchInterval` set are re-executed on a timer. The timer is managed by the runtime and cleaned up on page unmount.

## 6. Reactivity Engine

### Dependency Tracking

The existing `extractDependencies()` function scans widget configs for `{{ }}` expressions and returns dependency paths. The runtime uses this to:

1. Build a dependency graph: widget to state paths it depends on
2. When a state path changes, identify affected widgets
3. Re-evaluate only those widgets' configs
4. Re-render only if the resolved config actually changed

### Change Detection Flow

```
State mutation (SET_VARIABLE, SET_WIDGET_STATE, query result arrives)
  -> Identify changed paths (e.g. ["variables.selectedUserID"])
  -> Find widgets depending on those paths
  -> Re-evaluate their configs via resolveAppPageExpressions()
  -> Shallow-compare resolved config vs previous
  -> Re-render only if different
```

### Reactive Data Source Triggering

```
State mutation changes path "variables.selectedUserID"
  -> Check all data sources with refreshOn including that path
  -> Re-resolve their inputValues against new state tree
  -> Re-execute the data source
  -> Store new result in queries[alias]
  -> Widgets depending on queries[alias] re-render
```

## 7. Component Architecture

### New Files

```
apps/frontend/src/logic/appPageRuntime/
  AppPageRuntimeProvider.jsx     — Context provider, state init, lifecycle
  appPageReducer.js              — Pure reducer for all state mutations
  appPageActions.js              — Action type constants and creators
  appPageSelectors.js            — Memoized selectors for state slices
  appPageDataSourceManager.js    — Query/workflow execution, dedup, polling
  appPageExpressionEngine.js     — Enhanced expression eval with dependency tracking
  appPageEventBus.js             — Custom event emitter for page-level events
  useAppPageStateTree.js         — Hook: read full state tree
  useAppPageDispatch.js          — Hook: dispatch actions
  useAppPageVariables.js         — Hook: read/write page variables
  useAppPageQueries.js           — Hook: read query results
  useWidgetState.js              — Hook: widget reads/writes its own state
  useWidgetMethodRegistry.js     — Hook: widget registers callable methods
  useWidgetEventHandlers.js      — Hook: widget gets bound event handlers
```

### Provider Wrapping

```jsx
// appPageViewer.jsx (replaces dashboardViewer.jsx)
<AppPageRuntimeProvider
  pageID={pageID}
  tenantID={tenantID}
  pageConfig={page.config}
  widgetDefinitions={page.widgets}
>
  <AppPageGrid layout={page.layout}>
    {widgets.map(w => (
      <AppPageWidgetSlot key={w.widgetID} widgetID={w.widgetID} />
    ))}
  </AppPageGrid>
</AppPageRuntimeProvider>
```

### Reducer Initial State

```js
const appPageInitialState = {
  queryResults: {},          // { [alias]: { data, isLoading, error, lastUpdated } }
  widgetStates: {},          // { [widgetID]: { ...uiState } }
  widgetMethods: {},         // { [widgetID]: { methodName: fn, ... } }
  variables: {},             // { [key]: value }
  variableDefinitions: [],   // [{ key, type, defaultValue }]
  listenerData: {},          // { [listenerID]: { data, lastUpdated } }
  globals: {},               // { tenantID, currentUser, pageID, urlParams }
};
```

## 8. Widget Integration Contract

Every widget component receives a standardized props interface from `AppPageWidgetSlot`:

```js
{
  // Identity
  widgetID: "userTable",
  widgetType: "table",

  // Resolved config (all {{ }} already evaluated)
  widgetConfig: { columns: [...], ... },

  // Resolved data (from page data sources)
  data: [...],

  // UI State — widget reads and writes
  widgetState: { selectedRow: null, selectedIndex: -1 },
  setWidgetState: (updates) => void,

  // Commands — widget registers callable methods
  registerWidgetMethods: ({ refresh: fn, clearSelection: fn }) => void,

  // Events — widget fires events, runtime dispatches actions
  fireWidgetEvent: (eventType, eventArgs) => void,
}
```

Widgets do not import any runtime hooks directly. They call `fireWidgetEvent("onRowSelect", { row })` and the runtime handles everything (variable setting, query execution, method calls).

## 9. Database Migration (SQL)

All database changes are delivered as raw SQL. Do NOT modify the Prisma schema directly — run these migrations and then `prisma db pull` to sync.

### 9a. Rename tblDashboards → tblAppPages

```sql
-- Rename table
ALTER TABLE "tblDashboards" RENAME TO "tblAppPages";

-- Rename columns
ALTER TABLE "tblAppPages" RENAME COLUMN "dashboardID" TO "appPageID";
ALTER TABLE "tblAppPages" RENAME COLUMN "dashboardTitle" TO "appPageTitle";
ALTER TABLE "tblAppPages" RENAME COLUMN "dashboardDescription" TO "appPageDescription";
ALTER TABLE "tblAppPages" RENAME COLUMN "dashboardConfig" TO "appPageConfig";

-- Rename existing constraints/indexes
ALTER INDEX "tblDashboards_pkey" RENAME TO "tblAppPages_pkey";
ALTER INDEX "idx_tblDashboards_createdByApiKeyID" RENAME TO "idx_tblAppPages_createdByApiKeyID";

-- Rename foreign key constraints
ALTER TABLE "tblAppPages" RENAME CONSTRAINT "fkTblDashboardCreatorID" TO "fkTblAppPageCreatorID";
ALTER TABLE "tblAppPages" RENAME CONSTRAINT "fkTblDashboardsCreatedByApiKeyID" TO "fkTblAppPagesCreatedByApiKeyID";
ALTER TABLE "tblAppPages" RENAME CONSTRAINT "fkTblDashboardsTenantIDTenantID" TO "fkTblAppPagesTenantIDTenantID";
```

### 9b. Data sources and variables stored in appPageConfig JSON

No separate tables needed. Data sources and variables are stored inside the `appPageConfig` JSON column, following the same pattern as `widgetConfig`, `listenerConfig`, and `workflowOptions`.

```json
{
  "dataSources": [
    {
      "alias": "users",
      "type": "query",
      "queryID": "q_123",
      "inputValues": {},
      "triggerMode": "auto",
      "refreshOn": [],
      "refetchInterval": null
    }
  ],
  "variables": [
    {
      "key": "selectedUserID",
      "type": "string",
      "defaultValue": null,
      "description": "Currently selected user"
    }
  ],
  "layout": {}
}
```

### 9c. After migration, sync Prisma

```bash
npx prisma db pull
npx prisma generate
```

## 10. Rename: Dashboard → AppPage (Full Codebase)

This rename spans the entire codebase. All references to "dashboard" become "appPage".

### Backend

| Current | New |
|---------|-----|
| `modules/dashboard/` | `modules/appPage/` |
| `dashboardController.js` | `appPageController.js` |
| `dashboardService.js` | `appPageService.js` |
| `dashboardRouter.js` | `appPageRouter.js` |
| API routes: `/api/dashboards` | `/api/app-pages` |
| Prisma model: `tblDashboards` | `tblAppPages` (via db pull after SQL) |

### Frontend

| Current | New |
|---------|-----|
| `dashboardComponents/` | `appPageComponents/` |
| `dashboardViewer.jsx` | `appPageViewer.jsx` |
| `dashboardWidget.jsx` | `AppPageWidgetSlot.jsx` |
| `dashboardDropzone.jsx` | `appPageDropzone.jsx` |
| `dashboardEditor.jsx` | `appPageEditor.jsx` |
| `dashboardAdditionForm.jsx` | `appPageAdditionForm.jsx` |
| `dashboardUpdationForm.jsx` | `appPageUpdationForm.jsx` |
| `dashboardDeletionForm.jsx` | `appPageDeletionForm.jsx` |
| `dashboardCloneForm.jsx` | `appPageCloneForm.jsx` |
| `dashboardLayoutUtils.js` | `appPageLayoutUtils.js` |
| `dashboardDrawerList/` | `appPageDrawerList/` |
| `dashboardLayout.jsx` | `appPageLayout.jsx` |
| Pages: `addDashboardPage/` | `addAppPagePage/` |
| Pages: `updateDashboardPage/` | `updateAppPagePage/` |
| API layer: `apis/dashboard.js` | `apis/appPage.js` |
| Constants: `DASHBOARDS` | `APP_PAGES` |
| React Query keys: `REACT_QUERY_KEYS.DASHBOARDS` | `REACT_QUERY_KEYS.APP_PAGES` |

### Hooks and Stores

| Current | New |
|---------|-----|
| `useRuntimeStore.js` | Keep for global concerns only (workflow streaming) |
| `evaluationEngine.js` | Fork → `appPageExpressionEngine.js` with dependency tracking |
| `actionDispatcher.js` | Merge into `appPageReducer.js` dispatch |
| `dataSourcesEditor.jsx` | Move to page-level config in `appPageDataSourcesEditor.jsx` |
| `widgetEventsEditor.jsx` | Extend with new action types in `appPageWidgetEventsEditor.jsx` |

## 11. Migration Path (Code)

### What Changes

| Current File | Action | New File |
|-------------|--------|----------|
| `dashboardViewer.jsx` | Wrap in `AppPageRuntimeProvider` | `appPageViewer.jsx` |
| `dashboardWidget.jsx` | Replace independent fetching with context | `AppPageWidgetSlot.jsx` |
| `dataSourcesEditor.jsx` | Move to page-level config editor | `appPageDataSourcesEditor.jsx` |
| `widgetEventsEditor.jsx` | Extend with new action types and method picker | Enhanced events editor |
| `useRuntimeStore.js` | Keep for global concerns only (workflow streaming) | Reduced scope |
| `evaluationEngine.js` | Fork into `appPageExpressionEngine.js` | Enhanced with dep tracking |
| `actionDispatcher.js` | Merge into `appPageReducer.js` dispatch | Integrated into reducer |

### What Stays

- All existing widget components (`@jet-admin/widgets-ui`) work unchanged — they receive the new standardized props
- Widget type registry (`WIDGETS_MAP`) unchanged
- Listener integration unchanged (WebSocket data flows into page state)

## 12. Error Handling

| Scenario | Handling |
|----------|----------|
| Circular expression dependency | Detected at eval time, break cycle, log warning |
| Widget method called on unmounted widget | Skip silently, log warning |
| Stale query response (superseded request) | Discard via monotonic request ID |
| Expression references non-existent path | Resolves to `undefined`, no crash |
| Data source execution failure | Error stored in `queries[alias].error`, other sources unaffected |
| Widget state update on unmounted widget | Ignored by reducer (check widgetID exists) |

## 13. AppPage as Application Builder

An AppPage is a full-capability application page builder, not just a widget grid. It supports:

- **Flexible layout** — widgets can be positioned, nested, and sized freely (grid, flex, absolute positioning)
- **Container widgets** — panels, tabs, modals, collapsible sections that contain other widgets
- **Form building** — input widgets that produce state, validation, conditional visibility
- **Navigation** — links, tabs, and routing between AppPages within a multi-page app
- **Conditional rendering** — widgets can be shown/hidden based on `{{ }}` expressions
- **Custom styling** — per-widget CSS, theme variables, responsive breakpoints
- **Full web page semantics** — heading hierarchy, semantic sections, accessibility attributes

This positions AppPages as the visual frontend layer of the platform, consuming the data layer (queries, workflows, listeners) and exposing interactive interfaces to end users.

## 14. Future: Multi-Page Applications

The architecture supports multi-page apps in a future sub-project:

- **`APP_PAGE_NAVIGATE` action** — navigate between pages with params
- **App-level variables** — state that persists across page navigations (above page scope)
- **URL parameter binding** — `globals.urlParams` already in the state tree
- **Page lifecycle events** — `onPageEnter`, `onPageLeave` for data prefetching and cleanup
- **Shared app layout** — header, sidebar, navigation shared across pages

This spec covers Sub-Project #1 only. Sub-Projects #2-4 (Enhanced Events, Interactive Widgets, Visual Binding UX) build on top of this foundation.
