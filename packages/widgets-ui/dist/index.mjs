var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/vega/index.js
var vega_exports = {};
__export(vega_exports, {
  VegaWidget: () => VegaWidget,
  default: () => vega_default
});
import React, { useEffect, useRef, useState, useCallback } from "react";
import vegaEmbed from "vega-embed";
var VegaWidget, vega_default;
var init_vega = __esm({
  "src/vega/index.js"() {
    VegaWidget = ({
      data,
      // Processed Vega/Vega-Lite spec from processor
      widgetConfig,
      // Widget-level config (showActions, renderer, theme)
      onSignal,
      // Callback for selections/interactions
      onError,
      // Error handler
      onWidgetInit
      // Callback when widget initializes
    }) => {
      const containerRef = useRef(null);
      const viewRef = useRef(null);
      const [error, setError] = useState(null);
      const [loading, setLoading] = useState(true);
      const handleError = useCallback((err) => {
        setError(err.message || "Visualization error");
        setLoading(false);
        onError?.(err);
      }, [onError]);
      useEffect(() => {
        if (!containerRef.current) return;
        if (!data || !data.$schema) {
          setLoading(false);
          setError("No visualization spec provided");
          return;
        }
        const renderChart = async () => {
          try {
            setLoading(true);
            setError(null);
            if (viewRef.current) {
              viewRef.current.finalize();
              viewRef.current = null;
            }
            const embedOptions = {
              actions: widgetConfig?.showActions ?? false,
              renderer: widgetConfig?.renderer ?? "svg",
              theme: widgetConfig?.theme ?? void 0,
              tooltip: { theme: "dark" },
              config: {
                background: "transparent",
                view: { stroke: "transparent" }
              }
            };
            const result = await vegaEmbed(containerRef.current, data, embedOptions);
            viewRef.current = result.view;
            setLoading(false);
            onWidgetInit?.(result.view);
            if (onSignal && data.params) {
              for (const param of data.params) {
                if (param.name) {
                  result.view.addSignalListener(param.name, (name, value) => {
                    onSignal(name, value);
                  });
                }
              }
            }
          } catch (err) {
            handleError(err);
          }
        };
        renderChart();
        return () => {
          if (viewRef.current) {
            viewRef.current.finalize();
            viewRef.current = null;
          }
        };
      }, [data, widgetConfig, onSignal, onWidgetInit, handleError]);
      return /* @__PURE__ */ React.createElement("div", { style: { width: "100%", height: "100%", position: "relative" } }, loading && !error && /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            color: "#94a3b8",
            fontSize: "13px",
            pointerEvents: "none"
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: "rgba(241, 245, 249, 0.9)"
        } }, /* @__PURE__ */ React.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", style: { animation: "spin 1s linear infinite" } }, /* @__PURE__ */ React.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), /* @__PURE__ */ React.createElement("style", null, `@keyframes spin { to { transform: rotate(360deg); } }`), "Loading visualization\u2026")
      ), error && /* @__PURE__ */ React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
            textAlign: "center",
            zIndex: 20,
            pointerEvents: "none"
          }
        },
        /* @__PURE__ */ React.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: "rgba(254, 242, 242, 0.95)",
          color: "#dc2626",
          fontSize: "13px",
          border: "1px solid rgba(220, 38, 38, 0.2)"
        } }, /* @__PURE__ */ React.createElement("span", null, "\u26A0"), /* @__PURE__ */ React.createElement("span", null, error))
      ), /* @__PURE__ */ React.createElement(
        "div",
        {
          ref: containerRef,
          style: {
            width: "100%",
            height: "100%",
            visibility: error ? "hidden" : "visible"
          }
        }
      ));
    };
    vega_default = VegaWidget;
  }
});

// src/button/buttonConfigEditor.jsx
import React11 from "react";
import PropTypes10 from "prop-types";
import { Input as Input6, Label as Label2, Select as Select4, SelectContent as SelectContent4, SelectItem as SelectItem4, SelectTrigger as SelectTrigger4, SelectValue as SelectValue4 } from "@jet-admin/ui";
var ButtonConfigEditor;
var init_buttonConfigEditor = __esm({
  "src/button/buttonConfigEditor.jsx"() {
    ButtonConfigEditor = ({ widgetEditorForm }) => {
      return /* @__PURE__ */ React11.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React11.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React11.createElement(Label2, { className: "text-xs font-medium text-foreground" }, "Button Text"), /* @__PURE__ */ React11.createElement(
        Input6,
        {
          type: "text",
          className: "text-sm",
          value: widgetEditorForm.values.widgetConfig?.text || "",
          onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.text", e.target.value),
          placeholder: "Click Me"
        }
      )), /* @__PURE__ */ React11.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React11.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React11.createElement(Label2, { className: "text-xs font-medium text-foreground" }, "Variant"), /* @__PURE__ */ React11.createElement(
        Select4,
        {
          value: widgetEditorForm.values.widgetConfig?.variant || "default",
          onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.variant", val)
        },
        /* @__PURE__ */ React11.createElement(SelectTrigger4, { className: "text-xs" }, /* @__PURE__ */ React11.createElement(SelectValue4, { placeholder: "Select variant" })),
        /* @__PURE__ */ React11.createElement(SelectContent4, null, /* @__PURE__ */ React11.createElement(SelectItem4, { value: "default" }, "Default"), /* @__PURE__ */ React11.createElement(SelectItem4, { value: "destructive" }, "Destructive"), /* @__PURE__ */ React11.createElement(SelectItem4, { value: "outline" }, "Outline"), /* @__PURE__ */ React11.createElement(SelectItem4, { value: "secondary" }, "Secondary"), /* @__PURE__ */ React11.createElement(SelectItem4, { value: "ghost" }, "Ghost"), /* @__PURE__ */ React11.createElement(SelectItem4, { value: "link" }, "Link"))
      )), /* @__PURE__ */ React11.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React11.createElement(Label2, { className: "text-xs font-medium text-foreground" }, "Size"), /* @__PURE__ */ React11.createElement(
        Select4,
        {
          value: widgetEditorForm.values.widgetConfig?.size || "default",
          onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.size", val)
        },
        /* @__PURE__ */ React11.createElement(SelectTrigger4, { className: "text-xs" }, /* @__PURE__ */ React11.createElement(SelectValue4, { placeholder: "Select size" })),
        /* @__PURE__ */ React11.createElement(SelectContent4, null, /* @__PURE__ */ React11.createElement(SelectItem4, { value: "default" }, "Default"), /* @__PURE__ */ React11.createElement(SelectItem4, { value: "sm" }, "Small"), /* @__PURE__ */ React11.createElement(SelectItem4, { value: "lg" }, "Large"), /* @__PURE__ */ React11.createElement(SelectItem4, { value: "icon" }, "Icon"))
      ))));
    };
    ButtonConfigEditor.propTypes = {
      widgetEditorForm: PropTypes10.object.isRequired
    };
  }
});

// src/button/buttonWidget.jsx
import React12 from "react";
import PropTypes11 from "prop-types";
import { Button as Button9, Spinner } from "@jet-admin/ui";
var ButtonWidget;
var init_buttonWidget = __esm({
  "src/button/buttonWidget.jsx"() {
    ButtonWidget = ({
      widgetTitle,
      // Title of the widget (optional usage here)
      widgetType,
      // Type of widget (e.g., 'button')
      widgetConfig,
      // Widget-level config (text, variant, size)
      runWorkflow,
      // Callback to execute the attached workflow
      isLoadingWorkflows
      // Loading state of the workflow
    }) => {
      const text = widgetConfig?.text || "Click Me";
      const variant = widgetConfig?.variant || "default";
      const size = widgetConfig?.size || "default";
      return /* @__PURE__ */ React12.createElement("div", { className: "flex w-full h-full items-center justify-center p-4 text-center" }, /* @__PURE__ */ React12.createElement(
        Button9,
        {
          variant,
          size,
          onClick: runWorkflow,
          disabled: isLoadingWorkflows
        },
        isLoadingWorkflows && /* @__PURE__ */ React12.createElement(Spinner, { className: "mr-2 h-4 w-4" }),
        text
      ));
    };
    ButtonWidget.propTypes = {
      widgetTitle: PropTypes11.string,
      widgetType: PropTypes11.string,
      widgetConfig: PropTypes11.object,
      runWorkflow: PropTypes11.func,
      isLoadingWorkflows: PropTypes11.bool
    };
  }
});

// src/button/index.js
var button_exports = {};
__export(button_exports, {
  ButtonConfigEditor: () => ButtonConfigEditor,
  ButtonWidget: () => ButtonWidget
});
var init_button = __esm({
  "src/button/index.js"() {
    init_buttonWidget();
    init_buttonConfigEditor();
  }
});

// src/index.js
init_vega();

// src/vega/vegaConfigEditor.jsx
import React10, { useState as useState7 } from "react";
import PropTypes9 from "prop-types";
import { FiAlertTriangle, FiSettings as FiSettings2 } from "react-icons/fi";

// src/vega/chartSpecParser.js
var MARK_TO_CHART_TYPE = {
  bar: "bar",
  line: "line",
  area: "area",
  arc: "pie",
  // refined by innerRadius check
  point: "scatter",
  rect: "heatmap",
  boxplot: "boxplot",
  tick: "tick"
};
var parseVegaLiteSpec = (spec) => {
  const warnings = [];
  if (!spec || !spec.$schema) {
    return {
      success: false,
      config: null,
      warnings: ["Not a valid Vega-Lite spec (missing $schema)"]
    };
  }
  if (spec.$schema.includes("/vega/") && !spec.$schema.includes("/vega-lite/")) {
    return {
      success: false,
      config: null,
      warnings: ["This is a full Vega spec, not Vega-Lite. Visual builder only supports Vega-Lite."]
    };
  }
  try {
    const config = {};
    const markResult = parseMark(spec.mark);
    config.chartType = markResult.chartType;
    if (markResult.warning) warnings.push(markResult.warning);
    config.data = parseData(spec.data);
    config.encoding = parseEncoding(spec.encoding, config.chartType);
    config.style = parseStyle(spec);
    if (spec.transform) warnings.push("Transforms detected \u2014 these are not editable in visual mode");
    if (spec.layer) warnings.push("Layer composition detected \u2014 not supported in visual mode");
    if (spec.concat || spec.hconcat || spec.vconcat) warnings.push("Multi-view composition \u2014 not supported in visual mode");
    if (spec.selection || spec.params) warnings.push("Interactive selections \u2014 preserved but not editable in visual mode");
    if (spec.repeat) warnings.push("Repeat encoding \u2014 not supported in visual mode");
    return {
      success: true,
      config,
      warnings
    };
  } catch (err) {
    return {
      success: false,
      config: null,
      warnings: [`Parse error: ${err.message}`]
    };
  }
};
var parseMark = (mark) => {
  if (!mark) {
    return { chartType: "bar", warning: "No mark found, defaulting to bar" };
  }
  const markType = typeof mark === "string" ? mark : mark.type;
  let chartType = MARK_TO_CHART_TYPE[markType] || "bar";
  if (markType === "arc" && typeof mark === "object" && mark.innerRadius > 0) {
    chartType = "donut";
  }
  if (!MARK_TO_CHART_TYPE[markType]) {
    return { chartType, warning: `Unknown mark type "${markType}", defaulting to bar` };
  }
  return { chartType };
};
var parseData = (data) => {
  if (!data) {
    return { source: "", inlineValues: null };
  }
  if (data.values) {
    if (typeof data.values === "string") {
      return { source: data.values, inlineValues: null };
    }
    if (Array.isArray(data.values)) {
      return { source: "", inlineValues: data.values };
    }
  }
  if (data.url) {
    return { source: data.url, inlineValues: null };
  }
  return { source: "", inlineValues: null };
};
var parseEncoding = (encoding, chartType) => {
  if (!encoding) {
    return { x: null, y: null, color: null, size: null, tooltip: [] };
  }
  const result = {
    x: null,
    y: null,
    color: null,
    size: null,
    tooltip: []
  };
  if (chartType === "pie" || chartType === "donut") {
    if (encoding.theta) {
      result.y = parseChannel(encoding.theta);
    }
    if (encoding.color) {
      result.x = parseChannel(encoding.color);
    }
  } else {
    if (encoding.x) {
      result.x = parseChannel(encoding.x);
    }
    if (encoding.y) {
      result.y = parseChannel(encoding.y);
    }
    if (encoding.color) {
      result.color = parseChannel(encoding.color);
    }
  }
  if (encoding.size) {
    result.size = parseChannel(encoding.size);
  }
  if (encoding.tooltip) {
    if (Array.isArray(encoding.tooltip)) {
      result.tooltip = encoding.tooltip.map((t) => ({
        field: t.field,
        type: t.type,
        title: t.title
      }));
    } else if (encoding.tooltip.field) {
      result.tooltip = [{ field: encoding.tooltip.field, type: encoding.tooltip.type }];
    }
  }
  return result;
};
var parseChannel = (channel) => {
  if (!channel) return null;
  return {
    field: channel.field || "",
    type: channel.type || "nominal",
    title: channel.title || "",
    aggregate: channel.aggregate || "none",
    sort: channel.sort || null,
    bin: channel.bin || null,
    timeUnit: channel.timeUnit || null
  };
};
var parseStyle = (spec) => {
  const style = {
    title: "",
    colorScheme: "tableau10",
    width: "container",
    height: 300
  };
  if (spec.title) {
    if (typeof spec.title === "string") {
      style.title = spec.title;
    } else if (spec.title.text) {
      style.title = spec.title.text;
    }
  }
  if (spec.width) style.width = spec.width;
  if (spec.height) style.height = spec.height;
  if (spec.encoding) {
    const colorScale = spec.encoding.color?.scale;
    if (colorScale?.scheme) {
      style.colorScheme = colorScale.scheme;
    }
  }
  return style;
};

