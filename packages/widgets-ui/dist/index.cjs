var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/vega/index.js
var vega_exports = {};
__export(vega_exports, {
  VegaWidget: () => VegaWidget,
  default: () => vega_default
});
var import_react, import_vega_embed, VegaWidget, vega_default;
var init_vega = __esm({
  "src/vega/index.js"() {
    import_react = __toESM(require("react"));
    import_vega_embed = __toESM(require("vega-embed"));
    VegaWidget = ({
      data,
      // Processed Vega/Vega-Lite spec from processor
      widgetConfig,
      // Widget-level config (showActions, renderer, theme)
      onSignal,
      // Callback for selections/interactions
      onError,
      // Error handler
      onWidgetInit,
      // Callback when widget initializes
      isLoadingWorkflows
      // Boolean indicating if a workflow is currently running
    }) => {
      const containerRef = (0, import_react.useRef)(null);
      const viewRef = (0, import_react.useRef)(null);
      const [error, setError] = (0, import_react.useState)(null);
      const [loading, setLoading] = (0, import_react.useState)(true);
      const handleError = (0, import_react.useCallback)((err) => {
        setError(err.message || "Visualization error");
        setLoading(false);
        onError?.(err);
      }, [onError]);
      (0, import_react.useEffect)(() => {
        if (!containerRef.current) return;
        if (isLoadingWorkflows) {
          setLoading(true);
          setError(null);
          return;
        }
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
            const result = await (0, import_vega_embed.default)(containerRef.current, data, embedOptions);
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
      }, [data, widgetConfig, onSignal, onWidgetInit, handleError, isLoadingWorkflows]);
      return /* @__PURE__ */ import_react.default.createElement("div", { style: { width: "100%", height: "100%", position: "relative" } }, (loading || isLoadingWorkflows) && !error && /* @__PURE__ */ import_react.default.createElement(
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
        /* @__PURE__ */ import_react.default.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: "rgba(241, 245, 249, 0.9)"
        } }, /* @__PURE__ */ import_react.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", style: { animation: "spin 1s linear infinite" } }, /* @__PURE__ */ import_react.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), /* @__PURE__ */ import_react.default.createElement("style", null, `@keyframes spin { to { transform: rotate(360deg); } }`), "Loading visualization\u2026")
      ), error && !isLoadingWorkflows && /* @__PURE__ */ import_react.default.createElement(
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
        /* @__PURE__ */ import_react.default.createElement("div", { style: {
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 16px",
          borderRadius: "6px",
          backgroundColor: "rgba(254, 242, 242, 0.95)",
          color: "#dc2626",
          fontSize: "13px",
          border: "1px solid rgba(220, 38, 38, 0.2)"
        } }, /* @__PURE__ */ import_react.default.createElement("span", null, "\u26A0"), /* @__PURE__ */ import_react.default.createElement("span", null, error))
      ), /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          ref: containerRef,
          style: {
            width: "100%",
            height: "100%",
            visibility: error || isLoadingWorkflows ? "hidden" : "visible"
          }
        }
      ));
    };
    vega_default = VegaWidget;
  }
});

// src/table/tableWidget.jsx
var import_react10, import_prop_types9, import_ui9, import_lucide_react6, TableWidget;
var init_tableWidget = __esm({
  "src/table/tableWidget.jsx"() {
    import_react10 = __toESM(require("react"));
    import_prop_types9 = __toESM(require("prop-types"));
    import_ui9 = require("@jet-admin/ui");
    import_lucide_react6 = require("lucide-react");
    TableWidget = ({
      widgetConfig,
      data: processedData,
      runWorkflow,
      isLoadingWorkflows
    }) => {
      const tableData = (0, import_react10.useMemo)(() => {
        if (processedData && typeof processedData === "object") {
          if (Array.isArray(processedData.data)) return processedData;
        }
        if (Array.isArray(processedData)) {
          return { data: processedData, columns: [], pagination: { enabled: false } };
        }
        return { data: [], columns: [], pagination: { enabled: false } };
      }, [processedData]);
      const rows = tableData.data;
      const activeColumns = (0, import_react10.useMemo)(() => {
        const configColumns = tableData.columns?.length ? tableData.columns : widgetConfig?.columns?.length ? widgetConfig.columns : [];
        if (configColumns.length > 0) return configColumns;
        if (rows.length > 0 && typeof rows[0] === "object" && rows[0] !== null) {
          return Object.keys(rows[0]).map((k) => ({ key: k, label: k }));
        }
        return [];
      }, [tableData.columns, widgetConfig?.columns, rows]);
      const paginationConfig = tableData.pagination?.enabled ? tableData.pagination : widgetConfig?.pagination?.enabled ? widgetConfig.pagination : null;
      const [currentPage, setCurrentPage] = (0, import_react10.useState)(1);
      const [pageSize, setPageSize] = (0, import_react10.useState)(10);
      const totalRows = paginationConfig?.totalRows ?? rows.length;
      const totalPages = paginationConfig ? Math.max(1, Math.ceil(totalRows / pageSize)) : 1;
      const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setCurrentPage(newPage);
        if (paginationConfig && runWorkflow) {
          runWorkflow({
            inputParams: {
              [paginationConfig.pageParam || "page"]: newPage,
              [paginationConfig.pageSizeParam || "limit"]: pageSize
            }
          });
        }
      };
      const isBackendPaginated = paginationConfig && totalRows > rows.length;
      const displayRows = isBackendPaginated ? rows : paginationConfig ? rows.slice((currentPage - 1) * pageSize, currentPage * pageSize) : rows;
      if (!rows || rows.length === 0) {
        if (isLoadingWorkflows) {
          return /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex flex-col w-full h-full items-center justify-center text-muted-foreground text-sm p-6 relative" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "absolute inset-0 z-10 flex items-center justify-center bg-brand-dark/90 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2 rounded-md bg-brand-border-dark/90 px-4 py-2 text-sm text-brand-text-primary shadow-sm" }, /* @__PURE__ */ import_react10.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react10.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Loading data\u2026")));
        }
        return /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex flex-col w-full h-full items-center justify-center text-muted-foreground text-sm p-6" }, /* @__PURE__ */ import_react10.default.createElement("p", null, "No data available."), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-xs mt-1" }, "Ensure the data array template resolves to a non-empty array."));
      }
      return /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex flex-col w-full h-full min-h-0 overflow-hidden relative" }, isLoadingWorkflows && /* @__PURE__ */ import_react10.default.createElement("div", { className: "absolute inset-0 z-20 flex items-center justify-center bg-brand-dark/50 backdrop-blur-[1px]" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2 rounded-md bg-brand-border-dark/90 px-4 py-2 text-sm text-brand-text-primary shadow-sm" }, /* @__PURE__ */ import_react10.default.createElement("svg", { width: "16", height: "16", viewBox: "0 0 24 24", className: "animate-spin" }, /* @__PURE__ */ import_react10.default.createElement("circle", { cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "3", fill: "none", strokeDasharray: "31.4 31.4", strokeLinecap: "round" })), "Updating data\u2026")), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex-1 overflow-auto min-h-0" }, /* @__PURE__ */ import_react10.default.createElement("table", { className: "w-full text-sm border-collapse" }, /* @__PURE__ */ import_react10.default.createElement("thead", { className: "sticky top-0 z-10 bg-muted/60 backdrop-blur-sm" }, /* @__PURE__ */ import_react10.default.createElement("tr", null, activeColumns.map((col, idx) => /* @__PURE__ */ import_react10.default.createElement(
        "th",
        {
          key: idx,
          className: "text-left px-3 py-2 text-xs font-medium text-muted-foreground border-b whitespace-nowrap select-none"
        },
        col.label || col.key
      )))), /* @__PURE__ */ import_react10.default.createElement("tbody", null, displayRows.map((row, rowIdx) => /* @__PURE__ */ import_react10.default.createElement(
        "tr",
        {
          key: rowIdx,
          className: "border-b last:border-b-0 hover:bg-muted/30 transition-colors"
        },
        activeColumns.map((col, colIdx) => /* @__PURE__ */ import_react10.default.createElement(
          "td",
          {
            key: colIdx,
            className: "px-3 py-2 text-sm text-foreground whitespace-nowrap"
          },
          row[col.key] != null ? String(row[col.key]) : "\u2014"
        ))
      ))))), paginationConfig && /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center justify-between px-3 py-2 border-t bg-muted/20 gap-4 flex-shrink-0" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-xs text-muted-foreground" }, totalRows, " total row", totalRows !== 1 ? "s" : ""), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-1" }, /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-xs text-muted-foreground mr-2" }, "Page ", currentPage, " of ", totalPages), /* @__PURE__ */ import_react10.default.createElement(
        import_ui9.Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-7 w-7",
          onClick: () => handlePageChange(1),
          disabled: currentPage === 1 || isLoadingWorkflows
        },
        /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronsLeft, { className: "text-base" })
      ), /* @__PURE__ */ import_react10.default.createElement(
        import_ui9.Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-7 w-7",
          onClick: () => handlePageChange(currentPage - 1),
          disabled: currentPage === 1 || isLoadingWorkflows
        },
        /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronLeft, { className: "text-base" })
      ), /* @__PURE__ */ import_react10.default.createElement(
        import_ui9.Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-7 w-7",
          onClick: () => handlePageChange(currentPage + 1),
          disabled: currentPage >= totalPages || isLoadingWorkflows
        },
        /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronRight, { className: "text-base" })
      ), /* @__PURE__ */ import_react10.default.createElement(
        import_ui9.Button,
        {
          variant: "ghost",
          size: "icon",
          className: "h-7 w-7",
          onClick: () => handlePageChange(totalPages),
          disabled: currentPage >= totalPages || isLoadingWorkflows
        },
        /* @__PURE__ */ import_react10.default.createElement(import_lucide_react6.ChevronsRight, { className: "text-base" })
      ))));
    };
    TableWidget.propTypes = {
      widgetConfig: import_prop_types9.default.object,
      data: import_prop_types9.default.oneOfType([import_prop_types9.default.array, import_prop_types9.default.object]),
      runWorkflow: import_prop_types9.default.func,
      isLoadingWorkflows: import_prop_types9.default.bool
    };
  }
});

