# App Page & Widget System — Complete Architecture Analysis

## 1. Project Structure & Backend vs Frontend

| Layer | Package | What it does |
|--------|---------|--------------|
| **Backend (storage)** | `apps/backend` | Express.js + Prisma/PostgreSQL. Stores/retrieves `appPageConfig` as an opaque JSON blob. Does NOT interpret widgets, layouts, or data sources. |
| **Frontend (runtime)** | `apps/frontend` | Vite/React SPA. All interpretation, evaluation, rendering, and event handling happens here. |
| **Widget types** | `packages/widget-types` | Pure metadata: widget type names, event definitions, method signatures, categories. No JSX. |
| **Widget UI** | `packages/widgets-ui` | React components for each widget + `WIDGETS_MAP` registry + config editors. Browser-only. |
| **Widget logic** | `packages/widgets-logic` | Data builders/processors that transform config + query results into the `data` prop each widget receives. Pure JS, runs in both Node and browser. |
| **Template engine** | `packages/template-engine` | Mustache parser, tokenizer, path resolver — the core `resolveConfig`, `getValueByPath`, `evaluateExpression` engine. |

### Other Packages

| Package | Role |
|---------|------|
| `ui` | Shared UI primitives (shadcn/Radix) — Card, Button, Tabs, etc. |
| `datasource-types` | 34 datasource type configs (form schemas, icons) |
| `datasources-logic` | Datasource query execution logic |
| `datasources-ui` | Datasource form UI components |
| `json-forms-renderers` | JSON Forms renderer customizations |
| `workflow-nodes` | Workflow node type definitions |
| `workflow-edges` | Workflow edge type definitions |
| `mcp-server` | MCP server (sparse) |

---

## 2. Backend: Database & API

### Database Schema (`apps/backend/prisma/schema.prisma`)

```
model tblAppPages {
  appPageID          String   @id @default(gen_random_uuid())
  appPageTitle       String
  appPageConfig      Json?    // ← THE KEY FIELD: everything lives here
  tenantID           String
  creatorID          String?
  ...
}
```

The entire page definition — widgets, layout, data sources, variables, events — is stored in `appPageConfig` as a single JSON blob. The backend just persists and retrieves it.

### REST API (`apps/backend/modules/appPage/appPage.v1.routes.js`)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/v1/tenants/:tid/app-pages` | List all |
| `POST` | `/api/v1/tenants/:tid/app-pages` | Create |
| `GET` | `/api/v1/tenants/:tid/app-pages/:pid` | Get by ID (fetches full config) |
| `POST` | `/api/v1/tenants/:tid/app-pages/:pid/clone` | Clone |
| `PATCH` | `/api/v1/tenants/:tid/app-pages/:pid` | Update config |
| `DELETE` | `/api/v1/tenants/:tid/app-pages/:pid` | Delete |

The backend has **zero knowledge** of widgets, expressions, events, or data flow. It's a dumb JSON store.

---

## 3. The `appPageConfig` JSON Shape

```jsonc
{
  "layoutVersion": 2,

  // V2 TREE LAYOUT (primary)
  "layout": {
    "id": "root",
    "type": "column",
    "children": [
      {
        "id": "row_abc",
        "type": "row",
        "gap": 8,
        "children": [
          {
            "id": "node_def",
            "type": "widget",
            "widgetKey": "widget_<uuid>",
            "span": 6,            // 1-12 column grid
            "sizing": "fill"      // "auto" | "fill" | "fixed"
          },
          {
            "id": "container_ghi",
            "type": "container",
            "span": 6,
            "children": { "type": "column", "children": [...] }
          }
        ]
      }
    ]
  },

  // V1 LEGACY LAYOUT (auto-migrated to V2)
  "layouts": { "lg": [...], "md": [...], "sm": [...] },

  // Widget instance list (matching layout order)
  "widgets": ["widget_uuid1", "widget_uuid2"],

  // Page-level data sources
  "dataSources": [
    {
      "alias": "get_users",           // unique ID for {{ state.queries.get_users }}
      "type": "query",                // "query" | "workflow"
      "queryID": "<uuid>",
      "triggerMode": "auto",         // "auto" | "reactive" | "manual"
      "refreshOn": ["variables.department"],  // reactive dependencies
      "refetchInterval": 30,         // polling seconds (0 = no polling)
      "inputArgs": { "limit": 100 }  // passed to query/workflow
    }
  ],

  // Page-level variables
  "variables": [
    { "key": "selectedUserId", "defaultValue": null },
    { "key": "department", "defaultValue": "Engineering" }
  ]
}
```