// src/vega/vegaConfigEditor.jsx
import {
  Button as Button8,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input as Input5,
  Label,
  Switch
} from "@jet-admin/ui";

// src/vega/vegaSpecEditor.jsx
import React3, { useState as useState3, useCallback as useCallback3, useMemo as useMemo2, useRef as useRef2, useEffect as useEffect2 } from "react";
import PropTypes2 from "prop-types";
import { FaCode, FaChartBar, FaChartLine, FaChartPie, FaExpand, FaCompress, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { BiScatterChart } from "react-icons/bi";
import Editor from "@monaco-editor/react";

// src/vega/variableExplorer.jsx
import React2, { useState as useState2, useMemo, useCallback as useCallback2 } from "react";
import PropTypes from "prop-types";
import { FiChevronRight, FiChevronDown, FiCopy, FiCheck } from "react-icons/fi";
import { BiGitMerge } from "react-icons/bi";
import { MdInput, MdOutput } from "react-icons/md";
import { Button, Input } from "@jet-admin/ui";
var getCategoryIcon = (category) => {
  switch (category) {
    case "input":
      return /* @__PURE__ */ React2.createElement(MdInput, { className: "w-3.5 h-3.5 text-green-500" });
    case "nodeOutput":
      return /* @__PURE__ */ React2.createElement(BiGitMerge, { className: "w-3.5 h-3.5 text-blue-500" });
    case "workflowOutput":
      return /* @__PURE__ */ React2.createElement(MdOutput, { className: "w-3.5 h-3.5 text-purple-500" });
    default:
      return null;
  }
};
var VariableItem = ({ variable, onSelect, isSelected }) => {
  const [copied, setCopied] = useState2(false);
  const handleCopy = useCallback2((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(variable.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [variable.path]);
  const handleClick = useCallback2(() => {
    if (onSelect) {
      onSelect(variable.path, variable);
    }
  }, [onSelect, variable]);
  return /* @__PURE__ */ React2.createElement(
    "div",
    {
      className: `flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded text-xs group`,
      style: {
        background: isSelected ? "var(--we-bg-accent-light, #eef2ff)" : "var(--we-bg-primary, #fff)",
        borderLeft: isSelected ? "2px solid var(--we-bg-accent, #4f46e5)" : "none"
      },
      onClick: handleClick
    },
    /* @__PURE__ */ React2.createElement("span", { className: "font-medium truncate flex-1", style: { color: "var(--we-text-primary, #1e293b)" } }, variable.name),
    variable.nodeTitle && /* @__PURE__ */ React2.createElement("span", { className: "text-[10px] truncate max-w-[80px]", style: { color: "var(--we-text-muted, #94a3b8)" } }, variable.nodeTitle),
    /* @__PURE__ */ React2.createElement(
      Button,
      {
        onClick: handleCopy,
        variant: "ghost",
        size: "icon",
        className: "h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity",
        title: "Copy path",
        type: "button"
      },
      copied ? /* @__PURE__ */ React2.createElement(FiCheck, { className: "w-3 h-3 text-green-500" }) : /* @__PURE__ */ React2.createElement(FiCopy, { className: "w-3 h-3 text-slate-400" })
    )
  );
};
VariableItem.propTypes = {
  variable: PropTypes.shape({
    path: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    description: PropTypes.string
  }).isRequired,
  onSelect: PropTypes.func,
  isSelected: PropTypes.bool
};
var VariableCategory = ({
  category,
  title,
  variables,
  onSelect,
  selectedPath,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = useState2(defaultExpanded);
  if (!variables || variables.length === 0) return null;
  return /* @__PURE__ */ React2.createElement("div", { className: "mb-1", style: { background: "var(--we-bg-primary, #fff)" } }, /* @__PURE__ */ React2.createElement(
    "div",
    {
      onClick: () => setIsExpanded(!isExpanded),
      className: "flex items-center gap-1.5 w-full px-2 py-1.5 rounded text-left cursor-pointer",
      style: { background: "var(--we-bg-secondary, #f8fafc)", border: "1px solid var(--we-border, #e2e8f0)" }
    },
    isExpanded ? /* @__PURE__ */ React2.createElement(FiChevronDown, { className: "w-3 h-3 text-slate-500" }) : /* @__PURE__ */ React2.createElement(FiChevronRight, { className: "w-3 h-3 text-slate-500" }),
    getCategoryIcon(category),
    /* @__PURE__ */ React2.createElement("span", { className: "text-[11px] font-medium uppercase tracking-wide flex-1", style: { color: "var(--we-text-secondary, #475569)" } }, title),
    /* @__PURE__ */ React2.createElement("span", { className: "text-[10px] px-1.5 py-0.5 rounded", style: { color: "var(--we-text-muted, #94a3b8)", background: "var(--we-bg-primary, #fff)", border: "1px solid var(--we-border, #e2e8f0)" } }, variables.length)
  ), isExpanded && /* @__PURE__ */ React2.createElement("div", { className: "ml-3 mt-1 pl-2", style: { borderLeft: "1px solid var(--we-border, #e2e8f0)", background: "var(--we-bg-primary, #fff)" } }, variables.map((variable) => /* @__PURE__ */ React2.createElement(
    VariableItem,
    {
      key: variable.path,
      variable,
      onSelect,
      isSelected: selectedPath === variable.path
    }
  ))));
};
VariableCategory.propTypes = {
  category: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  variables: PropTypes.array.isRequired,
  onSelect: PropTypes.func,
  selectedPath: PropTypes.string,
  defaultExpanded: PropTypes.bool
};
var extractWorkflowSchema = (workflow) => {
  if (!workflow) return { inputs: [], nodeOutputs: [], workflowOutputs: [] };
  const schema = {
    inputs: [],
    nodeOutputs: [],
    workflowOutputs: []
  };
  const args = workflow.workflowOptions?.args || workflow.inputs || [];
  schema.inputs = args.map((arg) => ({
    path: `{{ctx.input.${arg.name}}}`,
    name: arg.name,
    type: arg.type || "string",
    description: arg.description || `Workflow input parameter: ${arg.name}`,
    category: "input",
    required: arg.required || false,
    defaultValue: arg.defaultValue
  }));
  const nodes = workflow.nodes || [];
  for (const node of nodes) {
    const hasOutput = node.hasOutput !== void 0 ? node.hasOutput : node.outputVariable && node.type !== "start" && node.type !== "end";
    if (hasOutput) {
      const outputVar = node.outputVariable || node.data?.outputVariable;
      const nodeTitle = node.title || node.data?.title || node.type;
      schema.nodeOutputs.push({
        path: `{{ctx.${outputVar}}}`,
        name: outputVar,
        type: getNodeOutputType(node.type),
        description: `Output from ${nodeTitle} node`,
        category: "nodeOutput",
        nodeType: node.type,
        nodeTitle,
        nodeID: node.id
      });
    }
  }
  const outputs = workflow.outputs || [];
  const endNode = nodes.find((n) => n.isEnd || n.type === "end");
  const endOutputs = outputs.length > 0 ? outputs : endNode?.data?.outputs || [];
  for (const output of endOutputs) {
    if (output.name) {
      schema.workflowOutputs.push({
        path: `{{ctx.output.${output.name}}}`,
        name: output.name,
        type: output.type || "any",
        description: `Workflow output: ${output.name}`,
        category: "workflowOutput",
        sourceVariable: output.value
      });
    }
  }
  if (schema.workflowOutputs.length === 0 && schema.nodeOutputs.length > 0) {
    schema.workflowOutputs.push({
      path: `{{ctx.output}}`,
      name: "output",
      type: "any",
      description: "Final workflow output (from end node)",
      category: "workflowOutput"
    });
  }
  return schema;
};
var getNodeOutputType = (nodeType) => {
  switch (nodeType) {
    case "dataQuery":
      return "object";
    // Usually { rows: [], fields: [] }
    case "javascript":
      return "any";
    case "condition":
      return "boolean";
    case "restapi":
      return "object";
    case "loop":
      return "array";
    default:
      return "any";
  }
};
var VariableExplorer = ({
  workflow,
  context,
  // Optional: can still show runtime context if available
  onSelect,
  selectedPath = null,
  title = "Workflow Variables",
  showSearch = true,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState2("");
  const schema = useMemo(() => {
    return extractWorkflowSchema(workflow);
  }, [workflow]);
  const allVariables = useMemo(() => {
    const variables = {
      inputs: [...schema.inputs],
      nodeOutputs: [...schema.nodeOutputs],
      workflowOutputs: [...schema.workflowOutputs]
    };
    return variables;
  }, [schema]);
  const filteredVariables = useMemo(() => {
    if (!searchQuery) return allVariables;
    const lowerQuery = searchQuery.toLowerCase();
    return {
      inputs: allVariables.inputs.filter(
        (v) => v.path.toLowerCase().includes(lowerQuery) || v.name.toLowerCase().includes(lowerQuery)
      ),
      nodeOutputs: allVariables.nodeOutputs.filter(
        (v) => v.path.toLowerCase().includes(lowerQuery) || v.name.toLowerCase().includes(lowerQuery) || v.nodeTitle?.toLowerCase().includes(lowerQuery)
      ),
      workflowOutputs: allVariables.workflowOutputs.filter(
        (v) => v.path.toLowerCase().includes(lowerQuery) || v.name.toLowerCase().includes(lowerQuery)
      )
    };
  }, [allVariables, searchQuery]);
  const hasVariables = schema.inputs.length > 0 || schema.nodeOutputs.length > 0 || schema.workflowOutputs.length > 0;
  return /* @__PURE__ */ React2.createElement("div", { className: `flex flex-col rounded ${className}`, style: { border: "1px solid var(--we-border, #e2e8f0)", background: "var(--we-bg-primary, #fff)" } }, /* @__PURE__ */ React2.createElement("div", { className: "flex items-center justify-between px-3 py-2 rounded-t", style: { borderBottom: "1px solid var(--we-border, #e2e8f0)", background: "var(--we-bg-secondary, #f8fafc)" } }, /* @__PURE__ */ React2.createElement("h3", { className: "text-xs font-medium", style: { color: "var(--we-text-secondary, #475569)" } }, title)), showSearch && hasVariables && /* @__PURE__ */ React2.createElement("div", { className: "px-2 py-2", style: { borderBottom: "1px solid var(--we-border, #e2e8f0)" } }, /* @__PURE__ */ React2.createElement(
    Input,
    {
      type: "text",
      placeholder: "Search variables...",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      className: "we-input w-full",
      style: { fontSize: "12px" }
    }
  )), /* @__PURE__ */ React2.createElement("div", { className: "flex-1 overflow-auto max-h-64 py-2 px-1" }, !hasVariables ? /* @__PURE__ */ React2.createElement("div", { className: "text-center py-4 text-xs", style: { color: "var(--we-text-muted, #94a3b8)" } }, /* @__PURE__ */ React2.createElement("p", null, "No variables defined"), /* @__PURE__ */ React2.createElement("p", { className: "mt-1", style: { fontSize: "10px" } }, "Add workflow inputs or nodes with output variables")) : /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement(
    VariableCategory,
    {
      category: "input",
      title: "Workflow Inputs",
      variables: filteredVariables.inputs,
      onSelect,
      selectedPath,
      defaultExpanded: true
    }
  ), /* @__PURE__ */ React2.createElement(
    VariableCategory,
    {
      category: "nodeOutput",
      title: "Node Outputs",
      variables: filteredVariables.nodeOutputs,
      onSelect,
      selectedPath,
      defaultExpanded: true
    }
  ), /* @__PURE__ */ React2.createElement(
    VariableCategory,
    {
      category: "workflowOutput",
      title: "Workflow Outputs",
      variables: filteredVariables.workflowOutputs,
      onSelect,
      selectedPath,
      defaultExpanded: true
    }
  ))));
};
VariableExplorer.propTypes = {
  workflow: PropTypes.object,
  context: PropTypes.object,
  onSelect: PropTypes.func,
  selectedPath: PropTypes.string,
  title: PropTypes.string,
  showSearch: PropTypes.bool,
  className: PropTypes.string
};

// src/vega/vegaSpecEditor.jsx
import { Button as Button2 } from "@jet-admin/ui";
var VEGA_TEMPLATES = {
  "empty": {
    name: "Empty Spec",
    icon: FaCode,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "Custom visualization",
      "data": {
        "values": [
          { "x": 1, "y": 10 },
          { "x": 2, "y": 20 },
          { "x": 3, "y": 15 }
        ]
      },
      "mark": "point",
      "encoding": {
        "x": { "field": "x", "type": "quantitative" },
        "y": { "field": "y", "type": "quantitative" }
      }
    }
  },
  "bar": {
    name: "Bar Chart",
    icon: FaChartBar,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A bar chart with sample data",
      "data": {
        "values": [
          { "category": "Electronics", "value": 450 },
          { "category": "Clothing", "value": 320 },
          { "category": "Food", "value": 280 },
          { "category": "Books", "value": 190 },
          { "category": "Sports", "value": 230 }
        ]
      },
      "mark": "bar",
      "encoding": {
        "x": { "field": "category", "type": "nominal", "axis": { "labelAngle": -45 } },
        "y": { "field": "value", "type": "quantitative", "title": "Sales" },
        "color": { "field": "category", "type": "nominal", "legend": null }
      }
    }
  },
  "line": {
    name: "Line Chart",
    icon: FaChartLine,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A line chart with sample time series data",
      "data": {
        "values": [
          { "date": "2024-01-01", "value": 100 },
          { "date": "2024-02-01", "value": 150 },
          { "date": "2024-03-01", "value": 120 },
          { "date": "2024-04-01", "value": 200 },
          { "date": "2024-05-01", "value": 180 },
          { "date": "2024-06-01", "value": 250 }
        ]
      },
      "mark": { "type": "line", "point": true },
      "encoding": {
        "x": { "field": "date", "type": "temporal", "title": "Date" },
        "y": { "field": "value", "type": "quantitative", "title": "Value" }
      }
    }
  },
  "pie": {
    name: "Pie Chart",
    icon: FaChartPie,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A donut chart with sample data",
      "data": {
        "values": [
          { "category": "Desktop", "value": 45 },
          { "category": "Mobile", "value": 35 },
          { "category": "Tablet", "value": 15 },
          { "category": "Other", "value": 5 }
        ]
      },
      "mark": { "type": "arc", "innerRadius": 50 },
      "encoding": {
        "theta": { "field": "value", "type": "quantitative" },
        "color": { "field": "category", "type": "nominal", "title": "Device" }
      }
    }
  },
  "scatter": {
    name: "Scatter Plot",
    icon: BiScatterChart,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A scatter plot with sample data",
      "data": {
        "values": [
          { "x": 10, "y": 28, "size": 5, "category": "A" },
          { "x": 25, "y": 55, "size": 8, "category": "B" },
          { "x": 40, "y": 43, "size": 12, "category": "A" },
          { "x": 55, "y": 91, "size": 6, "category": "C" },
          { "x": 70, "y": 81, "size": 10, "category": "B" },
          { "x": 85, "y": 53, "size": 15, "category": "C" }
        ]
      },
      "mark": "circle",
      "encoding": {
        "x": { "field": "x", "type": "quantitative", "title": "X Axis" },
        "y": { "field": "y", "type": "quantitative", "title": "Y Axis" },
        "size": { "field": "size", "type": "quantitative" },
        "color": { "field": "category", "type": "nominal" }
      }
    }
  },
  "heatmap": {
    name: "Heatmap",
    icon: FaChartBar,
    spec: {
      "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
      "description": "A heatmap with sample data",
      "data": {
        "values": [
          { "row": "Mon", "column": "Morning", "value": 10 },
          { "row": "Mon", "column": "Afternoon", "value": 25 },
          { "row": "Mon", "column": "Evening", "value": 15 },
          { "row": "Tue", "column": "Morning", "value": 20 },
          { "row": "Tue", "column": "Afternoon", "value": 30 },
          { "row": "Tue", "column": "Evening", "value": 22 },
          { "row": "Wed", "column": "Morning", "value": 15 },
          { "row": "Wed", "column": "Afternoon", "value": 28 },
          { "row": "Wed", "column": "Evening", "value": 18 }
        ]
      },
      "mark": "rect",
      "encoding": {
        "x": { "field": "column", "type": "ordinal", "title": "Time" },
        "y": { "field": "row", "type": "ordinal", "title": "Day" },
        "color": { "field": "value", "type": "quantitative", "scale": { "scheme": "blues" }, "title": "Activity" }
      }
    }
  }
};
var getNestedKeys = (obj, prefix = "", maxDepth = 4, currentDepth = 0) => {
  if (!obj || typeof obj !== "object" || currentDepth >= maxDepth) {
    return [];
  }
  const keys = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      keys.push(fullPath);
      if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Array.isArray(obj[key]) && obj[key].length > 0) {
          keys.push(...getNestedKeys(obj[key][0], `${fullPath}[0]`, maxDepth, currentDepth + 1));
        } else {
          keys.push(...getNestedKeys(obj[key], fullPath, maxDepth, currentDepth + 1));
        }
      }
    }
  }
  return keys;
};
var getValueByPath = (obj, path) => {
  if (!obj || !path) return void 0;
  const parts = path.split(".");
  let current = obj;
  for (const part of parts) {
    const arrayMatch = part.match(/^(.+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, key, index] = arrayMatch;
      current = current?.[key]?.[parseInt(index)];
    } else {
      current = current?.[part];
    }
    if (current === void 0) break;
  }
  return current;
};
var getValuePreview = (obj, path) => {
  const value = getValueByPath(obj, path);
  if (value === void 0) return "undefined";
  if (value === null) return "null";
  const type = Array.isArray(value) ? "array" : typeof value;
  switch (type) {
    case "string":
      return `"${value.slice(0, 30)}${value.length > 30 ? "..." : ""}"`;
    case "number":
    case "boolean":
      return String(value);
    case "array":
      return `Array(${value.length})`;
    case "object":
      const keys = Object.keys(value).slice(0, 3);
      return `{${keys.join(", ")}${Object.keys(value).length > 3 ? "..." : ""}}`;
    default:
      return type;
  }
};
var VegaSpecEditor = ({
  value,
  onChange,
  onError,
  workflowContext = null,
  workflow = null,
  placeholder = "Enter Vega-Lite JSON spec...",
  disabled = false,
  theme = "light"
}) => {
  const [isExpanded, setIsExpanded] = useState3(false);
  const [showTemplates, setShowTemplates] = useState3(false);
  const [parseError, setParseError] = useState3(null);
  const editorRef = useRef2(null);
  const monacoRef = useRef2(null);
  const valueRef = useRef2(value);
  useEffect2(() => {
    valueRef.current = value;
  }, [value]);
  const getJsonString = (val) => {
    if (!val) return "";
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return "";
    }
  };
  const [internalValue, setInternalValue] = useState3(() => getJsonString(value));
  useEffect2(() => {
    const newJsonString = getJsonString(value);
    if (editorRef.current && newJsonString !== internalValue) {
      setInternalValue(newJsonString);
      editorRef.current.setValue(newJsonString);
    }
  }, [value]);
  const handleEditorDidMount = useCallback3((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);
  useEffect2(() => {
    if (!monacoRef.current) return;
    const monaco = monacoRef.current;
    const schema = workflow ? extractWorkflowSchema(workflow) : null;
    const disposable = monaco.languages.registerCompletionItemProvider("json", {
      triggerCharacters: [".", "{"],
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };
        const suggestions = [];
        const bracketMatch = textUntilPosition.match(/\{\{([a-zA-Z0-9_]*)$/);
        if (bracketMatch) {
          const partial = bracketMatch[1].toLowerCase();
          if ("ctx".startsWith(partial)) {
            suggestions.push({
              label: "ctx",
              kind: monaco.languages.CompletionItemKind.Module,
              detail: "Workflow Context (Runtime)",
              insertText: "ctx.",
              range
            });
          }
          if (schema) {
            const addSchemaItems = (items, kind, prefix) => {
              items.forEach((item) => {
                const pathWithoutBraces = item.path.replace(/\{\{|\}\}/g, "");
                if (pathWithoutBraces.toLowerCase().includes(partial)) {
                  suggestions.push({
                    label: item.name,
                    kind,
                    detail: `${prefix}: ${item.type} ${item.nodeTitle ? `(from ${item.nodeTitle})` : ""}`,
                    insertText: pathWithoutBraces,
                    range
                  });
                }
              });
            };
            addSchemaItems(schema.inputs, monaco.languages.CompletionItemKind.Property, "Input");
            addSchemaItems(schema.nodeOutputs, monaco.languages.CompletionItemKind.Variable, "Node Output");
            addSchemaItems(schema.workflowOutputs, monaco.languages.CompletionItemKind.Event, "Workflow Output");
          }
        }
        if (workflowContext) {
          const ctxMatch = textUntilPosition.match(/\{\{ctx\.([a-zA-Z0-9_\[\]\.]*) $/);
          if (ctxMatch) {
            const partialKey = ctxMatch[1];
            const availableKeys = getNestedKeys(workflowContext, "", 4);
            availableKeys.filter((key) => key.toLowerCase().includes(partialKey.toLowerCase())).forEach((key) => {
              suggestions.push({
                label: key,
                kind: monaco.languages.CompletionItemKind.Variable,
                detail: getValuePreview(workflowContext, key),
                insertText: key,
                range,
                documentation: `Value: ${getValuePreview(workflowContext, key)}`
              });
            });
          }
        }
        return { suggestions };
      }
    });
    return () => {
      disposable.dispose();
    };
  }, [workflowContext, workflow]);
  const handleEditorChange = useCallback3((newValue) => {
    setInternalValue(newValue);
    if (!newValue || !newValue.trim()) {
      setParseError(null);
      onChange(null);
      return;
    }
    try {
      const parsed = JSON.parse(newValue);
      setParseError(null);
      onChange(parsed);
    } catch (err) {
      setParseError(err.message);
      if (onError) onError(err);
    }
  }, [onChange, onError]);
  const applyTemplate = useCallback3((templateKey) => {
    const template = VEGA_TEMPLATES[templateKey];
    if (template) {
      onChange(template.spec);
      setShowTemplates(false);
      setParseError(null);
    }
  }, [onChange]);
  const formatDocument = useCallback3(() => {
    if (editorRef.current) {
      editorRef.current.getAction("editor.action.formatDocument").run();
    }
  }, []);
  return /* @__PURE__ */ React3.createElement(
    "div",
    {
      className: `flex flex-col gap-3 ${isExpanded ? "fixed inset-4 z-50 p-4" : ""}`,
      style: isExpanded ? {
        background: "var(--we-bg-primary)",
        borderRadius: "var(--we-radius-lg)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
      } : void 0
    },
    /* @__PURE__ */ React3.createElement("div", { className: "flex flex-row justify-between items-center gap-2 pb-2", style: { borderBottom: "1px solid var(--we-border)" } }, /* @__PURE__ */ React3.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React3.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React3.createElement(FaCode, { style: { color: "var(--we-bg-accent)", fontSize: "16px" } }), /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "13px", fontWeight: 600, color: "var(--we-text-primary)" } }, "Vega-Lite Spec")), !parseError ? /* @__PURE__ */ React3.createElement("div", { className: "flex items-center gap-1", style: { color: "#16a34a" } }, /* @__PURE__ */ React3.createElement(FaCheckCircle, { size: 14 }), /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "11px", fontWeight: 500 } }, "Valid")) : /* @__PURE__ */ React3.createElement("div", { className: "flex items-center gap-1", style: { color: "#dc2626" } }, /* @__PURE__ */ React3.createElement(FaExclamationTriangle, { size: 14 }), /* @__PURE__ */ React3.createElement("span", { style: { fontSize: "11px", fontWeight: 500 } }, "Invalid")), workflowContext && Object.keys(workflowContext).length > 0 && /* @__PURE__ */ React3.createElement("div", { style: {
      padding: "2px 8px",
      background: "var(--we-bg-accent-light)",
      border: "1px solid var(--we-border-accent)",
      borderRadius: "var(--we-radius-sm)",
      fontSize: "11px",
      color: "var(--we-text-accent)",
      fontWeight: 500
    } }, Object.keys(workflowContext).length, " context vars")), /* @__PURE__ */ React3.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React3.createElement(
      Button2,
      {
        type: "button",
        variant: "outline",
        size: "sm",
        onClick: formatDocument,
        className: "h-7 px-2 text-xs bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-slate-200",
        title: "Format JSON (Shift+Alt+F)"
      },
      "Format"
    ), /* @__PURE__ */ React3.createElement(
      Button2,
      {
        type: "button",
        variant: "outline",
        size: "sm",
        onClick: () => setShowTemplates(!showTemplates),
        className: "h-7 px-2 text-xs bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-slate-200"
      },
      "Templates"
    ), /* @__PURE__ */ React3.createElement(
      Button2,
      {
        type: "button",
        variant: "outline",
        size: "icon",
        onClick: () => setIsExpanded(!isExpanded),
        className: "h-7 w-7 bg-white text-slate-600 hover:text-slate-800 hover:bg-slate-50 border-slate-200",
        title: isExpanded ? "Exit fullscreen" : "Fullscreen"
      },
      isExpanded ? /* @__PURE__ */ React3.createElement(FaCompress, { size: 12 }) : /* @__PURE__ */ React3.createElement(FaExpand, { size: 12 })
    ))),
    showTemplates && /* @__PURE__ */ React3.createElement("div", { className: "grid grid-cols-3 md:grid-cols-6 gap-2 p-3", style: {
      background: "var(--we-bg-secondary)",
      borderRadius: "var(--we-radius)",
      border: "1px solid var(--we-border)"
    } }, Object.entries(VEGA_TEMPLATES).map(([key, template]) => {
      const Icon = template.icon;
      return /* @__PURE__ */ React3.createElement(
        Button2,
        {
          key,
          type: "button",
          variant: "outline",
          onClick: () => applyTemplate(key),
          className: "h-auto py-3 flex-col gap-1.5 bg-white border-slate-200 hover:border-primary hover:bg-slate-50 transition-all font-normal"
        },
        /* @__PURE__ */ React3.createElement(Icon, { className: "text-xl text-slate-400" }),
        /* @__PURE__ */ React3.createElement("span", { className: "text-[11px] font-medium text-slate-600" }, template.name)
      );
    })),
    /* @__PURE__ */ React3.createElement("div", { className: "relative rounded-lg overflow-hidden", style: {
      border: `1px solid ${parseError ? "#fca5a5" : "var(--we-border-strong)"}`,
      ...parseError ? { boxShadow: "0 0 0 1px #fecaca" } : {}
    } }, /* @__PURE__ */ React3.createElement(
      Editor,
      {
        height: isExpanded ? "calc(100vh - 200px)" : "400px",
        defaultLanguage: "json",
        defaultValue: internalValue,
        onChange: handleEditorChange,
        onMount: handleEditorDidMount,
        theme: "vs",
        options: {
          readOnly: disabled,
          minimap: { enabled: isExpanded },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          wordWrap: "on",
          wrappingStrategy: "advanced",
          automaticLayout: true,
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          insertSpaces: true,
          quickSuggestions: {
            "other": true,
            "comments": false,
            "strings": true
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: "on",
          snippetSuggestions: "inline",
          padding: { top: 8, bottom: 8 },
          folding: true,
          foldingStrategy: "indentation",
          showFoldingControls: "always",
          bracketPairColorization: {
            enabled: true
          }
        }
      }
    ), workflowContext && /* @__PURE__ */ React3.createElement("div", { className: "absolute bottom-2 right-2 px-2 py-1 rounded pointer-events-none", style: {
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(4px)",
      border: "1px solid var(--we-border)",
      boxShadow: "var(--we-shadow-sm)",
      fontSize: "11px"
    } }, /* @__PURE__ */ React3.createElement("span", { style: { color: "var(--we-text-muted)" } }, "Type "), /* @__PURE__ */ React3.createElement("code", { style: {
      background: "var(--we-bg-tertiary)",
      padding: "1px 4px",
      borderRadius: "3px",
      fontFamily: "monospace",
      color: "var(--we-text-primary)"
    } }, "{{ctx."), /* @__PURE__ */ React3.createElement("span", { style: { color: "var(--we-text-muted)" } }, " for suggestions"))),
    parseError && /* @__PURE__ */ React3.createElement("div", { className: "flex items-start gap-2 p-2.5 rounded", style: {
      fontSize: "12px",
      color: "#dc2626",
      background: "#fef2f2",
      border: "1px solid #fecaca"
    } }, /* @__PURE__ */ React3.createElement(FaExclamationTriangle, { className: "mt-0.5 flex-shrink-0" }), /* @__PURE__ */ React3.createElement("div", null, /* @__PURE__ */ React3.createElement("strong", { style: { fontWeight: 600 } }, "Parse Error:"), " ", parseError))
  );
};
VegaSpecEditor.propTypes = {
  value: PropTypes2.object,
  onChange: PropTypes2.func.isRequired,
  onError: PropTypes2.func,
  workflowContext: PropTypes2.object,
  workflow: PropTypes2.object,
  placeholder: PropTypes2.string,
  disabled: PropTypes2.bool,
  theme: PropTypes2.oneOf(["light", "dark"])
};

