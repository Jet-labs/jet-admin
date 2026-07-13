var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.js
var index_exports = {};
__export(index_exports, {
  DATASOURCE_UI_COMPONENTS: () => DATASOURCE_UI_COMPONENTS,
  DatasourceEditorContext: () => DatasourceEditorContext,
  QueryEditorContext: () => QueryEditorContext,
  useDatasourceEditorContext: () => useDatasourceEditorContext,
  useQueryEditorContext: () => useQueryEditorContext
});
module.exports = __toCommonJS(index_exports);
var import_react15 = __toESM(require("react"));
var import_datasource_types = require("@jet-admin/datasource-types");

// src/components/common/queryResponseView.js
var import_ui4 = require("@jet-admin/ui");
var import_react5 = __toESM(require("react"));

// src/components/common/queryResponseJSONTab.js
var import_react = __toESM(require("react"));
var import_ui = require("@jet-admin/ui");
var import_prop_types = __toESM(require("prop-types"));
var QueryResponseJSONTab = ({ data }) => {
  QueryResponseJSONTab.propTypes = {
    data: import_prop_types.default.object
  };
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto" }, /* @__PURE__ */ import_react.default.createElement(
    import_ui.CodeEditor,
    {
      value: JSON.stringify(data, null, 2),
      language: "json",
      readOnly: true,
      showHeader: false,
      height: "100%",
      className: "rounded-none border-b border-t-0 border-x-0 !h-full border-border"
    }
  ));
};

// src/components/common/queryResponseRawTab.js
var import_react2 = __toESM(require("react"));
var import_ui2 = require("@jet-admin/ui");
var import_prop_types2 = __toESM(require("prop-types"));
var QueryResponseRAWTab = ({ data }) => {
  QueryResponseRAWTab.propTypes = {
    data: import_prop_types2.default.object
  };
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto " }, /* @__PURE__ */ import_react2.default.createElement(
    import_ui2.CodeEditor,
    {
      value: JSON.stringify(data, null, 2),
      language: "json",
      readOnly: true,
      showHeader: false,
      height: "100%",
      className: "rounded-none border-b border-t-0 border-x-0 !h-full border-border"
    }
  ));
};

// src/components/common/queryResponseSchemaTab.js
var import_react3 = __toESM(require("react"));
var import_ui3 = require("@jet-admin/ui");
var import_styles = require("react-data-grid/lib/styles.css");
var import_to_json_schema = __toESM(require("to-json-schema"));
var import_prop_types3 = __toESM(require("prop-types"));
var QueryResponseSchemaTab = ({ data }) => {
  QueryResponseSchemaTab.propTypes = {
    data: import_prop_types3.default.object
  };
  const dataSchema = (0, import_to_json_schema.default)(
    data ? data : { arrays: { mode: "all" } }
  );
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto " }, /* @__PURE__ */ import_react3.default.createElement(
    import_ui3.CodeEditor,
    {
      value: JSON.stringify(dataSchema, null, 2),
      language: "json",
      readOnly: true,
      showHeader: false,
      height: "100%",
      className: "rounded-none border-b border-t-0 border-x-0 !h-full border-border"
    }
  ));
};

// src/components/common/queryResponseTableTab.js
var import_material = require("@mui/material");
var import_react4 = __toESM(require("react"));
var import_x_data_grid = require("@mui/x-data-grid");
var import_to_json_schema2 = __toESM(require("to-json-schema"));
var import_prop_types4 = __toESM(require("prop-types"));
var QueryResponseTableTab = ({
  data,
  className,
  height = "100%",
  width = "100%"
}) => {
  QueryResponseTableTab.propTypes = {
    data: import_prop_types4.default.array,
    className: import_prop_types4.default.string,
    height: import_prop_types4.default.string,
    width: import_prop_types4.default.string
  };
  const dataSchema = Array.isArray(data) && data.length > 0 ? (0, import_to_json_schema2.default)(data[0]) : null;
  const columns = (0, import_react4.useMemo)(() => {
    if (dataSchema && dataSchema.properties) {
      return Object.keys(dataSchema.properties).map((key) => {
        return {
          key,
          name: key,
          field: key,
          display: "flex",
          headerName: String(key),
          width: 300
        };
      });
    } else {
      return null;
    }
  }, [dataSchema]);
  return /* @__PURE__ */ import_react4.default.createElement(
    import_material.Box,
    {
      sx: { width, height },
      className: `!flex !flex-col !justify-start !items-stretch ${className}`
    },
    !dataSchema ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "!h-32 flex flex-col justify-center items-center w-full text-foreground" }, /* @__PURE__ */ import_react4.default.createElement("span", null, "Data schema not valid or no data available")) : !columns ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "!h-32 flex !flex-col !justify-center !items-center w-full text-foreground" }, /* @__PURE__ */ import_react4.default.createElement("span", null, "Columns cannot be extracted or mapped")) : data && Array.isArray(data) && data.length && columns ? /* @__PURE__ */ import_react4.default.createElement(
      import_x_data_grid.DataGrid,
      {
        rows: data.map((item, index) => {
          return { _g_uuid: `_index_${index}`, ...item };
        }),
        virtualizeColumnsWithAutoRowHeight: true,
        columns,
        className: `!w-100 !border-0`,
        density: "compact",
        showCellVerticalBorder: true,
        getRowClassName: (params) => params.indexRelativeToCurrentPage % 2 === 0 ? "bg-primary/10" : "Mui-odd",
        getRowHeight: () => "auto",
        getRowId: (row) => row._g_uuid,
        defaultColumnOptions: {
          sortable: true,
          resizable: true
        },
        sx: {
          "--unstable_DataGrid-radius": "0",
          "& .MuiDataGrid-root": {
            borderRadius: 0
          },
          "& .MuiIconButton-root": {
            outline: "none"
          },
          "& .MuiDataGrid-cell": {
            fontSize: "0.875rem !important",
            lineHeight: "1.25rem !important",
            fontWeight: "400 !important"
          },
          "& .MuiCheckbox-root": {
            padding: "4px"
          },
          "& .MuiDataGrid-columnHeaderCheckbox": {
            minWidth: "auto !important",
            width: "auto !important",
            flex: "0 0 auto !important",
            padding: "0.25rem !important",
            "& .MuiDataGrid-columnHeaderTitleContainer": {
              width: "auto",
              minWidth: "auto",
              flex: "none"
            }
          },
          "& .MuiDataGrid-cellCheckbox": {
            minWidth: "auto !important",
            width: "auto !important",
            flex: "0 0 auto !important",
            color: "hsl(var(--primary))",
            padding: "0.25rem !important"
          }
        }
      }
    ) : /* @__PURE__ */ import_react4.default.createElement("div", { className: "!h-32 flex !flex-col !justify-center !items-center w-full text-foreground" }, /* @__PURE__ */ import_react4.default.createElement("span", null, "No data"))
  );
};

// src/components/common/queryResponseView.js
var import_prop_types5 = __toESM(require("prop-types"));
var QueryResponseView = ({ queryResult }) => {
  const [activeTab, setActiveTab] = (0, import_react5.useState)("json");
  console.log("queryResult", queryResult);
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex flex-col h-full overflow-hidden bg-background" }, /* @__PURE__ */ import_react5.default.createElement(import_ui4.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "flex flex-col h-full" }, /* @__PURE__ */ import_react5.default.createElement(import_ui4.TabsList, null, /* @__PURE__ */ import_react5.default.createElement(import_ui4.TabsTrigger, { value: "json" }, "JSON"), /* @__PURE__ */ import_react5.default.createElement(import_ui4.TabsTrigger, { value: "table" }, "Table"), /* @__PURE__ */ import_react5.default.createElement(import_ui4.TabsTrigger, { value: "raw" }, "Raw"), /* @__PURE__ */ import_react5.default.createElement(import_ui4.TabsTrigger, { value: "schema" }, "Data Schema")), /* @__PURE__ */ import_react5.default.createElement("div", { className: "flex-1 min-h-0 overflow-y-auto bg-background" }, /* @__PURE__ */ import_react5.default.createElement(import_ui4.TabsContent, { value: "json", className: "mt-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none" }, /* @__PURE__ */ import_react5.default.createElement(QueryResponseJSONTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ import_react5.default.createElement(import_ui4.TabsContent, { value: "table", className: "mt-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none" }, /* @__PURE__ */ import_react5.default.createElement(QueryResponseTableTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ import_react5.default.createElement(import_ui4.TabsContent, { value: "raw", className: "mt-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none" }, /* @__PURE__ */ import_react5.default.createElement(QueryResponseRAWTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ import_react5.default.createElement(import_ui4.TabsContent, { value: "schema", className: "mt-0 h-full focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none" }, /* @__PURE__ */ import_react5.default.createElement(QueryResponseSchemaTab, { data: queryResult ? queryResult : {} })))));
};
QueryResponseView.propTypes = {
  queryResult: import_prop_types5.default.any
};

// src/components/common/webViewQueryResponseView.js
var import_react7 = __toESM(require("react"));
var import_prop_types7 = __toESM(require("prop-types"));

// src/components/common/queryResponseWebViewTab.js
var import_react6 = __toESM(require("react"));
var import_prop_types6 = __toESM(require("prop-types"));
var QueryResponseWebViewTab = ({
  data,
  className,
  height = "100%",
  width = "100%"
}) => {
  QueryResponseWebViewTab.propTypes = {
    data: import_prop_types6.default.array,
    className: import_prop_types6.default.string,
    height: import_prop_types6.default.string,
    width: import_prop_types6.default.string
  };
  console.log("data", data);
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "w-100 flex-grow h-full overflow-y-auto pb-5" }, /* @__PURE__ */ import_react6.default.createElement(
    "iframe",
    {
      src: data.url,
      title: "Web View",
      className: "w-full h-full border-none"
    }
  ));
};

// src/components/common/webViewQueryResponseView.js
var import_ui5 = require("@jet-admin/ui");
var WebViewQueryResponseView = ({ queryResult }) => {
  WebViewQueryResponseView.propTypes = {
    queryResult: import_prop_types7.default.object
  };
  console.log("queryResult", queryResult);
  return /* @__PURE__ */ import_react7.default.createElement(import_react7.default.Fragment, null, /* @__PURE__ */ import_react7.default.createElement(import_ui5.Tabs, { defaultValue: "web", className: "w-full flex flex-col h-full" }, /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsList, null, /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsTrigger, { value: "web" }, "Web View"), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsTrigger, { value: "json" }, "JSON"), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsTrigger, { value: "raw" }, "Raw"), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsTrigger, { value: "schema" }, "Data Schema")), /* @__PURE__ */ import_react7.default.createElement("div", { className: "w-100 h-full overflow-y-auto pb-5" }, /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsContent, { value: "web", className: "m-0 h-full" }, /* @__PURE__ */ import_react7.default.createElement(QueryResponseWebViewTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsContent, { value: "json", className: "m-0 h-full" }, /* @__PURE__ */ import_react7.default.createElement(QueryResponseJSONTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsContent, { value: "raw", className: "m-0 h-full" }, /* @__PURE__ */ import_react7.default.createElement(QueryResponseRAWTab, { data: queryResult ? queryResult : "" })), /* @__PURE__ */ import_react7.default.createElement(import_ui5.TabsContent, { value: "schema", className: "m-0 h-full" }, /* @__PURE__ */ import_react7.default.createElement(QueryResponseSchemaTab, { data: queryResult ? queryResult : {} })))));
};