---

## 4. `/logic/appPageRuntime/` — Complete File Map

| File | Role |
|------|------|
| **`index.js`** | Barrel export — public API |
| **`AppPageRuntimeProvider.jsx`** | React Context provider. Creates `useReducer` + 3 contexts (State, Dispatch, Meta). Builds state tree via `useMemo`. |
| **`appPageReducer.js`** | Pure reducer. All state mutations: `INIT`, `SET_VARIABLE`, `SET_QUERY_RESULT`, `SET_WORKFLOW_RESULT`, `SET_WIDGET_STATE`, `REGISTER_WIDGET_METHODS`, `UNREGISTER_WIDGET`, `SET_LISTENER_DATA`. |
| **`appPageActions.js`** | Action type enum + action creator functions (`init()`, `setVariable()`, `setQueryResult()`, etc.) |
| **`appPageExpressionEngine.js`** | Re-exports `evaluationEngine` + adds `buildAppPageStateTree()` (constructs the tree from reducer state), `getChangedPaths()` (diff between prev/next trees), `getAffectedWidgets()` (which widgets depend on changed paths) |
| **`useAppPageStateTree.js`** | Hook: reads `stateTree` from `AppPageStateContext` |
| **`useAppPageDispatch.js`** | Hook: reads `dispatch` from `AppPageDispatchContext` |
| **`useAppPageVariables.js`** | Hook: `{ variables, setVariable }` for page-level scratch state |
| **`useAppPageQueries.js`** | Hook: returns `stateTree.queries` |
| **`useAppPageWorkflows.js`** | Hook: returns `stateTree.workflows` |
| **`useWidgetState.js`** | Hook: per-widget UI state (`{ widgetState, setWidgetState }`). Reads/writes `state.widgets[widgetID]`. |
| **`useWidgetMethodRegistry.js`** | Hook: registers widget methods into `state.widgetMethods[widgetID]`, auto-cleans on unmount via `UNREGISTER_WIDGET`. |
| **`useWidgetEventHandlers.js`** | Hook: reads widget event config, returns `fireWidgetEvent()` that executes action chains (SET_VARIABLE, EXECUTE_QUERY, CALL_WIDGET_METHOD, SHOW_TOAST). |
| **`useAppPageDataSourceManager.js`** | Hook: orchestrates ALL data source lifecycle — auto-execute on mount, reactive re-fetch when dependencies change, polling via `setInterval`, manual trigger, request deduplication. |
| **`executeWorkflowWithStreaming.js`** | Fire-and-forget utility: executes workflow REST call → gets `instanceID` → subscribes to socket.io room → dispatches progressive context updates → finalizes on COMPLETED/FAILED. |

### Sibling files in `/logic/`

| File | Role |
|------|------|
| **`evaluationEngine.js`** | Mustache expression resolution: `resolveConfig()`, `resolveValue()`, `evaluateExpression()`, `extractDependencies()`. Enforces `allowedRoots: ["state"]`. |
| **`executionStreamService.js`** | Singleton class managing socket.io subscriptions for workflow execution. **Writes to the old Zustand `useRuntimeStore`**, not the new reducer. |

---

## 5. `evaluationEngine.js` — The Expression Evaluator

**Location:** `apps/frontend/src/logic/evaluationEngine.js` (166 lines)

This is the core that resolves all `{{ }}` mustache expressions. It delegates to `@jet-admin/template-engine` (`packages/template-engine/src/`).

### Exports

| Export | What it does |
|--------|-------------|
| `resolveConfig(config, stateTree)` | Deep-walks any object, resolving ALL `{{ }}` expressions in all string values. Called on widget configs and action configs. |
| `resolveValue(value, stateTree)` | Resolves a single value. If it's a string, processes templates. If not, returns as-is. |
| `evaluateExpression(expression, stateTree)` | Resolves a single path expression like `"state.queries.get_users.data[0].name"` by walking the state tree. |
| `extractDependencies(config)` | Scans config for all `{{ }}` expressions, extracts dependency paths like `"queries.get_users"`, returns deduplicated array. Used for reactive change detection. |

### Template Engine Package (`packages/template-engine/src/`)

| Module | Purpose |
|--------|---------|
| `resolver.js` | `resolveTemplate` — recursive resolver for strings/objects/arrays. Dispatches based on runtime type. |
| `tokenizer.js` | `tokenizeObjectPath`, `getValueByPath` — dot/bracket path → token array → value walk. Enforces `allowedRoots`. |
| `parsers.js` | `extractTemplateBlocks` (`/{{([\s\S]+?)}}/g`), `extractWholeTemplateExpression` (`/^{{([\s\S]+?)}}$/`) |
| `validator.js` | Not used by `evaluationEngine.js` — for backend `ctx.` prefix validation. |

