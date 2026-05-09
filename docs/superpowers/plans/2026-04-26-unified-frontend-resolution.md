# Unified Frontend Resolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the frontend `evaluationEngine` the single point of `{{ }}` template resolution, strip all UI-processing logic from the backend, and clean up naming inconsistencies in the widgets-logic contract.

**Architecture:** The backend WebSocket bridge becomes a dumb data pipe that only tracks connections and emits raw workflow context. The `widgets-logic` builders receive fully-resolved data (no templates). The parameter name `queryResults` is renamed to `dataSourceResults` throughout the contract to reflect that it carries both query and workflow results.

**Tech Stack:** Node.js backend (Express + Socket.IO), React frontend, shared `@jet-admin/widgets-logic` package (Rollup-bundled).

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `apps/backend/modules/widget/widgetWorkflowBridge.js` | Remove `processContextForWidget`, `resolveTemplate` import, and all `processedData` emission |
| Modify | `apps/backend/modules/widget/widget.socket.controller.js` | Stop passing widget config to bridge, remove `processedData` from replay |
| Modify | `packages/widgets-logic/src/core/baseWidgetBuilder.js` | Rename `queryResults` to `dataSourceResults` in `resolveData` |
| Modify | `packages/widgets-logic/src/vega/builder.js` | Remove manual `{{ }}` parsing from `resolveData`, rename param |
| Modify | `packages/widgets-logic/src/table/builder.js` | Add `resolveData` override, remove stale backend comments, rename param |
| Modify | `packages/widgets-logic/src/index.js` | Rename `queryResults` to `dataSourceResults` in `resolveWidgetData` |
| Modify | `apps/frontend/src/presentation/components/dashboardComponents/dashboardWidget.jsx` | Rename `queryResults` key to `dataSourceResults` in `resolveWidgetData` call |
| Modify | `apps/frontend/src/presentation/components/widgetComponents/widgetPreview.jsx` | Rename `queryResults` prop/param to `dataSourceResults` |
| Modify | `apps/frontend/src/presentation/components/widgetComponents/widgetConfigEditor.jsx` | Rename `queryResults` / `onQueryResults` to `dataSourceResults` / `onDataSourceResults` |

---

### Task 1: Strip UI-Processing from Backend Bridge

**Files:**
- Modify: `apps/backend/modules/widget/widgetWorkflowBridge.js`

- [ ] **Step 1: Remove the `resolveTemplate` import and `processContextForWidget` method**

Open `apps/backend/modules/widget/widgetWorkflowBridge.js`.

Remove the import on line 12:
```diff
-const { resolveTemplate } = require("../../utils/templateEngine/resolver");
```

Delete the entire `processContextForWidget` method (lines 173-211). This is the method that resolves `{{ctx.*}}` templates and calls `processWorkflowDataForWidget`.

- [ ] **Step 2: Remove `processedData` from `emitContextUpdate`**

In the `emitContextUpdate` method, remove the per-widget processing block and emit raw context only. Replace lines 242-269 with:

```javascript
    for (const widgetID of widgets) {
      socketIO.to(`widget:${widgetID}`).emit('widget_context_update', {
        widgetID,
        instanceID,
        update,
        timestamp: new Date().toISOString(),
      });
    }
```

- [ ] **Step 3: Remove `processedData` from `emitWorkflowStatus`**

In the `emitWorkflowStatus` method, remove the per-widget processing block. Replace lines 288-310 with:

```javascript
    for (const widgetID of widgets) {
      socketIO.to(`widget:${widgetID}`).emit('widget_workflow_status', {
        widgetID,
        instanceID,
        status,
        finalContext,
        timestamp: new Date().toISOString(),
      });
    }
```

- [ ] **Step 4: Remove the `processWorkflowDataForWidget` import**

Remove the import on line 11:
```diff
-const { processWorkflowDataForWidget } = require('@jet-admin/widgets-logic');
```

- [ ] **Step 5: Simplify `registerWidget` -- stop storing widget config**

