# Widget Data Binding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-query/workflow data source binding with widget-type-specific mapping to the widget editor and dashboard runtime.

**Architecture:** Each widget type declares a data manifest in `widgets-logic` and ships a custom mapping editor in `widgets-ui`. The generic editor provides a unified data sources picker (queries + workflows with args). At runtime, `DashboardWidget` executes bound sources, normalizes results, and delegates to the widget builder's `mapQueryResults()`.

**Tech Stack:** React, Formik, @tanstack/react-query, existing `@jet-admin/*` packages

**Spec:** `docs/superpowers/specs/2026-04-26-widget-data-binding-design.md`

---

### Task 1: `getByPath` Utility (`widgets-logic`)

**Files:**
- Create: `packages/widgets-logic/src/core/utils.js`
- Modify: `packages/widgets-logic/src/index.js`

- [ ] **Step 1: Create `getByPath` utility**

Create `packages/widgets-logic/src/core/utils.js`:

```js
/**
 * Safely resolve a dot-notated path against an object.
 * Handles bracket notation: "arr[0].name" → "arr.0.name"
 * @param {object} obj - Root object
 * @param {string} path - Dot-notated path like "orders.data[0].name"
 * @returns {*} Resolved value or undefined
 */
export const getByPath = (obj, path) => {
  if (!obj || !path) return undefined;
  const normalized = path.replace(/\[(\d+)\]/g, '.$1');
  const parts = normalized.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
};
```

- [ ] **Step 2: Export from index**

In `packages/widgets-logic/src/index.js`, add after existing exports (line 14):

```js
export { getByPath } from './core/utils';
```

- [ ] **Step 3: Commit**

```bash
git add packages/widgets-logic/src/core/utils.js packages/widgets-logic/src/index.js
git commit -m "feat(widgets-logic): add getByPath utility for data mapping"
```

---

### Task 2: Data Manifests & `mapQueryResults` on Builders (`widgets-logic`)

**Files:**
- Modify: `packages/widgets-logic/src/core/baseWidgetBuilder.js`
- Modify: `packages/widgets-logic/src/table/builder.js`
- Modify: `packages/widgets-logic/src/vega/builder.js`

- [ ] **Step 1: Add defaults to `BaseWidgetBuilder`**

In `packages/widgets-logic/src/core/baseWidgetBuilder.js`, add after `buildRender` method (after line 20):

```js
  /**
   * Declares what data inputs this widget type expects.
   * Subclasses should override this static getter.
   */
  static get dataManifest() {
    return {
      supportsMultipleQueries: false,
      inputs: [],
    };
  }

  /**
   * Transform bound query results using the mapping config into widget-ready data.
   * @param {object} queryResults - Normalized results: { alias: resultData }
   * @param {object} mappingConfig - Widget-type-specific mapping config
   * @returns {object} Widget-ready data
   */
  mapQueryResults(queryResults, mappingConfig) {
    return queryResults;
  }
```

- [ ] **Step 2: Add manifest & mapping to `TableWidgetBuilder`**

In `packages/widgets-logic/src/table/builder.js`, add import at top:

```js
import { getByPath } from '../core/utils';
```

Add after `buildRender` method (after line 45), before the closing `}` of the class:

```js
  static get dataManifest() {
    return {
      supportsMultipleQueries: false,
      inputs: [
        { name: 'dataArray', type: 'array', required: true, description: 'Array of row objects' },
        { name: 'totalCount', type: 'scalar', required: false, description: 'Total rows for pagination' },
      ],
    };
  }

  mapQueryResults(queryResults, mappingConfig) {
    if (!mappingConfig) return { dataArray: [], totalCount: 0 };
    return {
      dataArray: getByPath(queryResults, mappingConfig.dataArrayPath) || [],
      totalCount: getByPath(queryResults, mappingConfig.totalCountPath) || 0,
    };
  }
```

- [ ] **Step 3: Add manifest & mapping to `VegaWidgetBuilder`**

In `packages/widgets-logic/src/vega/builder.js`, add import at top:

```js
import { getByPath } from '../core/utils';
```

Add after `buildRender` method (after line 38), before the closing `}` of the class:

```js
  static get dataManifest() {
    return {
      supportsMultipleQueries: true,
      dynamicInputs: true,
      inputs: [
        { name: 'default', type: 'array', required: true, description: 'Primary data source' },
      ],
    };
  }

  mapQueryResults(queryResults, mappingConfig) {
    if (!mappingConfig?.dataSources) return { vegaData: {} };
    const vegaData = {};
    for (const [vegaName, path] of Object.entries(mappingConfig.dataSources)) {
      vegaData[vegaName] = getByPath(queryResults, path) || [];
    }
    return { vegaData };
  }
```