### How `resolveConfig` Works

Recursively walks objects/arrays. When it hits a string, checks for `{{ }}`:

- **Whole-template string** (entire string is `{{ expr }}`): Returns the **actual value** with type preserved. `"{{ state.queries.users.data }}"` → the real array.
- **Mixed string**: Interpolates. `"Hello {{ state.variables.name }}"` → `"Hello Alice"`. All values coerced to string (undefined/null → empty string).
- **Non-string values** (numbers, booleans, null): Passed through untouched.

### How `evaluateExpression` Works

Path: `"state.queries.get_users.data[0].name"`

1. `normalizePath` strips the `"state."` prefix → `"queries.get_users.data[0].name"`
2. `tokenizeObjectPath` breaks into tokens: `["queries", "get_users", "data", 0, "name"]`
3. Walks the state tree token-by-token: `stateTree[queries][get_users][data][0][name]`
4. If any token hits `undefined`/`null`, returns `undefined`.
5. Security: `__proto__`, `prototype`, `constructor` tokens are blocked.

### `allowedRoots` Enforcement

Hardcoded to `["state"]`. Every expression MUST start with `state.`:
- `"state.queries.foo"` ✅ → resolves
- `"queries.foo"` ❌ → silently returns `undefined`
- `"ctx.something"` ❌ → silently returns `undefined`

### `extractDependencies` Strategy

Scans recursively, finds all `{{ }}` blocks, extracts the **top-level dependency**:
- `"{{ state.queries.get_users.data }}"` → dependency `"queries.get_users"`
- `"{{ state.variables.department }}"` → dependency `"variables.department"`
- Returns `["queries.get_users", "variables.department"]`

These are matched against `getChangedPaths()` for reactive re-execution.

### Error Handling

**Silent fallback everywhere.** No exceptions thrown, no logging. Failed expressions produce `undefined` or empty string. This mirrors Retool/Appsmith behavior — dashboards shouldn't crash on bad expressions.

---

## 6. `executionStreamService.js` — Workflow Streaming (Legacy)

A **singleton class** separate from the AppPage runtime:

- Maintains `this.activeSockets` map keyed by `instanceID`
- `subscribe(instanceID, workflowID)`: Creates socket.io connection, emits `"workflow_run_join"` to join the room
- Listens for `"workflow_node_update"` — per-node progress updates
- Listens for `"workflow_status_update"` — terminal (COMPLETED/FAILED), injects `contextData` into the old Zustand `useRuntimeStore`

**Important:** This writes to the **old** Zustand store. The newer `executeWorkflowWithStreaming.js` in the appPageRuntime folder dispatches to the new reducer instead.

---

## 7. The State Tree — Single Source of Truth

Built by `buildAppPageStateTree()` (in `appPageExpressionEngine.js`), recalculated via `useMemo` in the provider on every reducer state change:

```js
stateTree = {
  queries: {
    get_users:     { data: [...], isLoading: false, error: null, lastUpdated: 1700000 },
    get_orders:    { data: [...], isLoading: true,  error: null, lastUpdated: 0 }
  },
  workflows: {
    my_flow:       { data: {...}, isLoading: false, error: null, instanceID: "..." }
  },
  widgets: {
    "widget_abc":  { selectedRowIndex: 0, selectedRow: {...}, searchTerm: "" },
    "widget_def":  { isOpen: true }
  },
  widgetMethods: {
    "widget_abc":  { refresh: fn, setSelectedRow: fn },
    "modal_widget": { open: fn, close: fn }
  },
  variables: {
    selectedUserID: "user_123",
    department: "Engineering",
    skip: 0,
    limit: 10
  },
  listeners: {
    webhook_1:     { data: {...}, lastUpdated: 1700000 }
  },
  globals: {
    tenantID: "...",
    pageID: "...",
    currentUser: {...}
  },
  event: {                    // ← ONLY exists during event chain execution
    type: "onClick",
    widgetID: "widget_abc",
    args: [{ id: 1, name: "Alice" }],
    inputArgs: { optionalParam: "hello" }
  }
}
```

The `state.` prefix is mandatory in all mustache expressions. The tokenizer strips it before path traversal.

---

## 8. Complete Data Lifecycle (From Load to Widget Render)