// src/vega/shelfBuilder.jsx
import React8, { useState as useState6, useEffect as useEffect4, useMemo as useMemo4, useCallback as useCallback7 } from "react";
import PropTypes7 from "prop-types";

// src/vega/dataFieldPanel.jsx
import React5, { useMemo as useMemo3, useState as useState4, useCallback as useCallback5, useRef as useRef3, useEffect as useEffect3 } from "react";
import PropTypes4 from "prop-types";

// src/vega/fieldPill.jsx
import React4, { useCallback as useCallback4 } from "react";
import PropTypes3 from "prop-types";

// src/vega/chartSpecGenerator.js
var MARK_TYPES = {
  bar: { type: "bar", tooltip: true },
  line: { type: "line", tooltip: true, point: true },
  area: { type: "area", tooltip: true, line: true, opacity: 0.7 },
  point: { type: "point", tooltip: true, filled: true, opacity: 0.7 },
  circle: { type: "circle", tooltip: true, opacity: 0.7 },
  square: { type: "square", tooltip: true },
  arc: { type: "arc", tooltip: true },
  rect: { type: "rect", tooltip: true },
  tick: { type: "tick", tooltip: true },
  text: { type: "text" }
};
var MARK_ALIASES = {
  scatter: "point",
  pie: "arc",
  donut: "arc",
  heatmap: "rect",
  histogram: "bar"
};
var POSITIONAL_CHANNELS = ["x", "y", "row", "column"];
var RETINAL_CHANNELS = ["color", "size", "shape", "opacity", "strokeDash", "detail"];
var TEXT_CHANNELS = ["text", "tooltip"];
var ALL_CHANNELS = [...POSITIONAL_CHANNELS, ...RETINAL_CHANNELS, ...TEXT_CHANNELS];
var FIELD_TYPES = ["nominal", "ordinal", "quantitative", "temporal"];
var AGGREGATE_TYPES = [
  "count",
  "sum",
  "mean",
  "median",
  "min",
  "max",
  "variance",
  "stdev",
  "distinct",
  "valid",
  "missing"
];
var COLOR_SCHEMES = [
  "tableau10",
  "category10",
  "category20",
  "accent",
  "dark2",
  "paired",
  "set1",
  "set2",
  "set3",
  "pastel1",
  "pastel2",
  "blues",
  "greens",
  "oranges",
  "reds",
  "purples",
  "greys",
  "viridis",
  "magma",
  "inferno",
  "plasma",
  "spectral"
];
var inferMarkType = (encoding) => {
  const xType = encoding?.x?.type;
  const yType = encoding?.y?.type;
  const hasX = !!encoding?.x?.field;
  const hasY = !!encoding?.y?.field;
  const hasColor = !!encoding?.color?.field;
  const hasSize = !!encoding?.size?.field;
  if (!hasX && !hasY) return "bar";
  if (hasX && !hasY) {
    if (xType === "quantitative") return "bar";
    return "bar";
  }
  if (!hasX && hasY) {
    if (yType === "quantitative") return "bar";
    return "bar";
  }
  const isXCat = xType === "nominal" || xType === "ordinal";
  const isYCat = yType === "nominal" || yType === "ordinal";
  const isXQuant = xType === "quantitative";
  const isYQuant = yType === "quantitative";
  const isXTemp = xType === "temporal";
  const isYTemp = yType === "temporal";
  if (isXTemp && isYQuant || isYTemp && isXQuant) return "line";
  if (isXCat && isYQuant || isYCat && isXQuant) return "bar";
  if (isXQuant && isYQuant) return "point";
  if (isXCat && isYCat && hasColor) return "rect";
  return "bar";
};
var generateVegaLiteSpec = (shelfSpec) => {
  if (!shelfSpec) return getEmptySpec();
  const spec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json"
  };
  const encoding = shelfSpec.encoding || {};
  const config = shelfSpec.config || {};
  if (config.title) {
    spec.title = {
      text: config.title,
      anchor: "start",
      fontSize: 14,
      fontWeight: 600,
      offset: 12
    };
  }
  spec.width = config.width === "container" ? "container" : config.width || "container";
  spec.height = config.height || 300;
  spec.autosize = { type: "fit", contains: "padding" };
  spec.data = buildDataSection(shelfSpec.dataSource, shelfSpec.inlineValues);
  const resolvedMark = shelfSpec.mark === "auto" || !shelfSpec.mark ? inferMarkType(encoding) : MARK_ALIASES[shelfSpec.mark] || shelfSpec.mark;
  const markDef = MARK_TYPES[resolvedMark] || MARK_TYPES.bar;
  if (shelfSpec.mark === "donut") {
    spec.mark = { ...markDef, innerRadius: 50 };
  } else {
    spec.mark = { ...markDef };
  }
  spec.encoding = buildEncoding(encoding, resolvedMark, config);
  spec.config = buildThemeConfig(config);
  return spec;
};
var buildDataSection = (dataSource, inlineValues) => {
  if (inlineValues && Array.isArray(inlineValues) && inlineValues.length > 0) {
    return { values: inlineValues };
  }
  if (dataSource) {
    return { values: dataSource };
  }
  return { values: [] };
};
var buildEncoding = (encoding, markType, config) => {
  const enc = {};
  const isArc = markType === "arc";
  if (isArc) {
    if (encoding.y?.field) {
      enc.theta = buildChannel(encoding.y);
    }
    if (encoding.x?.field) {
      enc.color = buildChannel(encoding.x, config?.colorScheme);
    }
  } else {
    if (encoding.x?.field) enc.x = buildChannel(encoding.x);
    if (encoding.y?.field) enc.y = buildChannel(encoding.y);
  }
  if (encoding.row?.field) enc.row = buildChannel(encoding.row);
  if (encoding.column?.field) enc.column = buildChannel(encoding.column);
  if (!isArc && encoding.color?.field) enc.color = buildChannel(encoding.color, config?.colorScheme);
  if (encoding.size?.field) enc.size = buildChannel(encoding.size);
  if (encoding.shape?.field) enc.shape = buildChannel(encoding.shape);
  if (encoding.opacity?.field) enc.opacity = buildChannel(encoding.opacity);
  if (encoding.strokeDash?.field) enc.strokeDash = buildChannel(encoding.strokeDash);
  if (encoding.detail?.field) enc.detail = buildChannel(encoding.detail);
  if (encoding.text?.field) enc.text = buildChannel(encoding.text);
  if (encoding.tooltip) {
    if (Array.isArray(encoding.tooltip)) {
      const tooltips = encoding.tooltip.filter((t) => t?.field);
      if (tooltips.length > 0) {
        enc.tooltip = tooltips.map((t) => ({
          field: t.field,
          ...t.type && { type: t.type },
          ...t.title && { title: t.title }
        }));
      }
    } else if (encoding.tooltip?.field) {
      enc.tooltip = { field: encoding.tooltip.field, type: encoding.tooltip.type };
    }
  }
  return enc;
};
var buildChannel = (channel, colorScheme) => {
  if (!channel || !channel.field) return void 0;
  const enc = {
    field: channel.field,
    type: channel.type || "nominal"
  };
  if (channel.title) enc.title = channel.title;
  if (channel.aggregate && channel.aggregate !== "none") enc.aggregate = channel.aggregate;
  if (channel.sort) enc.sort = channel.sort;
  if (channel.bin) enc.bin = channel.bin === true ? true : { maxbins: channel.bin };
  if (channel.timeUnit) enc.timeUnit = channel.timeUnit;
  if (channel.axis !== void 0) enc.axis = channel.axis;
  if (colorScheme) enc.scale = { scheme: colorScheme };
  return enc;
};
var buildThemeConfig = (config) => ({
  background: "transparent",
  view: { stroke: "transparent" },
  axis: {
    labelFontSize: 11,
    titleFontSize: 12,
    titlePadding: 8,
    grid: true,
    gridOpacity: 0.15
  },
  legend: {
    labelFontSize: 11,
    titleFontSize: 12
  }
});
var getEmptySpec = () => ({
  $schema: "https://vega.github.io/schema/vega-lite/v5.json",
  description: "Drag fields onto encoding shelves to build a chart",
  data: { values: [] },
  mark: "bar",
  encoding: {},
  width: "container",
  height: 300
});
var getDefaultShelfSpec = () => ({
  mark: "auto",
  dataSource: "",
  inlineValues: null,
  encoding: {
    x: null,
    y: null,
    color: null,
    size: null,
    shape: null,
    row: null,
    column: null,
    detail: null,
    text: null,
    opacity: null,
    strokeDash: null,
    tooltip: []
  },
  config: {
    title: "",
    colorScheme: "tableau10",
    width: "container",
    height: 300
  }
});
var inferFieldsFromData = (data) => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const sample = data[0];
  if (typeof sample !== "object" || sample === null) return [];
  return Object.keys(sample).map((key) => {
    const value = sample[key];
    const type = inferFieldType(value, key, data);
    return {
      name: key,
      type,
      icon: getFieldTypeIcon(type)
    };
  });
};
var inferFieldType = (value, key, data) => {
  if (value === null || value === void 0) {
    for (const row of data.slice(1, 10)) {
      if (row[key] !== null && row[key] !== void 0) {
        return inferFieldType(row[key], key, []);
      }
    }
    return "nominal";
  }
  if (typeof value === "number") return "quantitative";
  if (typeof value === "string") {
    if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(value) || !isNaN(Date.parse(value))) {
      return "temporal";
    }
    if (!isNaN(Number(value)) && value.trim() !== "") {
      return "quantitative";
    }
    return "nominal";
  }
  if (value instanceof Date) return "temporal";
  if (typeof value === "boolean") return "nominal";
  return "nominal";
};
var getFieldTypeIcon = (type) => {
  switch (type) {
    case "quantitative":
      return "#";
    case "temporal":
      return "T";
    case "ordinal":
      return "\u2195";
    case "nominal":
    default:
      return "Abc";
  }
};