In the `registerWidget` method, the bridge no longer needs `widgetType`, `widgetConfig`, or `workflowConfig` since it does not process data anymore. Update the `widgetConnections.set` call (lines 45-54) to:

```javascript
    widgetConnections.set(widgetID, {
      instanceID,
      socketId: socket.id,
      status: 'connected',
      connectedAt: new Date().toISOString(),
      ...metadata,
    });
```

Remove `updateWidgetConfig` method (lines 85-94) entirely -- it only existed to update widget config for server-side processing.

- [ ] **Step 6: Simplify `getStats` -- remove `hasWidgetConfig`**

In the `getStats` method, remove `widgetType` and `hasWidgetConfig` from the connection map (lines 344-346):

```javascript
      connections: Array.from(widgetConnections.entries()).map(([widgetID, conn]) => ({
        widgetID,
        instanceID: conn.instanceID,
        status: conn.status,
        connectedAt: conn.connectedAt,
      })),
```

- [ ] **Step 7: Commit**

```bash
git add apps/backend/modules/widget/widgetWorkflowBridge.js
git commit -m "refactor(backend): strip UI-processing from widgetWorkflowBridge - backend now emits raw context only"
```

---

### Task 2: Simplify Socket Controller

**Files:**
- Modify: `apps/backend/modules/widget/widget.socket.controller.js`

- [ ] **Step 1: Simplify `onWidgetWorkflowConnect` -- remove widget config from bridge registration**

In the `execute` case (lines 95-103), simplify the `registerWidget` call:

```javascript
          widgetWorkflowBridge.registerWidget(widgetID, responseInstanceID, socket, {
            workflowID,
            mode,
            tenantID,
            firebaseID,
          });
```

Do the same for the `subscribe` case registration (lines 197-205):

```javascript
      widgetWorkflowBridge.registerWidget(widgetID, responseInstanceID, socket, {
        workflowID,
        mode,
        tenantID,
        firebaseID,
      });
```

- [ ] **Step 2: Remove `processedData` from replay mode**

In the `replay` case (lines 164-183), remove the `processContextForWidget` call and `processedData` from the emit. Replace with:

```javascript
          // Emit raw context -- frontend handles all resolution
          socket.emit('widget_workflow_connected', {
            widgetID,
            instanceID: responseInstanceID,
            workflowID: replayInstance.workflowID,
            mode: 'replay',
            initialContext,
            workflowStatus: replayInstance.status,
          });
```

- [ ] **Step 3: Remove unused parameters from the method signature**

In `onWidgetWorkflowConnect` (lines 53-66), remove `widgetType`, `widgetConfig`, and `workflowConfig` from the destructured params and the log on line 69:

```javascript
  async onWidgetWorkflowConnect({ 
    socket, 
    widgetID, 
    workflowID, 
    mode = 'execute', 
    inputArgs = {}, 
    instanceID = null,
    tenantID,
    firebaseID,
  }) {
    Logger.log('info', {
      message: 'widgetSocketController:onWidgetWorkflowConnect',
      params: { widgetID, workflowID, mode, tenantID },
    });
```

- [ ] **Step 4: Commit**

```bash
git add apps/backend/modules/widget/widget.socket.controller.js
git commit -m "refactor(backend): simplify socket controller - remove widget config forwarding and processedData"
```

---

### Task 3: Rename Contract in `baseWidgetBuilder.js`

**Files:**
- Modify: `packages/widgets-logic/src/core/baseWidgetBuilder.js`

- [ ] **Step 1: Rename `queryResults` to `dataSourceResults` in `resolveData`**

Update the `resolveData` method (lines 59-68):

