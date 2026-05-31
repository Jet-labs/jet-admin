var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  BaseWidgetBuilder: () => BaseWidgetBuilder,
  TableWidgetBuilder: () => TableWidgetBuilder,
  VegaWidgetBuilder: () => VegaWidgetBuilder,
  WIDGET_PROCESSORS_MAP: () => WIDGET_PROCESSORS_MAP,
  getByPath: () => getByPath,
  processWorkflowDataForWidget: () => processWorkflowDataForWidget,
  registerWidgetProcessor: () => registerWidgetProcessor,
  resolveWidgetData: () => resolveWidgetData
});
module.exports = __toCommonJS(index_exports);
var import_widget_types = require("@jet-admin/widget-types");

// src/core/utils.js
var getByPath = (obj, path) => {
  if (!obj || !path) return void 0;
  const normalized = path.replace(/\[(\d+)\]/g, ".$1");
  const parts = normalized.split(".");
  let current = obj;
  for (const part of parts) {
    if (current === void 0 || current === null) return void 0;
    current = current[part];
  }
  return current;
};

// src/core/baseWidgetBuilder.js
var BaseWidgetBuilder = class {
  /**
   * Process the widget configuration and return a renderable object/spec.
   * This method must extract any widget-specific configurations from the generic config blob.
   *
   * @param {object} params
   * @param {string} params.widgetType - The type of the widget
   * @param {object} params.widgetConfig - The configuration object for the widget
   * @returns {any} The finalized, renderable spec/data for the widget
   * @throws {Error} If not implemented by the subclass
   */
  buildRender({ widgetType, widgetConfig }) {
    throw new Error("buildRender method must be implemented by subclasses.");
  }
  /**
   * Declares what data inputs this widget type expects.
   * Subclasses should override this static getter.
   * @returns {object} Data manifest with supportsMultipleQueries, inputs, etc.
   */
  static get dataManifest() {
    return {
      supportsMultipleQueries: false,
      inputs: []
    };
  }
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
    if (!dataSourceResults || !widgetConfig?.dataMapping?.dataArrayPath) return null;
    const resolved = getByPath(dataSourceResults, widgetConfig.dataMapping.dataArrayPath);
    if (Array.isArray(resolved)) return resolved;
    if (resolved && typeof resolved === "object" && Array.isArray(resolved.data)) {
      return resolved.data;
    }
    return null;
  }
};

// src/vega/builder.js
var VegaWidgetBuilder = class extends BaseWidgetBuilder {
  /**
   * Build a complete, renderable Vega/Vega-Lite spec from widgetConfig.
   * 
   * @param {object} params
   * @param {string} params.widgetType - Widget type ('vega-lite' or 'vega')
   * @param {object} params.widgetConfig - The widget config containing vegaSpec
   * @returns {object} Complete Vega spec ready for vega-embed
   */
  buildRender({ widgetType = "vega-lite", widgetConfig }) {
    const vegaSpec = widgetConfig?.vegaSpec;
    if (!vegaSpec) return null;
    const isVegaLite = widgetType !== "vega";
    const schemaUrl = isVegaLite ? "https://vega.github.io/schema/vega-lite/v5.json" : "https://vega.github.io/schema/vega/v5.json";
    const spec = {
      $schema: schemaUrl,
      width: "container",
      height: "container",
      autosize: { type: "fit", contains: "padding" },
      ...vegaSpec
    };
    return spec;
  }
  static get dataManifest() {
    return {
      supportsMultipleQueries: true,
      dynamicInputs: true,
      inputs: [
        { name: "default", type: "array", required: true, description: "Primary data source" }
      ]
    };
  }
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
    const spec = JSON.parse(JSON.stringify(widgetConfig.vegaSpec));
    if (spec.data?.values && !Array.isArray(spec.data.values)) {
      if (typeof spec.data.values === "string") {
        spec.data = { values: [] };
      }
    }
    return spec;
  }
};