// src/table/tableConfigEditor.jsx
var import_react11, import_prop_types10, import_ui10, import_lucide_react7, TemplateAutocompleteInput, collectArrayPaths2, collectScalarPaths, resolvePath, TableConfigEditor;
var init_tableConfigEditor = __esm({
  "src/table/tableConfigEditor.jsx"() {
    import_react11 = __toESM(require("react"));
    import_prop_types10 = __toESM(require("prop-types"));
    import_ui10 = require("@jet-admin/ui");
    import_lucide_react7 = require("lucide-react");
    TemplateAutocompleteInput = ({ value, onChange, placeholder, suggestions }) => {
      const [showSuggestions, setShowSuggestions] = import_react11.default.useState(false);
      const handleFocus = () => {
        if (suggestions.length > 0) setShowSuggestions(true);
      };
      const handleBlur = () => {
        setTimeout(() => setShowSuggestions(false), 200);
      };
      const handleChange = (e) => {
        onChange(e.target.value);
        setShowSuggestions(true);
      };
      const handleSelect = (path) => {
        onChange(path);
        setShowSuggestions(false);
      };
      const filteredSuggestions = suggestions.filter(
        (s) => !value || s.value.toLowerCase().includes(value.toLowerCase()) || value === "{{"
      );
      return /* @__PURE__ */ import_react11.default.createElement("div", { className: "relative flex flex-col gap-1" }, /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Input,
        {
          type: "text",
          className: "text-xs font-mono h-8 w-full",
          value: value || "",
          onChange: handleChange,
          onFocus: handleFocus,
          onBlur: handleBlur,
          placeholder
        }
      ), showSuggestions && filteredSuggestions.length > 0 && /* @__PURE__ */ import_react11.default.createElement("div", { className: "absolute z-50 top-full left-0 right-0 mt-1 bg-brand-dark border border-border rounded-md shadow-lg max-h-48 overflow-auto" }, filteredSuggestions.map((s, idx) => /* @__PURE__ */ import_react11.default.createElement(
        "div",
        {
          key: idx,
          onMouseDown: (e) => e.preventDefault(),
          onClick: () => handleSelect(s.value),
          className: "w-full px-2 py-1.5 text-left text-xs hover:bg-muted flex items-center justify-between gap-2 border-b border-border last:border-0 cursor-pointer transition-colors"
        },
        /* @__PURE__ */ import_react11.default.createElement("span", { className: "font-mono text-foreground" }, s.label),
        s.detail && /* @__PURE__ */ import_react11.default.createElement("span", { className: "text-[10px] text-muted-foreground" }, s.detail)
      ))));
    };
    collectArrayPaths2 = (obj, prefix = "", depth = 0, maxDepth = 4) => {
      const results = [];
      if (!obj || typeof obj !== "object" || depth > maxDepth) return results;
      for (const key of Object.keys(obj)) {
        if (key.startsWith("__")) continue;
        const val = obj[key];
        const fullPath = prefix ? `${prefix}.${key}` : key;
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
          results.push({
            path: fullPath,
            label: fullPath,
            sampleKeys: Object.keys(val[0]),
            rowCount: val.length
          });
        } else if (val && typeof val === "object" && !Array.isArray(val)) {
          results.push(...collectArrayPaths2(val, fullPath, depth + 1, maxDepth));
        }
      }
      return results;
    };
    collectScalarPaths = (obj, prefix = "", depth = 0, maxDepth = 3) => {
      const results = [];
      if (!obj || typeof obj !== "object" || depth > maxDepth) return results;
      for (const key of Object.keys(obj)) {
        if (key.startsWith("__")) continue;
        const val = obj[key];
        const fullPath = prefix ? `${prefix}.${key}` : key;
        if (typeof val === "number") {
          results.push({ path: fullPath, label: fullPath, value: val });
        } else if (val && typeof val === "object" && !Array.isArray(val)) {
          results.push(...collectScalarPaths(val, fullPath, depth + 1, maxDepth));
        }
      }
      return results;
    };
    resolvePath = (obj, path) => {
      if (!obj || !path) return void 0;
      const parts = path.split(".");
      let current = obj;
      for (const part of parts) {
        if (current == null) return void 0;
        current = current[part];
      }
      return current;
    };
    TableConfigEditor = ({ widgetEditorForm, dataSourceResults }) => {
      const config = widgetEditorForm.values.widgetConfig || {};
      const dataSources = config.dataSources || [];
      const columns = config.columns || [];
      const pagination = config.pagination || {
        enabled: false,
        pageParam: "page",
        pageSizeParam: "limit",
        totalTemplate: ""
      };
      const aliasSuggestions = (0, import_react11.useMemo)(() => {
        if (!dataSources?.length) return [];
        return dataSources.filter((s) => s.alias).map((s) => s.alias);
      }, [dataSources]);
      const arrayPaths = (0, import_react11.useMemo)(() => {
        const paths = [];
        if (dataSourceResults) {
          paths.push(...collectArrayPaths2(dataSourceResults));
        }
        if (paths.length === 0 && aliasSuggestions.length > 0) {
          for (const alias of aliasSuggestions) {
            paths.push({
              path: `${alias}.data`,
              label: `${alias}.data`,
              sampleKeys: [],
              rowCount: 0,
              isSuggestion: true
            });
            paths.push({
              path: alias,
              label: alias,
              sampleKeys: [],
              rowCount: 0,
              isSuggestion: true
            });
          }
        }
        return paths;
      }, [dataSourceResults, aliasSuggestions]);
      const scalarPaths = (0, import_react11.useMemo)(() => {
        const paths = [];
        if (dataSourceResults) {
          paths.push(...collectScalarPaths(dataSourceResults));
        }
        if (paths.length === 0 && aliasSuggestions.length > 0) {
          for (const alias of aliasSuggestions) {
            paths.push({
              path: `${alias}.total`,
              label: `${alias}.total`,
              value: null,
              isSuggestion: true
            });
          }
        }
        return paths;
      }, [dataSourceResults, aliasSuggestions]);
      const arraySuggestions = (0, import_react11.useMemo)(() => {
        return arrayPaths.map((arr) => ({
          label: `{{ ${arr.path} }}`,
          value: `{{ ${arr.path} }}`,
          detail: arr.isSuggestion ? "suggested" : `${arr.rowCount} rows`
        }));
      }, [arrayPaths]);
      const scalarSuggestions = (0, import_react11.useMemo)(() => {
        return scalarPaths.map((s) => ({
          label: `{{ ${s.path} }}`,
          value: `{{ ${s.path} }}`,
          detail: s.isSuggestion ? "" : `= ${s.value}`
        }));
      }, [scalarPaths]);
      const dataArrayPathStr = config.dataArrayTemplate || config.dataMapping?.dataArrayPath || "";
      const dataArrayPath = dataArrayPathStr.replace(/^{{\s*/, "").replace(/\s*}}$/, "");
      const discoveredColumns = (0, import_react11.useMemo)(() => {
        if (!dataSourceResults || !dataArrayPath) return [];
        const resolved = resolvePath(dataSourceResults, dataArrayPath);
        if (Array.isArray(resolved) && resolved.length > 0 && typeof resolved[0] === "object") {
          return Object.keys(resolved[0]).map((key) => ({
            key,
            label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
            type: typeof resolved[0][key]
          }));
        }
        return [];
      }, [dataSourceResults, dataArrayPath]);
      const availableKeys = (0, import_react11.useMemo)(() => {
        return discoveredColumns.map((c) => c.key);
      }, [discoveredColumns]);
      const handleAddColumn = (0, import_react11.useCallback)(() => {
        widgetEditorForm.setFieldValue("widgetConfig.columns", [
          ...columns,
          { label: "New Column", key: "" }
        ]);
      }, [widgetEditorForm, columns]);
      const handleAutoPopulateColumns = (0, import_react11.useCallback)(() => {
        if (discoveredColumns.length === 0) return;
        const newColumns = discoveredColumns.map((col) => ({
          label: col.label,
          key: col.key
        }));
        widgetEditorForm.setFieldValue("widgetConfig.columns", newColumns);
      }, [widgetEditorForm, discoveredColumns]);
      const handleUpdateColumn = (0, import_react11.useCallback)(
        (index, field, value) => {
          const updated = [...columns];
          updated[index] = { ...updated[index], [field]: value };
          widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
        },
        [widgetEditorForm, columns]
      );
      const handleRemoveColumn = (0, import_react11.useCallback)(
        (index) => {
          const updated = [...columns];
          updated.splice(index, 1);
          widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
        },
        [widgetEditorForm, columns]
      );
      const handleMoveColumn = (0, import_react11.useCallback)(
        (index, direction) => {
          const newIndex = index + direction;
          if (newIndex < 0 || newIndex >= columns.length) return;
          const updated = [...columns];
          const [moved] = updated.splice(index, 1);
          updated.splice(newIndex, 0, moved);
          widgetEditorForm.setFieldValue("widgetConfig.columns", updated);
        },
        [widgetEditorForm, columns]
      );
      const handlePaginationToggle = (checked) => {
        widgetEditorForm.setFieldValue("widgetConfig.pagination", {
          ...pagination,
          enabled: checked
        });
      };
      const handleConfigChange = (field, value) => {
        widgetEditorForm.setFieldValue(`widgetConfig.${field}`, value);
      };
      const handlePaginationChange = (field, value) => {
        widgetEditorForm.setFieldValue("widgetConfig.pagination", {
          ...pagination,
          [field]: value
        });
      };
      return /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-5" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Data Array Template"), /* @__PURE__ */ import_react11.default.createElement(
        TemplateAutocompleteInput,
        {
          value: config.dataArrayTemplate || config.dataMapping?.dataArrayPath || "",
          onChange: (val) => handleConfigChange("dataArrayTemplate", val),
          placeholder: "e.g. {{ queries.my_query.data }}",
          suggestions: arraySuggestions
        }
      ), /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-[0.65rem] text-muted-foreground" }, "Mustache template evaluating to an array of objects.")), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Total Count Template ", /* @__PURE__ */ import_react11.default.createElement("span", { className: "text-muted-foreground font-normal" }, "(optional)")), /* @__PURE__ */ import_react11.default.createElement(
        TemplateAutocompleteInput,
        {
          value: pagination.totalTemplate || config.dataMapping?.totalCountPath || "",
          onChange: (val) => handlePaginationChange("totalTemplate", val),
          placeholder: "e.g. {{ queries.my_query.total }}",
          suggestions: scalarSuggestions
        }
      ), /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-[0.6rem] text-muted-foreground" }, "Used for server-side pagination. Leave empty to use array length."))), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Table Columns"), /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex gap-1" }, discoveredColumns.length > 0 && /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          onClick: handleAutoPopulateColumns,
          className: "h-7 text-xs px-2",
          title: "Auto-detect columns from data"
        },
        /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.Sparkles, { className: "mr-1 text-amber-500" }),
        " Auto-detect"
      ), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Button,
        {
          type: "button",
          variant: "outline",
          size: "sm",
          onClick: handleAddColumn,
          className: "h-7 text-xs px-2"
        },
        /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.Plus, { className: "mr-1" }),
        " Add"
      ))), discoveredColumns.length > 0 && columns.length === 0 && /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center gap-2 text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2" }, /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.Zap, { className: "w-3.5 h-3.5 shrink-0" }), /* @__PURE__ */ import_react11.default.createElement("span", null, /* @__PURE__ */ import_react11.default.createElement("strong", null, discoveredColumns.length), " fields detected from loaded data. Click ", /* @__PURE__ */ import_react11.default.createElement("strong", null, "Auto-detect"), " to populate columns.")), !dataArrayPath && columns.length === 0 && /* @__PURE__ */ import_react11.default.createElement("div", { className: "text-center p-4 border border-dashed rounded-md text-muted-foreground text-xs" }, "Configure a Data Array Path in the Data tab first, then come back here to set up columns."), dataArrayPath && discoveredColumns.length === 0 && columns.length === 0 && /* @__PURE__ */ import_react11.default.createElement("div", { className: "text-center p-4 border border-dashed rounded-md text-muted-foreground text-xs" }, "No columns detected. Click ", /* @__PURE__ */ import_react11.default.createElement("strong", null, "Load Data"), " in the Data tab, or add columns manually."), columns.length > 0 && /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-2" }, columns.map((col, idx) => /* @__PURE__ */ import_react11.default.createElement(
        "div",
        {
          key: idx,
          className: "flex items-end gap-1.5 p-2 border rounded-md bg-muted/30"
        },
        /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex flex-col gap-0.5 pb-0.5" }, /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted",
            onClick: () => handleMoveColumn(idx, -1),
            disabled: idx === 0,
            title: "Move up"
          },
          /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.ArrowUp, { className: "h-3.5 w-3.5" })
        ), /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground hover:bg-muted",
            onClick: () => handleMoveColumn(idx, 1),
            disabled: idx === columns.length - 1,
            title: "Move down"
          },
          /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.ArrowDown, { className: "h-3.5 w-3.5" })
        )),
        /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex-1 space-y-1" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-[0.65rem]" }, "Header Label"), /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Input,
          {
            value: col.label,
            onChange: (e) => handleUpdateColumn(idx, "label", e.target.value),
            className: "h-7 text-xs",
            placeholder: "User Name"
          }
        )),
        /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex-1 space-y-1" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-[0.65rem]" }, "Data Key"), availableKeys.length > 0 ? /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Select,
          {
            value: col.key || "",
            onValueChange: (val) => handleUpdateColumn(idx, "key", val)
          },
          /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectTrigger, { className: "h-7 text-xs font-mono" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectValue, { placeholder: "Select field\u2026" })),
          /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectContent, null, availableKeys.map((key) => /* @__PURE__ */ import_react11.default.createElement(import_ui10.SelectItem, { key, value: key }, key)))
        ) : /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Input,
          {
            value: col.key,
            onChange: (e) => handleUpdateColumn(idx, "key", e.target.value),
            className: "h-7 text-xs font-mono",
            placeholder: "user_name"
          }
        )),
        /* @__PURE__ */ import_react11.default.createElement(
          import_ui10.Button,
          {
            type: "button",
            variant: "ghost",
            size: "icon",
            className: "h-7 w-7 shrink-0 text-destructive hover:bg-destructive/10",
            onClick: () => handleRemoveColumn(idx),
            title: "Remove column"
          },
          /* @__PURE__ */ import_react11.default.createElement(import_lucide_react7.Trash2, { className: "h-4 w-4" })
        )
      )))), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-xs font-medium text-foreground" }, "Pagination"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Switch,
        {
          checked: pagination.enabled,
          onCheckedChange: handlePaginationToggle
        }
      )), pagination.enabled && /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-3 bg-muted/30 p-3 rounded-md border mt-1" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-[0.65rem]" }, "Page Argument Name"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Input,
        {
          value: pagination.pageParam || "",
          onChange: (e) => handlePaginationChange("pageParam", e.target.value),
          placeholder: "page",
          className: "h-7 text-xs font-mono"
        }
      ), /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-[0.6rem] text-muted-foreground" }, "Input argument that receives the page number.")), /* @__PURE__ */ import_react11.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react11.default.createElement(import_ui10.Label, { className: "text-[0.65rem]" }, "Page Size Argument Name"), /* @__PURE__ */ import_react11.default.createElement(
        import_ui10.Input,
        {
          value: pagination.pageSizeParam || "",
          onChange: (e) => handlePaginationChange("pageSizeParam", e.target.value),
          placeholder: "limit",
          className: "h-7 text-xs font-mono"
        }
      ), /* @__PURE__ */ import_react11.default.createElement("p", { className: "text-[0.6rem] text-muted-foreground" }, "Input argument that receives rows per page."))))));
    };
    TableConfigEditor.propTypes = {
      widgetEditorForm: import_prop_types10.default.object.isRequired,
      dataSourceResults: import_prop_types10.default.object
    };
  }
});