- [ ] **Step 4: Commit**

```bash
git add packages/widgets-logic/src/
git commit -m "feat(widgets-logic): add dataManifest and mapQueryResults to all builders"
```

---

### Task 3: `TableDataMappingEditor` (`widgets-ui`)

**Files:**
- Create: `packages/widgets-ui/src/table/tableDataMappingEditor.jsx`

- [ ] **Step 1: Create the component**

Create `packages/widgets-ui/src/table/tableDataMappingEditor.jsx`. This editor lets users map query result paths to the table's `dataArray` and `totalCount` inputs. It should:

- Accept props: `{ widgetEditorForm, dataManifest, queryResults, boundDataSources }`
- Discover array paths from `queryResults` using the same `collectArrayPaths` algorithm already in `tableConfigEditor.jsx` (lines 11-32)
- Discover scalar paths using `collectScalarPaths` (lines 37-53)
- Show a `Select` dropdown for `dataMapping.dataArrayPath` populated from discovered array paths
- Show a `Select` dropdown for `dataMapping.totalCountPath` populated from discovered scalar paths
- Show a fallback `Input` for manual template entry when no `queryResults` are available
- Show an info message prompting "Test Run" when no results exist
- Write selected values to `widgetEditorForm.setFieldValue('widgetConfig.dataMapping.dataArrayPath', val)` and similar for `totalCountPath`

The component reuses the existing `collectArrayPaths` and `collectScalarPaths` helper functions — extract them from `tableConfigEditor.jsx` into a shared location or duplicate them in this file.

Use the same UI patterns (Label, Select, Input from `@jet-admin/ui`) as the existing `tableConfigEditor.jsx`.

- [ ] **Step 2: Commit**

```bash
git add packages/widgets-ui/src/table/tableDataMappingEditor.jsx
git commit -m "feat(widgets-ui): add TableDataMappingEditor component"
```

---

### Task 4: `VegaDataMappingEditor` (`widgets-ui`)

**Files:**
- Create: `packages/widgets-ui/src/vega/vegaDataMappingEditor.jsx`

- [ ] **Step 1: Create the component**

Create `packages/widgets-ui/src/vega/vegaDataMappingEditor.jsx`. This editor lets users create named data source bindings for Vega specs. It should:

- Accept props: `{ widgetEditorForm, dataManifest, queryResults, boundDataSources }`
- Show a list of named data source mappings stored at `widgetConfig.dataMapping.dataSources` (object: `{ vegaDataName: "alias.path" }`)
- Each entry: a text input for the Vega data source name + a path picker (select or text input) for the query result path
- "Add Data Source Mapping" button to add new entries
- Remove button per entry
- When `queryResults` is available, discover array paths for the path picker dropdown
- Write to `widgetEditorForm.setFieldValue('widgetConfig.dataMapping.dataSources', {...})`

Use the same UI patterns as `tableConfigEditor.jsx`.

- [ ] **Step 2: Commit**

```bash
git add packages/widgets-ui/src/vega/vegaDataMappingEditor.jsx
git commit -m "feat(widgets-ui): add VegaDataMappingEditor component"
```

---

### Task 5: Register `dataMappingEditor` in `WIDGETS_MAP`

**Files:**
- Modify: `packages/widgets-ui/src/widget.map.js`

- [ ] **Step 1: Add imports and `dataMappingEditor` entries**

In `packages/widgets-ui/src/widget.map.js`:

Add imports after line 7:
```js
import { TableDataMappingEditor } from "./table/tableDataMappingEditor";
import { VegaDataMappingEditor } from "./vega/vegaDataMappingEditor";
```

Add `dataMappingEditor` property to each widget entry:
- `'vega-lite'` entry (after `configEditor: VegaConfigEditor,` on line 43): add `dataMappingEditor: VegaDataMappingEditor,`
- `'vega'` entry (after `configEditor: VegaConfigEditor,` on line 67): add `dataMappingEditor: VegaDataMappingEditor,`
- `'button'` entry (after `configEditor: ButtonConfigEditor,` on line 91): add `dataMappingEditor: null,`
- `'table'` entry (after `configEditor: TableConfigEditor,` on line 113): add `dataMappingEditor: TableDataMappingEditor,`

- [ ] **Step 2: Commit**

```bash
git add packages/widgets-ui/src/widget.map.js
git commit -m "feat(widgets-ui): register dataMappingEditor in WIDGETS_MAP"
```