```
STEP 1: AppPageViewer mounts
   ├── React Query fetches appPage via getAppPageByIDAPI(tenantID, appPageID)
   ├── migrateV1ToV2(appPageConfig) — converts V1 flat layout to V2 tree layout
   └── Renders <AppPageRuntimeProvider pageConfig={migrated}>

STEP 2: AppPageRuntimeProvider initializes
   ├── useReducer(appPageReducer, createAppPageInitialState)
   │   → { queryResults:{}, workflowResults:{}, widgetStates:{},
   │       widgetMethods:{}, variables:{}, listenerData:{}, globals:{} }
   ├── dispatch(appPageActions.init(variableDefinitions, globals))
   │   → Sets defaults for all variables defined in page config
   └── Builds stateTree via buildAppPageStateTree() in useMemo

STEP 3: AppPageDataSourceBootstrapper mounts
   └── useAppPageDataSourceManager(dataSources, stateTree, dispatch, meta)
       ├── Filters "auto" and "reactive" triggerMode sources
       ├── For each: executeDataSource(ds)
       │   ├── resolveConfig(inputArgs, stateTree)  // resolves {{ }} in args
       │   ├── Bails if any arg is undefined/null (reactive will retry)
       │   ├── For queries:
       │   │   ├── dispatch(setQueryLoading(alias))
       │   │   ├── await runDataQueryByIDAPI({ tenantID, queryID, inputArgs })
       │   │   └── dispatch(setQueryResult(alias, { data, error }))
       │   └── For workflows:
       │       └── executeWorkflowWithStreaming({ dispatch, ... })
       │           ├── await executeWorkflowAPI() → gets instanceID
       │           ├── dispatch(setWorkflowResult(alias, runRes, null, true, instanceID))
       │           ├── socket.emit("workflow_run_join", { runId: instanceID })
       │           ├── On workflow_node_update → dispatch progressive context
       │           └── On workflow_status_update → dispatch final, disconnect
       └── Polling: setInterval for sources with refetchInterval > 0

STEP 4: State tree updates → re-render triggers
   └── getChangedPaths(prevTree, newTree) detects which namespaces changed
       └── Reactive sources with matching refreshOn paths → re-execute

STEP 5: LayoutRenderer traverses the layout tree
   └── For each WidgetNode: calls renderWidget(widgetKey, sizing)
       └── AppPageWidgetSlot(widgetKey)

STEP 6: AppPageWidgetSlot (per widget)
   ├── React Query: getWidgetByIDAPI(tenantID, widgetID) → { widgetType, widgetConfig, ... }
   ├── resolveConfig(widget.widgetConfig, stateTree)
   │   → Substitutes all {{ state.queries.X.data }} with actual values
   │   → Structural equality guard: same JSON = same reference (prevents React.memo bypass)
   ├── resolveWidgetData(widgetType, resolvedConfig, stateTreeQueries)
   │   → Dispatches to builder (TableWidgetBuilder, VegaWidgetBuilder)
   │   → Transforms config + query results into structured `data` prop
   ├── Registers widget methods via handleOnWidgetInit → REGISTER_WIDGET_METHODS
   ├── Fires onLoad event (once, via onLoadFiredRef)
   ├── Creates runtimeEventHandlers: { onClick, onRowSelect, onSubmit, ... }
   │   → Each maps to fireWidgetEvent(eventType, args)
   └── Renders <MemoizedWidgetContent>
       └── <RenderedWidgetComponent
             data={structuredData}
             widgetConfig={resolvedConfig}
             onClick={runtimeEventHandlers.onClick}
             onRowSelect={runtimeEventHandlers.onRowSelect}
             widgetState={localState}
             setWidgetState={setLocalState}
             refreshData={refetch}
             fireWidgetEvent={fireWidgetEvent}
             onWidgetInit={handleOnWidgetInit}
           />
```

---

## 9. Data Source Execution: Queries vs Workflows

| Aspect | Query | Workflow |
|--------|-------|----------|
| **Execution** | Single REST call → synchronous result | REST call → `instanceID` → socket.io room subscription |
| **Loading state** | `SET_QUERY_LOADING` → `SET_QUERY_RESULT` | `SET_WORKFLOW_RESULT(isLoading=true)` → progressive `SET_WORKFLOW_RESULT` updates → final `SET_WORKFLOW_RESULT(isLoading=false)` |
| **State location** | `state.queries.{alias}` | `state.workflows.{alias}` |
| **Result shape** | `{ data, error, isLoading, lastUpdated }` | `{ data, error, isLoading, instanceID, lastUpdated }` |
| **Streaming** | No streaming | Yes — per-node progress via websocket, context data accumulates as nodes complete |

### Reactive Re-execution

