# Widget Data Binding & Mapping Architecture

**Date:** 2026-04-26  
**Status:** Approved  
**Scope:** Multi-query data source binding, widget-type-specific data mapping, unified query/workflow source model

---

## Problem

The widget editor is missing critical data configuration capabilities:

1. **No data binding** — no way to select which Data Queries or Workflows feed data into a widget
2. **No data mappings** — no way to map query result fields to widget-expected fields
3. **No transformations** — no way to transform data before it reaches the widget
4. **Single source only** — no support for binding multiple data sources to a single widget
5. **No input args** — no UI to configure query/workflow input arguments from within the widget editor

## Design Decisions

- **Approach:** Manifest + Editor Pair (Option C) — each widget type declares a data manifest in `widgets-logic` AND ships a custom mapping editor in `widgets-ui`
- **Unified source model:** Both Data Queries and Workflows are treated as data sources with the same shape, differing only in execution method
- **Backward compatible:** Widgets without `dataSources` in their config continue using the existing `stateTree + resolveConfig` flow

---

## 1. Data Manifest & Mapping Functions (`widgets-logic`)

Each `BaseWidgetBuilder` subclass gets two new responsibilities.

### 1.1 `dataManifest` — declares what data the widget expects

Static getter on each builder class. The generic editor reads this to provide structure.

```js
// BaseWidgetBuilder — default (no data needed)
static get dataManifest() {
  return {
    supportsMultipleQueries: false,
    inputs: [],
  };
}
```

**Table:**
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
```

**Vega/Vega-Lite:**
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
```

**Button:**
```js
static get dataManifest() {
  return {
    supportsMultipleQueries: false,
    inputs: [],
  };
}
```

### 1.2 `mapQueryResults()` — pure function transforming query results

```js
// TableWidgetBuilder
mapQueryResults(queryResults, mappingConfig) {
  return {
    dataArray: getByPath(queryResults, mappingConfig.dataArrayPath),
    totalCount: getByPath(queryResults, mappingConfig.totalCountPath),
  };
}

// VegaWidgetBuilder
mapQueryResults(queryResults, mappingConfig) {
  const vegaData = {};
  for (const [vegaName, path] of Object.entries(mappingConfig.dataSources || {})) {
    vegaData[vegaName] = getByPath(queryResults, path);
  }
  return { vegaData };
}
```

### 1.3 Exports

```js
const builder = WIDGET_PROCESSORS_MAP['table'];
const manifest = builder.constructor.dataManifest;
const mappedData = builder.mapQueryResults(queryResults, mappingConfig);
```

New export: `export { getByPath } from './core/utils';`

---

## 2. Widget Config Shape (`widgetConfig` JSON)

```json
{
  "dataSources": [
    { "type": "query", "queryID": "uuid-1", "alias": "orders", "inputArgValues": { "limit": 50 } },
    { "type": "workflow", "workflowID": "uuid-3", "alias": "pipeline", "inputArgValues": { "batch_size": 100 } }
  ],
  "dataMapping": { ... },
  "properties": { ... },
  "events": { ... }
}
```

No database schema changes — `widgetConfig` is already a `Json` column.

---

## 3. `WIDGETS_MAP` Changes (`widgets-ui`)

New `dataMappingEditor` alongside `configEditor`:

- `TableDataMappingEditor` — data array source picker, total count mapping
- `VegaDataMappingEditor` — named data source bindings
- Button — `null` (no data mapping)

`TableConfigEditor` refactored to remove data source selection, keep columns/pagination/appearance only.

---

## 4. Generic Editor (`WidgetConfigEditor`) — 3 Tabs

```
Data | Properties | Events
```

**Data tab:** DataSourcesEditor (generic) + widget-specific DataMappingEditor + Test Run button  
**Properties tab:** widget-specific ConfigEditor + WidgetAdvancedOptions + WidgetPropertiesEditor  
**Events tab:** WidgetEventsEditor (unchanged)

---

## 5. Runtime Data Flow

1. Fetch widget → 2. Execute bound data sources → 3. Normalize context → 4. mapQueryResults() → 5. buildRender() → 6. Render

Backward compatible: widgets without `dataSources` use existing `stateTree + resolveConfig` path.

---

## Files Affected

### New files
| File | Purpose |
|------|---------|
| `widgets-logic/src/core/utils.js` | `getByPath()` utility |
| `widgets-ui/src/table/tableDataMappingEditor.jsx` | Table data mapping editor |
| `widgets-ui/src/vega/vegaDataMappingEditor.jsx` | Vega data mapping editor |
| `frontend/.../widgetComponents/dataSourcesEditor.jsx` | Generic data sources editor |

### Modified files
| File | Change |
|------|--------|
| `widgets-logic/src/core/baseWidgetBuilder.js` | Add `dataManifest` + `mapQueryResults()` |
| `widgets-logic/src/table/builder.js` | Table manifest + mapping |
| `widgets-logic/src/vega/builder.js` | Vega manifest + mapping |
| `widgets-logic/src/index.js` | Export `getByPath` |
| `widgets-ui/src/widget.map.js` | Add `dataMappingEditor` entries |
| `widgets-ui/src/table/tableConfigEditor.jsx` | Remove data source selection |
| `frontend/.../widgetConfigEditor.jsx` | 3-tab layout, Data tab |
| `frontend/.../dashboardWidget.jsx` | Data source execution pipeline |