// src/components/excelcsv/ExcelCSVQueryBuilder.jsx
var import_react8 = __toESM(require("react"));
var import_ui6 = require("@jet-admin/ui");
var import_lucide_react = require("lucide-react");
var FILTER_OPERATORS = [
  { value: "eq", label: "equals", needsValue: true },
  { value: "neq", label: "not equals", needsValue: true },
  { value: "gt", label: "greater than", needsValue: true },
  { value: "gte", label: "greater than or equal", needsValue: true },
  { value: "lt", label: "less than", needsValue: true },
  { value: "lte", label: "less than or equal", needsValue: true },
  { value: "contains", label: "contains", needsValue: true },
  { value: "not_contains", label: "does not contain", needsValue: true },
  { value: "starts_with", label: "starts with", needsValue: true },
  { value: "ends_with", label: "ends with", needsValue: true },
  { value: "is_empty", label: "is empty", needsValue: false },
  { value: "is_not_empty", label: "is not empty", needsValue: false }
];
var SORT_DIRECTIONS = [
  { value: "asc", label: "A \u2192 Z  (Ascending)" },
  { value: "desc", label: "Z \u2192 A  (Descending)" }
];
var COLUMN_TYPES = [
  { value: "auto", label: "Auto" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" }
];
var TABS = [
  { id: "source", label: "Source", icon: import_lucide_react.Database },
  { id: "columns", label: "Columns", icon: import_lucide_react.Columns2 },
  { id: "filter", label: "Filter", icon: import_lucide_react.Filter },
  { id: "sort", label: "Sort", icon: import_lucide_react.ArrowUpDown },
  { id: "settings", label: "Settings", icon: import_lucide_react.SlidersHorizontal }
];
var genId = () => `_${Math.random().toString(36).slice(2, 9)}`;
function normalise(opts = {}) {
  return {
    sheetName: opts.sheetName ?? "",
    headerRow: opts.headerRow ?? 1,
    range: opts.range ?? "",
    limit: opts.limit ?? "",
    columns: Array.isArray(opts.columns) ? opts.columns : [],
    filters: Array.isArray(opts.filters) ? opts.filters : [],
    sort: Array.isArray(opts.sort) ? opts.sort : []
  };
}
function SourceTab({ opts, update }) {
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Callout, null, "Configure which sheet and header row to read. Leave Sheet Name blank to use the first available sheet."), /* @__PURE__ */ import_react8.default.createElement("div", { className: "grid grid-cols-2 gap-2" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { htmlFor: "sheetName" }, "Sheet Name"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.Input,
    {
      id: "sheetName",
      name: "sheetName",
      placeholder: "e.g. Sheet1",
      value: opts.sheetName,
      onChange: (e) => update({ sheetName: e.target.value })
    }
  ), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Leave blank to read the first sheet.")), /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { htmlFor: "headerRow" }, "Header Row"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.Input,
    {
      id: "headerRow",
      name: "headerRow",
      type: "number",
      min: "1",
      placeholder: "1",
      value: opts.headerRow,
      onChange: (e) => update({ headerRow: Math.max(1, parseInt(e.target.value, 10) || 1) })
    }
  ), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Row number (1-based) containing column headers."))));
}
function ColumnsTab({ opts, update }) {
  const columns = opts.columns;
  const addColumn = () => update({
    columns: [
      ...columns,
      { id: genId(), sourceName: "", alias: "", type: "auto", enabled: true }
    ]
  });
  const removeColumn = (id) => update({ columns: columns.filter((c) => c.id !== id) });
  const patchColumn = (id, patch) => update({ columns: columns.map((c) => c.id === id ? { ...c, ...patch } : c) });
  const moveColumn = (index, direction) => {
    const next = [...columns];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ columns: next });
  };
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Callout, null, "Declare each column from your spreadsheet. Use ", /* @__PURE__ */ import_react8.default.createElement("strong", null, "Alias"), " ", "to rename it in query results. Leave empty to include all columns as-is."), columns.length === 0 ? /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.EmptyState,
    {
      icon: import_lucide_react.Columns2,
      message: "No columns declared \u2014 all spreadsheet columns will be returned.",
      action: /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addColumn }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Column")
    }
  ) : /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "grid grid-cols-[20px_1fr_1fr_100px_28px_28px_28px] gap-2 items-center px-1" }, /* @__PURE__ */ import_react8.default.createElement("span", null), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Source Column"), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Alias (optional)"), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Type"), /* @__PURE__ */ import_react8.default.createElement("span", null), /* @__PURE__ */ import_react8.default.createElement("span", null), /* @__PURE__ */ import_react8.default.createElement("span", null)), columns.map((col, idx) => /* @__PURE__ */ import_react8.default.createElement(
    "div",
    {
      key: col.id,
      className: `grid grid-cols-[20px_1fr_1fr_100px_28px_28px_28px] gap-2 items-center rounded border px-2 py-2 transition-colors ${col.enabled ? "border-border bg-background" : "border-border/50 bg-muted/30 opacity-60"}`
    },
    /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.GripVertical, { className: "h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" }),
    /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Input,
      {
        placeholder: "e.g. Revenue",
        value: col.sourceName,
        onChange: (e) => patchColumn(col.id, { sourceName: e.target.value }),
        className: "h-7 text-xs",
        size: "sm"
      }
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Input,
      {
        placeholder: "same as source",
        value: col.alias,
        onChange: (e) => patchColumn(col.id, { alias: e.target.value }),
        className: "h-7 text-xs",
        size: "sm"
      }
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Select,
      {
        value: col.type || "auto",
        onValueChange: (val) => patchColumn(col.id, { type: val })
      },
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectValue, null)),
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectContent, null, COLUMN_TYPES.map((t) => /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectItem, { key: t.value, value: t.value, className: "text-xs" }, t.label)))
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => patchColumn(col.id, { enabled: !col.enabled }),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-foreground transition-colors",
        title: col.enabled ? "Hide column" : "Show column"
      },
      col.enabled ? /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Eye, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.EyeOff, { className: "h-3.5 w-3.5" })
    ),
    /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col gap-0.5" }, /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveColumn(idx, -1),
        disabled: idx === 0,
        className: "flex items-center justify-center h-3 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.MoveUp, { className: "h-3 w-3" })
    ), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveColumn(idx, 1),
        disabled: idx === columns.length - 1,
        className: "flex items-center justify-center h-3 w-7 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.MoveDown, { className: "h-3 w-3" })
    )),
    /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeColumn(col.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Trash2, { className: "h-3.5 w-3.5" })
    )
  )), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addColumn, className: "w-full" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Column")));
}
function FilterTab({ opts, update }) {
  const filters = opts.filters;
  const addFilter = () => update({
    filters: [
      ...filters,
      { id: genId(), column: "", operator: "eq", value: "", logic: "AND" }
    ]
  });
  const removeFilter = (id) => update({ filters: filters.filter((f) => f.id !== id) });
  const patchFilter = (id, patch) => update({ filters: filters.map((f) => f.id === id ? { ...f, ...patch } : f) });
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Callout, null, "Filter rows after fetching. Multiple conditions are applied in order. Use the ", /* @__PURE__ */ import_react8.default.createElement("strong", null, "AND / OR"), " chip to control how each condition combines with the next."), filters.length === 0 ? /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.EmptyState,
    {
      icon: import_lucide_react.Filter,
      message: "No filters applied \u2014 all rows will be returned.",
      action: /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addFilter }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Filter")
    }
  ) : /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, filters.map((filter, idx) => {
    const operatorDef = FILTER_OPERATORS.find((o) => o.value === filter.operator);
    const needsValue = operatorDef?.needsValue !== false;
    return /* @__PURE__ */ import_react8.default.createElement("div", { key: filter.id, className: "space-y-1" }, idx > 0 && /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center gap-2 py-0.5 pl-1" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "h-px flex-1 bg-border" }), /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.LogicChip,
      {
        value: filter.logic,
        onChange: (val) => patchFilter(filter.id, { logic: val })
      }
    ), /* @__PURE__ */ import_react8.default.createElement("div", { className: "h-px flex-1 bg-border" })), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex items-center gap-2 rounded border border-border bg-background px-3 py-2" }, /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Input,
      {
        placeholder: "Column name",
        value: filter.column,
        onChange: (e) => patchFilter(filter.id, { column: e.target.value }),
        className: "h-7 text-xs flex-[2]",
        size: "sm"
      }
    ), /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-[2]" }, /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Select,
      {
        value: filter.operator,
        onValueChange: (val) => patchFilter(filter.id, { operator: val })
      },
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectValue, null)),
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectContent, null, FILTER_OPERATORS.map((op) => /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectItem, { key: op.value, value: op.value, className: "text-xs" }, op.label)))
    )), needsValue ? /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Input,
      {
        placeholder: "Value or {{inputs.param}}",
        value: filter.value,
        onChange: (e) => patchFilter(filter.id, { value: e.target.value }),
        className: "h-7 text-xs flex-[3] font-mono",
        size: "sm"
      }
    ) : /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex-[3]" }), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeFilter(filter.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Trash2, { className: "h-3.5 w-3.5" })
    )));
  }), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addFilter, className: "w-full" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Condition")), filters.length > 0 && /* @__PURE__ */ import_react8.default.createElement("div", { className: "rounded border border-border bg-muted/30 p-3 space-y-1" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Dynamic values"), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-[11px] text-muted-foreground mt-1" }, "Use", " ", /* @__PURE__ */ import_react8.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono" }, "{{inputs.paramName}}"), " ", "in Value fields to inject runtime inputs from the query engine.")));
}
function SortTab({ opts, update }) {
  const sort = opts.sort;
  const addSort = () => update({
    sort: [...sort, { id: genId(), column: "", direction: "asc" }]
  });
  const removeSort = (id) => update({ sort: sort.filter((s) => s.id !== id) });
  const patchSort = (id, patch) => update({ sort: sort.map((s) => s.id === id ? { ...s, ...patch } : s) });
  const moveSort = (index, direction) => {
    const next = [...sort];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ sort: next });
  };
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Callout, null, "Sort rows after fetching and filtering. Rules are applied from top to bottom \u2014 the first rule is the primary sort key."), sort.length === 0 ? /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.EmptyState,
    {
      icon: import_lucide_react.ArrowUpDown,
      message: "No sort rules \u2014 rows returned in spreadsheet order.",
      action: /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addSort }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Sort Rule")
    }
  ) : /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "grid grid-cols-[24px_24px_1fr_160px_28px] gap-2 items-center px-1" }, /* @__PURE__ */ import_react8.default.createElement("span", null), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "#"), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Column"), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Direction"), /* @__PURE__ */ import_react8.default.createElement("span", null)), sort.map((rule, idx) => /* @__PURE__ */ import_react8.default.createElement(
    "div",
    {
      key: rule.id,
      className: "grid grid-cols-[24px_24px_1fr_160px_28px] gap-2 items-center rounded border border-border bg-background px-2 py-2"
    },
    /* @__PURE__ */ import_react8.default.createElement("div", { className: "flex flex-col gap-0.5" }, /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveSort(idx, -1),
        disabled: idx === 0,
        className: "flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.MoveUp, { className: "h-3 w-3" })
    ), /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveSort(idx, 1),
        disabled: idx === sort.length - 1,
        className: "flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.MoveDown, { className: "h-3 w-3" })
    )),
    /* @__PURE__ */ import_react8.default.createElement(
      "span",
      {
        className: `inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${idx === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`
      },
      idx + 1
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Input,
      {
        placeholder: "Column name",
        value: rule.column,
        onChange: (e) => patchSort(rule.id, { column: e.target.value }),
        className: "h-7 text-xs",
        size: "sm"
      }
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      import_ui6.Select,
      {
        value: rule.direction,
        onValueChange: (val) => patchSort(rule.id, { direction: val })
      },
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectValue, null)),
      /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectContent, null, SORT_DIRECTIONS.map((d) => /* @__PURE__ */ import_react8.default.createElement(import_ui6.SelectItem, { key: d.value, value: d.value, className: "text-xs" }, d.label)))
    ),
    /* @__PURE__ */ import_react8.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeSort(rule.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
      },
      /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Trash2, { className: "h-3.5 w-3.5" })
    )
  )), /* @__PURE__ */ import_react8.default.createElement(import_ui6.Button, { type: "button", variant: "outline", size: "sm", onClick: addSort, className: "w-full" }, /* @__PURE__ */ import_react8.default.createElement(import_lucide_react.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Sort Rule")));
}
function SettingsTab({ opts, update }) {
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Callout, null, "Advanced fetch settings. ", /* @__PURE__ */ import_react8.default.createElement("strong", null, "Range"), " limits which rows are read from the file itself (before any filters). ", /* @__PURE__ */ import_react8.default.createElement("strong", null, "Limit"), " ", "caps the final result count."), /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Row Range"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "grid grid-cols-2 gap-3 !mt-0" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { htmlFor: "range" }, "A1-Notation Range"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.Input,
    {
      id: "range",
      name: "range",
      placeholder: "e.g. A1:Z500",
      value: opts.range,
      onChange: (e) => update({ range: e.target.value })
    }
  ), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Restricts rows read from the spreadsheet at the file-parse level. Format:", " ", /* @__PURE__ */ import_react8.default.createElement("code", { className: "bg-background px-0.5 rounded border border-border font-mono text-[11px]" }, "A1:Z100"), ". Leave blank for all rows.")), /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { htmlFor: "limit" }, "Row Limit"), /* @__PURE__ */ import_react8.default.createElement(
    import_ui6.Input,
    {
      id: "limit",
      name: "limit",
      type: "number",
      min: "1",
      placeholder: "No limit",
      value: opts.limit,
      onChange: (e) => update({
        limit: e.target.value === "" ? "" : parseInt(e.target.value, 10)
      })
    }
  ), /* @__PURE__ */ import_react8.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Maximum rows returned after all filters and sorts are applied. Equivalent to", " ", /* @__PURE__ */ import_react8.default.createElement("code", { className: "bg-background px-0.5 rounded border border-border font-mono text-[11px]" }, "rows.slice(0, limit)"), ".")))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Full Datasource Call Preview"), /* @__PURE__ */ import_react8.default.createElement("div", { className: "rounded bg-muted/40 border border-border p-4 font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground" }, /* @__PURE__ */ import_react8.default.createElement("code", { className: "whitespace-pre" }, buildDatasourcePreview(opts)))));
}
function buildDatasourcePreview(opts) {
  const enabledCols = (opts.columns || []).filter((c) => c.enabled && c.sourceName);
  const activeFilters = (opts.filters || []).filter((f) => f.column);
  const activeSort = (opts.sort || []).filter((s) => s.column);
  const obj = {
    ...opts.sheetName ? { sheetName: opts.sheetName } : {},
    headerRow: opts.headerRow || 1,
    ...opts.range ? { range: opts.range } : {},
    ...opts.limit ? { limit: opts.limit } : {},
    ...enabledCols.length ? {
      columns: enabledCols.map((c) => ({
        sourceName: c.sourceName,
        ...c.alias ? { alias: c.alias } : {},
        ...c.type && c.type !== "auto" ? { type: c.type } : {}
      }))
    } : {},
    ...activeFilters.length ? { filters: activeFilters.map(({ id, ...rest }) => rest) } : {},
    ...activeSort.length ? { sort: activeSort.map(({ id, ...rest }) => rest) } : {}
  };
  return JSON.stringify(obj, null, 2);
}
var ExcelCSVQueryBuilder = ({ queryEditorForm }) => {
  const raw = queryEditorForm?.dataQueryOptions || {};
  const opts = normalise(raw);
  const [activeTab, setActiveTab] = (0, import_react8.useState)("source");
  const update = (0, import_react8.useCallback)(
    (updates) => {
      queryEditorForm.setQueryOptions({
        ...opts,
        ...updates
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryEditorForm, JSON.stringify(opts)]
  );
  const badges = {
    columns: opts.columns.filter((c) => c.enabled && c.sourceName).length,
    filter: opts.filters.filter((f) => f.column).length,
    sort: opts.sort.filter((s) => s.column).length
  };
  return /* @__PURE__ */ import_react8.default.createElement("div", { className: "space-y-0" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full" }, /* @__PURE__ */ import_react8.default.createElement(import_ui6.TabsList, null, TABS.map((tab) => {
    const Icon = tab.icon;
    const badgeCount = badges[tab.id];
    return /* @__PURE__ */ import_react8.default.createElement(import_ui6.TabsTrigger, { key: tab.id, value: tab.id, className: "gap-2 px-3 py-2 text-xs" }, /* @__PURE__ */ import_react8.default.createElement(Icon, { className: "h-3.5 w-3.5" }), tab.label, badgeCount > 0 && /* @__PURE__ */ import_react8.default.createElement("span", { className: "ml-2 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold" }, badgeCount));
  })), /* @__PURE__ */ import_react8.default.createElement(import_ui6.TabsContent, { value: "source", className: "pb-2" }, /* @__PURE__ */ import_react8.default.createElement(SourceTab, { opts, update })), /* @__PURE__ */ import_react8.default.createElement(import_ui6.TabsContent, { value: "columns", className: "pb-2" }, /* @__PURE__ */ import_react8.default.createElement(ColumnsTab, { opts, update })), /* @__PURE__ */ import_react8.default.createElement(import_ui6.TabsContent, { value: "filter", className: "pb-2" }, /* @__PURE__ */ import_react8.default.createElement(FilterTab, { opts, update })), /* @__PURE__ */ import_react8.default.createElement(import_ui6.TabsContent, { value: "sort", className: "pb-2" }, /* @__PURE__ */ import_react8.default.createElement(SortTab, { opts, update })), /* @__PURE__ */ import_react8.default.createElement(import_ui6.TabsContent, { value: "settings", className: "pb-2" }, /* @__PURE__ */ import_react8.default.createElement(SettingsTab, { opts, update }))));
};