```js
useEffect(() => {
  const changedPaths = getChangedPaths(prevTree, stateTree);
  // changedPaths = ["variables.department", "queries.get_users"]

  for (const ds of reactiveSources) {
    const shouldRefresh = ds.refreshOn.some(path => changedPaths.includes(path));
    if (shouldRefresh) {
      executeDataSource(ds);  // re-fires with current (already updated) stateTree
    }
  }
}, [stateTree]);
```

When a user clicks a button that sets `state.variables.department`, the reducer updates the variable → state tree changes → `getChangedPaths` detects `"variables.department"` changed → any data source with `refreshOn: ["variables.department"]` re-executes with the new variable value resolved in its `inputArgs`.

### Request Deduplication

```js
const requestID = ++requestCounterRef.current[alias];
// ... await API call ...
if (requestCounterRef.current[alias] === requestID) {
  // Only dispatch if this is still the latest request
  dispatch(setQueryResult(alias, result));
}
```

If a reactive source re-fires while the previous call is in-flight, stale results are discarded.

### Early Bail on Unresolved Args

```js
const hasUnresolved = Object.values(resolvedInputArgs).some(v => v === undefined || v === null);
if (hasUnresolved) return null; // Wait for reactive system to re-trigger when variables are set
```

Prevents queries like `SELECT * FROM users OFFSET null LIMIT null`.

### Workflow Streaming Pipeline

```
executeWorkflowAPI(tenantID, workflowID, inputArgs)
  │
  ├→ Returns { instanceID, runData }
  ├→ dispatch(setWorkflowResult(alias, runData, null, true, instanceID))
  │   → isLoading: true, widgets show loading state
  │
  ├→ socket.emit("workflow_run_join", { runId: instanceID })
  │
  ├→ Listens for "workflow_node_update"
  │   → Each node completion pushes to contextData
  │   → dispatch(setWorkflowResult(alias, { data: updatedContext }, null, true))
  │   → Widgets re-render with progressive data (still isLoading)
  │
  └→ Listens for "workflow_status_update" (COMPLETED | FAILED)
      → dispatch(setWorkflowResult(alias, finalData, null, false))
      → socket.disconnect()
      → Widgets show final result
```

---

## 10. Event Handling & Chaining

### Event Configuration

Events are stored in the widget config as an **ordered array of actions** per event type:

```json
{
  "events": {
    "onClick": [
      {
        "actionType": "SET_VARIABLE",
        "config": {
          "key": "state.variables.selectedId",
          "value": "{{ state.event.args[0].id }}"
        }
      },
      {
        "actionType": "EXECUTE_QUERY",
        "config": {
          "alias": "get_user_details",
          "inputArgs": { "userId": "{{ state.variables.selectedId }}" }
        }
      },
      {
        "actionType": "CALL_WIDGET_METHOD",
        "config": {
          "targetWidgetID": "widget_details_panel",
          "methodName": "refresh"
        }
      },
      {
        "actionType": "SHOW_TOAST",
        "config": { "message": "User details loaded!", "variant": "success" }
      }
    ]
  }
}
```

### `fireWidgetEvent` — The Event Execution Engine

```js
const fireWidgetEvent = async (eventType, eventArgs = {}) => {
  const actions = widgetConfig.events[eventType];
  if (!actions?.length) return [];

  // Augment state tree with event context
  const eventStateTree = {
    ...currentStateTree,
    event: { type: eventType, widgetID, ...eventArgs }
  };

  const results = [];
  for (const action of actions) {
    // resolveConfig resolves {{ }} in action config against event-augmented tree
    const result = await executeAppPageAction(action, eventStateTree, dispatch, meta);
    results.push({ actionType: action.actionType, success: true, result });
  }
  return results;
};
```

**Key behaviors:**
- **Sequential execution**: `for...await` — each action completes before the next starts.
- **Same snapshot**: `eventStateTree` is captured once and passed to ALL actions. Action N+1 does NOT see state changes from Action N within the same chain.
- **Event context**: `state.event` is injected into the tree, letting actions reference `{{ state.event.args[0].id }}`, `{{ state.event.type }}`, etc.
- **Resolution timing**: Each action's config is `resolveConfig(rawConfig, eventStateTree)` RIGHT before execution, so `{{ }}` expressions resolve against the snapshot with event context available.

### Action Types

#### SET_VARIABLE

```js
case "SET_VARIABLE": {
    const variableKey = config.key.replace(/^state\.variables\./, "");
    dispatch(appPageActions.setVariable(variableKey, config.value));
    return { key: variableKey, value: config.value };
}
```