// src/vega/fieldPill.jsx
import { Button as Button3 } from "@jet-admin/ui";
var getTypeClass = (type) => {
  switch (type) {
    case "quantitative":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "temporal":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "ordinal":
      return "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200";
    case "nominal":
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
};
var FieldPill = ({
  field,
  // { name, type, icon? }
  onRemove,
  // called when × is clicked (shelf mode)
  onClick,
  // called when pill is clicked
  isDragging = false,
  isCompact = false,
  className = ""
}) => {
  const icon = field.icon || getFieldTypeIcon(field.type);
  const typeClass = getTypeClass(field.type);
  const handleDragStart = useCallback4((e) => {
    e.dataTransfer.setData("application/json", JSON.stringify(field));
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  }, [field]);
  const handleDragEnd = useCallback4((e) => {
    e.currentTarget.style.opacity = "1";
  }, []);
  return /* @__PURE__ */ React4.createElement(
    "div",
    {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onClick,
      className: `flex items-center gap-1.5 rounded font-medium cursor-grab shadow-sm border transition-shadow hover:shadow-md ${typeClass} ${isCompact ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1.5 text-xs"} ${isDragging ? "opacity-50" : ""} ${className}`,
      title: `${field.name} (${field.type})`
    },
    /* @__PURE__ */ React4.createElement("span", { className: "opacity-70 font-mono scale-90" }, icon),
    /* @__PURE__ */ React4.createElement("span", { className: "truncate" }, field.name),
    field.aggregate && field.aggregate !== "none" && /* @__PURE__ */ React4.createElement("span", { className: "text-[9px] uppercase tracking-wider bg-white/50 px-1 rounded ml-1 font-bold", title: `Aggregate: ${field.aggregate}` }, field.aggregate.slice(0, 3)),
    onRemove && /* @__PURE__ */ React4.createElement(
      Button3,
      {
        type: "button",
        variant: "ghost",
        size: "icon",
        onClick: (e) => {
          e.stopPropagation();
          onRemove();
        },
        className: "ml-auto h-4 w-4 rounded-full hover:bg-black/10 text-xs text-slate-500",
        title: "Remove"
      },
      "\xD7"
    )
  );
};
FieldPill.propTypes = {
  field: PropTypes3.shape({
    name: PropTypes3.string.isRequired,
    type: PropTypes3.string.isRequired,
    icon: PropTypes3.string,
    aggregate: PropTypes3.string
  }).isRequired,
  onRemove: PropTypes3.func,
  onClick: PropTypes3.func,
  isDragging: PropTypes3.bool,
  isCompact: PropTypes3.bool,
  className: PropTypes3.string
};

// src/vega/dataFieldPanel.jsx
import { FiSearch, FiDatabase, FiPlus, FiZap } from "react-icons/fi";
import { BiGitMerge as BiGitMerge2 } from "react-icons/bi";
import { MdOutput as MdOutput2 } from "react-icons/md";
import { Button as Button4, Input as Input2 } from "@jet-admin/ui";
var collectArrayPaths = (obj, prefix = "ctx", depth = 0, maxDepth = 4) => {
  const results = [];
  if (!obj || typeof obj !== "object" || depth > maxDepth) return results;
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const fullPath = `${prefix}.${key}`;
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
      results.push({
        path: `{{${fullPath}}}`,
        label: fullPath.replace(/^ctx\./, ""),
        sampleKeys: Object.keys(val[0]),
        rowCount: val.length
      });
    } else if (val && typeof val === "object" && !Array.isArray(val)) {
      results.push(...collectArrayPaths(val, fullPath, depth + 1, maxDepth));
    }
  }
  return results;
};
var DataFieldPanel = ({
  workflowContext,
  dataSource,
  onDataSourceChange,
  onFieldClick,
  workflow,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState4("");
  const [manualField, setManualField] = useState4("");
  const [showManualAdd, setShowManualAdd] = useState4(false);
  const [showSuggestions, setShowSuggestions] = useState4(false);
  const suggestionsRef = useRef3(null);
  useEffect3(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const schemaSuggestions = useMemo3(() => {
    if (!workflow) return [];
    const schema = extractWorkflowSchema(workflow);
    const suggestions = [];
    for (const nodeOut of schema.nodeOutputs) {
      suggestions.push({
        path: nodeOut.path,
        label: nodeOut.name,
        description: nodeOut.description,
        category: "node",
        nodeTitle: nodeOut.nodeTitle,
        nodeType: nodeOut.nodeType
      });
    }
    for (const wfOut of schema.workflowOutputs) {
      suggestions.push({
        path: wfOut.path,
        label: wfOut.name,
        description: wfOut.description,
        category: "output"
      });
    }
    return suggestions;
  }, [workflow]);
  const ctxArrayPaths = useMemo3(() => {
    if (!workflowContext) return [];
    return collectArrayPaths(workflowContext);
  }, [workflowContext]);
  const allSuggestions = useMemo3(() => {
    const seen = /* @__PURE__ */ new Set();
    const combined = [];
    for (const arr of ctxArrayPaths) {
      if (!seen.has(arr.path)) {
        seen.add(arr.path);
        combined.push({
          ...arr,
          source: "runtime",
          description: `${arr.rowCount} rows, fields: ${arr.sampleKeys.slice(0, 4).join(", ")}${arr.sampleKeys.length > 4 ? "..." : ""}`
        });
      }
    }
    for (const s of schemaSuggestions) {
      if (!seen.has(s.path)) {
        seen.add(s.path);
        combined.push({ ...s, source: "schema" });
      }
    }
    return combined;
  }, [ctxArrayPaths, schemaSuggestions]);
  const fields = useMemo3(() => {
    if (!workflowContext || !dataSource) return [];
    const match = dataSource.match(/\{\{ctx\.([^}]+)\}\}/);
    if (!match) return [];
    const path = match[1];
    const parts = path.split(".");
    let current = workflowContext;
    for (const part of parts) {
      if (current === void 0 || current === null) break;
      const arrMatch = part.match(/^(.+)\[(\d+)\]$/);
      if (arrMatch) {
        current = current[arrMatch[1]]?.[parseInt(arrMatch[2])];
      } else {
        current = current[part];
      }
    }
    if (Array.isArray(current)) {
      return inferFieldsFromData(current);
    }
    if (current && typeof current === "object" && !Array.isArray(current)) {
      return Object.keys(current).map((key) => ({
        name: key,
        type: typeof current[key] === "number" ? "quantitative" : "nominal",
        icon: typeof current[key] === "number" ? "#" : "Abc"
      }));
    }
    return [];
  }, [workflowContext, dataSource]);
  const filteredFields = useMemo3(() => {
    if (!searchTerm) return fields;
    const lower = searchTerm.toLowerCase();
    return fields.filter((f) => f.name.toLowerCase().includes(lower));
  }, [fields, searchTerm]);
  const quantFields = useMemo3(() => filteredFields.filter((f) => f.type === "quantitative"), [filteredFields]);
  const catFields = useMemo3(() => filteredFields.filter((f) => f.type === "nominal" || f.type === "ordinal"), [filteredFields]);
  const tempFields = useMemo3(() => filteredFields.filter((f) => f.type === "temporal"), [filteredFields]);
  const handleSelectSuggestion = useCallback5((suggestion) => {
    onDataSourceChange?.(suggestion.path);
    setShowSuggestions(false);
  }, [onDataSourceChange]);
  const handleAddManualField = useCallback5(() => {
    if (!manualField.trim()) return;
    if (onFieldClick) {
      onFieldClick({ name: manualField.trim(), type: "nominal", icon: "Abc" });
    }
    setManualField("");
    setShowManualAdd(false);
  }, [manualField, onFieldClick]);
  const getCategoryIcon2 = (cat) => {
    switch (cat) {
      case "node":
        return /* @__PURE__ */ React5.createElement(BiGitMerge2, { className: "w-3 h-3 shrink-0 text-emerald-600" });
      case "output":
        return /* @__PURE__ */ React5.createElement(MdOutput2, { className: "w-3 h-3 shrink-0 text-fuchsia-600" });
      case "runtime":
        return /* @__PURE__ */ React5.createElement(FiZap, { className: "w-3 h-3 shrink-0 text-amber-600" });
      default:
        return /* @__PURE__ */ React5.createElement(FiDatabase, { className: "w-3 h-3 shrink-0 text-slate-400" });
    }
  };
  const renderFieldGroup = (groupFields, label, colorClass) => {
    if (groupFields.length === 0) return null;
    return /* @__PURE__ */ React5.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React5.createElement("div", { className: `text-[10px] font-bold uppercase tracking-widest mb-2 px-1 ${colorClass}` }, label, " (", groupFields.length, ")"), /* @__PURE__ */ React5.createElement("div", { className: "flex flex-col gap-1.5 px-1" }, groupFields.map((field) => /* @__PURE__ */ React5.createElement(
      FieldPill,
      {
        key: field.name,
        field,
        onClick: () => onFieldClick?.(field),
        className: "w-full justify-start hover:scale-[1.02] transition-transform"
      }
    ))));
  };
  return /* @__PURE__ */ React5.createElement("div", { className: `flex flex-col h-full bg-white ${className}` }, /* @__PURE__ */ React5.createElement("div", { className: "p-3 border-b border-slate-100 bg-slate-50/50" }, /* @__PURE__ */ React5.createElement("div", { className: "flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2" }, /* @__PURE__ */ React5.createElement(FiDatabase, { className: "w-3.5 h-3.5 text-slate-400" }), /* @__PURE__ */ React5.createElement("span", null, "Data Source")), /* @__PURE__ */ React5.createElement("div", { className: "relative", ref: suggestionsRef }, /* @__PURE__ */ React5.createElement(
    Input2,
    {
      type: "text",
      value: dataSource || "",
      onChange: (e) => onDataSourceChange?.(e.target.value),
      onFocus: () => setShowSuggestions(true),
      placeholder: "Select or type a data path...",
      className: "w-full px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 font-mono",
      title: "Workflow data source path"
    }
  ), showSuggestions && allSuggestions.length > 0 && /* @__PURE__ */ React5.createElement("div", { className: "absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-md shadow-xl z-50 max-h-60 overflow-y-auto w-80" }, /* @__PURE__ */ React5.createElement("div", { className: "px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50 sticky top-0" }, "Available Variables (", allSuggestions.length, ")"), allSuggestions.map((s, i) => /* @__PURE__ */ React5.createElement(
    "div",
    {
      key: `${s.path}-${i}`,
      onClick: () => handleSelectSuggestion(s),
      className: `w-full text-left px-3 py-2 text-xs border-b border-slate-50 flex items-start gap-2.5 transition-colors cursor-pointer ${dataSource === s.path ? "bg-indigo-50 border-l-2 border-l-indigo-500" : "bg-white hover:bg-slate-50"}`
    },
    /* @__PURE__ */ React5.createElement("div", { className: "mt-0.5" }, getCategoryIcon2(s.source || s.category)),
    /* @__PURE__ */ React5.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React5.createElement("div", { className: "text-[11px] font-medium text-slate-700 font-mono truncate" }, s.label), /* @__PURE__ */ React5.createElement("div", { className: "text-[10px] text-slate-500 truncate mt-0.5", title: s.description }, s.description), s.nodeTitle && /* @__PURE__ */ React5.createElement("div", { className: "text-[9px] text-emerald-600 mt-1 uppercase tracking-wider font-semibold" }, "from: ", s.nodeTitle)),
    s.source === "runtime" && /* @__PURE__ */ React5.createElement("span", { className: "text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0" }, "LIVE")
  )))), dataSource && fields.length > 0 && /* @__PURE__ */ React5.createElement("div", { className: "mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded w-fit border border-emerald-100" }, /* @__PURE__ */ React5.createElement(FiZap, { className: "w-3 h-3" }), fields.length, " fields detected")), fields.length > 5 && /* @__PURE__ */ React5.createElement("div", { className: "px-3 py-2 border-b border-slate-100 bg-white" }, /* @__PURE__ */ React5.createElement("div", { className: "flex items-center gap-2 bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus-within:ring-1 focus-within:ring-indigo-400 focus-within:border-indigo-400 transition-shadow" }, /* @__PURE__ */ React5.createElement(FiSearch, { className: "w-3.5 h-3.5 text-slate-400" }), /* @__PURE__ */ React5.createElement(
    Input2,
    {
      type: "text",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      placeholder: "Filter fields...",
      className: "flex-1 text-xs bg-transparent outline-none text-slate-600 placeholder:text-slate-400"
    }
  ))), /* @__PURE__ */ React5.createElement("div", { className: "flex-1 overflow-y-auto p-3" }, fields.length > 0 ? /* @__PURE__ */ React5.createElement(React5.Fragment, null, renderFieldGroup(quantFields, "Measures", "text-emerald-600"), renderFieldGroup(catFields, "Dimensions", "text-blue-600"), renderFieldGroup(tempFields, "Temporal", "text-amber-600")) : /* @__PURE__ */ React5.createElement("div", { className: "flex flex-col items-center justify-center h-full py-8 text-center px-4" }, /* @__PURE__ */ React5.createElement(FiDatabase, { className: "w-8 h-8 mb-3 text-slate-200" }), /* @__PURE__ */ React5.createElement("p", { className: "text-xs text-slate-500 leading-relaxed mb-4" }, dataSource ? "Run the workflow to detect fields from the data" : "Choose a data source above or type a ctx path"), !dataSource && allSuggestions.length > 0 && /* @__PURE__ */ React5.createElement(
    Button4,
    {
      type: "button",
      size: "sm",
      onClick: () => setShowSuggestions(true),
      className: "h-7 px-3 text-[10px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 uppercase tracking-wider"
    },
    "Browse ",
    allSuggestions.length,
    " Variables"
  )), /* @__PURE__ */ React5.createElement("div", { className: "mt-4 pt-4 border-t border-slate-100" }, showManualAdd ? /* @__PURE__ */ React5.createElement("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ React5.createElement(
    Input2,
    {
      type: "text",
      value: manualField,
      onChange: (e) => setManualField(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && handleAddManualField(),
      placeholder: "Type field_name & press Enter...",
      className: "w-full px-2.5 py-1.5 text-xs font-mono text-slate-700 bg-white border border-slate-300 rounded focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm",
      autoFocus: true
    }
  ), /* @__PURE__ */ React5.createElement("div", { className: "flex items-center gap-2 justify-end" }, /* @__PURE__ */ React5.createElement(
    Button4,
    {
      type: "button",
      variant: "ghost",
      size: "sm",
      onClick: () => setShowManualAdd(false),
      className: "h-6 px-2 text-xs text-slate-500 hover:text-slate-700 font-medium"
    },
    "Cancel"
  ), /* @__PURE__ */ React5.createElement(
    Button4,
    {
      type: "button",
      size: "sm",
      onClick: handleAddManualField,
      className: "h-6 px-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
    },
    "Add Field"
  ))) : /* @__PURE__ */ React5.createElement(
    Button4,
    {
      type: "button",
      variant: "outline",
      onClick: () => setShowManualAdd(true),
      className: "w-full h-auto py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 border-dashed border-slate-300 hover:bg-slate-100 hover:border-slate-400 hover:text-slate-600"
    },
    /* @__PURE__ */ React5.createElement(FiPlus, { className: "w-3.5 h-3.5 mr-1" }),
    /* @__PURE__ */ React5.createElement("span", null, "Add Field Manually")
  ))));
};
DataFieldPanel.propTypes = {
  workflowContext: PropTypes4.object,
  dataSource: PropTypes4.string,
  onDataSourceChange: PropTypes4.func,
  onFieldClick: PropTypes4.func,
  workflow: PropTypes4.object,
  className: PropTypes4.string
};

