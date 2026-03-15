// src/index.js
import { WIDGET_TYPES } from "@jet-admin/widget-types";

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
export {
  BaseWidgetBuilder,
  TableWidgetBuilder,
  VegaWidgetBuilder,
  WIDGET_PROCESSORS_MAP,
  processWorkflowDataForWidget,
  registerWidgetProcessor
};
//# sourceMappingURL=index.mjs.map