```javascript
  /**
   * Resolve the data prop for the widget component from widgetConfig + dataSourceResults.
   * 
   * This is the STANDARD entry point called by the rendering layer (WidgetPreview,
   * DashboardWidget) to get the data to pass to the widget component.
   * Each widget type implements its own resolution logic.
   *
   * @param {object} widgetConfig - The full widget configuration
   * @param {object|null} dataSourceResults - Executed data source results: { alias: data }
   * @returns {any} Data ready for the widget component's `data` prop, or null
   */
  resolveData(widgetConfig, dataSourceResults) {
    // Default: use dataMapping.dataArrayPath to resolve from dataSourceResults
    if (!dataSourceResults || !widgetConfig?.dataMapping?.dataArrayPath) return null;
    const resolved = getByPath(dataSourceResults, widgetConfig.dataMapping.dataArrayPath);
    if (Array.isArray(resolved)) return resolved;
    if (resolved && typeof resolved === 'object' && Array.isArray(resolved.data)) {
      return resolved.data;
    }
    return null;
  }
```

- [ ] **Step 2: Rename `queryResults` to `dataSourceResults` in `mapQueryResults`**

Update the method (lines 44-46):

```javascript
  /**
   * Transform bound data source results using the mapping config into widget-ready data.
   * Subclasses should override this method.
   *
   * @param {object} dataSourceResults - Normalized results: { alias: resultData }
   * @param {object} mappingConfig - Widget-type-specific mapping config
   * @returns {object} Widget-ready data
   */
  mapQueryResults(dataSourceResults, mappingConfig) {
    return dataSourceResults;
  }
```

- [ ] **Step 3: Commit**

```bash
git add packages/widgets-logic/src/core/baseWidgetBuilder.js
git commit -m "refactor(widgets-logic): rename queryResults to dataSourceResults in BaseWidgetBuilder contract"
```

---

### Task 4: Clean Vega Builder -- Remove Template Parsing

**Files:**
- Modify: `packages/widgets-logic/src/vega/builder.js`

- [ ] **Step 1: Replace `resolveData` with a clean implementation**

The current `resolveData` (lines 74-98) manually parses `{{ }}` templates. This is now the frontend evaluationEngine's job. By the time data reaches here, `spec.data.values` will already be an actual array (not a template string). Replace with:

```javascript
  /**
   * Resolve the data prop for VegaWidget from widgetConfig + dataSourceResults.
   * Expects that all template expressions have already been resolved by the
   * frontend evaluationEngine before reaching this method.
   *
   * @param {object} widgetConfig - The full widget configuration (already resolved)
   * @param {object|null} dataSourceResults - Executed data source results
   * @returns {object|null} Complete Vega spec with data, or null
   */
  resolveData(widgetConfig, dataSourceResults) {
    if (!widgetConfig?.vegaSpec) return null;

    // Clone spec to avoid mutating form/config state
    const spec = JSON.parse(JSON.stringify(widgetConfig.vegaSpec));

    // If data.values is already a resolved array, use it directly
    // (evaluationEngine has already replaced "{{alias}}" with actual data)
    if (spec.data?.values && !Array.isArray(spec.data.values)) {
      // If it is still a string after resolution, it was not a valid template -- clear it
      if (typeof spec.data.values === 'string') {
        spec.data = { values: [] };
      }
    }

    return spec;
  }
```

- [ ] **Step 2: Rename param in `mapQueryResults`**

Update lines 57-64:

```javascript
  /**
   * Map normalized data source results to vega-ready named data sources.
   * @param {object} dataSourceResults - { alias: resultData }
   * @param {object} mappingConfig - { dataSources: { vegaName: "alias.path" } }
   * @returns {object} { vegaData: { name: [...] } }
   */
  mapQueryResults(dataSourceResults, mappingConfig) {
    if (!mappingConfig?.dataSources) return { vegaData: {} };
    const vegaData = {};
    for (const [vegaName, path] of Object.entries(mappingConfig.dataSources)) {
      vegaData[vegaName] = getByPath(dataSourceResults, path) || [];
    }
    return { vegaData };
  }
```

- [ ] **Step 3: Commit**

```bash
git add packages/widgets-logic/src/vega/builder.js
git commit -m "refactor(widgets-logic): remove template parsing from VegaWidgetBuilder.resolveData"
```

---

### Task 5: Fix Table Builder -- Add `resolveData`, Clean Comments

**Files:**
- Modify: `packages/widgets-logic/src/table/builder.js`

- [ ] **Step 1: Remove stale backend comments from `buildRender`**