// src/button/buttonConfigEditor.jsx
var import_react12, import_prop_types11, import_ui11, ButtonConfigEditor;
var init_buttonConfigEditor = __esm({
  "src/button/buttonConfigEditor.jsx"() {
    import_react12 = __toESM(require("react"));
    import_prop_types11 = __toESM(require("prop-types"));
    import_ui11 = require("@jet-admin/ui");
    ButtonConfigEditor = ({ widgetEditorForm }) => {
      return /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react12.default.createElement(import_ui11.Label, { className: "text-xs font-medium text-foreground" }, "Button Text"), /* @__PURE__ */ import_react12.default.createElement(
        import_ui11.Input,
        {
          type: "text",
          className: "text-sm",
          value: widgetEditorForm.values.widgetConfig?.text || "",
          onChange: (e) => widgetEditorForm.setFieldValue("widgetConfig.text", e.target.value),
          placeholder: "Click Me"
        }
      )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react12.default.createElement(import_ui11.Label, { className: "text-xs font-medium text-foreground" }, "Variant"), /* @__PURE__ */ import_react12.default.createElement(
        import_ui11.Select,
        {
          value: widgetEditorForm.values.widgetConfig?.variant || "default",
          onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.variant", val)
        },
        /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectValue, { placeholder: "Select variant" })),
        /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectContent, null, /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "default" }, "Default"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "destructive" }, "Destructive"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "outline" }, "Outline"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "secondary" }, "Secondary"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "ghost" }, "Ghost"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "link" }, "Link"))
      )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react12.default.createElement(import_ui11.Label, { className: "text-xs font-medium text-foreground" }, "Size"), /* @__PURE__ */ import_react12.default.createElement(
        import_ui11.Select,
        {
          value: widgetEditorForm.values.widgetConfig?.size || "default",
          onValueChange: (val) => widgetEditorForm.setFieldValue("widgetConfig.size", val)
        },
        /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectValue, { placeholder: "Select size" })),
        /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectContent, null, /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "default" }, "Default"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "sm" }, "Small"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "lg" }, "Large"), /* @__PURE__ */ import_react12.default.createElement(import_ui11.SelectItem, { value: "icon" }, "Icon"))
      ))));
    };
    ButtonConfigEditor.propTypes = {
      widgetEditorForm: import_prop_types11.default.object.isRequired
    };
  }
});

// src/button/buttonWidget.jsx
var import_react13, import_prop_types12, import_ui12, ButtonWidget;
var init_buttonWidget = __esm({
  "src/button/buttonWidget.jsx"() {
    import_react13 = __toESM(require("react"));
    import_prop_types12 = __toESM(require("prop-types"));
    import_ui12 = require("@jet-admin/ui");
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
      return /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex w-full h-full items-center justify-center p-4 text-center" }, /* @__PURE__ */ import_react13.default.createElement(
        import_ui12.Button,
        {
          variant,
          size,
          onClick: runWorkflow,
          disabled: isLoadingWorkflows
        },
        isLoadingWorkflows && /* @__PURE__ */ import_react13.default.createElement(import_ui12.Spinner, { className: "mr-2 h-4 w-4" }),
        text
      ));
    };
    ButtonWidget.propTypes = {
      widgetTitle: import_prop_types12.default.string,
      widgetType: import_prop_types12.default.string,
      widgetConfig: import_prop_types12.default.object,
      runWorkflow: import_prop_types12.default.func,
      isLoadingWorkflows: import_prop_types12.default.bool
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

// src/table/index.js
var table_exports = {};
__export(table_exports, {
  TableConfigEditor: () => TableConfigEditor,
  TableWidget: () => TableWidget
});
var init_table = __esm({
  "src/table/index.js"() {
    init_tableWidget();
    init_tableConfigEditor();
  }
});

// src/index.js
var index_exports = {};
__export(index_exports, {
  TableConfigEditor: () => TableConfigEditor,
  TableWidget: () => TableWidget,
  VegaConfigEditor: () => VegaConfigEditor,
  VegaWidget: () => VegaWidget,
  WIDGETS_MAP: () => WIDGETS_MAP,
  getDemoData: () => getDemoData,
  registerWidgets: () => registerWidgets
});
module.exports = __toCommonJS(index_exports);
init_vega();

// src/vega/vegaConfigEditor.jsx
var import_react9 = __toESM(require("react"));
var import_prop_types8 = __toESM(require("prop-types"));

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
var import_ui8 = require("@jet-admin/ui");

// src/vega/vegaSpecEditor.jsx
var import_react3 = __toESM(require("react"));
var import_prop_types2 = __toESM(require("prop-types"));

// src/vega/variableExplorer.jsx
var import_react2 = __toESM(require("react"));
var import_prop_types = __toESM(require("prop-types"));
var import_ui = require("@jet-admin/ui");
var import_lucide_react = require("lucide-react");
var getCategoryIcon = (category) => {
  switch (category) {
    case "input":
      return /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.ArrowRightToLine, { className: "w-3.5 h-3.5 text-emerald-500" });
    case "nodeOutput":
      return /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.GitMerge, { className: "w-3.5 h-3.5 text-primary" });
    case "workflowOutput":
      return /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.ArrowRightFromLine, { className: "w-3.5 h-3.5 text-purple-500" });
    default:
      return null;
  }
};
var VariableItem = ({ variable, onSelect, isSelected }) => {
  const [copied, setCopied] = (0, import_react2.useState)(false);
  const handleCopy = (0, import_react2.useCallback)((e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(variable.path);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [variable.path]);
  const handleClick = (0, import_react2.useCallback)(() => {
    if (onSelect) onSelect(variable.path, variable);
  }, [onSelect, variable]);
  return /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      onClick: handleClick,
      className: `
        flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded-sm text-xs group
        transition-colors
        ${isSelected ? "bg-primary/10 text-primary border-l-2 border-primary" : "hover:bg-muted text-foreground"}
      `
    },
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "font-medium truncate flex-1" }, variable.name),
    variable.nodeTitle && /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-[10px] truncate max-w-[80px] text-muted-foreground" }, variable.nodeTitle),
    /* @__PURE__ */ import_react2.default.createElement(
      import_ui.Button,
      {
        onClick: handleCopy,
        variant: "ghost",
        size: "icon",
        className: "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
        title: "Copy path",
        type: "button"
      },
      copied ? /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Check, { className: "w-3 h-3 text-emerald-500" }) : /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.Copy, { className: "w-3 h-3 text-muted-foreground" })
    )
  );
};
VariableItem.propTypes = {
  variable: import_prop_types.default.shape({
    path: import_prop_types.default.string.isRequired,
    name: import_prop_types.default.string.isRequired,
    type: import_prop_types.default.string,
    description: import_prop_types.default.string
  }).isRequired,
  onSelect: import_prop_types.default.func,
  isSelected: import_prop_types.default.bool
};
var VariableCategory = ({
  category,
  title,
  variables,
  onSelect,
  selectedPath,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = (0, import_react2.useState)(defaultExpanded);
  if (!variables || variables.length === 0) return null;
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "mb-1" }, /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      onClick: () => setIsExpanded(!isExpanded),
      className: "flex items-center gap-1.5 w-full px-2 py-1.5 rounded-sm cursor-pointer bg-muted/50 border border-border hover:bg-muted transition-colors"
    },
    isExpanded ? /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.ChevronDown, { className: "w-3 h-3 text-muted-foreground" }) : /* @__PURE__ */ import_react2.default.createElement(import_lucide_react.ChevronRight, { className: "w-3 h-3 text-muted-foreground" }),
    getCategoryIcon(category),
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-[11px] font-medium uppercase tracking-wide flex-1 text-muted-foreground" }, title),
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "text-[10px] px-1.5 py-0.5 rounded-sm bg-brand-dark border border-border text-muted-foreground" }, variables.length)
  ), isExpanded && /* @__PURE__ */ import_react2.default.createElement("div", { className: "ml-3 mt-1 pl-2 border-l border-border" }, variables.map((variable) => /* @__PURE__ */ import_react2.default.createElement(
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
  category: import_prop_types.default.string.isRequired,
  title: import_prop_types.default.string.isRequired,
  variables: import_prop_types.default.array.isRequired,
  onSelect: import_prop_types.default.func,
  selectedPath: import_prop_types.default.string,
  defaultExpanded: import_prop_types.default.bool
};
var extractWorkflowSchema = (workflow) => {
  if (!workflow) return { inputs: [], nodeOutputs: [], workflowOutputs: [] };
  const schema = { inputs: [], nodeOutputs: [], workflowOutputs: [] };
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
  onSelect,
  selectedPath = null,
  title = "Workflow Variables",
  showSearch = true,
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = (0, import_react2.useState)("");
  const schema = (0, import_react2.useMemo)(() => extractWorkflowSchema(workflow), [workflow]);
  const allVariables = (0, import_react2.useMemo)(() => ({
    inputs: [...schema.inputs],
    nodeOutputs: [...schema.nodeOutputs],
    workflowOutputs: [...schema.workflowOutputs]
  }), [schema]);
  const filteredVariables = (0, import_react2.useMemo)(() => {
    if (!searchQuery) return allVariables;
    const q = searchQuery.toLowerCase();
    return {
      inputs: allVariables.inputs.filter((v) => v.path.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)),
      nodeOutputs: allVariables.nodeOutputs.filter((v) => v.path.toLowerCase().includes(q) || v.name.toLowerCase().includes(q) || v.nodeTitle?.toLowerCase().includes(q)),
      workflowOutputs: allVariables.workflowOutputs.filter((v) => v.path.toLowerCase().includes(q) || v.name.toLowerCase().includes(q))
    };
  }, [allVariables, searchQuery]);
  const hasVariables = schema.inputs.length > 0 || schema.nodeOutputs.length > 0 || schema.workflowOutputs.length > 0;
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: `flex flex-col rounded-md border border-border bg-brand-dark ${className}` }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex items-center justify-between px-3 py-2 rounded-t-lg border-b border-border bg-muted/50" }, /* @__PURE__ */ import_react2.default.createElement("h3", { className: "text-xs font-medium text-muted-foreground" }, title)), showSearch && hasVariables && /* @__PURE__ */ import_react2.default.createElement("div", { className: "px-2 py-2 border-b border-border" }, /* @__PURE__ */ import_react2.default.createElement(
    import_ui.Input,
    {
      type: "text",
      placeholder: "Search variables...",
      value: searchQuery,
      onChange: (e) => setSearchQuery(e.target.value),
      className: "w-full text-xs"
    }
  )), /* @__PURE__ */ import_react2.default.createElement("div", { className: "flex-1 overflow-auto max-h-64 py-2 px-1" }, !hasVariables ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "text-center py-4 text-xs text-muted-foreground" }, /* @__PURE__ */ import_react2.default.createElement("p", null, "No variables defined"), /* @__PURE__ */ import_react2.default.createElement("p", { className: "mt-1 text-[10px]" }, "Add workflow inputs or nodes with output variables")) : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement(
    VariableCategory,
    {
      category: "input",
      title: "Workflow Inputs",
      variables: filteredVariables.inputs,
      onSelect,
      selectedPath,
      defaultExpanded: true
    }
  ), /* @__PURE__ */ import_react2.default.createElement(
    VariableCategory,
    {
      category: "nodeOutput",
      title: "Node Outputs",
      variables: filteredVariables.nodeOutputs,
      onSelect,
      selectedPath,
      defaultExpanded: true
    }
  ), /* @__PURE__ */ import_react2.default.createElement(
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
  workflow: import_prop_types.default.object,
  context: import_prop_types.default.object,
  onSelect: import_prop_types.default.func,
  selectedPath: import_prop_types.default.string,
  title: import_prop_types.default.string,
  showSearch: import_prop_types.default.bool,
  className: import_prop_types.default.string
};