---

### Task 6: Refactor `TableConfigEditor` — Remove Data Source Selection

**Files:**
- Modify: `packages/widgets-ui/src/table/tableConfigEditor.jsx`

- [ ] **Step 1: Remove data source selection section**

The "Data Array Source" section (lines 185-248) should be removed from `TableConfigEditor` since it's now handled by `TableDataMappingEditor`.

Also remove the `collectArrayPaths` (lines 11-32) and `collectScalarPaths` (lines 37-53) functions if they were duplicated into the mapping editor, or keep them if the mapping editor imports them.

Remove `workflowContext`, `workflows`, `selectedWorkflow` from the component props since data source selection is now in the Data tab.

The `TableConfigEditor` should keep: Columns section, Pagination section, Workflow Input Arguments section (if still relevant for pagination arg mapping).

The component should receive `queryResults` as a prop instead of `workflowContext`, and use it for the auto-detect columns feature (`currentArrayInfo`).

- [ ] **Step 2: Commit**

```bash
git add packages/widgets-ui/src/table/tableConfigEditor.jsx
git commit -m "refactor(widgets-ui): remove data source selection from TableConfigEditor"
```

---

### Task 7: `DataSourcesEditor` — Generic Data Sources Component

**Files:**
- Create: `apps/frontend/src/presentation/components/widgetComponents/dataSourcesEditor.jsx`

- [ ] **Step 1: Create the component**

Create `apps/frontend/src/presentation/components/widgetComponents/dataSourcesEditor.jsx`.

This is the generic data sources editor that lives in the "Data" tab. It should:

- Accept props: `{ widgetEditorForm, dataQueries, workflows, queryResults, onTestRun, isTestRunning }`
- Read `widgetEditorForm.values.widgetConfig.dataSources || []`
- For each data source entry, render:
  - **Type selector**: Select with options "Data Query" (value: `query`) and "Workflow" (value: `workflow`)
  - **Source picker**: If type is `query`, show dropdown of `dataQueries` (value: `dataQueryID`, label: `dataQueryTitle`). If type is `workflow`, show dropdown of `workflows` (value: `workflowID`, label: `title`)
  - **Alias input**: Text input, auto-generated from source name on selection, user-editable
  - **Input Arguments section**: When a source is selected, detect available args:
    - For queries: read `dataQueryOptions.args` from the selected query object
    - For workflows: read `workflowInputSchema` or `workflowOptions` from the selected workflow
    - Render each arg as a labeled Input field, values stored at `dataSources[i].inputArgValues[argName]`
  - **Remove button**: Removes the entry from the array
- "Add Data Source" button: appends `{ type: 'query', queryID: '', alias: '', inputArgValues: {} }`
- "Test Run" button: calls `onTestRun()` prop, shows spinner when `isTestRunning`
- Write all changes via `widgetEditorForm.setFieldValue('widgetConfig.dataSources', [...])`

Use the same UI components (Button, Input, Label, Select, etc.) from `@jet-admin/ui`.

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/presentation/components/widgetComponents/dataSourcesEditor.jsx
git commit -m "feat(frontend): add generic DataSourcesEditor component"
```

---

### Task 8: Update `WidgetConfigEditor` — 3-Tab Layout with Data Tab

**Files:**
- Modify: `apps/frontend/src/presentation/components/widgetComponents/widgetConfigEditor.jsx`

- [ ] **Step 1: Add Data tab and wire components**

Modify `widgetConfigEditor.jsx` to:

1. Import new components:
   ```js
   import { DataSourcesEditor } from "./dataSourcesEditor";
   import { useWidgetsState } from "../../../logic/contexts/widgetsContext";
   import { useDataQueriesState } from "../../../logic/contexts/dataQueriesContext";
   import { WIDGET_PROCESSORS_MAP } from "@jet-admin/widgets-logic";
   ```

2. Inside the component, add state and context:
   ```js
   const { workflows } = useWidgetsState();
   const { dataQueries } = useDataQueriesState();
   const [queryResults, setQueryResults] = useState(null);
   const [isTestRunning, setIsTestRunning] = useState(false);
   ```

3. Add a `handleTestRun` callback that:
   - Reads `widgetEditorForm.values.widgetConfig.dataSources`
   - For each source with `type: 'query'`: calls `testDataQueryByIDAPI({ tenantID, dataQueryID: source.queryID, inputArgs: source.inputArgValues })`
   - Collects results into `{ [alias]: result }` and calls `setQueryResults(results)`
   - Sets `isTestRunning` during execution

4. Change tabs from 2 to 3: `grid-cols-2` → `grid-cols-3`, add "Data" tab before "Properties":
   ```jsx
   <TabsList className="w-full grid grid-cols-3">
     <TabsTrigger value="data" className="text-xs">Data</TabsTrigger>
     <TabsTrigger value="properties" className="text-xs">Properties</TabsTrigger>
     <TabsTrigger value="events" className="text-xs">Events</TabsTrigger>
   </TabsList>
   ```

5. Add `TabsContent` for "data" tab:
   ```jsx
   <TabsContent value="data" className="mt-3 space-y-3">
     <DataSourcesEditor
       widgetEditorForm={widgetEditorForm}
       dataQueries={dataQueries || []}
       workflows={workflows || []}
       queryResults={queryResults}
       onTestRun={handleTestRun}
       isTestRunning={isTestRunning}
     />
     {DataMappingEditorComponent && (
       <DataMappingEditorComponent
         widgetEditorForm={widgetEditorForm}
         dataManifest={builder?.constructor?.dataManifest}
         queryResults={queryResults}
         boundDataSources={widgetEditorForm.values.widgetConfig?.dataSources || []}
       />
     )}
   </TabsContent>
   ```

6. Pass `queryResults` to `ConfigEditorComponent` in the Properties tab so auto-detect features still work.

7. Change `defaultValue` on `<Tabs>` from `"properties"` to `"data"`.

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/presentation/components/widgetComponents/widgetConfigEditor.jsx
git commit -m "feat(frontend): add Data tab to WidgetConfigEditor with 3-tab layout"
```