// src/components/googlesheets/GoogleSheetsDatasourceEditor.jsx
var import_react10 = __toESM(require("react"));

// src/context/DatasourceEditorContext.js
var import_react9 = __toESM(require("react"));
var DatasourceEditorContext = (0, import_react9.createContext)(null);
var useDatasourceEditorContext = () => {
  const ctx = (0, import_react9.useContext)(DatasourceEditorContext);
  if (!ctx) {
    throw new Error(
      "useDatasourceEditorContext() must be used inside a <DatasourceEditorContext.Provider>. This provider is wired in the frontend app's DatasourceEditor component."
    );
  }
  return ctx;
};

// src/components/googlesheets/GoogleSheetsDatasourceEditor.jsx
var import_ui7 = require("@jet-admin/ui");
var import_lucide_react2 = require("lucide-react");
function StepIndicator({ steps, currentStep }) {
  return /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2" }, steps.map((step, i) => {
    const isActive = i === currentStep;
    const isComplete = i < currentStep;
    return /* @__PURE__ */ import_react10.default.createElement(import_react10.default.Fragment, { key: step.id }, i > 0 && /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.ChevronRight, { className: `h-3.5 w-3.5 shrink-0 ${isComplete ? "text-primary" : "text-muted-foreground/30"}` }), /* @__PURE__ */ import_react10.default.createElement("div", { className: `flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors ${isActive ? "bg-muted text-foreground" : isComplete ? "bg-muted/50 text-foreground/70" : "text-muted-foreground/50"}` }, isComplete ? /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.Check, { className: "h-3 w-3" }) : /* @__PURE__ */ import_react10.default.createElement("span", { className: "h-4 w-4 flex items-center justify-center rounded-full border text-[10px] font-bold border-current" }, i + 1), step.label));
  }));
}
function AuthMethodCard({ icon: Icon, title, description, isSelected, onClick }) {
  return /* @__PURE__ */ import_react10.default.createElement(
    "button",
    {
      type: "button",
      onClick,
      className: `flex items-start gap-3 p-3.5 rounded border text-left transition-all w-full ${isSelected ? "border-primary bg-primary/10 text-foreground shadow-sm" : "border-border bg-background text-muted-foreground hover:bg-muted/30"}`
    },
    /* @__PURE__ */ import_react10.default.createElement(Icon, { className: `h-5 w-5 shrink-0 mt-0.5 ${isSelected ? "text-primary" : "text-muted-foreground/80"}` }),
    /* @__PURE__ */ import_react10.default.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ import_react10.default.createElement("p", { className: `text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}` }, title), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" }, description)),
    isSelected && /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.Check, { className: "h-4 w-4 text-primary shrink-0 ml-auto mt-0.5" })
  );
}
var STEPS = [
  { id: "auth", label: "Authentication" },
  { id: "config", label: "Configuration" }
];
var GoogleSheetsDatasourceEditor = ({ datasourceEditorForm }) => {
  const { oauth } = useDatasourceEditorContext();
  const options = datasourceEditorForm.datasourceOptions || {};
  const [currentStep, setCurrentStep] = (0, import_react10.useState)(
    options.authType && (options.serviceAccountKey || options.oauth2?.vaultCredentialID) ? 1 : 0
  );
  const authType = options.authType || "serviceAccount";
  const isOAuthConnected = !!options.oauth2?.vaultCredentialID;
  const hasServiceAccountKey = !!options.serviceAccountKey;
  const handleAuthTypeChange = (0, import_react10.useCallback)((type) => {
    datasourceEditorForm.patchDatasourceOptions({ authType: type });
  }, [datasourceEditorForm]);
  const handleOAuthConnect = (0, import_react10.useCallback)(() => {
    oauth.startOAuth(
      (vaultCredentialID) => {
        datasourceEditorForm.patchDatasourceOptions({
          oauth2: { vaultCredentialID }
        });
        setCurrentStep(1);
      }
    );
  }, [oauth, datasourceEditorForm]);
  const handleServiceAccountKeyChange = (0, import_react10.useCallback)((e) => {
    datasourceEditorForm.patchDatasourceOptions({
      serviceAccountKey: e.target.value
    });
  }, [datasourceEditorForm]);
  const handleServiceAccountContinue = (0, import_react10.useCallback)(() => {
    if (hasServiceAccountKey) {
      setCurrentStep(1);
    }
  }, [hasServiceAccountKey]);
  const handleConnectionNameChange = (0, import_react10.useCallback)((e) => {
    datasourceEditorForm.patchDatasourceOptions({
      connectionName: e.target.value
    });
  }, [datasourceEditorForm]);
  const handleDefaultSpreadsheetIdChange = (0, import_react10.useCallback)((e) => {
    datasourceEditorForm.patchDatasourceOptions({
      defaultSpreadsheetId: e.target.value
    });
  }, [datasourceEditorForm]);
  return /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement(StepIndicator, { steps: STEPS, currentStep }), currentStep === 0 && /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement(
    AuthMethodCard,
    {
      icon: import_lucide_react2.KeyRound,
      title: "Service Account",
      description: "Use a Google Cloud service account JSON key for server-to-server authentication.",
      isSelected: authType === "serviceAccount",
      onClick: () => handleAuthTypeChange("serviceAccount")
    }
  ), /* @__PURE__ */ import_react10.default.createElement(
    AuthMethodCard,
    {
      icon: import_lucide_react2.Globe,
      title: "OAuth 2.0",
      description: "Connect your Google Account interactively. Best for accessing personal spreadsheets.",
      isSelected: authType === "oauth2",
      onClick: () => handleAuthTypeChange("oauth2")
    }
  )), authType === "serviceAccount" && /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-3 pt-2" }, /* @__PURE__ */ import_react10.default.createElement(import_ui7.Label, null, "Service Account JSON Key"), /* @__PURE__ */ import_react10.default.createElement(
    import_ui7.Textarea,
    {
      className: "min-h-[160px] font-mono text-xs",
      placeholder: "Paste the entire JSON key content here...",
      value: options.serviceAccountKey || "",
      onChange: handleServiceAccountKeyChange
    }
  ), hasServiceAccountKey && /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2 text-xs text-foreground" }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.ShieldCheck, { className: "h-3.5 w-3.5 text-primary" }), /* @__PURE__ */ import_react10.default.createElement("span", null, "Key provided")), /* @__PURE__ */ import_react10.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      disabled: !hasServiceAccountKey,
      onClick: handleServiceAccountContinue,
      variant: "green",
      className: "w-full"
    },
    "Continue",
    /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.ChevronRight, { className: "h-4 w-4" })
  )), authType === "oauth2" && /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-3 pt-2" }, isOAuthConnected ? /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-3 p-3 rounded border border-primary/20 bg-primary/5" }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.ShieldCheck, { className: "h-5 w-5 text-primary shrink-0" }), /* @__PURE__ */ import_react10.default.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-sm font-semibold text-foreground" }, "Google Account Connected"), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-xs text-muted-foreground mt-0.5 font-mono truncate" }, "Credential ID: ", options.oauth2.vaultCredentialID)), /* @__PURE__ */ import_react10.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      onClick: handleOAuthConnect,
      variant: "ghost",
      size: "sm",
      className: "text-muted-foreground hover:text-foreground h-7 text-xs font-normal"
    },
    "Reconnect"
  )) : /* @__PURE__ */ import_react10.default.createElement(import_ui7.Callout, null, "You'll be redirected to Google to authorize access to your spreadsheets. Credentials are stored securely in the vault."), isOAuthConnected ? /* @__PURE__ */ import_react10.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      onClick: () => setCurrentStep(1),
      variant: "green",
      className: "w-full"
    },
    "Continue",
    /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.ChevronRight, { className: "h-4 w-4" })
  ) : /* @__PURE__ */ import_react10.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      onClick: handleOAuthConnect,
      disabled: oauth.loading,
      variant: "green",
      className: "w-full"
    },
    oauth.loading ? /* @__PURE__ */ import_react10.default.createElement(import_react10.default.Fragment, null, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.Loader2, { className: "h-4 w-4 animate-spin" }), "Connecting...") : /* @__PURE__ */ import_react10.default.createElement(import_react10.default.Fragment, null, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.Globe, { className: "h-4 w-4" }), "Connect Google Account")
  ))), currentStep === 1 && /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react10.default.createElement(
    import_ui7.Button,
    {
      type: "button",
      onClick: () => setCurrentStep(0),
      variant: "ghost",
      size: "sm",
      className: "text-muted-foreground hover:text-foreground h-7 px-2 -ml-2 font-normal"
    },
    "\u2190 Back to authentication"
  ), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2 p-2.5 rounded border border-primary/20 bg-primary/5 text-xs text-primary" }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.ShieldCheck, { className: "h-4 w-4 shrink-0" }), /* @__PURE__ */ import_react10.default.createElement("span", { className: "font-semibold" }, authType === "oauth2" ? "OAuth 2.0" : "Service Account", " \u2014 Connected")), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react10.default.createElement(import_ui7.Label, { htmlFor: "gs-connectionName" }, "Connection Name"), /* @__PURE__ */ import_react10.default.createElement(
    import_ui7.Input,
    {
      id: "gs-connectionName",
      type: "text",
      placeholder: "My Google Sheets",
      value: options.connectionName || "",
      onChange: handleConnectionNameChange
    }
  )), /* @__PURE__ */ import_react10.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react10.default.createElement(import_ui7.Label, { htmlFor: "gs-defaultSpreadsheetId" }, "Default Spreadsheet ID ", /* @__PURE__ */ import_react10.default.createElement("span", { className: "text-muted-foreground" }, "(optional)")), /* @__PURE__ */ import_react10.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react10.default.createElement(import_lucide_react2.FileSpreadsheet, { className: "h-4 w-4 text-muted-foreground shrink-0" }), /* @__PURE__ */ import_react10.default.createElement(
    import_ui7.Input,
    {
      id: "gs-defaultSpreadsheetId",
      type: "text",
      placeholder: "e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms",
      value: options.defaultSpreadsheetId || "",
      onChange: handleDefaultSpreadsheetIdChange
    }
  )), /* @__PURE__ */ import_react10.default.createElement("p", { className: "text-[11px] text-muted-foreground" }, "Found in the spreadsheet URL: docs.google.com/spreadsheets/d/", /* @__PURE__ */ import_react10.default.createElement("strong", null, "SPREADSHEET_ID"), "/edit"))));
};