// src/vega/vegaSpecEditor.jsx
var import_ui2 = require("@jet-admin/ui");
var import_lucide_react2 = require("lucide-react");
var VEGA_TEMPLATES = {
  empty: {
    name: "Empty",
    icon: import_lucide_react2.Code,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      description: "Custom visualization",
      data: { values: [{ x: 1, y: 10 }, { x: 2, y: 20 }, { x: 3, y: 15 }] },
      mark: "point",
      encoding: {
        x: { field: "x", type: "quantitative" },
        y: { field: "y", type: "quantitative" }
      }
    }
  },
  bar: {
    name: "Bar",
    icon: import_lucide_react2.BarChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { category: "Electronics", value: 450 },
          { category: "Clothing", value: 320 },
          { category: "Food", value: 280 },
          { category: "Books", value: 190 },
          { category: "Sports", value: 230 }
        ]
      },
      mark: "bar",
      encoding: {
        x: { field: "category", type: "nominal", axis: { labelAngle: -45 } },
        y: { field: "value", type: "quantitative", title: "Sales" },
        color: { field: "category", type: "nominal", legend: null }
      }
    }
  },
  line: {
    name: "Line",
    icon: import_lucide_react2.LineChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { date: "2024-01-01", value: 100 },
          { date: "2024-02-01", value: 150 },
          { date: "2024-03-01", value: 120 },
          { date: "2024-04-01", value: 200 },
          { date: "2024-05-01", value: 180 },
          { date: "2024-06-01", value: 250 }
        ]
      },
      mark: { type: "line", point: true },
      encoding: {
        x: { field: "date", type: "temporal", title: "Date" },
        y: { field: "value", type: "quantitative", title: "Value" }
      }
    }
  },
  pie: {
    name: "Pie",
    icon: import_lucide_react2.PieChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { category: "Desktop", value: 45 },
          { category: "Mobile", value: 35 },
          { category: "Tablet", value: 15 },
          { category: "Other", value: 5 }
        ]
      },
      mark: { type: "arc", innerRadius: 50 },
      encoding: {
        theta: { field: "value", type: "quantitative" },
        color: { field: "category", type: "nominal", title: "Device" }
      }
    }
  },
  scatter: {
    name: "Scatter",
    icon: import_lucide_react2.ScatterChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { x: 10, y: 28, size: 5, category: "A" },
          { x: 25, y: 55, size: 8, category: "B" },
          { x: 40, y: 43, size: 12, category: "A" },
          { x: 55, y: 91, size: 6, category: "C" },
          { x: 70, y: 81, size: 10, category: "B" },
          { x: 85, y: 53, size: 15, category: "C" }
        ]
      },
      mark: "circle",
      encoding: {
        x: { field: "x", type: "quantitative", title: "X Axis" },
        y: { field: "y", type: "quantitative", title: "Y Axis" },
        size: { field: "size", type: "quantitative" },
        color: { field: "category", type: "nominal" }
      }
    }
  },
  heatmap: {
    name: "Heatmap",
    icon: import_lucide_react2.BarChart,
    spec: {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: {
        values: [
          { row: "Mon", column: "Morning", value: 10 },
          { row: "Mon", column: "Afternoon", value: 25 },
          { row: "Mon", column: "Evening", value: 15 },
          { row: "Tue", column: "Morning", value: 20 },
          { row: "Tue", column: "Afternoon", value: 30 },
          { row: "Tue", column: "Evening", value: 22 },
          { row: "Wed", column: "Morning", value: 15 },
          { row: "Wed", column: "Afternoon", value: 28 },
          { row: "Wed", column: "Evening", value: 18 }
        ]
      },
      mark: "rect",
      encoding: {
        x: { field: "column", type: "ordinal", title: "Time" },
        y: { field: "row", type: "ordinal", title: "Day" },
        color: {
          field: "value",
          type: "quantitative",
          scale: { scheme: "blues" },
          title: "Activity"
        }
      }
    }
  }
};
var getNestedKeys = (obj, prefix = "", maxDepth = 4, depth = 0) => {
  if (!obj || typeof obj !== "object" || depth >= maxDepth) return [];
  const keys = [];
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const full = prefix ? `${prefix}.${key}` : key;
    keys.push(full);
    if (typeof obj[key] === "object" && obj[key] !== null) {
      keys.push(
        ...Array.isArray(obj[key]) && obj[key].length > 0 ? getNestedKeys(obj[key][0], `${full}[0]`, maxDepth, depth + 1) : getNestedKeys(obj[key], full, maxDepth, depth + 1)
      );
    }
  }
  return keys;
};
var getValueByPath = (obj, path) => {
  if (!obj || !path) return void 0;
  let cur = obj;
  for (const part of path.split(".")) {
    const m = part.match(/^(.+)\[(\d+)\]$/);
    cur = m ? cur?.[m[1]]?.[parseInt(m[2])] : cur?.[part];
    if (cur === void 0) break;
  }
  return cur;
};
var getValuePreview = (obj, path) => {
  const v = getValueByPath(obj, path);
  if (v === void 0) return "undefined";
  if (v === null) return "null";
  if (Array.isArray(v)) return `Array(${v.length})`;
  if (typeof v === "object") {
    const k = Object.keys(v).slice(0, 3);
    return `{${k.join(", ")}${Object.keys(v).length > 3 ? "\u2026" : ""}}`;
  }
  if (typeof v === "string") return `"${v.slice(0, 30)}${v.length > 30 ? "\u2026" : ""}"`;
  return String(v);
};
var S = {
  // header bar
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    padding: "5px 8px",
    borderBottom: "1px solid var(--we-border)",
    background: "var(--we-bg-secondary, #f8f9fa)",
    borderRadius: "6px 6px 0 0",
    flexWrap: "wrap",
    minHeight: 34
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    minWidth: 0
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    flexShrink: 0
  },
  // tiny pill badges
  badge: (color) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    padding: "1px 6px",
    borderRadius: 999,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.02em",
    lineHeight: 1.6,
    color: color === "green" ? "#15803d" : color === "red" ? "#dc2626" : "var(--we-text-accent)",
    background: color === "green" ? "#f0fdf4" : color === "red" ? "#fef2f2" : "var(--we-bg-accent-light)",
    border: `1px solid ${color === "green" ? "#bbf7d0" : color === "red" ? "#fecaca" : "var(--we-border-accent)"}`
  }),
  // compressed icon button
  iconBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    padding: 0,
    border: "1px solid #d1d5db",
    borderRadius: 5,
    background: "#fff",
    color: "#6b7280",
    cursor: "pointer",
    fontSize: 11,
    transition: "all 0.12s",
    flexShrink: 0
  },
  // compressed text button
  textBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    height: 24,
    padding: "0 8px",
    border: "1px solid transparent",
    borderRadius: 4,
    background: "transparent",
    color: "hsl(var(--muted-foreground))",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 500,
    transition: "all 0.12s",
    flexShrink: 0,
    whiteSpace: "nowrap"
  },
  // template grid
  templateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(72px, 1fr))",
    gap: 4,
    padding: "6px 8px",
    borderBottom: "1px solid var(--we-border)",
    background: "var(--we-bg-secondary, #f8f9fa)"
  },
  templateBtn: (active) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    padding: "5px 4px",
    border: `1px solid ${active ? "var(--we-bg-accent, #6366f1)" : "#e2e4e9"}`,
    borderRadius: 6,
    background: active ? "var(--we-bg-accent-light, #eef2ff)" : "#fff",
    color: active ? "var(--we-text-accent, #4f46e5)" : "#6b7280",
    cursor: "pointer",
    fontSize: 10,
    fontWeight: 500,
    transition: "all 0.12s",
    lineHeight: 1.2
  }),
  // error strip
  errorStrip: {
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    padding: "5px 8px",
    background: "#fef2f2",
    borderTop: "1px solid #fecaca",
    fontSize: 11,
    color: "#dc2626",
    borderRadius: "0 0 6px 6px"
  },
  // ctx hint
  ctxHint: {
    position: "absolute",
    bottom: 6,
    right: 8,
    padding: "2px 7px",
    background: "rgba(255,255,255,0.93)",
    backdropFilter: "blur(4px)",
    border: "1px solid #e5e7eb",
    borderRadius: 5,
    fontSize: 10,
    color: "#9ca3af",
    pointerEvents: "none",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    zIndex: 10
  }
};
var VegaSpecEditor = ({
  value,
  onChange,
  onError,
  workflowContext = null,
  workflow = null,
  disabled = false
}) => {
  const [showTemplates, setShowTemplates] = (0, import_react3.useState)(false);
  const [parseError, setParseError] = (0, import_react3.useState)(null);
  const monacoRef = (0, import_react3.useRef)(null);
  const valueRef = (0, import_react3.useRef)(value);
  const isInternalChange = (0, import_react3.useRef)(false);
  (0, import_react3.useEffect)(() => {
    valueRef.current = value;
  }, [value]);
  const toJson = (v) => {
    if (!v) return "";
    try {
      return JSON.stringify(v, null, 2);
    } catch {
      return "";
    }
  };
  const valueString = (0, import_react3.useMemo)(() => toJson(value), [value]);
  const handleEditorChange = (0, import_react3.useCallback)((newValue) => {
    isInternalChange.current = true;
    if (!newValue?.trim()) {
      setParseError(null);
      onChange(null);
      isInternalChange.current = false;
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
    requestAnimationFrame(() => {
      isInternalChange.current = false;
    });
  }, [onChange, onError]);
  (0, import_react3.useEffect)(() => {
    if (!monacoRef.current) return;
    const monaco = monacoRef.current;
    const schema = workflow ? extractWorkflowSchema(workflow) : null;
    const disposable = monaco.languages.registerCompletionItemProvider("json", {
      triggerCharacters: [".", "{"],
      provideCompletionItems: (model, position) => {
        const lineText = model.getValueInRange({
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
        const bracketMatch = lineText.match(/\{\{([a-zA-Z0-9_]*)$/);
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
            const add = (items, kind, pfx) => items.forEach((item) => {
              const p = item.path.replace(/\{\{|\}\}/g, "");
              if (p.toLowerCase().includes(partial))
                suggestions.push({
                  label: item.name,
                  kind,
                  detail: `${pfx}: ${item.type}${item.nodeTitle ? ` (${item.nodeTitle})` : ""}`,
                  insertText: p,
                  range
                });
            });
            add(schema.inputs, monaco.languages.CompletionItemKind.Property, "Input");
            add(schema.nodeOutputs, monaco.languages.CompletionItemKind.Variable, "Node Output");
            add(schema.workflowOutputs, monaco.languages.CompletionItemKind.Event, "Workflow Output");
          }
        }
        if (workflowContext) {
          const ctxMatch = lineText.match(/\{\{ctx\.([a-zA-Z0-9_\[\].]*)$/);
          if (ctxMatch) {
            const partial = ctxMatch[1];
            getNestedKeys(workflowContext, "", 4).filter((k) => k.toLowerCase().includes(partial.toLowerCase())).forEach(
              (k) => suggestions.push({
                label: k,
                kind: monaco.languages.CompletionItemKind.Variable,
                detail: getValuePreview(workflowContext, k),
                insertText: k,
                range,
                documentation: `Value: ${getValuePreview(workflowContext, k)}`
              })
            );
          }
        }
        return { suggestions };
      }
    });
    return () => disposable.dispose();
  }, [workflowContext, workflow]);
  const applyTemplate = (0, import_react3.useCallback)((key) => {
    const t = VEGA_TEMPLATES[key];
    if (t) {
      onChange(t.spec);
      setParseError(null);
    }
  }, [onChange]);
  const contextVarCount = workflowContext ? Object.keys(workflowContext).length : 0;
  const hasError = Boolean(parseError);
  const headerExtra = /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      type: "button",
      style: {
        ...S.textBtn,
        ...showTemplates ? { background: "hsl(var(--accent))", color: "hsl(var(--accent-foreground))" } : {}
      },
      className: "hover:bg-muted hover:text-foreground",
      onClick: () => setShowTemplates((v) => !v)
    },
    /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.BarChart, { size: 9 }),
    "Templates"
  );
  const headerLeft = contextVarCount > 0 ? /* @__PURE__ */ import_react3.default.createElement("span", { style: S.badge("accent") }, contextVarCount, " ctx vars") : null;
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "flex flex-col" }, showTemplates && /* @__PURE__ */ import_react3.default.createElement("div", { style: S.templateGrid, className: "border border-b-0 rounded-t-md" }, Object.entries(VEGA_TEMPLATES).map(([key, tpl]) => {
    const Icon = tpl.icon;
    return /* @__PURE__ */ import_react3.default.createElement(
      "button",
      {
        key,
        type: "button",
        style: S.templateBtn(false),
        onClick: () => {
          applyTemplate(key);
          setShowTemplates(false);
        },
        onMouseEnter: (e) => {
          e.currentTarget.style.borderColor = "var(--we-bg-accent, #6366f1)";
          e.currentTarget.style.background = "var(--we-bg-accent-light, #eef2ff)";
          e.currentTarget.style.color = "var(--we-text-accent, #4f46e5)";
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.borderColor = "#e2e4e9";
          e.currentTarget.style.background = "#fff";
          e.currentTarget.style.color = "#6b7280";
        }
      },
      /* @__PURE__ */ import_react3.default.createElement(Icon, { size: 14 }),
      tpl.name
    );
  })), /* @__PURE__ */ import_react3.default.createElement(
    import_ui2.CodeEditor,
    {
      value: valueString,
      onChange: handleEditorChange,
      language: "json",
      disabled,
      title: "Vega-Lite",
      titleIcon: /* @__PURE__ */ import_react3.default.createElement(import_lucide_react2.Code, { style: { color: "var(--we-bg-accent, #6366f1)", fontSize: 13 } }),
      status: hasError ? "error" : "valid",
      statusMessage: parseError ? `Parse error: ${parseError}` : null,
      headerLeft,
      headerExtra,
      className: showTemplates ? "rounded-t-none" : "",
      onMount: (e, m) => {
        monacoRef.current = m;
      },
      footerHint: workflowContext ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, "Type ", /* @__PURE__ */ import_react3.default.createElement("code", { className: "font-mono bg-muted px-1 rounded-sm" }, "{{ctx."), " for suggestions") : null
    }
  ));
};
VegaSpecEditor.propTypes = {
  value: import_prop_types2.default.object,
  onChange: import_prop_types2.default.func.isRequired,
  onError: import_prop_types2.default.func,
  workflowContext: import_prop_types2.default.object,
  workflow: import_prop_types2.default.object,
  placeholder: import_prop_types2.default.string,
  disabled: import_prop_types2.default.bool,
  theme: import_prop_types2.default.oneOf(["light", "dark"])
};

