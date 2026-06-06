// src/index.js
import { WIDGET_TYPES } from "@jet-admin/widget-types";

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
var VegaWidgetBuilder = class _VegaWidgetBuilder extends BaseWidgetBuilder {
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
   * Safe clone utility that strips out circular references and DOM nodes.
   */
  static safeClone(obj, cache = /* @__PURE__ */ new WeakSet()) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    const isHTMLElement = typeof HTMLElement !== "undefined" && obj instanceof HTMLElement;
    if (isHTMLElement || obj.nodeType || obj._reactRootContainer || obj._reactInternals) {
      return void 0;
    }
    if (cache.has(obj)) {
      return void 0;
    }
    cache.add(obj);
    if (Array.isArray(obj)) {
      const arr = [];
      for (let i = 0; i < obj.length; i++) {
        const val = _VegaWidgetBuilder.safeClone(obj[i], cache);
        if (val !== void 0) arr.push(val);
      }
      return arr;
    }
    const clone = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (key.startsWith("__reactFiber") || key.startsWith("__reactProps")) continue;
        const val = _VegaWidgetBuilder.safeClone(obj[key], cache);
        if (val !== void 0) {
          clone[key] = val;
        }
      }
    }
    return clone;
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
    const spec = _VegaWidgetBuilder.safeClone(widgetConfig.vegaSpec);
    if (!spec) return null;
    const sanitizeSpec = (obj, originalObj) => {
      if (!obj || typeof obj !== "object") return;
      const getFallbackValues = (dataBlock) => {
        const format = dataBlock?.format;
        if (format && typeof format === "object" && format.type === "topojson") {
          const featureName = format.feature || "features";
          return {
            type: "Topology",
            objects: {
              [featureName]: {
                type: "GeometryCollection",
                geometries: []
              }
            }
          };
        }
        return [];
      };
      const processDataBlock = (dataBlock, originalDataBlock) => {
        if (!dataBlock || typeof dataBlock !== "object") return;
        const hasValues = "values" in dataBlock || originalDataBlock && "values" in originalDataBlock;
        if (hasValues) {
          let val = dataBlock.values;
          if (val === void 0 && originalDataBlock) {
            val = originalDataBlock.values;
          }
          const format = dataBlock.format || originalDataBlock?.format;
          const isTopoJSON = format && typeof format === "object" && format.type === "topojson";
          const isValidTopoJSON = isTopoJSON && val && typeof val === "object" && val.objects && typeof val.objects === "object";
          const isValidRegularObject = !isTopoJSON && val && typeof val === "object";
          if (isValidTopoJSON || isValidRegularObject) {
            dataBlock.values = val;
          } else if (typeof val === "string") {
            if (val.includes("{{") || val.trim() === "") {
              dataBlock.values = getFallbackValues(dataBlock);
            } else {
              dataBlock.values = val;
            }
          } else {
            dataBlock.values = getFallbackValues(dataBlock);
          }
        }
      };
      if (obj.data && typeof obj.data === "object") {
        processDataBlock(obj.data, originalObj?.data);
      }
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        const originalVal = originalObj ? originalObj[key] : void 0;
        if (val && typeof val === "object") {
          if (key === "data") {
            processDataBlock(val, originalVal);
            sanitizeSpec(val, originalVal);
          } else {
            sanitizeSpec(val, originalVal);
          }
        }
      }
    };
    sanitizeSpec(spec, widgetConfig.vegaSpec);
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
  [WIDGET_TYPES.VEGA_LITE.value]: new VegaWidgetBuilder(),
  [WIDGET_TYPES.VEGA.value]: new VegaWidgetBuilder(),
  [WIDGET_TYPES.TABLE.value]: new TableWidgetBuilder()
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
export {
  BaseWidgetBuilder,
  TableWidgetBuilder,
  VegaWidgetBuilder,
  WIDGET_PROCESSORS_MAP,
  getByPath,
  processWorkflowDataForWidget,
  registerWidgetProcessor,
  resolveWidgetData
};
//# sourceMappingURL=index.mjs.map
