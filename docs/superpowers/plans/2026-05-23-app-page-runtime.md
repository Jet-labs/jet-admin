# AppPage Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the isolated-widget dashboard architecture with a unified AppPage Runtime featuring shared state, reactive data binding, event-action dispatch, and a widget command bus.

**Architecture:** React Context-based runtime provider wraps each AppPage. Widgets consume state via hooks. A pure reducer manages all mutations. An expression engine resolves `{{ }}` bindings with dependency tracking.

**Tech Stack:** React Context + useReducer, existing evaluationEngine (forked), Prisma (db pull after raw SQL), Express.js backend

**Spec:** `docs/superpowers/specs/2026-05-23-app-page-runtime-design.md`

---

## Phase 1: Database Migration & Backend Rename

### Task 1: Run SQL Migration

**Files:**
- Create: `apps/backend/prisma/migrations/manual/001-rename-dashboards-to-app-pages.sql`

- [ ] **Step 1: Create the SQL migration file**

Write the SQL from spec Section 9a (rename tblDashboards → tblAppPages, rename columns, indexes, constraints) and Section 9b (create tblAppPageDataSources and tblAppPageVariables tables).

- [ ] **Step 2: Run the migration against the database**

Run: `psql $DATABASE_URL -f apps/backend/prisma/migrations/manual/001-rename-dashboards-to-app-pages.sql`

- [ ] **Step 3: Sync Prisma schema**

Run: `cd apps/backend && npx prisma db pull && npx prisma generate`

- [ ] **Step 4: Verify the Prisma schema has tblAppPages**

Check `apps/backend/prisma/schema.prisma` — confirm `tblDashboards` is now `tblAppPages` with columns `appPageID`, `appPageTitle`, `appPageDescription`, `appPageConfig`.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: migrate tblDashboards to tblAppPages"
```

---

### Task 2: Rename Backend Module (dashboard → appPage)

**Files:**
- Rename: `apps/backend/modules/dashboard/` → `apps/backend/modules/appPage/`
- Modify: All files inside the renamed module
- Modify: `apps/backend/modules/tenant/tenant.v1.routes.js` (route mounting)
- Modify: Any file importing from dashboard module

- [ ] **Step 1: Copy dashboard module to appPage and rename all internal references**

Create `apps/backend/modules/appPage/` with files:
- `appPage.controller.js` — rename `dashboardController` → `appPageController`, `dashboardService` → `appPageService`, all param names `dashboardID` → `appPageID`, `dashboardTitle` → `appPageTitle`, `dashboardDescription` → `appPageDescription`, `dashboardConfig` → `appPageConfig`
- `appPage.service.js` — rename all Prisma calls from `tblDashboards` → `tblAppPages`, field names accordingly
- `appPage.v1.routes.js` — rename route params `/:dashboardID` → `/:appPageID`, permission strings `tenant:dashboard:*` → `tenant:appPage:*`, validators
- `appPage.validator.js` — rename `dashboardIdParamSchema` → `appPageIdParamSchema`, `createDashboardSchema` → `createAppPageSchema`, etc.
- `appPage.middleware.js` — copy as-is

- [ ] **Step 2: Update route mounting in tenant routes**

In `apps/backend/modules/tenant/tenant.v1.routes.js`, change the dashboard route import and mount path from `/dashboards` to `/app-pages`.

- [ ] **Step 3: Delete old dashboard module**

Remove `apps/backend/modules/dashboard/` directory.

- [ ] **Step 4: Verify backend starts without errors**

Run: `npm run start:b` — verify no import errors or crashes.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: rename backend dashboard module to appPage"
```

---

### ~~Task 3: REMOVED~~

> Data sources and variables are now stored inside `appPageConfig` JSON (no separate tables or API endpoints needed). The existing `updateAppPageByID` endpoint handles saving `appPageConfig` which includes `dataSources[]` and `variables[]`.

---

## Phase 2: Frontend Rename (Dashboard → AppPage)

### Task 4: Rename Frontend API Layer & Data Model

**Files:**
- Rename: `apps/frontend/src/data/apis/dashboard.js` → `appPage.js`
- Rename: `apps/frontend/src/data/models/dashboard.js` → `appPage.js`
- Modify: `apps/frontend/src/constants.js` — rename all DASHBOARD constants to APP_PAGE, update API paths

- [ ] **Step 1: Create apis/appPage.js**