// src/vega/shelfBuilder.jsx
var import_react8 = __toESM(require("react"));
var import_prop_types7 = __toESM(require("prop-types"));

// src/vega/dataFieldPanel.jsx
var import_react5 = __toESM(require("react"));
var import_prop_types4 = __toESM(require("prop-types"));

// src/vega/fieldPill.jsx
var import_react4 = __toESM(require("react"));
var import_prop_types3 = __toESM(require("prop-types"));

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
var import_ui3 = require("@jet-admin/ui");
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
  const handleDragStart = (0, import_react4.useCallback)((e) => {
    e.dataTransfer.setData("application/json", JSON.stringify(field));
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  }, [field]);
  const handleDragEnd = (0, import_react4.useCallback)((e) => {
    e.currentTarget.style.opacity = "1";
  }, []);
  return /* @__PURE__ */ import_react4.default.createElement(
    "div",
    {
      draggable: true,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onClick,
      className: `flex items-center gap-1.5 rounded-sm font-medium cursor-grab shadow-sm border transition-shadow hover:shadow-md ${typeClass} ${isCompact ? "px-1.5 py-0.5 text-[11px]" : "px-2.5 py-1.5 text-xs"} ${isDragging ? "opacity-50" : ""} ${className}`,
      title: `${field.name} (${field.type})`
    },
    /* @__PURE__ */ import_react4.default.createElement("span", { className: "opacity-70 font-mono scale-90" }, icon),
    /* @__PURE__ */ import_react4.default.createElement("span", { className: "truncate" }, field.name),
    field.aggregate && field.aggregate !== "none" && /* @__PURE__ */ import_react4.default.createElement("span", { className: "text-[9px] uppercase tracking-wider bg-brand-black/50 px-1 rounded-sm ml-1 font-bold", title: `Aggregate: ${field.aggregate}` }, field.aggregate.slice(0, 3)),
    onRemove && /* @__PURE__ */ import_react4.default.createElement(
      import_ui3.Button,
      {
        type: "button",
        variant: "ghost",
        size: "icon",
        onClick: (e) => {
          e.stopPropagation();
          onRemove();
        },
        className: "ml-auto h-4 w-4 rounded-full hover:bg-black/10 text-xs text-muted-foreground",
        title: "Remove"
      },
      "\xD7"
    )
  );
};
FieldPill.propTypes = {
  field: import_prop_types3.default.shape({
    name: import_prop_types3.default.string.isRequired,
    type: import_prop_types3.default.string.isRequired,
    icon: import_prop_types3.default.string,
    aggregate: import_prop_types3.default.string
  }).isRequired,
  onRemove: import_prop_types3.default.func,
  onClick: import_prop_types3.default.func,
  isDragging: import_prop_types3.default.bool,
  isCompact: import_prop_types3.default.bool,
  className: import_prop_types3.default.string
};