// src/components/googlesheets/GoogleSheetsQueryEditor.jsx
var import_react12 = __toESM(require("react"));

// src/context/QueryEditorContext.js
var import_react11 = __toESM(require("react"));
var QueryEditorContext = (0, import_react11.createContext)(null);
var useQueryEditorContext = () => {
  const ctx = (0, import_react11.useContext)(QueryEditorContext);
  if (!ctx) {
    throw new Error(
      "useQueryEditorContext() must be used inside a <QueryEditorContext.Provider>. This provider is wired in the frontend app's DataQueryEditor component."
    );
  }
  return ctx;
};

// src/components/googlesheets/GoogleSheetsQueryEditor.jsx
var import_ui8 = require("@jet-admin/ui");
var import_lucide_react3 = require("lucide-react");
var OPERATIONS = [
  { id: "read", label: "Read", icon: import_lucide_react3.BookOpen, description: "Fetch data from a sheet range" },
  { id: "write", label: "Write", icon: import_lucide_react3.PenLine, description: "Write data to a sheet range" },
  { id: "append", label: "Append", icon: import_lucide_react3.Plus, description: "Append rows to the end of a sheet" },
  { id: "update", label: "Update", icon: import_lucide_react3.PenLine, description: "Update cells in a range" },
  { id: "clear", label: "Clear", icon: import_lucide_react3.Trash2, description: "Clear data from a range" },
  { id: "getSpreadsheetInfo", label: "Get Info", icon: import_lucide_react3.Info, description: "Get spreadsheet metadata" }
];
var TABS2 = [
  { id: "source", label: "Source", icon: import_lucide_react3.FileSpreadsheet },
  { id: "options", label: "Options", icon: import_lucide_react3.Settings2 },
  { id: "preview", label: "Preview", icon: import_lucide_react3.Eye }
];
function SpreadsheetSearch({ onSelect, selectedId, apiProxy }) {
  const [query, setQuery] = (0, import_react12.useState)("");
  const [results, setResults] = (0, import_react12.useState)([]);
  const [loading, setLoading] = (0, import_react12.useState)(false);
  const [nextPageToken, setNextPageToken] = (0, import_react12.useState)(null);
  const [searched, setSearched] = (0, import_react12.useState)(false);
  const debounceRef = (0, import_react12.useRef)(null);
  const doSearch = (0, import_react12.useCallback)(async (searchQuery, pageToken) => {
    setLoading(true);
    try {
      const res = await apiProxy.post("listSpreadsheets", {
        query: searchQuery,
        pageToken,
        pageSize: 10
      });
      if (pageToken) {
        setResults((prev) => [...prev, ...res.spreadsheets || []]);
      } else {
        setResults(res.spreadsheets || []);
      }
      setNextPageToken(res.nextPageToken || null);
      setSearched(true);
    } catch (err) {
      console.error("listSpreadsheets failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [apiProxy]);
  (0, import_react12.useEffect)(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query, null);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);
  return /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "relative flex-1 flex items-center" }, /* @__PURE__ */ import_react12.default.createElement(import_lucide_react3.Search, { className: "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Input,
    {
      type: "text",
      className: "pl-8",
      placeholder: "Search spreadsheets...",
      value: query,
      onChange: (e) => setQuery(e.target.value)
    }
  ), loading && /* @__PURE__ */ import_react12.default.createElement("div", { className: "absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" }, /* @__PURE__ */ import_react12.default.createElement(import_lucide_react3.Loader2, { className: "h-3.5 w-3.5 text-muted-foreground animate-spin" }))), /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Button,
    {
      type: "button",
      variant: "outline",
      size: "icon",
      className: "h-8 w-8",
      onClick: () => doSearch(query, null),
      title: "Refresh list"
    },
    /* @__PURE__ */ import_react12.default.createElement(import_lucide_react3.RefreshCw, { className: "h-4 w-4 text-muted-foreground hover:text-foreground" })
  )), results.length === 0 && !loading && searched ? /* @__PURE__ */ import_react12.default.createElement("div", { className: "p-6 text-center text-sm text-muted-foreground" }, "No spreadsheets found") : results?.length > 0 && /* @__PURE__ */ import_react12.default.createElement("div", { className: "max-h-[240px] overflow-y-auto rounded border border-border" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex flex-col" }, results.map((ss) => /* @__PURE__ */ import_react12.default.createElement(
    "button",
    {
      key: ss.id,
      type: "button",
      onClick: () => onSelect(ss),
      className: `w-full flex items-center gap-3 px-3 py-2 text-left transition-colors border-l-2 border-t border-t-border first:border-t-0 ${selectedId === ss.id ? "bg-primary/10 text-primary border-l-primary" : "hover:bg-muted/30 border-l-transparent text-muted-foreground"}`
    },
    /* @__PURE__ */ import_react12.default.createElement(import_lucide_react3.FileSpreadsheet, { className: `h-4 w-4 shrink-0 ${selectedId === ss.id ? "text-primary" : "text-muted-foreground"}` }),
    /* @__PURE__ */ import_react12.default.createElement("div", { className: "min-w-0 flex-1" }, /* @__PURE__ */ import_react12.default.createElement("p", { className: "text-xs font-medium text-foreground truncate" }, ss.name), /* @__PURE__ */ import_react12.default.createElement("p", { className: "text-[10px] text-muted-foreground truncate" }, ss.owner && `${ss.owner} \xB7 `, ss.modifiedTime && new Date(ss.modifiedTime).toLocaleDateString())),
    ss.webViewLink && /* @__PURE__ */ import_react12.default.createElement(
      "a",
      {
        href: ss.webViewLink,
        target: "_blank",
        rel: "noopener noreferrer",
        onClick: (e) => e.stopPropagation(),
        className: "text-muted-foreground hover:text-foreground"
      },
      /* @__PURE__ */ import_react12.default.createElement(import_lucide_react3.ExternalLink, { className: "h-3.5 w-3.5" })
    )
  )))), nextPageToken && !loading && /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Button,
    {
      type: "button",
      onClick: () => doSearch(query, nextPageToken),
      variant: "ghost",
      size: "sm",
      className: "w-full py-1 text-xs"
    },
    "Load more..."
  ));
}
function SheetSelector({ spreadsheetId, selectedSheet, onSelect, apiProxy }) {
  const [sheets, setSheets] = (0, import_react12.useState)([]);
  const [loading, setLoading] = (0, import_react12.useState)(false);
  const [spreadsheetTitle, setSpreadsheetTitle] = (0, import_react12.useState)("");
  (0, import_react12.useEffect)(() => {
    if (!spreadsheetId) return;
    let cancelled = false;
    setLoading(true);
    apiProxy.post("listSheets", { spreadsheetId }).then((res) => {
      if (cancelled) return;
      setSheets(res.sheets || []);
      setSpreadsheetTitle(res.title || "");
      if (!selectedSheet && res.sheets?.length > 0) {
        onSelect(res.sheets[0].title);
      }
    }).catch((err) => {
      console.error("listSheets failed:", err);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [spreadsheetId, apiProxy]);
  if (!spreadsheetId) return null;
  if (loading) {
    return /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex items-center gap-2 text-xs text-muted-foreground p-2" }, /* @__PURE__ */ import_react12.default.createElement(import_lucide_react3.Loader2, { className: "h-3.5 w-3.5 animate-spin" }), "Loading sheets...");
  }
  return /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, spreadsheetTitle && /* @__PURE__ */ import_react12.default.createElement("p", { className: "text-[10px] font-semibold uppercase tracking-widest text-muted-foreground" }, "Sheets in ", spreadsheetTitle), /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex flex-wrap gap-1.5" }, sheets.map((sheet) => /* @__PURE__ */ import_react12.default.createElement(
    "button",
    {
      key: sheet.sheetId,
      type: "button",
      onClick: () => onSelect(sheet.title),
      className: `inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-colors ${selectedSheet === sheet.title ? "bg-primary/10 text-primary border-primary shadow-sm" : "bg-background text-muted-foreground border-border hover:bg-muted/50"}`
    },
    /* @__PURE__ */ import_react12.default.createElement(import_lucide_react3.Table2, { className: "h-3 w-3" }),
    sheet.title
  ))));
}
function DataPreview({ spreadsheetId, sheetName, apiProxy }) {
  const [preview, setPreview] = (0, import_react12.useState)(null);
  const [loading, setLoading] = (0, import_react12.useState)(false);
  const fetchPreview = (0, import_react12.useCallback)(async () => {
    if (!spreadsheetId || !sheetName) return;
    setLoading(true);
    try {
      const res = await apiProxy.post("previewData", {
        spreadsheetId,
        sheetName,
        limit: 5
      });
      setPreview(res);
    } catch (err) {
      console.error("previewData failed:", err);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [spreadsheetId, sheetName, apiProxy]);
  (0, import_react12.useEffect)(() => {
    fetchPreview();
  }, [fetchPreview]);
  if (!spreadsheetId || !sheetName) {
    return /* @__PURE__ */ import_react12.default.createElement(
      import_ui8.EmptyState,
      {
        icon: import_lucide_react3.Eye,
        message: "Select a spreadsheet and sheet to preview data."
      }
    );
  }
  if (loading) {
    return /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground" }, /* @__PURE__ */ import_react12.default.createElement(import_lucide_react3.Loader2, { className: "h-4 w-4 animate-spin" }), "Loading preview...");
  }
  if (!preview || preview.headers.length === 0) {
    return /* @__PURE__ */ import_react12.default.createElement(import_ui8.EmptyState, { icon: import_lucide_react3.Table2, message: "No data found in the selected range." });
  }
  return /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react12.default.createElement("p", { className: "text-[11px] text-muted-foreground" }, "Showing ", preview.rows.length, " of ", preview.totalRows, " rows"), /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Button,
    {
      type: "button",
      onClick: fetchPreview,
      variant: "link",
      size: "sm",
      className: "h-auto p-0 text-[11px] font-normal"
    },
    "Refresh"
  )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "overflow-x-auto rounded border border-border" }, /* @__PURE__ */ import_react12.default.createElement("table", { className: "w-full text-xs" }, /* @__PURE__ */ import_react12.default.createElement("thead", null, /* @__PURE__ */ import_react12.default.createElement("tr", { className: "bg-muted/50" }, preview.headers.map((h, i) => /* @__PURE__ */ import_react12.default.createElement("th", { key: i, className: "px-3 py-1.5 text-left font-semibold text-foreground whitespace-nowrap border-b border-border" }, h)))), /* @__PURE__ */ import_react12.default.createElement("tbody", null, preview.rows.map((row, ri) => /* @__PURE__ */ import_react12.default.createElement("tr", { key: ri, className: "border-b border-border last:border-0 hover:bg-muted/20" }, preview.headers.map((_, ci) => /* @__PURE__ */ import_react12.default.createElement("td", { key: ci, className: "px-3 py-1.5 text-foreground whitespace-nowrap max-w-[200px] truncate" }, row[ci] ?? ""))))))));
}
var GoogleSheetsQueryEditor = ({ queryEditorForm }) => {
  const { apiProxy } = useQueryEditorContext();
  const opts = queryEditorForm.dataQueryOptions || {};
  const [activeTab, setActiveTab] = (0, import_react12.useState)("source");
  const patch = (0, import_react12.useCallback)((updates) => {
    queryEditorForm.patchQueryOptions(updates);
  }, [queryEditorForm]);
  const operation = opts.operation || "read";
  const spreadsheetId = opts.spreadsheetId || "";
  const sheetName = opts.sheetName || "";
  (0, import_react12.useEffect)(() => {
    if (!opts.operation) {
      patch({ operation: "read" });
    }
  }, [opts.operation, patch]);
  const badges = {
    source: spreadsheetId ? 1 : 0
  };
  return /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-0" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "pb-2" }, /* @__PURE__ */ import_react12.default.createElement(import_ui8.Label, { className: "mb-2 block" }, "Operation"), /* @__PURE__ */ import_react12.default.createElement("div", { className: "grid grid-cols-3 gap-1.5" }, OPERATIONS.map((op) => {
    const Icon = op.icon;
    const isSelected = operation === op.id;
    return /* @__PURE__ */ import_react12.default.createElement(
      "button",
      {
        key: op.id,
        type: "button",
        onClick: () => patch({ operation: op.id }),
        className: `flex items-center gap-2 p-2.5 rounded border text-left transition-all ${isSelected ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-border bg-background text-muted-foreground hover:bg-muted/30"}`
      },
      /* @__PURE__ */ import_react12.default.createElement(Icon, { className: "h-3.5 w-3.5 shrink-0" }),
      /* @__PURE__ */ import_react12.default.createElement("span", { className: "text-xs font-medium" }, op.label)
    );
  }))), /* @__PURE__ */ import_react12.default.createElement(import_ui8.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full" }, /* @__PURE__ */ import_react12.default.createElement(import_ui8.TabsList, null, TABS2.map((tab) => {
    const Icon = tab.icon;
    const badgeCount = badges[tab.id];
    return /* @__PURE__ */ import_react12.default.createElement(import_ui8.TabsTrigger, { key: tab.id, value: tab.id, className: "gap-1.5 px-3 py-2 text-xs" }, Icon && /* @__PURE__ */ import_react12.default.createElement(Icon, { className: "h-3.5 w-3.5" }), tab.label, badgeCount > 0 && /* @__PURE__ */ import_react12.default.createElement("span", { className: "ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold" }, badgeCount));
  })), /* @__PURE__ */ import_react12.default.createElement(import_ui8.TabsContent, { value: "source", className: "mt-2 pb-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui8.Label, null, "Spreadsheet ID"), /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Input,
    {
      type: "text",
      className: "font-mono text-xs",
      placeholder: "Enter spreadsheet ID or search below...",
      value: spreadsheetId,
      onChange: (e) => patch({ spreadsheetId: e.target.value })
    }
  )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui8.Label, null, "Or search your spreadsheets"), /* @__PURE__ */ import_react12.default.createElement(
    SpreadsheetSearch,
    {
      apiProxy,
      selectedId: spreadsheetId,
      onSelect: (ss) => patch({ spreadsheetId: ss.id })
    }
  )), spreadsheetId && /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1 pt-2 border-t border-border" }, /* @__PURE__ */ import_react12.default.createElement(import_ui8.Label, null, "Sheet / Tab"), /* @__PURE__ */ import_react12.default.createElement(
    SheetSelector,
    {
      spreadsheetId,
      selectedSheet: sheetName,
      onSelect: (name) => patch({ sheetName: name }),
      apiProxy
    }
  )), spreadsheetId && (operation === "read" || operation === "write" || operation === "append" || operation === "update" || operation === "clear") && /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui8.Label, null, "Range (A1 notation)"), /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Input,
    {
      type: "text",
      className: "font-mono text-xs",
      placeholder: "A1:Z1000",
      value: opts.range || "",
      onChange: (e) => patch({ range: e.target.value })
    }
  )))), /* @__PURE__ */ import_react12.default.createElement(import_ui8.TabsContent, { value: "options", className: "pb-2" }, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-2" }, operation === "read" && /* @__PURE__ */ import_react12.default.createElement(import_react12.default.Fragment, null, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui8.Label, null, "Major Dimension"), /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Select,
    {
      value: opts.majorDimension || "ROWS",
      onValueChange: (val) => patch({ majorDimension: val })
    },
    /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectTrigger, null, /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectValue, null)),
    /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectContent, null, /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectItem, { value: "ROWS" }, "Rows"), /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectItem, { value: "COLUMNS" }, "Columns"))
  )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Checkbox,
    {
      id: "gs-includeHeaders",
      checked: opts.includeHeaders !== false,
      onCheckedChange: (checked) => patch({ includeHeaders: checked })
    }
  ), /* @__PURE__ */ import_react12.default.createElement(import_ui8.Label, { htmlFor: "gs-includeHeaders", className: "cursor-pointer text-xs text-foreground font-normal" }, "Treat first row as headers"))), (operation === "write" || operation === "update" || operation === "append") && /* @__PURE__ */ import_react12.default.createElement(import_react12.default.Fragment, null, /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui8.Label, null, "Data (JSON array of arrays)"), /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Textarea,
    {
      className: "min-h-[120px] font-mono text-xs",
      placeholder: '[["Header1", "Header2"], ["Value1", "Value2"]]',
      value: opts.data || "",
      onChange: (e) => patch({ data: e.target.value })
    }
  )), /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui8.Label, null, "Value Input Option"), /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Select,
    {
      value: opts.valueInputOption || "USER_ENTERED",
      onValueChange: (val) => patch({ valueInputOption: val })
    },
    /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectTrigger, null, /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectValue, null)),
    /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectContent, null, /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectItem, { value: "USER_ENTERED" }, "User Entered"), /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectItem, { value: "RAW" }, "Raw"))
  ))), operation === "append" && /* @__PURE__ */ import_react12.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react12.default.createElement(import_ui8.Label, null, "Insert Data Option"), /* @__PURE__ */ import_react12.default.createElement(
    import_ui8.Select,
    {
      value: opts.insertDataOption || "INSERT_ROWS",
      onValueChange: (val) => patch({ insertDataOption: val })
    },
    /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectTrigger, null, /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectValue, null)),
    /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectContent, null, /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectItem, { value: "INSERT_ROWS" }, "Insert Rows"), /* @__PURE__ */ import_react12.default.createElement(import_ui8.SelectItem, { value: "OVERWRITE" }, "Overwrite"))
  )), operation === "getSpreadsheetInfo" && /* @__PURE__ */ import_react12.default.createElement(import_ui8.Callout, null, "This operation returns spreadsheet metadata including sheet names, row/column counts, and locale. No additional options required."), operation === "clear" && /* @__PURE__ */ import_react12.default.createElement(import_ui8.Callout, null, "This will clear all data in the specified range. The range is configured in the Source tab."))), /* @__PURE__ */ import_react12.default.createElement(import_ui8.TabsContent, { value: "preview", className: "pb-2" }, /* @__PURE__ */ import_react12.default.createElement(
    DataPreview,
    {
      spreadsheetId,
      sheetName,
      apiProxy
    }
  ))));
};