Copy `dashboard.js`, rename all functions: `getAllDashboardsAPI` → `getAllAppPagesAPI`, `getDashboardByIDAPI` → `getAppPageByIDAPI`, etc. Update API paths to `/app-pages`. Rename model import to `AppPage`. Rename response keys (`response.data.dashboards` → `response.data.appPages`).

- [ ] **Step 2: Create models/appPage.js**

Copy the Dashboard model class, rename to `AppPage`, rename all field references from `dashboardID` → `appPageID`, etc.

- [ ] **Step 3: Add new API functions for data sources and variables**

In `apis/appPage.js`, add: `getAppPageDataSourcesAPI`, `createAppPageDataSourceAPI`, `updateAppPageDataSourceAPI`, `deleteAppPageDataSourceAPI`, and equivalents for variables.

- [ ] **Step 4: Update constants.js**

Rename all `DASHBOARD_*` string constants to `APP_PAGE_*`. Update `APIS.DATABASE` paths. Update `REACT_QUERY_KEYS`. Update route codes/paths.

- [ ] **Step 5: Delete old files**

Remove `apis/dashboard.js` and `models/dashboard.js`.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: rename frontend API layer from dashboard to appPage"
```

---

### Task 5: Rename Frontend Components & Pages

**Files:**
- Rename: `apps/frontend/src/presentation/components/dashboardComponents/` → `appPageComponents/`
- Rename: All files inside (dashboardViewer → appPageViewer, etc.)
- Rename: `apps/frontend/src/presentation/components/layouts/dashboardLayout.jsx` → `appPageLayout.jsx`
- Rename: `apps/frontend/src/presentation/components/drawerList/dashboardDrawerList/` → `appPageDrawerList/`
- Rename: Pages directories (`addDashboardPage` → `addAppPagePage`, `updateDashboardPage` → `updateAppPagePage`, etc.)
- Modify: `apps/frontend/src/presentation/components/routes/rootRouter.jsx`
- Modify: `apps/frontend/src/presentation/components/drawerList/mainDrawerList/index.jsx`
- Modify: All files importing from old paths

- [ ] **Step 1: Rename component directory and all files**

Rename `dashboardComponents/` to `appPageComponents/`. Inside, rename every file: `dashboardViewer.jsx` → `appPageViewer.jsx`, `dashboardWidget.jsx` → `appPageWidget.jsx`, `dashboardDropzone.jsx` → `appPageDropzone.jsx`, etc. Inside each file, rename all internal references (component names, imports, variables, props).

- [ ] **Step 2: Rename layout and drawer files**

Rename `dashboardLayout.jsx` → `appPageLayout.jsx` and `dashboardDrawerList/` → `appPageDrawerList/`. Update internal references.

- [ ] **Step 3: Rename page directories**

Rename `addDashboardPage/` → `addAppPagePage/`, `updateDashboardPage/` → `updateAppPagePage/`, `dashboardLayoutLandingPage/` → `appPageLayoutLandingPage/`. Update internal imports.

- [ ] **Step 4: Update rootRouter.jsx**

Update all route imports and path references from dashboard to appPage.

- [ ] **Step 5: Update mainDrawerList**

Update navigation links from dashboard paths to appPage paths.

- [ ] **Step 6: Update all remaining imports across the codebase**

Search for any remaining imports of old dashboard paths and update them.

- [ ] **Step 7: Verify frontend compiles and navigates correctly**

Run: `npm run start:f` — verify no broken imports, pages load.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: rename all frontend dashboard components to appPage"
```

---

## Phase 3: AppPage Runtime Core

### Task 6: Create AppPage Reducer & Action Types

**Files:**
- Create: `apps/frontend/src/logic/appPageRuntime/appPageActions.js`
- Create: `apps/frontend/src/logic/appPageRuntime/appPageReducer.js`

- [ ] **Step 1: Create appPageActions.js**

Define action type constants and action creator functions:
- `APP_PAGE_INIT` — initialize state with variable definitions and globals
- `APP_PAGE_SET_VARIABLE` — `{ key, value }`
- `APP_PAGE_SET_WIDGET_STATE` — `{ widgetID, state }`
- `APP_PAGE_SET_QUERY_RESULT` — `{ alias, data, error }`
- `APP_PAGE_SET_QUERY_LOADING` — `{ alias }`
- `APP_PAGE_REGISTER_WIDGET_METHODS` — `{ widgetID, methods }`
- `APP_PAGE_UNREGISTER_WIDGET` — `{ widgetID }`
- `APP_PAGE_SET_LISTENER_DATA` — `{ listenerID, data }`