// src/vega/dataFieldPanel.jsx
var import_ui4 = require("@jet-admin/ui");
var import_lucide_react3 = require("lucide-react");
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
  queryResults,
  dataSource,
  onDataSourceChange,
  onFieldClick,
  workflow,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = (0, import_react5.useState)("");
  const [manualField, setManualField] = (0, import_react5.useState)("");
  const [showManualAdd, setShowManualAdd] = (0, import_react5.useState)(false);
  const [showSuggestions, setShowSuggestions] = (0, import_react5.useState)(false);
  const suggestionsRef = (0, import_react5.useRef)(null);
  (0, import_react5.useEffect)(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const schemaSuggestions = (0, import_react5.useMemo)(() => {
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
  const ctxArrayPaths = (0, import_react5.useMemo)(() => {
    if (!workflowContext) return [];
    return collectArrayPaths(workflowContext);
  }, [workflowContext]);
  const queryResultPaths = (0, import_react5.useMemo)(() => {
    if (!queryResults) return [];
    return collectArrayPaths(queryResults, "qr");
  }, [queryResults]);
  const allSuggestions = (0, import_react5.useMemo)(() => {
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
    if (queryResults) {
      for (const alias of Object.keys(queryResults)) {
        const data = queryResults[alias];
        const isArray = Array.isArray(data);
        const arrayData = isArray ? data : data?.data && Array.isArray(data.data) ? data.data : null;
        if (arrayData && arrayData.length > 0) {
          const path = isArray ? `{{${alias}}}` : `{{${alias}.data}}`;
          if (!seen.has(path)) {
            seen.add(path);
            combined.push({
              path,
              label: `${alias} (Data Source)`,
              sampleKeys: Object.keys(arrayData[0]),
              rowCount: arrayData.length,
              source: "datasource",
              description: `${arrayData.length} rows, fields: ${Object.keys(arrayData[0]).slice(0, 4).join(", ")}`
            });
          }
        }
      }
    }
    for (const s of schemaSuggestions) {
      if (!seen.has(s.path)) {
        seen.add(s.path);
        combined.push({ ...s, source: "schema" });
      }
    }
    return combined;
  }, [ctxArrayPaths, queryResultPaths, schemaSuggestions, queryResults]);
  const fields = (0, import_react5.useMemo)(() => {
    if (workflowContext && dataSource) {
      const match = dataSource.match(/\{\{ctx\.([^}]+)\}\}/);
      if (match) {
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
      }
    }
    if (queryResults && dataSource) {
      const match = dataSource.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const fullPath = match[1];
        const parts = fullPath.split(".");
        let current = queryResults;
        for (const part of parts) {
          if (current === void 0 || current === null) break;
          current = current[part];
        }
        if (Array.isArray(current) && current.length > 0) {
          return inferFieldsFromData(current);
        }
        if (current && typeof current === "object" && !Array.isArray(current)) {
          return Object.keys(current).map((key) => ({
            name: key,
            type: typeof current[key] === "number" ? "quantitative" : "nominal",
            icon: typeof current[key] === "number" ? "#" : "Abc"
          }));
        }
      }
    }
    return [];
  }, [workflowContext, queryResults, dataSource]);
  const filteredFields = (0, import_react5.useMemo)(() => {
    if (!searchTerm) return fields;
    const lower = searchTerm.toLowerCase();
    return fields.filter((f) => f.name.toLowerCase().includes(lower));
  }, [fields, searchTerm]);
  const quantFields = (0, import_react5.useMemo)(() => filteredFields.filter((f) => f.type === "quantitative"), [filteredFields]);
  const catFields = (0, import_react5.useMemo)(() => filteredFields.filter((f) => f.type === "nominal" || f.type === "ordinal"), [filteredFields]);
  const tempFields = (0, import_react5.useMemo)(() => filteredFields.filter((f) => f.type === "temporal"), [filteredFields]);
  const handleSelectSuggestion = (0, import_react5.useCallback)((suggestion) => {
    onDataSourceChange?.(suggestion.path);
    setShowSuggestions(false);
  }, [onDataSourceChange]);
  const handleAddManualField = (0, import_react5.useCallback)(() => {
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
        return /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.GitMerge, { className: "w-3 h-3 shrink-0 text-emerald-600" });
      case "output":
        return /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.ArrowRightFromLine, { className: "w-3 h-3 shrink-0 text-fuchsia-600" });
      case "runtime":
        return /* @__PURE__ */ import_react5.default.createElement(FiZap, { className: "w-3 h-3 shrink-0 text-amber-600" });
      case "datasource":
        return /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Database, { className: "w-3 h-3 shrink-0 text-blue-600" });
      default:
        return /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Database, { className: "w-3 h-3 shrink-0 text-brand-text-primary" });
    }
  };
  const renderFieldGroup = (groupFields, label, colorClass) => {
    if (groupFields.length === 0) return null;
    return /* @__PURE__ */ import_react5.default.createElement("div", { className: "mb-4" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: `text-[10px] font-bold uppercase tracking-widest mb-2 px-1 ${colorClass}` }, label, " (", groupFields.length, ")"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex flex-col gap-1.5 px-1" }, groupFields.map((field) => /* @__PURE__ */ import_react5.default.createElement(
      FieldPill,
      {
        key: field.name,
        field,
        onClick: () => onFieldClick?.(field),
        className: "w-full justify-start hover:scale-[1.02] transition-transform"
      }
    ))));
  };
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: `flex flex-col h-full bg-brand-dark ${className}` }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "p-2.5 border-b border-border bg-muted/30" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5" }, /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Database, { className: "w-3.5 h-3.5 text-muted-foreground" }), /* @__PURE__ */ import_react5.default.createElement("span", null, "Data Source")), /* @__PURE__ */ import_react5.default.createElement("div", { className: "relative", ref: suggestionsRef }, /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Input,
    {
      type: "text",
      value: dataSource || "",
      onChange: (e) => onDataSourceChange?.(e.target.value),
      onFocus: () => setShowSuggestions(true),
      placeholder: "Select or type a data path...",
      className: "w-full text-xs font-mono",
      title: "Workflow data source path"
    }
  ), showSuggestions && allSuggestions.length > 0 && /* @__PURE__ */ import_react5.default.createElement("div", { className: "absolute left-0 right-0 top-full mt-1 bg-brand-dark border border-border rounded-md shadow-xl z-50 max-h-60 overflow-y-auto w-80" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border bg-muted sticky top-0" }, "Available Variables (", allSuggestions.length, ")"), allSuggestions.map((s, i) => /* @__PURE__ */ import_react5.default.createElement(
    "div",
    {
      key: `${s.path}-${i}`,
      onClick: () => handleSelectSuggestion(s),
      className: `w-full text-left px-3 py-1.5 text-xs border-b border-border/50 flex items-start gap-2 transition-colors cursor-pointer ${dataSource === s.path ? "bg-primary/5 border-l-2 border-l-primary" : "bg-brand-dark hover:bg-muted"}`
    },
    /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-0.5" }, getCategoryIcon2(s.source || s.category)),
    /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-[11px] font-medium text-foreground font-mono truncate" }, s.label), /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-[10px] text-muted-foreground truncate mt-0.5", title: s.description }, s.description), s.nodeTitle && /* @__PURE__ */ import_react5.default.createElement("div", { className: "text-[9px] text-emerald-600 mt-1 uppercase tracking-wider font-semibold" }, "from: ", s.nodeTitle)),
    s.source === "runtime" && /* @__PURE__ */ import_react5.default.createElement("span", { className: "text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-sm uppercase tracking-wider shrink-0" }, "LIVE")
  )))), dataSource && fields.length > 0 && /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-1.5 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm w-fit border border-emerald-100" }, /* @__PURE__ */ import_react5.default.createElement(FiZap, { className: "w-3 h-3" }), fields.length, " fields detected")), fields.length > 5 && /* @__PURE__ */ import_react5.default.createElement("div", { className: "px-2.5 py-1.5 border-b border-border bg-brand-dark" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-2 bg-muted/50 border border-border rounded-sm px-2 py-1 focus-within:ring-1 focus-within:ring-ring focus-within:border-ring transition-shadow" }, /* @__PURE__ */ import_react5.default.createElement(FiSearch, { className: "w-3.5 h-3.5 text-muted-foreground" }), /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Input,
    {
      type: "text",
      value: searchTerm,
      onChange: (e) => setSearchTerm(e.target.value),
      placeholder: "Filter fields...",
      className: "flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground border-none shadow-none focus-visible:ring-0 h-6 p-0"
    }
  ))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1 overflow-y-auto p-2.5 min-h-0" }, fields.length > 0 ? /* @__PURE__ */ import_react5.default.createElement(import_react5.default.Fragment, null, renderFieldGroup(quantFields, "Measures", "text-emerald-600"), renderFieldGroup(catFields, "Dimensions", "text-blue-600"), renderFieldGroup(tempFields, "Temporal", "text-amber-600")) : /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex flex-col items-center justify-center h-full py-6 text-center px-3" }, /* @__PURE__ */ import_react5.default.createElement(import_lucide_react3.Database, { className: "w-8 h-8 mb-2 text-muted-foreground/30" }), /* @__PURE__ */ import_react5.default.createElement("p", { className: "text-xs text-muted-foreground leading-relaxed mb-3" }, dataSource ? "Run the workflow to detect fields from the data" : "Choose a data source above or type a ctx path"), !dataSource && allSuggestions.length > 0 && /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Button,
    {
      type: "button",
      size: "sm",
      onClick: () => setShowSuggestions(true),
      className: "h-7 px-3 text-[10px] font-semibold text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 uppercase tracking-wider"
    },
    "Browse ",
    allSuggestions.length,
    " Variables"
  )), /* @__PURE__ */ import_react5.default.createElement("div", { className: "mt-3" }, showManualAdd ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex flex-col gap-2" }, /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Input,
    {
      type: "text",
      value: manualField,
      onChange: (e) => setManualField(e.target.value),
      onKeyDown: (e) => e.key === "Enter" && handleAddManualField(),
      placeholder: "Type field_name & press Enter...",
      className: "w-full text-xs font-mono",
      autoFocus: true
    }
  ), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex items-center gap-2 justify-end" }, /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Button,
    {
      type: "button",
      variant: "ghost",
      size: "sm",
      onClick: () => setShowManualAdd(false),
      className: "h-6 px-2 text-xs text-muted-foreground hover:text-foreground font-medium"
    },
    "Cancel"
  ), /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Button,
    {
      type: "button",
      size: "sm",
      onClick: handleAddManualField,
      className: "h-6 px-2 text-xs font-semibold"
    },
    "Add Field"
  ))) : /* @__PURE__ */ import_react5.default.createElement(
    import_ui4.Button,
    {
      type: "button",
      variant: "outline",
      onClick: () => setShowManualAdd(true),
      className: "w-full h-auto py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30 border-dashed border-border hover:bg-muted hover:text-foreground"
    },
    /* @__PURE__ */ import_react5.default.createElement(FiPlus, { className: "w-3.5 h-3.5 mr-1" }),
    /* @__PURE__ */ import_react5.default.createElement("span", null, "Add Field Manually")
  ))));
};
DataFieldPanel.propTypes = {
  workflowContext: import_prop_types4.default.object,
  queryResults: import_prop_types4.default.object,
  dataSource: import_prop_types4.default.string,
  onDataSourceChange: import_prop_types4.default.func,
  onFieldClick: import_prop_types4.default.func,
  workflow: import_prop_types4.default.object,
  className: import_prop_types4.default.string
};

// src/vega/encodingShelf.jsx
var import_react6 = __toESM(require("react"));
var import_prop_types5 = __toESM(require("prop-types"));
var import_ui5 = require("@jet-admin/ui");
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
  const [isDragOver, setIsDragOver] = (0, import_react6.useState)(false);
  const dropRef = (0, import_react6.useRef)(null);
  const label = CHANNEL_LABELS[channel] || channel;
  const icon = CHANNEL_ICONS[channel] || "\u2022";
  const handleDragOver = (0, import_react6.useCallback)((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setIsDragOver(true);
  }, []);
  const handleDragLeave = (0, import_react6.useCallback)(() => {
    setIsDragOver(false);
  }, []);
  const handleDrop = (0, import_react6.useCallback)((e) => {
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
  const handleTypeChange = (0, import_react6.useCallback)((newType) => {
    if (value) onChange({ ...value, type: newType });
  }, [value, onChange]);
  const handleAggChange = (0, import_react6.useCallback)((newAgg) => {
    if (value) onChange({ ...value, aggregate: newAgg === "none" ? void 0 : newAgg });
  }, [value, onChange]);
  const handleSortToggle = (0, import_react6.useCallback)(() => {
    if (!value) return;
    const sortStates = [null, "ascending", "descending"];
    const current = sortStates.indexOf(value.sort);
    const next = sortStates[(current + 1) % sortStates.length];
    onChange({ ...value, sort: next });
  }, [value, onChange]);
  const isEmpty = !value || !value.field;
  const shelfClass = [
    "flex items-center w-full min-h-[36px] bg-brand-dark border border-border rounded-md p-1 gap-2 transition-colors",
    isEmpty ? "border-dashed border-border bg-muted/30" : "",
    isDragOver ? "border-primary bg-primary/5 shadow-inner" : "",
    className
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ import_react6.default.createElement(
    "div",
    {
      ref: dropRef,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      className: shelfClass
    },
    /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex items-center justify-start w-24 shrink-0 px-2 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-widest gap-2 border-r border-border" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-muted-foreground/50 text-sm" }, icon), /* @__PURE__ */ import_react6.default.createElement("span", { className: "truncate" }, label)),
    /* @__PURE__ */ import_react6.default.createElement("div", { className: "flex-1 flex flex-wrap items-center gap-2 min-w-0 pr-1" }, isEmpty ? /* @__PURE__ */ import_react6.default.createElement("span", { className: "text-xs text-muted-foreground italic px-2" }, isDragOver ? "Release to assign" : "Drop a field here") : /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement(
      FieldPill,
      {
        field: { ...value, name: value.field },
        onRemove,
        isCompact: true
      }
    ), /* @__PURE__ */ import_react6.default.createElement(import_ui5.Select, { value: value.type || "nominal", onValueChange: (val) => handleTypeChange(val) }, /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectTrigger, { className: "h-6 px-1.5 py-0.5 text-[11px]", title: "Data type" }, /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectValue, { placeholder: "Select type" })), /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectContent, { className: "z-[200]" }, FIELD_TYPES.map((t) => /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectItem, { key: t, value: t }, t.charAt(0).toUpperCase() + t.slice(1))))), (value.type === "quantitative" || value.aggregate) && /* @__PURE__ */ import_react6.default.createElement(import_ui5.Select, { value: value.aggregate || "none", onValueChange: (val) => handleAggChange(val) }, /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectTrigger, { className: "h-6 px-1.5 py-0.5 text-[11px]", title: "Aggregation" }, /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectValue, { placeholder: "Select agg" })), /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectContent, { className: "z-[200]" }, /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectItem, { value: "none" }, "no agg"), AGGREGATE_TYPES.map((a) => /* @__PURE__ */ import_react6.default.createElement(import_ui5.SelectItem, { key: a, value: a }, a)))), /* @__PURE__ */ import_react6.default.createElement(
      import_ui5.Button,
      {
        type: "button",
        variant: "ghost",
        size: "icon",
        onClick: handleSortToggle,
        className: "ml-auto h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/5 text-xs",
        title: `Sort: ${value.sort || "default"}`
      },
      value.sort === "ascending" ? "\u2191" : value.sort === "descending" ? "\u2193" : "\u2195"
    )))
  );
};
EncodingShelf.propTypes = {
  channel: import_prop_types5.default.string.isRequired,
  value: import_prop_types5.default.shape({
    field: import_prop_types5.default.string,
    type: import_prop_types5.default.string,
    aggregate: import_prop_types5.default.string,
    sort: import_prop_types5.default.string,
    title: import_prop_types5.default.string
  }),
  onChange: import_prop_types5.default.func.isRequired,
  onRemove: import_prop_types5.default.func,
  className: import_prop_types5.default.string
};