Update lines 24-28 and 30-33 to remove comments that reference "The backend template resolver":

```javascript
    // Extract the data array from the resolved config
    const data = Array.isArray(widgetConfig.dataArrayTemplate)
      ? widgetConfig.dataArrayTemplate
      : [];

    // Extract total rows from pagination config
    const totalRows = typeof widgetConfig.pagination?.totalTemplate === 'number'
      ? widgetConfig.pagination.totalTemplate
      : data.length;
```

- [ ] **Step 2: Add a `resolveData` override**

The table builder currently has no `resolveData`, so it falls through to `BaseWidgetBuilder.resolveData` which uses `dataMapping.dataArrayPath`. Add an explicit override after the `buildRender` method (after line 46):

```javascript
  /**
   * Resolve the data prop for TableWidget from widgetConfig + dataSourceResults.
   * Expects all template expressions to be resolved by the evaluationEngine.
   *
   * @param {object} widgetConfig - The full widget configuration (already resolved)
   * @param {object|null} dataSourceResults - Executed data source results
   * @returns {Array|null} Array of row objects for the table, or null
   */
  resolveData(widgetConfig, dataSourceResults) {
    if (!dataSourceResults || !widgetConfig?.dataMapping?.dataArrayPath) return null;
    const resolved = getByPath(dataSourceResults, widgetConfig.dataMapping.dataArrayPath);
    if (Array.isArray(resolved)) return resolved;
    if (resolved && typeof resolved === 'object' && Array.isArray(resolved.data)) {
      return resolved.data;
    }
    return null;
  }
```

- [ ] **Step 3: Rename param in `mapQueryResults`**

Update lines 64-69:

```javascript
  /**
   * Map normalized data source results to table-ready data.
   * @param {object} dataSourceResults - { alias: resultData }
   * @param {object} mappingConfig - { dataArrayPath, totalCountPath }
   * @returns {object} { dataArray, totalCount }
   */
  mapQueryResults(dataSourceResults, mappingConfig) {
    if (!mappingConfig) return { dataArray: [], totalCount: 0 };
    return {
      dataArray: getByPath(dataSourceResults, mappingConfig.dataArrayPath) || [],
      totalCount: getByPath(dataSourceResults, mappingConfig.totalCountPath) || 0,
    };
  }
```

- [ ] **Step 4: Commit**

```bash
git add packages/widgets-logic/src/table/builder.js
git commit -m "refactor(widgets-logic): add resolveData to TableWidgetBuilder, clean stale comments"
```

---

### Task 6: Update Package Entry Point

**Files:**
- Modify: `packages/widgets-logic/src/index.js`

- [ ] **Step 1: Rename `queryResults` to `dataSourceResults` in `resolveWidgetData`**

Update lines 68-77:

```javascript
/**
 * Resolve the data prop for a widget component from widgetConfig + dataSourceResults.
 * 
 * This is the STANDARD entry point for all rendering layers (WidgetPreview,
 * DashboardWidget). It delegates to the widget type's builder.resolveData()
 * method, so no widget-type-specific conditionals are needed in the UI layer.
 *
 * @param {object} params
 * @param {string} params.widgetType - Widget type identifier
 * @param {object} params.widgetConfig - The full widget configuration
 * @param {object|null} params.dataSourceResults - Executed data source results
 * @returns {any} Data ready for the widget component's `data` prop, or null
 */
export const resolveWidgetData = ({ widgetType, widgetConfig, dataSourceResults }) => {
  if (!dataSourceResults || !widgetConfig) return null;

  const processor = WIDGET_PROCESSORS_MAP[widgetType];
  if (processor && typeof processor.resolveData === 'function') {
    return processor.resolveData(widgetConfig, dataSourceResults);
  }

  return null;
};
```

- [ ] **Step 2: Commit**

```bash
git add packages/widgets-logic/src/index.js
git commit -m "refactor(widgets-logic): rename queryResults to dataSourceResults in resolveWidgetData"
```

---

### Task 7: Rebuild widgets-logic Package