- [ ] **Step 2: Create appPageReducer.js**

Pure reducer function handling all action types. Initial state shape per spec Section 7:
```js
{ queryResults: {}, widgetStates: {}, widgetMethods: {}, variables: {}, variableDefinitions: [], listenerData: {}, globals: {} }
```

Each case returns new state immutably. `APP_PAGE_INIT` populates variables from definitions' default values and sets globals.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: create appPage reducer and action types"
```

---

### Task 7: Create Expression Engine with Dependency Tracking

**Files:**
- Create: `apps/frontend/src/logic/appPageRuntime/appPageExpressionEngine.js`

- [ ] **Step 1: Fork evaluationEngine.js into appPageExpressionEngine.js**

Copy `evaluationEngine.js` to the new path. Keep all existing functions: `resolvePath`, `containsExpression`, `evaluateExpression`, `resolveValue`, `resolveConfig`, `extractDependencies`.

- [ ] **Step 2: Add buildStateTree function**

Add `buildAppPageStateTree(reducerState)` that transforms the reducer's flat state into the namespaced tree shape: `{ queries, widgets, variables, listeners, globals }`.

- [ ] **Step 3: Add dependency change detection**

Add `getChangedPaths(prevState, nextState)` — compares two state trees and returns an array of changed top-level paths (e.g., `["variables.selectedUserID", "widgets.userTable"]`).

Add `getAffectedWidgets(changedPaths, widgetDependencyMap)` — given changed paths and a map of `{ widgetID: dependencyPaths[] }`, returns the set of widgetIDs that need re-evaluation.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: create appPage expression engine with dependency tracking"
```

---

### Task 8: Create AppPageRuntimeProvider

**Files:**
- Create: `apps/frontend/src/logic/appPageRuntime/AppPageRuntimeProvider.jsx`
- Create: `apps/frontend/src/logic/appPageRuntime/useAppPageStateTree.js`
- Create: `apps/frontend/src/logic/appPageRuntime/useAppPageDispatch.js`
- Create: `apps/frontend/src/logic/appPageRuntime/useAppPageVariables.js`
- Create: `apps/frontend/src/logic/appPageRuntime/useAppPageQueries.js`

- [ ] **Step 1: Create AppPageRuntimeProvider.jsx**

React context provider component that:
1. Creates context objects: `AppPageStateContext`, `AppPageDispatchContext`
2. Uses `useReducer(appPageReducer, appPageInitialState)`
3. On mount, dispatches `APP_PAGE_INIT` with pageConfig (variable definitions, globals)
4. Builds the state tree via `buildAppPageStateTree(state)` and memoizes it
5. Provides state tree and dispatch to children via context

Props: `pageID`, `tenantID`, `pageConfig`, `widgetDefinitions`, `children`

- [ ] **Step 2: Create useAppPageStateTree.js**

Hook that reads from `AppPageStateContext`. Returns the full state tree.

- [ ] **Step 3: Create useAppPageDispatch.js**

Hook that reads from `AppPageDispatchContext`. Returns the dispatch function.

- [ ] **Step 4: Create useAppPageVariables.js**

Hook that reads `stateTree.variables` from context. Returns `{ variables, setVariable(key, value) }`.

- [ ] **Step 5: Create useAppPageQueries.js**

Hook that reads `stateTree.queries` from context. Returns query results keyed by alias.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: create AppPageRuntimeProvider with state hooks"
```

---

### Task 9: Create Widget Integration Hooks

**Files:**
- Create: `apps/frontend/src/logic/appPageRuntime/useWidgetState.js`
- Create: `apps/frontend/src/logic/appPageRuntime/useWidgetMethodRegistry.js`
- Create: `apps/frontend/src/logic/appPageRuntime/useWidgetEventHandlers.js`

- [ ] **Step 1: Create useWidgetState.js**

Hook: `useWidgetState(widgetID)` — reads `stateTree.widgets[widgetID]` from context. Returns `{ widgetState, setWidgetState(updates) }` where `setWidgetState` dispatches `APP_PAGE_SET_WIDGET_STATE`.

- [ ] **Step 2: Create useWidgetMethodRegistry.js**

Hook: `useWidgetMethodRegistry(widgetID)` — returns `registerWidgetMethods(methodsObj)`. On call, dispatches `APP_PAGE_REGISTER_WIDGET_METHODS`. On unmount, dispatches `APP_PAGE_UNREGISTER_WIDGET`.

- [ ] **Step 3: Create useWidgetEventHandlers.js**

Hook: `useWidgetEventHandlers(widgetID, widgetConfig)` — reads the widget's `widgetConfig.events` and returns a `fireWidgetEvent(eventType, eventArgs)` function. When called, it:
1. Looks up `widgetConfig.events[eventType]` to get the actions array
2. For each action, resolves `{{ }}` expressions in config against current stateTree + event args
3. Executes actions sequentially: SET_VARIABLE → dispatch, EXECUTE_QUERY → call API + dispatch result, CALL_WIDGET_METHOD → lookup widgetMethods[targetID] and call, SHOW_TOAST → notification, etc.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: create widget integration hooks (state, methods, events)"
```