// src/vega/markSelector.jsx
var import_react7 = __toESM(require("react"));
var import_prop_types6 = __toESM(require("prop-types"));
var import_ui6 = require("@jet-admin/ui");
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
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: `flex flex-wrap gap-1 w-full ${className}` }, MARK_OPTIONS.map((opt) => {
    const isSelected = value === opt.key;
    return /* @__PURE__ */ import_react7.default.createElement(
      import_ui6.Button,
      {
        key: opt.key,
        type: "button",
        variant: isSelected ? "outline" : "ghost",
        size: "sm",
        onClick: () => onChange(opt.key),
        className: `h-auto py-1.5 flex-1 min-w-[60px] px-2 text-xs font-medium ${isSelected ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm hover:text-indigo-800 hover:bg-indigo-100" : "text-brand-text-primary border-transparent hover:bg-brand-border-dark"}`,
        title: `${opt.label}: ${opt.desc}`
      },
      /* @__PURE__ */ import_react7.default.createElement("span", { className: `mr-1.5 ${isSelected ? "text-indigo-500" : "text-brand-text-primary"}` }, opt.icon),
      /* @__PURE__ */ import_react7.default.createElement("span", { className: "hidden lg:inline" }, opt.label)
    );
  }));
};
MarkSelector.propTypes = {
  value: import_prop_types6.default.string,
  onChange: import_prop_types6.default.func.isRequired,
  className: import_prop_types6.default.string
};

// src/vega/shelfBuilder.jsx
var import_ui7 = require("@jet-admin/ui");
var import_lucide_react4 = require("lucide-react");
var VEGA_STRINGS = {
  WIDGET_DATASET_FIELD_MAPPING_BUTTON: "Mappings"
};
var PRIMARY_SHELVES = ["x", "y", "color", "size"];
var SECONDARY_SHELVES = ["row", "column", "shape", "opacity", "detail", "text"];
var ShelfBuilder = ({
  widgetEditorForm,
  workflowContext,
  workflows,
  queryResults
}) => {
  const [shelfSpec, setShelfSpec] = (0, import_react8.useState)(() => {
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
  (0, import_react8.useEffect)(() => {
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
  const [showSecondary, setShowSecondary] = (0, import_react8.useState)(false);
  const [showStyle, setShowStyle] = (0, import_react8.useState)(false);
  const selectedWorkflow = (0, import_react8.useMemo)(() => {
    const wID = widgetEditorForm.values.workflowID;
    if (!wID || !workflows) return null;
    return workflows.find((w) => String(w.workflowID) === String(wID));
  }, [widgetEditorForm.values.workflowID, workflows]);
  const resolvedMark = (0, import_react8.useMemo)(() => {
    if (shelfSpec.mark === "auto" || !shelfSpec.mark) {
      return inferMarkType(shelfSpec.encoding);
    }
    return shelfSpec.mark;
  }, [shelfSpec.mark, shelfSpec.encoding]);
  const handleChannelChange = (0, import_react8.useCallback)((channel, value) => {
    setShelfSpec((prev) => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        [channel]: value
      }
    }));
  }, []);
  const handleChannelRemove = (0, import_react8.useCallback)((channel) => {
    setShelfSpec((prev) => ({
      ...prev,
      encoding: {
        ...prev.encoding,
        [channel]: null
      }
    }));
  }, []);
  const handleMarkChange = (0, import_react8.useCallback)((mark) => {
    setShelfSpec((prev) => ({ ...prev, mark }));
  }, []);
  const handleDataSourceChange = (0, import_react8.useCallback)((newSource) => {
    setShelfSpec((prev) => ({ ...prev, dataSource: newSource }));
  }, []);
  const handleConfigChange = (0, import_react8.useCallback)((key, value) => {
    setShelfSpec((prev) => ({
      ...prev,
      config: { ...prev.config, [key]: value }
    }));
  }, []);
  const handleFieldQuickAdd = (0, import_react8.useCallback)((field) => {
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
  const [isOpen, setIsOpen] = (0, import_react8.useState)(false);
  (0, import_react8.useEffect)(() => {
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
  const hasDataSources = !!(queryResults && Object.keys(queryResults).length > 0);
  const isWorkflowSelected = !!selectedWorkflow;
  const hasAnyData = isWorkflowSelected || hasDataSources;
  return /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Dialog, { open: isOpen, onOpenChange: setIsOpen }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.DialogTrigger, { asChild: true }, /* @__PURE__ */ import_react8.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      className: "h-8 text-xs"
    },
    /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.TrendingUp, { className: "inline-block h-3 w-3 mr-2" }),
    VEGA_STRINGS.WIDGET_DATASET_FIELD_MAPPING_BUTTON
  )), /* @__PURE__ */ import_react8.default.createElement(import_ui7.DialogContent, { className: "max-w-6xl w-[95vw] h-[85vh] max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-brand-dark border-border shadow-2xl" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.DialogHeader, { className: "flex flex-row items-center px-4 py-3 border-b border-border bg-brand-dark shrink-0 space-y-0" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center gap-2 text-foreground" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.TrendingUp, { className: "w-5 h-5 text-primary" }), /* @__PURE__ */ import_react8.default.createElement(import_ui7.DialogTitle, { className: "text-base font-bold m-0 p-0 text-left" }, "Visual Chart Editor"))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 overflow-hidden bg-muted/30 flex p-3 gap-3 min-h-0" }, !hasAnyData ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col items-center justify-center w-full h-full text-center border-2 border-dashed border-border rounded-sm bg-brand-dark" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.Database, { className: "w-10 h-10 mb-3 text-muted-foreground/40" }), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-sm font-semibold text-foreground mb-1" }, "No Data Source Selected"), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Add a Data Source in the Data tab and run a Test, or select a Workflow.")) : /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col w-56 shrink-0 bg-brand-dark border border-border rounded-md overflow-hidden min-h-0 h-full" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "p-2 border-b border-border bg-brand-dark" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Select, { value: shelfSpec.dataSource || "", onValueChange: (val) => handleDataSourceChange(val) }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectTrigger, { className: "text-xs font-medium" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectValue, { placeholder: "Select Data Input" })), /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectContent, { className: "z-[200]" }, selectedWorkflow && /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { value: "workflow" }, "Workflow Output"), workflowContext && Object.keys(workflowContext).map((key) => /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { key, value: `{{ctx.${key}}}` }, `ctx.${key}`)), queryResults && Object.keys(queryResults).map((alias) => /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { key: `qr-${alias}`, value: `{{${alias}.data}}` }, alias, " (Data Source)"))))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 overflow-hidden outline-none min-h-0" }, /* @__PURE__ */ import_react8.default.createElement(
    DataFieldPanel,
    {
      workflowContext,
      queryResults,
      dataSource: shelfSpec.dataSource,
      onDataSourceChange: handleDataSourceChange,
      onFieldClick: handleFieldQuickAdd,
      workflow: selectedWorkflow,
      className: "h-full"
    }
  ))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-1 flex flex-col h-full overflow-y-auto min-h-0 pr-1 gap-1.5" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1" }, "Encoding Shelves"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "bg-brand-dark border border-border rounded-md p-3 flex flex-col gap-3" }, PRIMARY_SHELVES.map((ch) => /* @__PURE__ */ import_react8.default.createElement(
    EncodingShelf,
    {
      key: ch,
      channel: ch,
      value: shelfSpec.encoding[ch],
      onChange: (val) => handleChannelChange(ch, val),
      onRemove: () => handleChannelRemove(ch)
    }
  ))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "bg-brand-dark border border-border rounded-md mt-2" }, /* @__PURE__ */ import_react8.default.createElement(
    "div",
    {
      onClick: () => setShowSecondary(!showSecondary),
      className: "w-full flex items-center justify-start p-2.5 border-b border-border hover:bg-muted transition-colors focus:outline-none bg-brand-dark font-medium cursor-pointer"
    },
    showSecondary ? /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.ChevronDown, { className: "w-4 h-4 mr-2 text-muted-foreground" }) : /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.ChevronRight, { className: "w-4 h-4 mr-2 text-muted-foreground" }),
    /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-[10px] font-bold uppercase tracking-wider text-foreground" }, "More Channels ", /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-primary ml-1" }, "(", SECONDARY_SHELVES.filter((ch) => shelfSpec.encoding[ch]?.field).length, " active)"))
  ), showSecondary && /* @__PURE__ */ import_react8.default.createElement("div", { className: "p-3 flex flex-col gap-3 bg-muted/30" }, SECONDARY_SHELVES.map((ch) => /* @__PURE__ */ import_react8.default.createElement(
    EncodingShelf,
    {
      key: ch,
      channel: ch,
      value: shelfSpec.encoding[ch],
      onChange: (val) => handleChannelChange(ch, val),
      onRemove: () => handleChannelRemove(ch)
    }
  ))))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col w-64 shrink-0 h-full overflow-y-auto min-h-0 pl-1 gap-1.5 pb-4" }, /* @__PURE__ */ import_react8.default.createElement(
    "div",
    {
      onClick: () => setShowStyle(!showStyle),
      className: "flex items-center gap-2 p-1 text-muted-foreground hover:text-foreground focus:outline-none transition-colors bg-transparent cursor-pointer"
    },
    showStyle ? /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.ChevronDown, { className: "w-4 h-4" }) : /* @__PURE__ */ import_react8.default.createElement(import_lucide_react4.ChevronRight, { className: "w-4 h-4" }),
    /* @__PURE__ */ import_react8.default.createElement("span", { className: "text-[10px] font-bold uppercase tracking-widest" }, "Chart Style & Settings")
  ), showStyle && /* @__PURE__ */ import_react8.default.createElement("div", { className: "bg-brand-dark border border-border rounded-md p-3 space-y-4" }, /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5" }, "Marks"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "bg-muted/30 border border-border rounded-md p-2" }, /* @__PURE__ */ import_react8.default.createElement(MarkSelector, { value: shelfSpec.mark || "auto", onChange: handleMarkChange }), shelfSpec.mark === "auto" && /* @__PURE__ */ import_react8.default.createElement("div", { className: "text-[10px] text-muted-foreground italic p-1 text-center mt-1" }, "Auto-resolved to: ", /* @__PURE__ */ import_react8.default.createElement("span", { className: "font-semibold text-foreground not-italic ml-1" }, resolvedMark)))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "mt-2 space-y-3" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-bold text-muted-foreground uppercase tracking-widest" }, "Appearance"), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1" }, "Chart Title"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui7.Input,
    {
      type: "text",
      value: shelfSpec.config?.title || "",
      onChange: (e) => handleConfigChange("title", e.target.value),
      placeholder: "Untitled Chart",
      className: "w-full text-xs"
    }
  )), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1" }, "Color Palette"), /* @__PURE__ */ import_react8.default.createElement(import_ui7.Select, { value: shelfSpec.config?.colorScheme || "tableau10", onValueChange: (val) => handleConfigChange("colorScheme", val) }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectValue, { placeholder: "Select an option" })), /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectContent, { className: "z-[200]" }, COLOR_SCHEMES.map((s) => /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { key: s, value: s }, s))))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1" }, "Width"), /* @__PURE__ */ import_react8.default.createElement(import_ui7.Select, { value: shelfSpec.config?.width === "container" ? "container" : "custom", onValueChange: (val) => handleConfigChange("width", val === "container" ? "container" : 400) }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectTrigger, { className: "text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectValue, { placeholder: "Select an option" })), /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectContent, { className: "z-[200]" }, /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { value: "container" }, "Fill"), /* @__PURE__ */ import_react8.default.createElement(import_ui7.SelectItem, { value: "custom" }, "Fixed")))), /* @__PURE__ */ import_react8.default.createElement("div", null, /* @__PURE__ */ import_react8.default.createElement(import_ui7.Label, { className: "block text-[10px] font-medium text-muted-foreground uppercase tracking-wide mb-1" }, "Height"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui7.Input,
    {
      type: "number",
      value: shelfSpec.config?.height || 300,
      onChange: (e) => handleConfigChange("height", parseInt(e.target.value) || 300),
      className: "w-full text-xs"
    }
  )))))))), /* @__PURE__ */ import_react8.default.createElement(import_ui7.DialogFooter, { className: "px-4 py-2.5 bg-brand-dark shrink-0 mt-2" }, /* @__PURE__ */ import_react8.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      onClick: () => setIsOpen(false)
    },
    "Done"
  )))));
};
ShelfBuilder.propTypes = {
  widgetEditorForm: import_prop_types7.default.object.isRequired,
  workflowContext: import_prop_types7.default.object,
  workflows: import_prop_types7.default.array,
  queryResults: import_prop_types7.default.object
};

