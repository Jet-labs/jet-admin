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
  processWorkflowDataForWidget: () => processWorkflowDataForWidget,
  registerWidgetProcessor: () => registerWidgetProcessor
});
module.exports = __toCommonJS(index_exports);
var import_widget_types = require("@jet-admin/widget-types");

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
    const totalRows = typeof widgetConfig.pagination?.totalTemplate === "number" ? widgetConfig.pagination.totalTemplate : data.length;
    return {
      data,
      columns: widgetConfig.columns || [],
      pagination: {
        enabled: widgetConfig.pagination?.enabled || false,
        pageParam: widgetConfig.pagination?.pageParam || "page",
        pageSizeParam: widgetConfig.pagination?.pageSizeParam || "limit",
        totalRows
      }
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BaseWidgetBuilder,
  TableWidgetBuilder,
  VegaWidgetBuilder,
  WIDGET_PROCESSORS_MAP,
  processWorkflowDataForWidget,
  registerWidgetProcessor
});
//# sourceMappingURL=index.cjs.map