// src/components/postgres/PostgresQueryEditor.jsx
var import_react13 = __toESM(require("react"));
var import_ui9 = require("@jet-admin/ui");
var import_lucide_react4 = require("lucide-react");
var AGG_FUNCTIONS = [
  "NONE",
  "COUNT",
  "COUNT DISTINCT",
  "SUM",
  "AVG",
  "MIN",
  "MAX",
  "ARRAY_AGG",
  "STRING_AGG"
];
var JOIN_TYPES = ["INNER", "LEFT", "RIGHT", "FULL", "CROSS"];
var JOIN_OPERATORS = ["=", "<>", "<", "<=", ">", ">="];
var WHERE_OPERATORS = [
  "=",
  "<>",
  "<",
  "<=",
  ">",
  ">=",
  "LIKE",
  "NOT LIKE",
  "ILIKE",
  "NOT ILIKE",
  "IN",
  "NOT IN",
  "BETWEEN",
  "IS NULL",
  "IS NOT NULL",
  "IS DISTINCT FROM",
  "IS NOT DISTINCT FROM"
];
var NO_VALUE_OPERATORS = /* @__PURE__ */ new Set(["IS NULL", "IS NOT NULL"]);
var LIST_OPERATORS = /* @__PURE__ */ new Set(["IN", "NOT IN"]);
var SORT_DIRECTIONS2 = [
  { value: "ASC", label: "ASC (Ascending)" },
  { value: "DESC", label: "DESC (Descending)" }
];
var NULLS_ORDER = [
  { value: "DEFAULT", label: "\u2014 default \u2014" },
  { value: "NULLS FIRST", label: "NULLS FIRST" },
  { value: "NULLS LAST", label: "NULLS LAST" }
];
var TABS3 = [
  { id: "select", label: "Select", icon: import_lucide_react4.Layers },
  { id: "from", label: "From / Join", icon: import_lucide_react4.GitBranch },
  { id: "where", label: "Where", icon: import_lucide_react4.Filter },
  { id: "groupBy", label: "Group By", icon: import_lucide_react4.Database },
  { id: "orderBy", label: "Order By", icon: import_lucide_react4.ArrowUpDown },
  { id: "settings", label: "Settings", icon: import_lucide_react4.SlidersHorizontal }
];
var genId2 = () => `_${Math.random().toString(36).slice(2, 9)}`;
function newColumn() {
  return { id: genId2(), expression: "", alias: "", aggFn: "NONE" };
}
function newJoinCondition() {
  return { id: genId2(), left: "", operator: "=", right: "" };
}
function newJoin() {
  return {
    id: genId2(),
    type: "INNER",
    table: "",
    alias: "",
    conditions: [newJoinCondition()]
  };
}
function newWhereCondition() {
  return {
    id: genId2(),
    column: "",
    operator: "=",
    value: "",
    valueType: "literal",
    logic: "AND"
  };
}
function newGroupByItem() {
  return { id: genId2(), expression: "" };
}
function newOrderByItem() {
  return { id: genId2(), expression: "", direction: "ASC", nulls: "DEFAULT" };
}
function normalise2(opts = {}) {
  return {
    // mode — "query" = raw SQL code editor, "gui" = visual builder
    queryType: opts.queryType ?? "query",
    query: opts.query ?? "",
    // visual builder state
    distinct: opts.distinct ?? false,
    columns: Array.isArray(opts.columns) ? opts.columns : [],
    schema: opts.schema ?? "",
    table: opts.table ?? "",
    tableAlias: opts.tableAlias ?? "",
    joins: Array.isArray(opts.joins) ? opts.joins : [],
    where: Array.isArray(opts.where) ? opts.where : [],
    groupBy: Array.isArray(opts.groupBy) ? opts.groupBy : [],
    having: Array.isArray(opts.having) ? opts.having : [],
    orderBy: Array.isArray(opts.orderBy) ? opts.orderBy : [],
    limit: opts.limit ?? "",
    offset: opts.offset ?? ""
  };
}
function quoteLiteral(raw) {
  if (raw === void 0 || raw === null || raw === "") return "''";
  const s = String(raw).trim();
  if (/^-?\d+(\.\d+)?$/.test(s)) return s;
  if (/^(true|false|null)$/i.test(s)) return s.toUpperCase();
  return `'${s.replace(/'/g, "''")}'`;
}
function renderWhereCondition(cond) {
  const col = cond.column || "?";
  if (NO_VALUE_OPERATORS.has(cond.operator)) return `${col} ${cond.operator}`;
  if (cond.operator === "BETWEEN") {
    const [a, b] = (cond.value || "").split(",").map((s) => s.trim());
    const fmt = (v) => cond.valueType === "column" ? v || "?" : quoteLiteral(v);
    return `${col} BETWEEN ${fmt(a)} AND ${fmt(b)}`;
  }
  if (LIST_OPERATORS.has(cond.operator)) {
    const vals = (cond.value || "").split(",").map((s) => s.trim()).filter(Boolean);
    const formatted = vals.length ? vals.map((v) => cond.valueType === "column" ? v : quoteLiteral(v)).join(", ") : "?";
    return `${col} ${cond.operator} (${formatted})`;
  }
  const val = cond.valueType === "column" ? cond.value || "?" : quoteLiteral(cond.value);
  return `${col} ${cond.operator} ${val}`;
}
function renderConditionGroup(conditions) {
  if (!conditions.length) return "";
  const parts = [];
  conditions.forEach((cond, idx) => {
    if (!cond.column) return;
    const rendered = renderWhereCondition(cond);
    if (idx === 0) {
      parts.push(rendered);
    } else {
      parts.push(`${cond.logic} ${rendered}`);
    }
  });
  return parts.join("\n  ");
}
function buildSQL(opts) {
  const lines = [];
  const cols = (opts.columns || []).filter((c) => c.expression);
  const selectList = cols.length ? cols.map((c) => {
    const base = c.aggFn === "NONE" ? c.expression : c.aggFn === "COUNT DISTINCT" ? `COUNT(DISTINCT ${c.expression})` : c.aggFn === "STRING_AGG" ? `STRING_AGG(${c.expression}, ', ')` : `${c.aggFn}(${c.expression})`;
    return c.alias ? `${base} AS ${c.alias}` : base;
  }).join(",\n  ") : "*";
  lines.push(`SELECT${opts.distinct ? " DISTINCT" : ""}
  ${selectList}`);
  const fromTable = opts.schema ? `${opts.schema}.${opts.table || "?table"}` : opts.table || "?table";
  const fromClause = opts.tableAlias ? `${fromTable} AS ${opts.tableAlias}` : fromTable;
  lines.push(`FROM ${fromClause}`);
  (opts.joins || []).forEach((join) => {
    if (!join.table) return;
    const joinTable = join.alias ? `${join.table} AS ${join.alias}` : join.table;
    if (join.type === "CROSS") {
      lines.push(`CROSS JOIN ${joinTable}`);
      return;
    }
    const conds = (join.conditions || []).filter((c) => c.left && c.right).map((c) => `${c.left} ${c.operator} ${c.right}`).join("\n    AND ");
    lines.push(`${join.type} JOIN ${joinTable}${conds ? `
  ON ${conds}` : ""}`);
  });
  const whereBody = renderConditionGroup(opts.where || []);
  if (whereBody) lines.push(`WHERE
  ${whereBody}`);
  const gbItems = (opts.groupBy || []).filter((g) => g.expression).map((g) => g.expression);
  if (gbItems.length) lines.push(`GROUP BY ${gbItems.join(", ")}`);
  const havingBody = renderConditionGroup(opts.having || []);
  if (havingBody && gbItems.length) lines.push(`HAVING
  ${havingBody}`);
  const obItems = (opts.orderBy || []).filter((o) => o.expression).map(
    (o) => `${o.expression} ${o.direction}${o.nulls !== "DEFAULT" ? ` ${o.nulls}` : ""}`
  );
  if (obItems.length) lines.push(`ORDER BY ${obItems.join(", ")}`);
  if (opts.limit !== "" && opts.limit !== null && opts.limit !== void 0)
    lines.push(`LIMIT ${opts.limit}`);
  if (opts.offset !== "" && opts.offset !== null && opts.offset !== void 0)
    lines.push(`OFFSET ${opts.offset}`);
  return lines.join("\n") + ";";
}
function SelectTab({ opts, update }) {
  const columns = opts.columns;
  const addColumn = () => update({ columns: [...columns, newColumn()] });
  const removeColumn = (id) => update({ columns: columns.filter((c) => c.id !== id) });
  const patchColumn = (id, patch) => update({ columns: columns.map((c) => c.id === id ? { ...c, ...patch } : c) });
  const moveColumn = (index, dir) => {
    const next = [...columns];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ columns: next });
  };
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Callout, null, "Define which columns to return. Leave empty to select", " ", /* @__PURE__ */ import_react13.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono text-[11px]" }, "*"), ". Use an aggregate function to summarise grouped data."), /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex items-center gap-2 rounded border border-border bg-background px-3 py-2" }, /* @__PURE__ */ import_react13.default.createElement(
    "input",
    {
      id: "pg-distinct",
      type: "checkbox",
      checked: opts.distinct,
      onChange: (e) => update({ distinct: e.target.checked }),
      className: "h-3.5 w-3.5 rounded-sm accent-primary"
    }
  ), /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { htmlFor: "pg-distinct", className: "cursor-pointer text-xs font-mono font-medium" }, "DISTINCT"), /* @__PURE__ */ import_react13.default.createElement("span", { className: "text-[11px] text-muted-foreground" }, "\u2014 eliminate duplicate rows from the result set")), columns.length === 0 ? /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.EmptyState,
    {
      icon: import_lucide_react4.Layers,
      message: "No columns added \u2014 query will SELECT *.",
      action: /* @__PURE__ */ import_react13.default.createElement(import_ui9.Button, { type: "button", variant: "outline", size: "sm", onClick: addColumn }, /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Column")
    }
  ) : /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "grid grid-cols-[28px_28px_140px_1fr_100px_28px_28px] gap-2 items-center px-1" }, /* @__PURE__ */ import_react13.default.createElement("span", null), /* @__PURE__ */ import_react13.default.createElement("span", null), /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Aggregate"), /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Column / Expression"), /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Alias"), /* @__PURE__ */ import_react13.default.createElement("span", null), /* @__PURE__ */ import_react13.default.createElement("span", null)), columns.map((col, idx) => /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      key: col.id,
      className: "grid grid-cols-[28px_28px_140px_1fr_100px_28px_28px] gap-2 items-center rounded border border-border bg-background px-2 py-2"
    },
    /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex flex-col gap-0.5" }, /* @__PURE__ */ import_react13.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveColumn(idx, -1),
        disabled: idx === 0,
        className: "flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.MoveUp, { className: "h-3 w-3" })
    ), /* @__PURE__ */ import_react13.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveColumn(idx, 1),
        disabled: idx === columns.length - 1,
        className: "flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.MoveDown, { className: "h-3 w-3" })
    )),
    /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.GripVertical, { className: "h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" }),
    /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Select,
      {
        value: col.aggFn,
        onValueChange: (val) => patchColumn(col.id, { aggFn: val })
      },
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectTrigger, { className: "h-7 text-xs font-mono" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectValue, null)),
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectContent, null, AGG_FUNCTIONS.map((fn) => /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectItem, { key: fn, value: fn, className: "text-xs font-mono" }, fn === "NONE" ? "\u2014 none \u2014" : fn)))
    ),
    /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Input,
      {
        placeholder: "column or expression",
        value: col.expression,
        onChange: (e) => patchColumn(col.id, { expression: e.target.value }),
        className: "h-7 text-xs font-mono"
      }
    ),
    /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Input,
      {
        placeholder: "alias",
        value: col.alias,
        onChange: (e) => patchColumn(col.id, { alias: e.target.value }),
        className: "h-7 text-xs font-mono"
      }
    ),
    /* @__PURE__ */ import_react13.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeColumn(col.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Trash2, { className: "h-3.5 w-3.5" })
    ),
    /* @__PURE__ */ import_react13.default.createElement("span", null)
  )), /* @__PURE__ */ import_react13.default.createElement(import_ui9.Button, { type: "button", variant: "outline", size: "sm", onClick: addColumn, className: "w-full" }, /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Column")));
}
function JoinConditionRow({ cond, onChange, onRemove, canRemove }) {
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Input,
    {
      placeholder: "left.column",
      value: cond.left,
      onChange: (e) => onChange({ ...cond, left: e.target.value }),
      className: "flex-1 h-7 text-xs font-mono"
    }
  ), /* @__PURE__ */ import_react13.default.createElement("div", { className: "w-20 shrink-0" }, /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Select,
    {
      value: cond.operator,
      onValueChange: (val) => onChange({ ...cond, operator: val })
    },
    /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectValue, null)),
    /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectContent, null, JOIN_OPERATORS.map((op) => /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectItem, { key: op, value: op, className: "text-xs font-mono" }, op)))
  )), /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Input,
    {
      placeholder: "right.column",
      value: cond.right,
      onChange: (e) => onChange({ ...cond, right: e.target.value }),
      className: "flex-1 h-7 text-xs font-mono"
    }
  ), canRemove && /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      type: "button",
      onClick: onRemove,
      className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
    },
    /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Trash2, { className: "h-3.5 w-3.5" })
  ));
}
function FromJoinTab({ opts, update }) {
  const joins = opts.joins;
  const patchJoin = (id, patch) => update({ joins: joins.map((j) => j.id === id ? { ...j, ...patch } : j) });
  const removeJoin = (id) => update({ joins: joins.filter((j) => j.id !== id) });
  const addJoin = () => update({ joins: [...joins, newJoin()] });
  const updateJoinCond = (joinId, condId, patch) => {
    patchJoin(joinId, {
      conditions: joins.find((j) => j.id === joinId).conditions.map((c) => c.id === condId ? { ...c, ...patch } : c)
    });
  };
  const removeJoinCond = (joinId, condId) => {
    patchJoin(joinId, {
      conditions: joins.find((j) => j.id === joinId).conditions.filter((c) => c.id !== condId)
    });
  };
  const addJoinCond = (joinId) => {
    const join = joins.find((j) => j.id === joinId);
    patchJoin(joinId, { conditions: [...join.conditions, newJoinCondition()] });
  };
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Callout, null, "Set the base table for the query and optionally join additional tables. Use the schema field to qualify the table (e.g.", " ", /* @__PURE__ */ import_react13.default.createElement("code", { className: "bg-background px-0.5 rounded border border-border font-mono text-[11px]" }, "public"), ")."), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Base Table (FROM)"), /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Input,
    {
      placeholder: "schema (e.g. public)",
      value: opts.schema,
      onChange: (e) => update({ schema: e.target.value }),
      className: "w-40 h-7 text-xs font-mono"
    }
  ), /* @__PURE__ */ import_react13.default.createElement("span", { className: "text-muted-foreground text-xs shrink-0" }, "."), /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Input,
    {
      placeholder: "table_name",
      value: opts.table,
      onChange: (e) => update({ table: e.target.value }),
      className: "flex-1 h-7 text-xs font-mono"
    }
  ), /* @__PURE__ */ import_react13.default.createElement("span", { className: "text-[11px] text-muted-foreground shrink-0" }, "AS"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Input,
    {
      placeholder: "alias",
      value: opts.tableAlias,
      onChange: (e) => update({ tableAlias: e.target.value }),
      className: "w-28 h-7 text-xs font-mono"
    }
  ))), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Joins"), joins.length === 0 ? /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.EmptyState,
    {
      icon: import_lucide_react4.GitBranch,
      message: "No joins added.",
      action: /* @__PURE__ */ import_react13.default.createElement(import_ui9.Button, { type: "button", variant: "outline", size: "sm", onClick: addJoin }, /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Join")
    }
  ) : /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, joins.map((join) => /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      key: join.id,
      className: "rounded border border-border bg-muted/20 p-3 space-y-2"
    },
    /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "w-28 shrink-0" }, /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Select,
      {
        value: join.type,
        onValueChange: (val) => patchJoin(join.id, { type: val })
      },
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectTrigger, { className: "h-7 text-xs font-mono" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectValue, null)),
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectContent, null, JOIN_TYPES.map((t) => /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectItem, { key: t, value: t, className: "text-xs font-mono" }, t)))
    )), /* @__PURE__ */ import_react13.default.createElement("span", { className: "text-xs text-muted-foreground shrink-0 font-mono" }, "JOIN"), /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Input,
      {
        placeholder: "joined_table",
        value: join.table,
        onChange: (e) => patchJoin(join.id, { table: e.target.value }),
        className: "flex-1 h-7 text-xs font-mono"
      }
    ), /* @__PURE__ */ import_react13.default.createElement("span", { className: "text-[11px] text-muted-foreground shrink-0" }, "AS"), /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Input,
      {
        placeholder: "alias",
        value: join.alias,
        onChange: (e) => patchJoin(join.id, { alias: e.target.value }),
        className: "w-24 h-7 text-xs font-mono"
      }
    ), /* @__PURE__ */ import_react13.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeJoin(join.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Trash2, { className: "h-3.5 w-3.5" })
    )),
    join.type !== "CROSS" && /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1 border-l border-border/60 pl-3" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "ON"), join.conditions.map((cond) => /* @__PURE__ */ import_react13.default.createElement(
      JoinConditionRow,
      {
        key: cond.id,
        cond,
        onChange: (patch) => updateJoinCond(join.id, cond.id, patch),
        onRemove: () => removeJoinCond(join.id, cond.id),
        canRemove: join.conditions.length > 1
      }
    )), /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Button,
      {
        type: "button",
        variant: "ghost",
        size: "sm",
        onClick: () => addJoinCond(join.id),
        className: "text-[11px] h-7"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3 w-3 mr-1" }),
      "Add condition"
    ))
  )), /* @__PURE__ */ import_react13.default.createElement(import_ui9.Button, { type: "button", variant: "outline", size: "sm", onClick: addJoin, className: "w-full" }, /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Join"))));
}
function ConditionList({ conditions, onChange, clauseLabel = "WHERE" }) {
  const addCondition = () => onChange([...conditions, newWhereCondition()]);
  const removeCondition = (id) => onChange(conditions.filter((c) => c.id !== id));
  const patchCondition = (id, patch) => onChange(conditions.map((c) => c.id === id ? { ...c, ...patch } : c));
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, conditions.length === 0 ? /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.EmptyState,
    {
      icon: import_lucide_react4.Filter,
      message: `No ${clauseLabel} conditions \u2014 all rows will be included.`,
      action: /* @__PURE__ */ import_react13.default.createElement(import_ui9.Button, { type: "button", variant: "outline", size: "sm", onClick: addCondition }, /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Condition")
    }
  ) : /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, conditions.map((cond, idx) => {
    const needsValue = !NO_VALUE_OPERATORS.has(cond.operator);
    const isList = LIST_OPERATORS.has(cond.operator);
    const isBetween = cond.operator === "BETWEEN";
    return /* @__PURE__ */ import_react13.default.createElement("div", { key: cond.id, className: "space-y-1" }, idx > 0 && /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex items-center gap-2 py-0.5 pl-1" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "h-px flex-1 bg-border" }), /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.LogicChip,
      {
        value: cond.logic,
        onChange: (val) => patchCondition(cond.id, { logic: val })
      }
    ), /* @__PURE__ */ import_react13.default.createElement("div", { className: "h-px flex-1 bg-border" })), /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex items-center gap-2 rounded border border-border bg-background px-3 py-2" }, /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Input,
      {
        placeholder: "column",
        value: cond.column,
        onChange: (e) => patchCondition(cond.id, { column: e.target.value }),
        className: "h-7 text-xs font-mono flex-[2]"
      }
    ), /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex-[2] min-w-[120px]" }, /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Select,
      {
        value: cond.operator,
        onValueChange: (val) => patchCondition(cond.id, { operator: val })
      },
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectTrigger, { className: "h-7 text-xs font-mono" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectValue, null)),
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectContent, null, WHERE_OPERATORS.map((op) => /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectItem, { key: op, value: op, className: "text-xs font-mono" }, op)))
    )), needsValue && /* @__PURE__ */ import_react13.default.createElement("div", { className: "w-24 shrink-0" }, /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Select,
      {
        value: cond.valueType,
        onValueChange: (val) => patchCondition(cond.id, { valueType: val })
      },
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectValue, null)),
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectContent, null, /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectItem, { value: "literal", className: "text-xs" }, "Value"), /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectItem, { value: "column", className: "text-xs" }, "Column"))
    )), needsValue ? /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Input,
      {
        placeholder: isList ? "a, b, c" : isBetween ? "low, high" : "value or {{inputs.param}}",
        value: cond.value,
        onChange: (e) => patchCondition(cond.id, { value: e.target.value }),
        className: "h-7 text-xs font-mono flex-[3]"
      }
    ) : /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex-[3]" }), /* @__PURE__ */ import_react13.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeCondition(cond.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Trash2, { className: "h-3.5 w-3.5" })
    )));
  }), /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      onClick: addCondition,
      className: "w-full"
    },
    /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3.5 w-3.5 mr-1" }),
    "Add Condition"
  )), conditions.length > 0 && /* @__PURE__ */ import_react13.default.createElement("div", { className: "rounded border border-border bg-muted/30 p-3 space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Dynamic values"), /* @__PURE__ */ import_react13.default.createElement("p", { className: "text-[11px] text-muted-foreground mt-1" }, "Use", " ", /* @__PURE__ */ import_react13.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono" }, "{{inputs.paramName}}"), " ", "in Value fields to inject runtime inputs from the query engine.")));
}
function WhereTab({ opts, update }) {
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Callout, null, "Filter rows ", /* @__PURE__ */ import_react13.default.createElement("strong", null, "before"), " grouping. Conditions are applied in order; use the AND / OR chip to control how they combine."), /* @__PURE__ */ import_react13.default.createElement(
    ConditionList,
    {
      conditions: opts.where,
      onChange: (where) => update({ where }),
      clauseLabel: "WHERE"
    }
  ));
}
function GroupByTab({ opts, update }) {
  const groupBy = opts.groupBy;
  const having = opts.having;
  const addGroupBy = () => update({ groupBy: [...groupBy, newGroupByItem()] });
  const removeGroupBy = (id) => update({ groupBy: groupBy.filter((g) => g.id !== id) });
  const patchGroupBy = (id, expression) => update({ groupBy: groupBy.map((g) => g.id === id ? { ...g, expression } : g) });
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Callout, null, "Group rows sharing the same values in the listed columns. Combine with aggregate functions (SUM, COUNT, etc.) in the Select tab."), groupBy.length === 0 ? /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.EmptyState,
    {
      icon: import_lucide_react4.Database,
      message: "No GROUP BY \u2014 results will not be aggregated.",
      action: /* @__PURE__ */ import_react13.default.createElement(import_ui9.Button, { type: "button", variant: "outline", size: "sm", onClick: addGroupBy }, /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Group")
    }
  ) : /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, groupBy.map((item) => /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      key: item.id,
      className: "flex items-center gap-2 rounded border border-border bg-background px-3 py-2"
    },
    /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Input,
      {
        placeholder: "column or expression",
        value: item.expression,
        onChange: (e) => patchGroupBy(item.id, e.target.value),
        className: "h-7 text-xs font-mono flex-1"
      }
    ),
    /* @__PURE__ */ import_react13.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeGroupBy(item.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors shrink-0"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Trash2, { className: "h-3.5 w-3.5" })
    )
  )), /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Button,
    {
      type: "button",
      variant: "outline",
      size: "sm",
      onClick: addGroupBy,
      className: "w-full"
    },
    /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3.5 w-3.5 mr-1" }),
    "Add Group"
  ))), groupBy.length > 0 && /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2 border-t border-border pt-4" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Having (filter on aggregates)"), /* @__PURE__ */ import_react13.default.createElement(
    ConditionList,
    {
      conditions: having,
      onChange: (h) => update({ having: h }),
      clauseLabel: "HAVING"
    }
  )));
}
function OrderByTab({ opts, update }) {
  const orderBy = opts.orderBy;
  const addOrder = () => update({ orderBy: [...orderBy, newOrderByItem()] });
  const removeOrder = (id) => update({ orderBy: orderBy.filter((o) => o.id !== id) });
  const patchOrder = (id, patch) => update({ orderBy: orderBy.map((o) => o.id === id ? { ...o, ...patch } : o) });
  const moveOrder = (index, dir) => {
    const next = [...orderBy];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    update({ orderBy: next });
  };
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Callout, null, "Sort the result set. Rules are applied top-to-bottom \u2014 the first entry is the primary sort key."), orderBy.length === 0 ? /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.EmptyState,
    {
      icon: import_lucide_react4.ArrowUpDown,
      message: "No ORDER BY \u2014 rows returned in natural table order.",
      action: /* @__PURE__ */ import_react13.default.createElement(import_ui9.Button, { type: "button", variant: "outline", size: "sm", onClick: addOrder }, /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Sort")
    }
  ) : /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "grid grid-cols-[24px_24px_1fr_130px_130px_28px] gap-2 items-center px-1" }, /* @__PURE__ */ import_react13.default.createElement("span", null), /* @__PURE__ */ import_react13.default.createElement("span", null), /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Column / Expression"), /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Direction"), /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "NULLS"), /* @__PURE__ */ import_react13.default.createElement("span", null)), orderBy.map((item, idx) => /* @__PURE__ */ import_react13.default.createElement(
    "div",
    {
      key: item.id,
      className: "grid grid-cols-[24px_24px_1fr_130px_130px_28px] gap-2 items-center rounded border border-border bg-background px-2 py-2"
    },
    /* @__PURE__ */ import_react13.default.createElement(
      "span",
      {
        className: `inline-flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold ${idx === 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`
      },
      idx + 1
    ),
    /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex flex-col gap-0.5" }, /* @__PURE__ */ import_react13.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveOrder(idx, -1),
        disabled: idx === 0,
        className: "flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.MoveUp, { className: "h-3 w-3" })
    ), /* @__PURE__ */ import_react13.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => moveOrder(idx, 1),
        disabled: idx === orderBy.length - 1,
        className: "flex items-center justify-center h-3 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.MoveDown, { className: "h-3 w-3" })
    )),
    /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Input,
      {
        placeholder: "column or expression",
        value: item.expression,
        onChange: (e) => patchOrder(item.id, { expression: e.target.value }),
        className: "h-7 text-xs font-mono"
      }
    ),
    /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Select,
      {
        value: item.direction,
        onValueChange: (val) => patchOrder(item.id, { direction: val })
      },
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectTrigger, { className: "h-7 text-xs font-mono" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectValue, null)),
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectContent, null, SORT_DIRECTIONS2.map((d) => /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectItem, { key: d.value, value: d.value, className: "text-xs font-mono" }, d.label)))
    ),
    /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.Select,
      {
        value: item.nulls,
        onValueChange: (val) => patchOrder(item.id, { nulls: val })
      },
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectTrigger, { className: "h-7 text-xs" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectValue, null)),
      /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectContent, null, NULLS_ORDER.map((n) => /* @__PURE__ */ import_react13.default.createElement(import_ui9.SelectItem, { key: n.value, value: n.value, className: "text-xs" }, n.label)))
    ),
    /* @__PURE__ */ import_react13.default.createElement(
      "button",
      {
        type: "button",
        onClick: () => removeOrder(item.id),
        className: "flex items-center justify-center h-7 w-7 rounded border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
      },
      /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Trash2, { className: "h-3.5 w-3.5" })
    )
  )), /* @__PURE__ */ import_react13.default.createElement(import_ui9.Button, { type: "button", variant: "outline", size: "sm", onClick: addOrder, className: "w-full" }, /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Plus, { className: "h-3.5 w-3.5 mr-1" }), "Add Sort")));
}
function SettingsTab2({ opts, update }) {
  const [copied, setCopied] = (0, import_react13.useState)(false);
  const sql = (0, import_react13.useMemo)(() => buildSQL(opts), [opts]);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
    }
  };
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-4" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Callout, null, "Cap and paginate the result set with ", /* @__PURE__ */ import_react13.default.createElement("strong", null, "LIMIT"), " and", " ", /* @__PURE__ */ import_react13.default.createElement("strong", null, "OFFSET"), ". The generated SQL preview updates live as you configure the query."), /* @__PURE__ */ import_react13.default.createElement("div", { className: "grid grid-cols-2 gap-3" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { htmlFor: "pg-limit" }, "Limit"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Input,
    {
      id: "pg-limit",
      type: "number",
      min: "0",
      placeholder: "no limit",
      value: opts.limit,
      onChange: (e) => update({ limit: e.target.value }),
      className: "font-mono text-xs"
    }
  ), /* @__PURE__ */ import_react13.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Maximum rows returned. Leave blank for no cap.")), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { htmlFor: "pg-offset" }, "Offset"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Input,
    {
      id: "pg-offset",
      type: "number",
      min: "0",
      placeholder: "0",
      value: opts.offset,
      onChange: (e) => update({ offset: e.target.value }),
      className: "font-mono text-xs"
    }
  ), /* @__PURE__ */ import_react13.default.createElement("p", { className: "text-xs text-muted-foreground" }, "Skip this many rows before returning results."))), /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Label, { className: "font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground block" }, "Generated SQL Preview"), /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.Button,
    {
      type: "button",
      variant: copied ? "default" : "outline",
      size: "sm",
      onClick: handleCopy,
      className: "h-7 px-2 text-xs gap-1"
    },
    copied ? /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Check, { className: "h-3 w-3" }) : /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Copy, { className: "h-3 w-3" }),
    copied ? "Copied!" : "Copy"
  )), /* @__PURE__ */ import_react13.default.createElement("div", { className: "rounded bg-muted/40 border border-border p-4 font-mono text-[11px] leading-relaxed overflow-x-auto text-foreground" }, /* @__PURE__ */ import_react13.default.createElement("pre", { className: "whitespace-pre-wrap break-words" }, sql)), /* @__PURE__ */ import_react13.default.createElement("p", { className: "text-[11px] text-muted-foreground" }, "This SQL is generated from your visual configuration and sent to the PostgreSQL datasource at query runtime.")));
}
function CodeEditorPanel({ opts, update }) {
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.Callout, null, "Write raw PostgreSQL SQL. Use", " ", /* @__PURE__ */ import_react13.default.createElement("code", { className: "bg-background px-1 rounded border border-border font-mono text-[11px]" }, "{{inputs.paramName}}"), " ", "to inject runtime query inputs."), /* @__PURE__ */ import_react13.default.createElement(
    import_ui9.CodeEditor,
    {
      value: opts.query,
      language: "pgsql",
      onChange: (val) => update({ query: val }),
      height: "280px",
      showHeader: false,
      className: "rounded border border-border"
    }
  ));
}
var PostgresQueryEditor = ({ queryEditorForm }) => {
  const raw = queryEditorForm?.dataQueryOptions || {};
  const opts = normalise2(raw);
  const [activeTab, setActiveTab] = (0, import_react13.useState)("select");
  const queryType = opts.queryType;
  const isGUI = queryType === "gui";
  const update = (0, import_react13.useCallback)(
    (updates) => {
      queryEditorForm.setQueryOptions({
        ...opts,
        ...updates
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [queryEditorForm, JSON.stringify(opts)]
  );
  const handleModeSwitch = (0, import_react13.useCallback)(
    (newMode) => {
      if (newMode === queryType) return;
      if (newMode === "query") {
        const generatedSQL = buildSQL(opts);
        update({ queryType: "query", query: generatedSQL });
      } else {
        update({ queryType: "gui" });
      }
    },
    [queryType, opts, update]
  );
  const badges = {
    select: opts.columns.filter((c) => c.expression).length,
    from: opts.joins.filter((j) => j.table).length,
    where: opts.where.filter((c) => c.column).length,
    groupBy: opts.groupBy.filter((g) => g.expression).length + opts.having.filter((c) => c.column).length,
    orderBy: opts.orderBy.filter((o) => o.expression).length,
    settings: (opts.limit !== "" && opts.limit !== null && opts.limit !== void 0 ? 1 : 0) + (opts.offset !== "" && opts.offset !== null && opts.offset !== void 0 ? 1 : 0)
  };
  return /* @__PURE__ */ import_react13.default.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ import_react13.default.createElement("div", { className: "flex items-center gap-1 rounded-md border border-border bg-muted/40 p-0.5 w-fit" }, /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleModeSwitch("query"),
      className: `inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${!isGUI ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.Code2, { className: "h-3.5 w-3.5" }),
    "Code"
  ), /* @__PURE__ */ import_react13.default.createElement(
    "button",
    {
      type: "button",
      onClick: () => handleModeSwitch("gui"),
      className: `inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${isGUI ? "bg-background text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"}`
    },
    /* @__PURE__ */ import_react13.default.createElement(import_lucide_react4.LayoutGrid, { className: "h-3.5 w-3.5" }),
    "GUI"
  )), !isGUI && /* @__PURE__ */ import_react13.default.createElement(CodeEditorPanel, { opts, update }), isGUI && /* @__PURE__ */ import_react13.default.createElement(import_ui9.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full" }, /* @__PURE__ */ import_react13.default.createElement(import_ui9.TabsList, null, TABS3.map((tab) => {
    const Icon = tab.icon;
    const badgeCount = badges[tab.id];
    return /* @__PURE__ */ import_react13.default.createElement(
      import_ui9.TabsTrigger,
      {
        key: tab.id,
        value: tab.id,
        className: "gap-1.5 px-3 py-2 text-xs"
      },
      Icon && /* @__PURE__ */ import_react13.default.createElement(Icon, { className: "h-3.5 w-3.5" }),
      tab.label,
      badgeCount > 0 && /* @__PURE__ */ import_react13.default.createElement("span", { className: "ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary/10 text-primary text-[10px] font-semibold" }, badgeCount)
    );
  })), /* @__PURE__ */ import_react13.default.createElement(import_ui9.TabsContent, { value: "select", className: "mt-2 pb-2" }, /* @__PURE__ */ import_react13.default.createElement(SelectTab, { opts, update })), /* @__PURE__ */ import_react13.default.createElement(import_ui9.TabsContent, { value: "from", className: "mt-2 pb-2" }, /* @__PURE__ */ import_react13.default.createElement(FromJoinTab, { opts, update })), /* @__PURE__ */ import_react13.default.createElement(import_ui9.TabsContent, { value: "where", className: "mt-2 pb-2" }, /* @__PURE__ */ import_react13.default.createElement(WhereTab, { opts, update })), /* @__PURE__ */ import_react13.default.createElement(import_ui9.TabsContent, { value: "groupBy", className: "mt-2 pb-2" }, /* @__PURE__ */ import_react13.default.createElement(GroupByTab, { opts, update })), /* @__PURE__ */ import_react13.default.createElement(import_ui9.TabsContent, { value: "orderBy", className: "mt-2 pb-2" }, /* @__PURE__ */ import_react13.default.createElement(OrderByTab, { opts, update })), /* @__PURE__ */ import_react13.default.createElement(import_ui9.TabsContent, { value: "settings", className: "mt-2 pb-2" }, /* @__PURE__ */ import_react13.default.createElement(SettingsTab2, { opts, update }))));
};

// src/components/common/genericDatasourceTestResultUI.js
var import_react14 = __toESM(require("react"));
var GenericDatasourceTestResultUI = ({ connectionResult }) => {
  console.log("connectionResult", connectionResult);
  let status = "untested";
  let title = "Connection not tested";
  let details = null;
  if (connectionResult === true || connectionResult?.ok === true) {
    status = "success";
    title = connectionResult?.statusText || "Connection successful";
    if (connectionResult?.details) {
      details = connectionResult.details;
    } else if (typeof connectionResult === "object" && connectionResult !== null && connectionResult !== true) {
      const keys = Object.keys(connectionResult).filter((k) => k !== "ok" && k !== "statusText");
      if (keys.length > 0) {
        details = connectionResult;
      }
    }
  } else if (connectionResult === void 0 || connectionResult === null) {
    status = "untested";
    title = "Connection not tested";
  } else {
    const isError = !connectionResult?.ok;
    status = isError ? "error" : "warning";
    if (typeof connectionResult === "string") {
      title = connectionResult;
    } else {
      title = connectionResult?.message || connectionResult?.error || (isError ? "Connection failed" : "Error testing connection");
      if (connectionResult?.details) {
        details = connectionResult.details;
      } else if (connectionResult?.stack) {
        details = connectionResult.stack;
      } else if (connectionResult?.response?.data) {
        details = connectionResult.response.data;
      } else if (typeof connectionResult === "object") {
        const filtered = { ...connectionResult };
        delete filtered.ok;
        delete filtered.message;
        delete filtered.error;
        if (Object.keys(filtered).length > 0) {
          details = filtered;
        }
      }
    }
  }
  const styles = {
    success: {
      container: "bg-primary/5 border-primary/20 text-primary",
      badge: "bg-primary/10 text-primary border border-primary/20",
      badgeText: "Success",
      icon: /* @__PURE__ */ import_react14.default.createElement("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ import_react14.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }))
    },
    error: {
      container: "bg-destructive/5 border-destructive/20 text-destructive",
      badge: "bg-destructive/10 text-destructive border border-destructive/20",
      badgeText: "Failed",
      icon: /* @__PURE__ */ import_react14.default.createElement("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ import_react14.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" }))
    },
    warning: {
      container: "bg-amber-500/5 border-amber-500/20 text-amber-500",
      badge: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      badgeText: "Warning",
      icon: /* @__PURE__ */ import_react14.default.createElement("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ import_react14.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }))
    },
    untested: {
      container: "bg-muted/30 border-border text-muted-foreground",
      badge: "bg-muted/50 text-muted-foreground border border-border/50",
      badgeText: "Untested",
      icon: /* @__PURE__ */ import_react14.default.createElement("svg", { className: "w-4 h-4 flex-shrink-0", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: "2" }, /* @__PURE__ */ import_react14.default.createElement("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" }))
    }
  };
  const currentStyle = styles[status];
  const renderDetails = () => {
    if (!details) return null;
    let text = "";
    if (typeof details === "string") {
      text = details;
    } else {
      try {
        text = JSON.stringify(details, null, 2);
      } catch (e) {
        text = String(details);
      }
    }
    return /* @__PURE__ */ import_react14.default.createElement("div", { className: `rounded bg-background w-full text-muted-foreground p-2 text-xs leading-relaxed overflow-x-auto max-h-60 border border-border/50 ${currentStyle.container} !bg-background` }, /* @__PURE__ */ import_react14.default.createElement("code", null, text));
  };
  return /* @__PURE__ */ import_react14.default.createElement("div", { className: "w-full" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: `w-full flex flex-col justify-start items-start p-2 rounded border transition-all duration-200 space-y-2 ${currentStyle.container}` }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex flex-row justify-between items-center w-full gap-2" }, /* @__PURE__ */ import_react14.default.createElement("div", { className: "flex flex-row justify-start items-center gap-2" }, currentStyle.icon, /* @__PURE__ */ import_react14.default.createElement("span", { className: "text-sm font-medium tracking-tight" }, title)), /* @__PURE__ */ import_react14.default.createElement("span", { className: `text-[10px] font-mono font-medium uppercase px-2 py-1 rounded ${currentStyle.badge}` }, currentStyle.badgeText)), renderDetails()));
};

// src/index.js
var createGenericDatasourceUI = () => ({
  queryResponseView: function({ queryResult }) {
    return import_react15.default.createElement(QueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function({ connectionResult }) {
    return import_react15.default.createElement(GenericDatasourceTestResultUI, { connectionResult });
  }
});
var createWebUrlDatasourceUI = () => ({
  queryResponseView: function({ queryResult }) {
    return import_react15.default.createElement(WebViewQueryResponseView, { queryResult });
  },
  datasourceTestResultUI: function({ connectionResult }) {
    return import_react15.default.createElement(GenericDatasourceTestResultUI, { connectionResult });
  }
});
var DATASOURCE_UI_COMPONENTS = {
  [import_datasource_types.DATASOURCE_TYPES.POSTGRESQL.value]: {
    ...createGenericDatasourceUI(),
    dedicatedQueryEditor: function({ queryEditorForm }) {
      return import_react15.default.createElement(PostgresQueryEditor, { queryEditorForm });
    }
  },
  [import_datasource_types.DATASOURCE_TYPES.RESTAPI.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.WEB_URL.value]: createWebUrlDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.FIRESTORE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.MYSQL.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.MONGODB.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.GOOGLESHEETS.value]: {
    ...createGenericDatasourceUI(),
    dedicatedDatasourceEditor: function({ datasourceEditorForm }) {
      return import_react15.default.createElement(GoogleSheetsDatasourceEditor, { datasourceEditorForm });
    },
    dedicatedQueryEditor: function({ queryEditorForm }) {
      return import_react15.default.createElement(GoogleSheetsQueryEditor, { queryEditorForm });
    }
  },
  [import_datasource_types.DATASOURCE_TYPES.GRAPHQL.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.RABBITMQ.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.KAFKA.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.REDIS.value]: createGenericDatasourceUI(),
  // Batch 1 datasources
  [import_datasource_types.DATASOURCE_TYPES.MSSQL.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SUPABASE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.BIGQUERY.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.AIRTABLE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.S3.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.ELASTICSEARCH.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.STRIPE.value]: createGenericDatasourceUI(),
  // Batch 2 datasources
  [import_datasource_types.DATASOURCE_TYPES.ORACLE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SQLITE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.COCKROACHDB.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.NEO4J.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.TWILIO.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SENDGRID.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SLACK.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.NOTION.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.JIRA.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.GOOGLEANALYTICS.value]: createGenericDatasourceUI(),
  // Listener-capable new datasources
  [import_datasource_types.DATASOURCE_TYPES.WEBHOOK.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.MQTT.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.WEBSOCKET.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SSE.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.SYSLOG.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.NATS.value]: createGenericDatasourceUI(),
  [import_datasource_types.DATASOURCE_TYPES.EXCELCSV.value]: {
    ...createGenericDatasourceUI(),
    dedicatedQueryEditor: function({ queryEditorForm }) {
      return import_react15.default.createElement(ExcelCSVQueryBuilder, { queryEditorForm });
    }
  }
};
//# sourceMappingURL=index.cjs.map