// src/vega/vegaConfigEditor.jsx
var import_lucide_react5 = require("lucide-react");
var VEGA_STRINGS2 = {
  WIDGET_EDITOR_FORM_SETTINGS_BUTTON: "Settings",
  WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL: "Refresh interval"
};
var VegaConfigEditor = ({
  widgetEditorForm,
  workflowContext,
  workflows,
  selectedWorkflow,
  queryResults
}) => {
  const isVegaLite = widgetEditorForm.values.widgetType === "vega-lite";
  const currentMode = widgetEditorForm.values.widgetConfig?.editorMode || (isVegaLite ? "visual" : "raw");
  const [showParseWarning, setShowParseWarning] = (0, import_react9.useState)(false);
  const [parseWarningsList, setParseWarningsList] = (0, import_react9.useState)([]);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = (0, import_react9.useState)(false);
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
  return /* @__PURE__ */ import_react9.default.createElement("div", { className: "bg-brand-dark border border-border rounded-md p-3 flex flex-col gap-3" }, isVegaLite && /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex flex-row items-center gap-2" }, /* @__PURE__ */ import_react9.default.createElement("span", { className: "text-xs font-medium text-muted-foreground" }, "Visual Editor"), /* @__PURE__ */ import_react9.default.createElement(import_ui8.Switch, { className: "h-[18px] w-[32px] [&>span]:h-3.5 [&>span]:w-3.5 data-[state=checked]:[&>span]:translate-x-3.5", checked: currentMode === "visual", onCheckedChange: (checked) => handleModeSwitch(checked ? "visual" : "raw") })), isVegaLite && /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex flex-row items-center justify-stretch gap-3" }, currentMode === "visual" && !showParseWarning && /* @__PURE__ */ import_react9.default.createElement(
    ShelfBuilder,
    {
      widgetEditorForm,
      workflowContext,
      workflows,
      queryResults
    }
  ), /* @__PURE__ */ import_react9.default.createElement(
    import_ui8.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      className: "h-8 text-xs",
      onClick: () => setIsSettingsDialogOpen(true)
    },
    /* @__PURE__ */ import_react9.default.createElement(import_lucide_react5.Settings, { className: "inline-block h-3 w-3 mr-2" }),
    VEGA_STRINGS2.WIDGET_EDITOR_FORM_SETTINGS_BUTTON
  ), /* @__PURE__ */ import_react9.default.createElement(import_ui8.Dialog, { open: isSettingsDialogOpen, onOpenChange: setIsSettingsDialogOpen }, /* @__PURE__ */ import_react9.default.createElement(import_ui8.DialogContent, { className: "max-w-lg" }, /* @__PURE__ */ import_react9.default.createElement(import_ui8.DialogHeader, null, /* @__PURE__ */ import_react9.default.createElement(import_ui8.DialogTitle, null, VEGA_STRINGS2.WIDGET_EDITOR_FORM_SETTINGS_BUTTON)), /* @__PURE__ */ import_react9.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "space-y-1.5" }, /* @__PURE__ */ import_react9.default.createElement(import_ui8.Label, { className: "text-xs font-medium text-foreground" }, `${VEGA_STRINGS2.WIDGET_EDITOR_FORM_REFRESH_INTERVAL_LABEL} (ms)`), /* @__PURE__ */ import_react9.default.createElement(
    import_ui8.Input,
    {
      type: "number",
      name: "widgetConfig.refetchInterval",
      className: "text-sm",
      onChange: widgetEditorForm.handleChange,
      value: widgetEditorForm.values.widgetConfig?.refetchInterval || ""
    }
  )), /* @__PURE__ */ import_react9.default.createElement("div", { className: "mt-2" }, /* @__PURE__ */ import_react9.default.createElement(import_ui8.Label, { className: "text-xs text-muted-foreground italic" }, "Additional options moved to Widget Settings.")))))), showParseWarning && /* @__PURE__ */ import_react9.default.createElement("div", { className: "my-2 shrink-0 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 dark:border-amber-900/40 dark:bg-amber-950/20" }, /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex items-start gap-2 text-xs" }, /* @__PURE__ */ import_react9.default.createElement(import_lucide_react5.AlertTriangle, { className: "mt-0.5 h-4 w-4 shrink-0 text-amber-600" }), /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex-1" }, /* @__PURE__ */ import_react9.default.createElement("h4", { className: "mb-1 font-semibold text-amber-900 dark:text-amber-200" }, "Cannot fully parse chart config"), /* @__PURE__ */ import_react9.default.createElement("p", { className: "mb-2 text-amber-800 dark:text-amber-300" }, "Switching to Visual mode may cause you to lose manual modifications:"), /* @__PURE__ */ import_react9.default.createElement("ul", { className: "mb-3 list-disc pl-4 text-amber-800 dark:text-amber-300" }, parseWarningsList.map((w, i) => /* @__PURE__ */ import_react9.default.createElement("li", { key: i, className: "mb-0.5" }, w))), /* @__PURE__ */ import_react9.default.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ import_react9.default.createElement(import_ui8.Button, { type: "button", variant: "outline", size: "sm", onClick: () => setShowParseWarning(false), className: "h-7 text-xs" }, "Cancel"), /* @__PURE__ */ import_react9.default.createElement(import_ui8.Button, { type: "button", size: "sm", onClick: confirmModeSwitch, className: "h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-700 dark:hover:bg-amber-600" }, "Switch & Overwrite"))))), !showParseWarning && currentMode === "raw" && /* @__PURE__ */ import_react9.default.createElement("div", { className: "min-h-[300px] flex-1 overflow-auto rounded-md border border-border bg-brand-dark" }, /* @__PURE__ */ import_react9.default.createElement(
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
  widgetEditorForm: import_prop_types8.default.object.isRequired,
  workflowContext: import_prop_types8.default.object,
  workflows: import_prop_types8.default.array,
  selectedWorkflow: import_prop_types8.default.object,
  queryResults: import_prop_types8.default.object
};

// src/index.js
init_tableWidget();
init_tableConfigEditor();

// src/widget.map.js
var import_react14 = __toESM(require("react"));

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
var import_widget_types = require("@jet-admin/widget-types");
init_buttonConfigEditor();
init_tableConfigEditor();
var import_lucide_react8 = require("lucide-react");
registerWidgets();
var LazyVegaWidget = import_react14.default.lazy(
  () => Promise.resolve().then(() => (init_vega(), vega_exports)).then((module2) => ({ default: module2.VegaWidget }))
);
var LazyButtonWidget = import_react14.default.lazy(
  () => Promise.resolve().then(() => (init_button(), button_exports)).then((module2) => ({ default: module2.ButtonWidget }))
);
var LazyTableWidget = import_react14.default.lazy(
  () => Promise.resolve().then(() => (init_table(), table_exports)).then((module2) => ({ default: module2.TableWidget }))
);
var WIDGETS_MAP = {
  "vega-lite": {
    label: "Vega-Lite",
    value: import_widget_types.WIDGET_TYPES.VEGA_LITE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Declarative visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react14.default.createElement(import_react14.default.Suspense, { fallback: /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading chart...") }, /* @__PURE__ */ import_react14.default.createElement(LazyVegaWidget, { data, ...props }));
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react14.default.createElement(import_lucide_react8.BarChart, { className: `!text-lg ${className}` }),
    sampleConfig: {
      options: {
        showActions: false,
        renderer: "svg",
        theme: void 0
      },
      showHeader: true
    }
  },
  "vega": {
    label: "Vega",
    value: import_widget_types.WIDGET_TYPES.VEGA.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Low-level visualization grammar",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react14.default.createElement(import_react14.default.Suspense, { fallback: /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading chart...") }, /* @__PURE__ */ import_react14.default.createElement(LazyVegaWidget, { data, ...props }));
    },
    configEditor: VegaConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react14.default.createElement(import_lucide_react8.BarChart, { className: `!text-lg ${className}` }),
    sampleConfig: {
      options: {
        showActions: false,
        renderer: "svg",
        theme: void 0
      },
      showHeader: true
    }
  },
  "button": {
    label: "Button",
    value: import_widget_types.WIDGET_TYPES.BUTTON.value,
    datasetFields: [],
    defaultAutoRun: false,
    description: "Trigger a workflow",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react14.default.createElement(import_react14.default.Suspense, { fallback: /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading button...") }, /* @__PURE__ */ import_react14.default.createElement(LazyButtonWidget, { data, ...props }));
    },
    configEditor: ButtonConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react14.default.createElement(import_lucide_react8.Component, { className: `!text-lg ${className}` }),
    sampleConfig: {
      text: "Click Me",
      variant: "default",
      size: "default",
      showHeader: true
    }
  },
  "table": {
    label: "Data Table",
    value: import_widget_types.WIDGET_TYPES.TABLE.value,
    datasetFields: [],
    defaultAutoRun: true,
    description: "Tabular data display with pagination",
    component: ({ data, ...props }) => {
      return /* @__PURE__ */ import_react14.default.createElement(import_react14.default.Suspense, { fallback: /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex justify-center items-center h-full text-xs text-brand-text-primary" }, "Loading table...") }, /* @__PURE__ */ import_react14.default.createElement(LazyTableWidget, { data, ...props }));
    },
    configEditor: TableConfigEditor,
    icon: ({ className }) => /* @__PURE__ */ import_react14.default.createElement(import_lucide_react8.Table, { className: `!text-lg ${className}` }),
    sampleConfig: {
      dataArrayTemplate: "{{ctx.data}}",
      columns: [],
      pagination: {
        enabled: false,
        pageParam: "page",
        totalTemplate: "{{ctx.total}}"
      },
      showHeader: true
    }
  }
};
//# sourceMappingURL=index.cjs.map