// src/vega/encodingShelf.jsx
import React6, { useState as useState5, useCallback as useCallback6, useRef as useRef4 } from "react";
import PropTypes5 from "prop-types";
import { Button as Button5, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
var CHANNEL_LABELS = {
  x: "X Axis",
  y: "Y Axis",
  color: "Color",
  size: "Size",
  shape: "Shape",
  opacity: "Opacity",
  row: "Row",
  column: "Column",
  detail: "Detail",
  text: "Text",
  strokeDash: "Dash"
};
var CHANNEL_ICONS = {
  x: "\u2194",
  y: "\u2195",
  color: "\u{1F3A8}",
  size: "\u25C9",
  shape: "\u25C6",
  opacity: "\u25D0",
  row: "\u25A6",
  column: "\u25A5",
  detail: "\u2299",
  text: "T",
  strokeDash: "\u254C"
};
var EncodingShelf = ({
  channel,
  value,
  onChange,
  onRemove,
  className = ""
}) => {
  const [isDragOver, setIsDragOver] = useState5(false);
  const dropRef = useRef4(null);
  const label = CHANNEL_LABELS[channel] || channel;
  const icon = CHANNEL_ICONS[channel] || "\u2022";
  const handleDragOver = useCallback6((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback6(() => {
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback6((e) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData("application/json"));
      if (data && data.name) {
        let defaultAggregate = void 0;
        if ((channel === "y" || channel === "size" || channel === "opacity") && data.type === "quantitative") {
          defaultAggregate = "sum";
        }
        onChange({
          field: data.name,
          type: data.type || "nominal",
          aggregate: defaultAggregate,
          title: "",
          sort: null
        });
      }
    } catch (err) {
    }
  }, [channel, onChange]);
  const handleTypeChange = useCallback6((newType) => {
    if (value) onChange({ ...value, type: newType });
  }, [value, onChange]);
  const handleAggChange = useCallback6((newAgg) => {
    if (value) onChange({ ...value, aggregate: newAgg === "none" ? void 0 : newAgg });
  }, [value, onChange]);
  const handleSortToggle = useCallback6(() => {
    if (!value) return;
    const sortStates = [null, "ascending", "descending"];
    const current = sortStates.indexOf(value.sort);
    const next = sortStates[(current + 1) % sortStates.length];
    onChange({ ...value, sort: next });
  }, [value, onChange]);
  const isEmpty = !value || !value.field;
  const shelfClass = [
    "flex items-center w-full min-h-[36px] bg-white border border-slate-200 rounded p-1 gap-2 transition-colors",
    isEmpty ? "border-dashed border-slate-300 bg-slate-50/50" : "",
    isDragOver ? "border-indigo-400 bg-indigo-50/50 shadow-inner" : "",
    className
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ React6.createElement(
    "div",
    {
      ref: dropRef,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      className: shelfClass
    },
    /* @__PURE__ */ React6.createElement("div", { className: "flex items-center justify-start w-24 shrink-0 px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest gap-2 border-r border-slate-100" }, /* @__PURE__ */ React6.createElement("span", { className: "text-slate-300 text-sm" }, icon), /* @__PURE__ */ React6.createElement("span", { className: "truncate" }, label)),
    /* @__PURE__ */ React6.createElement("div", { className: "flex-1 flex flex-wrap items-center gap-2 min-w-0 pr-1" }, isEmpty ? /* @__PURE__ */ React6.createElement("span", { className: "text-xs text-slate-400 italic px-2" }, isDragOver ? "Release to assign" : "Drop a field here") : /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(
      FieldPill,
      {
        field: value,
        onRemove,
        isCompact: true
      }
    ), /* @__PURE__ */ React6.createElement(Select, { value: value.type || "nominal", onValueChange: (val) => handleTypeChange(val) }, /* @__PURE__ */ React6.createElement(SelectTrigger, { className: "h-6 px-1.5 py-0.5 text-[11px]", title: "Data type" }, /* @__PURE__ */ React6.createElement(SelectValue, { placeholder: "Select type" })), /* @__PURE__ */ React6.createElement(SelectContent, { className: "z-[200]" }, FIELD_TYPES.map((t) => /* @__PURE__ */ React6.createElement(SelectItem, { key: t, value: t }, t.charAt(0).toUpperCase() + t.slice(1))))), (value.type === "quantitative" || value.aggregate) && /* @__PURE__ */ React6.createElement(Select, { value: value.aggregate || "none", onValueChange: (val) => handleAggChange(val) }, /* @__PURE__ */ React6.createElement(SelectTrigger, { className: "h-6 px-1.5 py-0.5 text-[11px]", title: "Aggregation" }, /* @__PURE__ */ React6.createElement(SelectValue, { placeholder: "Select agg" })), /* @__PURE__ */ React6.createElement(SelectContent, { className: "z-[200]" }, /* @__PURE__ */ React6.createElement(SelectItem, { value: "none" }, "no agg"), AGGREGATE_TYPES.map((a) => /* @__PURE__ */ React6.createElement(SelectItem, { key: a, value: a }, a)))), /* @__PURE__ */ React6.createElement(
      Button5,
      {
        type: "button",
        variant: "ghost",
        size: "icon",
        onClick: handleSortToggle,
        className: "ml-auto h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 text-xs",
        title: `Sort: ${value.sort || "default"}`
      },
      value.sort === "ascending" ? "\u2191" : value.sort === "descending" ? "\u2193" : "\u2195"
    )))
  );
};
EncodingShelf.propTypes = {
  channel: PropTypes5.string.isRequired,
  value: PropTypes5.shape({
    field: PropTypes5.string,
    type: PropTypes5.string,
    aggregate: PropTypes5.string,
    sort: PropTypes5.string,
    title: PropTypes5.string
  }),
  onChange: PropTypes5.func.isRequired,
  onRemove: PropTypes5.func,
  className: PropTypes5.string
};

// src/vega/markSelector.jsx
import React7 from "react";
import PropTypes6 from "prop-types";
import { Button as Button6 } from "@jet-admin/ui";
var MARK_OPTIONS = [
  { key: "auto", label: "Auto", icon: "\u2726", desc: "Best fit based on field types" },
  { key: "bar", label: "Bar", icon: "\u25A5", desc: "Compare categories" },
  { key: "line", label: "Line", icon: "\u27CB", desc: "Trends over time" },
  { key: "area", label: "Area", icon: "\u25A4", desc: "Volume over time" },
  { key: "point", label: "Scatter", icon: "\u2299", desc: "Correlation" },
  { key: "arc", label: "Pie", icon: "\u25D5", desc: "Part of whole" },
  { key: "donut", label: "Donut", icon: "\u25D1", desc: "Part of whole (ring)" },
  { key: "rect", label: "Heat", icon: "\u25A6", desc: "Density matrix" },
  { key: "tick", label: "Tick", icon: "|", desc: "Distribution marks" },
  { key: "circle", label: "Bubble", icon: "\u25CF", desc: "Sized circles" }
];
var MarkSelector = ({ value, onChange, className = "" }) => {
  return /* @__PURE__ */ React7.createElement("div", { className: `flex flex-wrap gap-1 w-full ${className}` }, MARK_OPTIONS.map((opt) => {
    const isSelected = value === opt.key;
    return /* @__PURE__ */ React7.createElement(
      Button6,
      {
        key: opt.key,
        type: "button",
        variant: isSelected ? "outline" : "ghost",
        size: "sm",
        onClick: () => onChange(opt.key),
        className: `h-auto py-1.5 flex-1 min-w-[60px] px-2 text-xs font-medium ${isSelected ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm hover:text-indigo-800 hover:bg-indigo-100" : "text-slate-600 border-transparent hover:bg-slate-100"}`,
        title: `${opt.label}: ${opt.desc}`
      },
      /* @__PURE__ */ React7.createElement("span", { className: `mr-1.5 ${isSelected ? "text-indigo-500" : "text-slate-400"}` }, opt.icon),
      /* @__PURE__ */ React7.createElement("span", { className: "hidden lg:inline" }, opt.label)
    );
  }));
};
MarkSelector.propTypes = {
  value: PropTypes6.string,
  onChange: PropTypes6.func.isRequired,
  className: PropTypes6.string
};

// src/vega/shelfBuilder.jsx
import { FiSettings, FiChevronDown as FiChevronDown2, FiChevronRight as FiChevronRight2, FiDatabase as FiDatabase2 } from "react-icons/fi";
import { MdOutlineAutoGraph } from "react-icons/md";
import { Button as Button7, Input as Input3, Select as Select2, SelectContent as SelectContent2, SelectItem as SelectItem2, SelectTrigger as SelectTrigger2, SelectValue as SelectValue2 } from "@jet-admin/ui";
var VEGA_STRINGS = {
  WIDGET_DATASET_FIELD_MAPPING_BUTTON: "Mappings"
};
var PRIMARY_SHELVES = ["x", "y", "color", "size"];
var SECONDARY_SHELVES = ["row", "column", "shape", "opacity", "detail", "text"];
var ShelfBuilder = ({
  widgetEditorForm,
  workflowContext,
  workflows
}) => {
  const [shelfSpec, setShelfSpec] = useState6(() => {
    let savedSpec = widgetEditorForm.values.widgetConfig?.shelfSpec;
    if (typeof savedSpec === "string") {
      try {
        savedSpec = JSON.parse(savedSpec);
      } catch (e) {
        savedSpec = null;
      }
    }
    return savedSpec || getDefaultShelfSpec();
  });
  useEffect4(() => {
    let savedSpec = widgetEditorForm.values.widgetConfig?.shelfSpec;
    if (savedSpec) {
      if (typeof savedSpec === "string") {
        try {
          savedSpec = JSON.parse(savedSpec);
        } catch (e) {
          return;
        }
      }
      if (JSON.stringify(savedSpec) !== JSON.stringify(shelfSpec)) {
        setShelfSpec(savedSpec);
      }
    }
  }, [widgetEditorForm.values.widgetConfig?.shelfSpec]);
  const [showSecondary, setShowSecondary] = useState6(false);
  const [showStyle, setShowStyle] = useState6(false);
  const selectedWorkflow = useMemo4(() => {
    const wID = widgetEditorForm.values.workflowID;
    if (!wID || !workflows) return null;
    return workflows.find((w) => String(w.workflowID) === String(wID));
  }, [widgetEditorForm.values.workflowID, workflows]);
  const resolvedMark = useMemo4(() => {
    if (shelfSpec.mark === "auto" || !shelfSpec.mark) {
      return inferMarkType(shelfSpec.encoding);
    }
    return shelfSpec.mark;
  }, [shelfSpec.mark, shelfSpec.encoding]);
  const handleChannelChange = useCallback7((channel, value) => {
    setShelfSpec((prev) => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        [channel]: value
      }
    }));
  }, []);
  const handleChannelRemove = useCallback7((channel) => {
    setShelfSpec((prev) => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        [channel]: null
      }
    }));
  }, []);
  const handleMarkChange = useCallback7((mark) => {
    setShelfSpec((prev) => ({ ...prev, mark }));
  }, []);
  const handleDataSourceChange = useCallback7((newSource) => {
    setShelfSpec((prev) => ({ ...prev, dataSource: newSource }));
  }, []);
  const handleConfigChange = useCallback7((key, value) => {
    setShelfSpec((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  }, []);
  const handleFieldQuickAdd = useCallback7((field) => {
    setShelfSpec((prev) => {
      const enc = { ...prev.encoding };
      if (!enc.x?.field) {
        enc.x = { field: field.name, type: field.type };
      } else if (!enc.y?.field) {
        const agg = field.type === "quantitative" ? "sum" : void 0;
        enc.y = { field: field.name, type: field.type, aggregate: agg };
      } else if (!enc.color?.field) {
        enc.color = { field: field.name, type: field.type };
      } else if (!enc.size?.field) {
        enc.size = { field: field.name, type: field.type };
      }
      return { ...prev, encoding: enc };
    });
  }, []);
  const [isOpen, setIsOpen] = useState6(false);
  useEffect4(() => {
    const timer = setTimeout(() => {
      const vegaSpec = generateVegaLiteSpec(shelfSpec);
      if (shelfSpec.dataSource) {
        vegaSpec.data = { values: shelfSpec.dataSource };
      }
      widgetEditorForm.setFieldValue("widgetConfig.shelfSpec", shelfSpec);
      widgetEditorForm.setFieldValue("widgetConfig.vegaSpec", vegaSpec);
    }, 200);
    return () => clearTimeout(timer);
  }, [shelfSpec]);
  const isWorkflowSelected = !!selectedWorkflow;
  return /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement(
    Button7,
    {
      onClick: () => setIsOpen(true),
      type: "button",
      variant: "outline",
      size: "sm",
      className: "h-8 text-xs"
    },
    /* @__PURE__ */ React8.createElement(MdOutlineAutoGraph, { className: "inline-block h-3 w-3 mr-2" }),
    VEGA_STRINGS.WIDGET_DATASET_FIELD_MAPPING_BUTTON
  ), isOpen && /* @__PURE__ */ React8.createElement("div", { className: "fixed inset-0 z-[100] flex items-center justify-center bg-slate-800/40 backdrop-blur-sm p-4 sm:p-6" }, /* @__PURE__ */ React8.createElement("div", { className: "bg-white rounded shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden relative border border-slate-200" }, /* @__PURE__ */ React8.createElement("div", { className: "flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0" }, /* @__PURE__ */ React8.createElement("div", { className: "flex items-center gap-2 text-slate-800" }, /* @__PURE__ */ React8.createElement(MdOutlineAutoGraph, { className: "w-5 h-5 text-indigo-500" }), /* @__PURE__ */ React8.createElement("h3", { className: "text-base font-bold" }, "Visual Chart Editor")), /* @__PURE__ */ React8.createElement(
    Button7,
    {
      onClick: () => setIsOpen(false),
      type: "button",
      variant: "ghost",
      size: "icon",
      className: "h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
    },
    /* @__PURE__ */ React8.createElement("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" }, /* @__PURE__ */ React8.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M6 18L18 6M6 6l12 12" }))
  )), /* @__PURE__ */ React8.createElement("div", { className: "flex-1 overflow-hidden bg-slate-50/50 flex p-5 gap-5" }, !isWorkflowSelected ? /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col items-center justify-center w-full h-full text-center border-2 border-dashed border-slate-300 rounded bg-white" }, /* @__PURE__ */ React8.createElement(FiDatabase2, { className: "w-10 h-10 mb-3 text-slate-300" }), /* @__PURE__ */ React8.createElement("p", { className: "text-sm font-semibold text-slate-600 mb-1" }, "No Data Source Selected"), /* @__PURE__ */ React8.createElement("p", { className: "text-xs text-slate-400" }, "Select a Workflow in the configuration panel to start building your chart.")) : /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col w-64 shrink-0 bg-white border border-slate-100 rounded shadow-sm overflow-hidden h-full" }, /* @__PURE__ */ React8.createElement("div", { className: "p-3 border-b border-slate-100 bg-white" }, /* @__PURE__ */ React8.createElement(Select2, { value: shelfSpec.dataSource || "", onValueChange: (val) => handleDataSourceChange(val) }, /* @__PURE__ */ React8.createElement(SelectTrigger2, { className: "text-xs font-medium" }, /* @__PURE__ */ React8.createElement(SelectValue2, { placeholder: "Select Data Input" })), /* @__PURE__ */ React8.createElement(SelectContent2, { className: "z-[200]" }, selectedWorkflow && /* @__PURE__ */ React8.createElement(SelectItem2, { value: "workflow" }, "Workflow Output"), workflowContext && Object.keys(workflowContext).map((key) => /* @__PURE__ */ React8.createElement(SelectItem2, { key, value: `{{ctx.${key}}}` }, `ctx.${key}`))))), /* @__PURE__ */ React8.createElement("div", { className: "flex-1 overflow-y-auto outline-none" }, /* @__PURE__ */ React8.createElement(
    DataFieldPanel,
    {
      workflowContext,
      dataSource: shelfSpec.dataSource,
      onDataSourceChange: handleDataSourceChange,
      onFieldClick: handleFieldQuickAdd,
      workflow: selectedWorkflow,
      className: "h-full"
    }
  ))), /* @__PURE__ */ React8.createElement("div", { className: "flex-1 flex flex-col h-full overflow-y-auto pr-2 gap-1.5" }, /* @__PURE__ */ React8.createElement("label", { className: "text-[11px] font-bold text-slate-400 uppercase tracking-widest px-1 mb-1" }, "Encoding Shelves"), /* @__PURE__ */ React8.createElement("div", { className: "bg-white border border-slate-100 rounded shadow-sm p-4 flex flex-col gap-4" }, PRIMARY_SHELVES.map((ch) => /* @__PURE__ */ React8.createElement(
    EncodingShelf,
    {
      key: ch,
      channel: ch,
      value: shelfSpec.encoding[ch],
      onChange: (val) => handleChannelChange(ch, val),
      onRemove: () => handleChannelRemove(ch)
    }
  ))), /* @__PURE__ */ React8.createElement("div", { className: "bg-white border border-slate-100 rounded shadow-sm mt-3" }, /* @__PURE__ */ React8.createElement(
    "div",
    {
      onClick: () => setShowSecondary(!showSecondary),
      className: "w-full flex items-center justify-start p-3 border-b border-slate-100 hover:bg-slate-50 transition-colors focus:outline-none bg-white font-medium cursor-pointer"
    },
    showSecondary ? /* @__PURE__ */ React8.createElement(FiChevronDown2, { className: "w-4 h-4 mr-2 text-slate-400" }) : /* @__PURE__ */ React8.createElement(FiChevronRight2, { className: "w-4 h-4 mr-2 text-slate-400" }),
    /* @__PURE__ */ React8.createElement("span", { className: "text-[11px] font-bold uppercase tracking-wider text-slate-600" }, "More Encoding Channels ", /* @__PURE__ */ React8.createElement("span", { className: "text-indigo-500 ml-1" }, "(", SECONDARY_SHELVES.filter((ch) => shelfSpec.encoding[ch]?.field).length, " active)"))
  ), showSecondary && /* @__PURE__ */ React8.createElement("div", { className: "p-4 pt-3 flex flex-col gap-4 border-t border-slate-100 bg-slate-50/50" }, SECONDARY_SHELVES.map((ch) => /* @__PURE__ */ React8.createElement(
    EncodingShelf,
    {
      key: ch,
      channel: ch,
      value: shelfSpec.encoding[ch],
      onChange: (val) => handleChannelChange(ch, val),
      onRemove: () => handleChannelRemove(ch)
    }
  ))))), /* @__PURE__ */ React8.createElement("div", { className: "flex flex-col w-72 shrink-0 h-full overflow-y-auto pl-2 gap-1.5" }, /* @__PURE__ */ React8.createElement(
    "div",
    {
      onClick: () => setShowStyle(!showStyle),
      className: "flex items-center gap-2 p-1 text-slate-500 hover:text-slate-800 focus:outline-none transition-colors mb-1 bg-transparent cursor-pointer"
    },
    showStyle ? /* @__PURE__ */ React8.createElement(FiChevronDown2, { className: "w-4 h-4" }) : /* @__PURE__ */ React8.createElement(FiChevronRight2, { className: "w-4 h-4" }),
    /* @__PURE__ */ React8.createElement("span", { className: "text-[11px] font-bold uppercase tracking-widest" }, "Chart Style & Settings")
  ), showStyle && /* @__PURE__ */ React8.createElement("div", { className: "bg-white border border-slate-100 rounded shadow-sm p-4 space-y-6" }, /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("label", { className: "block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2" }, "Marks"), /* @__PURE__ */ React8.createElement("div", { className: "bg-slate-50 border border-slate-100 rounded p-2" }, /* @__PURE__ */ React8.createElement(MarkSelector, { value: shelfSpec.mark || "auto", onChange: handleMarkChange }), shelfSpec.mark === "auto" && /* @__PURE__ */ React8.createElement("div", { className: "text-[10px] text-slate-400 italic p-1.5 text-center mt-1.5" }, "Auto-resolved to: ", /* @__PURE__ */ React8.createElement("span", { className: "font-semibold text-slate-600 not-italic ml-1" }, resolvedMark)))), /* @__PURE__ */ React8.createElement("div", { className: "border-t border-slate-100 pt-5 space-y-4" }, /* @__PURE__ */ React8.createElement("label", { className: "block text-[11px] font-bold text-slate-400 uppercase tracking-widest" }, "Appearance"), /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("label", { className: "block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5" }, "Chart Title"), /* @__PURE__ */ React8.createElement(
    Input3,
    {
      type: "text",
      value: shelfSpec.config?.title || "",
      onChange: (e) => handleConfigChange("title", e.target.value),
      placeholder: "Untitled Chart",
      className: "w-full px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
    }
  )), /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("label", { className: "block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5" }, "Color Palette"), /* @__PURE__ */ React8.createElement(Select2, { value: shelfSpec.config?.colorScheme || "tableau10", onValueChange: (val) => handleConfigChange("colorScheme", val) }, /* @__PURE__ */ React8.createElement(SelectTrigger2, { className: "text-xs" }, /* @__PURE__ */ React8.createElement(SelectValue2, { placeholder: "Select an option" })), /* @__PURE__ */ React8.createElement(SelectContent2, { className: "z-[200]" }, COLOR_SCHEMES.map((s) => /* @__PURE__ */ React8.createElement(SelectItem2, { key: s, value: s }, s))))), /* @__PURE__ */ React8.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("label", { className: "block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5" }, "Width"), /* @__PURE__ */ React8.createElement(Select2, { value: shelfSpec.config?.width === "container" ? "container" : "custom", onValueChange: (val) => handleConfigChange("width", val === "container" ? "container" : 400) }, /* @__PURE__ */ React8.createElement(SelectTrigger2, { className: "text-xs" }, /* @__PURE__ */ React8.createElement(SelectValue2, { placeholder: "Select an option" })), /* @__PURE__ */ React8.createElement(SelectContent2, { className: "z-[200]" }, /* @__PURE__ */ React8.createElement(SelectItem2, { value: "container" }, "Fill"), /* @__PURE__ */ React8.createElement(SelectItem2, { value: "custom" }, "Fixed")))), /* @__PURE__ */ React8.createElement("div", null, /* @__PURE__ */ React8.createElement("label", { className: "block text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5" }, "Height"), /* @__PURE__ */ React8.createElement(
    Input3,
    {
      type: "number",
      value: shelfSpec.config?.height || 300,
      onChange: (e) => handleConfigChange("height", parseInt(e.target.value) || 300),
      className: "w-full px-2.5 py-1.5 text-xs text-slate-700 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400"
    }
  )))))))), /* @__PURE__ */ React8.createElement("div", { className: "flex items-center justify-end px-5 py-3 border-t border-slate-100 bg-white shrink-0" }, /* @__PURE__ */ React8.createElement(
    Button7,
    {
      type: "button",
      onClick: () => setIsOpen(false),
      className: "px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm"
    },
    "Done"
  )))));
};
ShelfBuilder.propTypes = {
  widgetEditorForm: PropTypes7.object.isRequired,
  workflowContext: PropTypes7.object,
  workflows: PropTypes7.array
};