---

### Task 10: Create Data Source Manager

**Files:**
- Create: `apps/frontend/src/logic/appPageRuntime/appPageDataSourceManager.js`
- Modify: `apps/frontend/src/logic/appPageRuntime/AppPageRuntimeProvider.jsx`

- [ ] **Step 1: Create appPageDataSourceManager.js**

Custom hook: `useAppPageDataSourceManager(dataSources, tenantID, stateTree, dispatch)`:
1. On mount, execute all data sources with `triggerMode: "auto"` or `"reactive"`
2. Track in-flight requests with monotonic request IDs per alias
3. For `reactive` sources, watch `refreshOn` paths — when they change in stateTree, re-execute
4. For `refetchInterval` sources, set up polling intervals
5. Expose `executeDataSource(alias, overrideArgs?)` for manual triggers
6. On each result, dispatch `APP_PAGE_SET_QUERY_RESULT`
7. Cleanup intervals and cancel stale requests on unmount

- [ ] **Step 2: Integrate into AppPageRuntimeProvider**

Call `useAppPageDataSourceManager` inside the provider, passing dataSources from pageConfig and the current state tree.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: create data source manager with auto/reactive/manual modes"
```

---

## Phase 4: Wire Up AppPage Viewer

### Task 11: Create AppPageWidgetSlot

**Files:**
- Create: `apps/frontend/src/presentation/components/appPageComponents/AppPageWidgetSlot.jsx`

- [ ] **Step 1: Create AppPageWidgetSlot.jsx**

Component that replaces `appPageWidget.jsx` (formerly `dashboardWidget.jsx`). It:
1. Receives `widgetID` as prop
2. Fetches widget definition via React Query (same as before)
3. Uses `useWidgetState(widgetID)` for state
4. Uses `useWidgetMethodRegistry(widgetID)` for method registration
5. Uses `useWidgetEventHandlers(widgetID, widget.widgetConfig)` for event firing
6. Reads data from `useAppPageQueries()` and resolves widget data via `resolveWidgetData`
7. Resolves widget config expressions via `resolveConfig(widgetConfig, stateTree)`
8. Passes standardized props to the widget component: `widgetID, widgetType, widgetConfig, data, widgetState, setWidgetState, registerWidgetMethods, fireWidgetEvent`

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: create AppPageWidgetSlot with runtime integration"
```

---

### Task 12: Update AppPage Viewer with Runtime Provider

**Files:**
- Modify: `apps/frontend/src/presentation/components/appPageComponents/appPageViewer.jsx`

- [ ] **Step 1: Wrap viewer in AppPageRuntimeProvider**

Update the viewer component to:
1. Fetch page data sources and variable definitions from the new APIs
2. Wrap the grid in `<AppPageRuntimeProvider pageID={...} tenantID={...} pageConfig={...}>`
3. Replace widget rendering with `<AppPageWidgetSlot widgetID={...} />`

- [ ] **Step 2: Verify the viewer loads widgets through the runtime**