// src/table/builder.js
var TableWidgetBuilder = class extends BaseWidgetBuilder {
  /**
   * Build a renderable props object from widgetConfig.
   * 
   * @param {object} params
   * @param {string} params.widgetType - Widget type ('table')
   * @param {object} params.widgetConfig - The resolved widget config
   * @returns {object} Processed props for the TableWidget
   */
  buildRender({ widgetType = "table", widgetConfig }) {
    if (!widgetConfig) return null;
    const data = Array.isArray(widgetConfig.dataArrayTemplate) ? widgetConfig.dataArrayTemplate : [];
    const rawTotal = widgetConfig.pagination?.totalTemplate;
    const parsedTotal = rawTotal != null ? Number(rawTotal) : NaN;
    const totalRows = !isNaN(parsedTotal) && parsedTotal >= 0 ? parsedTotal : data.length;
    return {
      data,
      columns: widgetConfig.columns || [],
      pagination: {
        enabled: widgetConfig.pagination?.enabled || false,
        totalRows
      },
      search: widgetConfig.search || { enabled: false },
      export: widgetConfig.export || { enabled: false },
      editing: widgetConfig.editing || { enabled: false },
      multiSelect: widgetConfig.multiSelect || { enabled: false },
      bulkEdit: widgetConfig.bulkEdit || { enabled: false },
      isLoading: widgetConfig.isLoading
    };
  }
  /**
   * Resolve the data prop for TableWidget from widgetConfig + dataSourceResults.
   * Delegates to buildRender() to return the full structured output including
   * pagination config, columns, and total row count.
   *
   * @param {object} widgetConfig - The full widget configuration (already resolved)
   * @param {object|null} dataSourceResults - Executed data source results
   * @returns {object|null} { data, columns, pagination } for the table, or null
   */
  resolveData(widgetConfig, dataSourceResults) {
    return this.buildRender({ widgetType: "table", widgetConfig });
  }
  static get dataManifest() {
    return {
      supportsMultipleQueries: false,
      inputs: [
        { name: "dataArray", type: "array", required: true, description: "Array of row objects" },
        { name: "totalCount", type: "scalar", required: false, description: "Total rows for pagination" }
      ]
    };
  }
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
      totalCount: getByPath(dataSourceResults, mappingConfig.totalCountPath) || 0
    };
  }
};

// src/index.js
var WIDGET_PROCESSORS_MAP = {
  [import_widget_types.WIDGET_TYPES.VEGA_LITE.value]: new VegaWidgetBuilder(),
  [import_widget_types.WIDGET_TYPES.VEGA.value]: new VegaWidgetBuilder(),
  [import_widget_types.WIDGET_TYPES.TABLE.value]: new TableWidgetBuilder()
};
var registerWidgetProcessor = (widgetType, builderInstance) => {
  WIDGET_PROCESSORS_MAP[widgetType] = builderInstance;
};
var processWorkflowDataForWidget = ({ widgetType, widgetConfig }) => {
  const processor = WIDGET_PROCESSORS_MAP[widgetType];
  if (processor && typeof processor.buildRender === "function") {
    return processor.buildRender({ widgetType, widgetConfig });
  }
  return widgetConfig || null;
};
var resolveWidgetData = ({ widgetType, widgetConfig, dataSourceResults }) => {
  if (!dataSourceResults || !widgetConfig) return null;
  const processor = WIDGET_PROCESSORS_MAP[widgetType];
  if (processor && typeof processor.resolveData === "function") {
    return processor.resolveData(widgetConfig, dataSourceResults);
  }
  return null;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseWidgetBuilder,
  TableWidgetBuilder,
  VegaWidgetBuilder,
  WIDGET_PROCESSORS_MAP,
  getByPath,
  processWorkflowDataForWidget,
  registerWidgetProcessor,
  resolveWidgetData
});
//# sourceMappingURL=index.cjs.map