// src/vega/widgetAdvancedOptions.jsx
import React9, { useCallback as useCallback8 } from "react";
import PropTypes8 from "prop-types";
import { WIDGET_ADVANCED_OPTIONS } from "@jet-admin/widget-types";
import { Input as Input4, Select as Select3, SelectContent as SelectContent3, SelectItem as SelectItem3, SelectTrigger as SelectTrigger3, SelectValue as SelectValue3 } from "@jet-admin/ui";
var WidgetAdvancedOptions = ({ widgetForm, parentWidgetType }) => {
  WidgetAdvancedOptions.propTypes = {
    widgetForm: PropTypes8.object.isRequired,
    parentWidgetType: PropTypes8.string.isRequired
  };
  const renderOption = useCallback8(
    (option) => {
      const {
        key,
        type,
        description,
        options: selectOptions,
        // eslint-disable-next-line no-unused-vars
        ...rest
      } = option;
      if (!option.relevantWidgets.includes(parentWidgetType)) return null;
      const formValue = key.split(".").reduce((acc, part) => acc?.[part], widgetForm.values);
      const defaultValue = option.defaultValue;
      const commonProps = {
        key,
        className: "w-full text-xs p-1.5 bg-slate-50 border border-slate-300 rounded",
        value: formValue ? formValue : type === "boolean" ? "false" : defaultValue,
        onChange: (e) => {
          const value = type === "number" ? +e.target.value : type === "boolean" ? e.target.value === "true" : e.target.value;
          widgetForm.setFieldValue(key, value);
        }
      };
      switch (type) {
        case "boolean":
          return /* @__PURE__ */ React9.createElement(Select3, { value: commonProps.value !== void 0 ? String(commonProps.value) : "false", onValueChange: (val) => {
            const value = type === "number" ? +val : type === "boolean" ? val === "true" : val;
            widgetForm.setFieldValue(key, value);
          } }, /* @__PURE__ */ React9.createElement(SelectTrigger3, { className: "text-xs" }, /* @__PURE__ */ React9.createElement(SelectValue3, { placeholder: "Select an option" })), /* @__PURE__ */ React9.createElement(SelectContent3, null, /* @__PURE__ */ React9.createElement(SelectItem3, { value: "true", className: "text-slate-500 text-xs" }, "Yes"), /* @__PURE__ */ React9.createElement(SelectItem3, { value: "false", className: "text-slate-500 text-xs" }, "No")));
        case "color":
          return /* @__PURE__ */ React9.createElement(Input4, { type: "color", ...commonProps });
        case "select":
          return /* @__PURE__ */ React9.createElement(Select3, { value: commonProps.value !== void 0 ? String(commonProps.value) : void 0, onValueChange: (val) => {
            const value = type === "number" ? +val : val;
            widgetForm.setFieldValue(key, value);
          } }, /* @__PURE__ */ React9.createElement(SelectTrigger3, { className: "text-xs" }, /* @__PURE__ */ React9.createElement(SelectValue3, { placeholder: "Select an option" })), /* @__PURE__ */ React9.createElement(SelectContent3, null, selectOptions.map((opt) => /* @__PURE__ */ React9.createElement(
            SelectItem3,
            {
              key: opt,
              value: opt,
              className: "text-slate-500 text-xs"
            },
            opt.charAt(0).toUpperCase() + opt.slice(1)
          ))));
        default:
          return /* @__PURE__ */ React9.createElement(
            Input4,
            {
              ...commonProps,
              className: `placeholder:text-slate-400 w-full text-xs bg-slate-50 border border-slate-300 text-slate-700 rounded block py-1 px-1.5 focus:outline-none focus:border-slate-400`,
              type,
              placeholder: description
            }
          );
      }
    },
    [widgetForm]
  );
  return /* @__PURE__ */ React9.createElement("div", { className: "grid grid-cols-2 gap-4 p-0 mt-2" }, WIDGET_ADVANCED_OPTIONS.filter(
    (option) => option.relevantWidgets.includes(parentWidgetType)
  ).map((option) => /* @__PURE__ */ React9.createElement("div", { key: option.key, className: "col-span-2" }, /* @__PURE__ */ React9.createElement("label", { className: "block mb-2 text-xs font-medium text-slate-600" }, option.name, /* @__PURE__ */ React9.createElement("span", { className: "text-slate-400 text-[10px] block" }, option.description)), widgetForm && renderOption(option))));
};