Run the app, navigate to an AppPage, verify widgets render with data.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: integrate AppPageRuntimeProvider into viewer"
```

---

## Phase 5: Editor UI for Data Sources & Variables

### Task 13: Create Page-Level Data Sources Editor

**Files:**
- Create: `apps/frontend/src/presentation/components/appPageComponents/appPageDataSourcesEditor.jsx`
- Modify: `apps/frontend/src/presentation/components/appPageComponents/appPageUpdationForm.jsx`

- [ ] **Step 1: Create appPageDataSourcesEditor.jsx**

Page-level data source editor (distinct from the old widget-level one). Shows a list of data sources with:
- Alias, type (query/workflow), source picker, triggerMode selector (auto/reactive/manual)
- refreshOn paths input (for reactive mode)
- refetchInterval input
- Add/remove data source buttons
- Uses the new AppPage data source CRUD APIs

- [ ] **Step 2: Add a "Data Sources" tab to appPageUpdationForm.jsx**

Add the data sources editor as a new tab in the page editor form.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add page-level data sources editor UI"
```

---

### Task 14: Create Page-Level Variables Editor

**Files:**
- Create: `apps/frontend/src/presentation/components/appPageComponents/appPageVariablesEditor.jsx`
- Modify: `apps/frontend/src/presentation/components/appPageComponents/appPageUpdationForm.jsx`

- [ ] **Step 1: Create appPageVariablesEditor.jsx**

Variables editor showing a list of page variables with:
- Key, type (string/number/boolean/object/array), default value, description
- Add/remove variable buttons
- Uses the new AppPage variables CRUD APIs

- [ ] **Step 2: Add a "Variables" tab to appPageUpdationForm.jsx**

Add the variables editor as a new tab in the page editor form.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add page-level variables editor UI"
```

---

### Task 15: Enhance Widget Events Editor with New Action Types

**Files:**
- Modify: `apps/frontend/src/presentation/components/widgetComponents/widgetEventsEditor.jsx`

- [ ] **Step 1: Add new action types to ACTION_TYPES**

Add: `APP_PAGE_SET_VARIABLE`, `APP_PAGE_EXECUTE_QUERY`, `APP_PAGE_CALL_WIDGET_METHOD`, `APP_PAGE_NAVIGATE`. Each with label, description, and icon.

- [ ] **Step 2: Add config editors for each new action type**

- SET_VARIABLE: key input + value input (supports `{{ }}`)
- EXECUTE_QUERY: alias dropdown (populated from page data sources)
- CALL_WIDGET_METHOD: target widget dropdown + method dropdown (populated from widget type's known methods) + args inputs
- NAVIGATE: page picker + params

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: extend widget events editor with new AppPage action types"
```

---

## Phase 6: Integration & Cleanup

### Task 16: Remove Legacy Widget-Level Data Sources from Editor

**Files:**
- Modify: `apps/frontend/src/presentation/components/widgetComponents/widgetConfigEditor.jsx`

- [ ] **Step 1: Remove the Data tab's DataSourcesEditor**

The Data tab in the widget config editor currently shows widget-level data sources. Remove this and replace with a read-only reference showing which page-level data sources this widget consumes (based on `{{ queries.* }}` expressions in its config).

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "refactor: remove widget-level data sources, replaced by page-level"
```

---

### Task 17: Create AppPage Runtime Index Export

**Files:**
- Create: `apps/frontend/src/logic/appPageRuntime/index.js`

- [ ] **Step 1: Create barrel export**

Export all public APIs from the runtime module:
```js
export { AppPageRuntimeProvider } from './AppPageRuntimeProvider';
export { useAppPageStateTree } from './useAppPageStateTree';
export { useAppPageDispatch } from './useAppPageDispatch';
export { useAppPageVariables } from './useAppPageVariables';
export { useAppPageQueries } from './useAppPageQueries';
export { useWidgetState } from './useWidgetState';
export { useWidgetMethodRegistry } from './useWidgetMethodRegistry';
export { useWidgetEventHandlers } from './useWidgetEventHandlers';
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: add barrel export for appPageRuntime module"
```

---

### Task 18: End-to-End Verification

- [ ] **Step 1: Verify backend starts and all AppPage endpoints work**

Run: `npm run start:b` — test CRUD for app pages, data sources, variables.

- [ ] **Step 2: Verify frontend compiles with no broken imports**

Run: `npm run start:f` — verify clean compile.

- [ ] **Step 3: Verify AppPage viewer renders widgets through runtime**

Navigate to an AppPage, verify widgets load data and render correctly.

- [ ] **Step 4: Test inter-widget communication**

Create a page with two widgets. Add an event handler on Widget A that sets a variable. Verify Widget B's config referencing that variable updates.

- [ ] **Step 5: Final commit**

```bash
git add -A && git commit -m "feat: complete AppPage Runtime Phase 1 implementation"
```