Strips `state.variables.` prefix, dispatches to reducer. This is synchronous — the dispatch updates React state immediately but the next action in the chain still sees the original snapshot.

#### EXECUTE_QUERY

```js
case "EXECUTE_QUERY": {
    // Merge input args: dataSource defaults → action config → event-level overrides
    const mergedInputArgs = { ...ds.inputArgs, ...config.inputArgs, ...eventInputArgs };
    const resolvedInputArgs = resolveConfig(mergedInputArgs, stateTree);

    if (isWorkflow) {
        const { disconnect } = executeWorkflowWithStreaming({ ... });
        activeWorkflowDisconnectors[alias] = disconnect;
    } else {
        dispatch(appPageActions.setQueryLoading(alias));
        const result = await runDataQueryByIDAPI({ ... });
        dispatch(appPageActions.setQueryResult(alias, result));
    }
}
```

Input arg merging priority: `event.inputArgs` > `action.config.inputArgs` > `dataSource.inputArgs`.

#### CALL_WIDGET_METHOD

```js
case "CALL_WIDGET_METHOD": {
    const widgetMethods = stateTree.widgetMethods?.[targetWidgetID];
    const method = widgetMethods[methodName];
    return method(...args);
}
```

Direct in-memory function call — no events, no pub/sub, no serialization. The target widget registered real function references.

#### SHOW_TOAST

```js
case "SHOW_TOAST": {
    if (variant === "error") displayError(message);
    else displaySuccess(message);
}
```

---

## 11. Inter-Widget Method Calling

### Registration Side (Target Widget)

```js
// In AppPageWidgetSlot:
const { registerWidgetMethods } = useWidgetMethodRegistry(widgetID);

// Widgets call this on init with their exposed methods:
const handleOnWidgetInit = (widgetView) => {
  registerWidgetMethods(widgetView);
};
// Dispatches: REGISTER_WIDGET_METHODS { widgetID, methods }
// Stored as: state.widgetMethods[widgetID] = { open, close, refresh, setSelectedRow, ... }
```

### Calling Side (Source Widget's Event)

Event config: `{ actionType: "CALL_WIDGET_METHOD", config: { targetWidgetID: "modal_123", methodName: "open", args: [] } }`

In `executeAppPageAction`, the method is looked up from `stateTree.widgetMethods[targetWidgetID]` and called directly with resolved args.

### Cleanup

On widget unmount, `useWidgetMethodRegistry` dispatches `UNREGISTER_WIDGET` which removes both `widgetMethods[widgetID]` and `widgetStates[widgetID]`.

---

## 12. Widget Scope Management

Each widget gets **scoped state** via `useWidgetState(widgetID)`:

```js
// In AppPageWidgetSlot:
const { widgetState, setWidgetState } = useWidgetState(widgetID);

// This reads: stateTree.widgets[widgetID] || {}
// And dispatches: appPageActions.setWidgetState(widgetID, updates)
```

The state tree has separate namespaces per widget: `state.widgets.{widgetID}`. When a widget sets its local state (e.g., `selectedRow`, `isOpen`, `pageIndex`), it goes to `widgetStates[widgetID]` in the reducer. Other widgets can reference it as `{{ state.widgets.my_table.selectedRow }}`.

On unmount, `useWidgetMethodRegistry` dispatches `UNREGISTER_WIDGET`, which cleans up both `widgetMethods` and `widgetStates` for that widgetID.

---

## 13. Data Resolution: Who Does It & When

### Resolution Pipeline Summary

```
Raw widget config from API
   │
   ├─ [AppPageWidgetSlot] resolveConfig(widgetConfig, stateTree)
   │     → resolvedConfig (all {{}} in widget config resolved)
   │     → passed to widget as `widgetConfig` prop
   │     → Happens BEFORE sending to widget
   │
   ├─ [MemoizedWidgetContent] resolveWidgetData(widgetType, resolvedConfig, stateTreeQueries)
   │     → data (builder-transformed, type-specific)
   │     → passed to widget as `data` prop
   │     → Happens BEFORE sending to widget
   │
   └─ [fireWidgetEvent → executeAppPageAction] resolveConfig(actionConfig, eventStateTree)
         → per-action config resolution
         → Happens INSIDE action execution, with event context
         → Happens BEFORE each action runs
```

**Key rule:** All `{{ }}` expressions are resolved BEFORE data reaches the widget. Widgets never see raw mustache templates — they receive fully resolved configs and structured data. The resolution happens in:
1. `AppPageWidgetSlot` — for widget config
2. `MemoizedWidgetContent` — for widget data (builder transform)
3. `executeAppPageAction` — for event action configs
4. `executeDataSource` — for data source inputArgs