**Files:**
- Build: `packages/widgets-logic`

- [ ] **Step 1: Run the package build**

```bash
cd packages/widgets-logic && npm run build
```

This regenerates `dist/index.cjs` and `dist/index.mjs` with the updated code.

- [ ] **Step 2: Verify the build output contains the new parameter name**

```bash
grep -c "dataSourceResults" packages/widgets-logic/dist/index.cjs
```

Expected: at least 3 matches (one per builder + entry point).

- [ ] **Step 3: Commit build output**

```bash
git add packages/widgets-logic/dist/
git commit -m "build(widgets-logic): rebuild dist with unified resolution changes"
```

---

### Task 8: Update Frontend Rendering Consumers

**Files:**
- Modify: `apps/frontend/src/presentation/components/dashboardComponents/dashboardWidget.jsx`
- Modify: `apps/frontend/src/presentation/components/widgetComponents/widgetPreview.jsx`

- [ ] **Step 1: Update `dashboardWidget.jsx` -- rename in `resolveWidgetData` call**

On lines 218-222, rename the `queryResults` key to `dataSourceResults`:

```javascript
          const widgetData = resolveWidgetData({
            widgetType: widgetRender.widgetType,
            widgetConfig: resolvedConfig,
            dataSourceResults: dataSourceResults,
          });
```

- [ ] **Step 2: Update `widgetPreview.jsx` -- rename prop and usage**

On lines 21 and 34, rename the prop from `queryResults` to `dataSourceResults`:

```diff
-  queryResults,
+  dataSourceResults,
```

On lines 69-75, update the `resolveWidgetData` call:

```javascript
    if (!chartData && dataSourceResults) {
      chartData = resolveWidgetData({
        widgetType: resolvedType,
        widgetConfig,
        dataSourceResults,
      });
    }
```

On lines 95-96, update the debug info:

```javascript
    dataSourceResults: dataSourceResults ? Object.keys(dataSourceResults) : null,
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/presentation/components/dashboardComponents/dashboardWidget.jsx
git add apps/frontend/src/presentation/components/widgetComponents/widgetPreview.jsx
git commit -m "refactor(frontend): rename queryResults to dataSourceResults in widget rendering components"
```

---

### Task 9: Update Widget Config Editor

**Files:**
- Modify: `apps/frontend/src/presentation/components/widgetComponents/widgetConfigEditor.jsx`

- [ ] **Step 1: Rename props and internal references**

On lines 81-83, rename the props:

```diff
-  queryResults,
-  onQueryResults,
+  dataSourceResults,
+  onDataSourceResults,
```

Update all internal references throughout the file:
- Line 118: `onQueryResults?.(results)` becomes `onDataSourceResults?.(results)`
- Line 132: `onQueryResults?.(results)` becomes `onDataSourceResults?.(results)`
- Line 122: dependency array `onQueryResults` becomes `onDataSourceResults`
- Line 136: dependency array `onQueryResults` becomes `onDataSourceResults`
- Lines 213, 223, 234: `queryResults` becomes `dataSourceResults`

- [ ] **Step 2: Find and update the parent component that passes these props**

Search for `onQueryResults` in the parent of `WidgetConfigEditor` and rename there too. This is likely in a widget editor page component.

```bash
grep -rn "onQueryResults" apps/frontend/src/
```

Update all callers to use the new prop names.

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/presentation/components/widgetComponents/
git commit -m "refactor(frontend): rename queryResults/onQueryResults to dataSourceResults/onDataSourceResults in editor"
```

---

### Task 10: Verify Everything Works

- [ ] **Step 1: Start backend and frontend**

```bash
npm run start:b
npm run start:f
```

- [ ] **Step 2: Verify widget editor -- create/edit a widget with a data query**

Open the widget editor, bind a data query, click test run, confirm the preview renders data correctly.

- [ ] **Step 3: Verify dashboard -- confirm existing widgets render**

Open a dashboard with existing widgets, confirm they load and display data.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "refactor: unified frontend resolution - backend is now UI-agnostic, single resolution point in evaluationEngine"
```