// src/vega/vegaConfigEditor.jsx
var VEGA_STRINGS2 = {
  WIDGET_EDITOR_FORM_SETTINGS_BUTTON: "Settings",
  WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL: "Refresh interval"
};
var VegaConfigEditor = ({
  widgetEditorForm,
  workflowContext,
  workflows,
  selectedWorkflow
}) => {
  const isVegaLite = widgetEditorForm.values.widgetType === "vega-lite";
  const currentMode = widgetEditorForm.values.widgetConfig?.editorMode || (isVegaLite ? "visual" : "raw");
  const [showParseWarning, setShowParseWarning] = useState7(false);
  const [parseWarningsList, setParseWarningsList] = useState7([]);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState7(false);
  const handleModeSwitch = (newMode) => {
    if (newMode === currentMode) return;
    if (newMode === "visual") {
      try {
        const currentSpecText = widgetEditorForm.values.widgetConfig?.vegaSpec;
        if (currentSpecText) {
          const specObj = typeof currentSpecText === "string" ? JSON.parse(currentSpecText) : currentSpecText;
          const { success, config, warnings } = parseVegaLiteSpec(specObj);
          if (!success || warnings.length > 0) {
            setParseWarningsList(warnings || ["Could not fully parse custom modifications."]);
            setShowParseWarning(true);
            return;
          } else if (config) {
            widgetEditorForm.setFieldValue("widgetConfig.chartBuilderSpec", config);
          }
        }
      } catch (e) {
        setParseWarningsList([`Invalid JSON: ${e.message}`]);
        setShowParseWarning(true);
        return;
      }
    }
    widgetEditorForm.setFieldValue("widgetConfig.editorMode", newMode);
  };
  const confirmModeSwitch = () => {
    widgetEditorForm.setFieldValue("widgetConfig.editorMode", "visual");
    setShowParseWarning(false);
  };
  return /* @__PURE__ */ React10.createElement(React10.Fragment, null, isVegaLite && /* @__PURE__ */ React10.createElement("div", { className: "flex flex-row items-center gap-2 mb-3" }, /* @__PURE__ */ React10.createElement("span", { className: "text-xs font-medium text-muted-foreground" }, "Visual Editor"), /* @__PURE__ */ React10.createElement(Switch, { className: "h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5", checked: currentMode === "visual", onCheckedChange: (checked) => handleModeSwitch(checked ? "visual" : "raw") })), isVegaLite && /* @__PURE__ */ React10.createElement("div", { className: "flex flex-row items-center justify-stretch gap-3 mb-3" }, currentMode === "visual" && !showParseWarning && /* @__PURE__ */ React10.createElement(
    ShelfBuilder,
    {
      widgetEditorForm,
      workflowContext,
      workflows
    }
  ), /* @__PURE__ */ React10.createElement(
    Button8,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      className: "h-8 text-xs",
      onClick: () => setIsSettingsDialogOpen(true)
    },
    /* @__PURE__ */ React10.createElement(FiSettings2, { className: "inline-block h-3 w-3 mr-2" }),
    VEGA_STRINGS2.WIDGET_EDITOR_FORM_SETTINGS_BUTTON
  ), /* @__PURE__ */ React10.createElement(Dialog, { open: isSettingsDialogOpen, onOpenChange: setIsSettingsDialogOpen }, /* @__PURE__ */ React10.createElement(DialogContent, { className: "max-w-lg" }, /* @__PURE__ */ React10.createElement(DialogHeader, null, /* @__PURE__ */ React10.createElement(DialogTitle, null, VEGA_STRINGS2.WIDGET_EDITOR_FORM_SETTINGS_BUTTON)), /* @__PURE__ */ React10.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ React10.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-xs font-medium text-foreground" }, `${VEGA_STRINGS2.WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL} (ms)`), /* @__PURE__ */ React10.createElement(
    Input5,
    {
      type: "number",
      name: "widgetConfig.refetchInterval",
      className: "text-sm",
      onChange: widgetEditorForm.handleChange,
      value: widgetEditorForm.values.widgetConfig?.refetchInterval || ""
    }
  )), /* @__PURE__ */ React10.createElement("div", { className: "border-t border-border pt-4" }, /* @__PURE__ */ React10.createElement(Label, { className: "text-xs font-medium text-foreground" }, "Advanced Options"), /* @__PURE__ */ React10.createElement("div", { className: "mt-2 max-h-[50vh] overflow-y-auto pr-1" }, /* @__PURE__ */ React10.createElement(
    WidgetAdvancedOptions,
    {
      widgetForm: widgetEditorForm,
      parentWidgetType: widgetEditorForm.values.widgetType
    }
  ))))))), showParseWarning && /* @__PURE__ */ React10.createElement("div", { className: "my-2 shrink-0 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-900/40 dark:bg-amber-950/20" }, /* @__PURE__ */ React10.createElement("div", { className: "flex items-start gap-2 text-xs" }, /* @__PURE__ */ React10.createElement(FiAlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }), /* @__PURE__ */ React10.createElement("div", { className: "flex-1" }, /* @__PURE__ */ React10.createElement("h4", { className: "mb-1 font-semibold text-amber-900 dark:text-amber-200" }, "Cannot fully parse chart config"), /* @__PURE__ */ React10.createElement("p", { className: "mb-2 text-amber-800 dark:text-amber-300" }, "Switching to Visual mode may cause you to lose manual modifications:"), /* @__PURE__ */ React10.createElement("ul", { className: "mb-3 list-disc pl-4 text-amber-800 dark:text-amber-300" }, parseWarningsList.map((w, i) => /* @__PURE__ */ React10.createElement("li", { key: i, className: "mb-0.5" }, w))), /* @__PURE__ */ React10.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React10.createElement(Button8, { type: "button", variant: "outline", size: "sm", onClick: () => setShowParseWarning(false), className: "h-7 text-xs" }, "Cancel"), /* @__PURE__ */ React10.createElement(Button8, { type: "button", size: "sm", onClick: confirmModeSwitch, className: "h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600" }, "Switch & Overwrite"))))), !showParseWarning && currentMode === "raw" && /* @__PURE__ */ React10.createElement("div", { className: "min-h-[300px] flex-1 overflow-auto rounded-md border border-border bg-background" }, /* @__PURE__ */ React10.createElement(
    VegaSpecEditor,
    {
      value: widgetEditorForm.values.widgetConfig?.vegaSpec,
      onChange: (spec) => widgetEditorForm.setFieldValue("widgetConfig.vegaSpec", spec),
      workflowContext,
      workflow: selectedWorkflow
    }
  )));
};
VegaConfigEditor.propTypes = {
  widgetEditorForm: PropTypes9.object.isRequired,
  workflowContext: PropTypes9.object,
  workflows: PropTypes9.array,
  selectedWorkflow: PropTypes9.object
};