---

## 14. Widget Render Performance Optimizations

### Structural Equality Guard (in AppPageWidgetSlot)

```js
const resolvedConfig = useMemo(() => {
    const resolved = resolveConfig(widget.widgetConfig, stateTree);
    const key = JSON.stringify(resolved);
    if (key === resolvedConfigKeyRef.current) return resolvedConfigRef.current;
    resolvedConfigKeyRef.current = key;
    resolvedConfigRef.current = resolved;
    return resolved;
}, [widget?.widgetConfig, stateTree]);
```

Compares JSON.stringify of resolved config to a cached key. If identical, returns the previous reference so React.memo on the child isn't bypassed by new object identity.

### React.memo on Widget Content

```jsx
const MemoizedWidgetContent = React.memo(({ ... }) => {
    const widgetData = useMemo(() => {
        return resolveWidgetData({ widgetType, widgetConfig: resolvedConfig, dataSourceResults: stateTreeQueries });
    }, [widgetType, resolvedConfig, stateTreeQueries]);
    // ...
    return <RenderedWidgetComponent data={widgetData} ... />
});
```

Double-guard (ref comparison + React.memo + useMemo) ensures maximum stability and prevents render loops.

---

## 15. Widget System: Registration & Categories

### Widget Types (`packages/widget-types/src/index.js`)

```js
export const WIDGET_TYPES = {
  VEGA_LITE: { name: "Vega-Lite Chart", value: "vega-lite" },
  TABLE:     { name: "Data Table", value: "table" },
  BUTTON:    { name: "Button", value: "button" },
  TEXT:      { name: "Text / Markdown", value: "text" },
  STAT:      { name: "Stat / KPI", value: "stat" },
  ALERT:     { name: "Alert Banner", value: "alert" },
  FORM:      { name: "Form", value: "form" },
  IMAGE:     { name: "Image", value: "image" },
  IFRAME:    { name: "IFrame Embed", value: "iframe" },
  DATE_PICKER:       { name: "Date / Time Picker", value: "date-picker" },
  DATE_RANGE_PICKER: { name: "Date Range Picker", value: "date-range-picker" },
  VEGA:      { name: "Vega Chart", value: "vega" },
};
```

### WIDGETS_MAP (`packages/widgets-ui/src/widget.map.js`)

```js
export const WIDGETS_MAP = {
  'table': {
    label: "Data Table",
    component: ({ data, ...props }) => <React.Suspense>...</React.Suspense>,
    configEditor: TableConfigEditor,
    icon: ({ className }) => <Table />,
    sampleConfig: { columns: [], pagination: { enabled: false } }
  },
  'button': { ... },
  // ... all 12 widget types
};
```

Each widget directory contains:
- `<Type>Widget` — The rendered React component
- `<Type>ConfigEditor` — The property panel form for configuring the widget

### Widget Data Builders (`packages/widgets-logic/src/index.js`)

```js
export const WIDGET_PROCESSORS_MAP = {
  'vega-lite': new VegaWidgetBuilder(),
  'vega':      new VegaWidgetBuilder(),
  'table':     new TableWidgetBuilder(),
};
```

#### TableWidgetBuilder

- `buildRender`: Extracts `data` from `widgetConfig.dataArrayTemplate`, `columns`, `pagination` with fallback chain
- `resolveData`: Delegates to `buildRender` — widget receives full `{ data, columns, pagination, ... }` as `data` prop
- `mapQueryResults`: Navigates query results via `dataArrayPath` and `totalCountPath`

#### VegaWidgetBuilder

- `buildRender`: Wraps `widgetConfig.vegaSpec` with standard Vega defaults (`width: 'container'`, `autosize`)
- `resolveData`: Deep-clones spec, validates `data.values` — if non-array string after template resolution, clears to `{ values: [] }`
- `mapQueryResults`: Maps multiple data sources to Vega named data sets

### Widget Events Per Type

```js
export const WIDGET_EVENT_TYPES = {
  COMMON: [
    { value: "onClick", label: "On Click" },
    { value: "onRefresh", label: "On Refresh" },
    { value: "onLoad", label: "On Load" },
  ],
  table: [
    { value: "onRowSelect" },
    { value: "onPageChange" },
    { value: "onRowSave" },
    { value: "onBulkEdit" },
    { value: "onBulkDelete" },
    { value: "onExport" },
    { value: "onBulkAction" },
    { value: "onSearch" },
  ],
  button: [{ value: "onSubmit" }],
  form: [{ value: "onSubmit" }, { value: "onFieldChange" }],
  // ... etc per widget type
};
```