---

### Task 9: Runtime Data Source Execution in `DashboardWidget`

**Files:**
- Modify: `apps/frontend/src/presentation/components/dashboardComponents/dashboardWidget.jsx`

- [ ] **Step 1: Add data source execution pipeline**

Modify `dashboardWidget.jsx` to:

1. Import:
   ```js
   import { testDataQueryByIDAPI } from "../../../data/apis/dataQuery";
   import { WIDGET_PROCESSORS_MAP } from "@jet-admin/widgets-logic";
   ```

2. Add a new `useEffect` + state for executing bound data sources:
   ```js
   const [dataSourceResults, setDataSourceResults] = useState(null);
   ```

3. Add a `useEffect` that runs after `widget` is loaded:
   - Reads `widget.widgetConfig?.dataSources`
   - If empty/undefined, skip (legacy path)
   - For each source with `type: 'query'`: call `testDataQueryByIDAPI` with the source's `queryID` and `inputArgValues`
   - Collect all results into `{ [alias]: result }`
   - Call `setDataSourceResults(results)`

4. Add a `useMemo` that runs `mapQueryResults`:
   ```js
   const mappedData = useMemo(() => {
     if (!dataSourceResults || !widget?.widgetConfig?.dataMapping) return null;
     const builder = WIDGET_PROCESSORS_MAP[widget.widgetType];
     if (!builder?.mapQueryResults) return null;
     return builder.mapQueryResults(dataSourceResults, widget.widgetConfig.dataMapping);
   }, [dataSourceResults, widget]);
   ```

5. Enrich the `stateTree` passed to `resolveConfig` with `dataSourceResults`:
   ```js
   const enrichedStateTree = useMemo(() => ({
     ...stateTree,
     ...(dataSourceResults || {}),
   }), [stateTree, dataSourceResults]);
   ```

6. Use `enrichedStateTree` instead of `stateTree` in the `resolveConfig` call.

- [ ] **Step 2: Commit**

```bash
git add apps/frontend/src/presentation/components/dashboardComponents/dashboardWidget.jsx
git commit -m "feat(frontend): add data source execution pipeline to DashboardWidget"
```

---

### Task 10: Manual Integration Test

- [ ] **Step 1: Test the widget editor**

1. Start dev server: `npm run dev`
2. Navigate to a widget editor page
3. Verify the 3-tab layout appears: Data | Properties | Events
4. In the Data tab:
   - Add a data source (pick a Data Query)
   - Set an alias
   - Configure input args if the query has any
   - Click "Test Run" — verify results appear
5. In the Data Mapping section (below sources):
   - For a table widget: pick a data array path and total count path
   - For a vega widget: add named data source bindings
6. Switch to Properties tab — verify config editor works without data source controls
7. Save the widget

- [ ] **Step 2: Test the dashboard**

1. Navigate to a dashboard containing the edited widget
2. Verify the widget loads and displays data from the bound queries
3. Test refresh button
4. Test a widget with NO `dataSources` (legacy) — verify it still works

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: integration test fixes for widget data binding"
```