// src/widget.map.js
import React13 from "react";
import { FaChartBar as FaChartBar2 } from "react-icons/fa";

// src/widget.config.js
var registerWidgets = () => {
};
var getDemoData = (type) => {
  switch (type) {
    case "vega":
      return {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        description: "A simple bar chart with embedded data.",
        width: 400,
        height: 200,
        padding: 5,
        data: [
          {
            name: "table",
            values: [
              { category: "A", amount: 28 },
              { category: "B", amount: 55 },
              { category: "C", amount: 43 },
              { category: "D", amount: 91 },
              { category: "E", amount: 81 },
              { category: "F", amount: 53 },
              { category: "G", amount: 19 },
              { category: "H", amount: 87 }
            ]
          }
        ],
        signals: [
          {
            name: "tooltip",
            value: {},
            on: [
              { events: "rect:mouseover", update: "datum" },
              { events: "rect:mouseout", update: "{}" }
            ]
          }
        ],
        scales: [
          {
            name: "xscale",
            type: "band",
            domain: { data: "table", field: "category" },
            range: "width",
            padding: 0.05,
            round: true
          },
          {
            name: "yscale",
            domain: { data: "table", field: "amount" },
            nice: true,
            range: "height"
          }
        ],
        axes: [
          { orient: "bottom", scale: "xscale" },
          { orient: "left", scale: "yscale" }
        ],
        marks: [
          {
            type: "rect",
            from: { data: "table" },
            encode: {
              enter: {
                x: { scale: "xscale", field: "category" },
                width: { scale: "xscale", band: 1 },
                y: { scale: "yscale", field: "amount" },
                y2: { scale: "yscale", value: 0 }
              },
              update: {
                fill: { value: "steelblue" }
              },
              hover: {
                fill: { value: "red" }
              }
            }
          }
        ]
      };
    case "vega-lite":
      return {
        $schema: "https://vega.github.io/schema/vega-lite/v5.json",
        description: "A simple bar chart with embedded data.",
        data: {
          values: [
            { category: "A", value: 28 },
            { category: "B", value: 55 },
            { category: "C", value: 43 },
            { category: "D", value: 91 },
            { category: "E", value: 81 }
          ]
        },
        mark: "bar",
        encoding: {
          x: { field: "category", type: "nominal", axis: { labelAngle: 0 } },
          y: { field: "value", type: "quantitative" }
        }
      };
    default:
      return {};
  }
};

// src/widget.map.js
import { WIDGET_TYPES, WIDGET_INITIAL_CONFIG } from "@jet-admin/widget-types";
init_buttonConfigEditor();
import { MdOutlineSmartButton } from "react-icons/md";
registerWidgets();
var LazyVegaWidget = React13.lazy(
  () => Promise.resolve().then(() => (init_vega(), vega_exports)).then((module) => ({ default: module.VegaWidget }))
);
var LazyButtonWidget = React13.lazy(
  () => Promise.resolve().then(() => (init_button(), button_exports)).then((module) => ({ default: module.ButtonWidget }))
);
var WIDGETS_MAP = {
  "vega-lite": {
    label: "Vega-Lite",
    value: WIDGET_TYPES.VEGA_LITE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Declarative visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ React13.createElement(React13.Suspense, { fallback: /* @__PURE__ */ React13.createElement("div", { className: "flex justify-center items-center h-full text-xs text-slate-400" }, "Loading chart...") }, /* @__PURE__ */ React13.createElement(LazyVegaWidget, { data, ...props }));
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ React13.createElement(FaChartBar2, { className: `!text-lg ${className}` }),
    sampleConfig: WIDGET_INITIAL_CONFIG["vega-lite"] || {}
  },
  "vega": {
    label: "Vega",
    value: WIDGET_TYPES.VEGA.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Low-level visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ React13.createElement(React13.Suspense, { fallback: /* @__PURE__ */ React13.createElement("div", { className: "flex justify-center items-center h-full text-xs text-slate-400" }, "Loading chart...") }, /* @__PURE__ */ React13.createElement(LazyVegaWidget, { data, ...props }));
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ React13.createElement(FaChartBar2, { className: `!text-lg ${className}` }),
    sampleConfig: WIDGET_INITIAL_CONFIG.vega || {}
  },
  "button": {
    label: "Button",
    value: WIDGET_TYPES.BUTTON.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Trigger a workflow",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ React13.createElement(React13.Suspense, { fallback: /* @__PURE__ */ React13.createElement("div", { className: "flex justify-center items-center h-full text-xs text-slate-400" }, "Loading button...") }, /* @__PURE__ */ React13.createElement(LazyButtonWidget, { data, ...props }));
    },
    configEditor: ButtonConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ React13.createElement(MdOutlineSmartButton, { className: `!text-lg ${className}` }),
    sampleConfig: WIDGET_INITIAL_CONFIG.button || {}
  }
};
export {
  VegaConfigEditor,
  VegaWidget,
  WIDGETS_MAP,
  getDemoData,
  registerWidgets
};
//# sourceMappingURL=index.mjs.map