### Widget Methods Per Type

```js
export const WIDGET_METHODS = {
  table: [
    { name: "refresh" },
    { name: "setSelectedRow" },
    { name: "clearSelection" }
  ],
  "vega-lite": [
    { name: "refresh" },
    { name: "resize" }
  ],
  button: [{ name: "click" }],
};
```

---

## 16. Widget Concrete Examples

### TableWidget

**Props consumed:**
- `widgetConfig` (resolved): `columns`, `pagination`, `search`, `export`, `editing`, `multiSelect`, `bulkEdit`, `isLoading`
- `data` (structured from builder): `{ data: [], columns: [], pagination: { enabled, totalRows }, ... }`
- `widgetState` / `setWidgetState`: `selectedRowIndex`, `selectedRow`, `searchTerm`, `selectedRowIndices`, `pendingEdits`

**Methods registered:** `refresh`, `setSelectedRow`, `clearSelection`

**Events fired:** `onSearch`, `onPageChange`, `onRowSave`, `onBulkEdit`, `onBulkDelete`, `onBulkExport`, `onBulkAction`, `onExport`, `onRowSelect`

### ButtonWidget

Simplest widget. Props: `widgetConfig.text`, `variant`, `size`, `onClick` (bridged to `fireWidgetEvent("onClick")`), `isLoadingWorkflows`.

### FormWidget

Events: `onFieldChange` (`{ field, value, formData }`), `onSubmit` (`{ formData }`).

---

## 17. Layout Rendering System

### Layout Tree Node Types

```js
ColumnNode     → type: "column", children: RowNode[]
  RowNode      → type: "row", children: (WidgetNode | ContainerNode | StackNode)[], gap
    WidgetNode → type: "widget", widgetKey, span (1-12), sizing (auto/fill/fixed)
    ContainerNode → type: "container", span, sizing, children: ColumnNode, style
    StackNode  → type: "stack", direction (horizontal/vertical), span, sizing, wrap, gap, align, children
```

### LayoutRenderer.jsx — Recursive Traversal

```
column    → <div className="layout-column"> + map children through LayoutRenderer
row       → <LayoutRow> (CSS Grid, 12-column) + map children
widget    → <LayoutWidgetSlot> (terminal — calls renderWidget(widgetKey, sizing))
container → <LayoutContainer> (card-like wrapper) + LayoutRenderer on children
stack     → <LayoutStack> (flexbox wrapper) + map children
```

### Grid System

- 12-column CSS Grid (`grid-template-columns: repeat(12, minmax(0, 1fr))`)
- `.col-span-1` through `.col-span-12`
- Responsive: ≤768px collapses to single column
- Sizing: `auto` (content-driven), `fill` (fills parent), `fixed` (uses `--fixed-height` var)

### Config Migration V1 → V2

```js
const migrateV1ToV2 = (appPageConfig) => {
  if (appPageConfig.layoutVersion === 2) return appPageConfig; // Idempotent

  // Get primary layout (lg > md > sm)
  const primaryLayout = legacyLayouts.lg || legacyLayouts.md || legacyLayouts.sm || [];

  // Sort by Y, group into visual rows based on overlap detection
  // Scale span: rawSpan = Math.round(item.w / 2), clamped 1-12
  // Create WidgetNodes → RowNodes → ColumnNode

  migratedConfig.layout = createColumnNode(rowNodes);
  migratedConfig._legacyLayouts = appPageConfig.layouts; // Preserve original
  return migratedConfig;
};
```

---

## 18. Architecture Diagram

```
                         AppPageViewer
                              │
                   ┌──────────┴──────────┐
                   │  AppPageRuntimeProvider  │  ← useReducer + 3 Contexts
                   └──────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        DataSourceMgr    LayoutRenderer   (children)
        (auto/reactive/   (grid layout)
         polling)
              │               │
              │        AppPageWidgetSlot (×N)
              │               │
              │    ┌──────────┼──────────┐
              │    │          │          │
              │  useWidgetState  useWidgetEventHandlers
              │    │               │
              │  widgetState    fireWidgetEvent()
              │                    │
              └────────────────────┤
                                   │
                        executeAppPageAction()
                        ├── SET_VARIABLE       → reducer
                        ├── EXECUTE_QUERY      → API → reducer
                        ├── CALL_WIDGET_METHOD → stateTree.widgetMethods[X].fn()
                        └── SHOW_TOAST         → notification
                                   │
                        resolveConfig(stateTree)
                        evaluationEngine.js
                        @jet-admin/template-engine
```
